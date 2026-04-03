import { UseGuards, SetMetadata } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RolesGuard } from './roles.guard';
import { UserRole } from '../../auth/dto/user-role.enum';

/**
 * Decorador personalizado para proteger endpoints
 *
 * Usa el JwtAuthGuard para validar el token JWT
 *
 * Ejemplo:
 * @RequireAuth()
 * @Post('protected')
 * async protectedEndpoint(@Req() req: Request) {
 *   // req.user contiene los datos validados del usuario
 * }
 */
export const RequireAuth = () => UseGuards(JwtAuthGuard);

/**
 * Decorador para proteger endpoints con validación de roles
 *
 * Usa tanto JwtAuthGuard como RolesGuard para validar token y rol
 *
 * Ejemplo:
 * @Roles(UserRole.ADMIN)
 * @Post('admin-only')
 * async adminOnlyEndpoint(@Req() req: Request) {
 *   // Solo accessible para usuarios con rol ADMIN
 * }
 */
export const Roles = (...roles: UserRole[]) => {
  return (target: any, propertyKey?: string, descriptor?: PropertyDescriptor) => {
    SetMetadata('roles', roles)(target, propertyKey, descriptor);
    UseGuards(JwtAuthGuard, RolesGuard)(target, propertyKey, descriptor);
  };
};
