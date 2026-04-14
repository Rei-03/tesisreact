# ===== STAGE 1: BUILDER =====
FROM node:20-alpine AS builder

WORKDIR /app

# Instalar pnpm
RUN npm install -g pnpm

# Copiar archivos de configuración de workspace
COPY pnpm-workspace.yaml pnpm-lock.yaml ./
COPY package.json ./

# Copiar packages comunes
COPY packages/ ./packages/

# Copiar app específica
COPY apps/auth-ms/ ./apps/auth-ms/

# Instalar todas las dependencias
RUN pnpm install --frozen-lockfile

# Compilar la aplicación
RUN cd apps/auth-ms && pnpm run build

# ===== STAGE 2: RUNTIME =====
FROM node:20-alpine

WORKDIR /app

# Instalar pnpm
RUN npm install -g pnpm

# Copiar archivos de configuración del workspace
COPY pnpm-workspace.yaml pnpm-lock.yaml ./
COPY package.json ./

# Copiar archivo .env
COPY .env ./

# Copiar packages comunes
COPY packages/ ./packages/

# Copiar app específica
COPY apps/auth-ms/ ./apps/auth-ms/

# Hacer install en modo reproducible sin actualizaciones
RUN pnpm install --frozen-lockfile --prefer-offline

# Copiar dist compilado desde builder
COPY --from=builder /app/apps/auth-ms/dist ./apps/auth-ms/dist

# Variables de entorno por defecto
ENV NODE_ENV=production
ENV PORT=3001

# Simple health check - just verify app file exists
HEALTHCHECK --interval=10s --timeout=5s --retries=5 --start-period=30s \
  CMD test -f apps/auth-ms/dist/main.js || exit 1

# Exponer puerto
EXPOSE 3001

# Comando de inicio
CMD ["node", "apps/auth-ms/dist/main.js"]
