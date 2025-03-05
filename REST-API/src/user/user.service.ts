import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FollowsAndBlock } from '../entities/followsAndBlock.entity';
import { User } from '../entities/user.entity';
import { Repository } from 'typeorm';
import { logger } from '../logger.config';

@Injectable()
export class UserService {
    constructor (
        @InjectRepository(User) private readonly userRepository: Repository<User>,
        @InjectRepository(FollowsAndBlock) private readonly followRepository: Repository<FollowsAndBlock>,
    ) {}

    async toFollow(who_follow_id: number, user_follow: number){
        try {
            const who_follow = await this.userRepository.findOne({where: {id: who_follow_id}});
            const follow_user = await this.userRepository.findOne({where: {id: user_follow}});
            const info_follow = {accepted: true, 
                accepted_time: null, who_follows: who_follow, user_follows: follow_user};
            const private_acc = await this.userRepository
                .createQueryBuilder('user')
                .leftJoinAndSelect('user.settings', 'settings')
                .select('settings.private_acc')
                .where('user.id = :user_follow', {user_follow})
                .execute()
            if(private_acc[0].settings_private_acc){
                info_follow.accepted = false;
                info_follow.accepted_time = new Date();
            }else{
                await this.operationWithQtyFollowingOrFollowers(who_follow_id, user_follow, 1);
            }
            const new_follow = this.followRepository.create(info_follow);
            await this.followRepository.save(new_follow);
            logger.info('To follow', { who_follow, follow_user });
            return new_follow;
        } catch (error) {
            logger.error('Error', { error });
        }
    }

    async acceptFollow(who_accepted: number, who_was_accepted: number){
        try {
            const resultUpdate = await this.followRepository
                .createQueryBuilder('follows_and_block')
                .update()
                .set({accepted: true, accepted_time: null})
                .where('who_follows = :who_was_accepted AND user_follows = :who_accepted',
                    {who_accepted, who_was_accepted}
                )
                .execute()
            if(resultUpdate.affected > 0){
                await this.operationWithQtyFollowingOrFollowers(who_was_accepted, who_accepted, 1)
            }
            logger.info('Accept follow', { who_accepted, who_was_accepted });
            return 'Followers was accepted';
        } catch (error) {
            logger.error('Error', { error });
        }
    }

    async cancelFollow(who_follow_id: number, user_follow: number){
        try {
            const resultDelete = await this.followRepository
                .createQueryBuilder('follows_and_block')
                .delete()
                .where('who_follows = :who_follow_id AND user_follows = :user_follow',
                {who_follow_id, user_follow}
                )
                .execute();
            if(resultDelete.affected > 0){
                await this.operationWithQtyFollowingOrFollowers(who_follow_id, user_follow, -1)
            }
            logger.info('Cancel follow', { who_follow_id, user_follow });
            return 'Follow was delete';
        } catch (error) {
            logger.error('Error', { error });
        }
    }

    async deleteFollower(user_follow: number, who_follow_id: number){
        try {
            const resultDelete = await this.followRepository
                .createQueryBuilder('follows_and_block')
                .delete()
                .where('who_follows = :who_follow_id AND user_follows = :user_follow',
                {who_follow_id, user_follow}
                )
                .execute();
            if(resultDelete.affected > 0){
                await this.operationWithQtyFollowingOrFollowers(who_follow_id, user_follow, -1);
            }
            logger.info('Delete follower', { user_follow, who_follow_id });
            return 'Follower was delete';
        } catch (error) {
            logger.error('Error', { error });
        }
    }

    async addBestFriend(who_adds_id: number, who_was_added_id: number){
        try {
            await this.followRepository
                .createQueryBuilder('follows_and_block')
                .update()
                .set({best_friend: true})
                .where('who_follows = :who_adds_id AND user_follows = :who_was_added_id',
                    {who_adds_id, who_was_added_id}
                )
                .execute();
            logger.info('Add best friend', { who_adds_id, who_was_added_id });
            return 'User was added in best friend';
        } catch (error) {
            logger.error('Error', { error });
        }
    }

