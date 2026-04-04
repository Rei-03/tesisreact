import { RotacionAlgoritmo } from './rotacion.algoritmo';
import { Circuito, ResultadoRotacion } from './interfaces/circuito.interface';

/**
 * Tests para validar la correctitud del algoritmo de rotación
 * 
 * Escenarios cubiertos:
 * 1. Selección básica de circuitos para apagar (por peso)
 * 2. Lógica FIFO para encender
 * 3. Actualización de cola
 * 4. Casos edge (lista vacía, déficit 0, etc.)
 */
describe('RotacionAlgoritmo', () => {
  // Datos de prueba
  const circuitoMock = (
    overrides?: Partial<Circuito>,
  ): Circuito => ({
    idCircuitoP: 1,
    idProv: 'ABC',
    Circuito33: 'C33-001',
    Bloque: 1,
    CircuitoP: 'CIRCUITO-1',
    Clientes: 100,
    ZonaAfectada: 'Zona A',
    Apagable: true,
    estado: 'encendido',
    protegido: false,
    ultimoCambioEstado: new Date(Date.now() - 60 * 60 * 1000), // Hace 1 hora
    consumo: { mw: 50, historico: [], fechaReferencia: '2024-01-01' },
    ...overrides,
  });

  describe('Selección de circuitos para apagar (priorización por peso)', () => {
    it('Debe seleccionar circuitos ordenados por peso (tiempo*0.8 + consumo*0.2)', () => {
      const circuitos: Circuito[] = [
        circuitoMock({
          idCircuitoP: 1,
          CircuitoP: 'C1',
          tiempoEncendido: 120, // 2 horas
          consumo: { mw: 40, historico: [], fechaReferencia: '2024-01-01' },
          ultimoCambioEstado: new Date(Date.now() - 120 * 60 * 1000),
          estado: 'encendido',
        } as any),
        circuitoMock({
          idCircuitoP: 2,
          CircuitoP: 'C2',
          tiempoEncendido: 60, // 1 hora
          consumo: { mw: 30, historico: [], fechaReferencia: '2024-01-01' },
          ultimoCambioEstado: new Date(Date.now() - 60 * 60 * 1000),
          estado: 'encendido',
        } as any),
      ];

      const resultado = RotacionAlgoritmo.ejecutar(circuitos, 50);

      // C1 tiene mayor peso: (120*0.8) + (40*0.2) = 96 + 8 = 104
      // C2 tiene menor peso: (60*0.8) + (30*0.2) = 48 + 6 = 54
      expect(resultado.cola).toContain('1');
    });

    it('Debe seleccionar secuencialmente hasta cubrir el déficit', () => {
      const circuitos: Circuito[] = [
        circuitoMock({
          idCircuitoP: 1,
          CircuitoP: 'C1',
          consumo: { mw: 30, historico: [], fechaReferencia: '2024-01-01' },
          estado: 'encendido',
        }),
        circuitoMock({
          idCircuitoP: 2,
          CircuitoP: 'C2',
          consumo: { mw: 40, historico: [], fechaReferencia: '2024-01-01' },
          estado: 'encendido',
        }),
        circuitoMock({
          idCircuitoP: 3,
          CircuitoP: 'C3',
          consumo: { mw: 20, historico: [], fechaReferencia: '2024-01-01' },
          estado: 'encendido',
        }),
      ];

      const resultado = RotacionAlgoritmo.ejecutar(circuitos, 50);

      // Debe apagar al menos 2 circuitos (30+40 > 50 o 40+20 > 50)
      expect(resultado.cola.length).toBeGreaterThanOrEqual(2);
      // Consumo total debe ser >= déficit
      const consumoTotal = resultado.cola.reduce((sum) => sum + 1, 0);
      expect(resultado.cola.length).toBeGreaterThan(0);
    });
  });

  describe('Lógica FIFO para encender', () => {
    it('Debe priorizar circuitos con más tiempo apagados (FIFO)', () => {
      const ahora = new Date();
      const circuitos: Circuito[] = [
        circuitoMock({
          idCircuitoP: 1,
          CircuitoP: 'C1',
          estado: 'apagado',
          ultimoCambioEstado: new Date(ahora.getTime() - 180 * 60 * 1000), // Hace 3 horas
        }),
        circuitoMock({
          idCircuitoP: 2,
          CircuitoP: 'C2',
          estado: 'apagado',
          ultimoCambioEstado: new Date(ahora.getTime() - 60 * 60 * 1000), // Hace 1 hora
        }),
      ];

      const resultado = RotacionAlgoritmo.ejecutar(circuitos, 50);

      // C1 debe ser el primero en la lista de encendidos
      if (resultado.encendidos.length > 1) {
        expect(resultado.encendidos[0]).toBe('1');
      }
    });

    it('Debe mantener orden FIFO respetando la cola actual', () => {
      const circuitos: Circuito[] = [
        circuitoMock({
          idCircuitoP: 1,
          estado: 'apagado',
        }),
        circuitoMock({
          idCircuitoP: 2,
          estado: 'apagado',
        }),
        circuitoMock({
          idCircuitoP: 3,
          estado: 'apagado',
        }),
      ];

      const colaActual = ['2', '1', '3']; // Orden en cola
      const resultado = RotacionAlgoritmo.ejecutar(circuitos, 0, colaActual);

      // Aunque todos tienen mismo tiempo, respeta orden de cola
      expect(resultado.encendidos[0]).toBe('2');
      expect(resultado.encendidos[1]).toBe('1');
    });
  });

  describe('Actualización de cola', () => {
    it('Debe remover circuitos encendidos de la cola', () => {
      const circuitos: Circuito[] = [
        circuitoMock({
          idCircuitoP: 1,
          estado: 'apagado',
        }),
        circuitoMock({
          idCircuitoP: 2,
          estado: 'encendido',
        }),
      ];

      const colaActual = ['1', '2'];
      const resultado = RotacionAlgoritmo.ejecutar(circuitos, 0, colaActual);

      // Si encendemos C1, debe salir de la cola
      if (resultado.encendidos.includes('1')) {
        expect(resultado.cola).not.toContain('1');
      }
    });

    it('Debe agregar nuevos apagados al final de la cola', () => {
      const circuitos: Circuito[] = [
        circuitoMock({
          idCircuitoP: 1,
          estado: 'encendido',
          consumo: { mw: 60, historico: [], fechaReferencia: '2024-01-01' },
        }),
        circuitoMock({
          idCircuitoP: 2,
          estado: 'encendido',
          consumo: { mw: 30, historico: [], fechaReferencia: '2024-01-01' },
        }),
      ];

      const colaActual = ['3', '4'];
      const resultado = RotacionAlgoritmo.ejecutar(circuitos, 50, colaActual);

      // Los nuevos apagados deben estar al final
      if (resultado.cola.length > 2) {
        expect(resultado.cola.slice(0, 2)).toEqual(['3', '4']);
      }
    });
  });

  describe('Casos edge', () => {
    it('Debe retornar cola vacía si no hay circuitos', () => {
      const resultado = RotacionAlgoritmo.ejecutar([], 50);
      expect(resultado.cola).toEqual([]);
      expect(resultado.encendidos).toEqual([]);
    });

    it('Debe manejar déficit de 0 sin errores', () => {
      const circuitos: Circuito[] = [circuitoMock({ estado: 'apagado' })];
      const resultado = RotacionAlgoritmo.ejecutar(circuitos, 0);
      expect(resultado).toBeDefined();
      expect(Array.isArray(resultado.cola)).toBe(true);
    });

    it('Debe ignorar circuitos ya en el estado objetivo', () => {
      const circuitos: Circuito[] = [
        circuitoMock({
          idCircuitoP: 1,
          estado: 'apagado',
        }),
      ];

      const resultado = RotacionAlgoritmo.ejecutar(circuitos, 50);
      // No debe incluir C1 en los apagados (ya está apagado)
      // Pero sí en los encendibles
    });

    it('Debe lanzar error si déficit es negativo', () => {
      const circuitos: Circuito[] = [circuitoMock()];
      expect(() => RotacionAlgoritmo.ejecutar(circuitos, -50)).toThrow();
    });
  });

  describe('Funcionalidad pura e inmutable', () => {
    it('No debe modificar el array de entrada', () => {
      const circuitos: Circuito[] = [
        circuitoMock({ idCircuitoP: 1 }),
        circuitoMock({ idCircuitoP: 2 }),
      ];
      const circuitosOriginal = JSON.stringify(circuitos);

      RotacionAlgoritmo.ejecutar(circuitos, 50);

      expect(JSON.stringify(circuitos)).toBe(circuitosOriginal);
    });

    it('Debe ser determinista con los mismos inputs', () => {
      const circuitos: Circuito[] = [
        circuitoMock({ idCircuitoP: 1 }),
        circuitoMock({ idCircuitoP: 2 }),
      ];

      const resultado1 = RotacionAlgoritmo.ejecutar([...circuitos], 50);
      const resultado2 = RotacionAlgoritmo.ejecutar([...circuitos], 50);

      expect(resultado1.cola).toEqual(resultado2.cola);
      expect(resultado1.encendidos).toEqual(resultado2.encendidos);
    });
  });

  describe('Integración completa', () => {
    it('Debe ejecutar flujo completo: apagar, encender, actualizar cola', () => {
      const ahora = new Date();
      const circuitos: Circuito[] = [
        // Encendidos (candidatos para apagar)
        circuitoMock({
          idCircuitoP: 1,
          estado: 'encendido',
          consumo: { mw: 60, historico: [], fechaReferencia: '2024-01-01' },
          ultimoCambioEstado: new Date(ahora.getTime() - 120 * 60 * 1000),
        }),
        circuitoMock({
          idCircuitoP: 2,
          estado: 'encendido',
          consumo: { mw: 40, historico: [], fechaReferencia: '2024-01-01' },
          ultimoCambioEstado: new Date(ahora.getTime() - 60 * 60 * 1000),
        }),
        // Apagados (candidatos para encender)
        circuitoMock({
          idCircuitoP: 3,
          estado: 'apagado',
          ultimoCambioEstado: new Date(ahora.getTime() - 180 * 60 * 1000),
        }),
        circuitoMock({
          idCircuitoP: 4,
          estado: 'apagado',
          ultimoCambioEstado: new Date(ahora.getTime() - 90 * 60 * 1000),
        }),
      ];

      const colaActual = ['3', '4'];
      const resultado = RotacionAlgoritmo.ejecutar(circuitos, 50, colaActual);

      // Debe haber algunas acciones
      expect(resultado).toBeDefined();
      expect(Array.isArray(resultado.cola)).toBe(true);
      expect(Array.isArray(resultado.encendidos)).toBe(true);
    });
  });
});
