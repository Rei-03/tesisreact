/**
 * EJEMPLOS DE USO DEL ALGORITMO DE ROTACIÓN DE ENERGÍA
 * 
 * Este archivo muestra casos reales de uso con datos de ejemplo
 */

import { RotacionAlgoritmo } from './rotacion.algoritmo';
import { Circuito, ResultadoRotacion } from './interfaces/circuito.interface';

// ============================================================================
// EJEMPLO 1: Déficit Simple - Apagar 2 circuitos
// ============================================================================
export const EJEMPLO_1_DEFICIT_SIMPLE = () => {
  console.log('\n🔴 EJEMPLO 1: Déficit Simple (50 MW)');
  console.log('=' .repeat(60));

  const ahora = new Date();
  const circuitos: Circuito[] = [
    {
      idCircuitoP: 1,
      idProv: 'HAB',
      Circuito33: 'C33-A001',
      Bloque: 1,
      CircuitoP: 'CIRCUITO-HAVANA-1',
      Clientes: 5000,
      ZonaAfectada: 'Centro Habana',
      Apagable: true,
      estado: 'encendido',
      protegido: false,
      ultimoCambioEstado: new Date(ahora.getTime() - 120 * 60 * 1000), // 2 horas
      consumo: { mw: 45, historico: Array(24).fill(45), fechaReferencia: '2024-01-15' },
    },
    {
      idCircuitoP: 2,
      idProv: 'HAB',
      Circuito33: 'C33-A002',
      Bloque: 2,
      CircuitoP: 'CIRCUITO-HAVANA-2',
      Clientes: 3000,
      ZonaAfectada: 'Vedado',
      Apagable: true,
      estado: 'encendido',
      protegido: false,
      ultimoCambioEstado: new Date(ahora.getTime() - 60 * 60 * 1000), // 1 hora
      consumo: { mw: 35, historico: Array(24).fill(35), fechaReferencia: '2024-01-15' },
    },
    {
      idCircuitoP: 3,
      idProv: 'HAB',
      Circuito33: 'C33-A003',
      Bloque: 3,
      CircuitoP: 'CIRCUITO-HAVANA-3',
      Clientes: 2000,
      ZonaAfectada: 'Playa',
      Apagable: true,
      estado: 'encendido',
      protegido: false,
      ultimoCambioEstado: new Date(ahora.getTime() - 30 * 60 * 1000), // 30 min
      consumo: { mw: 25, historico: Array(24).fill(25), fechaReferencia: '2024-01-15' },
    },
  ];

  const deficitX = 50;
  const resultado = RotacionAlgoritmo.ejecutar(circuitos, deficitX);

  console.log('\n📊 Entrada:');
  console.log(`  - Circuitos totales: ${circuitos.length}`);
  console.log(`  - Déficit a cubrir: ${deficitX} MW`);
  console.log('\n📋 Detalles de circuitos:');
  circuitos.forEach((c) => {
    const tiempoHoras = (ahora.getTime() - c.ultimoCambioEstado.getTime()) / (1000 * 60 * 60);
    console.log(
      `  ${c.CircuitoP}: ${c.consumo.mw} MW, encendido hace ${tiempoHoras.toFixed(1)}h`,
    );
  });

  console.log('\n🟢 Resultado:');
  console.log(`  Cola (apagados): [${resultado.cola.join(', ')}]`);
  console.log(`  Encendidos: [${resultado.encendidos.join(', ')}]`);

  // Validación
  const consumoApagados = resultado.cola
    .map((id) => circuitos.find((c) => c.idCircuitoP.toString() === id))
    .reduce((sum, c) => sum + (c?.consumo.mw || 0), 0);
  console.log(`\n✅ Consumo total apagado: ${consumoApagados} MW (≥ ${deficitX})`);

  return resultado;
};

