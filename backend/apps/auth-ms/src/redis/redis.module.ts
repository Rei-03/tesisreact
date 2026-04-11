import { Module } from '@nestjs/common';
import { createClient } from 'redis';
import { env } from '../config/env';

export type RedisClient = ReturnType<typeof createClient>;

@Module({
  providers: [
    {
      provide: 'REDIS_CLIENT',
      useFactory: async () => {
        const client = createClient({
          host: env.REDIS_HOST,
          port: env.REDIS_PORT,
        } as any);

        client.on('error', (err) => {
          console.error('Redis Client Error', err);
        });

        client.on('connect', () => {
          console.log('Connected to Redis');
        });

        await client.connect();

        return client;
      },
    },
  ],
  exports: ['REDIS_CLIENT'],
})
export class RedisModule {}
