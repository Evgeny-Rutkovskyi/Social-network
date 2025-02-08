import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { Chats } from 'src/entities/chats.entity';
import { MemberChat } from 'src/entities/membersChat.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Chats, MemberChat])],
  controllers: [ChatController],
  providers: [ChatService],
  exports: [ChatService]
})
export class ChatModule {}
