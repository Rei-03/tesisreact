import { Controller, Post, Body, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import {
  RegisterDto,
  LoginDto,
  LogoutDto,
  VerifyTokenDto,
  RefreshTokenDto,
} from './dto';

@Controller('auth')
export class AuthController {
  constructor(@Inject('NatsService') private readonly client: ClientProxy) {}

  /**
   * Register a new user
   * Maps to auth.register message pattern
   */
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return firstValueFrom(
      this.client.send('auth.register', registerDto)
    );
  }

  /**
   * Login with email and password
   * Maps to auth.login message pattern
   */
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return firstValueFrom(
      this.client.send('auth.login', loginDto)
    );
  }

  /**
   * Logout user and revoke session
   * Maps to auth.logout message pattern
   */
  @Post('logout')
  async logout(@Body() logoutDto: LogoutDto) {
    return firstValueFrom(
      this.client.send('auth.logout', logoutDto)
    );
  }

  /**
   * Verify JWT token validity
   * Maps to auth.token.verify message pattern
   */
  @Post('verify')
  async verifyToken(@Body() verifyTokenDto: VerifyTokenDto) {
    return firstValueFrom(
      this.client.send('auth.token.verify', verifyTokenDto)
    );
  }

  /**
   * Refresh JWT tokens using refresh token
   * Maps to auth.token.refresh message pattern
   */
  @Post('refresh')
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    return firstValueFrom(
      this.client.send('auth.token.refresh', refreshTokenDto)
    );
  }
}