    async deleteWithBestFriend(who_deletes_id: number, who_was_removed_id: number){
        try {
            await this.followRepository
                .createQueryBuilder('follows_and_block')
                .update()
                .set({best_friend: false})
                .where('who_follows = :who_deletes_id AND user_follows = :who_was_removed_id',
                    {who_deletes_id, who_was_removed_id}
                )
                .execute();
            logger.info('Delete with best friend', { who_deletes_id, who_was_removed_id });
            return 'User was deleted in best friend';
        } catch (error) {
            logger.error('Error', { error });
        }
    }

    async getAllFollowing(idUser: number){
        try {
            const allFollowing = await this.followRepository
                .createQueryBuilder('follows_and_block')
                .innerJoin('follows_and_block.user_follows', 'user')
                .select(['user.id', 'user.user_name', 'user.email'])
                .where('follows_and_block.who_follows = :idUser', {idUser})
                .getRawMany()
            return allFollowing;
        } catch (error) {
            logger.error('Error', { error });
        }
    }

    async getAllBestFriends(userId: number){
        try {
            const allBestFriend = await this.followRepository
                .createQueryBuilder('follows_and_block')
                .innerJoin('follows_and_block.user_follows', 'user')
                .select(['user.id', 'user.user_name', 'user.email'])
                .where('follows_and_block.who_follows = :userId AND follows_and_block.best_friend = true', {userId})
                .getRawMany()
            return allBestFriend;
        } catch (error) {
            logger.error('Error', { error });
        }
    }

    async getAllFollowers(userId: number){
        try {
            const allFollowers = await this.followRepository
                .createQueryBuilder('follows_and_block')
                .innerJoin('follows_and_block.who_follows', 'user')
                .select(['user.id', 'user.user_name', 'user.email'])
                .where('follows_and_block.user_follows = :userId', {userId})
                .getRawMany()
            return allFollowers;
        } catch (error) {
            logger.error('Error', { error });
        }
    }

    async blockUser(who_blocks: number, who_was_blocked: number){
        try {
            await this.deleteFollower(who_was_blocked, who_blocks);
            await this.deleteFollower(who_blocks, who_was_blocked);
            const who_follow = await this.userRepository.findOne({where: {id: who_blocks}});
            const follow_user = await this.userRepository.findOne({where: {id: who_was_blocked}});
            const new_block = this.followRepository.create({who_follows: who_follow, user_follows: follow_user, is_block: true});
            await this.followRepository.save(new_block);
            logger.info('Block user', { who_follow,  new_block});
            return 'User was block';
        } catch (error) {
            logger.error('Error', { error });
        }
    }

    async unblockUser(who_unblocks: number, who_was_unblocks: number){
        try {
            await this.followRepository
                .createQueryBuilder('follows_and_block')
                .delete()
                .where('who_follows = :who_unblocks AND user_follows = :who_was_unblocks AND is_block = true',
                    {who_unblocks, who_was_unblocks}
                )
                .execute();
            logger.info('Unblock user', { who_unblocks,  who_was_unblocks});
            return 'User was unblock';
        } catch (error) {
            logger.error('Error', { error });
        }
    }

    async getBlockUser(idUser: number){
        try {
            const blockUsers = await this.followRepository
                .createQueryBuilder('follows_and_block')
                .innerJoin('follows_and_block.user_follows', 'user')
                .select(['user.id', 'user.user_name', 'user.email'])
                .where('follows_and_block.who_follows = :idUser AND follows_and_block.is_block = true', {idUser})
                .getRawMany()
            return blockUsers;
        } catch (error) {
            logger.error('Error', { error });
        }
    }


    private async operationWithQtyFollowingOrFollowers(userId1: number, userId2: number, incrementOrDecrement: number){
        try {
            const user1 = await this.userRepository.findOne({where: {id: userId1}});
            user1.qty_following += incrementOrDecrement;
            await this.userRepository.save(user1);

            const user2 = await this.userRepository.findOne({where: {id: userId2}});
            user2.qty_followers += incrementOrDecrement;
            await this.userRepository.save(user2);
            logger.info('Operation with qty following or followers', { user1, user2 });
        } catch (error) {
            logger.error('Error', { error });
        }
    }
}