// ============================================================================
// EJEMPLO 2: FIFO - Encender circuitos siguiendo orden de cola
// ============================================================================
export const EJEMPLO_2_FIFO_ENCENDIDO = () => {
  console.log('\n🔵 EJEMPLO 2: FIFO - Encender en orden de cola');
  console.log('='.repeat(60));

  const ahora = new Date();
  const circuitos: Circuito[] = [
    {
      idCircuitoP: 1,
      idProv: 'HAB',
      Circuito33: 'C33-B001',
      Bloque: 1,
      CircuitoP: 'CIRCUITO-PLAYA-1',
      Clientes: 4000,
      ZonaAfectada: 'Playa',
      Apagable: true,
      estado: 'apagado',
      protegido: false,
      ultimoCambioEstado: new Date(ahora.getTime() - 300 * 60 * 1000), // 5 horas
      consumo: { mw: 40, historico: Array(24).fill(40), fechaReferencia: '2024-01-15' },
    },
    {
      idCircuitoP: 2,
      idProv: 'HAB',
      Circuito33: 'C33-B002',
      Bloque: 2,
      CircuitoP: 'CIRCUITO-PLAYA-2',
      Clientes: 3500,
      ZonaAfectada: 'Playa',
      Apagable: true,
      estado: 'apagado',
      protegido: false,
      ultimoCambioEstado: new Date(ahora.getTime() - 180 * 60 * 1000), // 3 horas
      consumo: { mw: 35, historico: Array(24).fill(35), fechaReferencia: '2024-01-15' },
    },
    {
      idCircuitoP: 3,
      idProv: 'HAB',
      Circuito33: 'C33-B003',
      Bloque: 3,
      CircuitoP: 'CIRCUITO-PLAYA-3',
      Clientes: 2500,
      ZonaAfectada: 'Playa',
      Apagable: true,
      estado: 'apagado',
      protegido: false,
      ultimoCambioEstado: new Date(ahora.getTime() - 120 * 60 * 1000), // 2 horas
      consumo: { mw: 30, historico: Array(24).fill(30), fechaReferencia: '2024-01-15' },
    },
  ];

  const colaActual = ['2', '1', '3']; // Orden de entrada en cola

  console.log('\n📊 Entrada:');
  console.log(`  - Circuitos totales: ${circuitos.length} (todos apagados)`);
  console.log(`  - Cola actual: [${colaActual.join(', ')}]`);
  console.log(`  - Déficit: 0 MW (queremos encender)`);

  const resultado = RotacionAlgoritmo.ejecutar(circuitos, 0, false, colaActual);

  console.log('\n🟢 Resultado:');
  console.log(`  Encendidos (FIFO): [${resultado.encendidos.join(', ')}]`);
  console.log(`  Nueva cola: [${resultado.cola.join(', ')}]`);

  console.log('\n✅ Validación FIFO:');
  console.log(`  Esperado: 2, 1, 3 (orden de cola)`);
  console.log(`  Actual: ${resultado.encendidos.join(', ')}`);

  return resultado;
};

