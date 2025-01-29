import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Token } from '../entities/token.entity';
import { JwtStrategy } from './jwt.strategy';
import { Settings } from 'src/entities/settings.entity';
import { Profile } from 'src/entities/profile.entity';
import { Stories } from 'src/entities/stories.entity';
import { UserToProfile } from 'src/entities/userToProfile.entity';
import { S3Module } from 'src/upload-s3/s3.module';

@Module({
  imports: [JwtModule.registerAsync({
    inject: [ConfigService],
    useFactory: (configService: ConfigService) => ({
      secret: configService.get<string>('jwt_secret'),
      signOptions: {expiresIn: '30d'}
    })
  }), TypeOrmModule.forFeature([User, Token, Settings, Profile, Stories, UserToProfile]), S3Module],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService]
})
export class AuthModule {}
