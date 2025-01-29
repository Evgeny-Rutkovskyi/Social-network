import { Module } from '@nestjs/common';
import { RabbitMQService } from './rabbitmq.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Stories } from 'src/entities/stories.entity';
import { User } from 'src/entities/user.entity';
import { UserStoriesLikes } from 'src/entities/userStoriesLikes.entity';
import { S3Module } from 'src/upload-s3/s3.module';
import { Profile } from 'src/entities/profile.entity';


@Module({
  imports: [TypeOrmModule.forFeature([Stories, User, UserStoriesLikes, Profile]), S3Module],
  providers: [RabbitMQService],
  exports: [RabbitMQService]
})
export class RabbitMQModule {}
