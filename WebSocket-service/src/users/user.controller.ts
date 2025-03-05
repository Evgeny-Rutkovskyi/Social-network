import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { UserField } from '../custom-decorator/user.decorator';
import { AccessToMessageDto, AddMemberDto, CreateGroupSettings } from '../dto/addMember.dto';
import { ChangeSettingsChat } from '../dto/changeSettingsChat.dto';
import { ChatAdminGuard } from '../guards/chatAdmin.guard';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../temporarily-auth-module/jwt.guard';

@UseGuards(JwtAuthGuard)
@Controller('chat')
export class UserController {
    constructor(private readonly userService: UserService) {}
    
    @Get('/all/chats/:userId')
    async getAllChatsByUserId(@Param('userId') userId: string){
        return await this.userService.getAllChatsByUserId(userId);
    }

    @Get('/members/:chatId')
    async getMembersInChatByChatId(@Param('chatId') chatId: string){
        return await this.userService.getMembersInChatByChatId(chatId);
    }

    @Post('/create/private/:destinationId')
    async createPrivateChat(@Param('destinationId') destinationId: string, 
    @UserField('userId') userId: number){
        return await this.userService.createPrivateChat(destinationId, userId);
    }

    @Delete('/delete/:chatId')
    async deleteChat(@UserField('userId') userId: number,
    @Param('chatId') chatId: string){
        return await this.userService.deleteChat(userId, chatId);
    }

    @Post('/group/add/member/:chatId')
    async addMembersGroupChat(@Param('chatId') chatId: string, 
    @Body() members: AddMemberDto){
        return await this.userService.addMembersGroupChat(chatId, members);
    }

    @Post('/conversion/:chatId')
    async conversionFromPrivateToGroup(@Param('chatId') chatId: string, 
    @Body() members: CreateGroupSettings, @UserField('userId') who_added: number){
        return await this.userService.conversionChat(chatId, members, who_added);
    }

    @Post('/create/group')
    async createGroupChat(@Body() members: CreateGroupSettings, @UserField('userId') creator: number){
        return await this.userService.createGroupChat(members, creator);
    }

    @Patch('/change/settings/:chatId')
    async changeSettingsChat(@Param('chatId') chatId: string,
    @Body() newSettings: ChangeSettingsChat){
        return await this.userService.changeSettingsChat(chatId, newSettings);
    }

    @Delete('/group/leave/:chatId')
    async leaveGroupChat(@Param('chatId') chatId: string, @UserField('userId') who_leave: number){
        return await this.userService.leaveGroupChat(chatId, who_leave);
    }

    @UseGuards(ChatAdminGuard)
    @Post('/admin/add/member/:chatId')
    async adminAddMemberToChat(@Param('chatId') chatId: string,
    @Body() members: AddMemberDto){
        return await this.userService.adminAddMemberToChat(chatId, members);
    }

    @UseGuards(ChatAdminGuard)
    @Post('/admin/access/:who_to_add/:chatId')
    async adminGrantPermissionUserToChat(@Param() params: {who_to_add: string,
    chatId: string}, @Body() see_messages: AccessToMessageDto){
        return await this.userService.adminGrantPermissionUser(params.who_to_add, params.chatId, see_messages);
    }

    @UseGuards(ChatAdminGuard)
    @Delete('/admin/delete/member/:who_to_remove/:chatId')
    async adminDeleteMemberWithGroupChat(@Param() params: {who_to_remove: string,
    chatId: string}){
        return await this.userService.adminDeleteMember(params.chatId, params.who_to_remove);
    }

    @UseGuards(ChatAdminGuard)
    @Patch('/admin/add/:chatId/:newAdmin')
    async adminAddNewAdmin(@Param() params: { chatId: string, newAdmin: string }) {
        return await this.userService.addNewAdmin(params.chatId, Number(params.newAdmin));
    }

    @UseGuards(ChatAdminGuard)
    @Post('/admin/take/:chatId/:oldAdmin')
    async adminTakeOldAdmin(@Param() params: {chatId: string, oldAdmin: string}){
        return await this.userService.takeOldAdmin(params.chatId, Number(params.oldAdmin));
    }
}
