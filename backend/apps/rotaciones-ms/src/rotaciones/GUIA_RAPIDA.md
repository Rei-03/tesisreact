# 📌 GUÍA RÁPIDA - Rotación de Energía v2.1 (CON EQUILIBRIO DE CARGA)

## 🎯 Lo Importante

El endpoint es **SUPER SIMPLE**. Solo envía el déficit, el servicio hace lo demás.

**NUEVO**: Ahora el algoritmo es inteligente con el balance:
- Si enciendes circuitos (FIFO), **su consumo se suma al déficit**
- Por eso tienes que apagar MÁS para compensar

---

## 📤 Request

### Opción 1: Encender + Apagar (DEFAULT)

```bash
POST http://localhost:3000/rotaciones/generar
Content-Type: application/json

{
  "deficitX": 50
}

# RESULTADO:
# - La rotación ENCIENDE circuitos FIFO
# - Su consumo (ej: 20 MW) se suma al déficit
# - Déficit total a cubrir: 50 + 20 = 70 MW
# - Apaga 70 MW para balancear
```

### Opción 2: Solo Apagar (SIN ENCENDER)

```bash
{
  "deficitX": 50,
  "soloApagar": true  # ← Nuevo parámetro
}

# RESULTADO:
# - La rotación SOLO apaga circuitos
# - Apaga exactamente 50 MW
# - encendidos: [] (vacío)
```

### Con Fecha Opcional

```bash
{
  "deficitX": 75,
  "fecha": "2024-01-15T00:00:00Z",
  "soloApagar": false  # opcional
}
```

---

## 📥 Response

```json
{
  "success": true,
  "data": {
    "cola": ["1", "5", "8", "12"],    // Circuitos a apagar
    "encendidos": ["3", "7"]          // Circuitos a encender (vacío si soloApagar)
  },
  "timestamp": "2024-01-15T14:30:00.000Z"
}
```

---

## ⚙️ Qué Pasa Internamente

### Modo EQUILIBRIO (default: soloApagar=false)

```
1. Selecciona circuitos para ENCENDER (FIFO)
2. Calcula su consumo total (ej: 20 MW)
3. Suma al déficit: 50 + 20 = 70 MW
4. Selecciona circuitos a APAGAR para cubrir 70 MW
5. Retorna cola nueva + encendidos
```

**Ejemplo:**
```
Déficit original: 50 MW
Circuitos a encender (FIFO): C1 (15 MW) + C2 (5 MW) = 20 MW
Déficit aumentado: 50 + 20 = 70 MW
Circuitos a apagar: Aquellos que sumen ≥ 70 MW
```

### Modo SOLO APAGAR (soloApagar=true)

```
1. NO selecciona circuitos para encender
2. Consume encendidos = 0 MW
3. Apaga circuitos para cubrir exactamente 50 MW
4. encendidos: []
```

---

## 💡 Ejemplo TypeScript

```typescript
// Equilibrio: enciende y apaga balanceado
const response1 = await fetch('http://localhost:3000/rotaciones/generar', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ deficitX: 50 })
});

// Solo apagar: solo corta, sin encender
const response2 = await fetch('http://localhost:3000/rotaciones/generar', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    deficitX: 50,
    soloApagar: true 
  })
});
```

---

## 🔗 NATS (Desde otro microservicio)

```typescript
// Con encendidos
const resultado1 = await firstValueFrom(
  this.natsClient.send('rotaciones.generar', {
    deficitX: 50
  })
);

// Solo apagar
const resultado2 = await firstValueFrom(
  this.natsClient.send('rotaciones.generar', {
    deficitX: 50,
    soloApagar: true
  })
);
```

---

## 📊 Cómo Determina Estado

```
Si ultimoApagon.FechaCierre === null
  → APAGADO (apagón abierto)
Si no hay apagón O tiene FechaCierre
  → ENCENDIDO
```

---

## 📋 Parámetros del DTO

```typescript
{
  deficitX: number;           // REQUERIDO: MW a cubrir
  fecha?: Date;               // Opcional: fecha de referencia
  soloApagar?: boolean;       // Opcional: default false
                              // false = equilibrio (RECOMENDADO)
                              // true = solo apagar
}
```

---

## ❌ Errores Comunes

### Error: "El déficit de potencia debe ser mayor a 0"
```json
{ "deficitX": 0 }   // ❌ Debe ser > 0
{ "deficitX": 50 }  // ✅ Correcto
```

### Error: "No se pudieron obtener los circuitos"
- ❌ circuitos-ms no está disponible
- ✅ Verificar que circuitos-ms esté corriendo

### Cola vacía y encendidos vacíos
- Todos los circuitos están encendidos
- No hay apagados para activar
- Situación normal si no hay apagones

---

## 🎯 Recomendación

**Usa equilibrio (soloApagar: false)** - es el modo inteligente:
- Rota circuitos (equidad)
- Balancea carga (consumed = apagado)
- Optimiza disponibilidad

Solo usa **soloApagar: true** si:
- Quieres una acción rápida
- No importa el balance
- Emergencia estricta

---

## 🚀 Eso es Todo

No hay más complejidad. El servicio es automático y equilibrado.

Ver: `INTEGRACION_ROTACION.md` para más detalles

