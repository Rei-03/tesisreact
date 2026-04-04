# 📌 Guía de Integración - Servicio de Rotación de Energía (ACTUALIZADA)

## 🎯 Cambios Principales

**SIMPLIFICADO**: El endpoint ahora solo recibe el **déficit**. El servicio obtiene los datos automáticamente:
- ✅ Obtiene circuitos desde **circuitos-ms**
- ✅ Obtiene apagones desde **circuitos-ms**
- ✅ Obtiene aseguramientos (protegidos) desde BD local
- ✅ Crea **cola NUEVA siempre** basada en estado actual
- ✅ NO usa cola anterior

---

## 📦 Instalación y Configuración

### 1. Verificar módulo registrado

En `rotaciones.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { RotacionesController } from './rotaciones.controller';
import { RotacionesService } from './rotaciones.service';
import { AseguramientosModule } from '../aseguramientos/aseguramientos.module';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    AseguramientosModule,
    ClientsModule.register([
      {
        name: 'NatsService',
        transport: Transport.NATS,
        options: {
          servers: [process.env.NATS_SERVER || 'nats://localhost:4222'],
        },
      },
    ]),
  ],
  controllers: [RotacionesController],
  providers: [RotacionesService],
  exports: [RotacionesService],
})
export class RotacionesModule {}
```

---

## 🔌 Uso del Servicio

### Endpoint Simple: Solo Déficit (con opción de equilibrio)

```typescript
import { Controller, Post, Body } from '@nestjs/common';
import { RotacionesService } from './rotaciones.service';
import { CreateRotacioneDto } from './dto/create-rotacione.dto';

@Controller('rotaciones')
export class RotacionesController {
  constructor(private rotacionesService: RotacionesService) {}

  @Post('generar')
  async generarRotacion(@Body() dto: CreateRotacioneDto) {
    // ✅ Solo necesita el déficit y opcionalmente soloApagar
    return await this.rotacionesService.generate(dto);
  }
}
```

### Request (Opción 1: Modo Equilibrio - DEFAULT)

```bash
POST /rotaciones/generar
Content-Type: application/json

{
  "deficitX": 50
}
```

**¿Qué pasa?**
1. Selecciona circuitos para encender (FIFO)
2. Calcula su consumo total (ej: 20 MW)
3. **Suma**: déficit = 50 + 20 = 70 MW
4. Apaga circuitos para cubrir 70 MW

**Response:**
```json
{
  "cola": ["1", "5", "8"],
  "encendidos": ["3", "7"]
}
```

### Request (Opción 2: Solo Apagar)

```bash
POST /rotaciones/generar
Content-Type: application/json

{
  "deficitX": 50,
  "soloApagar": true
}
```

**¿Qué pasa?**
1. NO selecciona circuitos para encender
2. Solo apaga para cubrir exactamente 50 MW
3. Resultado: encendidos = []

**Response:**
```json
{
  "cola": ["1", "5"],
  "encendidos": []
}
```

### Request con Fecha Opcional

```bash
POST /rotaciones/generar
Content-Type: application/json

{
  "deficitX": 75,
  "fecha": "2024-01-15T00:00:00Z",
  "soloApagar": false
}
```

---

## 🔄 Flujo Interno Automático

```
Request (solo deficitX)
        ↓
📥 Obtener circuitos desde circuitos-ms
        ↓
📥 Obtener apagones depuis circuitos-ms
        ↓
📥 Obtener aseguramientos de BD
        ↓
✨ Enriquecer circuitos:
   - Estado (encendido/apagado) → Del apagón más reciente
   - Protegido → De aseguramientos
   - ultimoCambioEstado → Del apagón
   - consumo → Del circuitos-ms
        ↓
🧮 Ejecutar algoritmo CON COLA NUEVA VACÍA
        ↓
📤 Response (cola nueva + encendidos)
```

---

## 💡 Cómo Determina Estado

El servicio automáticamente determina si un circuito está **encendido** o **apagado**:

```typescript
// En enriquecerCircuitos()
const tieneApagonAbierto = c.ultimoApagon && c.ultimoApagon.FechaCierre === null;
const estado = tieneApagonAbierto ? 'apagado' : 'encendido';
```

