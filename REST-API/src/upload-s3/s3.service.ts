import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { clientS3 } from '../utils/connectionS3.util';
import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { logger } from '../logger.config';

@Injectable()
export class S3Service {
    private bucketName: string;
    private clientForUrl;
    constructor(private readonly configService: ConfigService){
        this.bucketName = this.configService.get('aws_bucket_name');
        this.clientForUrl = new S3Client({region: this.configService.get('aws_region')});
    }

    async generatePresignedUrl(key: string, expiresIn: number = 3600){
        const command = new GetObjectCommand({
            Bucket: this.bucketName,
            Key: key,
        })
        const url = await getSignedUrl(this.clientForUrl, command, { expiresIn });
        logger.info('Generate presigned url', { url });
        return url;
    }

    async getFile(key: string){
        const res = await clientS3.send(new GetObjectCommand({Bucket: this.bucketName, Key: key}));
        return res;
    }
    

    async uploadFilesToBucket(buffer, key: string){
        try {
            await clientS3.send(
                new PutObjectCommand({
                Bucket: this.bucketName,
                Body: buffer,
                Key: key,
                }),
            );
            logger.info('Upload files to bucket', { key });
        } catch (error) {
            logger.error('Error', { error });
        }
    }
    

    async deleteFile(key: string){
        try {
            await clientS3.send(
                new DeleteObjectCommand({
                    Bucket: this.bucketName,
                    Key: key,
                })
            );
            logger.error('Delete file with s3', { key });
        } catch (error) {
            logger.error('Error', { error });
        }
    }


    async getBufferFile(body){
        const buffer = await this.streamToBuffer(body);
        return buffer;
    }


    async streamToBuffer(stream) {
        return new Promise((resolve, reject) => {
            const chunks = [];
            stream.on("data", (chunk) => chunks.push(chunk));
            stream.on("end", () => resolve(Buffer.concat(chunks)));
            stream.on("error", reject);
        });
    }
}
