import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Inject,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { Request } from 'express';

/**
 * EJEMPLO: Guard de Autenticación para Microservicios
 *
 * Este guard se puede usar en cualquier microservicio que necesite validar
 * que el usuario esté autenticado contra el auth-ms.
 *
 * Copiar este archivo en: src/auth/guards/auth.guard.ts
 *
 * Uso en controlador:
 * @UseGuards(AuthGuard)
 * @Post('crear')
 * async crear(@Req() req: Request & { user: any }) {
 *   // req.user contiene: userId, email, role, name
 * }
 */
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(@Inject('NatsService') private readonly client: ClientProxy) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('Token no proporcionado');
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      throw new UnauthorizedException('Formato de token inválido');
    }

    const token = parts[1];

    try {
      // Hacer llamada al auth-ms para verificar token
      // Esto usa una variable de entorno que apunta a la URL del auth microservicio
      // O se puede usar NATS directamente si está configurado
      const response = await firstValueFrom(
        this.client.send('auth.token.verify', { token })
      );

      if (!response.success) {
        throw new UnauthorizedException(response.message);
      }

      // Agregar datos del usuario al request
      request.user = response.data;

      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Token inválido o expirado');
    }
  }
}
