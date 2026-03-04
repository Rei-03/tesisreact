# Especificación de API Backend - SGRC
## Sistema de Gestión de Rotación de Circuitos Eléctricos

**Versión:** 1.0  
**Última actualización:** Febrero 2026  
**Base URL:** `http://localhost:3001/api` (desarrollo)

---

## Tabla de Contenidos

1. [Estructura General](#estructura-general)
2. [Autenticación](#autenticación)
3. [Circuitos](#circuitos)
4. [Aseguramientos](#aseguramientos)
5. [Rotaciones](#rotaciones)
6. [Usuarios](#usuarios)
7. [Reportes](#reportes)
8. [Dashboard](#dashboard)
9. [Configuración](#configuración)
10. [Códigos de Error](#códigos-de-error)

---

## Estructura General

### Base Response

Todas las respuestas deben seguir esta estructura:

```json
{
  "success": true,
  "data": {},
  "message": "Operación exitosa",
  "timestamp": "2026-02-18T10:30:00Z"
}
```

### Headers Requeridos

```
Content-Type: application/json
Authorization: Bearer {token_jwt}
```

### Autenticación

**Token JWT** es requerido en todos los endpoints excepto `/auth/login`.

Incluir en header:
```
Authorization: Bearer {jwt_token}
```

---

## Autenticación

### POST /auth/login
Autentica un usuario y retorna un JWT token.

**Request Body:**
```json
{
  "login": "bcastellano",
  "password": "admin123"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "nombre": "Brayan Castellano",
      "login": "bcastellano",
      "rol": "admin",
      "createdAt": "2025-01-15T00:00:00Z"
    },
    "expiresIn": 3600
  }
}
```

**Response Errors:**
- `401` - Credenciales inválidas
- `404` - Usuario no encontrado

---

### POST /auth/logout
Invalida el token del usuario actual.

**Request:** (Sin body)

**Response (200):**
```json
{
  "success": true,
  "message": "Sesión cerrada exitosamente"
}
```

---

### POST /auth/verify
Verifica si un token JWT es válido.

**Request Header:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "valid": true,
    "user": { ... }
  }
}
```

**Response (401):**
```json
{
  "success": false,
  "message": "Token inválido o expirado"
}
```

---

## Circuitos

Base: `/circuits` o `/circuitos`

### GET /circuits
Obtiene todos los circuitos.

**Query Parameters:**
- `apagable` (boolean, optional) - Filtra solo circuitos apagables
- `bloque` (number, optional) - Filtra por número de bloque
- `zona` (string, optional) - Filtra por zona afectada

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "idCircuitoP": 101,
      "idProv": "CFG",
      "Circuito33": "CIRC-33-A",
      "Bloque": 1,
      "CircuitoP": "Circuito Comercial Centro",
      "Clientes": 1250,
      "ZonaAfectada": "Centro Comercial",
      "Apagable": true
    },
    ...
  ],
  "count": 11
}
```

---

### GET /circuits/:id
Obtiene un circuito específico por ID.

**Path Parameters:**
- `id` (number) - ID del circuito (idCircuitoP)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "idCircuitoP": 101,
    "idProv": "CFG",
    "Circuito33": "CIRC-33-A",
    "Bloque": 1,
    "CircuitoP": "Circuito Comercial Centro",
    "Clientes": 1250,
    "ZonaAfectada": "Centro Comercial",
    "Apagable": true
  }
}
```

**Response Errors:**
- `404` - Circuito no encontrado

---

### GET /circuits/apagables
Obtiene solo los circuitos que pueden ser apagados (Apagable = true).

**Query Parameters:**
- `bloque` (number, optional) - Filtra por bloque
- `zona` (string, optional) - Filtra por zona

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "idCircuitoP": 101,
      "idProv": "CFG",
      "Circuito33": "CIRC-33-A",
      "Bloque": 1,
      "CircuitoP": "Circuito Comercial Centro",
      "Clientes": 1250,
      "ZonaAfectada": "Centro Comercial",
      "Apagable": true
    },
    ...
  ],
  "count": 10
}
```

---

### GET /circuits/bloques
Obtiene los números de bloques disponibles.

**Response (200):**
```json
{
  "success": true,
  "data": [1, 2, 3]
}
```

---

### GET /circuits/:id/proxima-apertura
Obtiene información de próxima apertura de un circuito.

**Path Parameters:**
- `id` (number) - ID del circuito

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id_Circuito": 101,
    "Circiuto": "Circuito Comercial Centro",
    "MWHoraActual": 18.5,
    "Bloque": 1
  }
}
```

---

### POST /circuits
Crea un nuevo circuito (Admin only).

**Request Body:**
```json
{
  "idProv": "CFG",
  "Circuito33": "CIRC-33-N",
  "Bloque": 4,
  "CircuitoP": "Circuito Nuevo",
  "Clientes": 500,
  "ZonaAfectada": "Zona Nueva",
  "Apagable": true
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "idCircuitoP": 114,
    "idProv": "CFG",
    "Circuito33": "CIRC-33-N",
    "Bloque": 4,
    "CircuitoP": "Circuito Nuevo",
    "Clientes": 500,
    "ZonaAfectada": "Zona Nueva",
    "Apagable": true
  }
}
```

---

### PUT /circuits/:id
Actualiza un circuito (Admin only).

**Path Parameters:**
- `id` (number) - ID del circuito

**Request Body:**
```json
{
  "CircuitoP": "Circuito Comercial Centro (Actualizado)",
  "Clientes": 1300,
  "Apagable": true
}
```

**Response (200):**
```json
{
  "success": true,
  "data": { ... circuito actualizado ... }
}
```

---

### DELETE /circuits/:id
Elimina un circuito (Admin only).

**Path Parameters:**
- `id` (number) - ID del circuito

**Response (200):**
```json
{
  "success": true,
  "message": "Circuito eliminado exitosamente"
}
```

---

## Aseguramientos

Base: `/aseguramientos`

### GET /aseguramientos
Obtiene todos los aseguramientos.

**Query Parameters:**
- `activos` (boolean, optional) - Filtra solo aseguramientos activos en la fecha actual
- `fechaDesde` (string, optional) - Formato: YYYY-MM-DD
- `fechaHasta` (string, optional) - Formato: YYYY-MM-DD
- `tipo` (string, optional) - "Permanente", "Programado", "Temporal"

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "id_CircuitoP": 108,
      "CircuitoP": "Circuito Hospitalario Provincial",
      "fechaInicial": "2026-01-01T00:00:00Z",
      "fechaFinal": "2026-12-31T23:59:59Z",
      "Observaciones": "Protección hospitalaria prioritaria - Servicios de emergencia 24/7",
      "mw": 15.7,
      "tipo": "Permanente",
      "createdAt": "2026-01-15T10:30:00Z",
      "createdBy": "bcastellano"
    },
    ...
  ],
  "count": 5
}
```

---

### GET /aseguramientos/:id
Obtiene un aseguramiento específico.

**Path Parameters:**
- `id` (number) - ID del aseguramiento

**Response (200):**
```json
{
  "success": true,
  "data": { ... aseguramiento ... }
}
```

---

### POST /aseguramientos
Crea un nuevo aseguramiento.

**Request Body:**
```json
{
  "id_CircuitoP": 108,
  "fechaInicial": "2026-01-01",
  "fechaFinal": "2026-12-31",
  "Observaciones": "Protección hospitalaria prioritaria",
  "mw": 15.7,
  "tipo": "Permanente"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "id_CircuitoP": 108,
    "CircuitoP": "Circuito Hospitalario Provincial",
    "fechaInicial": "2026-01-01T00:00:00Z",
    "fechaFinal": "2026-12-31T23:59:59Z",
    "Observaciones": "Protección hospitalaria prioritaria",
    "mw": 15.7,
    "tipo": "Permanente",
    "createdAt": "2026-02-18T10:30:00Z",
    "createdBy": "bcastellano"
  }
}
```

**Validaciones:**
- `fechaInicial` debe ser menor a `fechaFinal`
- `id_CircuitoP` debe existir
- `mw` debe ser positivo
- `tipo` debe ser uno de: "Permanente", "Programado", "Temporal"

---

### PUT /aseguramientos/:id
Actualiza un aseguramiento.

**Path Parameters:**
- `id` (number) - ID del aseguramiento

**Request Body:**
```json
{
  "fechaFinal": "2026-06-30",
  "Observaciones": "Protección actualizada",
  "tipo": "Temporal"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": { ... aseguramiento actualizado ... }
}
```

---

### DELETE /aseguramientos/:id
Elimina un aseguramiento.

**Path Parameters:**
- `id` (number) - ID del aseguramiento

**Response (200):**
```json
{
  "success": true,
  "message": "Aseguramiento eliminado exitosamente"
}
```

---

## Rotaciones

Base: `/rotaciones`

### GET /rotaciones
Obtiene el historial de rotaciones.

**Query Parameters:**
- `desde` (string, optional) - Formato: YYYY-MM-DD
- `hasta` (string, optional) - Formato: YYYY-MM-DD
- `bloque` (number, optional) - Filtra por bloque
- `usuario` (string, optional) - Filtra por usuario que ejecutó

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "idRotacion": "ROT-2026-001",
      "fecha": "2026-02-18T14:30:00Z",
      "tipo": "Rotación Programada",
      "bloque": 1,
      "generadoPor": "Juan Pérez",
      "usuario": "jperez",
      "cantidadCircuitos": 4,
      "mwTotal": 74.5,
      "duracion": "2 horas",
      "observaciones": "Rotación normal ejecutada según cronograma",
      "estado": "Completada",
      "circuitos": [
        {
          "idCircuito": 101,
          "nombre": "Circuito Comercial Centro",
          "mw": 18.5
        }
      ]
    },
    ...
  ],
  "count": 5
}
```

---

### GET /rotaciones/:id
Obtiene una rotación específica con detalles completos.

**Path Parameters:**
- `id` (number) - ID de la rotación

**Response (200):**
```json
{
  "success": true,
  "data": { ... rotación con circuitos ... }
}
```

---

### POST /rotaciones/generar
Genera una nueva rotación.

**Request Body:**
```json
{
  "circuitos_propuestos": [101, 102, 107, 111],
  "mw_requerido": 60,
  "mw_total": 74.5,
  "cantidad_circuitos": 4,
  "motivo": "Mantenimiento programado",
  "bloque": 1
}
```

**Validaciones:**
- `circuitos_propuestos` no puede estar vacío
- Todos los circuitos deben ser apagables
- No puede haber circuitos con aseguramientos activos en la fecha actual
- `mw_total` calculado debe ser igual a la suma de MW de circuitos

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "idRotacion": "ROT-2026-001",
    "fecha": "2026-02-18T14:35:00Z",
    "tipo": "Rotación Programada",
    "bloque": 1,
    "generadoPor": "bcastellano",
    "usuario": "bcastellano",
    "cantidadCircuitos": 4,
    "mwTotal": 74.5,
    "duracion": "2 horas",
    "observaciones": "Rotation generada automáticamente",
    "estado": "Pendiente",
    "circuitos": [ ... ]
  }
}
```

