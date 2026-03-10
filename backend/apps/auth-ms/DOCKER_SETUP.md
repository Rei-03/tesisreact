# Configuración de Docker Compose para el Auth Microservice

## Agregar al docker-compose.yml principal

```yaml
  # PostgreSQL para Auth Service
  postgres-auth:
    image: postgres:16-alpine
    container_name: postgres-auth
    environment:
      POSTGRES_USER: auth_user
      POSTGRES_PASSWORD: auth_password
      POSTGRES_DB: auth_db
    ports:
      - "5433:5432"
    volumes:
      - postgres-auth-data:/var/lib/postgresql/data
    networks:
      - turborepo-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U auth_user -d auth_db"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Auth Microservice
  auth-ms:
    build:
      context: .
      dockerfile: ./apps/auth-ms/Dockerfile
    container_name: auth-ms
    environment:
      NODE_ENV: production
      DB_HOST: postgres-auth
      DB_PORT: 5432
      DB_USERNAME: auth_user
      DB_PASSWORD: auth_password
      DB_NAME: auth_db
      DB_SYNCHRONIZE: 'true'
      DB_LOGGING: 'true'
      NATS_URLS: nats://nats:4222
      JWT_SECRET: ${JWT_SECRET:-your-secret-key-change-in-production}
      JWT_EXPIRES_IN: 24h
    depends_on:
      postgres-auth:
        condition: service_healthy
      nats:
        condition: service_started
    networks:
      - turborepo-network
    restart: unless-stopped

volumes:
  postgres-auth-data:

networks:
  turborepo-network:
    driver: bridge
```

## Dockerfile para auth-ms

Ubicación: `apps/auth-ms/Dockerfile`

```dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

# Instalar dependencias
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile

# Copiar código
COPY . .

# Construir
WORKDIR /app
RUN pnpm --filter @une/auth-ms build

# Runtime
FROM node:20-alpine

WORKDIR /app

# Instalar dependencias de producción
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile --prod

# Copiar build desde builder
COPY --from=builder /app/apps/auth-ms/dist ./apps/auth-ms/dist

EXPOSE 3002

ENV NODE_ENV=production

CMD ["node", "apps/auth-ms/dist/main.js"]
```

## Variables de Entorno para Docker Compose

En el archivo `.env` en la raíz del proyecto:

```env
JWT_SECRET=tu-secret-key-muy-segura-aqui
```

## Comandos útiles

### Ejecutar solo auth-ms con su BD
```bash
# Desarrollo
docker-compose up postgres-auth auth-ms -d

# Ver logs
docker-compose logs -f auth-ms

# Detener
docker-compose down
```

### Verificar la salud del servicio
```bash
# Verificar que postgres está listo
docker-compose exec postgres-auth pg_isready -U auth_user -d auth_db

# Verificar logs del servicio
docker-compose logs postgres-auth
docker-compose logs auth-ms
```

## Testing del Auth Service

### Usando NATS CLI o herramienta similar

1. **Registrar usuario:**
```json
Subject: auth.register
{
  "email": "usuario@test.com",
  "name": "Juan Test",
  "password": "securePassword123"
}
```

2. **Login:**
```json
Subject: auth.login
{
  "email": "usuario@test.com",
  "password": "securePassword123"
}
```

3. **Verificar token:**
```json
Subject: auth.token.verify
{
  "token": "base64-encoded-token-aqui"
}
```

4. **Logout:**
```json
Subject: auth.logout
{
  "userId": "user-uuid-aqui"
}
```

## Troubleshooting

### Conexión a PostgreSQL rechazada
- Verificar que postgres-auth está corriendo: `docker-compose ps postgres-auth`
- Verificar credenciales en variables de entorno
- Esperar a que postgres inicie completamente (10-15 segundos)

### Auth-ms no se conecta a NATS
- Verificar que NATS está corriendo: `docker-compose ps nats`
- Verificar que NATS_URLS es correcto: `nats://nats:4222`
- Ver logs: `docker-compose logs nats`

### Errores de migración de BD
- Asegurar que DB_SYNCHRONIZE=true en variables de entorno
- Si hay conflictos, eliminar el volumen: `docker volume rm postgres-auth-data`
- Reiniciar el contenedor: `docker-compose restart postgres-auth`
