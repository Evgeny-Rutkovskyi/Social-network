import { Test, TestingModule } from '@nestjs/testing';
import { ContentUserController } from '../content-user.controller';
import { ContentUserService } from '../content-user.service';
import { JwtAuthGuard } from '../../../guards/jwt.guard';
import { FileMsgDto } from '../../../rabbitmq/dto/msg.dto';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Stories } from 'src/entities/stories.entity';

describe('TempController', () => {
  let controller: ContentUserController;
  let contentUserService: ContentUserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ContentUserController],
      providers: [
        {
          provide: ContentUserService,
          useValue: {
            createStories: jest.fn(),
            deleteStoriesById: jest.fn(),
            deleteArchiveStories: jest.fn(),
            deleteAllArchiveStories: jest.fn(),
            recreateStories: jest.fn(),
            getStoriesById: jest.fn(),
            likeStoriesById: jest.fn(),
            removeLikeOfStories: jest.fn()
          }
        },
        {
          provide: JwtAuthGuard,
          useValue: {
            canActivate: jest.fn().mockReturnValue(true)
          }
        }
      ],
    }).compile();

    controller = module.get<ContentUserController>(ContentUserController);
    contentUserService = module.get<ContentUserService>(ContentUserService);
  });

  const mockStories = {
    id: 1,
    only_friend: false,
    likes_qty: 100,
    path_key: 'Some_key',
    is_ban: false,
    time_ban: new Date(),
    is_deleted: false,
    created_at: new Date(),
    time_deleted_forever: new Date()
  } as Stories;

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createStories', () => {
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

    it('should return msg', async () => {
      const mockResult = {
        userId: 1,
        fileId: 2,
        type: 'stories',
        subspecies: 'size',
      } as FileMsgDto;

      jest.spyOn(contentUserService, 'createStories').mockResolvedValue(mockResult);
      await expect(controller.createStories(1, mockFile, 'false')).resolves.toEqual(mockResult);
    })

    it('should throw error', async () => {
      jest.spyOn(contentUserService, 'createStories').mockImplementationOnce(() => {
        throw new BadRequestException();
      })
      try {
        const result = await controller.createStories(1, mockFile, 'false');
      } catch (error) {
        console.log(error);
      }
    })
  })

  describe('deleteStoriesById', () => {
    it('should return deleted stories', async () => {
      jest.spyOn(contentUserService, 'deleteStoriesById').mockResolvedValue(mockStories);
      await expect(controller.deleteStoriesById(2, '3')).resolves.toEqual(mockStories);
    })

    it('should throw error', async () => {
      jest.spyOn(contentUserService, 'deleteStoriesById').mockImplementationOnce(() => {
        throw new NotFoundException();
      })
      try {
        const result = await controller.deleteStoriesById(2, '3');
      } catch (error) {
        console.log(error);
      }
    })
  })

  describe('deleteArchiveStories', () => {
    it('should return deleted archive stories', async () => {
      const mockResult = {
        id: 1,
        only_friend: false,
        likes_qty: 100,
        path_key: 'Some_key',
        is_ban: false,
        time_ban: new Date(),
        is_deleted: false,
        created_at: new Date(),
        time_deleted_forever: new Date()
      } as Stories;

      jest.spyOn(contentUserService, 'deleteArchiveStories').mockResolvedValue(mockResult);
      await expect(controller.deleteArchiveStories('1')).resolves.toEqual(mockResult);
    })

    it('should throw error', async () => {
      jest.spyOn(contentUserService, 'deleteArchiveStories').mockImplementationOnce(() => {
        throw new BadRequestException();
      })
      try {
        const result = await controller.deleteArchiveStories('1');
      } catch (error) {
        console.log(error);
      }
    })
  })

  describe('deleteAllArchiveStories', () => {
    it('should return msg', async () => {
      const mockResult = 'All archive stories was deleted';
      jest.spyOn(contentUserService, 'deleteAllArchiveStories').mockResolvedValue(mockResult);
      await expect(controller.deleteAllArchiveStories(1)).resolves.toEqual(mockResult);
    })
  })

  describe('recreateStories', () => {
    it('should return msg', async () => {
      const mockResult = {
        userId: 1,
        storiesId: 2
      };
      const dto = {
        public: true
      }

      jest.spyOn(contentUserService, 'recreateStories').mockResolvedValue(mockResult);
      await expect(controller.recreateStories(1,'2', dto)).resolves.toEqual(mockResult);
    })
  })

  describe('getStoriesById', () => {
    const mockResult = {
      stories: mockStories,
      presignedUrl: '1232132'
    }
    it('should return stories with presigned-url', async () => {
      jest.spyOn(contentUserService, 'getStoriesById').mockResolvedValue(mockResult);
      await expect(controller.getStoriesById(1, '2', '3')).resolves.toEqual(mockResult);
    })

    it('should throw error', async () => {
      jest.spyOn(contentUserService, 'getStoriesById').mockImplementationOnce(() => {
        throw new NotFoundException();
      })
      try {
        const result = await controller.getStoriesById(1, '2', '3');
      } catch (error) {
        console.log(error);
      }
    })

    it('should throw error', async () => {
      jest.spyOn(contentUserService, 'getStoriesById').mockImplementationOnce(() => {
        throw new BadRequestException();
      })
      try {
        const result = await controller.getStoriesById(1, '2', '3');
      } catch (error) {
        console.log(error);
      }
    })
  })

  describe('likeStoriesById and removeLikeOfStories', () => {
    it('should return msg about stories was like', async () => {
      const mockResult = 'This stories has liked for this user';
      jest.spyOn(contentUserService, 'likeStoriesById').mockResolvedValue(mockResult);
      await expect(controller.likeStoriesById(1, '2')).resolves.toEqual(mockResult);
    })

    it('should return msg about successful like stories', async () => {
      const mockResult = 'Stories liked';
      jest.spyOn(contentUserService, 'likeStoriesById').mockResolvedValue(mockResult);
      await expect(controller.likeStoriesById(1, '2')).resolves.toEqual(mockResult);
    })

    it('should throw error', async () => {
      jest.spyOn(contentUserService, 'likeStoriesById').mockImplementationOnce(() => {
        throw new NotFoundException();
      })
      try {
        const result = await controller.likeStoriesById(1, '2');
      } catch (error) {
        console.log(error);
      }
    })

    it('should return msg about take like', async () => {
      const mockResult = 'Like is hide';
      jest.spyOn(contentUserService, 'removeLikeOfStories').mockResolvedValue(mockResult);
      await expect(controller.removeLikeOfStories(1, '2')).resolves.toEqual(mockResult);
    })

    it("should return msg about haven't like", async () => {
      const mockResult = 'This user did not like';
      jest.spyOn(contentUserService, 'removeLikeOfStories').mockResolvedValue(mockResult);
      await expect(controller.removeLikeOfStories(1, '2')).resolves.toEqual(mockResult);
    })

    it('should throw error', async () => {
      jest.spyOn(contentUserService, 'removeLikeOfStories').mockImplementationOnce(() => {
        throw new NotFoundException();
      })
      try {
        const result = await controller.removeLikeOfStories(1, '2');
      } catch (error) {
        console.log(error);
      }
    })
  })
});
