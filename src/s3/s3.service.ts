import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3 } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';


@Injectable()
export class S3Service {
    private s3: S3;
    constructor(private readonly configService: ConfigService){
        this.s3 = new S3({
            region: 'eu-central-1',
            credentials: {
                accessKeyId: configService.get('aws_access_key_id'),
                secretAccessKey: configService.get('aws_secret_access_key')
            }, 
        });
    }

    async uploadFile(bucket: string, key: string, file: Buffer){
        const putObj = new PutObjectCommand({
            Bucket: bucket,
            Key: key,
            Body: file,
        });
        try {
            await this.s3.send(putObj);
        } catch (error) {
            throw new InternalServerErrorException('S3 problem');
        }

    }

    async getFile(bucket: string, key: string){
        try {
            const getObj = new GetObjectCommand({
                Bucket: bucket,
                Key: key,
            });
            const url = await getSignedUrl(this.s3, getObj, {expiresIn: 60});
            return url;
        } catch (error) {
            throw new InternalServerErrorException('Some problem with getFile');
        }
    }
    
    async deleteFile(bucket: string, key: string){
        const deleteObj = new DeleteObjectCommand({
            Bucket: bucket,
            Key: key,
        })
        try {
            await this.s3.send(deleteObj);
        } catch (error) {
            throw new InternalServerErrorException('Some wrong is deleted file');
        }
    }
}
