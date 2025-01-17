import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../entities/user.entity';
import { Stories } from '../../entities/stories.entity';
import { ContentUserController } from './content-user.controller';
import { ContentUserService } from './content-user.service';
import { RabbitMQModule } from '../../rabbitmq/rabbitmq.module';
import { UserStoriesLikes } from 'src/entities/userStoriesLikes.entity';
import { StoriesView } from 'src/entities/storiesView.entity';

@Module({
    imports: [RabbitMQModule, TypeOrmModule.forFeature([User, Stories, 
        UserStoriesLikes, StoriesView])],
    controllers: [ContentUserController],
    providers: [ContentUserService],
    exports: [ContentUserService]
})
export class ContentUserModule {}