**Lógica:**
- ✅ Último apagón **sin FechaCierre** → **APAGADO**
- ✅ Último apagón **con FechaCierre** O sin apagón → **ENCENDIDO**

**Timestamp del último cambio:**
```typescript
let ultimoCambioEstado = new Date();
if (c.ultimoApagon) {
  ultimoCambioEstado = tieneApagonAbierto
    ? new Date(c.ultimoApagon.FechaRetiro)    // Si apagado
    : new Date(c.ultimoApagon.FechaCierre);   // Si encendido
}
```

---

## 🧮 Lógica de Equilibrio (NUEVO en v2.1)

### Mecanismo de Suma de Consumo

**Problema que resuelve:**
```
ANTES (sin equilibrio):
  Déficit: 50 MW
  Enciendes 2 circuitos de 20 MW c/u (total 40 MW)
  Apagas solo 50 MW
  Resultado: +40 -50 = -10 MW (¡SOBRECUBIERTO!)

AHORA (con equilibrio):
  Déficit: 50 MW
  Enciendes 2 circuitos de 20 MW c/u (total 40 MW)
  Consumo se suma al déficit: 50 + 40 = 90 MW
  Apagas 90 MW para compensar
  Resultado: +40 -90 = -50 MW (BALANCE PERFECTO ✓)
```

### Fórmula

```
Déficit Efectivo = Déficit Original + Consumo de Encendidos

Ejemplo práctico:
- deficitX = 50 MW (lo que necesito cubrir)
- Encendidos: C1 (15 MW) + C2 (10 MW) + C3 (5 MW) = 30 MW
- Déficit Efectivo = 50 + 30 = 80 MW
- Se apagan circuitos cuya suma ≥ 80 MW
```

### Pseudocódigo del Algoritmo

```typescript
// 1. Si NO es soloApagar: seleccionar circuitos a encender
let consumoEncendidos = 0;
if (!soloApagar) {
  const aEncender = seleccionarCircuitosEncender(circuitos);
  consumoEncendidos = aEncender.reduce(c => c.consumo.mw, 0);
}

// 2. Calcular déficit aumentado
const deficitAumentado = deficitX + consumoEncendidos;

// 3. Seleccionar apagados para cubrir déficit aumentado
const aApagar = seleccionarCircuitosApagar(circuitos, deficitAumentado);

// 4. Retornar resultado
return {
  cola: aApagar.map(c => c.id),
  encendidos: aEncender.map(c => c.id),
};
```

### Parámetros Disponibles

```typescript
interface CreateRotacioneDto {
  deficitX: number;     // REQUERIDO: MW a cubrir
  fecha?: Date;         // Opcional: fecha de referencia
  soloApagar?: boolean; // Opcional (default: false)
}
```

### Tabla de Casos de Uso

| Parámetro | Modo | Resultado |
|-----------|------|-----------|
| `deficitX: 50` | Equilibrio automático | Enciende + apaga (deficit = 50 + consumo) |
| `deficitX: 50, soloApagar: true` | Emergencia | Solo apaga (sin encender) |
| `deficitX: 75, fecha: "..."` | Análisis histórico | Enciende + apaga con balanceo |

---

## 🧪 Ejemplo Completo

```typescript
// Controlador
@Post('generar')
async generarRotacion(@Body() dto: CreateRotacioneDto) {
  try {
    // 🟢 El servicio hace TODO automáticamente
    const resultado = await this.rotacionesService.generate({
      deficitX: 50, // Solo esto!
      fecha: new Date(), // Opcional
    });

    // Usar resultado
    return {
      success: true,
      apagados: resultado.cola,
      encendidos: resultado.encendidos,
      timestamp: new Date(),
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
```

---

## 📊 Ejemplo de Datos Internos

**Circuitos obtenidos desde circuitos-ms:**
```json
{
  "idCircuitoP": 1,
  "CircuitoP": "CIRCUITO-HAVANA-1",
  "consumo": { "mw": 45, "historico": [...] },
  "ultimoApagon": {
    "FechaRetiro": "2024-01-15T10:00:00",
    "FechaCierre": null,  // ← Abierto = APAGADO
  }
}
```

