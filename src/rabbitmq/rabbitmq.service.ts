import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as amqp from 'amqplib'
import { ArchiveStories } from 'src/entities/archive-stories.entity';
import { Stories } from 'src/entities/stories.entity';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';


@Injectable()
export class RabbitMQService implements OnModuleInit {
    constructor(@InjectRepository(Stories) private readonly storiesRepository: Repository<Stories>,
                @InjectRepository(User) private readonly userRepository: Repository<User>,
                @InjectRepository(ArchiveStories) private readonly archiveStoriesRepository: Repository<ArchiveStories>) {}
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
            if(stories){
                await this.transitionStoriesInArchive(msg.userId, stories);
                await this.storiesRepository.delete(msg.storiesId);
                console.log(stories, 'is deleted');
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

    async transitionStoriesInArchive(idUser: number, stories: Stories){
        const user = await this.userRepository.findOne({where: {id: idUser}, relations: ['settings']});
        if(user.settings.save_stories){
            const archiveStories = this.archiveStoriesRepository.create({path: 'temp value', user});
            await this.archiveStoriesRepository.save(archiveStories);
            console.log('Stories saved in archive');
        }
    }

    
}
