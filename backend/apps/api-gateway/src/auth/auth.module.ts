import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { JwtAuthGuard, RolesGuard } from './guards';
import { RedisModule } from '../redis/redis.module';
import { env } from '../config/env';

@Module({
  imports: [
    // JWT para validar tokens localmente
    JwtModule.register({
      secret: env.JWT_SECRET,
      signOptions: { expiresIn: '24h' }, // No se usa aquí, solo para verificación
    }),
    // Redis para blacklist
    RedisModule,
  ],
  controllers: [AuthController],
  providers: [JwtAuthGuard, RolesGuard],
  exports: [JwtAuthGuard, RolesGuard],
})
export class AuthModule {}
