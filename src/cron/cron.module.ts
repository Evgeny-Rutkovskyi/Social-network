import { Module } from '@nestjs/common';
import { CronService } from './cron.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { Stories } from 'src/entities/stories.entity';
import { Profile } from 'src/entities/profile.entity';
import { CommentsProfile } from 'src/entities/commentsProfile.entity';
import { Settings } from 'src/entities/settings.entity';
import { FollowsAndBlock } from 'src/entities/followsAndBlock.entity';
import { S3Module } from 'src/upload-s3/s3.module';

@Module({
  imports: [S3Module, TypeOrmModule.forFeature([User, Stories, Profile, CommentsProfile, Settings, FollowsAndBlock]),],
  providers: [CronService]
})
export class CronModule {}
