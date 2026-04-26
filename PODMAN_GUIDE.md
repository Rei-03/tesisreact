# 🐳 Guía de Despliegue con Podman

## Inicio Rápido

Podman es compatible con Docker Compose, así que usaremos los mismos comandos. La principal diferencia es usar `podman-compose` en lugar de `docker-compose`.

---

## 📋 Requisitos Previos

### 1. Instalar Podman
```powershell
# En Windows (usando Chocolatey)
choco install podman

# O descargar desde: https://github.com/containers/podman/releases
```

### 2. Iniciar el servicio Podman (si es necesario)
```powershell
podman machine start
podman system info  # Verificar que está funcionando
```

### 3. Instalar podman-compose
```bash
pip install podman-compose

# O si usas otra plataforma
sudo apt install podman-compose  # Linux
brew install podman-compose      # macOS
```

---

## 🚀 Opción 1: DESARROLLO (sin contenedores)

### Frontend + Backend localmente

```powershell
# Terminal 1: Backend con Turbo
cd d:\tesisReact\backend
pnpm install
pnpm dev

# Terminal 2: Frontend
cd d:\tesisReact\frontend
npm install
npm run dev

# Terminal 3: Test endpoints
cd d:\tesisReact
pwsh .\test-endpoints.ps1
```

**Puertos:**
- Frontend: http://localhost:4321
- API Gateway: http://localhost:3000
- Auth MS: http://localhost:3001
- Circuitos MS: http://localhost:3002
- Rotaciones MS: http://localhost:3003

---

## 🚀 Opción 2: PRODUCCIÓN (con Podman)

### Paso 1: Construir imágenes

```bash
cd backend

# Con docker-compose (alternativa a Podman)
docker-compose -f docker-compose.prod.yml build

# O con Podman (compatible)
podman-compose -f docker-compose.prod.yml build
```

### Paso 2: Iniciar los servicios

```bash
# Iniciar en background (-d)
podman-compose -f docker-compose.prod.yml up -d

# O sin background (para ver logs en tiempo real)
podman-compose -f docker-compose.prod.yml up
```

### Paso 3: Verificar estado

```bash
# Ver contenedores en ejecución
podman-compose -f docker-compose.prod.yml ps

# o simplemente
podman ps
```

### Paso 4: Ver logs

```bash
# Todos los servicios
podman-compose -f docker-compose.prod.yml logs -f

# Servicio específico
podman-compose -f docker-compose.prod.yml logs -f auth-ms
podman-compose -f docker-compose.prod.yml logs -f circuitos-ms
podman-compose -f docker-compose.prod.yml logs -f redis
podman-compose -f docker-compose.prod.yml logs -f postgres

# Últimas 50 líneas
podman-compose -f docker-compose.prod.yml logs --tail=50
```

### Paso 5: Detener servicios

```bash
# Detener sin eliminar volúmenes (preservar datos)
podman-compose -f docker-compose.prod.yml down

# Detener y eliminar TODO (incluyendo volúmenes y datos)
podman-compose -f docker-compose.prod.yml down -v
```

---

## 📊 Servicios en Contenedores

Con Podman, tu stack estará así:

| Servicio | Puerto | URL | Contenedor |
|----------|--------|-----|-----------|
| **NATS** (Message Broker) | 4222 | nats://localhost:4222 | nats-server |
| **PostgreSQL** | 5432 | postgresql://localhost:5432 | postgres-auth |
| **Redis** | 6379 | redis://localhost:6379 | redis-cache |
| **Auth MS** | 3001 | http://localhost:3001 | auth-ms |
| **Circuitos MS** | 3002 | http://localhost:3002 | circuitos-ms |
| **Rotaciones MS** | 3003 | http://localhost:3003 | rotaciones-ms |
| **API Gateway** | 3000 | http://localhost:3000 | api-gateway |
| **Frontend** | N/A | http://localhost:4321 | Ejecución local |

---

## 🔧 Operaciones Comunes

### Ejecutar comando en un contenedor

```bash
# Conectar a la base de datos PostgreSQL
podman exec -it postgres-auth psql -U auth_user -d auth_db

# Ver archivos en un contenedor
podman exec -it auth-ms ls -la /app

# Ejecutar script dentro del contenedor
podman exec -it auth-ms npm run seed
```

### Reiniciar un servicio específico

```bash
podman-compose -f docker-compose.prod.yml restart auth-ms
```

### Reconstruir una imagen específica

```bash
podman-compose -f docker-compose.prod.yml build auth-ms

# Con no-cache (forzar rebuild completo)
podman-compose -f docker-compose.prod.yml build --no-cache auth-ms
```

### Acceder a un contenedor interactivamente

```bash
# Abrir bash en el contenedor
podman exec -it auth-ms /bin/bash

# o con podman run
podman run -it --rm auth-ms bash
```

---

## 🌐 Conectarse a Servicios

### PostgreSQL (desde local)
```bash
# Cliente psql
psql -h localhost -p 5432 -U auth_user -d auth_db

# Con contraseña: auth_password
```

