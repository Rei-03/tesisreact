import { UserRole } from '../entities/user.entity';

export class RegisterDto {
  email: string;
  name: string;
  password: string;
  role?: UserRole = UserRole.USER;
}
