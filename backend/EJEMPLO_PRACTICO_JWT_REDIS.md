# Ejemplo Práctico Completo: JWT Local + Redis

## 🎯 El flujo paso a paso

### 1️⃣ Usuario se registra

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "juan@example.com",
    "name": "Juan Pérez",
    "password": "password123",
    "role": "user"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "juan@example.com",
    "name": "Juan Pérez",
    "role": "user",
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1NTBlODQwMC1lMjliLTQxZDQtYTcxNi00NDY2NTU0NDAwMDAiLCJlbWFpbCI6Imp1YW5AZXhhbXBsZS5jb20iLCJyb2xlIjoidXNlciIsImlhdCI6MTcxMDUyMDgwMCwiZXhwIjoxNzEwNTM0MjAwfQ.SIGNATURE",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1NTBlODQwMC1lMjliLTQxZDQtYTcxNi00NDY2NTU0NDAwMDAiLCJlbWFpbCI6Imp1YW5AZXhhbXBsZS5jb20iLCJyb2xlIjoidXNlciIsImlhdCI6MTcxMDUyMDgwMCwiZXhwIjoxNzExMTI1NjAwfQ.SIGNATURE",
    "tokenType": "Bearer"
  }
}
```

**¿Qué sucedió internamente?**
```
1. API Gateway: Recibe POST /auth/register
2. API Gateway: Envía NATS 'auth.register' a auth-ms
3. Auth-MS: Valida email único
4. Auth-MS: Hash la contraseña con bcrypt
5. Auth-MS: Almacena usuario en PostgreSQL
6. Auth-MS: Genera accessToken (15 min)
7. Auth-MS: Genera refreshToken (7 días)
8. Auth-MS: Devuelve tokens a API Gateway
9. API Gateway: Retorna al cliente
```

### 2️⃣ Usuario hace request a endpoint protegido

**Cliente almacena y envía token:**
```bash
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1NTBlODQwMC1lMjliLTQxZDQtYTcxNi00NDY2NTU0NDAwMDAiLCJlbWFpbCI6Imp1YW5AZXhhbXBsZS5jb20iLCJyb2xlIjoidXNlciIsImlhdCI6MTcxMDUyMDgwMCwiZXhwIjoxNzEwNTM0MjAwfQ.SIGNATURE"

curl -X GET http://localhost:3000/api/recurso \
  -H "Authorization: Bearer $TOKEN"
```

**¿Qué sucedió internamente?**
```
1. API Gateway: Recibe GET /api/recurso con header Authorization
2. JwtAuthGuard intercepta el request:
   ✅ Extrae token del header (Bearer ...)
   ✅ Verifica firma JWT localmente (SIN llamada a auth-ms) ⚡
      - Decodifica: { sub, email, role, iat, exp }
      - Verifica firma con JWT_SECRET
      - Valida que no esté expirado
   ✅ Verifica si está en blacklist en Redis (SIN llamada a auth-ms) ⚡
      - Pregunta: ¿existe blacklist:TOKEN?
      - Respuesta: NO
   ✅ Token válido → agrega req.user = { userId, email, role, name }
3. Controlador procesa con req.user disponible
4. Retorna respuesta al cliente
```

**Time:** 1-5ms (comparado con 50-100ms antes)

### 3️⃣ Token expira (15 minutos después)

**Usuario intenta hacer otro request:**
```bash
curl -X GET http://localhost:3000/api/recurso \
  -H "Authorization: Bearer $TOKEN"  # Mismo token, pero ahora expirado
```

**Response:**
```json
{
  "message": "Token inválido o expirado",
  "statusCode": 401
}
```

**¿Qué sucedió internamente?**
```
1. JwtAuthGuard intercepta
2. Intenta verificar JWT localmente
3. jwtService.verify() falla porque exp < ahora
4. Lanza UnauthorizedException
5. Cliente recibe 401
```

### 4️⃣ Usuario usa Refresh Token para obtener nuevos tokens

```bash
REFRESH_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

curl -X POST http://localhost:3000/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken": "'$REFRESH_TOKEN'"}'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.NEW_TOKEN.SIGNATURE",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.NEW_TOKEN.SIGNATURE",
    "tokenType": "Bearer"
  }
}
```

**¿Qué sucedió internamente?**
```
1. API Gateway: Recibe POST /auth/refresh
2. API Gateway: Envía NATS 'auth.token.refresh' a auth-ms
3. Auth-MS: Verifica refreshToken es válido
4. Auth-MS: Busca usuario en PostgreSQL
5. Auth-MS: Genera nuevos tokens (acceso 15 min, refresh 7 días)
6. Auth-MS: Devuelve nuevos tokens
7. Cliente almacena nuevos tokens
```

### 5️⃣ Usuario hace logout

```bash
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."  # Token actual