### Redis (desde local)
```bash
# Cliente redis-cli
redis-cli -h localhost -p 6379

# Comandos útiles:
# > PING
# > KEYS *
# > FLUSHALL
```

### NATS (desde local)
```bash
# Ver métricas
curl http://localhost:8222

# NATS CLI
nats server info -s localhost:4222
```

---

## 🐛 Troubleshooting

### Error: "podman-compose: command not found"
```bash
pip install podman-compose
```

### Error: "Cannot connect to Podman"
```bash
# Iniciar máquina Podman
podman machine start

# Verificar estado
podman system info
```

### Las imágenes no se construyen
```bash
# Limpiar imágenes antiguas
podman image prune -a

# Reconstruir sin cache
podman-compose -f docker-compose.prod.yml build --no-cache
```

### Puerto ya en uso
```bash
# Ver qué usa el puerto 3000 (ejemplo)
lsof -i :3000

# O matar el proceso
kill -9 <PID>

# Alternativa: cambiar puerto en docker-compose.yml
# Cambiar "3000:3000" a "3001:3000"
```

### Volúmenes no persisten
```bash
# Verificar volúmenes
podman volume ls

# Inspeccionar un volumen
podman volume inspect postgres-data

# Limpiar volúmenes no usados
podman volume prune
```

---

## 📝 Variables de Entorno

Crear archivo `.env` en `backend/`:

```env
# JWT
JWT_SECRET=tu-clave-super-segura-cambiar-en-produccion

# Base de datos
DB_HOST=postgres-auth
DB_PORT=5432
DB_USER=auth_user
DB_PASSWORD=auth_password
DB_NAME=auth_db

# Redis
REDIS_URL=redis://redis-cache:6379

# NATS
NATS_URL=nats://nats-server:4222

# API
API_PORT=3000
AUTH_MS_PORT=3001
CIRCUITOS_MS_PORT=3002
ROTACIONES_MS_PORT=3003
```

---

## 🚀 Script para Automatizar (Opcional)

Crear archivo `start-with-podman.ps1`:

```powershell
#!/usr/bin/env pwsh

Write-Host "╔════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  Iniciando stack con Podman            ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════╝" -ForegroundColor Cyan

# Verificar Podman
Write-Host "`n✓ Verificando Podman..." -ForegroundColor Yellow
podman version > $null 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Podman no está instalado" -ForegroundColor Red
    exit 1
}

# Iniciar máquina Podman (si es necesario)
Write-Host "✓ Iniciando máquina Podman..." -ForegroundColor Yellow
podman machine start 2>&1 | Out-Null

# Navegar al backend
Set-Location "d:\tesisReact\backend"

# Construir imágenes
Write-Host "`n✓ Construyendo imágenes..." -ForegroundColor Yellow
podman-compose -f docker-compose.prod.yml build

if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Error al construir imágenes" -ForegroundColor Red
    exit 1
}

# Iniciar servicios
Write-Host "`n✓ Iniciando servicios..." -ForegroundColor Yellow
podman-compose -f docker-compose.prod.yml up -d

# Esperar a que los servicios estén listos
Write-Host "`n⏳ Esperando a que los servicios estén listos..." -ForegroundColor Cyan
Start-Sleep -Seconds 5

# Mostrar estado
Write-Host "`n✓ Estado de los servicios:" -ForegroundColor Green
podman-compose -f docker-compose.prod.yml ps

Write-Host "`n✓ Stack iniciado correctamente" -ForegroundColor Green
Write-Host "`n📊 Acceso a servicios:"
Write-Host "  - API Gateway: http://localhost:3000"
Write-Host "  - Auth MS: http://localhost:3001"
Write-Host "  - Circuitos MS: http://localhost:3002"
Write-Host "  - PostgreSQL: localhost:5432"
Write-Host "  - Redis: localhost:6379"
Write-Host "  - NATS: localhost:4222`n"
```

Ejecutar con:
```powershell
pwsh .\start-with-podman.ps1
```

---

## 📚 Comandos Rápidos

| Tarea | Comando |
|-------|---------|
| Ver estado | `podman-compose ps` |
| Ver logs | `podman-compose logs -f` |
| Detener todo | `podman-compose down` |
| Detener + eliminar datos | `podman-compose down -v` |
| Reiniciar servicio | `podman-compose restart auth-ms` |
| Reconstruir | `podman-compose build --no-cache` |
| Ejecutar comando | `podman exec -it postgres-auth bash` |
| Limpiar | `podman system prune -a` |

---

## ℹ️ Diferencias Docker vs Podman

| Aspecto | Docker | Podman |
|--------|--------|--------|
| Daemon | Requerido | No (sin daemon) |
| Permisos | Requiere sudo | Sin sudo (rootless) |
| docker-compose | docker-compose | podman-compose (compatible) |
| Comandos | Idénticos excepto algunos flags |

Podman es **100% compatible** con docker-compose, solo reemplaza `docker` y `docker-compose` con `podman` y `podman-compose`.

---

**¿Preguntas? Revisa DOCKER_DEPLOYMENT.md para más detalles.**
