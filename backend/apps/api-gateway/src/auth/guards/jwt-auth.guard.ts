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
 * JWT Authentication Guard - Local + Redis + httpOnly Cookies
 *
 * Valida JWT localmente sin llamar a auth-ms:
 * 1. Busca token en cookies (httpOnly) primero
 * 2. Si no lo encuentra, busca en Authorization header (fallback)
 * 3. Verifica firma JWT (localmente)
 * 4. Verifica si token está en blacklist Redis (logout)
 * 5. Extrae datos del usuario del token
 *
 * Ventajas:
 * - Super rápido (no hay overhead de NATS)
 * - Logout inmediato (Redis blacklist)
 * - Cookies httpOnly protegidas contra XSS
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
    let token: string | null = null;

    // 1️⃣ Intentar obtener token de la cookie httpOnly (prioritario)
    if (request.cookies?.accessToken) {
      token = request.cookies.accessToken;
    }
    // 2️⃣ Fallback: Intentar obtener token del header Authorization
    else if (request.headers.authorization) {
      const authHeader = request.headers.authorization;
      const parts = authHeader.split(' ');
      
      if (parts.length === 2 && parts[0] === 'Bearer') {
        token = parts[1];
      }
    }

    // Si no hay token en ningún lugar, lanzar error
    if (!token) {
      throw new UnauthorizedException('Token no proporcionado');
    }

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
