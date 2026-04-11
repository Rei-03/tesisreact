import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyTokenDto } from './dto/verify-token.dto';
import { LogoutDto } from './dto/logout.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern('auth.findAll')
  async findAll(@Payload() payload: { page?: number; pageSize?: number }) {
    const page = payload?.page || 1;
    const pageSize = payload?.pageSize || 20;
    const skip = (page - 1) * pageSize;
    const take = pageSize;
    return this.authService.findAll(take, skip);
  }

  @MessagePattern('auth.register')
  async register(@Payload() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @MessagePattern('auth.login')
  async login(@Payload() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @MessagePattern('auth.logout')
  async logout(@Payload() logoutDto: LogoutDto) {
    return this.authService.logout(logoutDto);
  }

  @MessagePattern('auth.token.verify')
  async verifyToken(@Payload() verifyTokenDto: VerifyTokenDto) {
    return this.authService.verifyToken(verifyTokenDto);
  }

  @MessagePattern('auth.token.refresh')
  async refreshToken(@Payload() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshToken(refreshTokenDto);
  }
}
