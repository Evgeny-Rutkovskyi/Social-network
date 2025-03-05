import { Test, TestingModule } from '@nestjs/testing';
import { AdminService } from '../admin.service';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../../entities/user.entity';
import { Repository } from 'typeorm';
import { Token } from '../../entities/token.entity';
import { CommentsProfile } from '../../entities/commentsProfile.entity';
import { Stories } from '../../entities/stories.entity';
import { Settings } from '../../entities/settings.entity';
import { Profile } from '../../entities/profile.entity';

describe('TempService', () => {
  let service: AdminService;
  let configService: ConfigService;
  let userRepository: Repository<User>;
  let tokenRepository: Repository<Token>;
  let storiesRepository: Repository<Stories>;
  let settingsRepository: Repository<Settings>;
  let profileRepository: Repository<Profile>;

  const user = {
    id: 1,
    user_name: 'R_Eugene_1',
    email: 'some@ukr.net',
    qty_following: 999,
    qty_followers: 9999,
    is_Admin: false,
    is_ban: false,
    ban_time: '2025-03-04T09:22:43.755Z',
    token: 'wswqd12dsa.123sqdq23s.wqefds3sfwe'
  } as unknown as User

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AdminService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockImplementation((key: string) => {
              const mockEnv = {
                first_admin_name: 'Zhenyok',
                first_admin_private: true,
                first_admin_password: '1231231',
                first_admin_email: 'some@ukr.net'
              };
              return mockEnv[key];
            }),
          }
        },
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn().mockResolvedValue(user),
            update: jest.fn().mockResolvedValue(undefined),

          }
        },
        {
          provide: getRepositoryToken(Token),
          useValue: {
            delete: jest.fn().mockResolvedValue(undefined),
          }
        },
        {
          provide: getRepositoryToken(CommentsProfile),
          useValue: {

          }
        },
        {
          provide: getRepositoryToken(Stories),
          useValue: {

          }
        },
        {
          provide: getRepositoryToken(Settings),
          useValue: {

          }
        },
        {
          provide: getRepositoryToken(Profile),
          useValue: {

          }
        }
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
    configService = module.get<ConfigService>(ConfigService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    tokenRepository = module.get<Repository<Token>>(getRepositoryToken(Token));
    storiesRepository = module.get<Repository<Stories>>(getRepositoryToken(Stories));
    settingsRepository = module.get<Repository<Settings>>(getRepositoryToken(Settings));
    profileRepository = module.get<Repository<Profile>>(getRepositoryToken(Profile));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should be defined', () => {
    expect(userRepository).toBeDefined();
  });

  it('should be defined', () => {
    expect(tokenRepository).toBeDefined();
  });
  
  describe('banUser', () => {
    it('should return msg', async () => {
      jest.spyOn(service, 'queryBuilder').mockResolvedValue(undefined);
      const msg = 'User was banned';
      const result = await service.banUser(1);
      
      expect(userRepository.findOne).toHaveBeenCalledWith({
        "where": { "id": 1 },
        "relations": ["token"]
      });
      expect(userRepository.update).toHaveBeenCalledWith(1,
        expect.objectContaining({
          is_ban: true
        })
      );
      expect(tokenRepository.delete).toHaveBeenCalledWith(user.token);
      expect(result).toBe(msg);
    })
  })
  
  describe('unblockUser', () => {
    it('should return msg', async () => {
      jest.spyOn(service, 'queryBuilder').mockResolvedValue(undefined);
      const msg = 'User was unblock';
      const result = await service.unblockUser(1);
      expect(result).toBe(msg);
    })
  })

  describe('banComment', () => {
    it('should return msg', async () => {
      jest.spyOn(service, 'queryBuilder').mockResolvedValue(undefined);
      const msg = 'Comment was banned';
      const result = await service.banComment(1);
      expect(result).toBe(msg);
    })
  })
  
  describe('unblockComment', () => {
    it('should return msg', async () => {
      jest.spyOn(service, 'queryBuilder').mockResolvedValue(undefined);
      const msg = 'Comment was unblock';
      const result = await service.unblockComment(1);
      expect(result).toBe(msg);
    })
  })

  describe('banStories', () => {
    it('should return msg', async () => {
      jest.spyOn(service, 'queryBuilder').mockResolvedValue(undefined);
      const msg = 'Stories was banned';
      const result = await service.banStories(1);
      expect(result).toBe(msg);
    })
  })

  describe('unblockStories', () => {
    it('should return msg', async () => {
      jest.spyOn(service, 'queryBuilder').mockResolvedValue(undefined);
      const msg = 'Stories was unblock';
      const result = await service.unblockStories(1);
      expect(result).toBe(msg);
    })
  })

  describe('banProfile', () => {
    it('should return msg', async () => {
      jest.spyOn(service, 'queryBuilder').mockResolvedValue(undefined);
      const msg = 'Profile was block';
      const result = await service.banProfile(1);
      expect(result).toBe(msg);
    })
  })

  describe('unblockProfile', () => {
    it('should return msg', async () => {
      jest.spyOn(service, 'queryBuilder').mockResolvedValue(undefined);
      const msg = 'Profile was unblock';
      const result = await service.unblockProfile(1);
      expect(result).toBe(msg);
    })
  })

  describe('addNewAdmin', () => {
    it('should return msg', async () => {
      jest.spyOn(service, 'queryBuilder').mockResolvedValue(undefined);
      const msg = 'Add new Admin';
      const result = await service.addNewAdmin(1);
      expect(result).toBe(msg);
    })
  })

  describe('takeAdmin', () => {
    it('should return msg', async () => {
      jest.spyOn(service, 'queryBuilder').mockResolvedValue(undefined);
      const msg = 'Take this Admin';
      const result = await service.takeAdmin(1);
      expect(result).toBe(msg);
    })
  })
});
