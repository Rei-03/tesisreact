# Arquitectura del Módulo de Apagones

## Flujo de Datos

```
Frontend (React)
    ↓
apagonesService.js (Hooks & Funciones)
    ↓
API Gateway (NATS)
    ↓
circuitos-ms/apagones/
    ├── ApagonesController (Message Pattern Router)
    │   ├── findAll()
    │   ├── findById()
    │   ├── findByCircuitoId()
    │   ├── findLastByCircuito()  ⭐ OPTIMIZED
    │   ├── findByProvincia()
    │   ├── findOpenApagones()
    │   ├── findByDateRange()
    │   └── getStats()
    ↓
ApagonesService (Lógica de Negocio)
    ↓
ApagonesRepository (Acceso a Datos)
    ↓
ClientDbModule (Conexión MSSQL)
    ↓
MSSQL Server (ap_apagones table)
```

## Estructura de Capas

```
┌─────────────────────────────────────────────────────┐
│            PRESENTATION LAYER (Frontend)             │
│  React Components + Hooks (React)                   │
│  apagonesService.js                                 │
└──────────────────────┬──────────────────────────────┘
                       │ (HTTP/NATS)
┌──────────────────────▼──────────────────────────────┐
│           GATEWAY LAYER (API-Gateway)                │
│  Enrutamiento de mensajes NATS                      │
└──────────────────────┬──────────────────────────────┘
                       │ NATS Message
┌──────────────────────▼──────────────────────────────┐
│    CONTROLLER LAYER (ApagonesController)             │
│  @MessagePattern decorators                         │
│  Validación de input                                │
│  Enrutamiento a Service                             │
└──────────────────────┬──────────────────────────────┘
                       │ (inyección de dependencias)
┌──────────────────────▼──────────────────────────────┐
│     SERVICE LAYER (ApagonesService)                  │
│  Lógica de negocio                                  │
│  Transformación de datos                            │
│  Orquestación de Repository                         │
└──────────────────────┬──────────────────────────────┘
                       │ (inyección de dependencias)
┌──────────────────────▼──────────────────────────────┐
│    REPOSITORY LAYER (ApagonesRepository)             │
│  Consultas SQL parametrizadas                       │
│  Mapeo de resultados BD                             │
│  Control de paginación                              │
└──────────────────────┬──────────────────────────────┘
                       │ (BD Connection)
┌──────────────────────▼──────────────────────────────┐
│      DATABASE LAYER (ClientDbModule/MSSQL)          │
│  Conecta a SQL Server                               │
│  Tabla: ap_apagones                                 │
└──────────────────────────────────────────────────────┘
```

## Ejemplo de Flujo Completo

### Llamada: "Obtener último apagón por circuito"

```
1. Frontend (React Hook)
   └─ useLastApagones(20, 0)
      └─ apagonesService.findLastByCircuito(20, 0)
         └─ fetch('/api/apagones/last', { take: 20, skip: 0 })

2. API Gateway (o Direct NATS)
   └─ enruta a 'apagones.findLastByCircuito'

3. ApagonesController
   └─ @MessagePattern('apagones.findLastByCircuito')
      └─ findLastApagonByCircuito(@Payload() { take, skip })
         └─ apagonesService.findLastApagonByCircuito({ take, skip })

4. ApagonesService
   └─ findLastApagonByCircuito(payload)
      └─ apagonesRepo.findLastApagonByCircuito(take, skip)

5. ApagonesRepository (OPTIMIZADO)
   └─ db.request()
      .input('take', sql.Int, take)
      .input('skip', sql.Int, skip)
      .query(`
         WITH LastApagones AS (
            SELECT idCircuitoP, MAX(idApagon) AS maxApagonId
            FROM ap_apagones
            WHERE idCircuitoP IS NOT NULL
            GROUP BY idCircuitoP
         )
         SELECT * FROM (
            SELECT ap.idApagon, ap.idProv, ap.FechaRetiro, ...
                   ROW_NUMBER() OVER (ORDER BY ap.idApagon DESC) AS RowNum
            FROM ap_apagones ap
            INNER JOIN LastApagones la
               ON ap.idCircuitoP = la.idCircuitoP 
               AND ap.idApagon = la.maxApagonId
         ) AS ResultWithRows
         WHERE RowNum > @skip AND RowNum <= (@skip + @take)
         ORDER BY idApagon DESC
      `)

6. MSSQL Server
   └─ Ejecuta query y retorna recordset

7. Retorno del Flujo
   Repository → Service → Controller → Gateway → Frontend
                                          ↓
                                    React State
                                    Re-render
```