**Response Errors:**
- `400` - Validación fallida (circuitos no apagables, asegurados, etc.)
- `409` - Conflicto con aseguramientos activos

---

### PUT /rotaciones/:id
Actualiza el estado de una rotación.

**Path Parameters:**
- `id` (number) - ID de la rotación

**Request Body:**
```json
{
  "estado": "Completada",
  "observaciones": "Rotación completada exitosamente sin incidencias"
}
```

**Estados permitidos:** "Pendiente", "En Ejecución", "Completada", "Cancelada"

**Response (200):**
```json
{
  "success": true,
  "data": { ... rotación actualizada ... }
}
```

---

### DELETE /rotaciones/:id
Cancela una rotación (solo si está en estado "Pendiente").

**Path Parameters:**
- `id` (number) - ID de la rotación

**Response (200):**
```json
{
  "success": true,
  "message": "Rotación cancelada exitosamente"
}
```

---

## Usuarios

Base: `/usuarios`

### GET /usuarios
Obtiene lista de todos los usuarios (Admin only).

**Query Parameters:**
- `activos` (boolean, optional) - Filtra usuarios activos

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "nombre": "Brayan Castellano",
      "login": "bcastellano",
      "rol": "admin",
      "activo": true,
      "createdAt": "2025-01-15T00:00:00Z",
      "lastLogin": "2026-02-18T10:25:00Z"
    },
    {
      "id": 2,
      "nombre": "Carlos López",
      "login": "clopez",
      "rol": "operador",
      "activo": true,
      "createdAt": "2025-02-01T00:00:00Z",
      "lastLogin": "2026-02-18T09:15:00Z"
    },
    ...
  ],
  "count": 3
}
```

---

### GET /usuarios/:id
Obtiene un usuario específico.

**Path Parameters:**
- `id` (number) - ID del usuario

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "nombre": "Brayan Castellano",
    "login": "bcastellano",
    "rol": "admin",
    "activo": true,
    "createdAt": "2025-01-15T00:00:00Z",
    "lastLogin": "2026-02-18T10:25:00Z"
  }
}
```

