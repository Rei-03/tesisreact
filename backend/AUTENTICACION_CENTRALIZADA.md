# Configuración de Autenticación Centralizada

## Variables de Entorno para Todos los Microservicios

Agregar a `.env.example` de cada microservicio:

```env
# ==========================================
# NATS Configuration (para validar tokens)
# ==========================================
NATS_URLS=nats://localhost:4222

# ==========================================
# Puerto del Microservicio
# ==========================================
PORT=3003
NODE_ENV=development
```

## Estructura de Carpetas Recomendada

Para cada microservicio que necesite autenticación:

```
src/
├── auth/
│   ├── guards/
│   │   └── auth.guard.ts          # Guard de autenticación
│   ├── decorators/
│   │   └── roles.decorator.ts     # Decorador para validar roles (opcional)
│   ├── auth.module.ts             # Módulo de auth
│   └── README.md                  # Documentación local
├── usuarios/
│   ├── usuarios.controller.ts
│   ├── usuarios.service.ts
│   └── usuarios.module.ts
└── app.module.ts
```

## Pasos de Implementación

### 1. Copiar Guard

Copiar el archivo `JwtAuthGuard` del API Gateway:
```
api-gateway/src/auth/guards/jwt-auth.guard.ts → circuitos-ms/src/auth/guards/auth.guard.ts
```

### 2. Crear Módulo de Auth

```typescript
// src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { AuthGuard } from './guards/auth.guard';

@Module({
  providers: [AuthGuard],
  exports: [AuthGuard],
})
export class AuthModule {}
```

### 3. Importar en AppModule

```typescript
// src/app.module.ts
import { Module } from '@nestjs/common';
import { NatsModule } from './nats/nats.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [NatsModule, AuthModule],
  // ...
})
export class AppModule {}
```

### 4. Usar en Controladores

```typescript
import { Controller, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '../auth/guards/auth.guard';

@Controller('resource')
export class ResourceController {
  @UseGuards(AuthGuard)
  @Post('criar')
  async criar(@Req() req: Request & { user: any }) {
    const userId = req.user.userId;
    // ...
  }
}
```

## Tipos de Usuarios (Roles)

```typescript
export enum UserRole {
  ADMIN = 'admin',     // Administrador del sistema
  USER = 'user',       // Usuario regular
  OPERATOR = 'operator' // Operador de circuitos (si aplica)
}
```

## Flujo de Validación

```
Request con Token
        ↓
Guard intercepta
        ↓  
Extrae token del header Authorization
        ↓
Envía 'auth.token.verify' por NATS al auth-ms
        ↓
auth-ms valida contra BD + Redis
        ↓
Retorna datos del usuario o error
        ↓
Si válido: agrega a req.user
Si inválido: lanza UnauthorizedException
        ↓
Controlador procesa con req.user disponible
```

## Ejemplos por Rol

### Admin Only
```typescript
@UseGuards(AuthGuard)
@Delete('usuario/:id')
async eliminarUsuario(
  @Req() req: Request & { user: any }
) {
  if (req.user.role !== 'admin') {
    throw new ForbiddenException('Solo admins pueden eliminar usuarios');
  }
  // ...
}
```

### Owner Only (su propio datos)
```typescript
@UseGuards(AuthGuard)
@Get('perfil/:userId')
async obtenerPerfil(
  @Param('userId') userId: string,
  @Req() req: Request & { user: any }
) {
  if (req.user.userId !== userId && req.user.role !== 'admin') {
    throw new ForbiddenException('No tienes acceso a este perfil');
  }
  // ...
}
```

### Múltiples Roles
```typescript
@UseGuards(AuthGuard)
@Post('reportes')
async crearReporte(
  @Req() req: Request & { user: any }
) {
  const rolesPermitidos = ['admin', 'operator'];
  if (!rolesPermitidos.includes(req.user.role)) {
    throw new ForbiddenException('Se requiere ser admin u operator');
  }
  // ...
}
```

## Testing con Autenticación

```typescript
describe('Protected Endpoint', () => {
  let token: string;

  beforeAll(async () => {
    // Obtener token de prueba
    const response = await fetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password'
      })
    });
    token = (await response.json()).data.accessToken;
  });

  it('debe permitir con token válido', async () => {
    const response = await fetch('/resource/create', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    expect(response.status).toBe(201);
  });

  it('debe rechazar sin token', async () => {
    const response = await fetch('/resource/create', {
      method: 'POST'
    });
    expect(response.status).toBe(401);
  });
});
```

## Migración de Endpoints Existentes

Si ya existen endpoints sin autenticación y necesitas agregarla:

### Antes
```typescript
@Post('crear')
async crear(@Body() dto: CreateDto) {
  return this.service.crear(dto);
}
```

### Después
```typescript
@UseGuards(AuthGuard)
@Post('crear')
async crear(
  @Body() dto: CreateDto,
  @Req() req: Request & { user: any }
) {
  return this.service.crear(dto, req.user.userId);
}
```

## Checklist de Implementación

- [ ] Copiar `auth.guard.ts` a cada MS
- [ ] Crear `auth.module.ts` en cada MS
- [ ] Importar `AuthModule` en `app.module.ts`
- [ ] Agregar `@UseGuards(AuthGuard)` a endpoints protegidos
- [ ] Acceder a usuario vía `@Req() req: Request & { user: any }`
- [ ] Agregar variables de entorno a `.env.example`
- [ ] Documentar endpoints protegidos vs públicos
- [ ] Agregar ejemplos en `README.md` de cada MS

## Preguntas Frecuentes

**P: ¿Qué pasa si el token expira?**  
A: El auth-ms lo rechaza y el Guard lanza UnauthorizedException (401). El cliente debe usar el refresh token para obtener uno nuevo.

**P: ¿Puedo cambiar la duración de los tokens?**  
A: Sí, en `auth-ms/.env` cambiar `JWT_ACCESS_TOKEN_EXPIRES_IN` y `JWT_REFRESH_TOKEN_EXPIRES_IN`.

**P: ¿Cómo valido múltiples roles?**  
A: Chequea manualmente: `['admin', 'operator'].includes(req.user.role)`

**P: ¿Se puede usar en endpoints NestJS con Message Patterns?**  
A: Los Message Patterns no tienen HTTP context, usa otra estrategia (validar en el servicio).
