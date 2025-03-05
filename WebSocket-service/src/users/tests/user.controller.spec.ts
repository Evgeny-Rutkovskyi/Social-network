import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from '../user.controller';
import { UserService } from '../user.service';
import { ChatDocument } from '../../schemas/chat.schema';
import { MembersChatDocument } from 'src/schemas/members-chat.schema';

describe('TempController', () => {
  let controller: UserController;
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: {
            getAllChatsByUserId: jest.fn(),
            getMembersInChatByChatId: jest.fn(),
            createPrivateChat: jest.fn(),
            deleteChat: jest.fn(),
            addMembersGroupChat: jest.fn(),
            conversionChat: jest.fn(),
            createGroupChat: jest.fn(),
            changeSettingsChat: jest.fn(),
            leaveGroupChat: jest.fn(),
            adminAddMemberToChat: jest.fn(),
            adminGrantPermissionUser: jest.fn(),
            adminDeleteMember: jest.fn(),
            addNewAdmin: jest.fn(),
            takeOldAdmin: jest.fn()
          }
        }
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  const mockAddUserDto = {
    members: [5, 6, 7],
    see_all_message: true
  }

  const mockMemberInChat = {
    role: 'user',
    created_at: new Date(),
    start_messages: new Date(),
    access: true,
    is_deleted: false
  } as MembersChatDocument

  describe('User capabilities in chat', () => {
    const mockChat = {
      chat_type: 'private',
      theme: 'Dark',
      group_link: 'Some_link',
      group_protect_add: false,
      chat_name: 'News',
      created_at: new Date()
    } as ChatDocument
    
    describe('getAllChatsByUserId and getMembersInChatByChatId', () => {
      const mockResult = [];
  
      it('getAllChatsByUserId, should return all chats some user', async () => {
        jest.spyOn(userService, 'getAllChatsByUserId').mockResolvedValue(mockResult);
        await expect(controller.getAllChatsByUserId('1')).resolves.toEqual(mockResult);
      })
  
      it('getMembersInChatByChatId, should return members, who include in chat', async () => {
        jest.spyOn(userService, 'getMembersInChatByChatId').mockResolvedValue(mockResult);
        await expect(controller.getMembersInChatByChatId('1')).resolves.toEqual(mockResult);
      })
    })

    describe('createPrivateChat', () => {
      it('should return created chat', async () => {
        jest.spyOn(userService, 'createPrivateChat').mockResolvedValue(mockChat);
        await expect(controller.createPrivateChat('2', 1)).resolves.toEqual(mockChat);
      })
    })

    describe('deleteChat', () => {
      it('should return deleted chat', async () => {
        jest.spyOn(userService, 'deleteChat').mockResolvedValue(mockMemberInChat);
        await expect(controller.deleteChat(1, '2')).resolves.toEqual(mockMemberInChat);
      })
    })
    
    describe('addMembersGroupChat', () => {
      it('should return chat with added users', async () => {
        jest.spyOn(userService, 'addMembersGroupChat').mockResolvedValue(mockChat);
        await expect(controller.addMembersGroupChat('1', mockAddUserDto)).resolves.toEqual(mockChat);
      })
    })

    describe('conversionFromPrivateToGroup and createGroupChat', () => {
      const mockCreateGroupSettings = {
        members: [5, 6, 7],
        see_all_message: true,
        group_protect_add: true,
        chat_name: 'Some_name'
      }

      it('conversionFromPrivateToGroup, should conversion private chat and return changed chat', async () => {
        jest.spyOn(userService, 'conversionChat').mockResolvedValue(mockChat);
        await expect(controller.conversionFromPrivateToGroup('1', mockCreateGroupSettings, 1))
          .resolves.toEqual(mockChat);
      })

      it('createGroupChat, should create group chat and return him', async () => {
        jest.spyOn(userService, 'createGroupChat').mockResolvedValue(mockChat);
        await expect(controller.createGroupChat(mockCreateGroupSettings, 1))
          .resolves.toEqual(mockChat);
      })
    })
    
    describe('changeSettingsChat', () => {
      const mockChangeSettingsChat = {
        group_protect_add: true,
        theme: 'Lite',
        chat_name: 'Breaking_Bet_great_serial'
      }
      it('should return chat with change settings', async () => {
        jest.spyOn(userService, 'changeSettingsChat').mockResolvedValue(mockChat);
        await expect(controller.changeSettingsChat('1', mockChangeSettingsChat)).resolves.toEqual(mockChat);
      })
    })
    
    describe('leaveGroupChat', () => {
      const mockResult = 'Leave with chat successful';
      it('should return msg', async () => {
        jest.spyOn(userService, 'leaveGroupChat').mockResolvedValue(mockResult);
        await expect(controller.leaveGroupChat('1', 2)).resolves.toEqual(mockResult);
      })
    })
  })

  describe('Admin capabilities in chat', () => {
    describe('adminAddMemberToChat', () => {
      const mockResult = 'Members successfully added'
      it('should return msg', async () => {
        jest.spyOn(userService, 'adminAddMemberToChat').mockResolvedValue(mockResult);
        await expect(controller.adminAddMemberToChat('1', mockAddUserDto)).resolves.toEqual(mockResult);
      })
    })

    describe('adminGrantPermissionUserToChat', () => {
      const dto = {
        see_all_message: true
      }
      it('should return added user', async () => {
        jest.spyOn(userService, 'adminGrantPermissionUser').mockResolvedValue(mockMemberInChat);
        await expect(controller.adminGrantPermissionUserToChat(
          { who_to_add: '1', chatId: '2'}, dto))
          .resolves.toEqual(mockMemberInChat);
      })
    })
    
    describe('adminDeleteMemberWithGroupChat', () => {
      it('should return deleted user', async () => {
        jest.spyOn(userService, 'adminDeleteMember').mockResolvedValue(mockMemberInChat);
        await expect(controller.adminDeleteMemberWithGroupChat(
          { who_to_remove: '1', chatId: '2' }))
          .resolves.toEqual(mockMemberInChat);
      })
    })
    
    describe('adminAddNewAdmin', () => {
      it('should return new admin in chat', async () => {
        jest.spyOn(userService, 'addNewAdmin').mockResolvedValue(mockMemberInChat);
        await expect(controller.adminAddNewAdmin(
          { chatId: '1', newAdmin: "2" }))
          .resolves.toEqual(mockMemberInChat);
      })
    })
    
    describe('adminTakeOldAdmin', () => {
      it('should return old admin', async () => {
        jest.spyOn(userService, 'takeOldAdmin').mockResolvedValue(mockMemberInChat);
        await expect(controller.adminTakeOldAdmin(
          {chatId: '1', oldAdmin: '2'}))
          .resolves.toEqual(mockMemberInChat);
      })
    })
  })
});
