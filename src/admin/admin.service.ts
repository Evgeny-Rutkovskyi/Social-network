import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { CommentsProfile } from 'src/entities/commentsProfile.entity';
import { Stories } from 'src/entities/stories.entity';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { Settings } from 'src/entities/settings.entity';
import { Profile } from 'src/entities/profile.entity';
import { Token } from 'src/entities/token.entity';

@Injectable()
export class AdminService {
    constructor(
        private readonly configService: ConfigService,
        @InjectRepository(User) private readonly userRepository: Repository<User>,
        @InjectRepository(CommentsProfile) private readonly commentsProfileRepository: Repository<CommentsProfile>,
        @InjectRepository(Stories) private readonly storiesRepository: Repository<Stories>,
        @InjectRepository(Settings) private readonly settingsRepository: Repository<Settings>,
        @InjectRepository(Profile) private readonly profileRepository: Repository<Profile>,
        @InjectRepository(Token) private readonly tokenRepository: Repository<Token>,
    ) {}
    
    async onApplicationBootstrap(){ 
        const adminName = this.configService.get<string>('first_admin_name');
        const existingAdmin = await this.userRepository.findOne({where: {user_name: adminName}});
        if(existingAdmin){
            console.log('Admin is existing');
            return;
        };
        const settingsAccAdmin = {
            private_acc: Boolean(this.configService.get<boolean>('first_admin_private')),
        }
        const hashPassword = await bcrypt.hash(this.configService.get<string>('first_admin_password'), 7);
        const adminInfo = {
            user_name: adminName,
            email: this.configService.get<string>('first_admin_email'),
            password: hashPassword,
            is_Admin: true,
        }
        const first_admin = this.userRepository.create(adminInfo);
        const settingsAcc = this.settingsRepository.create(settingsAccAdmin);
        first_admin.settings = settingsAcc;
        await this.userRepository.save(first_admin);
    }

    async banUser(userId: number){
        try {
            const user = await this.userRepository.findOne({where: {id: userId}, relations: ['token']});
            await this.userRepository.update(userId, {
                ban_time: new Date(),
                is_ban: true,
            })
            if(user.token !== null) await this.tokenRepository.delete(user.token);
            await this.queryBuilder('profile', { time_ban: new Date(), status_ban: true }, 
                'profile.id IN (SELECT "userToProfile"."profileId" FROM "user_to_profile" "userToProfile" WHERE "userToProfile"."userId" = :id)', 
                userId, this.profileRepository);
            await this.queryBuilder('stories', {is_ban: true, time_ban: new Date()}, 'user = :id', userId, this.storiesRepository);
            await this.queryBuilder('comments_profile', {is_ban: true, time_ban: new Date()}, 'user = :id', userId, this.commentsProfileRepository);
            return 'User was banned';
        } catch (error) {
            console.log('Wrong banUser', error);
        }
    }

    async unblockUser(userId: number){
        try {
            await this.queryBuilder('user', {is_ban: false, ban_time: null}, 'id = :id', userId, this.userRepository);
            await this.queryBuilder('profile', { time_ban: null, status_ban: false}, 
                'profile.id IN (SELECT "userToProfile"."profileId" FROM "user_to_profile" "userToProfile" WHERE "userToProfile"."userId" = :id)', 
                userId, this.profileRepository);
            await this.queryBuilder('stories', {is_ban: false, time_ban: null}, 'user = :id', userId, this.storiesRepository);
            await this.queryBuilder('comments_profile', {is_ban: false, time_ban: null}, 'user = :id', userId, this.commentsProfileRepository);
            return 'User was unblock';
        } catch (error) {
            console.log('Wrong unblockUser', error);
        }
    }

    async banComment(commentId: number){
        try {
            await this.queryBuilder('comments_profile', {is_ban: true, time_ban: new Date()}, 'id = :id', commentId, this.commentsProfileRepository);
            return 'Comment was banned';
        } catch (error) {
            console.log('Wrong banComment', error);
        }
    }

    async unblockComment(commentId: number){
        try {
            await this.queryBuilder('comments_profile', {is_ban: false, time_ban: null}, 'id = :id', commentId, this.commentsProfileRepository);
            return 'Comment was unblock';
        } catch (error) {
            console.log('Wrong unblockComment', error);
        }
    }

    async banStories(storiesId: number){
        try {
            await this.queryBuilder('stories', {is_ban: true, time_ban: new Date()}, 'id = :id', storiesId, this.storiesRepository);
            return 'Stories was banned';
        } catch (error) {
            console.log('Wrong banStories', error);
        }
    }

    async unblockStories(storiesId: number){
        try {
            await this.queryBuilder('stories', {is_ban: false, time_ban: null}, 'id = :id', storiesId, this.storiesRepository);
            return 'Stories was unblock';
        } catch (error) {
            console.log('Wrong unblockStories', error);
        }
    }

    async banProfile(idProfile: number){
        try {
            await this.queryBuilder('profile', {is_ban: true, time_ban: new Date()}, 'id = :id', idProfile, this.profileRepository);
            return 'Profile was block';
        } catch (error) {
            console.log('Wrong blockProfile', error);
        }
    }

    async unblockProfile(idProfile: number){
        try {
            await this.queryBuilder('profile', {is_ban: false, time_ban: null}, 'id = :id', idProfile, this.profileRepository);
            return 'Profile was unblock';
        } catch (error) {
            console.log('Wrong unblockProfile', error);
        }
    }

    async addNewAdmin(newAdminId: number){
        try {
            await this.queryBuilder('user', {is_Admin: true}, 'id = :id', newAdminId, this.userRepository);
            return 'Add new Admin';
        } catch (error) {
            console.log('Wrong addNewAdmin', error);
        }
    }

    async takeAdmin(oldAdmin: number){
        try {
            await this.queryBuilder('user', {is_Admin: false}, 'id = :id', oldAdmin, this.userRepository);
            return 'Take this Admin';
        } catch (error) {
            console.log('Wrong takeAdmin', error);
        }
    }

    private async queryBuilder(tableName: string, fieldUpdate: object, condition: string, id: number, repo){
        await repo
            .createQueryBuilder(tableName)
            .update()
            .set(fieldUpdate)
            .where(condition, {id})
            .execute()
    }
}
