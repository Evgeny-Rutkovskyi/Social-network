import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/guards/jwt.guard';
import { ChatService } from './chat.service';
import { UserField } from 'src/custom-decorator/user.decorator';
import { AccessToMessageDto, AddMemberDto, CreateGroupSettings } from './dto/addMember.dto';
import { ChangeSettingsChat } from './dto/changeSettingsChat.dto';
import { ChatAdminGuard } from 'src/guards/chatAdmin.guard';

@UseGuards(JwtAuthGuard)
@Controller('chat')
export class ChatController {
    constructor(private readonly chatService: ChatService) {}

    @Get('/access/connection')
    async connectionWebSocket(@UserField('userId') userId: number){
        return await this.chatService.connectionWebSocket(userId);
    }

    @Post('/create/private/:destinationId')
    async createPrivateChat(@Param('destinationId') destinationId: number, 
    @UserField('userId') userId: number){
        return await this.chatService.createPrivateChat(destinationId, userId);
    }

    @Delete('/delete/:chatId')
    async deleteChat(@UserField('userId') userId: number,
    @Param('chatId') chatId: number){
        return await this.chatService.deleteChat(userId, chatId);
    }

    
    @Post('/group/add/member/:chatId')
    async addMembersGroupChat(@Param('chatId') chatId: number, 
    @Body() members: AddMemberDto){
        return await this.chatService.addMembersGroupChat(chatId, members);
    }

    @Post('/conversion/:chatId')
    async conversionFromPrivateToGroup(@Param('chatId') chatId: number, 
    @Body() members: CreateGroupSettings, @UserField('userId') who_added: number){
        return await this.chatService.conversionChat(chatId, members, who_added);
    }

    @Post('/create/group')
    async createGroupChat(@Body() members: CreateGroupSettings, @UserField('userId') creator: number){
        return await this.chatService.createGroupChat(members, creator);
    }

    @Patch('/change/settings/:chatId')
    async changeSettingsChat(@Param('chatId') chatId: number,
    @Body() newSettings: ChangeSettingsChat){
        return await this.chatService.changeSettingsChat(chatId, newSettings);
    }

    @Delete('/group/leave/:chatId')
    async leaveGroupChat(@Param('chatId') chatId: number, @UserField('userId') who_leave: number){
        return await this.chatService.leaveGroupChat(chatId, who_leave);
    }

    @UseGuards(ChatAdminGuard)
    @Post('/admin/add/member/:chatId')
    async adminAddMemberToChat(@Param('chatId') chatId: number,
    @Body() members: AddMemberDto){
        return await this.chatService.adminAddMemberToChat(chatId, members);
    }

    @UseGuards(ChatAdminGuard)
    @Post('/admin/access/:who_to_add/:chatId')
    async adminGrantPermissionUserToChat(@Param() params: {who_to_add: number,
    chatId: number}, @Body() see_messages: AccessToMessageDto){
        return await this.chatService.adminGrantPermissionUser(params.who_to_add, params.chatId, see_messages);
    }

    @UseGuards(ChatAdminGuard)
    @Delete('/admin/delete/member/:who_to_remove/:chatId')
    async adminDeleteMemberWithGroupChat(@Param() params: {who_to_remove: number,
    chatId: number}){
        return await this.chatService.adminDeleteMember(params.chatId, params.who_to_remove);
    }

    @UseGuards(ChatAdminGuard)
    @Post('/admin/add/:chatId/:newAdmin')
    async adminAddNewAdmin(@Param() params: {chatId: number, newAdmin: number}){
        return await this.chatService.addNewAdmin(params.chatId, params.newAdmin);
    }

    @UseGuards(ChatAdminGuard)
    @Post('/admin/take/:chatId/:oldAdmin')
    async adminTakeOldAdmin(@Param() params: {chatId: number, oldAdmin: number}){
        return await this.chatService.takeOldAdmin(params.chatId, params.oldAdmin);
    }
}