---

### POST /usuarios
Crea un nuevo usuario (Admin only).

**Request Body:**
```json
{
  "nombre": "Nuevo Usuario",
  "login": "nusuario",
  "password": "securePassword123",
  "rol": "operador",
  "activo": true
}
```

**Validaciones:**
- `nombre` requerido, mínimo 3 caracteres
- `login` requerido, único, mínimo 3 caracteres
- `password` requerido, mínimo 8 caracteres
- `rol` debe ser "admin" u "operador"

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": 4,
    "nombre": "Nuevo Usuario",
    "login": "nusuario",
    "rol": "operador",
    "activo": true,
    "createdAt": "2026-02-18T10:30:00Z"
  }
}
```

---

### PUT /usuarios/:id
Actualiza un usuario.

**Path Parameters:**
- `id` (number) - ID del usuario

**Request Body:**
```json
{
  "nombre": "Nombre Actualizado",
  "rol": "admin",
  "activo": false
}
```

**Response (200):**
```json
{
  "success": true,
  "data": { ... usuario actualizado ... }
}
```

---

### PUT /usuarios/:id/cambiar-contrasena
Cambia la contraseña de un usuario.

**Path Parameters:**
- `id` (number) - ID del usuario

**Request Body:**
```json
{
  "passwordActual": "oldPassword123",
  "passwordNueva": "newPassword456"
}
```

**Validaciones:**
- `passwordActual` debe ser correcta
- `passwordNueva` mínimo 8 caracteres

**Response (200):**
```json
{
  "success": true,
  "message": "Contraseña actualizada exitosamente"
}
```

---

### DELETE /usuarios/:id
Elimina un usuario (Admin only).

**Path Parameters:**
- `id` (number) - ID del usuario

**Response (200):**
```json
{
  "success": true,
  "message": "Usuario eliminado exitosamente"
}
```

---

## Reportes

Base: `/reportes`

### GET /reportes
Obtiene historial de reportes generados.

**Query Parameters:**
- `desde` (string, optional) - Formato: YYYY-MM-DD
- `hasta` (string, optional) - Formato: YYYY-MM-DD
- `tipo` (string, optional) - "Rotación", "Aseguramiento", "Estadístico"

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "idRotacion": "ROT-2026-001",
      "fecha": "2026-02-18T14:30:00Z",
      "tipo": "Rotación Programada",
      "bloque": 1,
      "generadoPor": "Juan Pérez",
      "usuario": "jperez",
      "cantidadCircuitos": 4,
      "mwTotal": 74.5,
      "duracion": "2 horas",
      "observaciones": "Rotación normal ejecutada según cronograma",
      "estado": "Completada"
    },
    ...
  ],
  "count": 5
}
```

