import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UploadedFile, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { ProfileUserService } from './profile-user.service';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { UserField } from 'src/custom-decorator/user.decorator';
import { JwtAuthGuard } from 'src/guards/jwt.guard';
import { CreateCommentDto } from '../dto/createComment.dto';
import { S3MulterConfig } from 'src/utils/connectionS3.util';
import { CreateProfileDto, ProfileTextDto } from '../dto/createProfile.dto';


@UseGuards(JwtAuthGuard)
@Controller('profile-user')
export class ProfileUserController {
    constructor(private readonly profileUserService: ProfileUserService){}


    @Post('/create')
    @UseInterceptors(FileInterceptor('file', S3MulterConfig))
    async createProfile(@UploadedFile() file: Express.Multer.File, 
    @UserField('userId') userId: number, @Body() about_profile: CreateProfileDto){
        return await this.profileUserService.create(file, userId, about_profile);
    }

    @Post('/create/many')
    @UseInterceptors(FilesInterceptor('file', 10, S3MulterConfig))
    async createManyProfile(@UploadedFiles() files: Array<Express.Multer.File>,
    @UserField('userId') userId: number, @Body() about_profile: CreateProfileDto){
        return await this.profileUserService.createGroup(files, userId, about_profile);
    }

    @Get('/get/:id')
    async getPost(@UserField('userId') userId: number, @Param('id') idPost: number,
    @Query('owner_post') owner_post: number){
        return await this.profileUserService.getPost(userId, idPost, owner_post);
    }

    @Delete('/delete/:id')
    async deleteProfile(@Param('id') idProfile: number){
        return await this.profileUserService.deleteProfile(idProfile);
    }

    @Delete('/delete/group/post')
    async deleteGroupProfile(@Query('nameGroup') name_group: string){        
        return await this.profileUserService.deleteGroupProfile(name_group);
    }

    @Patch('/update_about/:id')
    async updateAboutProfile(@Param('id') idProfile: number, @Body() newAboutProfile: ProfileTextDto){
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
