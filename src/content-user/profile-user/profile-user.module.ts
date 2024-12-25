import { Module } from '@nestjs/common';
import { ProfileUserService } from './profile-user.service';
import { ProfileUserController } from './profile-user.controller';

@Module({
  providers: [ProfileUserService],
  controllers: [ProfileUserController]
})
export class ProfileUserModule {}
