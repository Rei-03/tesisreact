# 🎯 REFERENCIA RÁPIDA: Autenticación Centralizada + Refresh Tokens

## ✅ Lo que se implementó

### 1. **Refresh Tokens en Auth MS** ✓
- Access Token: **15 minutos**
- Refresh Token: **7 días**
- Ambos se generan en login/register

### 2. **Autenticación Centralizada en API Gateway** ✓

#### Guards (Protección)
```typescript
📁 api-gateway/src/auth/guards/
├── jwt-auth.guard.ts      → Valida JWT contra auth-ms
├── roles.guard.ts          → Valida roles del usuario
└── index.ts
```

#### Decoradores (Sintaxis simplificada)
```typescript
📁 api-gateway/src/auth/decorators/
├── auth.decorators.ts      → @RequireAuth() y @Roles()
└── index.ts
```

#### Enum de Roles
```typescript
📁 api-gateway/src/auth/dto/
└── user-role.enum.ts       → UserRole: ADMIN, USER
```

### 3. **AuthController Mejorado**
```typescript
// Endpoints actualizado en api-gateway/src/auth/auth.controller.ts

POST /auth/register           ✓ (Público)
POST /auth/login              ✓ (Público)
POST /auth/refresh            ✓ (Público - usa refreshToken)
POST /auth/logout             🔒 (Protegido con @UseGuards)
POST /auth/verify             🔒 (Protegido con @UseGuards)
POST /auth/me                 🔒 (Protegido con @UseGuards) - NUEVO
```

### 4. **Documentación Completa**
```
📁 backend/
├── RESUMEN_IMPLEMENTACION_AUTH.md     → Este documento
├── AUTENTICACION_CENTRALIZADA.md      → Para otros MS
└── apps/
    ├── api-gateway/
    │   └── src/auth/AUTHENTICATION_GUIDE.md
    └── circuitos-ms/
        └── src/auth/EJEMPLO_PROTECCION.md
            └── guards/auth.guard.ts    → Guard listo para copiar
```

## 🚀 USO INMEDIATO

### Proteger un endpoint en API Gateway

```typescript
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './auth/guards';

@Controller('mi-ruta')
export class MiController {
  @UseGuards(JwtAuthGuard)
  @Post('protegido')
  async mi_endpoint(@Req() req: any) {
    // req.user = { userId, email, role, name }
    const usuarioId = req.user.userId;
    return { ok: true };
  }
}
```

### Proteger endpoint con roles

```typescript
import { UseGuards, SetMetadata } from '@nestjs/common';
import { JwtAuthGuard, RolesGuard } from './auth/guards';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminController {
  @SetMetadata('roles', ['admin'])
  @Post('panel')
  async adminPanel(@Req() req: any) {
    // Solo usuarios con rol "admin" pueden acceder
  }
}
```

### En otros Microservicios

Copiar `auth.guard.ts` desde `circuitos-ms/src/auth/guards/` y usar igual:

```typescript
import { AuthGuard } from './auth/guards/auth.guard';

@UseGuards(AuthGuard)
@Post('crear')
async crear(@Req() req: any) {
  // Mismo patrón que en API Gateway
}
```

## 📊 Endpoints del Auth MS (via NATS)

```
auth.register       → AuthController.register()
auth.login         → AuthController.login()
auth.logout        → AuthController.logout()
auth.token.verify  → AuthController.verifyToken()
auth.token.refresh → AuthController.refreshToken()
```

## 🔐 Tabla Comparativa: Antes vs Después

| Aspecto | Antes | Después |
|---------|-------|---------|
| **Expiración de Token** | 24 horas | Access: 15 min, Refresh: 7 días |
| **Protección en Gateway** | ❌ No | ✅ Sí (JwtAuthGuard) |
| **Validación de Roles** | ❌ No | ✅ Sí (RolesGuard) |
| **Logout instantáneo** | ❌ Después 24h | ✅ Inmediato (Redis) |
| **Endpoint /me** | ❌ No | ✅ Sí (GET /auth/me) |
| **Decoradores** | ❌ No | ✅ @RequireAuth(), @Roles() |
| **Documentación** | ❌ Parcial | ✅ Completa |

## 💾 Variables de Entorno (sin cambios necesarios)

