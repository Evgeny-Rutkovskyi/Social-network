import { Body, Controller, Delete, Param, Patch, Post, Res, UseGuards, UseInterceptors, UsePipes, ValidationPipe } from '@nestjs/common';
import { AuthService } from './auth.service';
import { EmailLoginDto, newEmailDto, newUserNameDto, UserNameLoginDto } from './dto/create-user.dto';
import { Response } from 'express';
import { RegistrationUserDto } from './dto/registration.dto';
import { DtoUserInterceptor } from './interceptors/dto.interceptor';
import { changePassword } from './dto/delete-update.dto';
import { JwtAuthGuard } from '../guards/jwt.guard';
import { validateExceptionFactory } from './validate-exception';
import { UserField } from 'src/custom-decorator/user.decorator';
import { ChangeSettingsDto } from './dto/change-settings.dto';

@UsePipes(new ValidationPipe({exceptionFactory: validateExceptionFactory}))
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @UseInterceptors(DtoUserInterceptor)
    @Post('/registration')
    async registration(@Body() userData: RegistrationUserDto){
        return await this.authService.registration(userData);
    }

    @Post('/user/setting/:id')
    async createOrChangeSettings(@Param('id') userId: number, @Body() customSettings: ChangeSettingsDto){
        return await this.authService.createOrChangeSettings(userId, customSettings);
    }

    @Post('/login/email')
    async loginWithEmail(@Body() userData: EmailLoginDto, 
    @Res({passthrough: true}) res: Response){
        const token = await this.authService.loginWithEmail(userData);
        res.cookie('jwt', token, {httpOnly: true, secure: true});
        return token;
    }

    @Post('/login/name')
    async loginWithUserName(@Body() userData: UserNameLoginDto, 
    @Res({passthrough: true}) res: Response){
        const token = await this.authService.loginWithUserName(userData);
        res.cookie('jwt', token, {httpOnly: true, secure: true});
        return token;
    }

    @UseGuards(JwtAuthGuard)
    @UseInterceptors(DtoUserInterceptor)
    @Patch('/update/email')
    async updateEmail(@Body() userData: newEmailDto){
        return await this.authService.updateEmail(userData);
    }

    @UseGuards(JwtAuthGuard)
    @UseInterceptors(DtoUserInterceptor)
    @Patch('/update/password')
    async updatePassword(@Body() userData: changePassword){
        return await this.authService.updatePassword(userData);
    }
    
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(DtoUserInterceptor)
    @Patch('/update/name')
    async nameChange(@Body() userData: newUserNameDto){
        return await this.authService.nameChange(userData);
    }

    @UseGuards(JwtAuthGuard)
    @UseInterceptors(DtoUserInterceptor)
    @Delete('/delete')
    async deleteAccount(@UserField('userId') userId: number, @Res({passthrough: true}) res: Response){
        const isDeleted = await this.authService.deletedAccount(userId);
        res.clearCookie('jwt');
        return isDeleted;
    }
}
  