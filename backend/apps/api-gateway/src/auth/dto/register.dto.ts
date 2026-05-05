import { IsEmail, IsString, IsEnum, MinLength } from 'class-validator';
import { UserRole } from './user-role.enum';

export class RegisterDto {
  @IsEmail({}, { message: 'El email debe ser válido' })
  email: string;

  @IsString()
  @MinLength(2)
  name: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsEnum(UserRole, { message: `El rol debe ser uno de: ${Object.values(UserRole).join(', ')}` })
  role?: UserRole = UserRole.OPERADOR;
}
