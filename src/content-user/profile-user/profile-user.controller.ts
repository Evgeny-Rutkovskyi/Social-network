import { Body, Controller, Delete, Param, Patch, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { ProfileUserService } from './profile-user.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { UserField } from 'src/custom-decorator/user.decorator';
import { ProfileDto } from '../dto/createProfile.dto';
import { JwtAuthGuard } from 'src/guards/jwt.guard';
import { CreateCommentDto } from '../dto/createComment.dto';

@UseGuards(JwtAuthGuard)
@Controller('profile-user')
export class ProfileUserController {
    constructor(private readonly profileUserService: ProfileUserService){}

    @UseInterceptors(FileInterceptor('content'))
    @Post('/create')
    async createProfile(@UploadedFile() content: Express.Multer.File, 
    @UserField('userId') userId: number, @Body() about_profile: ProfileDto){
        return await this.profileUserService.createProfile(content, userId, about_profile);
    }

    @Delete('/delete/:id')
    async deleteProfile(@Param('id') idProfile: number){
        return await this.profileUserService.deleteProfile(idProfile);
    }

    @Patch('/update_about/:id')
    async updateAboutProfile(@Param('id') idProfile: number, @Body() newAboutProfile: ProfileDto){
        return await this.profileUserService.updateAboutProfile(idProfile, newAboutProfile);
    }

    @Post('restore/:id')
    async restoreProfileWithinTemporarilyEntity(@Param('id') idDeletedProfile: number){
        return await this.profileUserService.restoreProfile(idDeletedProfile);
    }

    @Post('likeProfile/:id')
    async likeProfile(@UserField('userId') userId: number, @Param('id') idProfile: number){
        return await this.profileUserService.likeProfile(userId, idProfile);
    }

    @Delete('deleteLikeProfile/:id')
    async deleteLikeProfile(@UserField('userId') userId: number, @Param('id') idProfile: number){
        return await this.profileUserService.deleteLikeProfile(userId, idProfile);
    }

    @Post('createComment/:id')
    async createComment(@UserField('userId') userId: number, @Param('id') idProfile: number,
    @Body() commentInfo: CreateCommentDto){
        return await this.profileUserService.createComment(userId, idProfile, commentInfo);
    }

    @Delete('deleteComment/:id')
    async deleteComment(@Param('id') idComment: number){
        return await this.profileUserService.deleteComment(idComment);
    }

    @Post('likeComment/:id')
    async likeComment(@Param('id') idComment: number){
        return await this.profileUserService.likeComment(idComment);
    }

    @Delete('deleteLikeComment/:id')
    async deleteLikeComment(@Param('id') idComment: number){
        return await this.profileUserService.deleteLikeComment(idComment);
    }
}
