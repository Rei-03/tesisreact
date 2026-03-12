import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { RpcExceptionFilter } from '@une/ms-common/filters';
import { env } from './config/env';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.NATS,
      options: {
        servers: env.NATS_URLS,
      },
    },
  );
  app.useGlobalFilters(new RpcExceptionFilter());
  await app.listen();
}
bootstrap();
