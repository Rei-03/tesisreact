import { Module } from '@nestjs/common';
import { Redis } from 'ioredis';
import { env } from '../config/env';

/**
 * Redis Module for API Gateway
 *
 * Provides a Redis client for caching and token blacklist
 * Used by JwtAuthGuard for fast token validation
 */
export type RedisClient = Redis;

@Module({
  providers: [
    {
      provide: 'REDIS_CLIENT',
      useFactory: () => {
        return new Redis({
          host: env.REDIS_HOST,
          port: env.REDIS_PORT,
          retryStrategy: (times: number) => {
            const delay = Math.min(times * 50, 2000);
            return delay;
          },
          enableReadyCheck: false,
          maxRetriesPerRequest: null,
        });
      },
    },
  ],
  exports: ['REDIS_CLIENT'],
})
export class RedisModule {}
