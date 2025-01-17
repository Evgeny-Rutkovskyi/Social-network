import { Injectable, NotFoundException } from '@nestjs/common';
import { ProfileDto } from '../dto/createProfile.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';
import { Profile } from 'src/entities/profile.entity';
import { UserToProfile } from 'src/entities/userToProfile.entity';
import { ProfileLikes } from 'src/entities/profileLikes.entity';
import { CreateCommentDto } from '../dto/createComment.dto';
import { CommentsProfile } from 'src/entities/commentsProfile.entity';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class ProfileUserService {
    constructor(@InjectRepository(User) private readonly userRepository: Repository<User>,
                @InjectRepository(Profile) private readonly profileRepository: Repository<Profile>,
                @InjectRepository(UserToProfile) private readonly userToProfileRepository: Repository<UserToProfile>,
                @InjectRepository(ProfileLikes) private readonly profileLikesRepository: Repository<ProfileLikes>,
                @InjectRepository(CommentsProfile) private readonly commentsProfileRepository: Repository<CommentsProfile>,
            ) {}

    async createProfile(content: Express.Multer.File, userId: number, about_profile: ProfileDto){
        try {
            const userCreateProfile = await this.userRepository.findOne({where: {id: userId}});
            if(!userCreateProfile) throw new NotFoundException('Not found user');
            const newProfile = this.profileRepository.create({path: 'something later', ...about_profile});
            await this.profileRepository.save(newProfile);
            const userProfile = this.userToProfileRepository.create({user: userCreateProfile, profile: newProfile});
            await this.userToProfileRepository.save(userProfile);
            if(about_profile.joinProfile){
                for(let id of about_profile.involvedHumanId){
                    const curUser = await this.userRepository.findOne({where: {id}});
                    if(!curUser) continue;
                    const addUser = this.userToProfileRepository.create({user: curUser, profile: newProfile});
                    await this.userToProfileRepository.save(addUser);
                }
            }
            return newProfile;
        } catch (error) {
            console.log(error, 'Problem in createProfile');
        }
    }

    async deleteProfile(idProfile: number){
        try {
            const profile = await this.profileRepository.findOne({where: {id: idProfile}});
            if(!profile) throw new NotFoundException('Not found profile');
            profile.is_deleted = true;
            profile.deletedAt = new Date();
            await this.profileRepository.save(profile);
            await this.commentsProfileRepository
                .createQueryBuilder('commentsprofile')
                .relation('profile')
                .of(idProfile)
                .update()
                .set({deleted_with_profile: true})
                .execute()
            return profile;
        } catch (e) {
            console.log(e, 'Something wrong with deleteProfile');
        }
    }

    async updateAboutProfile(idProfile: number, aboutProfile: ProfileDto){
        try {
            const profile = await this.profileRepository.findOne({where: {id: idProfile}});
            if(!profile) throw new NotFoundException('Not found profile');
            profile.about_profile = aboutProfile.aboutProfile;
            await this.profileRepository.save(profile);
            return profile;
        } catch (error) {
            console.log(error, 'something wrong with updateAboutProfile');
        }
    }

    async restoreProfile(idDeletedProfile: number){
        try {
            const profile = await this.profileRepository.findOne({where: {id: idDeletedProfile}});
            if(!profile) throw new NotFoundException('Not found profile');
            profile.is_deleted = false;
            profile.deletedAt = null;
            await this.profileRepository.save(profile);
            await this.commentsProfileRepository
                .createQueryBuilder('comments_profile')
                .relation('profile')
                .of(idDeletedProfile)
                .update()
                .set({deleted_with_profile: false})
                .execute()
            return profile;
        } catch (error) {
            console.log('Something wrong with restoreProfile...');
        }
    }

    async likeProfile(userId: number, idProfile: number){
        try {
            const user = await this.userRepository.findOne({where: {id: userId}});
            if(!user) throw new NotFoundException('Not found user');
            const profile = await this.profileRepository.findOne({where: {id: idProfile}});
            if(!profile) throw new NotFoundException('Not found profile');
            const newLike = this.profileLikesRepository.create({user, profile});
            await this.profileLikesRepository.save(newLike);
            profile.qty_likes = profile.qty_likes + 1;
            await this.profileRepository.save(profile);
            return newLike;
        } catch (error) {
            console.log('Something wrong with likeProfile', error);
        }
    }

    async deleteLikeProfile(userId: number, idProfile: number){
        try {
            const user = await this.userRepository.findOne({where: {id: userId}});
            if(!user) throw new NotFoundException('Not found user');
            const profile = await this.profileRepository.findOne({where: {id: idProfile}});
            if(!profile) throw new NotFoundException('Not found profile');
            await this.profileLikesRepository.delete({user, profile});
            if(profile.qty_likes > 0){
                profile.qty_likes = profile.qty_likes - 1;
                await this.profileRepository.save(profile);
            }
            return 'Delete was success';
        } catch (error) {
            console.log('Something wrong with deleteLikeProfile', error);
        }
    }

    async createComment(userId: number, idProfile: number, commentInfo: CreateCommentDto){
        try {
            const user = await this.userRepository.findOne({where: {id: userId}});
            if(!user) throw new NotFoundException('Not found user');
            const profile = await this.profileRepository.findOne({where: {id: idProfile}});
            if(!profile) throw new NotFoundException('Not found profile');
            const newComment = this.commentsProfileRepository.create({user, profile, 
                parentId: commentInfo.enclosedComment || null, comment: commentInfo.message
            });
            await this.commentsProfileRepository.save(newComment);
            return newComment;
        } catch (error) {
            console.log('Something wrong with createComment', error);
        }
    }

    async deleteComment(idComment: number){
        try {
            await this.commentsProfileRepository.delete(idComment);
            return 'Comment was delete';
        } catch (error) {
            console.log('Something wrong with deleteComment', error);
        }
    }

    async likeComment(idComment: number){
        try {
            const comment = await this.commentsProfileRepository.findOne({where: {id: idComment}});
            comment.likes_qty = comment.likes_qty + 1;
            await this.commentsProfileRepository.save(comment);
            return comment;
        } catch (error) {
            console.log('Something wrong with likeComment');
        }
    }

    async deleteLikeComment(idComment: number){
        try {
            const comment = await this.commentsProfileRepository.findOne({where: {id: idComment}});
            if(comment.likes_qty == 0) return "Comment doesn't have likes";
            comment.likes_qty = comment.likes_qty - 1;
            await this.commentsProfileRepository.save(comment);
            return comment;
        } catch (error) {
            console.log('Something wrong with likeComment');
        }
    }
}
