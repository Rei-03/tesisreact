import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../dto/user-role.enum';

/**
 * Decorador para marcar rutas como públicas (sin autenticación)
 *
 * Ejemplo:
 * @Public()
 * @Post('login')
 * async login(@Body() credentials: LoginDto) {
 *   // No requiere JWT
 * }
 */
export const Public = () => SetMetadata('isPublic', true);

/**
 * Decorador para especificar roles requeridos en una ruta
 *
 * El guard (aplicado globalmente) verificará estos roles
 *
 * Ejemplo:
 * @Roles(UserRole.ADMIN, UserRole.OPERADOR)
 * @Post('admin-only')
 * async adminOnlyEndpoint(@Req() req: Request) {
 *   // Solo accesible para usuarios con rol ADMIN u OPERADOR
 * }
 */
export const Roles = (...roles: UserRole[]) => SetMetadata('roles', roles);
