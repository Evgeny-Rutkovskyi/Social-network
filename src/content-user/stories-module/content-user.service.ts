import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Stories } from 'src/entities/stories.entity';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';
import { SettingsStoriesDto } from '../dto/settingsStories.dto';
import { RabbitMQService } from 'src/rabbitmq/rabbitmq.service';
import { UserStoriesLikes } from 'src/entities/userStoriesLikes.entity';


@Injectable()
export class ContentUserService {
    constructor(@InjectRepository(User) private readonly userRepository: Repository<User>,
                @InjectRepository(Stories) private readonly storiesRepository: Repository<Stories>,
                @InjectRepository(UserStoriesLikes) private readonly userStoriesLikesRepository: Repository<UserStoriesLikes>,
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
            await this.rabbitService.transitionStoriesInArchive(idUser, stories);
            const deleteStories = await this.storiesRepository.delete(stories);
            return deleteStories;
        } catch (err){
            console.log('Something wrong with deleteStoriesById');
        }
    }

    async getAllStoriesByUserId(idUser: number){
        const user = await this.userRepository.findOne({where: {id: idUser}, relations: ['stories']});
        if(!user) throw new NotFoundException('Not found user');
        return user.stories;
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
