import { Test, TestingModule } from '@nestjs/testing';
import { CircuitosService } from './circuitos.service';
import { CircuitosRepository } from './circuitos.repository';

describe('CircuitosService', () => {
  let service: CircuitosService;
  let mockCircuitosRepository: {
    findWithFilters: jest.Mock;
    findWithConsumptionByDate: jest.Mock;
    findWithConsumptionAndLastApagon: jest.Mock;
  };

  const mockCircuitos = [
    {
      idCircuitoP: 1,
      CircuitoP: 'Circuito A',
      bloque: '1',
      mw: 50,
      apagable: true,
      consumo: [{ fecha: '2025-01-15', valor: 45.5 }],
    },
    {
      idCircuitoP: 2,
      CircuitoP: 'Circuito B',
      bloque: '2',
      mw: 30,
      apagable: false,
      consumo: [{ fecha: '2025-01-15', valor: 25.3 }],
    },
    {
      idCircuitoP: 3,
      CircuitoP: 'Circuito C',
      bloque: '1',
      mw: 60,
      apagable: true,
      consumo: [{ fecha: '2025-01-15', valor: 55.8 }],
    },
  ];

  beforeEach(async () => {
    mockCircuitosRepository = {
      findWithFilters: jest.fn(),
      findWithConsumptionByDate: jest.fn(),
      findWithConsumptionAndLastApagon: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CircuitosService,
        {
          provide: CircuitosRepository,
          useValue: mockCircuitosRepository,
        },
      ],
    }).compile();

    service = module.get<CircuitosService>(CircuitosService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('debe obtener todos los circuitos con paginación', async () => {
      const take = 20;
      const skip = 0;
      const total = 3;

      mockCircuitosRepository.findWithFilters.mockResolvedValue({
        records: mockCircuitos,
        total,
      });

      const result = await service.findAll(take, skip);

      expect(result.results).toHaveLength(3);
      expect(result.meta.page).toBe(1);
      expect(result.meta.total).toBe(3);
      expect(result.meta.totalPages).toBe(1);
      expect(result.meta.pageSize).toBe(20);
      expect(mockCircuitosRepository.findWithFilters).toHaveBeenCalledWith(
        take,
        skip,
        undefined,
        undefined,
      );
    });

    it('debe filtrar circuitos apagables', async () => {
      const take = 20;
      const skip = 0;
      const apagableCircuitos = mockCircuitos.filter((c) => c.apagable);

      mockCircuitosRepository.findWithFilters.mockResolvedValue({
        records: apagableCircuitos,
        total: apagableCircuitos.length,
      });

      const result = await service.findAll(take, skip, true);

      expect(result.results).toHaveLength(2);
      expect(mockCircuitosRepository.findWithFilters).toHaveBeenCalledWith(
        take,
        skip,
        true,
        undefined,
      );
    });

    it('debe filtrar circuitos por bloque', async () => {
      const take = 20;
      const skip = 0;
      const bloqueCircuitos = mockCircuitos.filter((c) => c.bloque === '1');

      mockCircuitosRepository.findWithFilters.mockResolvedValue({
        records: bloqueCircuitos,
        total: bloqueCircuitos.length,
      });

      const result = await service.findAll(take, skip, undefined, '1');

      expect(result.results).toHaveLength(2);
      expect(mockCircuitosRepository.findWithFilters).toHaveBeenCalledWith(
        take,
        skip,
        undefined,
        '1',
      );
    });

    it('debe manejar múltiples páginas correctamente', async () => {
      const take = 2;
      const skip = 2;
      const total = 3;

      mockCircuitosRepository.findWithFilters.mockResolvedValue({
        records: [mockCircuitos[2]],
        total,
      });

      const result = await service.findAll(take, skip);

      expect(result.meta.page).toBe(2);
      expect(result.meta.totalPages).toBe(2);
    });
  });

  describe('findAllWithConsumption', () => {
    it('debe obtener circuitos con consumo por fecha', async () => {
      const payload = {
        fecha: '2025-01-15',
        take: 20,
        skip: 0,
      };

      mockCircuitosRepository.findWithConsumptionByDate.mockResolvedValue(
        mockCircuitos,
      );
      const result = await service.findAllWithConsumption(payload);

      expect(result).toHaveLength(3);
      expect(
        mockCircuitosRepository.findWithConsumptionByDate,
      ).toHaveBeenCalledWith(payload.fecha, payload.take, payload.skip);
    });

    it('debe usar fecha actual si no se proporciona', async () => {
      const payload = {
        take: 20,
        skip: 0,
      };

      mockCircuitosRepository.findWithConsumptionByDate.mockResolvedValue({
        records: mockCircuitos,
        meta: { total: mockCircuitos.length },
      });

      await service.findAllWithConsumption(payload);

      const callArgs = mockCircuitosRepository.findWithConsumptionByDate.mock
        .calls[0] as any[];
      expect(callArgs[0]).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(
        mockCircuitosRepository.findWithConsumptionByDate,
      ).toHaveBeenCalledWith(callArgs[0], 20, 0);
    });
  });

  describe('findWithConsumptionAndApagones', () => {
    it('debe obtener circuitos con consumo y últimos apagones', async () => {
      const payload = {
        fecha: '2025-01-15',
        take: 20,
        skip: 0,
      };

      const circuitosConApagones = mockCircuitos.map((c) => ({
        ...c,
        ultimoApagon: '2025-01-14',
      }));

      mockCircuitosRepository.findWithConsumptionAndLastApagon.mockResolvedValue(
        circuitosConApagones,
      );

      const result = await service.findWithConsumptionAndApagones(payload);

      expect(result.results).toHaveLength(3);
      expect(result.results[0].ultimoApagon).toBe('2025-01-14');
      expect(result.meta.total).toBe(3);
    });

    it('debe manejar resultado vacío correctamente', async () => {
      const payload = {
        fecha: '2025-01-15',
        take: 20,
        skip: 0,
      };

      mockCircuitosRepository.findWithConsumptionAndLastApagon.mockResolvedValue(
        [],
      );

      const result = await service.findWithConsumptionAndApagones(payload);

      expect(result.results).toHaveLength(0);
      expect(result.meta.total).toBe(0);
      expect(result.meta.totalPages).toBe(0);
    });

    it('debe calcular correctly la paginación', async () => {
      const payload = {
        fecha: '2025-01-15',
        take: 2,
        skip: 2,
      };

      mockCircuitosRepository.findWithConsumptionAndLastApagon.mockResolvedValue(
        mockCircuitos,
      );

      const result = await service.findWithConsumptionAndApagones(payload);

      expect(result.meta.page).toBe(2);
      expect(result.meta.totalPages).toBe(2);
    });
  });

  describe('findOne, update, create, remove', () => {
    it('debe retornar mensaje para findOne', () => {
      const result = service.findOne(1);
      expect(result).toContain('returns a #1 circuito');
    });

    it('debe retornar mensaje para create', () => {
      const result = service.create({});
      expect(result).toContain('adds a new circuito');
    });

    it('debe retornar mensaje para update', () => {
      const result = service.update(1, {});
      expect(result).toContain('updates a #1 circuito');
    });

    it('debe retornar mensaje para remove', () => {
      const result = service.remove(1);
      expect(result).toContain('removes a #1 circuito');
    });
  });
});
