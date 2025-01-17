import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FollowsAndBlock } from 'src/entities/followsAndBlock.entity';
import { User } from 'src/entities/user.entity';
import { UserService } from './user.service';
import { UserController } from './user.controller';

@Module({
    imports: [TypeOrmModule.forFeature([FollowsAndBlock, User])],
    providers: [UserService],
    controllers: [UserController]
})
export class UserModule {
}
