# 🚀 Despliegue en Producción

## Quick Start

```bash
# 1. En la carpeta backend/
cd backend

# 2. Configurar variables de entorno
cp .env.prod.example .env

# 3. Editar .env con tus valores
nano .env  # o tu editor favorito

# 4. Hacer el script ejecutable (solo Linux/Mac)
chmod +x deploy.sh

# 5. Construir imágenes
./deploy.sh build
# o: docker-compose -f docker-compose.prod.yml build

# 6. Iniciar servicios
./deploy.sh up
# o: docker-compose -f docker-compose.prod.yml up -d

# 7. Verificar estado
./deploy.sh ps
# o: docker-compose -f docker-compose.prod.yml ps
```

## Estructura

```
backend/
├── docker-compose.prod.yml       # Configuración de producción
├── .env.prod.example             # Variables de ejemplo
├── .dockerignore                 # Archivos a excluir en build
├── deploy.sh                     # Script auxiliar
├── DOCKER_DEPLOYMENT.md          # Documentación detallada
└── apps/
    ├── api-gateway/Dockerfile
    ├── auth-ms/Dockerfile
    ├── circuitos-ms/Dockerfile
    └── rotaciones-ms/Dockerfile
```

## Comandos Principales

### Con el script `deploy.sh`

```bash
# Construir imágenes
./deploy.sh build

# Iniciar servicios en background
./deploy.sh up

# Ver estado
./deploy.sh ps

# Ver logs en tiempo real
./deploy.sh logs -f

# Logs de servicio específico
./deploy.sh logs -s auth-ms -f

# Reiniciar servicio específico
./deploy.sh restart -s api-gateway

# Detener servicios
./deploy.sh down

# Limpiar todo (contenedores + volúmenes)
./deploy.sh clean

# Validar configuración
./deploy.sh validate

# Ver healthcheck
./deploy.sh health
```

### Con Docker Compose directamente

```bash
# Construir
docker-compose -f docker-compose.prod.yml build

# Iniciar
docker-compose -f docker-compose.prod.yml up -d

# Ver estado
docker-compose -f docker-compose.prod.yml ps

# Logs
docker-compose -f docker-compose.prod.yml logs -f

# Logs de servicio específico
docker-compose -f docker-compose.prod.yml logs -f auth-ms

# Detener
docker-compose -f docker-compose.prod.yml down

# Limpiar
docker-compose -f docker-compose.prod.yml down -v
```

## Configuración

### 1. Variables de Entorno

Copia y edita el archivo de ejemplo:

```bash
cp .env.prod.example .env
```

**Variables críticas:**
- `JWT_SECRET`: Clave secreta para JWT (cambia SIEMPRE en producción)
- `POSTGRES_PASSWORD`: Contraseña de base de datos
- Todas las contraseñas y secretos

### 2. Puertos

Por defecto:
- **API Gateway**: 3000
- **Auth MS**: 3001
- **Circuitos MS**: 3002
- **Rotaciones MS**: 3003
- **NATS**: 4222
- **PostgreSQL**: 5432
- **Redis**: 6379

Puedes cambiarlos en el `docker-compose.prod.yml`

### 3. Volúmenes Persistentes

Los datos se guardan en volúmenes Docker:

```bash
# Ver volúmenes
docker volume ls

# Inspeccionar volumen
docker volume inspect backend_postgres-data

# Backup de datos
docker run --rm -v backend_postgres-data:/data -v $(pwd):/backup alpine tar czf /backup/postgres-backup.tar.gz -C /data .

# Restaurar backup
docker run --rm -v backend_postgres-data:/data -v $(pwd):/backup alpine tar xzf /backup/postgres-backup.tar.gz -C /data
```

## Monitoreo

### Ver logs

```bash
# Todos los servicios (últimas 100 líneas, actualización en tiempo real)
docker-compose -f docker-compose.prod.yml logs -f --tail=100

# Servicio específico
docker-compose -f docker-compose.prod.yml logs -f auth-ms

# Sin actualización en tiempo real
docker-compose -f docker-compose.prod.yml logs
```

### Estado de servicios

```bash
# Ver si todos están healthy
docker-compose -f docker-compose.prod.yml ps

# Detalles de salud
docker inspect -f '{{.State.Health.Status}}' auth-ms
```

### Verificar conectividad

```bash
# NATS
docker-compose -f docker-compose.prod.yml exec nats nats account list

# PostgreSQL
docker-compose -f docker-compose.prod.yml exec postgres-auth psql -U auth_user -d auth_db -c "SELECT version();"

# Redis
docker-compose -f docker-compose.prod.yml exec redis-cache redis-cli PING
```

