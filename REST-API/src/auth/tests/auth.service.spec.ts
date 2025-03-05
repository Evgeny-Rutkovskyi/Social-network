import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../auth.service';
import { User } from '../../entities/user.entity';
import { Repository } from 'typeorm';
import { Token } from '../../entities/token.entity';
import { Settings } from '../../entities/settings.entity';
import { Stories } from '../../entities/stories.entity';
import { Profile } from '../../entities/profile.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { S3Service } from '../../upload-s3/s3.service';
import * as bcrypt from 'bcryptjs'
import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';


jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('hashedPassword'),
  compare: jest.fn().mockResolvedValue(true),
}));

describe('TempService', () => {
  let service: AuthService;
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
      providers: [AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn().mockResolvedValue(undefined),
            update: jest.fn().mockResolvedValue(undefined),
            create: jest.fn((x) => x),
            save: jest.fn((x) => x),
          }
        },
        {
          provide: getRepositoryToken(Token),
          useValue: {
            delete: jest.fn().mockResolvedValue(undefined),
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
        },
        {
          provide: JwtService,
          useValue: {
          },
        },
        {
          provide: S3Service,
          useValue: {
          }
        }
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
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

  it('should be defined', () => {
    expect(storiesRepository).toBeDefined();
  });

  it('should be defined', () => {
    expect(settingsRepository).toBeDefined();
  });

  it('should be defined', () => {
    expect(profileRepository).toBeDefined();
  });


  describe('registration', () => {
    const registrationDto = {
      userName: 'Eugene',
      email: 'some@ukr.net',
      password: 'q2323124dwsqd',
    }

    const user_info = {
      user_name: registrationDto.userName,
      email: registrationDto.email,
      password: 'hashedPassword'
    }

    it('should return information about user', async () => {
      const result = await service.registration(registrationDto);

      expect(userRepository.findOne).toHaveBeenCalledWith({
        "where": { "user_name": registrationDto.userName }
      });
      expect(userRepository.findOne).toHaveBeenCalledWith({
        "where": { "email": registrationDto.email }
      });
      expect(bcrypt.hash).toHaveBeenCalledWith(registrationDto.password, 7);
      expect(userRepository.create).toHaveBeenCalledWith(user_info);
      expect(userRepository.save).toHaveBeenCalledWith(user_info);
      expect(result).toEqual(user_info);
    })

    it('should throw error BadRequestException', async () => {
      jest.spyOn(service, 'registration').mockImplementationOnce(() => {
        throw new ConflictException();
      });
      try {
        const result = await service.registration(registrationDto);
      } catch (error) {
        console.log(error);
      }
    })
  })

  describe('loginWithEmail', () => {
    const emailDto = {
      email: 'some@ukr.net',
      password: 'asdsld1213'
    }
    const mockToken = '1232.32134.213sa';
    it('should return token', async () => {
      jest.spyOn(service, 'login').mockResolvedValue(mockToken);
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);
      const result = await service.loginWithEmail(emailDto);
      expect(userRepository.findOne).toHaveBeenCalledWith(
        {
          "where": { "email": emailDto.email },
          "relations": ['token']
        }
      );
      expect(service.login).toHaveBeenCalledWith(user, emailDto);
      expect(result).toBe(mockToken);
    })
  })
  
  describe('loginWithUserName', () => {
    const userNameDto = {
      userName: 'lalala',
      password: 'asdsld1213'
    }
    const mockToken = '1232.32134.213sa';
    it('should return token', async () => {
      jest.spyOn(service, 'login').mockResolvedValue(mockToken);
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);
      const result = await service.loginWithUserName(userNameDto);
      expect(userRepository.findOne).toHaveBeenCalledWith(
        {
          "where": { "user_name": userNameDto.userName },
          "relations": ['token']
        }
      );
      expect(service.login).toHaveBeenCalledWith(user, userNameDto);
      expect(result).toBe(mockToken);
    })
  })

  describe('login', () => {
    it('should throw error BadRequestException', async () => {
      jest.spyOn(service, 'login').mockImplementationOnce(() => {
        throw new BadRequestException();
      });
      try {
        const result = await service.login(user, {userName: 'lalala', password: 'asdsld1213'});
      } catch (error) {
        console.log(error);
      }
    })
  })
  
  describe('createOrChangeSettings', () => {
    const customSettings = {
      private_acc: false,
      language_app: 'uk',
      save_stories: false,
      about_user: 'about me'
    }

    it('should return user settings', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);
      const result = await service.createOrChangeSettings(1, customSettings);
      expect(userRepository.findOne).toHaveBeenCalledWith(
        {
          "where": { "id": 1 },
          "relations": ['settings']
        }
      );
      expect(result).toBe(user.settings);
    })

    it('should throw error BadRequestException', async () => {
      jest.spyOn(service, 'createOrChangeSettings').mockImplementationOnce(() => {
        throw new BadRequestException();
      });
      try {
        const result = await service.createOrChangeSettings(1, customSettings);
      } catch (error) {
        console.log(error);
      }
    })
  })

  describe('updateEmail', () => {
    const newEmailDto = {
      newEmail: 'new@ukr.net',
      email: 'old@ukr.net',
      password: '1234231312e12q'
    }

    it('should return user with new email', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);
      const result = await service.updateEmail(newEmailDto);
      expect(userRepository.findOne).toHaveBeenCalledWith(
        {
          "where": { "email": newEmailDto.email }
        }
      );
      expect(userRepository.save).toHaveBeenCalledWith({ ...user, email: newEmailDto.newEmail });
      expect(result).toEqual({...user, email: newEmailDto.newEmail})
    })

    it('should throw error', async () => {
      jest.spyOn(service, 'updateEmail').mockImplementationOnce(() => {
        throw new NotFoundException();
      });
      try {
        const result = await service.updateEmail(newEmailDto);
      } catch (error) {
        console.log(error);
      }
    })
  })

  describe('updatePassword', () => {
    const ChangePasswordDto = {
      userName: 'Bebe',
      email: 'old@ukr.net',
      password: '1234231312e12q',
      newPassword: 'hashedPassword'
    }

    it('should return user with new password', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);
      const result = await service.updatePassword(ChangePasswordDto);
      expect(userRepository.findOne).toHaveBeenCalledWith(
        {
          "where": { "email": ChangePasswordDto.email }
        }
      );
      expect(userRepository.save).toHaveBeenCalledWith(user);
      expect(result).toEqual(user)
    })

    it('should throw error', async () => {
      jest.spyOn(service, 'updatePassword').mockImplementationOnce(() => {
        throw new NotFoundException();
      });
      try {
        const result = await service.updatePassword(ChangePasswordDto);
      } catch (error) {
        console.log(error);
      }
    })
  })

  describe('nameChange', () => {
    const newNameDto = {
      userName: 'oldName',
      password: '1234231312e12q',
      newUserName: 'newName'
    }

    it('should return user with new name', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);
      const result = await service.nameChange(newNameDto);
      expect(userRepository.findOne).toHaveBeenCalledWith(
        {
          "where": { "user_name": newNameDto.userName }
        }
      );
      expect(userRepository.save).toHaveBeenCalledWith({ ...user, user_name: newNameDto.newUserName });
      expect(result).toEqual({...user, user_name: newNameDto.newUserName})
    })

    it('should throw error', async () => {
      jest.spyOn(service, 'nameChange').mockImplementationOnce(() => {
        throw new NotFoundException();
      });
      try {
        const result = await service.nameChange(newNameDto);
      } catch (error) {
        console.log(error);
      }
    })
  })
});
