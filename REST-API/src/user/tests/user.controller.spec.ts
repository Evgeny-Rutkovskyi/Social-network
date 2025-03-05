import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from '../user.controller';
import { UserService } from '../user.service';
import { FollowsAndBlock } from 'src/entities/followsAndBlock.entity';

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
            toFollow: jest.fn(),
            acceptFollow: jest.fn(),
            cancelFollow: jest.fn(),
            getAllFollowing: jest.fn(),
            getAllBestFriends: jest.fn(),
            getAllFollowers: jest.fn(),
            getBlockUser: jest.fn(),
            deleteFollower: jest.fn(),
            addBestFriend: jest.fn(),
            deleteWithBestFriend: jest.fn(),
            blockUser: jest.fn(),
            unblockUser: jest.fn()
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

  describe('toFollow - acceptFollow - cancelFollow', () => {
    //toFollow
    it('should return new follow', async () => {
      const mockFollow = {
        id: 1,
        accepted: true,
        accepted_time: new Date(),
        best_friend: true,
        is_block: false
      } as FollowsAndBlock

      jest.spyOn(userService, 'toFollow').mockResolvedValue(mockFollow);
      await expect(controller.toFollow(1, '2')).resolves.toEqual(mockFollow);
    })

    //acceptFollow
    it('should return msg', async () => {
      const mockResult = 'Followers was accepted';

      jest.spyOn(userService, 'acceptFollow').mockResolvedValue(mockResult);
      await expect(controller.acceptFollow(1, '2')).resolves.toEqual(mockResult);
    })

    //cancelFollow
    it('should return msg', async () => {
      const mockResult = 'Follow was delete';

      jest.spyOn(userService, 'cancelFollow').mockResolvedValue(mockResult);
      await expect(controller.cancelFollow(1, '2')).resolves.toEqual(mockResult);
    })
  })

  describe('getAllFollowing - getAllBestFriends - getAllFollowers - getBlockUser', () => {
    const mockResult = [];

    //getAllFollowing
    it('should return all user following', async () => {
      jest.spyOn(userService, 'getAllFollowing').mockResolvedValue(mockResult);
      await expect(controller.getAllFollowing(1)).resolves.toEqual(mockResult);
    })

    //getAllBestFriends
    it('should return all best friends', async () => {
      jest.spyOn(userService, 'getAllBestFriends').mockResolvedValue(mockResult);
      await expect(controller.getAllBestFriends(1)).resolves.toEqual(mockResult);
    })

    //getAllFollowers
    it('should return all followers', async () => {
      jest.spyOn(userService, 'getAllFollowers').mockResolvedValue(mockResult);
      await expect(controller.getAllFollowers(1)).resolves.toEqual(mockResult);
    })

    //getBlockUser
    it('should return all block users', async () => {
      jest.spyOn(userService, 'getBlockUser').mockResolvedValue(mockResult);
      await expect(controller.getBlockUser(1)).resolves.toEqual(mockResult);
    })
  })

  describe('deleteFollower', () => {
    it('should return msg', async () => {
      const mockResult = 'Follower was delete';
      jest.spyOn(userService, 'deleteFollower').mockResolvedValue(mockResult);
      await expect(controller.deleteFollower(1, '2')).resolves.toEqual(mockResult);
    })
  })

  describe('addBestFriend and deleteWithBestFriend', () => {
    it('should return msg', async () => {
      const mockResult = 'User was added in best friend';
      jest.spyOn(userService, 'addBestFriend').mockResolvedValue(mockResult);
      await expect(controller.addBestFriend(1, '2')).resolves.toEqual(mockResult);
    })

    it('should return msg', async () => {
      const mockResult = 'User was deleted in best friend';
      jest.spyOn(userService, 'deleteWithBestFriend').mockResolvedValue(mockResult);
      await expect(controller.deleteWithBestFriend(1, '2')).resolves.toEqual(mockResult);
    })
  })

  describe('blockUser and unblockUser', () => {
    it('should return msg', async () => {
      const mockResult = 'User was block';
      jest.spyOn(userService, 'blockUser').mockResolvedValue(mockResult);
      await expect(controller.blockUser(1, '2')).resolves.toEqual(mockResult);
    })

    it('should return msg', async () => {
      const mockResult = 'User was unblock';
      jest.spyOn(userService, 'unblockUser').mockResolvedValue(mockResult);
      await expect(controller.unblockUser(1, '2')).resolves.toEqual(mockResult);
    })
  })
});
