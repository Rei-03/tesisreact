import {
  filtrarCircuitosApagables,
  ordenarPorNombre,
  filtrarPorBloque,
  calcularTotalClientes,
  calcularMWPorBloque,
  obtenerBloques,
  Circuito,
  Apertura,
} from './circuitUtils';

describe('circuitUtils', () => {
  const mockCircuitos: Circuito[] = [
    {
      idCircuitoP: 1,
      CircuitoP: 'Circuito Zona A',
      bloque: '1',
      mw: 50,
      apagable: true,
      clientes: 120,
    },
    {
      idCircuitoP: 2,
      CircuitoP: 'Circuito Zona B',
      bloque: '2',
      mw: 30,
      apagable: false,
      clientes: 80,
    },
    {
      idCircuitoP: 3,
      CircuitoP: 'Circuito Zona C',
      bloque: '1',
      mw: 60,
      Apagable: true,
      Clientes: 150,
    },
    {
      idCircuitoP: 4,
      CircuitoP: 'Circuito Zona D',
      bloque: '3',
      mw: 40,
      apagable: true,
      clientes: 100,
    },
  ];

  describe('filtrarCircuitosApagables', () => {
    it('debe filtrar solo circuitos apagables', () => {
      const result = filtrarCircuitosApagables(mockCircuitos);

      expect(result).toHaveLength(3);
      expect(result.every((c) => c.apagable === true || c.Apagable === true)).toBe(true);
    });

    it('debe retornar array vacío si no hay apagables', () => {
      const circuitos: Circuito[] = [
        { idCircuitoP: 1, CircuitoP: 'A', apagable: false },
        { idCircuitoP: 2, CircuitoP: 'B', apagable: false },
      ];

      const result = filtrarCircuitosApagables(circuitos);
      expect(result).toHaveLength(0);
    });

    it('debe retornar array vacío si input no es array', () => {
      const result = filtrarCircuitosApagables(null as any);
      expect(result).toEqual([]);
    });

    it('debe retornar array vacío si input es undefined', () => {
      const result = filtrarCircuitosApagables(undefined as any);
      expect(result).toEqual([]);
    });

    it('debe soportar propiedad Apagable en mayúscula', () => {
      const circuitos: Circuito[] = [
        { idCircuitoP: 1, CircuitoP: 'A', Apagable: true },
        { idCircuitoP: 2, CircuitoP: 'B', apagable: false },
      ];

      const result = filtrarCircuitosApagables(circuitos);
      expect(result).toHaveLength(1);
      expect(result[0].idCircuitoP).toBe(1);
    });
  });

  describe('ordenarPorNombre', () => {
    it('debe ordenar circuitos alfabéticamente por nombre', () => {
      const result = ordenarPorNombre(mockCircuitos);

      expect(result[0].CircuitoP).toBe('Circuito Zona A');
      expect(result[1].CircuitoP).toBe('Circuito Zona B');
      expect(result[2].CircuitoP).toBe('Circuito Zona C');
      expect(result[3].CircuitoP).toBe('Circuito Zona D');
    });

    it('no debe modificar el array original', () => {
      const original = JSON.parse(JSON.stringify(mockCircuitos));
      ordenarPorNombre(mockCircuitos);

      expect(mockCircuitos).toEqual(original);
    });

    it('debe retornar array vacío si input no es array', () => {
      const result = ordenarPorNombre(null as any);
      expect(result).toEqual([]);
    });

    it('debe manejar circuitos sin nombre', () => {
      const circuitos: Circuito[] = [
        { idCircuitoP: 1, CircuitoP: 'B' },
        { idCircuitoP: 2, CircuitoP: '' },
        { idCircuitoP: 3, CircuitoP: 'A' },
      ];

      const result = ordenarPorNombre(circuitos);
      expect(result[2].CircuitoP).toBe('B');
    });
  });

  describe('filtrarPorBloque', () => {
    it('debe filtrar circuitos por bloque específico', () => {
      const result = filtrarPorBloque(mockCircuitos, '1');

      expect(result).toHaveLength(2);
      expect(result.every((c) => String(c.bloque) === '1')).toBe(true);
    });

    it('debe retornar todos los circuitos si bloque es null', () => {
      const result = filtrarPorBloque(mockCircuitos, null);

      expect(result).toEqual(mockCircuitos);
    });

    it('debe retornar todos los circuitos si bloque es undefined', () => {
      const result = filtrarPorBloque(mockCircuitos, undefined);

      expect(result).toEqual(mockCircuitos);
    });

    it('debe retornar todos los circuitos si bloque es string vacío', () => {
      const result = filtrarPorBloque(mockCircuitos, '');

      expect(result).toEqual(mockCircuitos);
    });

    it('debe retornar array vacío si no hay coincidencias', () => {
      const result = filtrarPorBloque(mockCircuitos, '99');

      expect(result).toHaveLength(0);
    });

    it('debe retornar array vacío si input no es array', () => {
      const result = filtrarPorBloque(null as any, '1');
      expect(result).toEqual([]);
    });

    it('debe manejar números como bloque', () => {
      const result = filtrarPorBloque(mockCircuitos, 1);

      expect(result).toHaveLength(2);
    });

    it('debe soportar propiedades alternativas de bloque', () => {
      const circuitos: Circuito[] = [
        { idCircuitoP: 1, CircuitoP: 'A', Bloque: '1' },
        { idCircuitoP: 2, CircuitoP: 'B', bloqueId: '1' },
        { idCircuitoP: 3, CircuitoP: 'C', bloque: '2' },
      ];

      const result = filtrarPorBloque(circuitos, '1');
      expect(result).toHaveLength(2);
    });
  });

  describe('calcularTotalClientes', () => {
    it('debe calcular el total de clientes correctamente', () => {
      const result = calcularTotalClientes(mockCircuitos);

      const expected = 120 + 80 + 150 + 100;
      expect(result).toBe(expected);
    });

    it('debe retornar 0 si no hay circuitos', () => {
      const result = calcularTotalClientes([]);
      expect(result).toBe(0);
    });

    it('debe retornar 0 si input no es array', () => {
      const result = calcularTotalClientes(null as any);
      expect(result).toBe(0);
    });

    it('debe manejar valores inválidos de clientes', () => {
      const circuitos: Circuito[] = [
        { idCircuitoP: 1, CircuitoP: 'A', clientes: 100 },
        { idCircuitoP: 2, CircuitoP: 'B', clientes: null as any },
        { idCircuitoP: 3, CircuitoP: 'C', clientes: 'invalid' as any },
      ];

      const result = calcularTotalClientes(circuitos);
      expect(result).toBe(100);
    });

    it('debe soportar propiedades en mayúscula Clientes', () => {
      const circuitos: Circuito[] = [
        { idCircuitoP: 1, CircuitoP: 'A', Clientes: 100 },
        { idCircuitoP: 2, CircuitoP: 'B', Clientes: 200 },
      ];

      const result = calcularTotalClientes(circuitos);
      expect(result).toBe(300);
    });
  });

  describe('calcularMWPorBloque', () => {
    it('debe calcular MW por bloque correctamente', () => {
      const aperturas: Apertura[] = [
        { bloque: '1', mw: 50 },
        { bloque: '1', mw: 30 },
        { bloque: '2', mw: 60 },
        { bloque: '2', mw: 20 },
      ];

      const result = calcularMWPorBloque(aperturas);

      expect(result['1']).toBe(80);
      expect(result['2']).toBe(80);
    });

    it('debe retornar objeto vacío si input no es array', () => {
      const result = calcularMWPorBloque(null as any);
      expect(result).toEqual({});
    });

    it('debe manejar aperturas sin bloque', () => {
      const aperturas: Apertura[] = [
        { mw: 50 },
        { bloque: '1', mw: 30 },
      ];

      const result = calcularMWPorBloque(aperturas);

      expect(result['Sin Bloque']).toBe(50);
      expect(result['1']).toBe(30);
    });

    it('debe manejar MW inválidos', () => {
      const aperturas: Apertura[] = [
        { bloque: '1', mw: 50 },
        { bloque: '1', mw: null as any },
        { bloque: '2', mw: 0 },
      ];

      const result = calcularMWPorBloque(aperturas);

      expect(result['1']).toBe(50);
      expect(result['2']).toBe(0);
    });

    it('debe retornar objeto vacío para array vacío', () => {
      const result = calcularMWPorBloque([]);
      expect(result).toEqual({});
    });
  });

  describe('obtenerBloques', () => {
    it('debe obtener bloques únicos y ordenados', () => {
      const result = obtenerBloques(mockCircuitos);

      expect(result).toContain('1');
      expect(result).toContain('2');
      expect(result).toContain('3');
      expect(result).toHaveLength(3);
    });

    it('debe retornar array vacío si input no es array', () => {
      const result = obtenerBloques(null as any);
      expect(result).toEqual([]);
    });

    it('debe retornar array vacío si circuitos no tienen bloque', () => {
      const circuitos: Circuito[] = [
        { idCircuitoP: 1, CircuitoP: 'A' },
        { idCircuitoP: 2, CircuitoP: 'B' },
      ];

      const result = obtenerBloques(circuitos);
      expect(result).toEqual([]);
    });

    it('debe soportar propiedades alternativas de bloque', () => {
      const circuitos: Circuito[] = [
        { idCircuitoP: 1, CircuitoP: 'A', Bloque: '1' },
        { idCircuitoP: 2, CircuitoP: 'B', bloque: '2' },
        { idCircuitoP: 3, CircuitoP: 'C', Bloque: '3' },
      ];

      const result = obtenerBloques(circuitos);
      expect(result).toHaveLength(3);
    });

    it('debe filtrar bloques vacíos', () => {
      const circuitos: Circuito[] = [
        { idCircuitoP: 1, CircuitoP: 'A', bloque: '1' },
        { idCircuitoP: 2, CircuitoP: 'B', bloque: '' },
        { idCircuitoP: 3, CircuitoP: 'C', bloque: null as any },
      ];

      const result = obtenerBloques(circuitos);
      expect(result).toEqual(['1']);
    });

    it('debe ordenar bloques numéricamente cuando sea posible', () => {
      const circuitos: Circuito[] = [
        { idCircuitoP: 1, CircuitoP: 'A', bloque: '10' },
        { idCircuitoP: 2, CircuitoP: 'B', bloque: '2' },
        { idCircuitoP: 3, CircuitoP: 'C', bloque: '1' },
      ];

      const result = obtenerBloques(circuitos);
      // Debe ordenar numéricamente: 1, 2, 10
      expect(result[0]).toBe('1');
      expect(result[1]).toBe('2');
      expect(result[2]).toBe('10');
    });
  });
});
