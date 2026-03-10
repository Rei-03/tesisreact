export class RegisterDto {
  email: string;
  name: string;
  password: string;
  role?: string = 'user';
}
