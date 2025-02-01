import { Controller, Param, Patch, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/guards/jwt.guard';
import { AdminGuard } from './adminGuard/admin.guard';
import { AdminService } from './admin.service';

@UseGuards(JwtAuthGuard, AdminGuard)
@Controller('admin')
export class AdminController {
    constructor (private readonly adminService: AdminService) {}

    @Patch('/ban/user/:id')
    async banUser(@Param('id') idUser: number){
        return await this.adminService.banUser(idUser);
    }

    @Patch('/unblock/user/:id')
    async unblockUser(@Param('id') idUser: number){
        return await this.adminService.unblockUser(idUser);
    }

    @Patch('/ban/comment/:id')
    async banComment(@Param('id') idComment: number){
        return await this.adminService.banComment(idComment);
    }

    @Patch('/unblock/comment/:id')
    async unblockComment(@Param('id') idComment: number){
        return await this.adminService.unblockComment(idComment);
    }

    @Patch('/ban/stories/:id')
    async banStories(@Param('id') idStories: number){
        return await this.adminService.banStories(idStories);
    }

    @Patch('/unblock/stories/:id')
    async unblockStories(@Param('id') idStories: number){
        return await this.adminService.unblockStories(idStories);
    }

    @Patch('/ban/profile/:id')
    async banProfile(@Param('id') idProfile: number){
        return await this.adminService.banProfile(idProfile);
    }

    @Patch('/unblock/profile/:id')
    async unblockProfile(@Param('id') idProfile: number){
        return await this.adminService.unblockProfile(idProfile);
    }

    @Patch('/add/newAdmin/:id')
    async addNewAdmin(@Param('id') newAdminId: number){
        return await this.adminService.addNewAdmin(newAdminId);
    }

    @Patch('/take/admin/:id')
    async takeAdmin(@Param('id') oldAdmin: number){
        return await this.adminService.takeAdmin(oldAdmin);
    }
}
