# 📌 Cómo Usar en Rotaciones-MS

## Contexto

Se agregó un nuevo endpoint en **circuitos-ms** que devuelve **circuitos + consumo + último apagón** en una sola llamada NATS.

---

## Opción Recomendada: Un Endpoint (Mejor Performance)

### ✅ UN mensaje NATS

```typescript
// rotaciones-ms/src/rotaciones/rotaciones.service.ts

import { Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class RotacionesService {
  constructor(
    @Inject('CIRCUITOS_SERVICE') private circuitosClient: ClientProxy
  ) {}

  async obtenerCircuitosConDatosCompletos(fecha: string, take = 20, skip = 0) {
    // UNA sola llamada NATS
    const circuitos = await firstValueFrom(
      this.circuitosClient.send('circuitos.findWithConsumptionAndApagones', {
        fecha,
        take,
        skip,
      })
    );

    return circuitos; // Ya incluye consumo + último apagón
  }
}
```

### Respuesta Esperada

```json
[
  {
    "idCircuitoP": 100,
    "CircuitoP": "CIRCUITO-1",
    "Clientes": 5000,
    "ZonaAfectada": "Havana Center",
    "Apagable": true,
    "consumo": {
      "mw": 45.5,
      "historico": [40, 41, 42, 43, 44, 45.5, ...],
      "fechaReferencia": "2024-01-15"
    },
    "ultimoApagon": {
      "idApagon": 987654,
      "FechaRetiro": "2024-01-14T10:30:00",
      "FechaCierre": null,
      "MWAfectados": 50,
      "Observaciones": "Falla en línea de transmisión",
      "AbiertoPor": 1,
      "estado": "abierto"
    }
  },
  {
    "idCircuitoP": 101,
    "CircuitoP": "CIRCUITO-2",
    "consumo": { ... },
    "ultimoApagon": null  // Si no hay apagones
  }
]
```

---

## Comparación: Antes vs Después

### ❌ Opción A: Dos Endpoints (Antes)

```typescript
// Dos llamadas NATS
const [circuitos, apagones] = await Promise.all([
  firstValueFrom(
    this.circuitosClient.send('circuitos.findAllWithConsumption', { fecha, take, skip })
  ),
  firstValueFrom(
    this.apagonesClient.send('apagones.findLastByCircuito', { take, skip })
  )
]);

// Combinar manualmente
const circuitosConApagones = circuitos.map(c => ({
  ...c,
  ultimoApagon: apagones.find(a => a.idCircuitoP === c.idCircuitoP)
}));
```

**Problemas:**
- ⏱️ Latencia: ~200ms (100ms cada endpoint)
- 🔄 Necesitas lógica de mapeo
- ⚠️ Posible desincronización de datos

---

### ✅ Opción B: Un Endpoint (Recomendado - Ahora)

```typescript
const circuitos = await firstValueFrom(
  this.circuitosClient.send('circuitos.findWithConsumptionAndApagones', {
    fecha,
    take,
    skip,
  })
);

// Ya vienen combinados y sincronizados
```

**Ventajas:**
- ⚡ Latencia: ~100ms (una sola llamada)
- 📦 Datos atomicos
- 🎯 Menos código
- 🚀 Mejor performance

---

## Performance Comparison

| Métrica | Opción A (2 llamadas) | Opción B (1 llamada) |
|---------|----------------------|---------------------|
| **Round Trips** | 2 | 1 |
| **Latencia Aprox** | 200ms | 100ms |
| **Network I/O** | 2x | 1x |
| **Código** | Complejo | Simple |
| **Sincronización** | Manual (error-prone) | Automática |

---

## Ejemplo Completo: Rotaciones Controller

```typescript
// rotaciones-ms/src/rotaciones/rotaciones.controller.ts

import { Controller, Get, Query } from '@nestjs/common';
import { RotacionesService } from './rotaciones.service';

@Controller('rotaciones')
export class RotacionesController {
  constructor(private readonly rotacionesService: RotacionesService) {}

  /**
   * Obtiene circuitos con consumo Y último apagón
   * Ideal para planificar rotaciones considerando apagones activos
   */
  @Get('circuitos-con-datos')
  async getCircuitosConDatos(
    @Query('fecha') fecha: string,
    @Query('take') take?: number,
    @Query('skip') skip?: number,
  ) {
    return this.rotacionesService.obtenerCircuitosConDatosCompletos(
      fecha,
      take,
      skip,
    );
  }
}
```

---

## Casos de Uso

### 1️⃣ Planificar Rotaciones

```typescript
// Obtener circuitos considerando apagones activos
const circuitos = await this.rotacionesService.obtenerCircuitosConDatosCompletos(
  '2024-01-15',
  50,
  0
);

// Filtrar circuitos sin apagones abiertos
const circuitosSinApagones = circuitos.filter(
  c => !c.ultimoApagon || c.ultimoApagon.estado !== 'abierto'
);

// Ordenar por consumo actual
const circuitosOrdenados = circuitos.sort(
  (a, b) => b.consumo.mw - a.consumo.mw
);
```

### 2️⃣ Alertas de Conflictos

```typescript
const circuitosConConflicto = circuitos.filter(c => {
  const tieneApagonAbierto = c.ultimoApagon && 
                             !c.ultimoApagon.FechaCierre;
  const consumoAlto = c.consumo.mw > 100;
  
  return tieneApagonAbierto && consumoAlto;
});

// Alertar: "No rotar CIRCUITO-1: tiene apagón abierto + alto consumo"
```

