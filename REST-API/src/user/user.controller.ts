import { Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { UserField } from 'src/custom-decorator/user.decorator';
import { JwtAuthGuard } from 'src/guards/jwt.guard';

@UseGuards(JwtAuthGuard)
@Controller('user')
export class UserController {
    constructor (private readonly userService: UserService) {}

    
    @Post('/follow/:id')
    async toFollow(@UserField('userId') who_follow_id: number, @Param('id') user_follow: number){
        return await this.userService.toFollow(who_follow_id, user_follow);
    }

    @Patch('/accept/follow/:id')
    async acceptFollow(@UserField('userId') who_accepted: number, @Param('id') who_was_accepted: number){
        return await this.userService.acceptFollow(who_accepted, who_was_accepted);
    }

    @Delete('/cancel/follow/:id')
    async cancelFollow(@UserField('userId') who_follow_id: number, @Param('id') user_follow: number){
        return await this.userService.cancelFollow(who_follow_id, user_follow);
    }

    @Delete('/delete/follower/:id')
    async deleteFollower(@UserField('userId') user_follow: number, @Param('id') who_follow_id: number){
        return await this.userService.deleteFollower(user_follow, who_follow_id);
    }

    @Patch('/add/best/:friend')
    async addBestFriend(@UserField('userId') who_adds_id: number, @Param('friend') who_was_added_id: number){
        return await this.userService.addBestFriend(who_adds_id, who_was_added_id);
    }

    @Patch('/delete/best/:friend')
    async deleteWithBestFriend(@UserField('userId') who_deletes: number, @Param('friend') who_was_removed: number){
        return await this.userService.deleteWithBestFriend(who_deletes, who_was_removed);
    }

    @Get('/get/all/following')
    async getAllFollowing(@UserField('userId') idUser: number){
        return await this.userService.getAllFollowing(idUser);
    }

    @Get('/get/best/friend')
    async getAllBestFriends(@UserField('userId') userId: number){
        return await this.userService.getAllBestFriends(userId);
    }

    @Get('/get/all/followers')
    async getAllFollowers(@UserField('userId') userId: number){
        return await this.userService.getAllFollowers(userId);
    }

    @Post('/block/:user')
    async blockUser(@UserField('userId') who_blocks: number, @Param('user') who_was_blocked: number){
        return await this.userService.blockUser(who_blocks, who_was_blocked);
    }

    @Post('/unblock/:user')
    async unblockUser(@UserField('userId') who_unblocks: number, @Param('user') who_was_unblocks:number){
        return await this.userService.unblockUser(who_unblocks, who_was_unblocks);
    }

    @Get('/get/block/user')
    async getBlockUser(@UserField('userId') userId: number){
        return this.userService.getBlockUser(userId);
    }
}