## Inyección de Dependencias (NestJS)

```
AppModule
  ├── imports: [
  │   ├── ClientDbModule (Global)
  │   │   └── provides: DATABASE_CONNECTION
  │   ├── CircuitosModule
  │   └── ApagonesModule
  │       ├── controllers: [ApagonesController]
  │       └── providers: [
  │           ├── ApagonesService
  │           └── ApagonesRepository
  │               └── @Inject("DATABASE_CONNECTION")
  └── providers: [AppService]
```

## Tabla de Mapeo de Métodos

| Método Repository | Método Service | Pattern NATS | Frontend Hook |
|-------------------|----------------|--------------|---------------|
| findAll() | findAll() | apagones.findAll | useLastApagones |
| findById() | findById() | apagones.findById | - |
| findByCircuitoId() | findByCircuitoId() | apagones.findByCircuitoId | useApagonesByCircuito |
| findLastApagonByCircuito() ⭐ | findLastApagonByCircuito() ⭐ | apagones.findLastByCircuito ⭐ | useLastApagones ⭐ |
| findByProvincia() | findByProvincia() | apagones.findByProvincia | - |
| findOpenApagones() | findOpenApagones() | apagones.findOpen | useOpenApagones |
| findByDateRange() | findByDateRange() | apagones.findByDateRange | useApagonesByDateRange |
| getApagonesByCircuitoStats() | getApagonesByCircuitoStats() | apagones.getStats | useApagonesStats |

## Protocolo de Comunicación

### Via NATS Microservices

```typescript
// Envío
client.send('apagones.findLastByCircuito', { take: 20, skip: 0 })
      .pipe(firstValueFrom())

// Respuesta
Observable<any> → recordset[] → JSON
```

### Estructura de Respuesta

```json
{
  "recordset": [
    {
      "idApagon": 123456,
      "idProv": "001",
      "FechaRetiro": "2024-01-15T10:30:00.000Z",
      "FechaCierre": null,
      "idCircuitoP": 100,
      "MWAfectados": 45.50,
      "Observaciones": "Falla en línea",
      "Id_Usuario": 5,
      "Id_UsuarioCerrado": null,
      "AbiertoPor": 1
    }
  ]
}
```

## Error Handling

```
Try/Catch en cada nivel:

Frontend Hook
  ↓ (error)
apagonesService
  ↓ (error)
API Gateway
  ↓ (error)
Controller
  ↓ (error)
Service
  ↓ (error)
Repository
  ↓ (error)
MSSQL
  └─ throw Error

Retorna: { error: mensaje, statusCode }
```

## Notas de Seguridad

1. **SQL Injection Prevention**: Todas las queries usan parámetros SQL
   ```typescript
   .input('take', sql.Int, take)  // ✅ Parametrizado
   .input('idProv', sql.VarChar(3), idProv)  // ✅ Parametrizado
   ```

2. **Input Validation**: DTOs con tipos estrictos
3. **No se modifica Data**: Solo SELECT queries
4. **Inyección de Dependencias**: NestJS maneja scope correctamente

## Performance Considerations

### Índices Recomendados
```sql
CREATE INDEX idx_ap_apagones_circuito ON ap_apagones(idCircuitoP)
CREATE INDEX idx_ap_apagones_prov ON ap_apagones(idProv)
CREATE INDEX idx_ap_apagones_fecha_retiro ON ap_apagones(FechaRetiro DESC)
CREATE INDEX idx_ap_apagones_fechas ON ap_apagones(FechaRetiro DESC, FechaCierre)
```

### Query Optimization
- ✅ CTE para evitar subqueries
- ✅ GROUP BY + MAX() vs ROW_NUMBER()
- ✅ Paginación server-side
- ✅ Índices en campos de filtro
- ✅ WHERE clauses restringiendo sin NULL

