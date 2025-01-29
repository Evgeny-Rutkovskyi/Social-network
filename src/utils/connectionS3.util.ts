import { S3Client } from "@aws-sdk/client-s3";
import * as multerS3 from 'multer-s3'
import { fileFilter } from "src/utils/file-filters.util";
import * as dotenv from 'dotenv';
dotenv.config();

export const clientS3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

export const S3MulterConfig = {
    storage: multerS3({
        s3: clientS3,
        bucket: process.env.AWS_BUCKET_NAME,
        metadata: (req, file, cb) => {
            cb(null, {
              'x-mimetype-file': file.mimetype, 
              'x-file-name': file.originalname
            });
        },
        key: (req, file: Express.Multer.File, cb: Function) => {
            const userId = req.user.userId;
            const fileName = `temp/${userId}/${file.originalname}`;
            cb(null, fileName);
        },
        
    }),
    fileFilter: fileFilter,
}