import { Injectable } from '@nestjs/common';
import { AccessToMessageDto, AddMemberDto, CreateGroupSettings } from '../dto/addMember.dto';
import { v4 as uuidv4 } from 'uuid';
import { ChangeSettingsChat } from '../dto/changeSettingsChat.dto';
import { ChatRepository } from 'src/repositories/chat.repository';
import { MembersChatRepository } from 'src/repositories/membersChat.repository';
import { ObjectId } from 'mongodb';
import { logger } from 'src/logger.config';

@Injectable()
export class UserService {
    constructor(private readonly chatRepository: ChatRepository,
        private readonly membersChatRepository: MembersChatRepository
    ) {}
    
    async getAllChatsByUserId(userId: string){
        try {
            const memberChatsId = await this.membersChatRepository.find({user_id: userId})
            const chats = [];
            for(let document of memberChatsId){
                const chat = await this.chatRepository.findOneAndPopulate(
                    {_id: document.chat},
                    'members'
                )
                chats.push(chat);
            }
            return chats;
        } catch (error) {
            logger.error('Error', { error });
        }
    }

    async getMembersInChatByChatId(chatId: string){
        const chat = await this.chatRepository.findOneAndPopulate(
            {_id: chatId},
            'members'
        );
        return chat.members;
    }

    
    async createPrivateChat(destinationId: string, userId: number){
        try {
            const newChat = await this.chatRepository.create({chat_type: 'private',});
            await this.addMemberToChat(newChat._id, [Number(destinationId), userId], 
                {start_messages: null, access: true}
            );
            logger.info('Create private chat', { newChat });
            return newChat;
        } catch (error) {
            logger.error('Error', { error });
        }
    }

    async deleteChat(userId: number, chatId: string){
        try {
            const deletedChat = await this.membersChatRepository.findOneAndUpdate(
                {user_id: userId, chat: new ObjectId(chatId)},
                {is_deleted: true}
            );
            return deletedChat;
        } catch (error) {
            logger.error('Error', { error });
        }
    }

    async addMembersGroupChat(chatId: string, members: AddMemberDto, _isAdmin: boolean = false){
        try {
            const chat = await this.chatRepository.findOne({_id: chatId});
            const settings = {access: (chat.group_protect_add) ? false : true, 
                start_messages: (members.see_all_message) ? null : new Date()
            };
            if(_isAdmin) settings.access = true;
            await this.addMemberToChat(chat._id, members.members, settings);
            return 'Member was added';
        } catch (error) {
            logger.error('Error', { error });
        }
    }

    async conversionChat(chatId: string, members: CreateGroupSettings, who_added: number){
        try {
            const chat = await this.chatRepository.findOneWithoutLean({_id: chatId});
            const group_link = this.generateGroupLink();
            const settings = {access: true,
                start_messages: (members.see_all_message) ? null : new Date()
            }
            await this.addMemberToChat(chat._id, members.members, settings);
            chat.group_link = group_link;
            chat.chat_name = members.chat_name;
            chat.chat_type = 'group';
            chat.group_protect_add = members.group_protect_add;
            const groupChat = await this.chatRepository.save(chat);
            await this.addNewAdmin(chatId, who_added);
            return groupChat;
        } catch (error) {
            logger.error('Error', { error });
        }
    }

    async createGroupChat(members: CreateGroupSettings, creator: number){
        try {
            const group_link = this.generateGroupLink();
            const newGroupChat = await this.chatRepository.create({
                group_protect_add: members.group_protect_add,
                group_link: group_link,
                chat_type: 'group',
                chat_name: members.chat_name
            })
            members.members.push(Number(creator));
            const settings = {access: true, start_messages: null};
            await this.addMemberToChat(newGroupChat._id, members.members, settings);
            await this.addNewAdmin(String(newGroupChat._id), creator);
            logger.info('Create group chat', { newGroupChat });
            return newGroupChat;
        } catch (error) {
            logger.error('Error', { error });
        }
    }

