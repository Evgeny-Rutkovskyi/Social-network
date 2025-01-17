import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Stories } from 'src/entities/stories.entity';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';
import { SettingsStoriesDto } from '../dto/settingsStories.dto';
import { RabbitMQService } from 'src/rabbitmq/rabbitmq.service';
import { UserStoriesLikes } from 'src/entities/userStoriesLikes.entity';
import { Cron } from '@nestjs/schedule';
import { StoriesView } from 'src/entities/storiesView.entity';


@Injectable()
export class ContentUserService {
    constructor(@InjectRepository(User) private readonly userRepository: Repository<User>,
                @InjectRepository(Stories) private readonly storiesRepository: Repository<Stories>,
                @InjectRepository(UserStoriesLikes) private readonly userStoriesLikesRepository: Repository<UserStoriesLikes>,
                @InjectRepository(StoriesView) private readonly storiesViewRepository: Repository<StoriesView>,
                private readonly rabbitService: RabbitMQService){}

    async createStories(userId: number, content: Express.Multer.File, settingsStories: SettingsStoriesDto){
        try {
            const user = await this.userRepository.findOne({where: {id: userId}});
            //Here will be download files in s3
            const newStories = this.storiesRepository.create({only_friend: settingsStories.only_friend, user: user});
            await this.storiesRepository.save(newStories);
            const msg = {
                userId: user.id,
                storiesId: newStories.id
            };
            await this.rabbitService.sendMessage(msg);
            return {
                ...msg,
                //storiesPath: path for file in s3
            };
        } catch (err) {
            console.log('Something happen with createStories', err);
        }

    }

    async deleteStoriesById(idUser: number, idStories: number){
        try {
            const stories = await this.storiesRepository.findOne({where: {id: idStories}});
            if(!stories) throw new NotFoundException('Not found stories');
            await this.rabbitService.archiveOrDeleteStories(idUser, stories);
            return 'Stories was deleted';
        } catch (err){
            console.log('Something wrong with deleteStoriesById');
        }
    }

    async deleteArchiveStories(idStories: number){
        try {
            await this.storiesRepository
                .createQueryBuilder('stories')
                .delete()
                .where('id = :idStories', {idStories})
                .execute()
            return 'Archive stories was deleted';
        } catch (error) {
            console.log('Something wrong with delete Archive Stories');
        }
    }

    async deleteAllArchiveStories(userId: number){
        try {
            await this.storiesRepository
                .createQueryBuilder('stories')
                .relation('user')
                .of(userId)
                .delete()
                .where('is_deleted = :isDeleted', {isDeleted: true})
                .execute()
            return 'All archive stories was deleted'
        } catch (error) {
            console.log('Something wrong with delete ALL Archive Stories', error);
        }
    }

    async recreateStories(idUser:number, idStories: number, settingStories: SettingsStoriesDto){
        try {
            await this.storiesRepository
                .createQueryBuilder('stories')
                .update()
                .set({is_deleted: false, only_friend: settingStories.only_friend})
                .where('id = :idStories', {idStories})
                .execute();
            const msg = {
                userId: idUser,
                storiesId: idStories
            };
            await this.rabbitService.sendMessage(msg);  
        } catch (error) {
            console.log('Something wrong with recreateStories', error);
        }
    }


    async getStoriesById(userId: number, idStories: number){
        try {
            const stories = await this.storiesRepository.findOne({where: {id: idStories}, relations: ['view_user']});
            if(!stories) throw new NotFoundException('Stories not found');
            const user = await this.userRepository.findOne({where: {id: userId}});
            await this.storiesViewRepository
                .createQueryBuilder('storiesview')
                .insert()
                .into(StoriesView)
                .values({user, stories})
                .orIgnore()
                .execute();
            return stories;
        } catch (error) {
            console.log('Something wrong with getStoriesById', error);
        }
        
    }

    async likeStoriesById(userId: number, idStories: number){
        try{
            const stories = await this.storiesRepository.findOne({where: {id: idStories}});
            if(!stories) throw new NotFoundException('Stories was deleted');
            const isLikeStories = await this.userStoriesLikesRepository.findOne(
                {where: {
                    user: {id: userId},
                    stories: {id: idStories}
                }});
            if(!isLikeStories){
                stories.likes_qty += 1;
                await this.storiesRepository.save(stories);
                const user = await this.userRepository.findOne({where: {id: userId}});
                const newLike = this.userStoriesLikesRepository.create({user, stories});
                await this.userStoriesLikesRepository.save(newLike);
                return 'Stories liked';
            }
            return 'This stories has liked for this user';
        }catch (err) {
            console.log('Something wrong with likeStoriesById', err);
        }
    }

    async removeLikeOfStories(userId: number, idStories: number){
        try{
            const stories = await this.storiesRepository.findOne({where: {id: idStories}});
            if(!stories) throw new NotFoundException('Stories was deleted');
            const like = await this.userStoriesLikesRepository.findOne({where: {
                user: {id: userId},
                stories: {id: idStories}
            }});
            if(like){
                stories.likes_qty -= 1;
                await this.storiesRepository.save(stories);
                const user = await this.userRepository.findOne({where: {id: userId}});
                await this.userStoriesLikesRepository.delete({user, stories});
                return 'Like is hide';
            }
            return 'This user did not like';
        }catch (err) {
            console.log('Something wrong with likeStoriesById');
        }
    }
}