// ============================================================================
// EJEMPLO 3: Ciclo Completo - Apagar Y Encender
// ============================================================================
export const EJEMPLO_3_CICLO_COMPLETO = () => {
  console.log('\n🔴🟢 EJEMPLO 3: Ciclo Completo - Apagar Y Encender');
  console.log('='.repeat(60));

  const ahora = new Date();
  const circuitos: Circuito[] = [
    // Encendidos - candidatos para apagar
    {
      idCircuitoP: 1,
      idProv: 'VIL',
      Circuito33: 'C33-V001',
      Bloque: 1,
      CircuitoP: 'CIRCUITO-VILLA-1',
      Clientes: 8000,
      ZonaAfectada: 'Villa Clara Centro',
      Apagable: true,
      estado: 'encendido',
      protegido: false,
      ultimoCambioEstado: new Date(ahora.getTime() - 180 * 60 * 1000), // 3 horas
      consumo: { mw: 60, historico: Array(24).fill(60), fechaReferencia: '2024-01-15' },
    },
    // Apagados - candidatos para encender
    {
      idCircuitoP: 2,
      idProv: 'VIL',
      Circuito33: 'C33-V002',
      Bloque: 2,
      CircuitoP: 'CIRCUITO-VILLA-2',
      Clientes: 5000,
      ZonaAfectada: 'Villa Clara Oeste',
      Apagable: true,
      estado: 'apagado',
      protegido: false,
      ultimoCambioEstado: new Date(ahora.getTime() - 240 * 60 * 1000), // 4 horas
      consumo: { mw: 50, historico: Array(24).fill(50), fechaReferencia: '2024-01-15' },
    },
    {
      idCircuitoP: 3,
      idProv: 'VIL',
      Circuito33: 'C33-V003',
      Bloque: 3,
      CircuitoP: 'CIRCUITO-VILLA-3',
      Clientes: 4000,
      ZonaAfectada: 'Villa Clara Este',
      Apagable: true,
      estado: 'apagado',
      protegido: false,
      ultimoCambioEstado: new Date(ahora.getTime() - 120 * 60 * 1000), // 2 horas
      consumo: { mw: 40, historico: Array(24).fill(40), fechaReferencia: '2024-01-15' },
    },
  ];

  const colaActual = ['3', '2']; // Solo 2 habían estado apagados
  const deficitX = 40; // Necesitamos 40 MW

  console.log('\n📊 Entrada:');
  console.log(`  - Circuitos: ${circuitos.length} (1 encendido, 2 apagados)`);
  console.log(`  - Cola actual: [${colaActual.join(', ')}]`);
  console.log(`  - Déficit: ${deficitX} MW`);

  const resultado = RotacionAlgoritmo.ejecutar(circuitos, deficitX, false, colaActual);

  console.log('\n🟢 Resultado:');
  console.log(`  Apagar: [${resultado.cola.filter((id) => !colaActual.includes(id)).join(', ')}]`);
  console.log(`  Encender: [${resultado.encendidos.join(', ')}]`);
  console.log(`  Nueva cola: [${resultado.cola.join(', ')}]`);

  console.log('\n✅ Análisis:');
  const nuevosApagados = resultado.cola.filter((id) => !colaActual.includes(id));
  if (nuevosApagados.length > 0) {
    console.log(`  Apagados nuevos: CIRCUITO-${nuevosApagados.join(', CIRCUITO-')}`);
  }
  if (resultado.encendidos.length > 0) {
    console.log(`  Encendidos: CIRCUITO-${resultado.encendidos.join(', CIRCUITO-')}`);
  }

  return resultado;
};

// ============================================================================
// EJEMPLO 4: Con Circuitos Protegidos
// ============================================================================
export const EJEMPLO_4_CON_PROTEGIDOS = () => {
  console.log('\n🛡️ EJEMPLO 4: Con Circuitos Protegidos');
  console.log('='.repeat(60));

  const ahora = new Date();
  const circuitos: Circuito[] = [
    {
      idCircuitoP: 1,
      idProv: 'CIE',
      Circuito33: 'C33-C001',
      Bloque: 1,
      CircuitoP: 'CIRCUITO-CIENFUEGOS-1',
      Clientes: 10000,
      ZonaAfectada: 'Cienfuegos Centro',
      Apagable: true,
      estado: 'encendido',
      protegido: true, // ⚠️ PROTEGIDO
      ultimoCambioEstado: new Date(ahora.getTime() - 240 * 60 * 1000),
      consumo: { mw: 80, historico: Array(24).fill(80), fechaReferencia: '2024-01-15' },
    },
    {
      idCircuitoP: 2,
      idProv: 'CIE',
      Circuito33: 'C33-C002',
      Bloque: 2,
      CircuitoP: 'CIRCUITO-CIENFUEGOS-2',
      Clientes: 6000,
      ZonaAfectada: 'Cienfuegos Suburbios',
      Apagable: true,
      estado: 'encendido',
      protegido: false,
      ultimoCambioEstado: new Date(ahora.getTime() - 120 * 60 * 1000),
      consumo: { mw: 50, historico: Array(24).fill(50), fechaReferencia: '2024-01-15' },
    },
    {
      idCircuitoP: 3,
      idProv: 'CIE',
      Circuito33: 'C33-C003',
      Bloque: 3,
      CircuitoP: 'CIRCUITO-CIENFUEGOS-3',
      Clientes: 4000,
      ZonaAfectada: 'Cienfuegos Centro',
      Apagable: true,
      estado: 'encendido',
      protegido: true, // ⚠️ PROTEGIDO
      ultimoCambioEstado: new Date(ahora.getTime() - 90 * 60 * 1000),
      consumo: { mw: 60, historico: Array(24).fill(60), fechaReferencia: '2024-01-15' },
    },
  ];

  console.log('\n📊 Entrada:');
  console.log(`  - Circuitos totales: ${circuitos.length}`);
  console.log(`  - Protegidos: ${circuitos.filter((c) => c.protegido).length}`);
  console.log(`  - Disponibles: ${circuitos.filter((c) => !c.protegido).length}`);
  console.log(`  - Déficit: 50 MW`);

  // Filtrar protegidos (como haría el servicio)
  const circuitosDisponibles = circuitos.filter((c) => !c.protegido);

  const resultado = RotacionAlgoritmo.ejecutar(circuitosDisponibles, 50);

  console.log('\n🟢 Resultado:');
  console.log(`  Apagados: [${resultado.cola.join(', ')}]`);
  console.log(`  Encendidos: [${resultado.encendidos.join(', ')}]`);

  console.log('\n✅ Validación:');
  const protegidosEnResultado = resultado.cola.filter(
    (id) => circuitos.find((c) => c.idCircuitoP.toString() === id)?.protegido,
  );
  console.log(`  Protegidos en resultado: ${protegidosEnResultado.length === 0 ? 'Ninguno ✓' : 'ERROR'}`);

  return resultado;
};