    async changeSettingsChat(chatId: string, newSettings: ChangeSettingsChat){
        try {
            const chat = await this.chatRepository.findOneAndUpdate(
                {_id: chatId},
                {$set: newSettings}
            );
            logger.info('Change settings chat', { chat });
            return chat;
        } catch (error) {
            logger.error('Error', { error });
        }
    }

    async leaveGroupChat(chatId: string, who_leave: number){
        try {
            const chat = await this.chatRepository.findOneAndPopulate(
                {_id: chatId},
                'members'
            );
            const leave_user = await this.membersChatRepository.findOne({
                user_id: who_leave, 
                chat: new ObjectId(chatId)
            });

            if(leave_user.role == 'admin'){
                let lastUser;
                for(let userId of chat.members){
                    const user = await this.membersChatRepository.findOne({_id: userId});
                    if(user.role == 'admin' && String(user._id) !== String(leave_user._id)){
                        lastUser = false;
                        break;
                    }else{
                        lastUser = user.user_id;
                    }
                }

                if(typeof lastUser == 'number') await this.addNewAdmin(chatId, lastUser);
            }
            await this.membersChatRepository.findOneAndDelete({ _id: leave_user._id });
            logger.info('Leave with chat', { leave_user });
            return 'Leave with chat successful';
        } catch (error) {
            logger.error('Error', { error });
        }
    }

    async adminAddMemberToChat(chatId: string, members: AddMemberDto){
        try {
            const chat = await this.chatRepository.findOne({_id: chatId});
            const settings = {access: true, 
                start_messages: (members.see_all_message) ? null : new Date()
            };
            await this.addMemberToChat(chat._id, members.members, settings)
            return 'Members successfully added';
        } catch (error) {
            logger.error('Error', { error });
        }
    }

    async adminGrantPermissionUser(who_to_add: string, chatId: string, see_messages: AccessToMessageDto){
        try {
            const see_all_message = (see_messages.see_all_message) ? null : new Date();
            const addedUser = await this.membersChatRepository.findOneAndUpdate(
                {user_id: Number(who_to_add), chat: new ObjectId(chatId)},
                {access: true, start_messages: see_all_message}
            );
            return addedUser;
        } catch (error) {
            logger.error('Error', { error });
        }
    }

    async adminDeleteMember(chatId: string, who_to_remove: string){
        try {
            const deletedUser = await this.membersChatRepository.findOneAndDelete(
                {user_id: Number(who_to_remove), chat: new ObjectId(chatId)}
            )
            logger.info('Deleted user with chat', { deletedUser });
            return deletedUser;
        } catch (error) {
            logger.error('Error', { error });
        }
    }

    async addNewAdmin(chatId: string, newAdmin: number){
        try {
            const updateUser = await this.membersChatRepository.findOneAndUpdate(
                {user_id: newAdmin, chat: new ObjectId(chatId)},
                {role: 'admin'}
            );
            return updateUser;
        } catch (error) {
            logger.error('Error', { error });
        }
    }

    async takeOldAdmin(chatId: string, oldAdmin: number){
        try {
            const previousAdmin = await this.membersChatRepository.findOneAndUpdate(
                {user_id: oldAdmin, chat: new ObjectId(chatId)},
                {role: 'user'}
            );
            return previousAdmin;
        } catch (error) {
            logger.error('Error', { error });
        }
    }

    private async addMemberToChat(chatId: ObjectId, members_to_add: Array<number>, 
      settings: {access: boolean, start_messages: Date | null}
    ){
        const newMembers = [];
        for(let memberId of members_to_add){
            const newMember = await this.membersChatRepository.create({
                chat: chatId, user_id: memberId, ...settings
            });
            newMembers.push(newMember._id);
        }
        const chat = await this.chatRepository.findOneWithoutLean({_id: chatId});
        chat.members = [...chat.members, ...newMembers];
        await this.chatRepository.save(chat);
    }

    private generateGroupLink(){
        return uuidv4();
    }

    async guardCheckAdmin(chatId: string, userId: number){
        try {
            const res = await this.membersChatRepository.findOne({
                user_id: userId,
                chat: new ObjectId(chatId)
            });
            return res.role === 'admin';
        } catch (error) {
            logger.error('Error', { error });
        }
    }
}
