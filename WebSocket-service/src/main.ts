import { NestFactory } from '@nestjs/core';
import {MicroserviceOptions, Transport} from '@nestjs/microservices'
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const port = configService.get<number>('port');
  const microservice = app.connectMicroservice<MicroserviceOptions>(
    {
      transport: Transport.RMQ,
      options: {
        urls: [configService.get<string>('rmq_url')],
        queue: configService.get<string>('queue_name'),
        queueOptions: {
          durable: true,
        }
      }
    }
  )

  await app.startAllMicroservices();
  await app.listen(port || 3001, () => console.log(`WebSocket-service run on port - ${port || 3001}`));
}
bootstrap();
