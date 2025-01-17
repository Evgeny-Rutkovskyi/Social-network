import { Module } from '@nestjs/common';
import { RabbitMQService } from './rabbitmq.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Stories } from 'src/entities/stories.entity';
import { User } from 'src/entities/user.entity';
import { UserStoriesLikes } from 'src/entities/userStoriesLikes.entity';


@Module({
  imports: [TypeOrmModule.forFeature([Stories, User, UserStoriesLikes])],
  providers: [RabbitMQService],
  exports: [RabbitMQService]
})
export class RabbitMQModule {}
