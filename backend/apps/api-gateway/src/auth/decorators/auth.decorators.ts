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
 * @Roles(UserRole.ADMIN, UserRole.SUPERVISOR)
 * @Post('admin-only')
 * async adminOnlyEndpoint(@Req() req: Request) {
 *   // Solo accessible para usuarios con rol ADMIN o SUPERVISOR
 * }
 */
export const Roles = (...roles: UserRole[]) => SetMetadata('roles', roles);
