import { Controller, Param, Patch, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt.guard';
import { AdminGuard } from './adminGuard/admin.guard';
import { AdminService } from './admin.service';

@UseGuards(JwtAuthGuard, AdminGuard)
@Controller('admin')
export class AdminController {
    constructor (private readonly adminService: AdminService) {}

    @Patch('/ban/user/:id')
    async banUser(@Param('id') idUser: string){
        return await this.adminService.banUser(Number(idUser));
    }

    @Patch('/unblock/user/:id')
    async unblockUser(@Param('id') idUser: string){
        return await this.adminService.unblockUser(Number(idUser));
    }

    @Patch('/ban/comment/:id')
    async banComment(@Param('id') idComment: string){
        return await this.adminService.banComment(Number(idComment));
    }

    @Patch('/unblock/comment/:id')
    async unblockComment(@Param('id') idComment: string){
        return await this.adminService.unblockComment(Number(idComment));
    }

    @Patch('/ban/stories/:id')
    async banStories(@Param('id') idStories: string){
        return await this.adminService.banStories(Number(idStories));
    }

    @Patch('/unblock/stories/:id')
    async unblockStories(@Param('id') idStories: string){
        return await this.adminService.unblockStories(Number(idStories));
    }

    @Patch('/ban/profile/:id')
    async banProfile(@Param('id') idProfile: string){
        return await this.adminService.banProfile(Number(idProfile));
    }

    @Patch('/unblock/profile/:id')
    async unblockProfile(@Param('id') idProfile: string){
        return await this.adminService.unblockProfile(Number(idProfile));
    }

    @Patch('/add/newAdmin/:id')
    async addNewAdmin(@Param('id') newAdminId: string){
        return await this.adminService.addNewAdmin(Number(newAdminId));
    }

    @Patch('/take/admin/:id')
    async takeAdmin(@Param('id') oldAdmin: string){
        return await this.adminService.takeAdmin(Number(oldAdmin));
    }
}
