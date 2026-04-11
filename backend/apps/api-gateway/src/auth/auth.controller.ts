import {
  Controller,
  Post,
  Body,
  Inject,
  Req,
  Get,
  Query,
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
import { Public } from './decorators';
import { UserRole } from './dto/user-role.enum';

@Controller('auth')
export class AuthController {
  constructor(@Inject('NatsService') private readonly client: ClientProxy) {}

  /**
   * Register a new user
   * No authentication required
   */
  @Public()
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
  @Public()
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
  @Public()
  @Post('refresh')
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    return firstValueFrom(
      this.client.send('auth.token.refresh', refreshTokenDto)
    );
  }

  /**
   * Verify JWT token validity
   * Protected: requires valid JWT (AuthGuard global)
   */
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
   * Protected: requires valid JWT (AuthGuard global)
   * Invalidates the token by adding it to blacklist
   */
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
   * Protected: requires valid JWT (AuthGuard global)
   */
  @Post('me')
  async getMe(@Req() req: Request & { user: any }) {
    return {
      success: true,
      message: 'Usuario autenticado',
      data: req.user,
    };
  }

  /**
   * Get all users with pagination
   * Protected: requires valid JWT (AuthGuard global)
   */
  @Get('users')
  async findAll(
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    const pageNum = page ? Number(page) : 1;
    const pageSizeNum = pageSize ? Number(pageSize) : 20;
    return firstValueFrom(
      this.client.send('auth.findAll', {
        page: pageNum,
        pageSize: pageSizeNum,
      })
    );
  }
}

