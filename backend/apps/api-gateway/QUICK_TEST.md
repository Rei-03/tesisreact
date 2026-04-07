# 🧪 Quick Test Guide - API Gateway

## 📒 Prerequisitos

1. Gateway corriendo en `http://localhost:3000`
2. NATS corriendo en `nats://localhost:4222`
3. circuitos-ms corriendo
4. rotaciones-ms corriendo

---

## 🚀 Test 1: Obtener Circuitos Simples

```bash
# Terminal 1: Test basic circuitos
curl -X GET http://localhost:3000/circuitos \
  -H "Content-Type: application/json" | jq '.'
```

**Expected:** Array de circuitos

---

## 🚀 Test 2: Circuitos con Consumo

```bash
# Terminal 1: Test circuitos con consumo
curl -X POST http://localhost:3000/circuitos/with-consumption \
  -H "Content-Type: application/json" \
  -d '{
    "fecha": "2024-04-04T00:00:00Z",
    "take": 5,
    "skip": 0
  }' | jq '.'
```

**Expected:** Array con consumo MW

---

## 🟢 Test 3: Circuitos + Consumo + Apagones (NEW)

```bash
# Terminal 1: Test endpoint óptimo para rotaciones
curl -X POST http://localhost:3000/circuitos/with-consumption-and-apagones \
  -H "Content-Type: application/json" \
  -d '{
    "fecha": "2024-04-04T00:00:00Z",
    "take": 5,
    "skip": 0
  }' | jq '.[] | {id: .idCircuitoP, name: .CircuitoP, consumo: .consumo.mw, ultimoApagon}'
```

**Expected:** 
```json
{
  "id": 1,
  "name": "CIRCUITO-1",
  "consumo": 45.5,
  "ultimoApagon": { ... o null }
}
```

---

## ⚡ Test 4: Generar Rotación (Equilibrio)

```bash
# Terminal 1: Test rotación con equilibrio
curl -X POST http://localhost:3000/rotaciones/generar \
  -H "Content-Type: application/json" \
  -d '{
    "deficitX": 50
  }' | jq '.'
```

**Expected:**
```json
{
  "cola": [1, 5, 8, 12],
  "encendidos": [3, 7]
}
```

**Verificar:**
- `cola` tiene IDs de circuitos a apagar
- `encendidos` tiene IDs de circuitos a encender
- Ambos arrays tienen elementos

---

## ⚡ Test 5: Generar Rotación (Solo Apagar)

```bash
# Terminal 1: Test rotación sin encender
curl -X POST http://localhost:3000/rotaciones/generar \
  -H "Content-Type: application/json" \
  -d '{
    "deficitX": 50,
    "soloApagar": true
  }' | jq '.'
```

**Expected:**
```json
{
  "cola": [1, 5],
  "encendidos": []
}
```

**Verificar:**
- `cola` tiene elementos
- `encendidos` está vacío

---

## ⚡ Test 6: Rotación con Déficit Mayor

```bash
# Terminal 1: Test déficit de 100 MW
curl -X POST http://localhost:3000/rotaciones/generar \
  -H "Content-Type: application/json" \
  -d '{
    "deficitX": 100,
    "soloApagar": false
  }' | jq '.'
```

**Expected:**
- Más circuitos en `cola` (para cubrir 100+ MW)
- Algunos en `encendidos`

---

## 📊 Test 7: Verificar Consumo vs Deficit

```bash
# Terminal 1: Obtener un circuito específico
CIRCUITO_ID=1

# Primero obtén datos del circuito
curl -X POST http://localhost:3000/circuitos/with-consumption-and-apagones \
  -H "Content-Type: application/json" \
  -d '{
    "fecha": "2024-04-04T00:00:00Z",
    "take": 100,
    "skip": 0
  }' | jq ".[] | select(.idCircuitoP == $CIRCUITO_ID)" > circuito_data.json

# Luego pide rotación
curl -X POST http://localhost:3000/rotaciones/generar \
  -H "Content-Type: application/json" \
  -d '{
    "deficitX": 50
  }' > rotacion_data.json

# Verifica manualmente: 
# - Los IDs en rotacion_data.json.encendidos deben poder sumar ~25-40 MW
# - Los IDs en rotacion_data.json.cola deben sumar ~75-85 MW (50 + 25-35)
```

---

## 🔍 Test 8: Monitor de Logs

```bash
# Terminal 2: Monitor rotaciones-ms logs
docker logs -f <rotaciones-ms-container> | grep -i rotacion

# Terminal 3: Monitor circuitos-ms logs
docker logs -f <circuitos-ms-container> | grep -i circuito

# Terminal 4: Monitor gateway logs
docker logs -f <gateway-container> | grep -i rotacion
```

---

## ❌ Error Handling Tests

### Test: Déficit Inválido (0)

```bash
curl -X POST http://localhost:3000/rotaciones/generar \
  -H "Content-Type: application/json" \
  -d '{
    "deficitX": 0
  }'
```

**Expected:** Error o respuesta vacía

### Test: Déficit Negativo

```bash
curl -X POST http://localhost:3000/rotaciones/generar \
  -H "Content-Type: application/json" \
  -d '{
    "deficitX": -50
  }'
```

**Expected:** Error

### Test: NATS No Conectado

```bash
# 1. Detiene NATS
# 2. Intenta request
curl -X POST http://localhost:3000/rotaciones/generar \
  -H "Content-Type: application/json" \
  -d '{"deficitX": 50}'
```

**Expected:** Timeout o error de conexión

---

## 📈 Performance Test

```bash
# Terminal 1: Benchmark (10 requests)
for i in {1..10}; do
  echo "Request $i..."
  time curl -X POST http://localhost:3000/rotaciones/generar \
    -H "Content-Type: application/json" \
    -d "{\"deficitX\": $((RANDOM % 100 + 1))}" > /dev/null
  sleep 1
done
```

**Expected:** < 200ms por request

---

## ✅ Acceptance Criteria

- [ ] Test 1: Circuitos obtenidos
- [ ] Test 2: Consumo incluido
- [ ] **Test 3: Endpoint combinado funciona (NEW)**
- [ ] Test 4: Rotación con equilibrio
- [ ] Test 5: Rotación sin encender
- [ ] Test 6: Déficit mayor funciona
- [ ] Test 7: Consumo suma correctamente
- [ ] Performance: < 200ms

---

## 🐛 Troubleshooting

**Error: "Cannot find rotaciones service"**
- Verificar que rotaciones-ms está corriendo
- Verificar NATS connection
- Revisar logs del gateway

**Response vacía en /circuitos/with-consumption-and-apagones**
- Verificar que DB tiene datos
- Verificar que circuitos-ms implementó el endpoint
- Check circuitos-ms logs

**Timeout en /rotaciones/generar**
- Verificar que rotaciones-ms está corriendo
- Revisar logs de rotaciones-ms
- Verificar que obtiene datos desde circuitos-ms
