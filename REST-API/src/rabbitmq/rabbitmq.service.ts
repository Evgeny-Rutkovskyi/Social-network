import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as amqp from 'amqplib'
import { Stories } from '../entities/stories.entity';
import { User } from '../entities/user.entity';
import { UserStoriesLikes } from '../entities/userStoriesLikes.entity';
import { S3Service } from '../upload-s3/s3.service';
import { checkPhotoSize } from '../utils/sharp.util';
import { Repository } from 'typeorm';
import { FileMsgDto, StoriesMsgDto } from './dto/msg.dto';
import { checkVideoFile, longStories } from '../utils/FFmpeg.util';
import { Profile } from '../entities/profile.entity';
import { logger } from '../logger.config';

@Injectable()
export class RabbitMQService implements OnModuleInit {
    constructor(@InjectRepository(Stories) private readonly storiesRepository: Repository<Stories>,
                @InjectRepository(User) private readonly userRepository: Repository<User>,
                @InjectRepository(UserStoriesLikes) private readonly userStoriesLikesRepository: Repository<UserStoriesLikes>,
                @InjectRepository(Profile) private readonly profileRepository: Repository<Profile>,
                private readonly s3Service: S3Service,
    ) {}
    private connection: amqp.Connection 
    private channelStory: amqp.Channel
    private channelFiles: amqp.Channel

    async onModuleInit() {
        this.connection = await amqp.connect('amqp://rmuser:rmpass@rabbitmq');
        this.channelStory = await this.connection.createChannel();
        this.channelFiles = await this.connection.createChannel();

        await this.channelStory.assertExchange('DLX', 'direct', {durable: true});
        await this.channelStory.assertQueue('DLQ', {durable: true});
        await this.channelStory.bindQueue('DLQ', 'DLX', 'dead-msg');

        await this.channelStory.assertQueue('Main', {
            durable: true,
            autoDelete: false,
            arguments: {
                'x-dead-letter-exchange': 'DLX',
                'x-dead-letter-routing-key': 'dead-msg',
                'x-message-ttl': 86400000 //24 hours
            }
        })

        
        await this.channelStory.consume('DLQ', async (msg) => {
            if(msg){
                await this.getMsg(msg);
                this.channelStory.ack(msg);
            }
        })
        
        await this.channelFiles.assertQueue('Files', {durable: true});

        await this.channelFiles.prefetch(5);
        await this.channelFiles.consume('Files', async (msg) => {
            if(msg){
                await this.validFile(msg);
                this.channelFiles.ack(msg);
            }
        })
    }

    async getMsg(msgQueue){
        try{
            const msg: StoriesMsgDto = JSON.parse(msgQueue.content.toString());
            const stories = await this.storiesRepository.findOne({where: {id: msg.storiesId}});
            if (stories && !stories.is_deleted) {
                logger.info('Archive or delete stories', {msg, stories});
                await this.archiveOrDeleteStories(msg.userId, stories);
            }else{
                logger.info('This stories was deleted before', {stories});
            }
        } catch (error){
            logger.error('Error', error);
        }
    }

    async sendMessageStory(dataObj: object) {
        logger.info('Send message story', {info: dataObj});
        this.channelStory.sendToQueue('Main', Buffer.from(JSON.stringify(dataObj)));
    }

    async sendMessageValidFiles(dataObj: object) {
        logger.info('Send message valid file', {info: dataObj});
        this.channelFiles.sendToQueue('Files', Buffer.from(JSON.stringify(dataObj)));
    }

    async archiveOrDeleteStories(idUser: number, stories: Stories){
        const user = await this.userRepository.findOne({where: {id: idUser}, relations: ['settings']});
        if(user.settings.save_stories){
            stories.is_deleted = true;
            await this.storiesRepository.save(stories);
            await this.userStoriesLikesRepository
                .createQueryBuilder('userstorieslikes')
                .relation('stories')
                .of(stories)
                .delete()
                .execute()
            logger.info('Stories saved in archive', {stories});
        }else{
            await this.storiesRepository
                .createQueryBuilder('stories')
                .update()
                .set({time_deleted_forever: new Date(), is_deleted: true})
                .where('id = :idStories', {idStories: stories.id})
                .execute();
            logger.info('Stories saved 24 hours, after will be deleted forever', {stories});
        }
    }

    async validFile(msgQueue){
        const msg: FileMsgDto = JSON.parse(msgQueue.content.toString()); 
        logger.info('Valid file', { msg });
        const user = await this.userRepository.findOne({where: {id: msg.userId}});
        const fileRepository: any = (msg.type === 'stories') ? this.storiesRepository : this.profileRepository;
        const file = await fileRepository.findOne({where: {id: msg.fileId}})
        if(!file){
            logger.error('Not found file');
            return;
        }
        const tempFileKey = file.path_key;
        const objS3 = await this.s3Service.getFile(file.path_key);
        const bufferFile = await this.s3Service.getBufferFile(objS3.Body);
        const mimetype = objS3.Metadata['x-mimetype-file'];
        const originalNameFile = objS3.Metadata['x-file-name'];
        let resultResizeFile;
        if (['image/jpeg', 'image/png', 'image/gif'].includes(mimetype)) {
            logger.info('checkPhotoSize', {tempFileKey});
            resultResizeFile = await checkPhotoSize(bufferFile, msg.type, msg.subspecies);
        } else if (['video/mp4', 'video/quicktime'].includes(mimetype)) {
            logger.info('checkVideoFile', {tempFileKey});
            const res = await checkVideoFile(bufferFile, msg.type, msg.subspecies);
            const duration: number = res[1];
            resultResizeFile = res[0];
            if(resultResizeFile !== false && msg.type === 'stories' && duration > 15){
                const bufferStory = (typeof resultResizeFile === 'boolean') ? bufferFile : resultResizeFile;
                const fewVideo = await longStories(bufferStory, 15);
                let curPart = 1;
                for(let buffer of fewVideo){
                    const pathCurPart = `users/${msg.userId}/${curPart}${originalNameFile}`;
                    const newPart = this.storiesRepository.create({
                        only_friend: file.only_friend,
                        user,
                        path_key: pathCurPart,
                    });
                    await this.s3Service.uploadFilesToBucket(buffer, pathCurPart);
                    await this.storiesRepository.save(newPart);
                    await this.sendMessageStory({userId: msg.userId, storiesId: msg.fileId});
                    curPart++;
                }
                resultResizeFile = false;
            }
        }
        if(resultResizeFile === false) await fileRepository.delete(file.id);
        const newPath = `users/${msg.userId}/${originalNameFile}`;
        if(resultResizeFile === true || typeof resultResizeFile !== 'boolean'){
            const upload = (resultResizeFile === true) ? bufferFile : resultResizeFile;
            await this.s3Service.uploadFilesToBucket(upload, newPath);
            file.path_key = newPath;
            await fileRepository.save(file);
        }
        await this.s3Service.deleteFile(tempFileKey);
        if(msg.type === 'stories' && resultResizeFile !== false){
            await this.sendMessageStory({userId: msg.userId, storiesId: msg.fileId});
        }
    }
}
