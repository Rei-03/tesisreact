📌 Rotación de Energía - Algoritmo y Documentación

## 📋 Descripción

Este documento describe la implementación del algoritmo de rotación de energía para el servicio de rotaciones-ms. El algoritmo determina qué circuitos eléctricos deben apagarse para cubrir un déficit de potencia y cuáles deben encenderse siguiendo una lógica de rotación ordenada.

---

## 🎯 Objetivos del Algoritmo

1. **Optimizar el uso de recursos**: Cubrir el déficit mínimo requerido
2. **Minimizar afectación**: Rotar equitativamente los circuitos
3. **Priorización inteligente**: Usar pesos para decidir qué circuitos apagar
4. **Determinismo**: Mismos inputs = mismos outputs
5. **Funcionamiento puro**: Sin efectos secundarios

---

## 🔧 Entrada (DTO: CreateRotacioneDto)

```typescript
{
  circuitos: Circuito[];          // Lista de circuitos disponibles (sin protegidos)
  deficitX: number;                // Déficit de potencia en MW
  colaActual?: string[];           // Cola actual de apagados (opcional)
  fecha?: Date;                    // Fecha de referencia (opcional)
}
```

### Estructura de Circuito

```typescript
interface Circuito {
  idCircuitoP: number;             // ID único del circuito
  idProv: string;                  // ID de la provincia
  Circuito33: string;              // Código del circuito 33kV
  Bloque: number;                  // Bloque de distribución
  CircuitoP: string;               // Nombre del circuito
  Clientes: number;                // Cantidad de clientes afectados
  ZonaAfectada: string;            // Descripción de zona
  Apagable: boolean;               // Si es permitido apagarlo
  
  // Estado del circuito
  estado: 'encendido' | 'apagado'; // Estado actual
  protegido: boolean;              // Si está protegido (excluído del algoritmo)
  ultimoCambioEstado: Date;        // Última fecha de cambio de estado
  
  // Consumo
  consumo: {
    mw: number;                    // MW actuales
    historico: number[];           // Array de 24 horas
    fechaReferencia: string;       // YYYY-MM-DD
  };
  
  // Último apagón (opcional)
  ultimoApagon?: {
    idApagon: number;
    FechaRetiro: Date;
    FechaCierre: Date | null;
    MWAfectados: number;
    Observaciones: string;
    AbiertoPor: number;
    estado: 'abierto' | 'cerrado';
  };
}
```

---

## 📤 Salida (DTO: RotacionResultadoDto)

```typescript
interface RotacionResultadoDto {
  cola: string[];             // IDs de circuitos en cola de apagado
  encendidos: string[];       // IDs de circuitos a encender
}
```

### Ejemplo:

```json
{
  "cola": ["1", "5", "8", "12"],
  "encendidos": ["3", "7"]
}
```

---

## 🧮 Algoritmo de Apagado

### Criterio de Priorización

**Fórmula de Peso:**
```
Peso = (tiempoEncendidoMinutos * 0.8) + (consumoActualMW * 0.2)
```

**Interpretación:**
- **80%**: Tiempo que lleva encendido (prioridad principal)
  - Circuitos con más tiempo encendido se apagan primero
  - Distribución equitativa en el tiempo

- **20%**: Consumo actual (desempate)
  - Si dos circuitos llevan Similar tiempo encendido, se apaga el de mayor consumo
  - Minimiza impacto en cobertura de déficit

### Pasos del Algoritmo de Apagado

1. **Filtrar**: Seleccionar solo circuitos encendidos
2. **Calcular tiempos**: `tiempoEncendido = ahora - ultimoCambioEstado (en minutos)`
3. **Calcular pesos**: Aplicar fórmula anterior
4. **Ordenar**: De mayor a menor peso (descendente)
5. **Seleccionar secuencialmente**: Hasta cubrir déficit ≥ deficitX

```typescript
// Pseudocódigo
encendidos = circuitos.filter(c => c.estado === 'encendido')
pesos = encendidos.map(c => ({
  ...c,
  peso: (c.tiempoEncendido * 0.8) + (c.consumo.mw * 0.2)
}))
ordenados = pesos.sort((a, b) => b.peso - a.peso)

consumoAcumulado = 0
seleccionados = []
for (circuito in ordenados) {
  if (consumoAcumulado >= deficitX) break
  seleccionados.push(circuito)
  consumoAcumulado += circuito.consumo.mw
}
```

---

## 🔄 Algoritmo de Encendido (FIFO)

### Criterio de Priorización

Los circuitos apagados se encienden siguiendo **estrictamente FIFO** (First In, First Out):

1. **Circu suitos en cola actual**: Respetan orden de entrada en la cola
2. **Circuitos fuera de cola**: Ordenados por tiempo apagado (descendente)

### Pasos del Algoritmo de Encendido

1. **Filtrar**: Seleccionar solo circuitos apagados
2. **Marcar posición en cola**: Índice de cada circuito en `colaActual`
3. **Ordenar**:
   - Primero: Por posición en cola (menor índice = sale primero)
   - Segundo: Por tiempoApagado (mayor tiempo = primero)
   - Tercero: Por ID (determinismo)
4. **Devolver**: Lista ordenada para encender

