import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { Stories } from 'src/entities/stories.entity';
import { CommentsProfile } from 'src/entities/commentsProfile.entity';
import { Settings } from 'src/entities/settings.entity';
import { Profile } from 'src/entities/profile.entity';
import { Token } from 'src/entities/token.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Stories, CommentsProfile,
    Settings, Profile, Token])],
  providers: [AdminService],
  controllers: [AdminController]
})
export class AdminModule {}