## Troubleshooting

### Los servicios no inician

```bash
# Ver logs de error
docker-compose -f docker-compose.prod.yml logs

# Verificar que los puertos están disponibles
netstat -an | grep LISTEN | grep 3000

# Liberar puerto
sudo lsof -ti:3000 | xargs kill -9  # Unix
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process  # Windows
```

### Aplicación se reinicia constantemente

```bash
# Ver número de restarts
docker-compose -f docker-compose.prod.yml ps

# Ver logs detallados
docker-compose -f docker-compose.prod.yml logs -f --tail=50
```

### Base de datos no conecta

```bash
# Verificar servicio PostgreSQL
docker-compose -f docker-compose.prod.yml exec postgres-auth pg_isready

# Ver variables de conexión
docker inspect backend_postgres-auth | grep -i env

# Probar conexión manual
docker-compose -f docker-compose.prod.yml exec postgres-auth psql -U auth_user -d auth_db
```

### Redis no responde

```bash
# Verificar servicio Redis
docker-compose -f docker-compose.prod.yml exec redis-cache redis-cli PING

# Ver memoria usada
docker-compose -f docker-compose.prod.yml exec redis-cache redis-cli INFO memory
```

## Seguridad

⚠️ **IMPORTANTE:**

1. **Cambiar todas las contraseñas por defecto**
   ```bash
   JWT_SECRET=generador-de-contraseña-segura
   POSTGRES_PASSWORD=otro-secreto-seguro
   ```

2. **Usar HTTPS**
   - Configurar reverse proxy (nginx, traefik)
   - Obtener certificados SSL/TLS
   - Redirigir HTTP a HTTPS

3. **Limitar acceso a puertos**
   ```bash
   # UFW (Ubuntu/Debian)
   sudo ufw allow 3000  # Solo API Gateway público
   sudo ufw deny 4222   # NATS no accesible externamente
   ```

4. **Backups automáticos**
   ```bash
   # Cron job para backup diario
   0 2 * * * cd /path/to/backend && docker run --rm -v backend_postgres-data:/data -v $(pwd)/backups:/backup alpine tar czf /backup/backup_$(date +\%Y\%m\%d).tar.gz -C /data .
   ```

5. **Monitoreo y alertas**
   - Implementar healthchecks
   - Configurar alertas en logs
   - Monitorear uso de recursos

## Performance

### Optimizaciones aplicadas

- **Multi-stage Docker builds**: Reduce tamaño de imagen ~70%
- **Alpine Linux**: Base mínima, segura y rápida
- **Healthchecks**: Recuperación automática de fallos
- **Dependency constraints**: Instala solo lo necesario

### Tamaño de imágenes esperado

```
auth-ms          ~290 MB
circuitos-ms     ~290 MB
rotaciones-ms    ~290 MB
api-gateway      ~290 MB
postgres         ~80 MB
redis            ~60 MB
nats             ~90 MB
─────────────────────────
Total aproximado ~1.5 GB
```

## Actualizaciones

### Actualizar una imagen

```bash
# 1. Cambios de código
git pull origin main

# 2. Reconstruir
docker-compose -f docker-compose.prod.yml build auth-ms

# 3. Reiniciar
docker-compose -f docker-compose.prod.yml up -d auth-ms

# 4. Verificar
docker-compose -f docker-compose.prod.yml logs -f auth-ms
```

### Actualizar todas las imágenes

```bash
git pull origin main
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d
```

## Rollback

```bash
# Volver a versión anterior si algo falla
git checkout HEAD~1
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d
```

## Escalado

Para escalar servicios según demanda:

```yaml
# docker-compose.prod.yml
services:
  auth-ms:
    deploy:
      replicas: 3  # 3 instancias
    ports:
      - "3001-3003:3001"  # Puertos automáticos
```

Requiere load balancer en Kubernetes o Docker Swarm.

## Referencias

- [Docker Compose Docs](https://docs.docker.com/compose/)
- [Docker Best Practices](https://docs.docker.com/develop/dockerfile_best-practices/)
- [Production Checklist](https://docs.docker.com/config/containers/resource_constraints/)
- [DOCKER_DEPLOYMENT.md](./DOCKER_DEPLOYMENT.md) - Guía completa

## Soporte

Para problemas:

1. Revisar logs: `./deploy.sh logs -f`
2. Verificar estado: `./deploy.sh ps`
3. Validar config: `./deploy.sh validate`
4. Ver healthchecks: `./deploy.sh health`