Ya están configuradas en `auth-ms/.env`:
```env
JWT_SECRET=your-secret-key-change-in-production
JWT_ACCESS_TOKEN_EXPIRES_IN=15m      # ⬅️ Access token
JWT_REFRESH_TOKEN_EXPIRES_IN=7d      # ⬅️ Refresh token
```

Para cambiar duración (opcional):
```env
JWT_ACCESS_TOKEN_EXPIRES_IN=1h        # Si prefieres 1 hora
JWT_REFRESH_TOKEN_EXPIRES_IN=30d      # Si prefieres 30 días
```

## 🔄 Flujo de Refresh Token (Cliente)

```javascript
// 1. Almacenar tokens después de login
const { accessToken, refreshToken } = loginResponse.data;
localStorage.setItem('accessToken', accessToken);
localStorage.setItem('refreshToken', refreshToken);

// 2. En cada request, enviar access token
const headers = {
  'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
};

// 3. Si retorna 401 (expirado), refrescar
if (response.status === 401) {
  const refreshResponse = await fetch('/auth/refresh', {
    method: 'POST',
    body: JSON.stringify({
      refreshToken: localStorage.getItem('refreshToken')
    })
  });
  
  const newTokens = refreshResponse.json().data;
  localStorage.setItem('accessToken', newTokens.accessToken);
  localStorage.setItem('refreshToken', newTokens.refreshToken);
  
  // Reintentar request con nuevo token
}

// 4. En logout
const logoutResponse = await fetch('/auth/logout', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` }
});

localStorage.removeItem('accessToken');
localStorage.removeItem('refreshToken');
```

## 📋 Archivos Creados/Modificados

### ✨ Nuevos
```
api-gateway/src/auth/guards/jwt-auth.guard.ts
api-gateway/src/auth/guards/roles.guard.ts
api-gateway/src/auth/guards/index.ts
api-gateway/src/auth/decorators/auth.decorators.ts
api-gateway/src/auth/decorators/index.ts
api-gateway/src/auth/dto/user-role.enum.ts
api-gateway/src/auth/AUTHENTICATION_GUIDE.md

circuitos-ms/src/auth/guards/auth.guard.ts
circuitos-ms/src/auth/EJEMPLO_PROTECCION.md

RESUMEN_IMPLEMENTACION_AUTH.md
AUTENTICACION_CENTRALIZADA.md
```

### 🔄 Modificados
```
api-gateway/src/auth/auth.module.ts          (agregó providers)
api-gateway/src/auth/auth.controller.ts      (agregó Guards y endpoint /me)
```

## 🎓 Aprender Más

1. **AUTENTICACIÓN_GUIDE.md** - Guía completa con ejemplos
2. **AUTENTICACION_CENTRALIZADA.md** - Cómo integrar en otros MS
3. **EJEMPLO_PROTECCION.md** - Ejemplos prácticos
4. **JWT_SETUP.md** - Detalles técnicos (ya existente)

## ❓ Preguntas Comunes

**P: ¿Cómo protejo un endpoint?**
```typescript
@UseGuards(JwtAuthGuard)
@Post('mi-endpoint')
async metodo(@Req() req: any) { }
```

**P: ¿Cómo accedo al usuario autenticado?**
```typescript
// req.user contiene:
{
  userId: "uuid...",
  email: "usuario@example.com",
  role: "user",
  name: "Juan"
}
```

**P: ¿Qué pasa si el token expira?**
R: El cliente recibe 401, debe hacer POST /auth/refresh con el refreshToken para obtener nuevos tokens.

**P: ¿Cómo agregarlo a otro MS?**
R: Copiar guard, crear auth.module.ts, usar @UseGuards(AuthGuard). Ver AUTENTICACION_CENTRALIZADA.md

**P: ¿Se puede cambiar duración de tokens?**
R: Sí, en auth-ms/.env cambiar JWT_ACCESS_TOKEN_EXPIRES_IN y JWT_REFRESH_TOKEN_EXPIRES_IN

## ✨ Resumen

✅ **Refresh Tokens implementados** - Mejor UX + seguridad  
✅ **Autenticación centralizada** - Un solo lugar para validar  
✅ **Guards reutilizables** - Proteger cualquier endpoint  
✅ **Documentación completa** - Ejemplos y guías  
✅ **Escalable** - Listo para más MS  
✅ **Seguro** - JWT + bcrypt + Redis blacklist  

**Status: LISTO PARA USAR**
