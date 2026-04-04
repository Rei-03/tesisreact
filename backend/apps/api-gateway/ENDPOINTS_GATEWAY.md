# 🌉 API Gateway - Endpoints Integration

## 📋 Gateway Routes

El gateway centraliza todos los accesos a los microservicios via NATS.

---

## 🔄 Circuitos Endpoints

### 1️⃣ GET /circuitos
**Obtener todos los circuitos**

```bash
curl -X GET http://localhost:3000/circuitos \
  -H "Content-Type: application/json"
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "idCircuitoP": 1,
      "CircuitoP": "CIRCUITO-HAVANA-1",
      "Clientes": 5000,
      "ZonaAfectada": "Havana Center"
    }
  ]
}
```

---

### 2️⃣ POST /circuitos/with-consumption
**Obtener circuitos con consumo en fecha específica**

```bash
curl -X POST http://localhost:3000/circuitos/with-consumption \
  -H "Content-Type: application/json" \
  -d '{
    "fecha": "2024-01-15T00:00:00Z",
    "take": 20,
    "skip": 0
  }'
```

**Response:**
```json
[
  {
    "idCircuitoP": 1,
    "CircuitoP": "CIRCUITO-HAVANA-1",
    "consumo": {
      "mw": 45.5,
      "historico": [40, 41, 42, 43, 44, 45.5],
      "fechaReferencia": "2024-01-15"
    }
  }
]
```

---

### 3️⃣ POST /circuitos/with-consumption-and-apagones (NEW)
**Obtener circuitos con consumo Y último apagón combinados**

🌟 Endpoint optimizado para rotaciones-ms (una sola llamada, datos atómicos)

```bash
curl -X POST http://localhost:3000/circuitos/with-consumption-and-apagones \
  -H "Content-Type: application/json" \
  -d '{
    "fecha": "2024-01-15T00:00:00Z",
    "take": 20,
    "skip": 0
  }'
```

**Response:**
```json
[
  {
    "idCircuitoP": 100,
    "CircuitoP": "CIRCUITO-1",
    "Clientes": 5000,
    "Apagable": true,
    "consumo": {
      "mw": 45.5,
      "historico": [40, 41, 42, 43, 44, 45.5],
      "fechaReferencia": "2024-01-15"
    },
    "ultimoApagon": {
      "idApagon": 987654,
      "FechaRetiro": "2024-01-14T10:30:00",
      "FechaCierre": null,
      "MWAfectados": 50,
      "estado": "abierto"
    }
  },
  {
    "idCircuitoP": 101,
    "CircuitoP": "CIRCUITO-2",
    "consumo": { ... },
    "ultimoApagon": null
  }
]
```

---

### 4️⃣ GET /circuitos/:id
**Obtener circuito por ID**

```bash
curl -X GET http://localhost:3000/circuitos/1 \
  -H "Content-Type: application/json"
```

---

## ⚡ Rotaciones Endpoints (NEW)

### 1️⃣ POST /rotaciones/generar
**Generar rotación de circuitos (v2.1 con equilibrio automático)**

El servicio automáticamente:
- Obtiene circuitos con consumo desde circuitos-ms
- Obtiene apagones desde circuitos-ms
- Obtiene aseguramientos desde BD
- Determina estado actual de cada circuito
- **Ejecuta algoritmo con déficit equilibrado**

#### Opción A: Modo Equilibrio (DEFAULT)

```bash
curl -X POST http://localhost:3000/rotaciones/generar \
  -H "Content-Type: application/json" \
  -d '{
    "deficitX": 50
  }'
```

**¿Qué pasa?**
1. Selecciona circuitos para encender (FIFO, orden natural)
2. Calcula consumo total de encendidos (ej: 30 MW)
3. **Suma al déficit**: 50 + 30 = 80 MW
4. Selecciona circuitos para apagar que cumplan la suma

**Response:**
```json
{
  "cola": [1, 5, 8, 12],
  "encendidos": [3, 7]
}
```

**Interpretación:**
- `cola`: Circuitos a APAGAR (nuevos IDs en rotación)
- `encendidos`: Circuitos a ENCENDER

---

#### Opción B: Solo Apagar (Emergencia)

```bash
curl -X POST http://localhost:3000/rotaciones/generar \
  -H "Content-Type: application/json" \
  -d '{
    "deficitX": 50,
    "soloApagar": true
  }'
```

**¿Qué pasa?**
1. **NO selecciona circuitos para encender**
2. Solo apaga para cubrir exactamente 50 MW
3. `encendidos` estará vacío

