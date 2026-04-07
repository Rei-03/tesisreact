# Ejemplo de Protección de Endpoints en Circuitos MS

## Paso 1: Copiar el Guard

Copiar el archivo `auth.guard.ts` a `src/auth/guards/`

## Paso 2: Crear el módulo de Auth

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

## Paso 3: Importar en el módulo principal

```typescript
// src/app.module.ts
import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { CircuitosModule } from './circuitos/circuitos.module';

@Module({
  imports: [NatsModule, AuthModule, CircuitosModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

## Paso 4: Usar en controladores

```typescript
// src/circuitos/circuitos.controller.ts
import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { Request } from 'express';
import { AuthGuard } from '../auth/guards/auth.guard';
import { CircuitosService } from './circuitos.service';

@Controller('circuitos')
export class CircuitosController {
  constructor(private readonly circuitosService: CircuitosService) {}

  /**
   * Crear un nuevo circuito
   * Requiere autenticación
   */
  @UseGuards(AuthGuard)
  @Post('crear')
  async crearCircuito(
    @Body() createCircuitoDto: CreateCircuitoDto,
    @Req() req: Request & { user: any }
  ) {
    const usuarioId = req.user.userId;
    const usuarioRole = req.user.role;

    // Aquí puedes acceder a los datos del usuario autenticado
    return this.circuitosService.crear(createCircuitoDto, usuarioId);
  }

  /**
   * Endpoint público (sin autenticación)
   */
  @Post('publico')
  async metodoPublico() {
    return { message: 'Este endpoint no requiere autenticación' };
  }
}
```

## Paso 5: Acceder a datos del usuario

En cualquier lugar donde tengas `req.user`:

```typescript
@UseGuards(AuthGuard)
@Post('datos-usuario')
async obtenerDatos(@Req() req: Request & { user: any }) {
  const usuario = req.user;
  // {
  //   userId: "550e8400-e29b-41d4-a716-446655440000",
  //   email: "usuario@example.com",
  //   role: "user",
  //   name: "Juan Pérez"
  // }

  console.log(`Usuario: ${usuario.email}, Rol: ${usuario.role}`);
  return { autorizado: true, usuario };
}
```

## Validación Adicional por Rol

```typescript
import { ForbiddenException } from '@nestjs/common';

@UseGuards(AuthGuard)
@Post('admin-only')
async soloAdmins(@Req() req: Request & { user: any }) {
  if (req.user.role !== 'admin') {
    throw new ForbiddenException(
      'Se requiere rol de administrador para esta operación'
    );
  }

  return { message: 'Operación de administrador ejecutada' };
}
```

## Testing

```typescript
// test/circuitos.e2e.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Circuitos con Autenticación', () => {
  let app: INestApplication;
  let token: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Login para obtener token
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });

    token = loginResponse.body.data.accessToken;
  });

  it('debe crear un circuito con token válido', () => {
    return request(app.getHttpServer())
      .post('/circuitos/crear')
      .set('Authorization', `Bearer ${token}`)
      .send({
        nombre: 'Circuito Test',
        descripcion: 'Test'
      })
      .expect(201);
  });

  it('debe rechazar sin token', () => {
    return request(app.getHttpServer())
      .post('/circuitos/crear')
      .send({
        nombre: 'Circuito Test',
        descripcion: 'Test'
      })
      .expect(401);
  });

  it('debe rechazar con token inválido', () => {
    return request(app.getHttpServer())
      .post('/circuitos/crear')
      .set('Authorization', 'Bearer invalid-token')
      .send({
        nombre: 'Circuito Test',
        descripcion: 'Test'
      })
      .expect(401);
  });

  afterAll(async () => {
    await app.close();
  });
});
```

## Flujo Completo

1. **Cliente hace request** con header `Authorization: Bearer <token>`
2. **AuthGuard intercepta** el request
3. **AuthGuard extrae el token** del header
4. **AuthGuard valida el token** llamando a `auth-ms` via NATS
5. **auth-ms verifica** el token contra su base de datos y Redis
6. **AuthGuard agrega datos** del usuario a `req.user`
7. **Controlador procesa** el request con acceso a datos del usuario

## Variables de Entorno

```env
# .env
NATS_URLS=nats://localhost:4222
PORT=3003
NODE_ENV=development
```

## Suma de Control

✅ Token se envía en cada request  
✅ Token se valida en el servidor (no en cliente)  
✅ Datos del usuario se ponen en request context  
✅ El microservicio puede verificar roles y permisos  
✅ Tokens expirados se rechazan automáticamente  