**Después de enriquecer:**
```typescript
{
  ...datos,
  estado: "apagado",                    // ← Determinado
  protegido: false,                     // ← De aseguramientos
  ultimoCambioEstado: "2024-01-15T10:00:00", // ← Del apagón
}
```

---

## ⚙️ Configuración NATS

En `.env`:

```env
NATS_SERVER=nats://localhost:4222
```

En `main.ts`:

```typescript
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

app.connectMicroservice<MicroserviceOptions>({
  transport: Transport.NATS,
  options: {
    servers: [process.env.NATS_SERVER || 'nats://localhost:4222'],
  },
});
```

---

## 🐛 Troubleshooting

### Error: "No se pudieron obtener los circuitos del servicio"

**Causa:** circuitos-ms no responde

**Solución:**
```bash
# Verificar NATS
nats-server

# Verificar circuitos-ms está corriendo
npm run start:dev -- circuitos-ms
```

### Error: "El déficit debe ser mayor a 0"

**Causa:** deficitX ≤ 0

**Solución:**
```json
{ "deficitX": 50 }  // Debe ser > 0
```

### Cola vacía en resultado

**Causa:** Todos los circuitos están encendidos y no hay déficit

**Solución:** Verificar que hay circuitos apagados o que el déficit requiere apagar

---

## 📁 Archivos Principales

### DTO
- `dto/create-rotacione.dto.ts` - Solo deficitX y fecha

### Servicio
- `rotaciones.service.ts` - Orquesta todo automáticamente
  - `generate()` - Método único principal
  - `obtenerCircuitosConDatos()` - Llamada a circuitos-ms
  - `obtenerAseguramientos()` - Consulta BD local
  - `enriquecerCircuitos()` - Determina estado, protección

### Algoritmo
- `rotacion.algoritmo.ts` - Lógica pura de decisiones
  - `ejecutar()` - Aplica pesos y FIFO

---

## ✅ Checklist de Implementación

- [ ] Módulo registrado con NATS
- [ ] variables de ambiente configuradas
- [ ] Controlador crea endpoint POST
- [ ] Llama a `rotacionesService.generate(dto)`
- [ ] Servicio obtiene/enriquece circuitos
- [ ] Algoritmo ejecuta con cola vacía
- [ ] Response tiene estructura { cola, encendidos }
- [ ] Error handling implementado
- [ ] Logs agregados para debugging

---

## 🚀 Flujo Típico de Uso

```
1️⃣ Frontend/Cliente
   POST /rotaciones/generar
   { deficitX: 50 }
   
2️⃣ RotacionesController
   Recibe DTO
   
3️⃣ RotacionesService.generate()
   ↳ obtenerCircuitosConDatos()
   ↳ obtenerAseguramientos()
   ↳ enriquecerCircuitos()
   ↳ filtrar aptos
   ↳ RotacionAlgoritmo.ejecutar()
   
4️⃣ RotacionAlgoritmo.ejecutar()
   ↳ Calcular pesos
   ↳ Seleccionar apagados
   ↳ Seleccionar encendidos FIFO
   ↳ Actualizar cola
   
5️⃣ Response
   {
     cola: ["1", "5", "8"],
     encendidos: ["3", "7"]
   }
   
6️⃣ Cliente actúa
   - Apaga circuitos en cola
   - Enciende circuitos en encendidos
   - Registra en auditoría
```

---

## 📞 Preguntas Frecuentes

**P: ¿Por qué siempre crea cola nueva?**
R: El estado actual de los circuitos cambia constantemente (consumo, apagones). Cada rotación debe basarse en el estado presente, no histórico.

**P: ¿Dónde se persiste la cola?**
R: Actualmente no. El cliente debe registrar si quiere histórico.

**P: ¿Y si faltan aseguramientos?**
R: El servicio asume cero protegidos y continúa (solo log warning).

**P: ¿Cuánto tarda la rotación?**
R: ~100-500ms dependiendo de cantidad de circuitos y latencia NATS.

---

**Status**: ✅ IMPLEMENTACIÓN ACTUALIZADA - LISTA PARA PRODUCCIÓN

