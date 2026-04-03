import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Inject,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import type { Redis } from 'ioredis';

/**
 * JWT Authentication Guard - Local + Redis
 *
 * Valida JWT localmente sin llamar a auth-ms:
 * 1. Verifica firma JWT (localmente)
 * 2. Verifica si token está en blacklist Redis (logout)
 * 3. Extrae datos del usuario del token
 *
 * Ventajas:
 * - Super rápido (no hay overhead de NATS)
 * - Logout inmediato (Redis blacklist)
 * - Escalable horizontalmente
 *
 * Uso:
 * @UseGuards(JwtAuthGuard)
 * async someEndpoint(@Req() req: Request) {
 *   // req.user contiene: { userId, email, role, name }
 * }
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers.authorization;

    // Validar que el header Authorization esté presente
    if (!authHeader) {
      throw new UnauthorizedException('Token no proporcionado');
    }

    // Extraer el token del formato "Bearer <token>"
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      throw new UnauthorizedException('Formato de token inválido');
    }

    const token = parts[1];

    try {
      // 1️⃣ Verificar firma JWT localmente (muy rápido)
      const payload = this.jwtService.verify<{
        sub: string;
        email: string;
        role: string;
        name?: string;
        iat?: number;
        exp?: number;
      }>(token);

      // 2️⃣ Verificar si el token está en la blacklist (logout)
      // La blacklist solo contiene tokens revocados
      const isBlacklisted = await this.redis.exists(
        `blacklist:${token}`
      );

      if (isBlacklisted) {
        throw new UnauthorizedException('Token revocado');
      }

      // 3️⃣ Token válido - agregar datos del usuario al request
      // Estos datos vienen del JWT mismo (ya validado)
      request.user = {
        userId: payload.sub,
        email: payload.email,
        role: payload.role,
        name: payload.name,
      };

      return true;
    } catch (error) {
      // Si es UnauthorizedException, dejar pasar
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      // JWT inválido, expirado, o no se puede verificar
      throw new UnauthorizedException('Token inválido o expirado');
    }
  }
}
