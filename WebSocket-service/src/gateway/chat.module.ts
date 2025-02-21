import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatDocument, ChatSchema } from 'src/schemas/chat.schema';
import { MembersChatDocument, MembersChatSchema } from 'src/schemas/members-chat.schema';
import { ChatService } from './chat.service';
import { MessageDocument, MessageSchema } from 'src/schemas/message.schema';
import { ChatRepository } from 'src/repositories/chat.repository';
import { MembersChatRepository } from 'src/repositories/membersChat.repository';
import { MessageRepository } from 'src/repositories/message.repository';

@Module({
    imports: [MongooseModule.forFeature([{name: ChatDocument.name, schema: ChatSchema},
        {name: MembersChatDocument.name, schema: MembersChatSchema},
        {name: MessageDocument.name, schema: MessageSchema}
      ])],
    providers: [ChatGateway, ChatService, ChatRepository, MembersChatRepository,
      MessageRepository
    ]
})
export class ChatModule {}
