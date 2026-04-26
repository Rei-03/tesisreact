import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from './entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyTokenDto } from './dto/verify-token.dto';
import { LogoutDto } from './dto/logout.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { env } from '../config/env';
import type { RedisClient } from '../redis/redis.module';

interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    @Inject('REDIS_CLIENT') private readonly redisClient: RedisClient,
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, name, password, role = UserRole.USER } = registerDto;

    // Verificar si el usuario ya existe
    const existingUser = await this.userRepository.findOne({
      where: { email },
    });
    if (existingUser) {
      return {
        success: false,
        message: 'El usuario ya existe',
        data: null,
      };
    }

    // Encriptar contraseña con bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      const user = this.userRepository.create({
        email,
        name,
        password: hashedPassword,
        role,
        isActive: true,
      });
      await this.userRepository.save(user);

      // Generar tokens
      const tokens = this.generateTokens(user.id, user.email, user.role);

      return {
        success: true,
        message: 'Usuario registrado exitosamente',
        data: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          tokenType: tokens.tokenType,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error al registrar el usuario',
        data: null,
      };
    }
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // Buscar usuario por email
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      return {
        success: false,
        message: 'Credenciales inválidas',
        data: null,
      };
    }

    // Verificar contraseña
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return {
        success: false,
        message: 'Credenciales inválidas',
        data: null,
      };
    }

    // Verificar si el usuario está activo
    if (!user.isActive) {
      return {
        success: false,
        message: 'Usuario inactivo',
        data: null,
      };
    }

    // Generar tokens
    const tokens = this.generateTokens(user.id, user.email, user.role);

    return {
      success: true,
      message: 'Login exitoso',
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        tokenType: tokens.tokenType,
      },
    };
  }

  async logout(logoutDto: LogoutDto) {
    const { userId, token } = logoutDto;

    // Buscar el usuario
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      return {
        success: false,
        message: 'Usuario no encontrado',
        data: null,
      };
    }

    // Agregar token a blacklist si se proporciona
    if (token) {
      await this.addToBlacklist(token);
    }

    return {
      success: true,
      message: 'Logout ejecutado exitosamente',
      data: {
        id: user.id,
        email: user.email,
      },
    };
  }

  async verifyToken(verifyTokenDto: VerifyTokenDto) {
    const { token } = verifyTokenDto;

    // Verificar si el token está en la lista negra
    if (await this.isTokenBlacklisted(token)) {
      return {
        success: false,
        message: 'Token inválido o revocado',
        data: null,
      };
    }

    try {
      // Verificar y decodificar el JWT
      const payload = this.jwtService.verify<JwtPayload>(token);

      // Buscar el usuario para confirmar que existe y está activo
      const user = await this.userRepository.findOne({
        where: { id: payload.sub },
      });
      if (!user || !user.isActive) {
        return {
          success: false,
          message: 'Usuario no válido o inactivo',
          data: null,
        };
      }

      return {
        success: true,
        message: 'Token válido',
        data: {
          userId: payload.sub,
          email: payload.email,
          role: payload.role,
          name: user.name,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: 'Token inválido o expirado',
        data: null,
      };
    }
  }

  // Métodos auxiliares
  private generateTokens(
    userId: string,
    email: string,
    role: UserRole,
  ): AuthTokens {
    const payload: JwtPayload = {
      sub: userId,
      email,
      role,
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: env.JWT_ACCESS_TOKEN_EXPIRES_IN as any,
    });

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: env.JWT_REFRESH_TOKEN_EXPIRES_IN as any,
    });

    return {
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
    };
  }

  async refreshToken(refreshTokenDto: RefreshTokenDto) {
    const { refreshToken } = refreshTokenDto;

    // Verificar si el token está en la lista negra
    if (await this.isTokenBlacklisted(refreshToken)) {
      return {
        success: false,
        message: 'Token inválido o revocado',
        data: null,
      };
    }

    try {
      // Verificar y decodificar el refresh token
      const payload = this.jwtService.verify<JwtPayload>(refreshToken);

      // Buscar el usuario
      const user = await this.userRepository.findOne({
        where: { id: payload.sub },
      });
      if (!user || !user.isActive) {
        return {
          success: false,
          message: 'Usuario no válido o inactivo',
          data: null,
        };
      }

      // Generar nuevos tokens
      const tokens = this.generateTokens(user.id, user.email, user.role);

      return {
        success: true,
        message: 'Token refrescado exitosamente',
        data: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          tokenType: tokens.tokenType,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: 'Refresh token inválido o expirado',
        data: null,
      };
    }
  }

  /**
   * Obtiene lista paginada de usuarios
   */
  async findAll(take: number = 20, skip: number = 0) {
    const [users, total] = await this.userRepository.findAndCount({
      skip,
      take,
      order: { createdAt: 'DESC' },
      select: ['id', 'email', 'name', 'role', 'isActive', 'createdAt'],
    });

    const totalPages = Math.ceil(total / take);
    const page = skip / take + 1;

    return {
      results: users,
      meta: {
        page: Math.floor(page),
        totalPages,
        total,
        pageSize: take,
      },
    };
  }

  /**
   * Agrega un token a la lista negra en Redis
   * Usa el tiempo de expiración del JWT como TTL
   */
  private async addToBlacklist(token: string): Promise<void> {
    try {
      const payload = this.jwtService.decode<JwtPayload>(token);
      if (!payload || !payload.exp) {
        return;
      }

      // Calcular TTL: exp es un timestamp en segundos
      const now = Math.floor(Date.now() / 1000);
      const ttl = payload.exp - now;

      if (ttl > 0) {
        const blacklistKey = `blacklist:${token}`;
        await this.redisClient.setEx(blacklistKey, ttl, '1');
      }
    } catch (error) {
      console.error('Error adding token to blacklist:', error);
    }
  }

  /**
   * Verifica si un token está en la lista negra de Redis
   */
  private async isTokenBlacklisted(token: string): Promise<boolean> {
    try {
      const blacklistKey = `blacklist:${token}`;
      const exists = await this.redisClient.exists(blacklistKey);
      return exists === 1;
    } catch (error) {
      console.error('Error checking token blacklist:', error);
      return false;
    }
  }
}
