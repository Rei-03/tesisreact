import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { User, UserRole } from './entities/user.entity';
import * as bcrypt from 'bcrypt';

// Mock de bcrypt
jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let mockUserRepository;
  let mockJwtService;
  let mockRedisClient;

  const mockUser = {
    id: '123',
    email: 'test@example.com',
    name: 'Test User',
    password: 'hashed_password',
    role: UserRole.USER,
    isActive: true,
  };

  beforeEach(async () => {
    // Mock del repositorio de usuarios
    mockUserRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    // Mock del servicio JWT
    mockJwtService = {
      sign: jest.fn().mockReturnValue('mock_token'),
      verify: jest.fn(),
    };

    // Mock del cliente Redis
    mockRedisClient = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: 'REDIS_CLIENT',
          useValue: mockRedisClient,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('debe registrar un nuevo usuario exitosamente', async () => {
      const registerDto = {
        email: 'newuser@example.com',
        name: 'New User',
        password: 'password123',
        role: UserRole.USER,
      };

      mockUserRepository.findOne.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');
      mockUserRepository.create.mockReturnValue({
        ...registerDto,
        password: 'hashed_password',
        isActive: true,
      });
      mockUserRepository.save.mockResolvedValue({
        ...registerDto,
        id: '123',
        password: 'hashed_password',
        isActive: true,
      });

      const result = await service.register(registerDto);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Usuario registrado exitosamente');
      expect(result.data).toBeDefined();
      expect(result.data?.email).toBe(registerDto.email);
      expect(mockUserRepository.save).toHaveBeenCalled();
      expect(bcrypt.hash).toHaveBeenCalledWith(registerDto.password, 10);
    });

    it('debe rechazar registro si el usuario ya existe', async () => {
      const registerDto = {
        email: 'existing@example.com',
        name: 'Existing User',
        password: 'password123',
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.register(registerDto);

      expect(result.success).toBe(false);
      expect(result.message).toBe('El usuario ya existe');
      expect(result.data).toBeNull();
      expect(mockUserRepository.save).not.toHaveBeenCalled();
    });

    it('debe manejar errores durante el registro', async () => {
      const registerDto = {
        email: 'error@example.com',
        name: 'Error User',
        password: 'password123',
      };

      mockUserRepository.findOne.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');
      mockUserRepository.create.mockReturnValue({
        ...registerDto,
        password: 'hashed_password',
        isActive: true,
      });
      mockUserRepository.save.mockRejectedValue(new Error('Database error'));

      const result = await service.register(registerDto);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Error al registrar el usuario');
      expect(result.data).toBeNull();
    });
  });

  describe('login', () => {
    it('debe realizar login exitoso con credenciales válidas', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.login(loginDto);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Login exitoso');
      expect(result.data?.email).toBe(loginDto.email);
      expect(result.data?.accessToken).toBeDefined();
      expect(result.data?.refreshToken).toBeDefined();
    });

    it('debe rechazar login si el usuario no existe', async () => {
      const loginDto = {
        email: 'nonexistent@example.com',
        password: 'password123',
      };

      mockUserRepository.findOne.mockResolvedValue(null);

      const result = await service.login(loginDto);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Credenciales inválidas');
      expect(result.data).toBeNull();
    });

    it('debe rechazar login con contraseña inválida', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await service.login(loginDto);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Credenciales inválidas');
    });

    it('debe rechazar login si el usuario está inactivo', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const inactiveUser = { ...mockUser, isActive: false };
      mockUserRepository.findOne.mockResolvedValue(inactiveUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.login(loginDto);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Usuario inactivo');
    });
  });

  describe('logout', () => {
    it('debe realizar logout exitoso', async () => {
      const logoutDto = {
        userId: '123',
        token: 'some_token',
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.logout(logoutDto);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Logout ejecutado exitosamente');
      expect(result.data?.email).toBe(mockUser.email);
    });

    it('debe rechazar logout si el usuario no existe', async () => {
      const logoutDto = {
        userId: 'nonexistent',
        token: 'some_token',
      };

      mockUserRepository.findOne.mockResolvedValue(null);

      const result = await service.logout(logoutDto);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Usuario no encontrado');
    });
  });

  describe('verifyToken', () => {
    it('debe verificar un token válido', async () => {
      const verifyTokenDto = {
        token: 'valid_token',
      };

      const tokenPayload = {
        sub: '123',
        email: 'test@example.com',
        role: UserRole.USER,
      };

      mockRedisClient.get.mockResolvedValue(null);
      mockJwtService.verify.mockReturnValue(tokenPayload);
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.verifyToken(verifyTokenDto);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Token válido');
      expect(result.data?.userId).toBe(tokenPayload.sub);
    });

    it('debe rechazar un token en la lista negra', async () => {
      const verifyTokenDto = {
        token: 'blacklisted_token',
      };

      mockRedisClient.get.mockResolvedValue('true');

      const result = await service.verifyToken(verifyTokenDto);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Token inválido o expirado');
    });

    it('debe rechazar un token inválido', async () => {
      const verifyTokenDto = {
        token: 'invalid_token',
      };

      mockRedisClient.get.mockResolvedValue(null);
      mockJwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      const result = await service.verifyToken(verifyTokenDto);

      expect(result.success).toBe(false);
    });
  });

  describe('refreshToken', () => {
    it('debe generar un nuevo access token con refresh token válido', async () => {
      const refreshTokenDto = {
        refreshToken: 'valid_refresh_token',
      };

      const tokenPayload = {
        sub: '123',
        email: 'test@example.com',
        role: UserRole.USER,
      };

      mockRedisClient.get.mockResolvedValue(null);
      mockJwtService.verify.mockReturnValue(tokenPayload);
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.refreshToken(refreshTokenDto);

      expect(result.success).toBe(true);
      expect(result.data?.accessToken).toBeDefined();
    });
  });
});
