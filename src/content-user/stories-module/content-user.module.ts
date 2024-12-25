import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Token } from '../../entities/token.entity';
import { User } from '../../entities/user.entity';
import { Stories } from '../../entities/stories.entity';
import { ContentUserController } from './content-user.controller';
import { ContentUserService } from './content-user.service';
import { RabbitMQModule } from '../../rabbitmq/rabbitmq.module';
import { Settings } from '../../entities/settings.entity';
import { UserStoriesLikes } from 'src/entities/userStoriesLikes.entity';

@Module({
    imports: [RabbitMQModule, TypeOrmModule.forFeature([User, Token, Stories, Settings, UserStoriesLikes])],
    controllers: [ContentUserController],
    providers: [ContentUserService],
    exports: [ContentUserService]
})
export class ContentUserModule {}
