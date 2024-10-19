import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { ContentUserModule } from './content-user/content-user.module';
import { RoleModule } from './role/role.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import config from './configuration/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { S3Service } from './s3/s3.service';
import { S3Module } from './s3/s3.module';
import { Token } from './auth/token.entity';
import { User } from './auth/user.entity';

@Module({
  imports: [UserModule, AuthModule, ContentUserModule, RoleModule, ConfigModule.forRoot({
    load: [config],
    isGlobal: true
  }), TypeOrmModule.forRootAsync({
    inject: [ConfigService],
    useFactory: async (configService: ConfigService) => ({
      type: 'postgres',
      host: configService.get('host_db'),
      port: configService.get('port_db'),
      username: configService.get('username_db'),
      password: configService.get('password_db'),
      database: configService.get('name_db'),
      entities: [Token, User],
      synchronize: true, // only dev
  }),
  }), S3Module],
  controllers: [],
  providers: [S3Service],
})
export class AppModule {}