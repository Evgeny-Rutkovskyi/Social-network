import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UploadedFile, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { ProfileUserService } from './profile-user.service';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { UserField } from '../../custom-decorator/user.decorator';
import { JwtAuthGuard } from '../../guards/jwt.guard';
import { CreateCommentDto } from '../dto/createComment.dto';
import { S3MulterConfig } from '../../utils/connectionS3.util';
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
    async getPost(@UserField('userId') userId: number, @Param('id') idPost: string,
    @Query('owner_post') owner_post: string){
        return await this.profileUserService.getPost(userId, Number(idPost), Number(owner_post));
    }

    @Delete('/delete/:id')
    async deleteProfile(@Param('id') idProfile: string){
        return await this.profileUserService.deleteProfile(Number(idProfile));
    }

    @Delete('/delete/group/post')
    async deleteGroupProfile(@Query('nameGroup') name_group: string){        
        return await this.profileUserService.deleteGroupProfile(name_group);
    }

    @Patch('/update_about/:id')
    async updateAboutProfile(@Param('id') idProfile: string, @Body() newAboutProfile: ProfileTextDto){
        return await this.profileUserService.updateAboutProfile(Number(idProfile), newAboutProfile);
    }

    @Post('restore/:id')
    async restoreProfileWithinTemporarilyEntity(@Param('id') idDeletedProfile: string){
        return await this.profileUserService.restoreProfile(Number(idDeletedProfile));
    }

    @Post('likeProfile/:id')
    async likeProfile(@UserField('userId') userId: number, @Param('id') idProfile: string){
        return await this.profileUserService.likeProfile(userId, Number(idProfile));
    }

    @Delete('deleteLikeProfile/:id')
    async deleteLikeProfile(@UserField('userId') userId: number, @Param('id') idProfile: string){
        return await this.profileUserService.deleteLikeProfile(userId, Number(idProfile));
    }

    @Post('createComment/:id')
    async createComment(@UserField('userId') userId: number, @Param('id') idProfile: string,
    @Body() commentInfo: CreateCommentDto){
        return await this.profileUserService.createComment(userId, Number(idProfile), commentInfo);
    }

    @Delete('deleteComment/:id')
    async deleteComment(@Param('id') idComment: string){
        return await this.profileUserService.deleteComment(Number(idComment));
    }

    @Post('likeComment/:id')
    async likeComment(@Param('id') idComment: string){
        return await this.profileUserService.likeComment(Number(idComment));
    }

    @Delete('deleteLikeComment/:id')
    async deleteLikeComment(@Param('id') idComment: string){
        return await this.profileUserService.deleteLikeComment(Number(idComment));
    }
}
