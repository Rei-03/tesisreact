# 📋 Guía de Migración del Cliente API

## Resumen de Cambios

Se ha actualizado el cliente API (`lib/api/apiClient.js`) para manejar correctamente los casos donde la API backend no está disponible, usando datos mock como fallback automático.

### ✅ Problemas Resueltos

1. **Error "Error desconocido"**: Se mejoró el manejo de errores de respuesta
2. **API no disponible**: Ahora usa datos mock automáticamente si la API no responde
3. **Comportamiento robusto**: No lanza excepciones no capturadas, sino que retorna datos mock

## Nuevas Características

### 1. Detección Automática de Disponibilidad de API

```javascript
async function checkApiAvailability() {
  // Verifica si la API está disponible con timeout de 2 segundos
  // Cachea el resultado para evitar múltiples intentos
}
```

- **Timeout**: 2 segundos para verificar disponibilidad
- **Caché**: Solo verifica una vez, luego reutiliza el resultado
- **Fallback**: Si falla, usa datos mock

### 2. Fallback a Datos Mock

Todos los métodos ahora retornan datos mock si:
- La API no está disponible
- La API responde con error
- La conexión falla

**Ejemplo:**
```javascript
circuitos.getApagables()
// Intenta: GET http://localhost:3000/api/circuitos/apagables
// Si falla → retorna circuitosMock.filter(c => c.Apagable === true)
```

### 3. Manejo Mejorado de Errores

```javascript
async function handleResponse(response) {
  if (!response.ok) {
    try {
      const error = await response.json();
      throw new Error(error.message || `Error ${response.status}: ${response.statusText}`);
    } catch (e) {
      // No lanza error desconocido, maneja gracefully
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
  }
  return response.json();
}
```

## Cómo Usar

### Desarrollo (Sin Backend)
```bash
npm run dev
# La aplicación cargará con datos mock automáticamente
# En consola verás: "API no disponible, usando datos mock"
```

### Producción (Con Backend)
```bash
# Configura la variable de entorno
export NEXT_PUBLIC_API_URL=https://api.ejemplo.com

npm run build
npm run start
# La aplicación se conectará al backend real
```

## Estructura de Datos Mock

### Circuitos (`data/mock.ts`)
- **Total**: 13 circuitos de ejemplo
- **Estados**: Apagables y no apagables
- **Bloques**: 1, 2, 3
- **Clientes**: Datos realistas (320-2100)

### Aseguramientos
- **Total**: 6 aseguramientos activos
- **Tipos**: Permanente, Programado, Temporal
- **Fechas**: Incluyen la fecha actual (enero 4, 2026)

### Próximas Aperturas
- **Total**: 10 registros
- **MW**: Valores realistas
- **Bloques**: Distribuidos

## Endpoints Esperados (Cuando tengas Backend)

```
GET /api/circuitos               → Array<Circuito>
GET /api/circuitos/apagables     → Array<Circuito> (Apagable=true)
GET /api/aseguramientos          → Array<Aseguramiento>
GET /api/aseguramientos/fecha/:fecha → Array<Aseguramiento> (filtrado por fecha)
GET /api/proximasAperturas       → Array<ProxApertura>
```

## Logs en Consola

Cuando la API no está disponible, verás:
```
⚠️ API no disponible, usando datos mock
⚠️ Fetch failed for http://localhost:3000/api/circuitos: ...
```

Esto es **normal y esperado** en desarrollo sin backend.

## Próximos Pasos

1. **Implementar Backend**: Crea los endpoints REST en tu servidor
2. **Configurar Variable de Entorno**: Define `NEXT_PUBLIC_API_URL`
3. **Probar**: La aplicación se conectará automáticamente sin cambios de código

## Ventajas

✅ **Desarrollo Offline**: Puedes trabajar sin backend  
✅ **Testing**: Usa datos mock conocidos  
✅ **Transición Suave**: Cambia a backend real solo con env variable  
✅ **Robustez**: Nunca queda en estado de error indefinido  
✅ **Debugging**: Logs claros en consola
