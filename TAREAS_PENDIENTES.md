# 📋 Tareas Pendientes - Sistema de Rotación de Circuitos

## 🔐 1. Autenticación y Usuarios

### Login
- [ ] Conectar login con backend/base de datos
- [ ] Reemplazar credenciales hardcodeadas
- [ ] Validar usuarios contra base de datos
- [ ] Implementar JWT o sesiones seguras
- [ ] Manejo de errores de autenticación

### Gestión de Usuarios (`/usuarios`)
- [ ] **Funcionalidad de eliminar usuarios** (botón sin acción actualmente)
- [ ] Conectar creación de usuarios con backend
- [ ] Validar que el login sea único
- [ ] Agregar campo de contraseña al crear usuarios
- [ ] Funcionalidad de editar usuarios existentes
- [ ] Cambiar roles (admin/operador)
- [ ] Persistencia en base de datos

---

## 📊 2. Dashboard (`/dashboard`)

- [ ] Conectar datos reales:
  - [ ] Déficit de generación desde API/BD
  - [ ] MW afectados en tiempo real
  - [ ] MW asegurados desde BD
  - [ ] Alertas activas dinámicas
- [ ] Gráfico con datos históricos reales
- [ ] Actualización en tiempo real (WebSockets o polling)
- [ ] Auto-refresh del gráfico

---

## ⚡ 3. Circuitos (`/circuitos`)

- [ ] Conectar con backend:
  - [ ] Obtener circuitos apagados desde API/BD
  - [ ] Algoritmo de propuesta de rotación real
  - [ ] Registrar rotación en BD
  - [ ] Actualizar estado de circuitos
- [ ] Funcionalidades adicionales:
  - [ ] Filtros (por bloque, zona, estado)
  - [ ] Búsqueda de circuitos
  - [ ] Paginación si hay muchos circuitos
  - [ ] Historial de rotaciones

---

## 🗺️ 4. Mapa (`/mapa`)

- [ ] Conectar datos reales:
  - [ ] Coordenadas reales de circuitos desde BD
  - [ ] Estados actualizados en tiempo real
  - [ ] Actualizar marcadores dinámicamente
- [ ] Mejoras de UX:
  - [ ] Popups con más información
  - [ ] Filtros por estado en el mapa
  - [ ] Clusters cuando hay muchos puntos
  - [ ] Zoom automático a circuitos afectados

---

## 🛡️ 5. Aseguramientos (`/aseguramientos`)

- [ ] Funcionalidad completa:
  - [ ] Conectar con BD para obtener aseguramientos
  - [ ] **Crear nuevos aseguramientos** (botón sin acción)
  - [ ] **Editar aseguramientos existentes** (botón sin acción)
  - [ ] **Eliminar aseguramientos** (botón sin acción)
  - [ ] Validar horarios para aseguramientos temporales

---

## 📄 6. Páginas Faltantes

### Reportes (`/reportes`)
- [ ] **Crear página** (no existe, solo está en el menú)
- [ ] Generar reportes PDF/Excel
- [ ] Filtros por fecha, tipo, etc.
- [ ] Historial de reportes

### Configuración (`/configuracion`)
- [ ] **Crear página** (no existe, solo está en el menú)
- [ ] Configuración del sistema
- [ ] Parámetros de rotación
- [ ] Configuración de alertas

---

## 🔌 7. Backend/API

### Estructura de API
- [ ] Definir endpoints REST o GraphQL
- [ ] Autenticación (JWT)
- [ ] Middleware de autorización
- [ ] Validación de datos

### Endpoints Necesarios
- [ ] `POST /api/auth/login`
- [ ] `GET /api/usuarios`
- [ ] `POST /api/usuarios`
- [ ] `PUT /api/usuarios/:id`
- [ ] `DELETE /api/usuarios/:id`
- [ ] `GET /api/circuitos`
- [ ] `POST /api/circuitos/rotacion`
- [ ] `GET /api/dashboard/estado`
- [ ] `GET /api/aseguramientos`
- [ ] `POST /api/aseguramientos`
- [ ] `PUT /api/aseguramientos/:id`
- [ ] `DELETE /api/aseguramientos/:id`

---

## 🗄️ 8. Base de Datos

- [ ] Diseñar esquema de BD:
  - [ ] Tabla de usuarios
  - [ ] Tabla de circuitos
  - [ ] Tabla de aseguramientos
  - [ ] Tabla de rotaciones/historial
  - [ ] Tabla de alertas
- [ ] Crear migraciones
- [ ] Crear seeders (datos iniciales)

---

## 🎨 9. Mejoras de UX/UI

- [ ] Feedback al usuario:
  - [ ] Reemplazar `alert()` por notificaciones (toast)
  - [ ] Loading states en todas las operaciones
  - [ ] Mensajes de error más claros
  - [ ] Confirmaciones antes de acciones destructivas
- [ ] Validaciones:
  - [ ] Validación de formularios en frontend
  - [ ] Mensajes de error específicos
  - [ ] Validación de campos requeridos

---

## 🔒 10. Seguridad

- [ ] Implementar:
  - [ ] Protección CSRF
  - [ ] Sanitización de inputs
  - [ ] Rate limiting en login
  - [ ] Encriptación de contraseñas (backend)
  - [ ] Validación de permisos por rol

---

## 🧪 11. Testing

- [ ] Tests unitarios de componentes
- [ ] Tests de integración de API
- [ ] Tests E2E de flujos críticos

---

## 📚 12. Documentación

- [ ] README con instrucciones de instalación
- [ ] Documentación de API
- [ ] Guía de desarrollo
- [ ] Diagramas de arquitectura

---

## 🎯 Prioridades Sugeridas

### 🔴 Alta Prioridad
1. Conectar autenticación con backend
2. Conectar datos del dashboard
3. Implementar CRUD de usuarios con backend
4. Conectar circuitos con datos reales

### 🟡 Media Prioridad
5. Implementar páginas de Reportes y Configuración
6. Conectar mapa con datos reales
7. Completar funcionalidad de aseguramientos

### 🟢 Baja Prioridad
8. Mejoras de UX (toasts, loading states)
9. Testing
10. Documentación completa

---

**Última actualización:** $(date)
**Estado del proyecto:** Frontend funcional con datos simulados, pendiente conexión con backend

