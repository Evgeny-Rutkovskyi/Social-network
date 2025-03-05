import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../../entities/user.entity';
import { Repository } from 'typeorm';
import { Profile } from '../../entities/profile.entity';
import { UserToProfile } from '../../entities/userToProfile.entity';
import { ProfileLikes } from '../../entities/profileLikes.entity';
import { CreateCommentDto } from '../dto/createComment.dto';
import { CommentsProfile } from '../../entities/commentsProfile.entity';
import { FileMsgDto } from '../../rabbitmq/dto/msg.dto';
import { RabbitMQService } from '../../rabbitmq/rabbitmq.service';
import { CreateProfileDto, ProfileTextDto } from '../dto/createProfile.dto';
import { FollowsAndBlock } from '../../entities/followsAndBlock.entity';
import { S3Service } from '../../upload-s3/s3.service';
import { logger } from '../../logger.config';

@Injectable()
export class ProfileUserService {
    constructor(@InjectRepository(User) private readonly userRepository: Repository<User>,
                @InjectRepository(Profile) private readonly profileRepository: Repository<Profile>,
                @InjectRepository(UserToProfile) private readonly userToProfileRepository: Repository<UserToProfile>,
                @InjectRepository(ProfileLikes) private readonly profileLikesRepository: Repository<ProfileLikes>,
                @InjectRepository(CommentsProfile) private readonly commentsProfileRepository: Repository<CommentsProfile>,
                @InjectRepository(FollowsAndBlock) private readonly followsAndBlockRepository: Repository<FollowsAndBlock>,
                private readonly s3Service: S3Service,
                private readonly rabbitService: RabbitMQService,
            ) {}

    async create(file, userId: number, about_profile: CreateProfileDto){
        try {
            if(!file) throw new BadRequestException("Upload didn't happened");
            const profile = await this.createProfile(file, userId, about_profile);
            logger.info('Create profile', { newProfile: profile });
            return profile;
        } catch (error) {
            logger.error('Error', { error });
        }
    }

    async createGroup(files, userId: number, about_profile: CreateProfileDto){
        try {
            if(!files) throw new BadRequestException("Upload didn't happened");
            const groupIdentity = new Date();
            const successfulCreate = [];
            for(const file of files){
                const newProfile = await this.createProfile(file, userId, about_profile, groupIdentity);
                successfulCreate.push(newProfile);
            }
            logger.info('Create many profile', { newProfile: successfulCreate });
            return successfulCreate;
        } catch (error) {
            logger.error('Error', { error });
        }
    }

    async createProfile(file, userId: number, about_profile: CreateProfileDto, groupIdentity: Date = null){
        try {
            const user = await this.userRepository.findOne({where: {id: userId}});
            if(!user) throw new BadRequestException('Not found user');
            const newProfile = this.profileRepository.create({path_key: file.key,
                about_profile: about_profile.aboutProfile,
                group_post: groupIdentity,
            });
            await this.profileRepository.save(newProfile);
            const userProfile = this.userToProfileRepository.create({user: user, profile: newProfile});
            await this.userToProfileRepository.save(userProfile);
            const msg: FileMsgDto = {
                userId: user.id,
                fileId: newProfile.id,
                type: 'post',
                subspecies: about_profile.subspecies,
            }
            await this.rabbitService.sendMessageValidFiles(msg);
            if(about_profile.joinProfile === 'true'){
                for(let id of about_profile.involvedHumanId){
                    const curUser = await this.userRepository.findOne({where: {id}});
                    if(!curUser) continue;
                    const addUser = this.userToProfileRepository.create({user: curUser, profile: newProfile});
                    await this.userToProfileRepository.save(addUser);
                }
            }
            return newProfile;
        } catch (error) {
            logger.error('Error', { error });
        }
    }

