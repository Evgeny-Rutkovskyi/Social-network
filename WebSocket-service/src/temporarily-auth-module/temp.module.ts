import { Module } from "@nestjs/common";
import { JwtStrategy } from "./jwt.strategy";
import {JwtModule} from '@nestjs/jwt'
import { ConfigService } from "@nestjs/config";


@Module({
    imports: [JwtModule.registerAsync({
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          secret: configService.get<string>('jwt_secret'),
          signOptions: {expiresIn: '30d'}
        })
    })],
    providers: [JwtStrategy]
    
})
export class TempAuthModule {}