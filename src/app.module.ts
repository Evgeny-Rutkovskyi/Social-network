import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { ContentUserModule } from './content-user/stories-module/content-user.module';
import { RoleModule } from './role/role.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import config from './configuration/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { S3Service } from './s3/s3.service';
import { S3Module } from './s3/s3.module';
import { Token } from './entities/token.entity';
import { User } from './entities/user.entity';
import { Stories } from './entities/stories.entity';
import { ScheduleModule } from '@nestjs/schedule';
import { RabbitMQModule } from './rabbitmq/rabbitmq.module';
import { Settings } from './entities/settings.entity';
import { UserStoriesLikes } from './entities/userStoriesLikes.entity';
import { ProfileLikes } from './entities/profileLikes.entity';
import { Profile } from './entities/profile.entity';
import { CommentsProfile } from './entities/commentsProfile.entity';
import { ProfileUserModule } from './content-user/profile-user/profile-user.module';
import { UserToProfile } from './entities/userToProfile.entity';
import { StoriesView } from './entities/storiesView.entity';
import { AdminModule } from './admin/admin.module';
import { CronModule } from './cron/cron.module';
import { FollowsAndBlock } from './entities/followsAndBlock.entity';

@Module({
  imports: [UserModule, AuthModule, ContentUserModule, RoleModule, 
    ProfileUserModule, RabbitMQModule, ConfigModule.forRoot({
    load: [config],
    isGlobal: true
  }), TypeOrmModule.forRootAsync({
    inject: [ConfigService],
    useFactory: async (configService: ConfigService) => ({
      type: 'postgres',
      host: configService.get('host_db'),
      port: configService.get('port_db'),
      username: configService.get('username_db'),
      password: configService.get('password_db'),
      database: configService.get('name_db'),
      entities: [Token, User, Stories, Settings, UserStoriesLikes,
        ProfileLikes, Profile, CommentsProfile, UserToProfile, StoriesView, FollowsAndBlock],
      synchronize: true, // only dev
  }),
  }), S3Module, ScheduleModule.forRoot(), AdminModule, CronModule],
  controllers: [],
  providers: [S3Service],
})
export class AppModule {}
