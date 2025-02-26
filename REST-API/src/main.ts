import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { ConfigService } from '@nestjs/config';
import { logger } from './logger.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  const configService = app.get(ConfigService);
  const port = configService.get<number>('port');
  await app.listen(port || 3000, () => logger.info(`Server in port - "${port || 3000}"`));
}
bootstrap();
