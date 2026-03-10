# Auth Module - API Gateway

Este módulo implementa el controlador de autenticación en el API Gateway que actúa como intermediario entre las solicitudes HTTP del cliente y el microservicio de autenticación (auth-ms) a través de NATS.

## Estructura

```
auth/
├── auth.module.ts          # Módulo principal
├── auth.controller.ts      # Controlador HTTP
├── dto/
│   ├── register.dto.ts     # DTO para registro
│   ├── login.dto.ts        # DTO para login
│   ├── logout.dto.ts       # DTO para logout
│   ├── verify-token.dto.ts # DTO para verificación de token
│   ├── refresh-token.dto.ts # DTO para refrescar token
│   └── index.ts            # Exportaciones
└── index.ts                # Exportaciones principales
```

## Message Patterns Mapeados

El controlador mapea los siguientes endpoints HTTP a message patterns NATS del auth-ms:

### 1. Registrar Usuario
```
POST /auth/register
Body: RegisterDto {
  email: string;
  name: string;
  password: string;
  role?: string; // default: 'user'
}
→ Message Pattern: auth.register
```

### 2. Iniciar Sesión
```
POST /auth/login
Body: LoginDto {
  email: string;
  password: string;
}
→ Message Pattern: auth.login
```

### 3. Cerrar Sesión
```
POST /auth/logout
Body: LogoutDto {
  userId: string;
  token?: string;
}
→ Message Pattern: auth.logout
```

### 4. Verificar Token
```
POST /auth/verify
Body: VerifyTokenDto {
  token: string;
}
→ Message Pattern: auth.token.verify
```

### 5. Refrescar Tokens
```
POST /auth/refresh
Body: RefreshTokenDto {
  refreshToken: string;
}
→ Message Pattern: auth.token.refresh
```

## Implementación Técnica

### RxJS Integration
El controlador utiliza RxJS `firstValueFrom()` para convertir observables NATS a Promesas:

```typescript
return firstValueFrom(
  this.client.send('auth.register', registerDto)
);
```

Esta aproximación permite:
- Mantener la reactividad de RxJS bajo el capó
- Retornar Promesas que se convierten automáticamente a JSON en respuestas HTTP
- Compatible con async/await en handlers

### NATS ClientProxy
Se inyecta mediante `@Inject('NatsService')` - proporcionado globalmente por `NatsModule`:
- Configurado en `src/nats/nats.module.ts`
- Usa URL de NATS desde variable de entorno `NATS_URLS`
- Transport: `Transport.NATS` con `reply_to` implícito para Request-Reply

## Flujo Completo de Comunicación

```
HTTP Request
    ↓
auth.controller.ts
    ↓
ClientProxy.send() (RxJS Observable)
    ↓
firstValueFrom() (Convert to Promise)
    ↓
NATS Message Sent to auth-ms
    ↓
auth-ms processes (auth.controller.ts)
    ↓
NATS Reply Message
    ↓
Promise resolves
    ↓
HTTP Response JSON
```

## Uso

Una vez desplegado, el módulo está disponible en:
- Base URL: `/auth`
- Endpoints: `/register`, `/login`, `/logout`, `/verify`, `/refresh`

### Ejemplo con curl
```bash
# Register
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "name": "John Doe",
    "password": "securepass123"
  }'

# Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepass123"
  }'

# Verify Token
curl -X POST http://localhost:3000/auth/verify \
  -H "Content-Type: application/json" \
  -d '{
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }'
```

## Consideraciones de Producción

1. **Validación de DTOs**: Considera añadir decoradores de `class-validator` para validación robusta
2. **Manejo de Errores**: Implementar error handling y custom exception filters
3. **Logging**: Añadir logging de solicitudes/respuestas importante para debugging
4. **Rate Limiting**: Considerar rate limiting en endpoints de auth
5. **CORS**: Configurar apropiadamente según requisitos
6. **Guards**: Implementar guards para proteger rutas que requieran autenticación

## Próximos Pasos

- [ ] Añadir validación con class-validator
- [ ] Implementar custom exception filters
- [ ] Crear e implementar auth guard para rutas protegidas
- [ ] Añadir logging estructurado
- [ ] Implementar rate limiting
- [ ] Escribir tests e2e
