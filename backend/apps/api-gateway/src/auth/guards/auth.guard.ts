import {
  Injectable,
  CanActivate,
  ExecutionContext,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RolesGuard } from './roles.guard';

/**
 * Guard global inteligente para autenticación
 *
 * Flujo:
 * 1. Verifica si la ruta está marcada con @Public()
 * 2. Si es pública, permite el acceso sin autenticación
 * 3. Si no es pública, aplica JwtAuthGuard
 * 4. Si hay metadata 'roles', también aplica RolesGuard
 *
 * Se registra como APP_GUARD en AuthModule
 */
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private jwtAuthGuard: JwtAuthGuard,
    private rolesGuard: RolesGuard,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 1️⃣ Verificar si la ruta está marcada como @Public()
    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      // Ruta pública, permitir acceso
      return true;
    }

    // 2️⃣ Si no es pública, validar JWT
    try {
      const jwtValid = await this.jwtAuthGuard.canActivate(context);
      if (!jwtValid) {
        return false;
      }
    } catch (error) {
      // Si JwtAuthGuard lanza error, dejar que se propague
      throw error;
    }

    // 3️⃣ Verificar si hay roles requeridos
    const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (requiredRoles && requiredRoles.length > 0) {
      // Si hay roles requeridos, validar con RolesGuard
      try {
        return await this.rolesGuard.canActivate(context);
      } catch (error) {
        throw error;
      }
    }

    return true;
  }
}
