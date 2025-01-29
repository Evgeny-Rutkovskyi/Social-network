import { Module } from '@nestjs/common';
import { ProfileUserService } from './profile-user.service';
import { ProfileUserController } from './profile-user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { Profile } from 'src/entities/profile.entity';
import { UserToProfile } from 'src/entities/userToProfile.entity';
import { ProfileLikes } from 'src/entities/profileLikes.entity';
import { CommentsProfile } from 'src/entities/commentsProfile.entity';
import { RabbitMQModule } from 'src/rabbitmq/rabbitmq.module';
import { FollowsAndBlock } from 'src/entities/followsAndBlock.entity';
import { S3Module } from 'src/upload-s3/s3.module';

@Module({
  imports: [RabbitMQModule, S3Module, TypeOrmModule.forFeature([User, Profile, UserToProfile, 
    ProfileLikes, CommentsProfile, FollowsAndBlock])],
  providers: [ProfileUserService],
  controllers: [ProfileUserController]
})
export class ProfileUserModule {}
