import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../entities/user.entity';
import { Stories } from '../../entities/stories.entity';
import { ContentUserController } from './content-user.controller';
import { ContentUserService } from './content-user.service';
import { RabbitMQModule } from '../../rabbitmq/rabbitmq.module';
import { UserStoriesLikes } from 'src/entities/userStoriesLikes.entity';
import { StoriesView } from 'src/entities/storiesView.entity';
import { S3Module } from 'src/upload-s3/s3.module';
import { FollowsAndBlock } from 'src/entities/followsAndBlock.entity';

@Module({
    imports: [RabbitMQModule, S3Module, TypeOrmModule.forFeature([User, Stories, 
        UserStoriesLikes, StoriesView, FollowsAndBlock])],
    controllers: [ContentUserController],
    providers: [ContentUserService],
    exports: [ContentUserService]
})
export class ContentUserModule {}
