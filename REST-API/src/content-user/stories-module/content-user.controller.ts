import { Body, Controller, Delete, Get, Param, Post, Query, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { ContentUserService } from './content-user.service';
import { JwtAuthGuard } from '../../guards/jwt.guard';
import { UserField } from '../../custom-decorator/user.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { S3MulterConfig } from '../../utils/connectionS3.util';
import { PublicStoriesDto } from '../dto/publicStories.dto';


@UseGuards(JwtAuthGuard)
@Controller('content-user')
export class ContentUserController {
    constructor(private readonly contentUserService : ContentUserService) {}
    
    @Post('/stories')
    @UseInterceptors(FileInterceptor('file', S3MulterConfig))
    async createStories(@UserField('userId') userId: number, @UploadedFile() file: Express.Multer.File,
    @Query('friend') only_friend: string){
        return await this.contentUserService.createStories(userId, file, only_friend);
    }

    @Delete('/delete/stories/:id')
    async deleteStoriesById(@UserField('userId') userId: number, @Param('id') idStories : string){
        return await this.contentUserService.deleteStoriesById(userId, Number(idStories));
    }

    @Delete('/delete/storiesInArchive/:id')
    async deleteArchiveStories(@Param('id') idStories: string){
        return await this.contentUserService.deleteArchiveStories(Number(idStories));
    }

    @Delete('/delete/allStoriesInArchive')
    async deleteAllArchiveStories(@UserField('userId') idUser: number){
        return await this.contentUserService.deleteAllArchiveStories(idUser);
    }

    @Post('/recreate/stories/:id')
    async recreateStories(@UserField('userId') userId: number, @Param('id') idStories: string,
        @Body() publicStories: PublicStoriesDto){
        return await this.contentUserService.recreateStories(userId, Number(idStories), publicStories);
    }
    
    @Get('/stories/:id')
    async getStoriesById(@UserField('userId') userId: number, @Param('id') idStories: string,
    @Query('owner_stories') idOwnerStories: string){
        return await this.contentUserService.getStoriesById(userId, Number(idStories), Number(idOwnerStories));
    }

    @Post('/like/stories/:id')
    async likeStoriesById(@UserField('userId') userId: number, @Param('id') idStories: string){
        return await this.contentUserService.likeStoriesById(userId, Number(idStories));
    }

    @Post('/remove/like/:id')
    async removeLikeOfStories(@UserField('userId') userId: number, @Param('id') idStories: string){
        return await this.contentUserService.removeLikeOfStories(userId, Number(idStories));
    }
}
