# 🚀 QUICK START - Podman + Frontend + Backend

## ⚡ Opción 1: AUTOMATIZADO (Recomendado)

```powershell
pwsh .\podman-startup.ps1
```

Luego selecciona:
1. **Opción 1** para inicio rápido (construir + iniciar)
2. **Opción 10** para iniciar Frontend en nueva terminal

---

## ⚡ Opción 2: MANUAL (Paso a paso)

### Terminal 1: Iniciar Backend + Microservicios

```bash
cd d:\tesisReact\backend

# Iniciar máquina Podman (si es necesario)
podman machine start

# Construir imágenes (primera vez solamente)
podman-compose -f docker-compose.prod.yml build

# Iniciar servicios
podman-compose -f docker-compose.prod.yml up -d

# Verificar estado
podman-compose -f docker-compose.prod.yml ps
```

### Terminal 2: Iniciar Frontend

```bash
cd d:\tesisReact\frontend
npm install
npm run dev
```

### Terminal 3: Ver logs (opcional)

```bash
cd d:\tesisReact\backend
podman-compose -f docker-compose.prod.yml logs -f
```

---

## 🌐 Acceso a Servicios

| Servicio | URL | Credenciales |
|----------|-----|---|
| **Frontend** | http://localhost:4321 | Demo: admin/admin123 |
| **API Gateway** | http://localhost:3000 | - |
| **Auth MS** | http://localhost:3001 | - |
| **Circuitos MS** | http://localhost:3002 | - |
| **PostgreSQL** | localhost:5432 | auth_user/auth_password |
| **Redis** | localhost:6379 | - |
| **NATS** | localhost:4222 | - |

---

## 🛑 Detener Todo

```bash
cd d:\tesisReact\backend
podman-compose -f docker-compose.prod.yml down
```

---

## 📋 Comandos Comunes

```bash
# Ver logs de un servicio específico
podman-compose -f docker-compose.prod.yml logs -f auth-ms

# Reiniciar un servicio
podman-compose -f docker-compose.prod.yml restart auth-ms

# Ejecutar comando en un contenedor
podman exec -it postgres-auth psql -U auth_user -d auth_db

# Ver todas las imágenes
podman image list

# Ver todos los contenedores
podman container list -a

# Limpiar todo (CUIDADO!)
podman-compose down -v
podman system prune -af
```

---

## 🐛 Si algo falla

### "podman: command not found"
```bash
# Instalar Podman
choco install podman
# O descargar: https://github.com/containers/podman/releases
```

### "Cannot connect to Podman"
```bash
podman machine start
podman system info
```

### "Puerto ya está en uso"
```bash
# Cambiar puerto en docker-compose.prod.yml
# Ej: cambiar "3000:3000" por "3001:3000"
```

---

## 📚 Más información

- 📖 [PODMAN_GUIDE.md](PODMAN_GUIDE.md) - Guía completa
- 📖 [DOCKER_DEPLOYMENT.md](backend/DOCKER_DEPLOYMENT.md) - Despliegue detallado
- 📖 [TEST_REPORT.md](TEST_REPORT.md) - Pruebas
- 📖 [TESTING_GUIDE.md](TESTING_GUIDE.md) - Guía de testing

---

**Creado**: 2025-04-25  
**Compatibilidad**: Windows, macOS, Linux
