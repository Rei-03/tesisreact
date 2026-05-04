import {
  Controller,
  Post,
  Body,
  Inject,
  Req,
  Res,
  Get,
  Query,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import type { Request, Response } from 'express';
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
  async register(@Body() registerDto: RegisterDto, @Res() res: Response) {
    const result = await firstValueFrom(
      this.client.send('auth.register', registerDto)
    );

    // Si el registro es exitoso, establecer cookies
    if (result.success && result.data?.accessToken) {
      this.setCookies(res, result.data.accessToken, result.data.refreshToken);
    }

    res.json(result);
  }

  /**
   * Login with email and password
   * Returns access and refresh tokens in httpOnly cookies
   * No authentication required
   */
  @Public()
  @Post('login')
  async login(@Body() loginDto: LoginDto, @Res() res: Response) {
    console.log('🔐 [api-gateway] POST /auth/login recibido:', {
      email: loginDto.email,
      password: '***',
      type: typeof loginDto,
      keys: Object.keys(loginDto),
    });

    const result = await firstValueFrom(
      this.client.send('auth.login', loginDto)
    );

    console.log('✅ [api-gateway] Respuesta de auth-ms:', { 
      success: result.success, 
      message: result.message,
      hasData: !!result.data,
    });

    // Si el login es exitoso, establecer cookies
    if (result.success && result.data?.accessToken) {
      this.setCookies(res, result.data.accessToken, result.data.refreshToken);
      
      // No devolver tokens en el body si están en cookies
      const { accessToken, refreshToken, ...dataWithoutTokens } = result.data;
      result.data = dataWithoutTokens;
    }

    res.json(result);
  }

  /**
   * Refresh JWT tokens using refresh token
   * Returns new access and refresh tokens in httpOnly cookies
   * No authentication required (uses refresh token from cookie)
   */
  @Public()
  @Post('refresh')
  async refreshToken(
    @Body() refreshTokenDto: RefreshTokenDto,
    @Req() req: Request,
    @Res() res: Response
  ) {
    // Si no se proporciona token en el body, intentar obtenerlo de la cookie
    const token = refreshTokenDto.refreshToken || (req.cookies?.refreshToken);
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token no proporcionado',
        data: null,
      });
    }

    const result = await firstValueFrom(
      this.client.send('auth.token.refresh', { refreshToken: token })
    );

    // Si el refresh es exitoso, actualizar cookies
    if (result.success && result.data?.accessToken) {
      this.setCookies(res, result.data.accessToken, result.data.refreshToken);
      
      // No devolver tokens en el body si están en cookies
      const { accessToken, refreshToken, ...dataWithoutTokens } = result.data;
      result.data = dataWithoutTokens;
    }

    res.json(result);
  }

  /**
   * Verify JWT token validity
   * Protected: requires valid JWT (AuthGuard global)
   * Lee el token de las cookies httpOnly automáticamente
   */
  @Post('verify')
  async verifyToken(@Req() req: Request & { user: any }) {
    // Obtener token de las cookies httpOnly
    const token = req.cookies?.accessToken;
    
    if (!token) {
      return {
        success: false,
        message: 'Token no proporcionado',
        data: null,
      };
    }

    return firstValueFrom(
      this.client.send('auth.token.verify', { token })
    );
  }

  /**
   * Logout user and revoke session
   * Protected: requires valid JWT (AuthGuard global)
   * Invalidates the token by adding it to blacklist and limpia cookies
   */
  @Post('logout')
  async logout(
    @Body() logoutDto: LogoutDto,
    @Req() req: Request & { user: any },
    @Res() res: Response
  ) {
    // Si no se proporciona userId, usar el del token autenticado
    const userId = logoutDto.userId || req.user.userId;

    const result = await firstValueFrom(
      this.client.send('auth.logout', {
        ...logoutDto,
        userId,
      })
    );

    // Limpiar cookies al logout
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    res.json(result);
  }

  /**
   * Get current user info from token (GET - para validar sesión desde frontend)
   * Protected: requires valid JWT (AuthGuard global)
   * Lee el token de las cookies httpOnly automáticamente
   */
  @Get('me')
  async getMe(@Req() req: Request & { user: any }) {
    // Si llega aquí, significa que el token es válido (el guard lo validó)
    return {
      success: true,
      message: 'Usuario autenticado',
      data: req.user,
    };
  }

  /**
   * Get current user info from token (POST - legacy/fallback)
   * Protected: requires valid JWT (AuthGuard global)
   */
  @Post('me')
  async getMePost(@Req() req: Request & { user: any }) {
    return this.getMe(req);
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

  /**
   * Establece las cookies httpOnly para access y refresh tokens
   * @param res Response de Express
   * @param accessToken Token de acceso JWT
   * @param refreshToken Token de refresco JWT
   */
  private setCookies(
    res: Response,
    accessToken: string,
    refreshToken: string
  ): void {
    const isProduction = process.env.NODE_ENV === 'production';

    // Cookie de Access Token
    res.cookie('accessToken', accessToken, {
      httpOnly: true, // No accesible desde JavaScript (XSS protection)
      secure: isProduction, // HTTPS solo en producción
      sameSite: 'lax', // CSRF protection
      maxAge: 15 * 60 * 1000, // 15 minutos
      path: '/',
    });

    // Cookie de Refresh Token
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true, // No accesible desde JavaScript (XSS protection)
      secure: isProduction, // HTTPS solo en producción
      sameSite: 'lax', // CSRF protection
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
      path: '/',
    });
  }
}

