# Auth MS - Redis Token Blacklist Implementation

## Descripción

El Auth microservicio ahora utiliza Redis para mantener una blacklist de tokens revocados (logout). Esta implementación reemplaza el almacenamiento en memoria, proporcionando escalabilidad y persistencia.

## Archivos Modificados/Creados

### 1. `src/redis/redis.module.ts` (NUEVO)

Módulo global que proporciona la conexión a Redis:

```typescript
@Global()
@Module({
  providers: [
    {
      provide: 'REDIS_CLIENT',
      useFactory: async () => {
        const client = createClient({
          socket: {
            host: env.REDIS_HOST,
            port: env.REDIS_PORT,
          },
        });
        await client.connect();
        return client;
      },
    },
  ],
  exports: ['REDIS_CLIENT'],
})
export class RedisModule {}
```

**Características:**
- Crea cliente Redis lazy-loading
- Maneja automaticamente la conexión
- Exporta globalmente `REDIS_CLIENT`
- Logs de conexión/error

### 2. `src/config/env.ts` (ACTUALIZADO)

Variables de entorno agregadas:

```typescript
REDIS_HOST: z.string().default("redis"),      // Host del contenedor Redis
REDIS_PORT: z.coerce.number().max(65535).default(6379),
```

### 3. `src/app.module.ts` (ACTUALIZADO)

Importado `RedisModule`:

```typescript
@Module({
  imports: [
    TypeOrmModule.forRoot({ ... }),
    NatsModule,
    RedisModule,  // ← NUEVO
    AuthModule,
  ],
  ...
})
```

### 4. `src/auth/auth.service.ts` (ACTUALIZADO)

Cambios principales:

**Inyección de Redis:**
```typescript
constructor(
  private readonly userRepository: Repository<User>,
  private readonly jwtService: JwtService,
  @Inject('REDIS_CLIENT') private readonly redisClient: RedisClient,
) {}
```

**Nuevos métodos privados:**

```typescript
/**
 * Agrega un token a la lista negra en Redis
 * Usa el tiempo de expiración del JWT como TTL
 */
private async addToBlacklist(token: string): Promise<void> {
  const payload = this.jwtService.decode<JwtPayload>(token);
  if (!payload || !payload.exp) return;

  const now = Math.floor(Date.now() / 1000);
  const ttl = payload.exp - now;

  if (ttl > 0) {
    const blacklistKey = `blacklist:${token}`;
    await this.redisClient.setEx(blacklistKey, ttl, '1');
  }
}

/**
 * Verifica si un token está en la lista negra de Redis
 */
private async isTokenBlacklisted(token: string): Promise<boolean> {
  const blacklistKey = `blacklist:${token}`;
  const exists = await this.redisClient.exists(blacklistKey);
  return exists === 1;
}
```

**Métodos actualizados:**
- `logout()`: Ahora usa `await this.addToBlacklist(token)`
- `verifyToken()`: Ahora usa `await this.isTokenBlacklisted(token)`
- `refreshToken()`: Ahora usa `await this.isTokenBlacklisted(refreshToken)`

### 5. `docker-compose.yml` (ACTUALIZADO)

Servicio Redis agregado:

```yaml
redis:
  image: redis:7-alpine
  container_name: redis-cache
  ports:
    - "6379:6379"
  command: redis-server --appendonly yes
  volumes:
    - redis-data:/data
  networks:
    - app-network
  healthcheck:
    test: ["CMD", "redis-cli", "ping"]
    interval: 10s
    timeout: 5s
    retries: 5
  restart: unless-stopped
```

## Flujo de Blacklist con Redis

### 1. **Logout**
```
POST /logout
  ↓
logout(logoutDto)
  ↓
addToBlacklist(token)
  ↓
Decodificar JWT → Obtener exp (timestamp)
  ↓
setEx("blacklist:{token}", ttl, '1')
  ↓
Token se borra automáticamente cuando expira
```

### 2. **Verificación de Token**
```
POST /verify
  ↓
verifyToken(verifyTokenDto)
  ↓
isTokenBlacklisted(token)
  ↓
exists("blacklist:{token}") ?
  ├─ SI → Token revocado ✗
  └─ NO → Verificar JWT normalmente ✓
```

## Ventajas de Redis

✅ **Escalabilidad**: Sin límite de memoria como Set en memoria  
✅ **Persistencia**: `--appendonly yes` guarda datos en disco  
✅ **TTL Automático**: Se borra automáticamente al expirar el JWT  
✅ **Performance**: O(1) lookup  
✅ **Clustering**: Preparado para múltiples instancias  

## Instalación de Dependencias

```bash
pnpm add redis --filter @une/auth-ms
```

✅ **Ya instalada**

## Variables de Entorno Recomendadas

Crear o actualizar `.env` en `/backend/apps/auth-ms/.env`:

```env
# Redis
REDIS_HOST=redis
REDIS_PORT=6379

# Si se ejecuta localmente sin Docker:
# REDIS_HOST=localhost
# REDIS_PORT=6379
```

## Despliegue

### Con Docker Compose

```bash
# En la raíz de /backend
docker-compose up -d

# Verificar que Redis está corriendo
docker-compose logs redis
redis-cli ping
# PONG ✓
```

### Localmente

Si deseas ejecutar sin Docker, instala Redis:

```bash
# Windows (WSL) / Linux
redis-server

# Verificar
redis-cli ping
# PONG ✓
```

## Monitoreo

### Comandos Redis útiles

```bash
# Conectarse a Redis
redis-cli

# Ver todas las claves de blacklist
KEYS blacklist:*

# Ver información de una clave
TTL blacklist:{token}

# Limpiar todas las blacklists
FLUSHDB

# Estadísticas
INFO
```

## Consideraciones de Producción

1. **Contraseña Redis**: Agregar `requirepass` en redis.conf
2. **SSL/TLS**: Usar `--tls` en producción
3. **ACL**: Configurar usuarios y permisos
4. **Backup**: Configurar estrategia de backup de datos
5. **Monitoring**: Configurar alertas para caídas de Redis
6. **Replicación**: Considera master-slave setup

## Troubleshooting

### Error: "connect ECONNREFUSED 127.0.0.1:6379"

**Solución**: Redis no está corriendo
```bash
# Verificar si Redis está activo
redis-cli ping

# Si no responde, iniciar Redis
docker-compose up redis -d
```

### Error: "WRONGPASS invalid username-password pair"

**Solución**: Agregar `--requirepass` en redis.conf si lo usas
```typescript
// En redis.module.ts
const client = createClient({
  socket: { host, port },
  password: env.REDIS_PASSWORD,
});
```

## Próximos Pasos

- [ ] Agregar métodos de auditoría para log de logouts
- [ ] Implementar dashboard de monitoring
- [ ] Configurar sentinel para alta disponibilidad
- [ ] Implementar caché de tokens válidos
