# Módulo de Apagones - Circuitos Microservicio

Este módulo proporciona operaciones de lectura para gestionar y consultar datos de apagones de la tabla `ap_apagones` de la base de datos SIGERE.

## Características

- ✅ **Solo operaciones de lectura** (GET operations)
- ✅ **Queries optimizadas** para tablas grandes
- ✅ **Función de último apagón por circuito** con performance optimizado
- ✅ **Paginación** en todos los endpoints
- ✅ **Filtros flexibles** por circuito, provincia, fechas, etc.
- ✅ **Estadísticas** de apagones por circuito

## Endpoints NATS (Message Patterns)

### 1. Obtener todos los apagones con paginación
```
Pattern: apagones.findAll
Payload: { take?: number, skip?: number }
```
**Ejemplo:**
```javascript
client.send('apagones.findAll', { take: 20, skip: 0 }).toPromise();
```

### 2. Obtener un apagón específico por ID
```
Pattern: apagones.findById
Payload: { idApagon: number }
```
**Ejemplo:**
```javascript
client.send('apagones.findById', { idApagon: 12345 }).toPromise();
```

### 3. Obtener todos los apagones de un circuito
```
Pattern: apagones.findByCircuitoId
Payload: { idCircuitoP: number, take?: number, skip?: number }
```
**Ejemplo:**
```javascript
client.send('apagones.findByCircuitoId', { idCircuitoP: 100, take: 10, skip: 0 }).toPromise();
```

### 4. ⭐ Obtener el ÚLTIMO apagón para cada circuito (OPTIMIZADO)
```
Pattern: apagones.findLastByCircuito
Payload: { take?: number, skip?: number }
```
**Ejemplo:**
```javascript
client.send('apagones.findLastByCircuito', { take: 20, skip: 0 }).toPromise();
```

**Notas de optimización:**
- Utiliza `GROUP BY` y `MAX()` para identificar el último apagón de cada circuito
- La query usa un `CTE (Common Table Expression)` para mejor rendimiento
- Implementa `INNER JOIN` para traer solo los registros más recientes
- Incluye paginación para manejar resultados grandes
- Ideal para dashboards que muestren el estado más reciente de cada circuito

### 5. Obtener apagones por provincia
```
Pattern: apagones.findByProvincia
Payload: { idProv: string, take?: number, skip?: number }
```
**Ejemplo:**
```javascript
client.send('apagones.findByProvincia', { idProv: '001', take: 20, skip: 0 }).toPromise();
```

### 6. Obtener apagones abiertos (sin cierre)
```
Pattern: apagones.findOpen
Payload: { take?: number, skip?: number }
```
**Ejemplo:**
```javascript
client.send('apagones.findOpen', { take: 20, skip: 0 }).toPromise();
```

### 7. Obtener apagones en rango de fechas
```
Pattern: apagones.findByDateRange
Payload: { fechaInicio: string, fechaFin: string, take?: number, skip?: number }
```
**Ejemplo:**
```javascript
client.send('apagones.findByDateRange', {
  fechaInicio: '2024-01-01',
  fechaFin: '2024-01-31',
  take: 20,
  skip: 0
}).toPromise();
```

### 8. Obtener estadísticas de apagones por circuito
```
Pattern: apagones.getStats
Payload: {}
```
**Ejemplo:**
```javascript
client.send('apagones.getStats', {}).toPromise();
```

**Retorna:**
```json
[
  {
    "idCircuitoP": 100,
    "totalApagones": 25,
    "ultimoApagon": 987654,
    "ultimaFecha": "2024-01-15",
    "totalMWAfectados": 450.50
  }
]
```

## Estructura de la Tabla ap_apagones

| Campo | Tipo | Nullable | Descripción |
|-------|------|----------|-------------|
| idApagon | bigint | NOT NULL | ID único del apagón |
| idProv | varchar(3) | NOT NULL | ID de la provincia |
| FechaRetiro | smalldatetime | NULL | Fecha de inicio del apagón |
| FechaCierre | smalldatetime | NULL | Fecha de cierre del apagón |
| idCircuitoP | int | NULL | ID del circuito afectado |
| MWAfectados | decimal | NULL | MW de carga afectada |
| Observaciones | varchar(5000) | NULL | Observaciones del apagón |
| Id_Usuario | int | NULL | ID del usuario que abrió |
| Id_UsuarioCerrado | int | NULL | ID del usuario que cerró |
| AbiertoPor | bit | NULL | Flag de apertura |

## Ejemplos de Uso en Frontend

### React Hook para obtener últimos apagones
```javascript
import { useEffect, useState } from 'react';

export function useLastApagones(take = 20) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/apagones/last', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ take, skip: 0 })
        });
        setData(await response.json());
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return { data, loading };
}
```

### Usar en componente
```javascript
function ApagonesBoard() {
  const { data, loading } = useLastApagones(20);

  if (loading) return <div>Cargando...</div>;

  return (
    <table>
      <thead>
        <tr>
          <th>Circuito</th>
          <th>Fecha</th>
          <th>MW Afectados</th>
          <th>Estado</th>
        </tr>
      </thead>
      <tbody>
        {data.map(apagon => (
          <tr key={apagon.idApagon}>
            <td>{apagon.idCircuitoP}</td>
            <td>{new Date(apagon.FechaRetiro).toLocaleString()}</td>
            <td>{apagon.MWAfectados}</td>
            <td>{apagon.FechaCierre ? 'Cerrado' : 'Abierto'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

## Notas de Rendimiento

1. **findLastByCircuito**: La query más optimizada del módulo
   - Usa `CTE` para evitar subqueries anidadas
   - Agrupa por circuito identificando el MAX(idApagon)
   - Solo trae el último apagón por circuito
   - Perfect para dashboards

2. **Paginación**: Todos los endpoints incluyen `take` y `skip`
   - Maneja resultados grandes de forma eficiente
   - Usa `ROW_NUMBER()` OVER para pagination server-side

3. **Índices recomendados**:
   ```sql
   CREATE INDEX idx_ap_apagones_circuito ON ap_apagones(idCircuitoP);
   CREATE INDEX idx_ap_apagones_prov ON ap_apagones(idProv);
   CREATE INDEX idx_ap_apagones_fecha ON ap_apagones(FechaRetiro);
   CREATE INDEX idx_ap_apagones_cierre ON ap_apagones(FechaCierre);
   ```
