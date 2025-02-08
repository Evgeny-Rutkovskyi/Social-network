import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Chats } from 'src/entities/chats.entity';
import { MemberChat } from 'src/entities/membersChat.entity';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';
import { AccessToMessageDto, AddMemberDto, CreateGroupSettings } from './dto/addMember.dto';
import { v4 as uuidv4 } from 'uuid';
import { ChangeSettingsChat } from './dto/changeSettingsChat.dto';

@Injectable()
export class ChatService {
    constructor(@InjectRepository(User) private readonly userRepository: Repository<User>,
        @InjectRepository(Chats) private readonly chatsRepository: Repository<Chats>,
        @InjectRepository(MemberChat) private readonly memberChatRepository: Repository<MemberChat>,
    ) {}

    async connectionWebSocket(userId: number){
        try {
            const user = await this.userRepository.findOne({where: {id: userId}, 
                relations: ['rooms', 'rooms.chat']
            });
            if(user.is_ban) throw new ForbiddenException('No access');
            return user.rooms;
        } catch (error) {
            console.log('Something wrong with connectionWebSocket', error);
        }
    }
    
    async createPrivateChat(destinationId: number, userId: number){
        try {
            const newChat = this.chatsRepository.create({chat_type: 'private'});
            await this.chatsRepository.save(newChat);
            await this.addMemberToChat(newChat, [destinationId, userId], 
                {start_messages: null, access: true}
            );
            return newChat;
        } catch (error) {
            console.log('Something wrong with createPrivateChat', error);
        }
    }

    async deleteChat(userId: number, chatId: number){
        try {
            await this.memberChatRepository
                .createQueryBuilder('member_chat')
                .update({is_deleted: true})
                .where('chat = :chatId AND userId = :userId', {chatId, userId})
                .execute();
            return 'Chat was deleted';
        } catch (error) {
            console.log('Something wrong with deleteChat', error);
        }
    }

    async addMembersGroupChat(chatId: number, members: AddMemberDto, _isAdmin: boolean = false){
        try {
            const chat = await this.chatsRepository.findOne({where: {id: chatId}});
            const settings = {access: (chat.group_protect_add) ? false : true, 
                start_messages: (members.see_all_message) ? null : new Date()
            };
            if(_isAdmin) settings.access = true;
            await this.addMemberToChat(chat, members.members, settings);
            return 'Member was added';
        } catch (error) {
            console.log('Something wrong with addMembersGroupChat', error);
        }
    }

    async conversionChat(chatId: number, members: CreateGroupSettings, who_added: number){
        try {
            const chat = await this.chatsRepository.findOne({where: {id: chatId}});
            const group_link = this.generateGroupLink();
            const settings = {access: true,
                start_messages: (members.see_all_message) ? null : new Date()
            }
            await this.addMemberToChat(chat, members.members, settings);
            chat.group_protect_add = members.group_protect_add;
            chat.group_link = group_link;
            chat.chat_name = members.chat_name;
            chat.chat_type = 'group';
            await this.chatsRepository.save(chat);
            await this.addNewAdmin(chatId, who_added);
            return 'Private chat become group';
        } catch (error) {
            console.log('Something wrong with conversionChat', error);
        }
    }

    async createGroupChat(members: CreateGroupSettings, creator: number){
        try {
            const group_link = this.generateGroupLink();
            const newGroupChat = this.chatsRepository.create({group_protect_add: members.group_protect_add,
                group_link: group_link,
                chat_type: 'group',
                chat_name: members.chat_name
            })
            await this.chatsRepository.save(newGroupChat);
            members.members.push(creator);
            const settings = {access: true, start_messages: null};
            await this.addMemberToChat(newGroupChat, members.members, settings);
            await this.addNewAdmin(newGroupChat.id, creator);
            return newGroupChat;
        } catch (error) {
            console.log('Something wrong with createGroupChat', error);
        }
    }

    async changeSettingsChat(chatId: number, newSettings: ChangeSettingsChat){
        try {
            let chat = await this.chatsRepository.findOne({where: {id: chatId}});
            chat = {...chat, ...newSettings};
            await this.chatsRepository.save(chat);
            return chat;
        } catch (error) {
            console.log('Something wrong with changeSettingsChat', error);
        }
    }

