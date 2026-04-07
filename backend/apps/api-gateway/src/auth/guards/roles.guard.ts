import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';

/**
 * Roles Guard
 *
 * Valida que el usuario autenticado tenga uno de los roles requeridos
 *
 * Se usa en combinación con el decorador @Roles y @SetMetadata
 *
 * Uso:
 * @Roles(UserRole.ADMIN)
 * async onlyAdmins() { ... }
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>(
      'roles',
      context.getHandler(),
    );

    // Si no hay roles requeridos, permitir acceso
    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request & { user: any }>();
    const userRole = request.user?.role;

    // Validar que el usuario tenga uno de los roles requeridos
    if (!userRole || !requiredRoles.includes(userRole)) {
      throw new ForbiddenException(
        `Acceso denegado. Se requiere uno de estos roles: ${requiredRoles.join(', ')}`,
      );
    }

    return true;
  }
}
