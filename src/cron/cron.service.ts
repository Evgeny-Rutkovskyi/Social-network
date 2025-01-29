import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { CommentsProfile } from 'src/entities/commentsProfile.entity';
import { FollowsAndBlock } from 'src/entities/followsAndBlock.entity';
import { Profile } from 'src/entities/profile.entity';
import { Settings } from 'src/entities/settings.entity';
import { Stories } from 'src/entities/stories.entity';
import { User } from 'src/entities/user.entity';
import { S3Service } from 'src/upload-s3/s3.service';
import { Repository } from 'typeorm';

@Injectable()
export class CronService {
    constructor(
            @InjectRepository(User) private readonly userRepository: Repository<User>,
            @InjectRepository(CommentsProfile) private readonly commentsProfileRepository: Repository<CommentsProfile>,
            @InjectRepository(Stories) private readonly storiesRepository: Repository<Stories>,
            @InjectRepository(Profile) private readonly profileRepository: Repository<Profile>,
            @InjectRepository(Settings) private readonly settingsRepository: Repository<Settings>,
            @InjectRepository(FollowsAndBlock) private readonly followsRepository: Repository<FollowsAndBlock>,
            private readonly s3Service: S3Service,
        ) {}

    @Cron('0 0 0 * * * ')
    async deletedAllCron(){
        await this.DeletedStoriesForever();
        await this.DeleteProfileForever();
        await this.DeleteCommentForever();
        await this.DeleteUserForever();
        await this.DeleteNotAcceptedFollow();
    }


    private async DeletedStoriesForever(){
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const thirtyDayAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const overdueStories = await this.storiesRepository
            .createQueryBuilder('stories')
            .select(['stories.id', 'stories.path_key'])
            .where('time_deleted_forever < :oneDayAgo OR time_ban < :thirtyDayAgo', 
                {oneDayAgo, thirtyDayAgo})
            .getMany();
        await this.deleteFromBucket(overdueStories, this.storiesRepository);
        console.log('Stories was deleted forever');
    }

    private async DeleteProfileForever(){
        const thirtyDayAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const overduePost = await this.profileRepository
            .createQueryBuilder('profile')
            .select()
            .where('deleted_at < :thirtyDayAgo OR time_ban < :thirtyDayAgo', {thirtyDayAgo})
            .getMany();
        await this.deleteFromBucket(overduePost, this.profileRepository);
        console.log('END CRON');
    }

    private async DeleteCommentForever(){
        const thirtyDayAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        await this.commentsProfileRepository
            .createQueryBuilder('comments_profile')
            .delete()
            .where('time_ban < :thirtyDayAgo', {thirtyDayAgo})
            .execute()
        console.log('Comment was delete forever');
    }

    private async DeleteUserForever(){
        const thirtyDayAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const deleteUserAcc = await this.userRepository
            .createQueryBuilder('user')
            .leftJoinAndSelect('user.settings', 'settings')
            .where('user.ban_time < :thirtyDayAgo', { thirtyDayAgo })
            .getMany(); 
        for (const user of deleteUserAcc) {
            if (user.settings) {
                await this.settingsRepository.remove(user.settings);
            }
            await this.userRepository.delete(user.id);
        }
        console.log('DeleteUsersForever');
    }

    private async DeleteNotAcceptedFollow(){
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        await this.followsRepository
            .createQueryBuilder('follows_and_block')
            .delete()
            .where('accepted_time < :oneDayAgo', {oneDayAgo})
            .execute()
        console.log('Delete not accepted follows');
    }

    private async deleteFromBucket(overdueFiles: Array<Stories | Profile>, repository){
        for(let content of overdueFiles){
            await this.s3Service.deleteFile(content.path_key);
            await repository.delete(content.id);
        }
    }
}
