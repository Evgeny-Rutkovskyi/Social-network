import { Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { UserField } from '../custom-decorator/user.decorator';
import { JwtAuthGuard } from '../guards/jwt.guard';

@UseGuards(JwtAuthGuard)
@Controller('user')
export class UserController {
    constructor (private readonly userService: UserService) {}

    @Post('/follow/:id')
    async toFollow(@UserField('userId') who_follow_id: number, @Param('id') user_follow: string){
        return await this.userService.toFollow(who_follow_id, Number(user_follow));
    }

    @Patch('/accept/follow/:id')
    async acceptFollow(@UserField('userId') who_accepted: number, @Param('id') who_was_accepted: string){
        return await this.userService.acceptFollow(who_accepted, Number(who_was_accepted));
    }

    @Delete('/cancel/follow/:id')
    async cancelFollow(@UserField('userId') who_follow_id: number, @Param('id') user_follow: string){
        return await this.userService.cancelFollow(who_follow_id, Number(user_follow));
    }

    @Delete('/delete/follower/:id')
    async deleteFollower(@UserField('userId') user_follow: number, @Param('id') who_follow_id: string){
        return await this.userService.deleteFollower(user_follow, Number(who_follow_id));
    }

    @Patch('/add/best/:friend')
    async addBestFriend(@UserField('userId') who_adds_id: number, @Param('friend') who_was_added_id: string){
        return await this.userService.addBestFriend(who_adds_id, Number(who_was_added_id));
    }

    @Patch('/delete/best/:friend')
    async deleteWithBestFriend(@UserField('userId') who_deletes: number, @Param('friend') who_was_removed: string){
        return await this.userService.deleteWithBestFriend(who_deletes, Number(who_was_removed));
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
    async blockUser(@UserField('userId') who_blocks: number, @Param('user') who_was_blocked: string){
        return await this.userService.blockUser(who_blocks, Number(who_was_blocked));
    }

    @Post('/unblock/:user')
    async unblockUser(@UserField('userId') who_unblocks: number, @Param('user') who_was_unblocks: string){
        return await this.userService.unblockUser(who_unblocks, Number(who_was_unblocks));
    }

    @Get('/get/block/user')
    async getBlockUser(@UserField('userId') userId: number){
        return this.userService.getBlockUser(userId);
    }
}
