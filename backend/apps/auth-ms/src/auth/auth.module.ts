import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import type { JwtSignOptions } from '@nestjs/jwt';
import { User } from './entities/user.entity';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { env } from '../config/env';
import { RedisModule } from '../redis/redis.module';

const jwtSignOptions: JwtSignOptions = {
  expiresIn: env.JWT_EXPIRES_IN as any,
};

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    JwtModule.register({
      secret: env.JWT_SECRET,
      signOptions: jwtSignOptions,
    }),
    RedisModule,
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
