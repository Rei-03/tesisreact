#!/usr/bin/env bash

# Script para ejecutar todas las pruebas del proyecto

echo "╔════════════════════════════════════════════════════════════╗"
echo "║         EJECUTANDO TODAS LAS PRUEBAS DEL PROYECTO         ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Colores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}📊 PRUEBAS FRONTEND (React + Jest)${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

cd "$(dirname "${BASH_SOURCE[0]}")/frontend" || exit

echo -e "${YELLOW}▶ Pruebas de utilidades de circuitos...${NC}"
npm test -- circuitUtils.test.ts --silent --testTimeout=10000

echo ""
echo -e "${YELLOW}▶ Pruebas de contexto de autenticación...${NC}"
npm test -- AuthContext.test.jsx --silent --testTimeout=10000

echo ""
echo -e "${YELLOW}▶ Pruebas de servicio de usuarios...${NC}"
npm test -- usuariosService.test.js --silent --testTimeout=20000

echo ""
echo -e "${YELLOW}▶ Pruebas de integración Frontend-Backend...${NC}"
npm test -- __tests__/integration/integrationTests.test.js --silent --testTimeout=10000

echo ""
echo -e "${BLUE}📊 PRUEBAS BACKEND (NestJS + Jest)${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

cd "$(dirname "${BASH_SOURCE[0]}")/backend/apps/auth-ms" || exit

echo -e "${YELLOW}▶ Pruebas del servicio de autenticación...${NC}"
npm test -- auth.service.spec.ts --silent --testTimeout=15000

echo ""
cd "$(dirname "${BASH_SOURCE[0]}")/backend/apps/circuitos-ms" || exit

echo -e "${YELLOW}▶ Pruebas del servicio de circuitos...${NC}"
npm test -- circuitos.service.spec.ts --silent --testTimeout=15000

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo -e "║${GREEN}         ✅ TODAS LAS PRUEBAS COMPLETADAS          ${NC}║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "📈 Reporte detallado disponible en: TEST_REPORT.md"
