import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { EmailLoginDto, newEmailDto, newUserNameDto, UserNameLoginDto } from './dto/create-user.dto';
import * as bcrypt from 'bcryptjs'
import { JwtService } from '@nestjs/jwt';
import { PayloadTokenDto } from './dto/payload-token.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import { RegistrationUserDto } from './dto/registration.dto';
import { changePassword, DeleteAccountDto } from './dto/delete-update.dto';
import { Token } from './token.entity';


@Injectable()
export class AuthService {

    constructor(private readonly jwtService: JwtService,
        @InjectRepository(User) private readonly userRepository: Repository<User>,
        @InjectRepository(Token) private readonly tokenRepository: Repository<Token>,
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
                private: userDto.private
            }
            const newUser = this.userRepository.create(userInfo);
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
            const token = await this.generateToken(payload);
            const saveToken = this.tokenRepository.create({...user.token, token, user});
            user.token = saveToken;
            await this.userRepository.save(user);
            return token;
        } catch (e) {
            console.log(e);
            throw new NotFoundException('No user found');
        }
    }

    async updateEmail(userData: newEmailDto){
        const user = await this.userRepository.findOne({where: {email: userData.email}});
        if(!user) throw new NotFoundException('User is not found, email is not correct');
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
        user.user_name = userData.newUserName;
        await this.userRepository.save(user);
        return user;
    }

    async deletedAccount(userDto: DeleteAccountDto){
        const user = await this.userRepository.findOne({where: {user_name: userDto.userName}, relations: ['token']});
        if(!user) throw new NotFoundException('Username is not correct, user is not found');
        if(user.email != userDto.email) throw new BadRequestException('Email is not correct');
        const isPassword = await bcrypt.compare(userDto.password, user.password);
        if(!isPassword) throw new BadRequestException('Passwords do not match');
        await this.tokenRepository.delete(user.token.id);
        await this.userRepository.remove(user);
        return user;
    }

    private async generateToken(payload: PayloadTokenDto){
        return await this.jwtService.signAsync(payload);
    }
}
