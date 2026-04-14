# Docker Compose - Despliegue en Producción

## Descripción

Este archivo `docker-compose.prod.yml` configura el stack completo de la aplicación para producción, incluyendo:

- **Infraestructura:**
  - NATS (Message Broker)
  - PostgreSQL 18 (Base de datos)
  - Redis 7 (Cache)

- **Microservicios:**
  - `auth-ms` - Autenticación y JWT (puerto 3001)
  - `circuitos-ms` - Gestión de circuitos (puerto 3002)
  - `rotaciones-ms` - Algoritmo de rotaciones (puerto 3003)
  - `api-gateway` - Gateway API (puerto 3000)

## Características de los Dockerfiles

### Multi-etapa (Multi-Stage)

Cada Dockerfile utiliza 2 etapas para optimizar el tamaño de la imagen:

1. **BUILDER**: Instala dependencias (incluyendo devDependencies) y compila el código
2. **RUNTIME**: Copia solo los archivos compilados e instala solo dependencias de producción

**Beneficio**: Reduce el tamaño de la imagen final en ~60-70% eliminando archivos de compilación y devDependencies.

### Ejemplo de tamaño reducido:
- **Sin optimización**: ~800 MB
- **Con multi-etapa**: ~250-300 MB

## Requisitos Previos

```bash
# Instalar Docker y Docker Compose
# - Docker >= 20.10
# - Docker Compose >= 2.0
```

## Uso

### 1. Construir las imágenes

```bash
cd backend
docker-compose -f docker-compose.prod.yml build
```

Este comando construirá las imágenes para todos los microservicios usando los Dockerfiles multi-etapa.

### 2. Iniciar los servicios

```bash
docker-compose -f docker-compose.prod.yml up -d
```

### 3. Ver logs

```bash
# Todos los servicios
docker-compose -f docker-compose.prod.yml logs -f

# Servicio específico
docker-compose -f docker-compose.prod.yml logs -f auth-ms

# Últimas 100 líneas
docker-compose -f docker-compose.prod.yml logs -f --tail=100
```

### 4. Verificar estado

```bash
docker-compose -f docker-compose.prod.yml ps
```

### 5. Detener los servicios

```bash
docker-compose -f docker-compose.prod.yml down
```

### 6. Detener y eliminar volúmenes

```bash
docker-compose -f docker-compose.prod.yml down -v
```

## Variables de Entorno

El archivo define variables centralizadas que se pasan a cada servicio:

```yaml
JWT_SECRET: Tu nueva clave secreta
NATS_URL: nats://nats-server:4222
DATABASE_URL: postgresql://auth_user:auth_password@postgres-auth:5432/auth_db
REDIS_URL: redis://redis-cache:6379
```

### Personalización

Para cambiar variables en producción:

1. **Opción 1: Archivo `.env`**
   ```bash
   # Crear archivo .env en backend/
   JWT_SECRET=tu-clave-segura-cambiar
   ```

2. **Opción 2: Variable de entorno**
   ```bash
   export JWT_SECRET=tu-clave-segura-cambiar
   docker-compose -f docker-compose.prod.yml up -d
   ```

3. **Opción 3: Editar en tiempo de ejecución**
   ```bash
   docker-compose -f docker-compose.prod.yml \
     -e JWT_SECRET=tu-clave-segura \
     up -d
   ```

## Healthchecks

Cada servicio incluye un healthcheck que verifica cada 10 segundos si está funcionando:

```yaml
healthcheck:
  test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:3000/health"]
  interval: 10s
  timeout: 5s
  retries: 5
  start_period: 10s
```

Ver estado:
```bash
docker-compose -f docker-compose.prod.yml ps
```

## Redes

Todos los servicios están en la red `app-network` con configuración bridge, permitiendo comunicación interna con DNS automático:

- `nats-server:4222`
- `postgres-auth:5432`
- `redis-cache:6379`
- `auth-ms:3001`
- `circuitos-ms:3002`
- `rotaciones-ms:3003`
- `api-gateway:3000`

## Volúmenes Persistentes

Los datos se persisten en volúmenes Docker:

- `nats-data`: Datos de NATS
- `postgres-data`: Base de datos PostgreSQL
- `redis-data`: Datos de Redis

Ver volúmenes:
```bash
docker volume ls | grep app-network
```

Limpiar volúmenes:
```bash
docker-compose -f docker-compose.prod.yml down -v
```

## Órdenes de Inicio

El archivo define dependencias para garantizar el orden correcto:

1. `nats`, `postgres`, `redis` (servicios de infraestructura)
2. `auth-ms`, `circuitos-ms`, `rotaciones-ms` (microservicios)
3. `api-gateway` (depende de todos, último en iniciar)

Cada servicio espera que sus dependencias pasen el healthcheck antes de iniciar.

## Puertos Mapeados

| Servicio | Puerto Interno | Puerto Host |
|----------|----------------|------------|
| NATS | 4222 | 4222 |
| PostgreSQL | 5432 | 5432 |
| Redis | 6379 | 6379 |
| Auth MS | 3001 | 3001 |
| Circuitos MS | 3002 | 3002 |
| Rotaciones MS | 3003 | 3003 |
| API Gateway | 3000 | 3000 |

## Monitoreo

### Verificar conectividad

```bash
# Probar NATS
docker-compose -f docker-compose.prod.yml exec nats nats account list

# Probar PostgreSQL
docker-compose -f docker-compose.prod.yml exec postgres-auth psql -U auth_user -d auth_db -c "\l"

# Probar Redis
docker-compose -f docker-compose.prod.yml exec redis-cache redis-cli ping
```

### Troubleshooting

```bash
# Ver logs de un contenedor específico
docker-compose -f docker-compose.prod.yml logs auth-ms

# Ejecutar comando en un contenedor
docker-compose -f docker-compose.prod.yml exec auth-ms sh

# Ver uso de recursos
docker stats

# Inspeccionar red
docker network inspect app-network
```

## Optimizaciones

### Tamaño de Imagen
- Base: `node:20-alpine` (170MB)
- Multi-etapa: Elimina devDependencies y archivos de compilación
- .dockerignore: Excluye archivos innecesarios

### Cache de Build
Docker Compose cachea capas automáticamente:
```bash
# Evitar caché
docker-compose -f docker-compose.prod.yml build --no-cache
```

### Restart Policy
Todos los servicios tienen `restart: unless-stopped` para recuperación automática en caso de fallo.

## Consideraciones de Seguridad

⚠️ **IMPORTANTE para Producción:**

1. Cambiar todas las contraseñas por defecto:
   - `POSTGRES_PASSWORD` en postgres
   - `JWT_SECRET` en los microservicios

2. Usar variables de entorno seguras (no hardcodeadas)

3. Implementar HTTPS/TLS

4. Limitar acceso a puertos en firewall

5. Usar secrets de Docker en lugar de variables de entorno

6. Configurar backups automáticos de base de datos

7. Monitorear logs y métricas

## Performance Tuning

### PostgreSQL

```yaml
environment:
  POSTGRES_INITDB_ARGS: "--max_connections=500 --shared_buffers=256MB"
```

### Redis

```yaml
command: redis-server --maxmemory 1gb --maxmemory-policy allkeys-lru
```

### NATS

```yaml
environment:
  NATS_URL: nats://nats-server:4222
  MAX_CONNECTIONS: 1000
```

## Referencias

- [Docker Compose Docs](https://docs.docker.com/compose/)
- [Docker Multi-stage Builds](https://docs.docker.com/build/building/multi-stage/)
- [NestJS Docker Guide](https://docs.nestjs.com/deployment/docker)
