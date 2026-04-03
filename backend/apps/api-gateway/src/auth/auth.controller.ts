import {
  Controller,
  Post,
  Body,
  Inject,
  Req,
  UseGuards,
  SetMetadata,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { Request } from 'express';
import {
  RegisterDto,
  LoginDto,
  LogoutDto,
  VerifyTokenDto,
  RefreshTokenDto,
} from './dto';
import { JwtAuthGuard, RolesGuard } from './guards';
import { UserRole } from './dto/user-role.enum';

@Controller('auth')
export class AuthController {
  constructor(@Inject('NatsService') private readonly client: ClientProxy) {}

  /**
   * Register a new user
   * No authentication required
   */
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return firstValueFrom(
      this.client.send('auth.register', registerDto)
    );
  }

  /**
   * Login with email and password
   * Returns access and refresh tokens
   * No authentication required
   */
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return firstValueFrom(
      this.client.send('auth.login', loginDto)
    );
  }

  /**
   * Refresh JWT tokens using refresh token
   * Returns new access and refresh tokens
   * No authentication required (uses refresh token)
   */
  @Post('refresh')
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    return firstValueFrom(
      this.client.send('auth.token.refresh', refreshTokenDto)
    );
  }

  /**
   * Verify JWT token validity
   * Protected: requires valid JWT
   */
  @UseGuards(JwtAuthGuard)
  @Post('verify')
  async verifyToken(
    @Body() verifyTokenDto: VerifyTokenDto,
    @Req() req: Request & { user: any }
  ) {
    return firstValueFrom(
      this.client.send('auth.token.verify', verifyTokenDto)
    );
  }

  /**
   * Logout user and revoke session
   * Protected: requires valid JWT
   * Invalidates the token by adding it to blacklist
   */
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(
    @Body() logoutDto: LogoutDto,
    @Req() req: Request & { user: any }
  ) {
    // Si no se proporciona userId, usar el del token autenticado
    const userId = logoutDto.userId || req.user.userId;

    return firstValueFrom(
      this.client.send('auth.logout', {
        ...logoutDto,
        userId,
      })
    );
  }

  /**
   * Get current user info from token
   * Protected: requires valid JWT
   */
  @UseGuards(JwtAuthGuard)
  @Post('me')
  async getMe(@Req() req: Request & { user: any }) {
    return {
      success: true,
      message: 'Usuario autenticado',
      data: req.user,
    };
  }
}

