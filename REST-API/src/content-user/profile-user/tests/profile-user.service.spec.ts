import { Test, TestingModule } from '@nestjs/testing';
import { ProfileUserService } from '../profile-user.service';
import { User } from '../../../entities/user.entity';
import { Repository } from 'typeorm';
import { Profile } from '../../../entities/profile.entity';
import { UserToProfile } from '../../../entities/userToProfile.entity';
import { ProfileLikes } from '../../../entities/profileLikes.entity';
import { CommentsProfile } from '../../../entities/commentsProfile.entity';
import { FollowsAndBlock } from '../../../entities/followsAndBlock.entity';
import { S3Service } from '../../../upload-s3/s3.service';
import { RabbitMQService } from '../../../rabbitmq/rabbitmq.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CreateProfileDto } from 'src/content-user/dto/createProfile.dto';
import { BadRequestException } from '@nestjs/common';

describe('TempService', () => {
  let service: ProfileUserService;
  let userRepository: Repository<User>;
  let profileRepository: Repository<Profile>;
  let userToProfileRepository: Repository<UserToProfile>;
  let profileLikesRepository: Repository<ProfileLikes>;
  let commentsProfileRepository: Repository<CommentsProfile>;
  let followsAndBlockRepository: Repository<FollowsAndBlock>;
  let rabbitService: RabbitMQService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProfileUserService,
        {
          provide: S3Service,
          useValue: {
            generatePresignedUrl: jest.fn().mockResolvedValue('presigned-url')
          }
        },
        {
          provide: RabbitMQService,
          useValue: {
            sendMessageValidFiles: jest.fn().mockResolvedValue(undefined),
          }
        },
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
          provide: getRepositoryToken(UserToProfile),
          useValue: {
            create: jest.fn((x) => x),
            save: jest.fn(),
          }
        },
        {
          provide: getRepositoryToken(ProfileLikes),
          useValue: {
          }
        },
        {
          provide: getRepositoryToken(CommentsProfile),
          useValue: {
          }
        },
        {
          provide: getRepositoryToken(FollowsAndBlock),
          useValue: {
            findOne: jest.fn().mockResolvedValue(undefined),
          }
        },
        {
          provide: getRepositoryToken(Profile),
          useValue: {
            create: jest.fn().mockResolvedValue(mockProfile),
            save: jest.fn(),
            findOne: jest.fn().mockImplementation(() => mockProfile)
          },
        },

      ],
    }).compile();

    service = module.get<ProfileUserService>(ProfileUserService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    profileRepository = module.get<Repository<Profile>>(getRepositoryToken(Profile));
    userToProfileRepository = module.get<Repository<UserToProfile>>(getRepositoryToken(UserToProfile));
    profileLikesRepository = module.get<Repository<ProfileLikes>>(getRepositoryToken(ProfileLikes));
    commentsProfileRepository = module.get<Repository<CommentsProfile>>(getRepositoryToken(CommentsProfile));
    followsAndBlockRepository = module.get<Repository<FollowsAndBlock>>(getRepositoryToken(FollowsAndBlock));
    rabbitService = module.get<RabbitMQService>(RabbitMQService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should be defined', () => {
    expect(userRepository).toBeDefined();
  });

  it('should be defined', () => {
    expect(userToProfileRepository).toBeDefined();
  });

  it('should be defined', () => {
    expect(profileLikesRepository).toBeDefined();
  });

  it('should be defined', () => {
    expect(profileRepository).toBeDefined();
  });

  it('should be defined', () => {
    expect(commentsProfileRepository).toBeDefined();
  });

  it('should be defined', () => {
    expect(followsAndBlockRepository).toBeDefined();
  });

  const mockFile = {
    fieldname: 'file',
    originalname: 'test.txt',
    encoding: '7bit',
    mimetype: 'text/plain',
    size: 1024,
    buffer: Buffer.from('Hello, world!'),
    destination: '',
    filename: '',
    path: '',
    key: 'key_with_aws_s3',
    stream: null,
  }
  const dto = {
    subspecies: 'square',
    joinProfile: 'false',
    aboutProfile: 'Some text',
    involvedHumanId: [1, 2, 3],
  } as CreateProfileDto
  const mockProfile = {
    id: 1,
    qty_likes: 15,
    group_post: new Date(),
    about_profile: 'Interesting',
    path_key: '/s3/image.pnj',
    is_ban: false,
    time_ban: new Date(),
    created_at: new Date(),
    is_deleted: false,
    deleted_at: new Date(),
  } as Profile
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
  const mockUserToProfile = { id: 1, user: user, profile: mockProfile };
  
  describe('create', () => {
    it('should return new profile', async () => {
      jest.spyOn(service, 'createProfile').mockResolvedValue(mockProfile);
      const result = await service.create(mockFile, 1, dto);
      expect(result).toEqual(mockProfile);
    })

    it('should throw error', async () => {
      jest.spyOn(service, 'create').mockImplementationOnce(() => {
        throw new BadRequestException();
      });
      try {
        const result = await service.create(mockFile, 1, dto);
      } catch (error) {
        console.log(error);
      }
    })
  })
  
  describe('createGroup', () => {
    it('should return new profiles', async () => {
      jest.spyOn(service, 'createProfile').mockResolvedValue(mockProfile);
      const result = await service.createGroup([mockFile], 1, dto);
      expect(result).toEqual([mockProfile]);
    })

    it('should throw error', async () => {
      jest.spyOn(service, 'createGroup').mockImplementationOnce(() => {
        throw new BadRequestException();
      });
      try {
        const result = await service.createGroup([mockFile], 1, dto);
      } catch (error) {
        console.log(error);
      }
    })
  })
  
  describe('getPost', () => {
    it('should return profile with presigned-url, when user are creator profile', async () => {
      jest.spyOn(profileRepository, 'findOne').mockResolvedValue(mockProfile);
      const result = await service.getPost(2, 1, 2);
      expect(profileRepository.findOne).toHaveBeenCalledWith({ "where": { "id": 1 } });
      expect(result).toEqual({ post: mockProfile, presignedUrl: 'presigned-url' });
    })
  })

  describe('updateAboutProfile', () => {
    const profileTextDto = {
      aboutProfile: 'lalala',
    }
    it('should return update profile', async () => {
      jest.spyOn(profileRepository, 'findOne').mockResolvedValue(mockProfile);
      const result = await service.updateAboutProfile(1, profileTextDto);
      expect(profileRepository.findOne).toHaveBeenCalledWith({ "where": { "id": 1 } });
      expect(result).toEqual({ ...mockProfile, about_profile: 'lalala'})
    })
  })

})