---

### GET /reportes/:id
Obtiene un reporte específico con detalles completos.

**Path Parameters:**
- `id` (number) - ID del reporte

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "idRotacion": "ROT-2026-001",
    "fecha": "2026-02-18T14:30:00Z",
    "tipo": "Rotación Programada",
    "bloque": 1,
    "generadoPor": "Juan Pérez",
    "usuario": "jperez",
    "cantidadCircuitos": 4,
    "mwTotal": 74.5,
    "duracion": "2 horas",
    "observaciones": "Rotación normal ejecutada según cronograma",
    "estado": "Completada",
    "circuitos": [
      {
        "idCircuito": 101,
        "nombre": "Circuito Comercial Centro",
        "mw": 18.5
      },
      ...
    ]
  }
}
```

---

### GET /reportes/:id/descargar
Descarga un reporte específico en PDF o Excel.

**Path Parameters:**
- `id` (number) - ID del reporte
- `formato` (query string) - "pdf" (default) o "excel"

**Response:**
- `200` - Archivo binario (application/pdf o application/vnd.openxmlformats-officedocument.spreadsheetml.sheet)
- Nombre sugerido: `reporte_rotacion_{idRotacion}_{fecha}.pdf`

---

### GET /reportes/aseguramientos
Obtiene listado de aseguramientos activos para reportar.

**Query Parameters:**
- `desde` (string, optional) - Formato: YYYY-MM-DD
- `hasta` (string, optional) - Formato: YYYY-MM-DD

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "circuito": "Circuito Hospitalario Provincial",
      "mw": 15.7,
      "tipo": "Permanente",
      "fechaInicial": "2026-01-01T00:00:00Z",
      "fechaFinal": "2026-12-31T23:59:59Z",
      "observaciones": "Protección hospitalaria prioritaria"
    },
    ...
  ],
  "count": 5
}
```

