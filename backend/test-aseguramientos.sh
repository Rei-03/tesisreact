#!/bin/bash

# Script de prueba del flujo de Aseguramientos
# Uso: ./test-aseguramientos.sh

API_URL="http://localhost:3000"

echo "🧪 Pruebas de Aseguramientos - Flujo Completo"
echo "==========================================="
echo ""

# 1. GET Aseguramientos sin filtro
echo "1️⃣  GET - Listar sin filtro"
echo "Comando: curl \"$API_URL/rotaciones/aseguramientos?page=1&pageSize=10\""
echo ""
curl -s "$API_URL/rotaciones/aseguramientos?page=1&pageSize=10" | jq '.' || echo "Error conectando"
echo ""
echo "---"
echo ""

# 2. GET Aseguramientos con filtro por fecha
echo "2️⃣  GET - Listar con filtro por fecha"
FECHA=$(date +"%Y-%m-%d")
echo "Comando: curl \"$API_URL/rotaciones/aseguramientos?page=1&pageSize=10&fecha=$FECHA\""
echo ""
curl -s "$API_URL/rotaciones/aseguramientos?page=1&pageSize=10&fecha=$FECHA" | jq '.' || echo "Error conectando"
echo ""
echo "---"
echo ""

# 3. GET Aseguramientos con filtro por CircuitoP
echo "3️⃣  GET - Listar con filtro por CircuitoP"
echo "Comando: curl \"$API_URL/rotaciones/aseguramientos?page=1&pageSize=10&circuitoP=CIRCUITO1\""
echo ""
curl -s "$API_URL/rotaciones/aseguramientos?page=1&pageSize=10&circuitoP=CIRCUITO1" | jq '.' || echo "Error conectando"
echo ""
echo "---"
echo ""

# 4. POST - Crear nuevo aseguramiento
echo "4️⃣  POST - Crear nuevo aseguramiento"
echo ""

# Generar fechas
FECHA_INICIAL=$(date -u +"%Y-%m-%dT%H:%M:%S")
FECHA_FINAL=$(date -u -d "+2 hours" +"%Y-%m-%dT%H:%M:%S" 2>/dev/null || date -u -v+2H +"%Y-%m-%dT%H:%M:%S" 2>/dev/null || echo "2026-04-17T14:00:00")

cat > /tmp/aseguramiento.json <<EOF
{
  "id_CircuitoP": 1,
  "CircuitoP": "CIRCUITO_TEST",
  "fechaInicial": "$FECHA_INICIAL",
  "fechaFinal": "$FECHA_FINAL",
  "Observaciones": "Aseguramiento de prueba desde script",
  "tipo": "Programado",
  "mw": 50.5
}
EOF

echo "Payload:"
cat /tmp/aseguramiento.json | jq '.'
echo ""
echo "Comando: curl -X POST -H \"Content-Type: application/json\" -d @/tmp/aseguramiento.json $API_URL/rotaciones/aseguramientos"
echo ""
curl -s -X POST -H "Content-Type: application/json" -d @/tmp/aseguramiento.json "$API_URL/rotaciones/aseguramientos" | jq '.' || echo "Error en POST"
echo ""
echo "---"
echo ""

# 5. GET Circuitos (para verificar disponibilidad)
echo "5️⃣  GET - Listar circuitos apagables"
echo "Comando: curl \"$API_URL/circuitos?apagable=true\""
echo ""
curl -s "$API_URL/circuitos?apagable=true" | jq '.results | length' 2>/dev/null || echo "Error conectando"
echo ""

echo "✅ Pruebas completadas"
