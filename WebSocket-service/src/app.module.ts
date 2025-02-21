import { Module } from '@nestjs/common';
import { UsersModule } from './users/user.module';
import {MongooseModule} from '@nestjs/mongoose'
import { ChatModule } from './gateway/chat.module';
import { TempAuthModule } from './temporarily-auth-module/temp.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import config from './configuration/config';

@Module({
  imports: [UsersModule, 
    ChatModule, TempAuthModule, ConfigModule.forRoot({
      load: [config],
      isGlobal: true
    }), MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('mongo_db_url')
      })
    }) 
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