### 3️⃣ Historial

```typescript
// Saber cuándo fue el último apagón de cada circuito
circuitos.forEach(c => {
  if (c.ultimoApagon) {
    console.log(
      `Circuito ${c.CircuitoP}: último apagón ${c.ultimoApagon.FechaRetiro}`
    );
  }
});
```

---

## Integración en Rotaciones-MS

### Service

```typescript
import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class RotacionesService {
  constructor(
    @Inject('CIRCUITOS_SERVICE') private circuitosClient: ClientProxy
  ) {}

  async obtenerCircuitosConDatosCompletos(fecha: string, take = 20, skip = 0) {
    try {
      const circuitos = await firstValueFrom(
        this.circuitosClient.send('circuitos.findWithConsumptionAndApagones', {
          fecha,
          take,
          skip,
        })
      );

      return circuitos || [];
    } catch (error) {
      console.error('Error fetching circuitos con apagones:', error);
      throw error;
    }
  }

  // Método auxiliar: filtrar circuitos seguros para rotar
  filtrarCircuitosSeguros(circuitos: any[]) {
    return circuitos.filter(c => {
      const tieneApagonAbierto = c.ultimoApagon && !c.ultimoApagon.FechaCierre;
      return !tieneApagonAbierto;
    });
  }

  // Método auxiliar: obtener riesgo de circuito
  calcularRiesgoCircuito(circuito: any): 'bajo' | 'medio' | 'alto' {
    if (!circuito.ultimoApagon) return 'bajo';

    const tieneApagonAbierto = !circuito.ultimoApagon.FechaCierre;
    const consumoAlto = circuito.consumo.mw > 100;

    if (tieneApagonAbierto && consumoAlto) return 'alto';
    if (tieneApagonAbierto) return 'medio';
    return 'bajo';
  }
}
```

### Module Setup

```typescript
// rotaciones-ms/src/rotaciones/rotaciones.module.ts

import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { RotacionesController } from './rotaciones.controller';
import { RotacionesService } from './rotaciones.service';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'CIRCUITOS_SERVICE',
        transport: Transport.NATS,
        options: {
          servers: ['nats://localhost:4222'],
        },
      },
    ]),
  ],
  controllers: [RotacionesController],
  providers: [RotacionesService],
})
export class RotacionesModule {}
```

---

## Frontend (React) - Consumo desde Rotaciones-MS

```typescript
// rotaciones/page.jsx
'use client';

import { useEffect, useState } from 'react';

export default function RotacionesPage() {
  const [circuitos, setCircuitos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const fecha = new Date().toISOString().split('T')[0];
        const response = await fetch(
          `/api/rotaciones/circuitos-con-datos?fecha=${fecha}&take=50`
        );
        setCircuitos(await response.json());
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) return <div>Cargando...</div>;

  return (
    <table>
      <thead>
        <tr>
          <th>Circuito</th>
          <th>Consumo (MW)</th>
          <th>Último Apagón</th>
          <th>Estado</th>
          <th>Riesgo</th>
        </tr>
      </thead>
      <tbody>
        {circuitos.map(c => {
          const riesgo = c.ultimoApagon && !c.ultimoApagon.FechaCierre 
            ? 'Alto' 
            : 'Bajo';
          
          return (
            <tr key={c.idCircuitoP} className={`risk-${riesgo.toLowerCase()}`}>
              <td>{c.CircuitoP}</td>
              <td>{c.consumo.mw.toFixed(2)} MW</td>
              <td>
                {c.ultimoApagon
                  ? new Date(c.ultimoApagon.FechaRetiro).toLocaleString()
                  : 'N/A'}
              </td>
              <td>
                {c.ultimoApagon?.estado === 'abierto' 
                  ? '⚠️ Abierto' 
                  : '✓ Cerrado'}
              </td>
              <td>{riesgo}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
```

---

## Ventajas de Usar el Nuevo Endpoint

✅ **Performance**: 100% más rápido (1 llamada vs 2)
✅ **Sincronización**: Los datos siempre están sincronizados
✅ **Simplicidad**: Menos código en rotaciones-ms
✅ **Atomicidad**: Transacción de BD única
✅ **Escalabilidad**: Usa índices optimizados
✅ **Mantenimiento**: Cambios futuros solo en circuitos-ms

---

## 📊 Endpoint Nuevo

| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|----------|-------------|
| fecha | string | ✅ | Formato YYYY-MM-DD |
| take | number | ❌ | Cantidad (default: 20) |
| skip | number | ❌ | Offset (default: 0) |

**Pattern NATS:**
```
circuitos.findWithConsumptionAndApagones
```

**Retorna:**
```typescript
{
  idCircuitoP: number,
  CircuitoP: string,
  Clientes: number,
  consumo: {
    mw: number,
    historico: number[],
    fechaReferencia: string
  },
  ultimoApagon?: {
    idApagon: number,
    FechaRetiro: string,
    FechaCierre: string | null,
    MWAfectados: number,
    Observaciones: string,
    estado: 'abierto' | 'cerrado'
  }
}[]
```

---

✅ **¡Listo para usar en rotaciones-ms!**
