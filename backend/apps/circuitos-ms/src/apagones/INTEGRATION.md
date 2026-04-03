# Guía de Integración - Módulo de Apagones

## Setup Inicial

El módulo está automáticamente integrado en el `app.module.ts`. No requiere configuración adicional.

## Conexión a Base de Datos

El módulo utiliza el módulo `ClientDbModule` que es global en la aplicación. La conexión MSSQL se establece automáticamente con estos parámetros:

```javascript
{
  user: 'sa',
  password: '12341234',
  server: 'localhost',
  database: 'SIGERE',
  options: {
    encrypt: false,
    trustServerCertificate: true,
    cryptoCredentialsDetails: { minVersion: 'TLSv1' },
  }
}
```

## Inyección de Dependencias

Dentro del módulo:
- `ApagonesRepository` accede directamente a la BD con `@Inject("DATABASE_CONNECTION")`
- `ApagonesService` usa `ApagonesRepository`
- `ApagonesController` usa `ApagonesService`

## Patrones de Mensajería NATS

Todos los endpoints usan el patrón `NATS` con `@MessagePattern`:

```javascript
@MessagePattern('apagones.findLastByCircuito')
findLastApagonByCircuito(@Payload() payload: FindApagonesPaginationDto) {
  return this.apagonesService.findLastApagonByCircuito(payload);
}
```

## Llamadas desde otros Microservicios

### Usando NestJS ClientProxy

```javascript
import { Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

export class MyService {
  constructor(
    @Inject('NATS_SERVICE') private client: ClientProxy
  ) {}

  async obtenerUltimosApagones() {
    return firstValueFrom(
      this.client.send('apagones.findLastByCircuito', { take: 20, skip: 0 })
    );
  }
}
```

### Desde API Gateway

```javascript
// En el api-gateway microservicio
@Get('apagones/last')
async getLastApagones(@Query('take') take = 20, @Query('skip') skip = 0) {
  return this.client.send('apagones.findLastByCircuito', { take, skip })
    .pipe(firstValueFrom());
}
```

## Llamadas desde Frontend

### Cliente HTTP estándar
```javascript
async function fetchLastApagones(take = 20, skip = 0) {
  const response = await fetch('http://localhost:3000/api/apagones/last', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ take, skip })
  });
  
  if (!response.ok) throw new Error('Error fetching data');
  return await response.json();
}
```

### Usando cliente personalizado
```javascript
// lib/api/apagonesClient.js
import { apiClient } from './apiClient';

export const apagonesClient = {
  findAll: (take = 20, skip = 0) =>
    apiClient.post('/apagones', { take, skip }),
  
  findById: (idApagon) =>
    apiClient.get(`/apagones/${idApagon}`),
  
  findLastByCircuito: (take = 20, skip = 0) =>
    apiClient.post('/apagones/last', { take, skip }),
  
  findByCircuitoId: (idCircuitoP, take = 20, skip = 0) =>
    apiClient.get(`/apagones/circuito/${idCircuitoP}`, { take, skip }),
  
  findByDateRange: (fechaInicio, fechaFin, take = 20, skip = 0) =>
    apiClient.post('/apagones/date-range', { 
      fechaInicio, 
      fechaFin, 
      take, 
      skip 
    }),
  
  getStats: () =>
    apiClient.get('/apagones/stats'),
};
```

## Manejo de Errores

El módulo proporciona respuestas basadas en los resultados de la BD:

```javascript
// Sin errores
{ recordset: [...datos...] }

// Registro no encontrado
null

// Error en query
Error thrown
```

Recomendación: implementar try-catch en los servicios que consumen estos endpoints:

```javascript
async getApagones() {
  try {
    const result = await firstValueFrom(
      this.client.send('apagones.findAll', { take: 20, skip: 0 })
    );
    return result;
  } catch (error) {
    console.error('Error fetching apagones:', error);
    throw new Error('No se pudieron obtener los apagones');
  }
}
```

## Testing

### Test unitario del repositorio
```javascript
import { Test, TestingModule } from '@nestjs/testing';
import { ApagonesRepository } from './apagones.repository';

describe('ApagonesRepository', () => {
  let repository: ApagonesRepository;
  let mockDb: any;

  beforeEach(async () => {
    mockDb = {
      request: jest.fn().mockReturnThis(),
      input: jest.fn().mockReturnThis(),
      query: jest.fn().mockResolvedValue({
        recordset: [
          {
            idApagon: 1,
            idCircuitoP: 100,
            FechaRetiro: new Date(),
          }
        ]
      })
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApagonesRepository,
        {
          provide: 'DATABASE_CONNECTION',
          useValue: mockDb,
        }
      ],
    }).compile();

    repository = module.get<ApagonesRepository>(ApagonesRepository);
  });

  it('should fetch all apagones', async () => {
    const result = await repository.findAll(20, 0);
    expect(result).toEqual(expect.any(Array));
  });

  it('should fetch last apagon by circuito', async () => {
    const result = await repository.findLastApagonByCircuito(20, 0);
    expect(result).toEqual(expect.any(Array));
  });
});
```

## Monitores y Logs

Para monitorear el rendimiento del módulo, agreguen logging en el repositorio:

```javascript
async findLastApagonByCircuito(take = 20, skip = 0) {
  const startTime = performance.now();
  
  try {
    const result = await this.db.request()
      // ... query ...
      .query(sql);
    
    const duration = performance.now() - startTime;
    console.log(`[APAGONES] findLastByCircuito took ${duration.toFixed(2)}ms`);
    
    return result.recordset;
  } catch (error) {
    console.error('[APAGONES] Error in findLastByCircuito:', error);
    throw error;
  }
}
```

## Mejoras Futuras

- [ ] Agregar caché con Redis para queries frecuentes
- [ ] Implementar GraphQL subscription para apagones en tiempo real
- [ ] Agregar WebSocket para notificaciones de nuevos apagones
- [ ] Implementar auditoría de accesos a datos
- [ ] Agregar paginación cursor-based además de offset-based
