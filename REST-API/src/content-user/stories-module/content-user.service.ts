import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Stories } from 'src/entities/stories.entity';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';
import { RabbitMQService } from 'src/rabbitmq/rabbitmq.service';
import { UserStoriesLikes } from 'src/entities/userStoriesLikes.entity';
import { StoriesView } from 'src/entities/storiesView.entity';
import { PublicStoriesDto } from '../dto/publicStories.dto';
import { FileMsgDto } from 'src/rabbitmq/dto/msg.dto';
import { FollowsAndBlock } from 'src/entities/followsAndBlock.entity';
import { S3Service } from 'src/upload-s3/s3.service';


@Injectable()
export class ContentUserService {
    constructor(@InjectRepository(User) private readonly userRepository: Repository<User>,
                @InjectRepository(Stories) private readonly storiesRepository: Repository<Stories>,
                @InjectRepository(UserStoriesLikes) private readonly userStoriesLikesRepository: Repository<UserStoriesLikes>,
                @InjectRepository(StoriesView) private readonly storiesViewRepository: Repository<StoriesView>,
                @InjectRepository(FollowsAndBlock) private readonly followsAndBlockRepository: Repository<FollowsAndBlock>,
                private readonly s3Service: S3Service,
                private readonly rabbitService: RabbitMQService){}

    async createStories(userId: number, file, only_friend: string){
        try {
            if(!file) throw new BadRequestException("Upload didn't happened");
            const user = await this.userRepository.findOne({where: {id: userId}});
            if(!user) throw new BadRequestException('Not found user');
            const newStories = this.storiesRepository.create({
                only_friend: (only_friend === 'true') ? true : false,
                user,
                path_key: file.key,
            });
            await this.storiesRepository.save(newStories);
            const msg: FileMsgDto = {
                userId,
                fileId: newStories.id,
                type: 'stories',
                subspecies: 'size',
            };
            await this.rabbitService.sendMessageValidFiles(msg);
            return {...msg};
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
            const stories = await this.storiesRepository.findOne({where: {id: idStories}});
            if(!stories) throw new BadRequestException('Not found stories');
            await this.s3Service.deleteFile(stories.path_key);
            await this.storiesRepository.delete(idStories);
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

    async recreateStories(idUser:number, idStories: number, publicStories: PublicStoriesDto){
        try {
            await this.storiesRepository
                .createQueryBuilder('stories')
                .update()
                .set({is_deleted: false, only_friend: publicStories.public})
                .where('id = :idStories', {idStories})
                .execute();
            const msg = {
                userId: idUser,
                storiesId: idStories
            };
            await this.rabbitService.sendMessageStory(msg);  
        } catch (error) {
            console.log('Something wrong with recreateStories', error);
        }
    }


    async getStoriesById(userId: number, idStories: number, idOwnerStories: number){
        try {
            const stories = (userId == idOwnerStories)
                ? await this.storiesRepository.findOne({where: {id: idStories}, relations: ['view_user']})
                : await this.storiesRepository.findOne({where: {id: idStories}});
            if(!stories || stories.is_ban || stories.is_deleted) throw new NotFoundException('Stories not found');
            if(userId != idOwnerStories){
                const ownerStories = await this.userRepository.findOne({where: {id: idOwnerStories}, relations: ['settings']});
                if(ownerStories.settings.private_acc){
                    const isAccess = await this.followsAndBlockRepository.findOne({where: {
                        who_follows: {id: userId},
                        user_follows: {id: idOwnerStories}
                    }})
                    if(!isAccess || isAccess.is_block || !isAccess.accepted) throw new BadRequestException("Don't have access");
                }
                if(stories.only_friend){
                    const isBestFriend = await this.followsAndBlockRepository.findOne({where: {
                        who_follows: {id: idOwnerStories},
                        user_follows: {id: userId}
                    }})
                    if(!isBestFriend || !isBestFriend.best_friend) throw new BadRequestException("Don't have access");
                }
                const user = await this.userRepository.findOne({where: {id: userId}});
                await this.storiesViewRepository
                    .createQueryBuilder('stories_view')
                    .insert()
                    .into(StoriesView)
                    .values({user, stories})
                    .orIgnore()
                    .execute();
            }
            const presignedUrl = await this.s3Service.generatePresignedUrl(stories.path_key);
            return {stories, presignedUrl};
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
