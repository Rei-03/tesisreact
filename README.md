
## Inicialización

### Requisitos Previos
- Node.js 18 o superior
- npm, yarn, pnpm o bun

### Pasos de Inicialización

1. **Instalar dependencias del Frontend:**
   ```bash
   cd frontend
   npm install
   ```

2. **Instalar dependencias del Backend:**
   ```bash
   cd backend
   npm install
   ```

3. **Configurar variables de entorno:**
   
   Frontend:
   ```bash
   cd frontend
   cp .env.example .env.local
   # Edita .env.local con la URL del backend
   ```
   
   Backend:
   ```bash
   cd backend
   cp .env.example .env
   # Edita .env con configuración de BD, Redis, etc.
   ```

4. **Iniciar servicios de desarrollo:**

   Terminal 1 - Backend:
   ```bash
   cd backend
   npm run dev
   ```

   Terminal 2 - Frontend:
   ```bash
   cd frontend
   npm run dev
   ```

