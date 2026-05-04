import { IsEmail, IsString, IsEnum, MinLength } from 'class-validator';
import { UserRole } from '../entities/user.entity';

export class RegisterDto {
  @IsEmail({}, { message: 'El email debe ser válido' })
  email!: string;

  @IsString({ message: 'El nombre debe ser un texto' })
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  name!: string;

  @IsString({ message: 'La contraseña debe ser un texto' })
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password!: string;

  @IsEnum(UserRole, { message: 'El rol debe ser uno de: admin, supervisor, operador, user' })
  role?: UserRole = UserRole.USER;
}