```typescript
// Pseudocódigo
apagados = circuitos.filter(c => c.estado === 'apagado')
conPosicion = apagados.map(c => ({
  ...c,
  posicion: colaActual.indexOf(c.idCircuitoP)
}))

ordenados = conPosicion.sort((a, b) => {
  if (a.posicion !== b.posicion) {
    return a.posicion - b.posicion  // Posición en cola
  }
  if (a.posicion === Infinity) {
    return b.tiempoApagado - a.tiempoApagado  // Más tiempo apagado
  }
  return 0
})

return ordenados.map(c => c.idCircuitoP)
```

---

## 📊 Actualización de Cola

La cola representa el orden de rotación de circuitos apagados.

### Reglas

1. **Remover**: Los circuitos que se enciendan salen de la cola
2. **Agregar al final**: Los circuitos nuevamente apagados entran al final
3. **Mantener orden**: El resto permanece en posiciones relativas

### Operación

```typescript
// Pseudocódigo
colaNueva = colaActual
  .filter(id => !idsEncendidos.includes(id))  // Remover encendidos
  .concat(idsNuevosApagados)                   // Agregar nuevos al final

return colaNueva
```

---

## ✅ Validaciones

El servicio valida:

1. ✓ Lista de circuitos no vacía
2. ✓ Déficit > 0
3. ✓ Circuitos protegidos están filtrados
4. ✓ Estructura de Circuito válida

---

## 🏗️ Propiedades del Algoritmo

### Funcionalidad Pura ✓

- **Sin mutaciones**: No modifica estructuras de entrada
- **Determinista**: Mismo input → Mismo output
- **Sin efectos secundarios**: No accede a estado global

### Implementación Funcional ✓

- `map()`: Enriquecer datos, adjuntar pesos y tiempos
- `filter()`: Seleccionar por criterios (estado, protección)
- `sort()`: Ordenar por pesos y tiempos
- No loops imperativos

### Complejidad ⚙️

- **Tiempo**: O(n log n) - dominado por sort
- **Espacio**: O(n) - arrays de enriquecimiento
- Escalable para miles de circuitos

---

## 💡 Ejemplos de Uso

### Ejemplo 1: Apagar 2 circuitos para cubrir 50MW

```typescript
const circuitos = [
  {
    idCircuitoP: 1,
    estado: 'encendido',
    ultimoCambioEstado: new Date(ahora - 120 * 60000), // 2 horas
    consumo: { mw: 40 }
  },
  { 
    idCircuitoP: 2,
    estado: 'encendido',
    ultimoCambioEstado: new Date(ahora - 60 * 60000), // 1 hora
    consumo: { mw: 30 }
  }
];

const resultado = RotacionAlgoritmo.ejecutar(circuitos, 50);

// Resultado esperado
{
  cola: ['1'],           // C1 se apaga (más tiempo encendido)
  encendidos: []         //Sin encendidos
}
```

**Por qué C1?**
- Peso C1: (120 * 0.8) + (40 * 0.2) = 96 + 8 = **104**  
- Peso C2: (60 * 0.8) + (30 * 0.2) = 48 + 6 = **54**
- C1 > C2 → C1 se apaga primero

---

### Ejemplo 2: FIFO con cola existente

```typescript
const circuitos = [
  { idCircuitoP: 1, estado: 'apagado', ultimoCambioEstado: ahora - 180*60000 },
  { idCircuitoP: 2, estado: 'apagado', ultimoCambioEstado: ahora - 120*60000 },
  { idCircuitoP: 3, estado: 'apagado', ultimoCambioEstado: ahora - 60*60000 },
];

const colaActual = ['2', '1', '3'];
const resultado = RotacionAlgoritmo.ejecutar(circuitos, 0, colaActual);

// Resultado esperado
{
  cola: [],
  encendidos: ['2', '1', '3'] // Orden de cola respetado: FIFO
}
```

**Por qué ese orden?**
- C2 estaba primero en la cola → sale primero
- C1 estaba segundo → sale segundo  
- C3 estaba tercero → sale tercero

---

## 🔍 Testing

El archivo `rotacion.algoritmo.spec.ts` incluye tests para:

1. ✓ Selección por peso
2. ✓ Cubrimiento de déficit
3. ✓ FIFO funcionando
4. ✓ Actualización de cola
5. ✓ Casos edge
6. ✓ Inmutabilidad
7. ✓ Determinismo
8. ✓ Flujo completo

---

## 🚀 Extensiones Futuras

1. **Pesos dinámicos**: Configurables por parámetro
2. **Restricciones**: Máximo apagones por zona
3. **Historial**: Rastrear rotaciones pasadas
4. **Analytics**: Estadísticas de equidad
5. **Predicción**: Optimización basada en consumo futuro

---

## 📁 Estructura de Archivos

```
rotaciones-ms/src/rotaciones/
├── rotacion.algoritmo.ts          # Implementación del algoritmo
├── rotacion.algoritmo.spec.ts     # Tests unitarios
├── rotaciones.service.ts          # Servicio NestJS
├── rotaciones.controller.ts       # Endpoints
├── interfaces/
│   └── circuito.interface.ts      # Interfaces y tipos
├── dto/
│   ├── create-rotacione.dto.ts    # DTO entrada
│   ├── rotacion-resultado.dto.ts  # DTO salida
│   └── update-rotacione.dto.ts    # Actualización
└── ROTACION_ALGORITMO.md          # Esta documentación
```

---

## 📞 Contacto y Soporte

Para dudas sobre la implementación:
- Ver tests en `rotacion.algoritmo.spec.ts`
- Revisar tipos en `interfaces/circuito.interface.ts`
- Documentación de NestJS pattern
