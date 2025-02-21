import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { ChatRepository } from 'src/repositories/chat.repository';
import { MembersChatRepository } from 'src/repositories/membersChat.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatDocument, ChatSchema } from 'src/schemas/chat.schema';
import { MembersChatDocument, MembersChatSchema } from 'src/schemas/members-chat.schema';

@Module({
  imports: [MongooseModule.forFeature([{name: ChatDocument.name, schema: ChatSchema},
    {name: MembersChatDocument.name, schema: MembersChatSchema}
  ])],
  controllers: [UserController],
  providers: [UserService, ChatRepository, MembersChatRepository],
  exports: [UserService]
})
export class UsersModule {}