---

### GET /reportes/aseguramientos/descargar
Descarga reporte de aseguramientos.

**Query Parameters:**
- `formato` - "pdf" (default) o "excel"
- `desde` (optional) - Formato: YYYY-MM-DD
- `hasta` (optional) - Formato: YYYY-MM-DD

**Response:**
- `200` - Archivo binario
- Nombre sugerido: `reporte_aseguramientos_{fecha}.pdf`

---

### GET /reportes/estadisticas
Obtiene estadísticas generales del sistema.

**Query Parameters:**
- `desde` (string, optional) - Formato: YYYY-MM-DD
- `hasta` (string, optional) - Formato: YYYY-MM-DD

**Response (200):**
```json
{
  "success": true,
  "data": {
    "totalReportes": 5,
    "totalRotacionesEsteAño": 5,
    "mwTotalApagado": 280.1,
    "circuitosTotales": 11,
    "circuitosApagables": 10,
    "circuitosNoApagables": 1,
    "promedioMWPorRotacion": 56.0,
    "bloquesMasRotados": [
      {
        "bloque": 1,
        "cantidad": 2
      },
      {
        "bloque": 2,
        "cantidad": 2
      },
      {
        "bloque": 3,
        "cantidad": 1
      }
    ],
    "lastRotation": "2026-02-18T14:30:00Z",
    "nextScheduledRotation": "2026-02-19T14:30:00Z",
    "circuitosAsegurados": 5,
    "mwAsegurado": 87.6,
    "clientesAfectados": 8500
  }
}
```

---

### GET /reportes/estadisticas/descargar
Descarga reporte estadístico en PDF.

