# 📋 Requisitos de Información para Endpoints

Este documento detalla qué información necesitamos de tus bases de datos para crear cada endpoint.

---

## 🔐 Autenticación

### `POST /api/auth/login`

**Tabla:** `usuarios` (o similar)

**Campos necesarios:**

- `login` o `username` (string) - Para identificar al usuario
- `password` (string) - Para validar (debe estar encriptado en BD)
- `rol` (string/enum) - 'admin' o 'operador'
- `nombre` (string) - Nombre completo del usuario
- `activo` (boolean) - Si el usuario está activo

**Ejemplo de respuesta esperada:**

```json
{
  "id": 1,
  "login": "despacho",
  "nombre": "Brayan Castellano",
  "rol": "admin",
  "activo": true
}
```

---

## 👥 Gestión de Usuarios

### `GET /api/usuarios`

**Tabla:** `usuarios`

**Campos necesarios:**

- `id` (int) - ID único
- `nombre` (string)
- `login` (string)
- `rol` (string)
- `fecha_creacion` (datetime) - Opcional
- `activo` (boolean)

### `POST /api/usuarios`

**Campos a recibir:**

- `nombre` (string, requerido)
- `login` (string, requerido, único)
- `password` (string, requerido) - Se encriptará en backend
- `rol` (string, requerido) - 'admin' o 'operador'

### `PUT /api/usuarios/:id`

**Campos a recibir (todos opcionales):**

- `nombre` (string)
- `login` (string)
- `password` (string) - Solo si se quiere cambiar
- `rol` (string)
- `activo` (boolean)

### `DELETE /api/usuarios/:id`

**Solo necesita:** ID del usuario

---

## ⚡ Circuitos

### `GET /api/circuitos`

**Tabla:** `circuitos` (o similar)

**Campos necesarios:**

- `id` (int) - ID único
- `codigo` o `id_circuito` (string) - Ej: "C-84"
- `numero` (string) - Ej: "1435"
- `bloque` (int) - Número de bloque
- `clientes` (int) - Cantidad de clientes
- `mw` (decimal/float) - Carga en MW
- `zona` (string) - Nombre de la zona
- `estado` (string/enum) - 'Apagado', 'Servicio', 'Asegurado'
- `tiempo_apagado` (datetime/time) - Tiempo transcurrido desde el apagado
- `coordenadas_lat` (decimal) - Latitud para el mapa
- `coordenadas_lng` (decimal) - Longitud para el mapa

**Filtros opcionales:**

- Por bloque
- Por estado
- Por zona

### `POST /api/circuitos/rotacion`

**Tabla:** `circuitos` + `rotaciones` (historial)

**Datos a recibir:**

- `circuitos_propuestos` (array) - IDs de circuitos a apagar
- `usuario_id` (int) - ID del usuario que registra
- `motivo` (string) - Opcional

**Datos a actualizar:**

- Estado de circuitos afectados
- Registrar en tabla de historial/rotaciones

---

## 📊 Dashboard

### `GET /api/dashboard/estado`

**Tablas:** Múltiples (o vista consolidada)

**Datos necesarios:**

- `deficit_generacion` (decimal) - MW de déficit actual
- `mw_afectados` (decimal) - Total de MW afectados
- `mw_asegurados` (decimal) - Total de MW asegurados
- `alertas_activas` (int) - Cantidad de alertas
- `estado_sistema` (string) - 'Normal', 'Crítico', 'Alerta'

### `GET /api/dashboard/grafico`

**Tabla:** `historial_deficit` o similar

**Campos necesarios:**

- `fecha` o `hora` (datetime)
- `deficit` (decimal)
- `afectados` (decimal)

**Rango:** Últimas 24 horas o período configurable

---

## 🗺️ Mapa

### `GET /api/mapa/circuitos`

**Tabla:** `circuitos`

**Campos necesarios:**

- `id` (int)
- `codigo` (string)
- `nombre` o `zona` (string)
- `estado` (string)
- `mw` (decimal)
- `coordenadas_lat` (decimal)
- `coordenadas_lng` (decimal)

**Filtros:**

- Solo circuitos con coordenadas
- Por estado (opcional)

---

## 🛡️ Aseguramientos

### `GET /api/aseguramientos`

**Tabla:** `aseguramientos`

**Campos necesarios:**

- `id` (int)
- `circuito_id` (int) - FK a tabla circuitos
- `circuito_codigo` (string) - Para mostrar (JOIN)
- `motivo` (string) - Ej: "Hospital Provincial"
- `tipo` (string/enum) - 'Permanente' o 'Temporal'
- `horario_inicio` (time) - Si es temporal
- `horario_fin` (time) - Si es temporal
- `activo` (boolean)
- `fecha_creacion` (datetime)

### `POST /api/aseguramientos`

**Datos a recibir:**

- `circuito_id` (int, requerido)
- `motivo` (string, requerido)
- `tipo` (string, requerido) - 'Permanente' o 'Temporal'
- `horario_inicio` (time) - Si tipo = 'Temporal'
- `horario_fin` (time) - Si tipo = 'Temporal'

### `PUT /api/aseguramientos/:id`

**Datos a recibir (todos opcionales):**

- `motivo` (string)
- `tipo` (string)
- `horario_inicio` (time)
- `horario_fin` (time)
- `activo` (boolean)

### `DELETE /api/aseguramientos/:id`

**Solo necesita:** ID del aseguramiento

---

## 📄 Reportes

### `GET /api/reportes/generar`

**Tablas:** Múltiples (circuitos, rotaciones, aseguramientos)

**Parámetros:**

- `tipo` (string) - Tipo de reporte
- `fecha_inicio` (date)
- `fecha_fin` (date)
- `formato` (string) - 'pdf' o 'excel'

**Datos a consolidar:**

- Resumen de rotaciones en el período
- Circuitos afectados
- Estadísticas de déficit
- Aseguramientos activos

---

## 🔍 Información Adicional Necesaria

### Relaciones entre Tablas (Foreign Keys)

Necesitamos saber:

- ¿Qué tablas están relacionadas?
- ¿Cuáles son las claves foráneas?
- ¿Hay restricciones de integridad referencial?

### Validaciones de Negocio

- ¿Hay reglas de negocio en la BD? (triggers, stored procedures)
- ¿Hay campos calculados?
- ¿Hay restricciones de datos?

### Índices

- ¿Qué campos tienen índices? (para optimizar consultas)

### Datos de Ejemplo

- Necesitamos ver algunos registros de ejemplo para entender el formato real

---

## 📝 Checklist para Proporcionar

- [ ] Lista de todas las tablas de cada base de datos
- [ ] Estructura completa de cada tabla (columnas, tipos, restricciones)
- [ ] Relaciones entre tablas (Foreign Keys)
- [ ] Datos de ejemplo (5-10 registros por tabla importante)
- [ ] Nombres exactos de tablas y columnas (case-sensitive)
- [ ] Tipos de datos exactos (int, varchar(50), decimal(10,2), etc.)
- [ ] Campos que permiten NULL
- [ ] Valores por defecto
- [ ] Campos únicos o índices
- [ ] Reglas de negocio o triggers importantes

---

## 🎯 Próximos Pasos

1. Ejecuta las consultas SQL del archivo `consultas_estructura_bd.sql`
2. Comparte los resultados (o capturas de pantalla)
3. Con esa información crearemos los endpoints exactos
4. Definiremos los modelos/schemas del backend
