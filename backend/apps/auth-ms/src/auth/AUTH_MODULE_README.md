# Módulo de Autenticación - Auth Microservice

Este módulo proporciona funcionalidades completas de autenticación utilizando **Message Patterns** de NATS como sistema de comunicación entre microservicios.

## Características

- ✅ **Registro de usuarios** con encriptación de contraseña usando bcrypt
- ✅ **Login** con validación de credenciales
- ✅ **Logout** con invalidación de tokens
- ✅ **Verificación de tokens** para autorización
- ✅ **Base de datos PostgreSQL** con TypeORM

## Estructura del Módulo

```
auth/
├── auth.controller.ts       # Controlador con Message Patterns
├── auth.service.ts          # Lógica de negocio
├── auth.module.ts           # Declaración del módulo
├── repositories/
│   └── user.repository.ts   # Acceso a datos de usuarios
└── dto/
    ├── register.dto.ts      # DTO para registro
    ├── login.dto.ts         # DTO para login
    ├── logout.dto.ts        # DTO para logout
    └── verify-token.dto.ts  # DTO para verificación de token

database/
└── entities/
    └── user.entity.ts       # Entidad de Usuario para TypeORM
```

## Message Patterns

### auth.register
Registra un nuevo usuario en el sistema.

**Request:**
```json
{
  "email": "usuario@example.com",
  "name": "Juan Pérez",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Usuario registrado exitosamente",
  "data": {
    "id": "uuid-string",
    "email": "usuario@example.com",
    "name": "Juan Pérez",
    "token": "base64-encoded-token"
  }
}
```

### auth.login
Autentica un usuario y retorna un token.

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
    "id": "uuid-string",
    "email": "usuario@example.com",
    "name": "Juan Pérez",
    "token": "base64-encoded-token"
  }
}
```

### auth.logout
Cierra la sesión de un usuario.

**Request:**
```json
{
  "userId": "uuid-string"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Logout ejecutado exitosamente",
  "data": {
    "id": "uuid-string",
    "email": "usuario@example.com"
  }
}
```

### auth.token.verify
Verifica la validez de un token.

**Request:**
```json
{
  "token": "base64-encoded-token"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Token válido",
  "data": {
    "userId": "uuid-string",
    "email": "usuario@example.com",
    "name": "Juan Pérez"
  }
}
```

## Variables de Entorno

Asegúrate de configurar las siguientes variables en tu archivo `.env`:

```env
# Base de Datos
DB_HOST=postgres
DB_PORT=5432
DB_USERNAME=auth_user
DB_PASSWORD=auth_password
DB_NAME=auth_db
DB_SYNCHRONIZE=true
DB_LOGGING=true

# NATS
NATS_URLS=nats://localhost:4222

# JWT (para futuras implementaciones)
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=24h
```

## Seguridad

- **Bcrypt**: Las contraseñas se encriptan con bcrypt (salt: 10 rondas) antes de almacenarse
- **Tokens**: Los tokens generados incluyen el userId y un timestamp
- **Validación de entidad**: El usuario debe estar activo para iniciar sesión
- **Blacklist de tokens**: Los tokens revocados se mantienen en una lista negra en memoria

> ⚠️ **Nota de Producción**: Para un ambiente de producción, considera:
> - Usar JWT con firma digital
> - Almacenar la blacklist de tokens en Redis en lugar de memoria
> - Implementar refresh tokens
> - Agregar rate limiting
> - Usar HTTPS para todas las comunicaciones

## Dependencias

- `@nestjs/common`: Framework base de NestJS
- `@nestjs/microservices`: Soporte para microservicios
- `@nestjs/typeorm`: Integración con TypeORM
- `typeorm`: ORM para manejo de BD
- `pg`: Driver para PostgreSQL
- `bcrypt`: Encriptación de contraseñas

## Instalación

Las dependencias ya están configuradas en el proyecto. Para instalar las dependencias del workspace:

```bash
pnpm install
```

## Ejecución

Asegúrate de que PostgreSQL y NATS estén ejecutándose, luego inicia el microservicio:

```bash
# Desarrollo
pnpm --filter @une/auth-ms start:dev

# Producción
pnpm --filter @une/auth-ms start:prod
```

## Testing

Para ejecutar las pruebas:

```bash
# Pruebas unitarias
pnpm --filter @une/auth-ms test

# Pruebas e2e
pnpm --filter @une/auth-ms test:e2e

# Cobertura
pnpm --filter @une/auth-ms test:cov
```

## Flujo de Autenticación Típico

1. **Registro**: Cliente envía `auth.register` con credenciales
2. **Login**: Cliente envía `auth.login` con email y contraseña
3. **Obtención de Token**: La respuesta incluye un token válido
4. **Verificación**: Para cada solicitud autorizada, cliente envía `auth.token.verify`
5. **Logout**: Usuario envía `auth.logout` para finalizar sesión

## Mejoras Futuras

- [ ] Implementar JWT con RS256
- [ ] Agregar refresh tokens
- [ ] Implementar 2FA con TOTP
- [ ] Agregar recuperación de contraseña
- [ ] Implementar roles y permisos
- [ ] Agregar auditoría de accesos
- [ ] Migrar blacklist de tokens a Redis
