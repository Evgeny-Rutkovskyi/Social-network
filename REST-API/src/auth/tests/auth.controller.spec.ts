import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../auth.controller';
import { AuthService } from '../auth.service';
import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { Response } from 'express';
import { User } from 'src/entities/user.entity';


describe('TempController', () => {
  let controller: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{
        provide: AuthService,
        useValue: {
          registration: jest.fn(),
          createOrChangeSettings: jest.fn(),
          loginWithEmail: jest.fn(),
          loginWithUserName: jest.fn(),
          updateEmail: jest.fn(),
          updatePassword: jest.fn(),
          nameChange: jest.fn(),
          deletedAccount: jest.fn()
        }
      }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('registration', () => {
    const mockResult = {
      user_name: 'Eugene',
      email: 'some@ukr.net',
      password: 123
    }
    const dto = {
      userName: 'Eugene',
      email: 'some@ukr.net',
      password: '1233421'
    }

    it('should call authService.registration and return new user', async () => {
      jest.spyOn(authService, 'registration').mockResolvedValue(mockResult);
      await expect(controller.registration(dto)).resolves.toEqual(mockResult);
    });

    it('should call authService.registration and return ConflictException', async () => {
      jest.spyOn(authService, 'registration').mockImplementationOnce(() => {
        throw new ConflictException();
      });
      try {
        const result = await controller.registration(dto);
      } catch (error) {
        console.log(error);
      }
    })
  })

  describe('createOrChangeSettings', () => {
    const mockResult = {
      id: 1,
      language_app: 'ua',
      private_acc: true,
      save_stories: false,
      avatar_url: 'some_url',
      about_user: "I'm user",
    }
    const dto = {
      private_acc: true,
      language_app: 'ua',
      save_stories: false,
      about_user: "I'm user",
    }
    
    it('should call authService.createOrChangeSettings and return new settings', async () => {
      jest.spyOn(authService, 'createOrChangeSettings').mockResolvedValue(mockResult);
      await expect(controller.createOrChangeSettings('1', dto)).resolves.toEqual(mockResult);
    })

    it('should call authService.createOrChangeSettings and return BadRequestException', async () => {
      jest.spyOn(authService, 'createOrChangeSettings').mockImplementationOnce(() => {
        throw new BadRequestException();
      });
      
      try {
        const result = await controller.createOrChangeSettings('1', dto);
      } catch (error) {
        console.log(error);
      }
    })
  })

  describe('loginWithEmail/loginWithUserName', () => {
    const loginWithEmailDto = {
      email: 'some@ukr.net',
      password: 'I_WantYaMaHaR1',
    }
    const loginWithUserName = {
      userName: 'R_Eugene_1',
      password: "Soon_I'll_to_buy_motorcycle",
    }
    const mockResponse = {
      cookie: jest.fn((x) => x),
    } as unknown as Response

    it('should return token', async () => {
      const mockResult = 'adqwd.123.asdwq1';
      jest.spyOn(authService, 'loginWithEmail').mockResolvedValue(mockResult);
      await expect(controller.loginWithEmail(loginWithEmailDto, mockResponse)).resolves.toBe(mockResult);
    })

    it('should return token', async () => {
      const mockResult = 'adqwd.123.asdwq1';
      jest.spyOn(authService, 'loginWithUserName').mockResolvedValue(mockResult);
      await expect(controller.loginWithUserName(loginWithUserName, mockResponse)).resolves.toBe(mockResult);
    })

    it('should throw error', async () => {
      jest.spyOn(authService, 'loginWithUserName').mockImplementationOnce(() => {
        throw new BadRequestException();
      });
      try {
        const result = await controller.loginWithUserName(loginWithUserName, mockResponse);
      } catch (error) {
        console.log(error);
      }
    })

    it('should throw error', async () => {
      jest.spyOn(authService, 'loginWithEmail').mockImplementationOnce(() => {
        throw new BadRequestException();
      });
      try {
        const result = await controller.loginWithEmail(loginWithEmailDto, mockResponse);
      } catch (error) {
        console.log(error);
      }
    })
  })
  
  describe('updateEmail', () => {
    const dto = {
      newEmail: 'new@ukr.net',
      email: 'old@ukr.net',
      password: '2133231',
    }
    it('should return user with new email', async () => {
      const mockResult = {
        id: 1,
        user_name: 'R_Eugene_1',
        email: 'some@ukr.net',
        qty_following: 999,
        qty_followers: 9999,
        is_Admin: false,
        is_ban: false,
        ban_time: new Date(),
      } as User
      jest.spyOn(authService, 'updateEmail').mockResolvedValue(mockResult);
      await expect(controller.updateEmail(dto)).resolves.toEqual(mockResult);
    })

    it('should throw error NotFoundException', async () => {
      jest.spyOn(authService, 'updateEmail').mockImplementationOnce(() => {
        throw new NotFoundException();
      });
      try {
        const result = await controller.updateEmail(dto);
      } catch (error) {
        console.log(error);
      }
    })

    it('should throw error BadRequestException', async () => {
      jest.spyOn(authService, 'updateEmail').mockImplementationOnce(() => {
        throw new BadRequestException();
      });
      try {
        const result = await controller.updateEmail(dto);
      } catch (error) {
        console.log(error);
      }
    })
  })

  describe('updatePassword', () => {
    const dto = {
      newPassword: 'lala12312',
      userName: 'R.Zhenya.1',
      email: 'old@ukr.net',
      password: '2133231',
    }
    it('should return user with new password', async () => {
      const mockResult = {
        id: 1,
        user_name: 'R_Eugene_1',
        email: 'some@ukr.net',
        qty_following: 999,
        qty_followers: 9999,
        is_Admin: false,
        is_ban: false,
        ban_time: new Date(),
      } as User
      jest.spyOn(authService, 'updatePassword').mockResolvedValue(mockResult);
      await expect(controller.updatePassword(dto)).resolves.toEqual(mockResult);
    })

    it('should throw error NotFoundException', async () => {
      jest.spyOn(authService, 'updatePassword').mockImplementationOnce(() => {
        throw new NotFoundException();
      });
      try {
        const result = await controller.updatePassword(dto);
      } catch (error) {
        console.log(error);
      }
    })

    it('should throw error BadRequestException', async () => {
      jest.spyOn(authService, 'updatePassword').mockImplementationOnce(() => {
        throw new BadRequestException();
      });
      try {
        const result = await controller.updatePassword(dto);
      } catch (error) {
        console.log(error);
      }
    })
  })

  describe('nameChange', () => {
    const dto = {
      newUserName: 'Pet-project',
      userName: 'R.Zhenya.1',
      password: '2133231',
    }
    it('should return user with new user-name', async () => {
      const mockResult = {
        id: 1,
        user_name: 'R_Eugene_1',
        email: 'some@ukr.net',
        qty_following: 999,
        qty_followers: 9999,
        is_Admin: false,
        is_ban: false,
        ban_time: new Date(),
      } as User
      jest.spyOn(authService, 'nameChange').mockResolvedValue(mockResult);
      await expect(controller.nameChange(dto)).resolves.toEqual(mockResult);
    })

    it('should throw error NotFoundException', async () => {
      jest.spyOn(authService, 'nameChange').mockImplementationOnce(() => {
        throw new NotFoundException();
      });
      try {
        const result = await controller.nameChange(dto);
      } catch (error) {
        console.log(error);
      }
    })

    it('should throw error BadRequestException', async () => {
      jest.spyOn(authService, 'nameChange').mockImplementationOnce(() => {
        throw new BadRequestException();
      });
      try {
        const result = await controller.nameChange(dto);
      } catch (error) {
        console.log(error);
      }
    })
  })

  describe('deleteAccount', () => {
    const mockResponse = {
      clearCookie: jest.fn((x) => x)
    } as unknown as Response
    it('should return account deleted user', async () => {
      const mockResult = {
        id: 1,
        user_name: 'R_Eugene_1',
        email: 'some@ukr.net',
        qty_following: 999,
        qty_followers: 9999,
        is_Admin: false,
        is_ban: false,
        ban_time: new Date(),
      } as User
      jest.spyOn(authService, 'deletedAccount').mockResolvedValue(mockResult);
      await expect(controller.deleteAccount(1, mockResponse)).resolves.toEqual(mockResult);
    })

    it('should throw error NotFoundException', async () => {
      jest.spyOn(authService, 'deletedAccount').mockImplementationOnce(() => {
        throw new NotFoundException();
      });
      try {
        const result = await controller.deleteAccount(1, mockResponse);
      } catch (error) {
        console.log(error);
      }
    })
  })
});
