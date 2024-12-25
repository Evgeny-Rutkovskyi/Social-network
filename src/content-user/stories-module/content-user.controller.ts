import { Body, Controller, Delete, Get, Param, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { ContentUserService } from './content-user.service';
import { JwtAuthGuard } from 'src/auth/jwt.guard';
import { UserField } from 'src/custom-decorator/user.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { SettingsStoriesDto } from '../dto/settingsStories.dto';

@UseGuards(JwtAuthGuard)
@Controller('content-user')
export class ContentUserController {
    constructor(private readonly contentUserService : ContentUserService) {}

    @UseInterceptors(FileInterceptor('content'))
    @Post('/stories')
    async createStories(@UserField('userId') userId: number, @UploadedFile() content: Express.Multer.File,
                        @Body() settingStories: SettingsStoriesDto){
        return await this.contentUserService.createStories(userId, content, settingStories);
    }

    
    @Delete('/delete/stories/:id')
    async deleteStoriesById(@UserField('userId') userId: number, @Param('id') idStories : number){
        return await this.contentUserService.deleteStoriesById(userId, idStories);
    }

    
    @Get('/all/stories/:id')
    async getAllStoriesByUserId(@Param('id') idUser: number){
        return await this.contentUserService.getAllStoriesByUserId(idUser);
    }

    
    @Post('/like/stories/:id')
    async likeStoriesById(@UserField('userId') userId: number, @Param('id') idStories: number){
        return await this.contentUserService.likeStoriesById(userId, idStories);
    }

    @Post('/remove/like/:id')
    async removeLikeOfStories(@UserField('userId') userId: number, @Param('id') idStories: number){
        return await this.contentUserService.removeLikeOfStories(userId, idStories);
    }
}
