# Configuración JWT - Auth Microservice

## Cambios Realizados

### 1. **User Entity** - Agregado rol (role)
```typescript
@Column({
  type: 'enum',
  enum: UserRole,
  default: UserRole.USER,
})
role: UserRole;
```

**Roles disponibles:**
- `admin` - Administrador del sistema
- `user` - Usuario regular
- `operator` - Operador de circuitos

### 2. **Auth Service** - Implementado JWT
- Usa `JwtService` de `@nestjs/jwt` para firmar y verificar tokens
- Tokens firmados contienen el payload:
  ```json
  {
    "sub": "uuid-del-usuario",
    "email": "usuario@example.com",
    "role": "user|admin|operator",
    "iat": timestamp,
    "exp": timestamp + 24h
  }
  ```
- Genera tokens con estándar **Bearer** 

### 3. **Respuestas de Auth Service**
Ahora incluyen:
```json
{
  "success": true,
  "message": "...",
  "data": {
    "id": "uuid",
    "email": "usuario@example.com",
    "name": "Juan",
    "role": "user",
    "accessToken": "eyJhbGc...",
    "tokenType": "Bearer"
  }
}
```

### 4. **Message Patterns - Formato Bearer**

#### auth.register
**Request:**
```json
{
  "email": "usuario@example.com",
  "name": "Juan Pérez",
  "password": "password123",
  "role": "user"  // opcional, default: user
}
```

#### auth.login
**Request:**
```json
{
  "email": "usuario@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login exitoso",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "usuario@example.com",
    "name": "Juan Pérez",
    "role": "user",
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "tokenType": "Bearer"
  }
}
```

#### auth.token.verify
**Request:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Token válido",
  "data": {
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "email": "usuario@example.com",
    "role": "user",
    "name": "Juan Pérez"
  }
}
```

#### auth.logout
**Request:**
```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."  // opcional
}
```

Si se proporciona el token, será agregado a la blacklist.

## Cómo Usar desde Otros Microservicios

### Ejemplo: Consumir Auth Service

```typescript
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class UserService {
  constructor(@Inject('NatsService') private client: ClientProxy) {}

  async registerUser(email: string, name: string, password: string, role?: string) {
    const response = await this.client
      .send('auth.register', {
        email,
        name,
        password,
        role: role || 'user',
      })
      .toPromise();

    if (response.success) {
      const { accessToken, tokenType } = response.data;
      // Guardar token, usarlo en headers: Authorization: "Bearer {accessToken}"
      return { token: accessToken, type: tokenType, user: response.data };
    }
    
    throw new Error(response.message);
  }

  async verifyToken(token: string) {
    // Remover "Bearer " del token si viene en formato estándar
    const cleanToken = token.startsWith('Bearer ') 
      ? token.slice(7) 
      : token;

    const response = await this.client
      .send('auth.token.verify', { token: cleanToken })
      .toPromise();

    return response;
  }
}
```

### Ejemplo: Guard para Proteger Endpoints

```typescript
import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(@Inject('NatsService') private client: ClientProxy) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token no proporcionado');
    }

    const token = authHeader.slice(7);

    try {
      const response = await this.client
        .send('auth.token.verify', { token })
        .toPromise();

      if (!response.success) {
        throw new UnauthorizedException(response.message);
      }

      // Agregar usuario al request para usar en el controller
      request.user = response.data;
      return true;
    } catch (error) {
      throw new UnauthorizedException('Token inválido');
    }
  }
}
```

### Uso en Controller

```typescript
import { Controller, Get, UseGuards, Request, MessagePattern, Payload } from '@nestjs/common';
import { AuthGuard } from './auth.guard';

@Controller('protected')
export class ProtectedController {
  @Get('profile')
  @UseGuards(AuthGuard)
  getProfile(@Request() req) {
    // req.user contiene los datos decodificados del JWT
    return {
      message: 'Perfil del usuario',
      user: req.user, // { userId, email, role, name }
    };
  }
}
```

## Configuración de Variables de Entorno

En `.env`:
```env
JWT_SECRET=tu-clave-secreta-muy-segura-aqui-cambiar-en-produccion
JWT_EXPIRES_IN=24h
```

> ⚠️ **IMPORTANTE**: En producción, usar una clave secreta fuerte y cambiarla regularmente.

## Características de Seguridad

✅ **Tokens JWT firmados** - Imposible falsificar sin la clave secreta  
✅ **Expiración automática** - Los tokens expiran después de 24 horas  
✅ **Payload con rol** - Permite autorización basada en roles  
✅ **Token Blacklist** - Tokens revocados en logout se rechazan  
✅ **Bcrypt para contraseñas** - Hash criptográfico con 10 salts  

## Decodificar JWT (para debugging)

Puedes decodificar un JWT en [jwt.io](https://jwt.io) copiando el token.

**Estructura del token:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJub2RhIiwicm9sZSI6InVzZXIiLCJpYXQiOjE2ODgw...
|-- Header ---|.|----- Payload -----|.|--- Signature ---|
```

Payload descodificado:
```json
{
  "sub": "550e8400-e29b-41d4-a716-446655440000",
  "email": "usuario@example.com",
  "role": "user",
  "iat": 1710000000,
  "exp": 1710086400
}
```

## Testing con herramientas

### Usando curl/Postman

```bash
# Registrar
curl -X POST http://nats-client:4222 \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "name": "Test User",
    "password": "Test123!",
    "role": "user"
  }'

# Login
curl -X POST http://nats-client:4222 \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!"
  }'

# Verificar token con Bearer header
curl -X GET http://api-gateway:3001/protected/profile \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

## Próximas Mejoras

- [ ] Implementar refresh tokens
- [ ] Agregar 2FA (Two-Factor Authentication)
- [ ] Implementar rate limiting por usuario
- [ ] Migrar blacklist a Redis
- [ ] Agregar recuperación de contraseña
- [ ] Auditoría de logins
