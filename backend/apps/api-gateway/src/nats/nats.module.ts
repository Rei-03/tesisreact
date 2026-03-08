import { Global, Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { env } from '../config/env';

@Global()
@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'NatsService',
        transport: Transport.NATS,
        options: {
          servers: env.NATS_URLS,
        },
      },
    ]),
  ],
  exports: [ClientsModule],
})
export class NatsModule {}
