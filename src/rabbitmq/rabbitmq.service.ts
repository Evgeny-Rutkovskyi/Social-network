import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as amqp from 'amqplib'
import { Stories } from 'src/entities/stories.entity';
import { User } from 'src/entities/user.entity';
import { UserStoriesLikes } from 'src/entities/userStoriesLikes.entity';
import { Repository } from 'typeorm';


@Injectable()
export class RabbitMQService implements OnModuleInit {
    constructor(@InjectRepository(Stories) private readonly storiesRepository: Repository<Stories>,
                @InjectRepository(User) private readonly userRepository: Repository<User>,
                @InjectRepository(UserStoriesLikes) private readonly userStoriesLikesRepository: Repository<UserStoriesLikes>,
    ) {}
    private connection: amqp.Connection 
    private channel: amqp.Channel

    async onModuleInit() {
        this.connection = await amqp.connect('amqp://rmuser:rmpass@rabbitmq');
        this.channel = await this.connection.createChannel();

        await this.channel.assertExchange('DLX', 'direct', {durable: true});
        await this.channel.assertQueue('DLQ', {durable: true});
        await this.channel.bindQueue('DLQ', 'DLX', 'dead-msg');

        await this.channel.assertQueue('Main', {
            durable: true,
            autoDelete: false,
            arguments: {
                'x-dead-letter-exchange': 'DLX',
                'x-dead-letter-routing-key': 'dead-msg',
                'x-message-ttl': 86400000 //24 hours
            }
        })

        await this.channel.consume('DLQ', (msg) => {
            if(msg){
                this.getMsg(msg);
                this.channel.ack(msg);
            }
        })
    }

    async getMsg(msg){
        try{
            msg = JSON.parse(msg.content.toString());
            const stories = await this.storiesRepository.findOne({where: {id: msg.storiesId}});
            if(stories && !stories.is_deleted){
                await this.archiveOrDeleteStories(msg.userId, stories);
            }else{
                console.log('This stories was deleted before');
            }
        } catch (err){
            console.log('something wrong with deleteStoriesByRabbit');
        }
    }

    async sendMessage(dataObj: object){
        this.channel.sendToQueue('Main', Buffer.from(JSON.stringify(dataObj)));
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
            console.log('Stories saved in archive');
        }else{
            await this.storiesRepository
                .createQueryBuilder('stories')
                .update()
                .set({time_deleted_forever: new Date()})
                .where('id = :idStories', {idStories: stories.id})
                .execute();
            console.log('Stories saved 24 hours, after will be deleted forever');
        }
    }

    
}
