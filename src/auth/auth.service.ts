import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { EmailLoginDto, newEmailDto, newUserNameDto, UserNameLoginDto } from './dto/create-user.dto';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { PayloadTokenDto } from './dto/payload-token.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Repository } from 'typeorm';
import { RegistrationUserDto } from './dto/registration.dto';
import { changePassword } from './dto/delete-update.dto';
import { Token } from '../entities/token.entity';
import { Settings } from 'src/entities/settings.entity';
import { ChangeSettingsDto } from './dto/change-settings.dto';
import { Profile } from 'src/entities/profile.entity';
import { use } from 'passport';


@Injectable()
export class AuthService {

    constructor(private readonly jwtService: JwtService,
        @InjectRepository(User) private readonly userRepository: Repository<User>,
        @InjectRepository(Token) private readonly tokenRepository: Repository<Token>,
        @InjectRepository(Settings) private readonly settingsRepository: Repository<Settings>,
        @InjectRepository(Profile) private readonly profileRepository: Repository<Profile>,
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
                password: hashPassword
            }
            const newUser = this.userRepository.create(userInfo);
            const settingsAcc = this.settingsRepository.create();
            settingsAcc.private_acc = (userDto.private_acc !== undefined) ? userDto.private_acc : settingsAcc.private_acc;
            settingsAcc.language_app = (userDto.language_app) ? userDto.language_app : settingsAcc.language_app;
            settingsAcc.save_stories = (userDto.save_stories !== undefined) ? userDto.save_stories : settingsAcc.save_stories;
            settingsAcc.about_user = (userDto.about_user) ? userDto.about_user : settingsAcc.about_user;
            newUser.settings = settingsAcc;
            await this.userRepository.save(newUser);
            return userInfo;
        } catch (e) {
            console.log(e);
            throw new ConflictException('The user has already been created');
        }
    }

    async loginWithEmail(userDto: EmailLoginDto){
        try {
            const user = await this.userRepository.findOne({where: {email: userDto.email}, relations: ['token']});
            const token = await this.login(user, userDto);
            return token;
        } catch (error) {
            console.log('Wrong loginWithEmail', error);
        }
    }

    async loginWithUserName(userDto: UserNameLoginDto){
        try {
            const user = await this.userRepository.findOne({where: {user_name: userDto.userName}, relations: ['token']});
            const token = await this.login(user, userDto);
            return token;
        } catch (error) {
            console.log('Wrong loginWithUserName', error);
        }
    }

    async login(user: User, userDto: EmailLoginDto | UserNameLoginDto){
        try {
            if(!user || user.is_ban){
                throw new BadRequestException((user.is_ban) ? 'User is block' : 'Not found user');
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
        try {
            const user = await this.userRepository.findOne({where: {id: userId}, relations: ['settings']});
            const updateSettings = {
                language_app: (settingChange.language_app) ? settingChange.language_app : user.settings.language_app,
                private_acc: (settingChange.private_acc !== undefined) ? settingChange.private_acc : user.settings.private_acc,
                save_stories: (settingChange.save_stories !== undefined) ? settingChange.save_stories : user.settings.save_stories,
                about_user: (settingChange.about_user) ? settingChange.about_user : user.settings.about_user,
    
            }
            user.settings.language_app = updateSettings.language_app;
            user.settings.private_acc = updateSettings.private_acc;
            user.settings.save_stories = updateSettings.save_stories;
            user.settings.about_user = updateSettings.about_user;
            await this.userRepository.save(user);
            return settingChange;
        } catch (error) {
            console.log(error);
        }
    }

    async updateEmail(userData: newEmailDto){
        try {
            const user = await this.userRepository.findOne({where: {email: userData.email}});
            if(!user) throw new NotFoundException('User is not found, email is not correct');
            const isPassword = await bcrypt.compare(userData.password, user.password);
            if(!isPassword) throw new BadRequestException('Password is not match');
            user.email = userData.newEmail;
            await this.userRepository.save(user);
            return user;
        } catch (error) {
            console.log(error);
        }
    }

    async updatePassword(userData: changePassword){
        try {
            const user = await this.userRepository.findOne({where: {email: userData.email}});
            if(!user) throw new NotFoundException('User is not found, email is not correct');
            const isPassword = await bcrypt.compare(userData.password, user.password);
            if(!isPassword) throw new BadRequestException('Passwords is not match');
            const hashPassword = await bcrypt.hash(userData.newPassword, 7);
            user.password = hashPassword;
            await this.userRepository.save(user);
            return user;
        } catch (error) {
            console.log(error);
        }
    }

    async nameChange(userData: newUserNameDto){
        try {
            const user = await this.userRepository.findOne({where: {user_name: userData.userName}});
            if(!user) throw new NotFoundException('User is not found');
            const isPassword = await bcrypt.compare(userData.password, user.password);
            if(!isPassword) throw new BadRequestException('Password is not match');
            user.user_name = userData.newUserName;
            await this.userRepository.save(user);
            return user;
        } catch (error) {
            console.log(error);
        }
    }

    async deletedAccount(userId: number){
        try {
            const user = await this.userRepository.findOne({where: {id: userId}, 
                relations: ['token', 'settings', 'profiles', 'profiles.profile', 'profiles.profile.users']});
            console.log(user);
            if(!user) throw new NotFoundException('Not found user');
            await this.deleteProfileForUser(user);
            if(user.token){
                await this.tokenRepository.delete(user.token);
            }
            if(user.settings){
                await this.settingsRepository.delete(user.settings);
            }
            await this.userRepository.delete(userId);
            return user;
        } catch (error) {
            console.log(error);
        }
    }

    private async deleteProfileForUser(user: User){
        try {
            for(let profile of user.profiles){
                if(profile.profile.users.length > 1) continue;
                if(profile.profile.id){
                    await this.profileRepository.delete(profile.profile.id);
                }
            }
        } catch (error) {
            console.log(error);
        }
    }

    private async generateToken(payload: PayloadTokenDto){
        return await this.jwtService.signAsync(payload);
    }
}
