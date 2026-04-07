# Guía de Autenticación Centralizada - API Gateway

## 📋 Descripción General

Se ha implementado un sistema de autenticación **centralizado** en el API Gateway basado en **JWT (Json Web Tokens)** con **Refresh Tokens**. Todos los microservicios que requieran autenticación deben:

1. **Recibir el token** en el header `Authorization: Bearer <token>`
2. **Validar el token** llamando al endpoint `/auth/verify` del API Gateway
3. **Usar los datos del usuario** del token para autorización

## 🔐 Flujo de Autenticación

```
Cliente HTTP
    ↓
POST /auth/login (email, password)
    ↓
Auth MicroService (verifica credenciales)
    ↓
JWT Token (15 min) + Refresh Token (7 días)
    ↓
Cliente almacena tokens
    ↓
Cada request: Authorization: Bearer <token>
```

## 📦 Endpoints Principales

### 1. **POST /auth/register** - Registrar usuario
Sin autenticación requerida.

**Request:**
```json
{
  "email": "usuario@example.com",
  "name": "Juan Pérez",
  "password": "password123",
  "role": "user"  // opcional, valores: "user" (defecto) o "admin"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Usuario registrado exitosamente",
  "data": {
    "id": "uuid...",
    "email": "usuario@example.com",
    "name": "Juan Pérez",
    "role": "user",
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc...",
    "tokenType": "Bearer"
  }
}
```

### 2. **POST /auth/login** - Iniciar sesión
Sin autenticación requerida.

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
    "id": "uuid...",
    "email": "usuario@example.com",
    "name": "Juan Pérez",
    "role": "user",
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc...",
    "tokenType": "Bearer"
  }
}
```

### 3. **POST /auth/refresh** - Refrescar tokens
Sin autenticación requerida (usa Refresh Token).

**Request:**
```json
{
  "refreshToken": "eyJhbGc..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Token refrescado exitosamente",
  "data": {
    "accessToken": "eyJhbGc...",     // Nuevo access token (15 min)
    "refreshToken": "eyJhbGc...",    // Nuevo refresh token (7 días)
    "tokenType": "Bearer"
  }
}
```

### 4. **POST /auth/logout** - Cerrar sesión
**Autenticación requerida.**

**Request:**
```json
{
  "userId": "uuid...",           // opcional, se usa del token si no se proporciona
  "token": "eyJhbGc..."          // opcional, para revocar específicamente
}
```

**Response:**
```json
{
  "success": true,
  "message": "Logout exitoso",
  "data": null
}
```

### 5. **POST /auth/me** - Obtener datos del usuario autenticado
**Autenticación requerida.**

**Response:**
```json
{
  "success": true,
  "message": "Usuario autenticado",
  "data": {
    "userId": "uuid...",
    "email": "usuario@example.com",
    "role": "user",
    "name": "Juan Pérez"
  }
}
```

## 🛡️ Proteger Endpoints en Otros Microservicios

### Opción 1: Usando Guards (Recomendado)

```typescript
import { Controller, Post, UseGuards, Req } from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '@gateway/auth/guards';

@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  // Endpoint protegido
  @UseGuards(JwtAuthGuard)
  @Post('crear')
  async crearUsuario(@Req() req: Request & { user: any }) {
    const usuarioAutenticado = req.user;
    // usuarioAutenticado contiene: userId, email, role, name
    return this.usuariosService.crear(usuarioAutenticado);
  }

  // Endpoint público
  @Post('publico')
  async metodoPublico() {
    return { message: 'No requiere autenticación' };
  }
}
```

### Opción 2: Usando Decoradores Personalizados

Para usar en el API Gateway o si lo copiasan los MS:

```typescript
import { Controller, Post, Req } from '@nestjs/common';
import { Request } from 'express';
import { RequireAuth, Roles } from '@gateway/auth/decorators';
import { UserRole } from '@gateway/auth/dto/user-role.enum';

@Controller('usuarios')
export class UsuariosController {
  @RequireAuth()
  @Post('protegido')
  async metodoProtegido(@Req() req: Request & { user: any }) {
    return { user: req.user };
  }