**Query Parameters:**
- `formato` - "pdf" (default) o "excel"

**Response:**
- `200` - Archivo binario
- Nombre sugerido: `reporte_estadistico_{fecha}.pdf`

---

## Dashboard

Base: `/dashboard`

### GET /dashboard/resumen
Obtiene el resumen general del dashboard.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "totalCircuitosApagables": 10,
    "totalAseguramientosActivos": 5,
    "totalMWAsegurado": 87.6,
    "totalMWDisponible": 192.4,
    "totalClientes": 20000,
    "proximasAperturas": 3,
    "rotacionesUltimas24h": 2,
    "mwApagadoUltimas24h": 149.0,
    "circuitosConProblemas": 0,
    "alertas": [
      {
        "id": 1,
        "tipo": "aseguramiento_proximo_vencer",
        "circuito": "Circuito Educativo",
        "fechaVencimiento": "2026-02-25T00:00:00Z",
        "severidad": "media"
      }
    ]
  }
}
```

---

### GET /dashboard/graficos
Obtiene datos para gráficos del dashboard.

**Query Parameters:**
- `periodo` - "dia", "semana", "mes" (default: "mes")

**Response (200):**
```json
{
  "success": true,
  "data": {
    "rotacionesPorDia": [
      {
        "fecha": "2026-02-18",
        "cantidad": 2,
        "mwTotal": 149.0
      },
      ...
    ],
    "mwApagadoPorBloque": [
      {
        "bloque": 1,
        "mw": 74.5
      },
      {
        "bloque": 2,
        "mw": 49.2
      },
      {
        "bloque": 3,
        "mw": 56.1
      }
    ],
    "distribucionCircuitos": {
      "apagables": 10,
      "noApagables": 1
    }
  }
}
```

---

## Configuración

Base: `/configuracion`

### GET /configuracion/preferencias/:usuarioId
Obtiene las preferencias del usuario actual.

**Path Parameters:**
- `usuarioId` (number) - ID del usuario

**Response (200):**
```json
{
  "success": true,
  "data": {
    "usuarioId": 1,
    "tema": "light",
    "idioma": "es",
    "zonaHoraria": "America/Havana",
    "formatoFecha": "DD/MM/YYYY",
    "notificaciones": {
      "rotaciones": true,
      "aseguramientos": true,
      "alertas": true
    }
  }
}
```

---

### PUT /configuracion/preferencias/:usuarioId
Actualiza las preferencias del usuario.

**Path Parameters:**
- `usuarioId` (number) - ID del usuario

**Request Body:**
```json
{
  "tema": "dark",
  "idioma": "en",
  "notificaciones": {
    "rotaciones": true,
    "aseguramientos": false
  }
}
```

**Response (200):**
```json
{
  "success": true,
  "data": { ... preferencias actualizadas ... }
}
```

---

## Códigos de Error

### 400 - Bad Request
Solicitud inválida (parámetros faltantes o inválidos).

```json
{
  "success": false,
  "message": "Validación fallida",
  "errors": [
    {
      "field": "email",
      "message": "Email inválido"
    }
  ]
}
```

### 401 - Unauthorized
No autenticado o token inválido.

```json
{
  "success": false,
  "message": "Token inválido o expirado"
}
```

### 403 - Forbidden
Autenticado pero sin permisos suficientes.

```json
{
  "success": false,
  "message": "Acceso denegado. Se requiere rol admin"
}
```

### 404 - Not Found
Recurso no encontrado.

```json
{
  "success": false,
  "message": "Circuito no encontrado"
}
```

### 409 - Conflict
Conflicto (ej: circuito asegurado, duplicado, etc.).

```json
{
  "success": false,
  "message": "No se puede apagar este circuito: tiene aseguramientos activos"
}
```

### 500 - Internal Server Error
Error en el servidor.

```json
{
  "success": false,
  "message": "Error interno del servidor"
}
```

---

## Consideraciones de Implementación

### Autenticación y Autorización

- **JWT Token**: Válido por 24 horas (configurable)
- **Refresh Token**: Para renovar token sin re-autenticar
- **Roles**: "admin" (acceso total), "operador" (lectura, crear rotaciones)

### Validaciones Críticas

1. **Circuitos Apagables**: Solo pueden apagarse circuitos con `Apagable = true`
2. **Aseguramientos**: Un circuito asegurado no puede incluirse en una rotación
3. **Fechas**: Validar que fechaInicial < fechaFinal en aseguramientos
4. **MW**: Validar que el total MW de la rotación sea correcto
5. **Unicidad**: Login de usuario debe ser único

### Base de Datos

**Tablas necesarias:**
- `usuarios` - Datos de usuarios
- `circuitos` (de BD legacy SIGERE.ap_circuitos)
- `aseguramientos` (de BD legacy PSFV.ap_Aseguramientos)
- `rotaciones` - Registro de rotaciones generadas
- `rotaciones_circuitos` - Relación N:M entre rotaciones y circuitos
- `reportes` - Historial de reportes generados
- `preferencias_usuarios` - Preferencias individuales

### Auditoría

Registrar en cada creación/actualización:
- `createdBy` / `updatedBy` - Usuario que ejecutó la acción
- `createdAt` / `updatedAt` - Timestamp
- `motivo` - Descripción de cambios significativos

### Paginación

Para endpoints que retornan listas:
- `limit` (default: 10, máximo: 100)
- `offset` (default: 0)

```
GET /circuitos?limit=20&offset=40
```

Response incluye:
```json
{
  "data": [...],
  "count": 11,
  "limit": 20,
  "offset": 40,
  "total": 51
}
```

### Rate Limiting

- Máximo 100 requests por minuto por IP
- Máximo 1000 requests por hora por usuario autenticado

### Seguridad

- HTTPS requerido en producción
- CORS configurado para dominio frontend
- SQL Injection prevention (prepared statements)
- Input sanitization
- Password hashing (bcrypt con salt)
- CSRF protection si aplica

---

## Flujos de Negocio

### Flujo de Rotación

1. Operador selecciona circuitos apagables
2. Sistema valida:
   - ¿Son apagables?
   - ¿No están asegurados hoy?
3. Operador confirma rotación
4. Sistema genera registro en tabla `rotaciones`
5. Sistema registra reporte automático
6. Se guarda en historial

### Flujo de Aseguramiento

1. Admin crea aseguramiento
2. Sistema marca circuito como excluido en rotaciones
3. Cuando se intenta rotar: sistema rechaza si hay aseguramiento activo
4. En fecha de vencimiento: sistema notifica para renovación

### Flujo de Reportes

1. Usuario solicita reporte
2. Backend consulta datos de rotaciones/aseguramientos
3. Genera PDF/Excel manualmente o desde frontend
4. Se descarga con nombre descriptivo

---

## Estadísticas y Métricas

**Campos a reportar:**
- MW total apagado (por período)
- Circuitos afectados (cantidad)
- Clientes afectados (cantidad)
- Bloques más rotados
- Duración promedio de rotaciones
- Frecuencia de rotaciones
- Circuitos con aseguramientos
- Tendencias mensuales

---

## Testing

**Casos de prueba prioritarios:**
1. Autenticación (login/logout)
2. Obtener circuitos apagables
3. Generar rotación (validaciones)
4. Crear aseguramiento (conflictos)
5. Descargar reportes
6. Estadísticas del dashboard
7. Cambiar contraseña (usuario)
8. CRUD de usuarios (admin)

---

## Versioning

- API v1: Endpoints basados en esta especificación
- Compatible con frontend React NextJS 16.1.1
- Consumo de datos legacy desde SQL Server 2008

---

**Documento preparado para desarrollo backend.**  
**Actualizar según cambios en requisitos o retroalimentación del equipo.**
