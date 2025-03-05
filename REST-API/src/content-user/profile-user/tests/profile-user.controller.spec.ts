import { Test, TestingModule } from '@nestjs/testing';
import { ProfileUserController } from '../profile-user.controller';
import { ProfileUserService } from '../profile-user.service';
import { JwtAuthGuard } from '../../../guards/jwt.guard';
import { Profile } from '../../../entities/profile.entity';
import { CreateProfileDto } from '../../dto/createProfile.dto';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { User } from 'src/entities/user.entity';
import { ProfileLikes } from 'src/entities/profileLikes.entity';
import { CommentsProfile } from 'src/entities/commentsProfile.entity';

describe('TempController', () => {
  let controller: ProfileUserController;
  let profileUserService: ProfileUserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProfileUserController],
      providers: [
      {
        provide: ProfileUserService,
        useValue: {
          create: jest.fn(),
          createGroup: jest.fn(),
          getPost: jest.fn(),
          deleteProfile: jest.fn(),
          deleteGroupProfile: jest.fn(),
          updateAboutProfile: jest.fn(),
          restoreProfile: jest.fn(),
          likeProfile: jest.fn(),
          deleteLikeProfile: jest.fn(),
          createComment: jest.fn(),
          deleteComment: jest.fn(),
          deleteLikeComment: jest.fn(),
          likeComment: jest.fn()
        }
      },
      {
        provide: JwtAuthGuard,
        useValue: {
          canActivate: jest.fn().mockReturnValue(true),
        }
      }],
    }).compile();

    controller = module.get<ProfileUserController>(ProfileUserController);
    profileUserService = module.get<ProfileUserService>(ProfileUserService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

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
  
  describe('createProfile and createManyProfile', () => {
    const dto = {
      subspecies: 'square',
      joinProfile: 'true',
      aboutProfile: 'Some text',
      involvedHumanId: [1, 2, 3],
    } as CreateProfileDto
    const mockFile: Express.Multer.File = {
      fieldname: 'file',
      originalname: 'test.txt',
      encoding: '7bit',
      mimetype: 'text/plain',
      size: 1024,
      buffer: Buffer.from('Hello, world!'),
      destination: '',
      filename: '',
      path: '',
      stream: null,
    };

    describe('createProfile', () => {
      it('should return created profile', async () => {
        jest.spyOn(profileUserService, 'create').mockResolvedValue(mockProfile);
        await expect(controller.createProfile(mockFile, 1, dto)).resolves.toEqual(mockProfile);
      })
  
      it('should throw error', async () => {
        jest.spyOn(profileUserService, 'create').mockImplementationOnce(() => {
          throw new BadRequestException();
        });
        try {
          const result = await controller.createProfile(mockFile, 1, dto);
        } catch (error) {
          console.log(error);
        }
      })
    })
  
    describe('createManyProfile', () => {
      it('should return array with info files', async () => {
        jest.spyOn(profileUserService, 'createGroup').mockResolvedValue([mockProfile]);
        await expect(controller.createManyProfile([mockFile], 1, dto)).resolves.toEqual([mockProfile]);
      })
  
      it('should throw error', async () => {
        jest.spyOn(profileUserService, 'createGroup').mockImplementationOnce(() => {
          throw new BadRequestException();
        });
        try {
          const result = await controller.createManyProfile([mockFile], 1, dto);
        } catch (error) {
          console.log(error);
        }
      })
    })
  })

  describe('getPost', () => {
    const mockResult = {
      post: mockProfile,
      presignedUrl: 'presignedUrl'
    }

    it('should return post by id', async () => {
      jest.spyOn(profileUserService, 'getPost').mockResolvedValue(mockResult);
      await expect(controller.getPost(1, '2', '3')).resolves.toEqual(mockResult);
    })

    it('should throw error', async () => {
      jest.spyOn(profileUserService, 'getPost').mockImplementationOnce(() => {
        throw new BadRequestException();
      });
      try {
        const result = await controller.getPost(1, '2', '3');
      } catch (error) {
        console.log(error);
      }
    })

    it('should throw error', async () => {
      jest.spyOn(profileUserService, 'getPost').mockImplementationOnce(() => {
        throw new NotFoundException();
      });
      try {
        const result = await controller.getPost(1, '2', '3');
      } catch (error) {
        console.log(error);
      }
    })
  })

  describe('deleteProfile and deleteGroupProfile', () => {
    it('should return deleted post', async () => {
      jest.spyOn(profileUserService, 'deleteProfile').mockResolvedValue(mockProfile);
      await expect(controller.deleteProfile('1')).resolves.toEqual(mockProfile);
    })

    it('should throw error', async () => {
      jest.spyOn(profileUserService, 'deleteProfile').mockImplementationOnce(() => {
        throw new NotFoundException();
      });
      try {
        const result = await controller.deleteProfile('1');
      } catch (error) {
        console.log(error);
      }
    })

    it('should return deleted posts', async () => {
      jest.spyOn(profileUserService, 'deleteGroupProfile').mockResolvedValue([mockProfile]);
      await expect(controller.deleteGroupProfile('group_1')).resolves.toEqual([mockProfile]);
    })

    it('should throw error', async () => {
      jest.spyOn(profileUserService, 'deleteGroupProfile').mockImplementationOnce(() => {
        throw new NotFoundException();
      });
      try {
        const result = await controller.deleteGroupProfile('group_1');
      } catch (error) {
        console.log(error);
      }
    })
  })

  describe('updateAboutProfile', () => {
    const dto = {
      aboutProfile: "Some interesting test"
    }

    it('should return updated profile', async () => {
      jest.spyOn(profileUserService, 'updateAboutProfile').mockResolvedValue(mockProfile);
      await expect(controller.updateAboutProfile('1', dto)).resolves.toEqual(mockProfile);
    })

    it('should throw error', async () => {
      jest.spyOn(profileUserService, 'updateAboutProfile').mockImplementationOnce(() => {
        throw new NotFoundException();
      });
      try {
        const result = await controller.updateAboutProfile('1', dto);
      } catch (error) {
        console.log(error);
      }
    })
  })

  describe('restoreProfileWithinTemporarilyEntity', () => {
    it('should return restore post', async () => {
      jest.spyOn(profileUserService, 'restoreProfile').mockResolvedValue(mockProfile);
      await expect(controller.restoreProfileWithinTemporarilyEntity('1')).resolves.toEqual(mockProfile);
    })

    it('should throw error', async () => {
      jest.spyOn(profileUserService, 'restoreProfile').mockImplementationOnce(() => {
        throw new NotFoundException();
      });
      try {
        const result = await controller.restoreProfileWithinTemporarilyEntity('1');
      } catch (error) {
        console.log(error);
      }
    })
  })

  describe('likeProfile and deleteLikeProfile', () => {
    const mockLike = {
      id: 1,
      user: jest.fn() as unknown as User,
      profile: jest.fn() as unknown as Profile
    } as ProfileLikes

    it('should return new like', async () => {
      jest.spyOn(profileUserService, 'likeProfile').mockResolvedValue(mockLike);
      await expect(controller.likeProfile(1, '2')).resolves.toEqual(mockLike);
    })

    it('should throw error', async () => {
      jest.spyOn(profileUserService, 'likeProfile').mockImplementationOnce(() => {
        throw new NotFoundException();
      });
      try {
        const result = await controller.likeProfile(1, '2');
      } catch (error) {
        console.log(error);
      }
    })

    it('should return text about deleted like', async () => {
      const mockResult = 'Delete was success';
      jest.spyOn(profileUserService, 'deleteLikeProfile').mockResolvedValue(mockResult);
      await expect(controller.deleteLikeProfile(1, '2')).resolves.toEqual(mockResult);
    })

    it('should throw error', async () => {
      jest.spyOn(profileUserService, 'deleteLikeProfile').mockImplementationOnce(() => {
        throw new NotFoundException();
      });
      try {
        const result = await controller.deleteLikeProfile(1, '2');
      } catch (error) {
        console.log(error);
      }
    })
  })

  describe('createComment and deleteComment', () => {
    const dto = {
      message: 'This comment very clever',
      enclosedComment: 1, 
    }
    const mockComment = {
      id: 3,
      parentId: 2,
      comment: "Some comment",
      likes_qty: 6,
      created_at: new Date(),
      deleted_with_profile: false,
      is_ban: false,
      time_ban: new Date(),
    } as CommentsProfile

    it('should return new comment', async () => {
      jest.spyOn(profileUserService, 'createComment').mockResolvedValue(mockComment);
      await expect(controller.createComment(1, '2', dto)).resolves.toEqual(mockComment);
    })

    it('should throw error', async () => {
      jest.spyOn(profileUserService, 'createComment').mockImplementationOnce(() => {
        throw new NotFoundException();
      });
      try {
        const result = await controller.createComment(1, '2', dto);
      } catch (error) {
        console.log(error);
      }
    })

    it('should return deleted comment', async () => {
      const mockResult = 'Delete was success';
      jest.spyOn(profileUserService, 'deleteComment').mockResolvedValue(mockResult);
      await expect(controller.deleteComment('1')).resolves.toEqual(mockResult);
    })

    describe('likeComment and deleteLikeComment', () => {
      it('should return comment with new like', async () => {
        jest.spyOn(profileUserService, 'likeComment').mockResolvedValue(mockComment);
        await expect(controller.likeComment('1')).resolves.toEqual(mockComment);
      })

      it('should return comment without one like', async () => {
        jest.spyOn(profileUserService, 'deleteLikeComment').mockResolvedValue(mockComment);
        await expect(controller.deleteLikeComment('1')).resolves.toEqual(mockComment);
      })

      it("should return message about haven't any like ", async () => {
        const mockResult = "Comment doesn't have likes";
        jest.spyOn(profileUserService, 'deleteLikeComment').mockResolvedValue(mockResult);
        await expect(controller.deleteLikeComment('1')).resolves.toEqual(mockResult);
      })
    })
  })
});