  @Roles(UserRole.ADMIN)
  @Post('solo-admin')
  async soloAdmins(@Req() req: Request & { user: any }) {
    return { message: 'Solo administradores' };
  }
}
```

### Opción 3: Validar Token Manualmente

```typescript
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AuthorizationService {
  constructor(@Inject('NatsService') private client: ClientProxy) {}

  async verifyToken(token: string) {
    try {
      const response = await firstValueFrom(
        this.client.send('auth.token.verify', { token })
      );
      
      if (response.success) {
        return response.data;  // { userId, email, role, name }
      }
      
      throw new Error('Token inválido');
    } catch (error) {
      throw new Error('No autorizado');
    }
  }
}
```

## 💾 Variables de Entorno

### En Auth Microservice (`.env`)
```env
# JWT
JWT_SECRET=tu-clave-secreta-muy-segura-cambiar-en-produccion
JWT_ACCESS_TOKEN_EXPIRES_IN=15m
JWT_REFRESH_TOKEN_EXPIRES_IN=7d

# Redis (para blacklist de tokens)
REDIS_HOST=redis
REDIS_PORT=6379
```

### En API Gateway (`.env`)
```env
# NATS para comunicación con auth-ms
NATS_URLS=nats://localhost:4222
```

## 🔑 Estructura del Token JWT

El token contiene y está firmado con la clave secreta:

```javascript
{
  "sub": "550e8400-e29b-41d4-a716-446655440000",  // User ID
  "email": "usuario@example.com",
  "role": "user",  // "user" o "admin"
  "iat": 1710520800,   // Issued At
  "exp": 1710534200    // Expiration Time (15 min después)
}
```

**⚠️ Nunca almacenes información sensible en el payload, está solo encodificado, no encriptado.**

## 🔄 Flujo de Refresh Token

```typescript
// 1. El access token se vence después de 15 minutos
// 2. El cliente usa el refresh token para obtener uno nuevo

POST /auth/refresh
{
  "refreshToken": "eyJhbGc..."
}

// 3. Respuesta con nuevos tokens
{
  "accessToken": "eyJhbGc...",      // Válido otros 15 min
  "refreshToken": "eyJhbGc...",     // Válido otros 7 días
  "tokenType": "Bearer"
}

// 4. El refresh token solo es válido 7 días
// Después, el usuario debe hacer login nuevamente
```

## 🚀 Ejemplo Completo: Cliente (Frontend)

```javascript
// 1. Login
const loginResponse = await fetch('http://localhost:3000/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'usuario@example.com',
    password: 'password123'
  })
});

const { data } = await loginResponse.json();
localStorage.setItem('accessToken', data.accessToken);
localStorage.setItem('refreshToken', data.refreshToken);

// 2. Llamar endpoint protegido
const accessToken = localStorage.getItem('accessToken');
const response = await fetch('http://localhost:3000/usuarios/crear', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ ... })
});

// 3. Si el token expiró (401), refrescarlo
if (response.status === 401) {
  const refreshToken = localStorage.getItem('refreshToken');
  const refreshResponse = await fetch('http://localhost:3000/auth/refresh', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken })
  });
  
  const newTokens = await refreshResponse.json();
  localStorage.setItem('accessToken', newTokens.data.accessToken);
  localStorage.setItem('refreshToken', newTokens.data.refreshToken);
  
  // Reintentar request original con nuevo token
  // ...
}

// 4. Logout
const logoutResponse = await fetch('http://localhost:3000/auth/logout', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
    'Content-Type': 'application/json'
  }
});

localStorage.removeItem('accessToken');
localStorage.removeItem('refreshToken');
```

## 🔒 Seguridad

✅ **Tokens JWT firmados** - No se pueden falsificar sin la clave secreta  
✅ **Access tokens cortos (15 min)** - Minimiza riesgo si se compromete  
✅ **Refresh tokens largos (7 días)** - Mejor UX  
✅ **Blacklist en Redis** - Logout inmediato invalida el token  
✅ **Bcrypt para contraseñas** - Hash criptográfico con 10 salts  
✅ **HTTPS en producción** - Protege tokens en tránsito  

## ⚠️ Notas Importantes

1. **En producción**, cambiar `JWT_SECRET` a una clave muy fuerte
2. Los tokens se almacenan en **localStorage** (considera httpOnly cookies en frontend)
3. El **Refresh Token NUNCA debe expirar automáticamente**, solo al logout
4. Los tokens están **vinculados al usuario específico**, no es válido cambiarlos entre usuarios
5. La **validación siempre ocurre en el backend**, nunca confíes solo en la validación del cliente

## 📞 Contacto

Para dudas sobre implementación, ver ejemplos en:
- `/backend/apps/auth-ms/JWT_SETUP.md`
- `/backend/apps/api-gateway/src/auth/` (Guards y Decoradores)
