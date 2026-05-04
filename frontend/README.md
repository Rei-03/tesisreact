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

## 🚀 Quick Start

### Requisitos Previos
- Node.js 16 o superior
- npm, yarn, pnpm o bun

### Instalación

```bash
npm install
```

### Desarrollo

```bash
npm run dev
```

Abre [http://localhost:4321](http://localhost:4321) en tu navegador para ver la aplicación.

### Build Producción

```bash
npm run build
npm start
```

## 📁 Estructura del Proyecto

```
frontend/
├── app/                          # Rutas y layouts de Next.js
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

- [Next.js](https://nextjs.org) - Framework React
- [React](https://react.dev) - Librería UI
- JavaScript/TypeScript

## 📝 Scripts Disponibles

- `npm run dev` - Inicia servidor de desarrollo
- `npm run build` - Crea build de producción
- `npm start` - Inicia servidor de producción
- `npm run lint` - Ejecuta linter

## 🔐 Autenticación

La aplicación utiliza un contexto de autenticación (`AuthContext`) para gestionar sesiones de usuario y control de acceso.

---

**Proyecto académico de Tesis en React**
