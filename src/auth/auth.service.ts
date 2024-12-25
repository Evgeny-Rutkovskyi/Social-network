import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { EmailLoginDto, newEmailDto, newUserNameDto, UserNameLoginDto } from './dto/create-user.dto';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { PayloadTokenDto } from './dto/payload-token.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Repository } from 'typeorm';
import { RegistrationUserDto } from './dto/registration.dto';
import { changePassword, DeleteAccountDto } from './dto/delete-update.dto';
import { Token } from '../entities/token.entity';
import { Settings } from 'src/entities/settings.entity';
import { ChangeSettingsDto } from './dto/change-settings.dto';


@Injectable()
export class AuthService {

    constructor(private readonly jwtService: JwtService,
        @InjectRepository(User) private readonly userRepository: Repository<User>,
        @InjectRepository(Token) private readonly tokenRepository: Repository<Token>,
        @InjectRepository(Settings) private readonly settingsRepository: Repository<Settings>
    ) {}

    async registration(userDto: RegistrationUserDto){
        try {
            const user = await this.userRepository.findOne({ where: {user_name: userDto.userName}});
            if(user) throw new ConflictException('This name is used');
            const emailUser = await this.userRepository.findOne({where: {email: userDto.email}});
            if(emailUser) throw new ConflictException('This email is used');
            const hashPassword = await bcrypt.hash(userDto.password, 7);
            const userInfo = {
                user_name: userDto.userName,
                email: userDto.email,
                password: hashPassword,
                private: userDto.private,
            }
            const newUser = this.userRepository.create(userInfo);
            const defaultSettingsAccount = this.settingsRepository.create();
            newUser.settings = defaultSettingsAccount;
            await this.userRepository.save(newUser);
            return userInfo;
        } catch (e) {
            console.log(e);
            throw new ConflictException('The user has already been created');
        }
    }

    async login(userDto: EmailLoginDto | UserNameLoginDto){
        try {
            let user: User;
            if(userDto.email){
                user = await this.userRepository.findOne({where: {email: userDto.email}, relations: ['token']});
            }else if(userDto.userName){
                user = await this.userRepository.findOne({where: {user_name: userDto.userName}, relations: ['token']});
            }
            if(!user){
                throw new NotFoundException(`Not found user, maybe
                ${(userDto.email) ? userDto.email : userDto.userName} is not correct`);
            }
            const isPassword = await bcrypt.compare(userDto.password, user.password);
            if(!isPassword) throw new BadRequestException('Password is not correct');
            const payload = {userId: user.id, email: user.email, userName: user.user_name};
            const newToken = await this.generateToken(payload);
            if(user.token){
                user.token.token = newToken;
            }else{
                const firstToken = this.tokenRepository.create({token: newToken});
                user.token = firstToken;
            }
            await this.userRepository.save(user);
            return newToken;
        } catch (e) {
            console.log(e);
            throw new NotFoundException('No user found');
        }
    }

    async changeSettingsAccount(userId: number, settingChange: ChangeSettingsDto){
        const user = await this.userRepository.findOne({where: {id: userId}, relations: ['settings']});
        const updateSettings = {
            language_app: (settingChange.language_app) ? settingChange.language_app : user.settings.language_app,
            private_acc: (settingChange.private_acc) ? settingChange.private_acc : user.settings.private_acc,
            save_stories: (settingChange.save_stories) ? settingChange.save_stories : user.settings.save_stories,
            about_user: (settingChange.about_user) ? settingChange.about_user : user.settings.about_user,

        }
        user.settings.language_app = updateSettings.language_app;
        user.settings.private_acc = updateSettings.private_acc;
        user.settings.save_stories = updateSettings.save_stories;
        user.settings.about_user = updateSettings.about_user;
        await this.userRepository.save(user);
        return settingChange;
    }

    async updateEmail(userData: newEmailDto){
        const user = await this.userRepository.findOne({where: {email: userData.email}});
        if(!user) throw new NotFoundException('User is not found, email is not correct');
        const isPassword = await bcrypt.compare(userData.password, user.password);
        if(!isPassword) throw new BadRequestException('Password is not match');
        user.email = userData.newEmail;
        await this.userRepository.save(user);
        return user;
    }

    async updatePassword(userData: changePassword){
        const user = await this.userRepository.findOne({where: {email: userData.email}});
        if(!user) throw new NotFoundException('User is not found, email is not correct');
        const isPassword = await bcrypt.compare(userData.password, user.password);
        if(!isPassword) throw new BadRequestException('Passwords is not match');
        const hashPassword = await bcrypt.hash(userData.newPassword, 7);
        user.password = hashPassword;
        await this.userRepository.save(user);
        return user;
    }

    async nameChange(userData: newUserNameDto){
        const user = await this.userRepository.findOne({where: {user_name: userData.userName}});
        if(!user) throw new NotFoundException('User is not found');
        const isPassword = await bcrypt.compare(userData.password, user.password);
        if(!isPassword) throw new BadRequestException('Password is not match');
        user.user_name = userData.newUserName;
        await this.userRepository.save(user);
        return user;
    }

    async deletedAccount(userDto: DeleteAccountDto){
        const user = await this.userRepository.findOne({where: {user_name: userDto.userName}, relations: ['token', 'settings']});
        if(!user) throw new NotFoundException('Username is not correct, user is not found');
        if(user.email != userDto.email) throw new BadRequestException('Email is not correct');
        const isPassword = await bcrypt.compare(userDto.password, user.password);
        if(!isPassword) throw new BadRequestException('Passwords do not match');
        await this.tokenRepository.delete(user.token);
        await this.settingsRepository.delete(user.settings);
        await this.userRepository.delete(user);
        return user;
    }

    private async generateToken(payload: PayloadTokenDto){
        return await this.jwtService.signAsync(payload);
    }
}