// ============================================================================
// EJEMPLO 5: Caso Edge - Todos Protegidos
// ============================================================================
export const EJEMPLO_5_TODOS_PROTEGIDOS = () => {
  console.log('\n⚠️ EJEMPLO 5: Caso Edge - Todos los circuitos protegidos');
  console.log('='.repeat(60));

  const circuitos: Circuito[] = [
    {
      idCircuitoP: 1,
      idProv: 'MAT',
      Circuito33: 'C33-M001',
      Bloque: 1,
      CircuitoP: 'CIRCUITO-MATANZAS-1',
      Clientes: 5000,
      ZonaAfectada: 'Matanzas',
      Apagable: true,
      estado: 'encendido',
      protegido: true,
      ultimoCambioEstado: new Date(),
      consumo: { mw: 50, historico: Array(24).fill(50), fechaReferencia: '2024-01-15' },
    },
  ];

  console.log('\n📊 Entrada:');
  console.log(`  - Circuitos: ${circuitos.length}`);
  console.log(`  - Todos protegidos: SÍ`);

  const circuitosDisponibles = circuitos.filter((c) => !c.protegido);

  try {
    const resultado = RotacionAlgoritmo.ejecutar(circuitosDisponibles, 50);
    console.log('\n🟢 Resultado:', resultado);
  } catch (error) {
    console.log('\n❌ Error (esperado):', error instanceof Error ? error.message : String(error));
    console.log('   → El servicio valida que haya circuitos disponibles antes de procesar');
  }
};

// ============================================================================
// Ejecutar todos los ejemplos
// ============================================================================
export const ejecutarTodosEjemplos = () => {
  console.log('\n\n');
  console.log('█'.repeat(70));
  console.log('  EJEMPLOS DE USO - ALGORITMO DE ROTACIÓN DE ENERGÍA');
  console.log('█'.repeat(70));

  EJEMPLO_1_DEFICIT_SIMPLE();
  EJEMPLO_2_FIFO_ENCENDIDO();
  EJEMPLO_3_CICLO_COMPLETO();
  EJEMPLO_4_CON_PROTEGIDOS();
  EJEMPLO_5_TODOS_PROTEGIDOS();

  console.log('\n\n');
  console.log('█'.repeat(70));
  console.log('  FIN DE EJEMPLOS');
  console.log('█'.repeat(70));
  console.log('\n');
};