**Response:**
```json
{
  "cola": [1, 5],
  "encendidos": []
}
```

---

#### Opción C: Con Fecha de Referencia

```bash
curl -X POST http://localhost:3000/rotaciones/generar \
  -H "Content-Type: application/json" \
  -d '{
    "deficitX": 75,
    "fecha": "2024-01-15T10:00:00Z",
    "soloApagar": false
  }'
```

---

## 📊 Diagrama de Flujo

```
CLIENT REQUEST → API Gateway
                    ↓
        ┌───────────────────────┐
        │   /rotaciones/generar │
        └───────────────────────┘
                    ↓
        rotaciones.generar (NATS)
                    ↓
        RotacionesService.generate()
                    ↓
        ┌─────────────────────────────────┐
        │ Obtener datos internamente:     │
        │ - circuitos.findWithConsumptio │
        │   nAndApagones (circuitos-ms)  │
        │ - aseguramientos (BD local)    │
        └─────────────────────────────────┘
                    ↓
        ┌─────────────────────────────────┐
        │ Enriquecer circuitos:          │
        │ - Determinar estado actual     │
        │ - Marcar protegidos            │
        │ - Calcular uptime              │
        └─────────────────────────────────┘
                    ↓
        ┌─────────────────────────────────┐
        │ Ejecutar Algoritmo v2.1:       │
        │ - Phase 1: Seleccionar         │
        │   encendidos (FIFO)            │
        │ - Phase 2: Sumar consumo       │
        │ - Phase 3: Aumentar déficit    │
        │ - Phase 4: Apagar según       │
        │   déficit aumentado            │
        └─────────────────────────────────┘
                    ↓
        RESPONSE: { cola, encendidos }
```

---

## 🔗 Configuración NATS

El gateway se conecta a NATS en:

```bash
servers: [process.env.NATS_SERVER || 'nats://localhost:4222']
```

**Environment Variables:**
```bash
NATS_SERVER=nats://nats:4222  # En producción
```

---

## 📝 Parámetros Disponibles

### CreateRotacioneDto

```typescript
{
  deficitX: number;        // REQUERIDO: MW a cubrir
  fecha?: Date;            // Opcional: referencia temporal
  soloApagar?: boolean;    // Opcional: estrategia (default: false)
}
```

### RotacionResultadoDto

```typescript
{
  cola: number[];          // IDs de circuitos a APAGAR
  encendidos: number[];    // IDs de circuitos a ENCENDER
}
```

---

## ✅ Checklist de Integración

- ✅ Rotaciones module created in gateway
- ✅ RotacionesController with generar endpoint
- ✅ DTOs replicated in gateway
- ✅ Circuitos endpoint updated with combined endpoint
- ✅ Gateway app.module updated with RotacionesModule
- ✅ NATS integration ready
- ⏳ Integration testing (next phase)
- ⏳ Load testing (next phase)

---

## 🧪 TypeScript Client Example

```typescript
import axios from 'axios';

const gatewayUrl = 'http://localhost:3000';

// Modo Equilibrio
async function generarRotacionEquilibrio() {
  const response = await axios.post(`${gatewayUrl}/rotaciones/generar`, {
    deficitX: 50,
  });
  
  console.log('Cola (apagar):', response.data.cola);
  console.log('Encendidos:', response.data.encendidos);
}

// Modo Solo Apagar
async function generarRotacionSoloApagar() {
  const response = await axios.post(`${gatewayUrl}/rotaciones/generar`, {
    deficitX: 50,
    soloApagar: true,
  });
  
  console.log('Cola (apagar):', response.data.cola);
  console.log('Sin encender:', response.data.encendidos.length === 0);
}

// Con fecha específica
async function generarRotacionConFecha() {
  const response = await axios.post(`${gatewayUrl}/rotaciones/generar`, {
    deficitX: 75,
    fecha: new Date('2024-01-15T10:00:00Z'),
    soloApagar: false,
  });
  
  return response.data;
}
```

---

## 🚀 Próximos Pasos

1. **Testing**
   - [ ] Unit tests para RotacionesController
   - [ ] Integration tests con circuitos-ms
   - [ ] Load testing para NATS

2. **Monitoring**
   - [ ] Logs de cada rotación generada
   - [ ] Métricas de tiempo de respuesta
   - [ ] Alertas si deficit > 100 MW

3. **Documentación**
   - [ ] OpenAPI/Swagger spec
   - [ ] SLA del endpoint
   - [ ] Troubleshooting guide