    async leaveGroupChat(chatId: number, who_leave: number){
        try {
            const chat = await this.chatsRepository.findOne({where: {id: chatId}, relations: ['members']});
            const user = await this.userRepository.findOne({where: {id: who_leave}});
            const leave_user = await this.memberChatRepository.findOne({where: {user}});
            if(leave_user.role == 'admin'){
                let lastUser;
                for(let user of chat.members){
                    if(user.role == 'admin' && user.id !== leave_user.id){
                        lastUser = false;
                        break;
                    }else{
                        lastUser = user.id;
                    }
                }
                if(typeof lastUser == 'number') await this.addNewAdmin(chat.id, lastUser);
            }
            await this.memberChatRepository.delete(leave_user.id);
            if(chat.members.length <= 1) await this.chatsRepository.delete(chat);
            return 'Leave with chat successful';
        } catch (error) {
            console.log('Something wrong with leaveGroupChat', error);
        }
    }

    async adminAddMemberToChat(chatId: number, members: AddMemberDto){
        try {
            const chat = await this.chatsRepository.findOne({where: {id: chatId}});
            const settings = {access: true, 
                start_messages: (members.see_all_message) ? null : new Date()
            };
            await this.addMemberToChat(chat, members.members, settings)
            return 'Members successfully added';
        } catch (error) {
            console.log('Something wrong with adminAddMemberToChat', error);
        }
    }

    async adminGrantPermissionUser(who_to_add: number, chatId: number, see_messages: AccessToMessageDto){
        try {
            const see_all_message = (see_messages.see_all_message) ? null : new Date();
            await this.memberChatRepository
                .createQueryBuilder('member_chat')
                .update({access: true, start_messages: see_all_message})
                .where('user = :who_to_add AND chat = :chatId', {who_to_add, chatId})
                .execute();
            return 'Admin give access new member';
        } catch (error) {
            console.log('Something wrong with adminGrantPermissionUser', error);
        }
    }

    async adminDeleteMember(chatId: number, who_to_remove: number){
        try {
            await this.memberChatRepository
                .createQueryBuilder('member_chat')
                .delete()
                .where('user = :who_to_remove AND chat = :chatId', {who_to_remove, chatId})
                .execute();
            return 'Admin deleted member with group';
        } catch (error) {
            console.log('Something wrong with adminDeleteMember', error);
        }
    }

    async addNewAdmin(chatId: number, newAdmin: number){
        try {
            await this.memberChatRepository
                .createQueryBuilder('member_chat')
                .update({role: 'admin'})
                .where('user = :newAdmin AND chat = :chatId', {newAdmin, chatId})
                .execute();
            return 'Admin added new admin to group';
        } catch (error) {
            console.log('Something wrong with addNewAdmin', error);
        }
    }

    async takeOldAdmin(chatId: number, oldAdmin: number){
        try {
            await this.memberChatRepository
                .createQueryBuilder('member_chat')
                .update({role: 'user'})
                .where('user = :oldAdmin AND chat = :chatId', {oldAdmin, chatId})
                .execute();
            return 'Admin to low some admin';
        } catch (error) {
            console.log('Something wrong with takeOldAdmin', error);
        }
    }

    private async addMemberToChat(chat: Chats, members_to_add: Array<number>, 
    settings: {access: boolean, start_messages: Date | null}){
        for(let memberId of members_to_add){
            const member = await this.userRepository.findOne({where: {id: memberId}});
            const newMember = this.memberChatRepository.create({chat, user: member, ...settings});
            await this.memberChatRepository.save(newMember);
        }
    }

    private generateGroupLink(){
        return uuidv4();
    }

    async guardCheckAdmin(chatId: number, userId: number){
        try {
            const res = await this.memberChatRepository
                .createQueryBuilder('member_chat')
                .select()
                .where('member_chat.user = :userId AND member_chat.chat = :chatId', {userId, chatId})
                .getOne()
            return res.role === 'admin';
        } catch (error) {
            console.log('Something wrong with GuardCheckAdmin', error);
            
        }
    }
}
