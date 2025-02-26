import { Injectable } from '@nestjs/common';
import { AccessInfo, DeleteMessage, EditMessage, ForwardMessage, JoinRoom, Message, ReplyMessage } from 'src/interfaces/chat.interface';
import { ChatRepository } from 'src/repositories/chat.repository';
import { MembersChatRepository } from 'src/repositories/membersChat.repository';
import { MessageRepository } from 'src/repositories/message.repository';
import { ObjectId } from 'mongodb';
import { logger } from 'src/logger.config';

@Injectable()
export class ChatService {
    constructor(private readonly chatRepository: ChatRepository,
        private readonly membersChatRepository: MembersChatRepository,
        private readonly messageRepository: MessageRepository
    ) {}

    async checkAccessToRoom(payload: JoinRoom): Promise<AccessInfo>{
        try {
            const chat = await this.chatRepository.findOneAndPopulate(
                {_id: payload.chat_id},
                ['members', 'messages']
            )

            for (let userId of chat.members) {
                if (String(userId) === payload.userId) {
                    const user = await this.membersChatRepository.findOne({
                        _id: payload.userId
                    })
                    if (user.access) {
                        const messages = await this.getMessages(chat.messages);
                        return { permission: true, messages};
                    } else {
                        break;
                    }
                }
            }
            return {permission: false, messages: []}
        } catch (error) {
            logger.error('Error', { error });
        }
    }
    
    async saveMessage(payload: Message){
        try {
            const saveMessage = await this.messageRepository.create({
                message: payload.message,
                time_sent: payload.timeSent,
                chat: new ObjectId(payload.chatId),
                user: new ObjectId(payload.user.userId)
            })
            await this.addMessageToChatAndUser(saveMessage._id, payload.chatId, payload.user.userId);
        } catch (error) {
            logger.error('Error', { error });
        }
    }

    async editMessage(payload: EditMessage){
        try {
            const message = await this.messageRepository.findOneWithoutLean({
                _id: payload.editMessageId
            });
            const now = new Date();
            const fifteenMinutesAgo = new Date(now.getTime() - 15 * 60 * 1000);
            if(!message || message.qty_edit >= 5 || message.time_sent < fifteenMinutesAgo) return false;
            message.message = payload.newMessage;
            message.qty_edit = message.qty_edit + 1;
            await this.messageRepository.save(message);
            return true;
        } catch (error) {
            logger.error('Error', { error });
        }
    }

    async deleteMessage(payload: DeleteMessage){
        try {
            await this.messageRepository.findOneAndDelete({_id: payload.messageId});
        } catch (error) {
            logger.error('Error', { error });
        }
    }

    async replyMessage(payload: ReplyMessage){
        try {
            const replyMessage = await this.messageRepository.create({
                message: payload.message,
                time_sent: payload.timeSent,
                chat: new ObjectId(payload.chatId),
                user: new ObjectId(payload.user.userId),
                reply_id: new ObjectId(payload.replyMessageId)
            });
            await this.addMessageToChatAndUser(replyMessage._id, payload.chatId, payload.user.userId);
        } catch (error) {
            logger.error('Error', { error });
        }
    }

    async forwardMessage(payload: ForwardMessage){
        try {
            for(let chat of payload.chatsId){
                if(payload.message.message){
                    const newMessage = await this.messageRepository.create({
                        message: payload.message.message,
                        time_sent: payload.message.timeSent,
                        chat: new ObjectId(chat),
                        user: new ObjectId(payload.message.user.userId),
                    })
                    await this.addMessageToChatAndUser(newMessage._id, chat, payload.message.user.userId);
                }
                const forwardMessage = await this.messageRepository.create({
                    message: payload.forward.message,
                    time_sent: payload.message.timeSent,
                    chat: new ObjectId(chat),
                    user: new ObjectId(payload.message.user.userId),
                    forward_who_id: new ObjectId(payload.forward.userId)
                })
                await this.addMessageToChatAndUser(forwardMessage._id, chat, payload.message.user.userId);
            }
        } catch (error) {
            logger.error('Error', { error });
        }
    }

    private async addMessageToChatAndUser(messageId: ObjectId, chatId: string, user_id: string){
        try {
            const chat = await this.chatRepository.findOneWithoutLean({
                _id: chatId,
            });
            const user = await this.membersChatRepository.findOneWithoutLean({
                _id: user_id
            })

            user.messages = [...user.messages, messageId];
            chat.messages = [...chat.messages, messageId];
            await this.membersChatRepository.save(user);
            await this.chatRepository.save(chat);
        } catch (error) {
            logger.error('Error', { error });
        }
    }
    
    private async getMessages(messagesId: Array<ObjectId>) {
        const messages = [];
        for (let messageId of messagesId) {
            const message = await this.messageRepository.findOneAndPopulate(
                { _id: messageId },
                'user'
            )
            messages.push(message);
        }
        return messages;
    }
}