    async getPost(userId: number, idPost: number, idOwnerPost: number){
        try {
            const post = await this.profileRepository.findOne({where: {id: idPost}});
            if(!post || post.is_ban || post.is_deleted) throw new NotFoundException('Stories not found');
            if(userId != idOwnerPost){
                const ownerPost = await this.userRepository.findOne({where: {id: idOwnerPost}, relations: ['settings']});
                if(ownerPost.settings.private_acc){
                    const isAccess = await this.followsAndBlockRepository.findOne({where: {
                        who_follows: {id: userId},
                        user_follows: {id: idOwnerPost}
                    }})
                    if(!isAccess || isAccess.is_block || !isAccess.accepted) throw new BadRequestException("Don't have access");
                }
            }
            const presignedUrl = await this.s3Service.generatePresignedUrl(post.path_key);
            return {post, presignedUrl};
        } catch (error) {
            logger.error('Error', { error });
        }
    }

    async deleteProfile(idProfile: number){
        try {
            const profile = await this.profileRepository.findOne({where: {id: idProfile}});
            if(!profile) throw new NotFoundException('Not found profile');
            profile.is_deleted = true;
            profile.deleted_at = new Date();
            await this.profileRepository.save(profile);
            await this.commentsProfileRepository
                .createQueryBuilder('commentsprofile')
                .relation('profile')
                .of(idProfile)
                .update()
                .set({deleted_with_profile: true})
                .execute()
            logger.info('Deleted profile', { deletedProfile: profile });
            return profile;
        } catch (error) {
            logger.error('Error', { error });
        }
    }

    async deleteGroupProfile(groupName: string){
        try {
            const groupNameDate = new Date(groupName);
            const deleteProfiles = await this.profileRepository.find({
                where: { group_post: groupNameDate }
            });
            for(let profile of deleteProfiles){
                await this.deleteProfile(profile.id);
                logger.info('Delete group profile', { deletedProfile: profile });
            }
            return deleteProfiles;
        } catch (error) {
            logger.error('Error', { error });
        }
    }

    async updateAboutProfile(idProfile: number, aboutProfile: ProfileTextDto){
        try {
            const profile = await this.profileRepository.findOne({where: {id: idProfile}});
            if(!profile) throw new NotFoundException('Not found profile');
            profile.about_profile = aboutProfile.aboutProfile;
            await this.profileRepository.save(profile);
            logger.info('Update info profile', { update: profile });
            return profile;
        } catch (error) {
            logger.error('Error', { error });
        }
    }

    async restoreProfile(idDeletedProfile: number){
        try {
            const profile = await this.profileRepository.findOne({where: {id: idDeletedProfile}});
            if(!profile) throw new NotFoundException('Not found profile');
            profile.is_deleted = false;
            profile.deleted_at = null;
            await this.profileRepository.save(profile);
            await this.commentsProfileRepository
                .createQueryBuilder('comments_profile')
                .relation('profile')
                .of(idDeletedProfile)
                .update()
                .set({deleted_with_profile: false})
                .execute()
            logger.info('Restore profile', { restore: profile });
            return profile;
        } catch (error) {
            logger.error('Error', { error });
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
            logger.error('Error', { error });
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
            logger.error('Error', { error });
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
            logger.info('Create comment', { newComment });
            return newComment;
        } catch (error) {
            logger.error('Error', { error });
        }
    }

    async deleteComment(idComment: number){
        try {
            await this.commentsProfileRepository.delete(idComment);
            logger.info('Delete comment', { idComment });
            return 'Comment was delete';
        } catch (error) {
            logger.error('Error', { error });
        }
    }

    async likeComment(idComment: number){
        try {
            const comment = await this.commentsProfileRepository.findOne({where: {id: idComment}});
            comment.likes_qty = comment.likes_qty + 1;
            await this.commentsProfileRepository.save(comment);
            return comment;
        } catch (error) {
            logger.error('Error', { error });
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
            logger.error('Error', { error });
        }
    }
}