curl -X POST http://localhost:3000/auth/logout \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"userId": "550e8400-e29b-41d4-a716-446655440000"}'
```

**Response:**
```json
{
  "success": true,
  "message": "Logout exitoso",
  "data": null
}
```

**¿Qué sucedió internamente?**
```
1. API Gateway: JwtAuthGuard valida el token (es válido)
2. API Gateway: AuthController.logout() ejecuta
3. API Gateway: Envía NATS 'auth.logout' a auth-ms
4. Auth-MS: Calcula TTL del token (15 min - tiempo usado)
5. Auth-MS: Agrega token a Redis: blacklist:TOKEN (con TTL)
6. Redis: Automáticamente borra entrada después de TTL
7. Cliente borra tokens del localStorage
```

### 6️⃣ Usuario intenta reutilizar el token revocado

```bash
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."  # Token que hizo logout

curl -X GET http://localhost:3000/api/recurso \
  -H "Authorization: Bearer $TOKEN"
```

**Response:**
```json
{
  "message": "Token revocado",
  "statusCode": 401
}
```

**¿Qué sucedió internamente?**
```
1. JwtAuthGuard intercepta
2. ✅ Verifica firma JWT: VÁLIDA (todavía está firma-ticamente válido)
3. ✅ Verifica blacklist en Redis:
   - Pregunta: ¿existe blacklist:TOKEN?
   - Respuesta: SÍ ✅ ESTÁ REVOCADO
4. ❌ Lanza UnauthorizedException: "Token revocado"
5. Cliente recibe 401
```

## 🔍 Estado en Redis

### Después del logout, Redis contiene:

```bash
# Verificar desde línea de comandos
redis-cli -h redis -p 6379

# Listar todos los tokens revocados
KEYS "blacklist:*"
# Output:
# blacklist:eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
# blacklist:eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Ver cuánto tiempo falta para que expire
TTL "blacklist:eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
# Output: 842  (segundos restantes)

# Después de que expire
TTL "blacklist:eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
# Output: -2  (no existe)
```

## 📊 Comparativa: Antes vs Después

### Endpoint protegido - Flujo

**ANTES (NATS):**
```
Request
  ↓
API Gateway
  ↓
NATS (50-100ms) → Auth-MS
  ↓
Auth-MS valida contra BD
  ↓
NATS ← API Gateway
  ↓
Controlador procesa
  ↓
Response (Total: 100-150ms)
```

**DESPUÉS (JWT Local):**
```
Request
  ↓
API Gateway
  ↓
JwtAuthGuard valida localmente (1-5ms)
  ↓
Redis blacklist check (1-5ms)
  ↓
Controlador procesa
  ↓
Response (Total: 2-10ms)
```

**Mejora: 10-75x más rápido**

## 🧪 Test Completo en Bash

```bash
#!/bin/bash

API="http://localhost:3000"

echo "1. Registrar usuario..."
REGISTER=$(curl -s -X POST $API/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test'$(date +%s)'@example.com",
    "name": "Test User",
    "password": "password123"
  }')

ACCESS_TOKEN=$(echo $REGISTER | jq -r '.data.accessToken')
REFRESH_TOKEN=$(echo $REGISTER | jq -r '.data.refreshToken')

echo "Access Token: ${ACCESS_TOKEN:0:20}..."
echo ""

echo "2. Acceder endpoint protegido..."
PROTECTED=$(curl -s -X GET $API/api/recurso \
  -H "Authorization: Bearer $ACCESS_TOKEN")
echo $PROTECTED | jq '.'
echo ""

echo "3. Logout..."
LOGOUT=$(curl -s -X POST $API/auth/logout \
  -H "Authorization: Bearer $ACCESS_TOKEN")
echo $LOGOUT | jq '.'
echo ""

echo "4. Intentar reutilizar token revocado..."
REVOKED=$(curl -s -X GET $API/api/recurso \
  -H "Authorization: Bearer $ACCESS_TOKEN")
echo $REVOKED | jq '.'
echo ""

echo "5. Refrescar con refreshToken..."
REFRESH=$(curl -s -X POST $API/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken": "'$REFRESH_TOKEN'"}'
)
echo $REFRESH | jq '.'
```

## 🎯 Puntos Clave

| Operación | Tiempo | Donde |
|-----------|--------|-------|
| Validación JWT | 1-2ms | Gateway (local) |
| Verificar blacklist | 1-2ms | Redis |
| Total por request | 2-5ms | Sin NATS |
| Login | 50-100ms | Auth-MS-BD |
| Logout | 50-100ms | Auth-MS-BD + Redis |
| Refresh | 50-100ms | Auth-MS-BD |

Las operaciones de **lectura** (validación) son ultra-rápidas.  
Las operaciones de **escritura** (login, logout, refresh) siguen siendo vía Auth-MS.

## ✅ Conclusión

Con JWT Local + Redis:
- ✅ Validación sin latencia (gateway local)
- ✅ Logout inmediato (Redis blacklist)
- ✅ Permiso/rol actualizado en máximo 15 minutos (duración del token)
- ✅ Escalable sin overhead en auth-ms para validación
- ✅ Costo de infraestructura reducido
