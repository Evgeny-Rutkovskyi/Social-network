jest.mock('../adminGuard/admin.guard', () => ({
  AdminGuard: jest.fn().mockImplementation(() => ({
    canActivate: jest.fn().mockReturnValue(true),
  })),
}));

import { Test, TestingModule } from '@nestjs/testing';
import { AdminController } from '../admin.controller';
import { AdminService } from '../admin.service';
import { JwtAuthGuard } from '../../guards/jwt.guard';
import { AdminGuard } from '../adminGuard/admin.guard';

describe('TempController', () => {
  let controller: AdminController;
  let adminService: AdminService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminController],
      providers: [{
        provide: AdminService,
        useValue: {
          banUser: jest.fn(),
          unblockUser: jest.fn(),
          banComment: jest.fn(),
          unblockComment: jest.fn(),
          banStories: jest.fn(),
          unblockStories: jest.fn(),
          banProfile: jest.fn(),
          unblockProfile: jest.fn(),
          addNewAdmin: jest.fn(),
          takeAdmin: jest.fn()
        },
      }, {
        provide: JwtAuthGuard, 
        useValue: {
          canActivate: jest.fn().mockReturnValue(true),
        },
      }, {
        provide: AdminGuard, 
        useClass: AdminGuard
      }],
    }).compile();

    controller = module.get<AdminController>(AdminController);
    adminService = module.get<AdminService>(AdminService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call adminService.banUser and return result', async () => {
    const mockResult = 'User was banned';
    jest.spyOn(adminService, 'banUser').mockResolvedValue(mockResult);

    const result = await controller.banUser('1');

    expect(adminService.banUser).toHaveBeenCalledWith(1);
    expect(result).toEqual(mockResult);
  })

  it('should call adminService.unblockUser and return result', async () => {
    const mockResult = 'User was unblock';
    jest.spyOn(adminService, 'unblockUser').mockResolvedValue(mockResult);
    await expect(controller.unblockUser('1')).resolves.toBe(mockResult);
  })

  it('should call adminService.banComment and return result', async () => {
    const mockResult = 'Comment was banned';
    jest.spyOn(adminService, 'banComment').mockResolvedValue(mockResult);
    await expect(controller.banComment('1')).resolves.toBe(mockResult);
  })

  it('should call adminService.unblockComment and return result', async () => {
    const mockResult = 'Comment was unblock';
    jest.spyOn(adminService, 'unblockComment').mockResolvedValue(mockResult);
    await expect(controller.unblockComment('1')).resolves.toBe(mockResult);
  })

  it('should call adminService.banStories and return result', async () => {
    const mockResult = 'Stories was banned';
    jest.spyOn(adminService, 'banStories').mockResolvedValue(mockResult);
    await expect(controller.banStories('1')).resolves.toBe(mockResult);
  })
    
  it('should call adminService.unblockStories and return result', async () => {
    const mockResult = 'Stories was unblock';
    jest.spyOn(adminService, 'unblockStories').mockResolvedValue(mockResult);
    await expect(controller.unblockStories('1')).resolves.toBe(mockResult);
  })

  it('should call adminService.banProfile and return result', async () => {
    const mockResult = 'Profile was block';
    jest.spyOn(adminService, 'banProfile').mockResolvedValue(mockResult);
    await expect(controller.banProfile('1')).resolves.toBe(mockResult);
  })
  
  it('should call adminService.unblockProfile and return result', async () => {
    const mockResult = 'Profile was unblock';
    jest.spyOn(adminService, 'unblockProfile').mockResolvedValue(mockResult);
    await expect(controller.unblockProfile('1')).resolves.toBe(mockResult);
  })

  it('should call adminService.addNewAdmin and return result', async () => {
    const mockResult = 'Add new Admin';
    jest.spyOn(adminService, 'addNewAdmin').mockResolvedValue(mockResult);
    await expect(controller.addNewAdmin('1')).resolves.toBe(mockResult);
  })

  it('should call adminService.takeAdmin and return result', async () => {
    const mockResult = 'Take this Admin';
    jest.spyOn(adminService, 'takeAdmin').mockResolvedValue(mockResult);
    await expect(controller.takeAdmin('1')).resolves.toBe(mockResult);
  })
});
