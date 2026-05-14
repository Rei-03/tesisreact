# Proyecto SIGERE - Frontend

Aplicación frontend desarrollada con [Next.js](https://nextjs.org) para el sistema de gestión de rotaciones y seguimiento de incidentes.

## 📋 Descripción

Sistema integral de gestión con módulos para:
- **Dashboard**: Panel principal con resumen de información
- **Aseguramientos**: Gestión de aseguramientos
- **Circuitos**: Administración de circuitos
- **Rotaciones**: Control de rotaciones de personal
- **Reportes**: Generación y visualización de reportes
- **Usuarios**: Gestión de usuarios del sistema
- **Configuración**: Ajustes y configuración del sistema
- **Autenticación**: Sistema seguro de login

## 🚀 Inicialización

### Requisitos Previos
- Node.js 18 o superior
- npm, yarn, pnpm o bun

### Pasos de Inicialización

1. **Instalar dependencias:**
   ```bash
   npm install
   ```

2. **Configurar variables de entorno:**
   ```bash
   cp .env.example .env.local
   ```
   Edita el archivo `.env.local` y configura las variables necesarias (URL del backend, etc.)

3. **Iniciar servidor de desarrollo:**
   ```bash
   npm run dev
   ```

4. **Abrir aplicación:**
   Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

### Scripts Disponibles

- `npm run dev` - Inicia servidor de desarrollo (puerto 3000)
- `npm run build` - Crea build de producción
- `npm start` - Inicia servidor de producción
- `npm run lint` - Ejecuta linter
- `npm run typecheck` - Verifica tipos TypeScript

## 🏗️ Estructura del Proyecto

```
frontend/
├── app/                          # Rutas y layouts de Next.js (App Router)
│   ├── layout.js                # Layout principal
│   ├── page.js                  # Página de inicio
│   ├── dashboard/               # Módulo Dashboard
│   ├── usuarios/                # Módulo Usuarios
│   ├── circuitos/               # Módulo Circuitos
│   ├── aseguramientos/          # Módulo Aseguramientos
│   ├── reportes/                # Módulo Reportes
│   ├── configuracion/           # Módulo Configuración
│   └── loguin/                  # Página de Login
├── components/                  # Componentes reutilizables
│   ├── Sidebar.jsx             # Barra lateral de navegación
│   └── RotacionModal.jsx        # Modal para rotaciones
├── contexts/                    # React Contexts
│   └── AuthContext.jsx          # Contexto de autenticación
├── lib/                         # Utilidades y servicios
│   ├── api/                     # Cliente API
│   ├── services/                # Servicios de negocio
│   └── utils/                   # Funciones utilitarias
├── public/                      # Archivos estáticos
│   └── data/                    # Datos estáticos (municipios, etc)
└── styles/                      # Estilos globales
```

## 🔧 Servicios Disponibles

- **apiClient**: Cliente para comunicación con el backend
- **rotacionService**: Gestión de rotaciones
- **usuariosService**: Operaciones con usuarios
- **reportesService**: Generación de reportes
- **preferencesService**: Preferencias del usuario

## 🛠️ Tecnologías

- [Next.js](https://nextjs.org) - Framework React (App Router)
- [React](https://react.dev) - Librería UI
- JavaScript/TypeScript

## 🔐 Autenticación

La aplicación utiliza un contexto de autenticación (`AuthContext`) para gestionar sesiones de usuario y control de acceso.

---

**Proyecto académico de Tesis en React**
