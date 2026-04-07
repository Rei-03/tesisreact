import { Test, TestingModule } from '@nestjs/testing';
import { ApagonesRepository } from './apagones.repository';
import { ApagonesService } from './apagones.service';
import { ApagonesController } from './apagones.controller';

describe('Apagones Module', () => {
  let repository: ApagonesRepository;
  let service: ApagonesService;
  let controller: ApagonesController;
  let mockDb: any;

  beforeEach(async () => {
    // Mock de la conexión a base de datos
    mockDb = {
      request: jest.fn().mockReturnThis(),
      input: jest.fn().mockReturnThis(),
      query: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApagonesRepository,
        ApagonesService,
        {
          provide: 'DATABASE_CONNECTION',
          useValue: mockDb,
        },
      ],
      controllers: [ApagonesController],
    }).compile();

    repository = module.get<ApagonesRepository>(ApagonesRepository);
    service = module.get<ApagonesService>(ApagonesService);
    controller = module.get<ApagonesController>(ApagonesController);
  });

  describe('ApagonesRepository', () => {
    it('should find all apagones', async () => {
      const mockData = [
        {
          idApagon: 1,
          idCircuitoP: 100,
          MWAfectados: 50,
          FechaRetiro: new Date(),
        },
      ];

      mockDb.query.mockResolvedValue({ recordset: mockData });

      const result = await repository.findAll(20, 0);

      expect(result).toEqual(mockData);
      expect(mockDb.request).toHaveBeenCalled();
      expect(mockDb.input).toHaveBeenCalledWith('take', expect.anything(), 20);
      expect(mockDb.input).toHaveBeenCalledWith('skip', expect.anything(), 0);
    });

    it('should find apagon by id', async () => {
      const mockData = {
        idApagon: 123,
        idCircuitoP: 100,
        MWAfectados: 50,
        FechaRetiro: new Date(),
      };

      mockDb.query.mockResolvedValue({ recordset: [mockData] });

      const result = await repository.findById(123);

      expect(result).toEqual(mockData);
      expect(mockDb.input).toHaveBeenCalledWith(
        'idApagon',
        expect.anything(),
        123
      );
    });

    it('should return null if apagon not found', async () => {
      mockDb.query.mockResolvedValue({ recordset: [] });

      const result = await repository.findById(999);

      expect(result).toBeNull();
    });

    it('should find apagones by circuito id', async () => {
      const mockData = [
        {
          idApagon: 1,
          idCircuitoP: 100,
          MWAfectados: 50,
          FechaRetiro: new Date(),
        },
        {
          idApagon: 2,
          idCircuitoP: 100,
          MWAfectados: 75,
          FechaRetiro: new Date(),
        },
      ];

      mockDb.query.mockResolvedValue({ recordset: mockData });

      const result = await repository.findByCircuitoId(100, 20, 0);

      expect(result).toEqual(mockData);
      expect(mockDb.input).toHaveBeenCalledWith(
        'idCircuitoP',
        expect.anything(),
        100
      );
    });

    it('should find last apagon by circuito (optimized query)', async () => {
      const mockData = [
        {
          idApagon: 999,
          idCircuitoP: 100,
          MWAfectados: 50,
          FechaRetiro: new Date('2024-01-15'),
        },
      ];

      mockDb.query.mockResolvedValue({ recordset: mockData });

      const result = await repository.findLastApagonByCircuito(20, 0);

      expect(result).toEqual(mockData);
      expect(result).toHaveLength(1);
      // Verifica que se usó la query optimizada con CTE
      const queryCall = mockDb.query.mock.calls[0][0];
      expect(queryCall).toContain('WITH LastApagones AS');
      expect(queryCall).toContain('MAX(idApagon)');
    });

    it('should find open apagones', async () => {
      const mockData = [
        {
          idApagon: 1,
          idCircuitoP: 100,
          MWAfectados: 50,
          FechaRetiro: new Date(),
          FechaCierre: null, // Abierto
        },
      ];

      mockDb.query.mockResolvedValue({ recordset: mockData });

      const result = await repository.findOpenApagones(20, 0);

      expect(result).toEqual(mockData);
      // Verifica que la query filtre por FechaCierre IS NULL
      const queryCall = mockDb.query.mock.calls[0][0];
      expect(queryCall).toContain('FechaCierre IS NULL');
    });

    it('should find apagones by date range', async () => {
      const mockData = [
        {
          idApagon: 1,
          FechaRetiro: new Date('2024-01-15'),
        },
      ];

      mockDb.query.mockResolvedValue({ recordset: mockData });

      const result = await repository.findByDateRange(
        '2024-01-01',
        '2024-01-31',
        20,
        0
      );

      expect(result).toEqual(mockData);
      expect(mockDb.input).toHaveBeenCalledWith(
        'fechaInicio',
        expect.anything(),
        expect.any(Date)
      );
    });

    it('should get stats by circuito', async () => {
      const mockData = [
        {
          idCircuitoP: 100,
          totalApagones: 5,
          ultimoApagon: 999,
          totalMWAfectados: 250.5,
        },
      ];

      mockDb.query.mockResolvedValue({ recordset: mockData });

      const result = await repository.getApagonesByCircuitoStats();

      expect(result).toEqual(mockData);
      expect(result[0].totalApagones).toBe(5);
      expect(result[0].totalMWAfectados).toBe(250.5);
    });
  });

  describe('ApagonesService', () => {
    it('should call repository.findAll', async () => {
      const spyFindAll = jest.spyOn(repository, 'findAll');
      const mockData = [];

      mockDb.query.mockResolvedValue({ recordset: mockData });

      await service.findAll({ take: 20, skip: 0 });

      expect(spyFindAll).toHaveBeenCalledWith(20, 0);
    });

    it('should call repository.findLastApagonByCircuito', async () => {
      const spyFindLast = jest.spyOn(repository, 'findLastApagonByCircuito');
      const mockData = [];

      mockDb.query.mockResolvedValue({ recordset: mockData });

      await service.findLastApagonByCircuito({ take: 20, skip: 0 });

      expect(spyFindLast).toHaveBeenCalledWith(20, 0);
    });

    it('should handle pagination correctly', async () => {
      const spyFindAll = jest.spyOn(repository, 'findAll');
      mockDb.query.mockResolvedValue({ recordset: [] });

      await service.findAll({ take: 50, skip: 100 });

      expect(spyFindAll).toHaveBeenCalledWith(50, 100);
    });

    it('should apply default pagination', async () => {
      const spyFindAll = jest.spyOn(repository, 'findAll');
      mockDb.query.mockResolvedValue({ recordset: [] });

      await service.findAll({}); // Sin especificar take/skip

      expect(spyFindAll).toHaveBeenCalledWith(20, 0); // Default values
    });
  });

  describe('ApagonesController', () => {
    it('should handle findAll message pattern', async () => {
      const spyService = jest.spyOn(service, 'findAll');
      mockDb.query.mockResolvedValue({ recordset: [] });

      await controller.findAll({ take: 20, skip: 0 });

      expect(spyService).toHaveBeenCalledWith({ take: 20, skip: 0 });
    });

    it('should handle findById message pattern', async () => {
      const spyService = jest.spyOn(service, 'findById');
      mockDb.query.mockResolvedValue({ recordset: [{ idApagon: 1 }] });

      await controller.findById({ idApagon: 1 });

      expect(spyService).toHaveBeenCalledWith(1);
    });

    it('should handle findLastApagonByCircuito message pattern', async () => {
      const spyService = jest.spyOn(service, 'findLastApagonByCircuito');
      mockDb.query.mockResolvedValue({ recordset: [] });

      await controller.findLastApagonByCircuito({ take: 20, skip: 0 });

      expect(spyService).toHaveBeenCalledWith({ take: 20, skip: 0 });
    });

    it('should handle findByCircuitoId with custom pagination', async () => {
      const spyService = jest.spyOn(service, 'findByCircuitoId');
      mockDb.query.mockResolvedValue({ recordset: [] });

      await controller.findByCircuitoId({ idCircuitoP: 100, take: 10, skip: 5 });

      expect(spyService).toHaveBeenCalledWith(100, { take: 10, skip: 5 });
    });

    it('should handle findByDateRange', async () => {
      const spyService = jest.spyOn(service, 'findByDateRange');
      mockDb.query.mockResolvedValue({ recordset: [] });

      const payload = {
        fechaInicio: '2024-01-01',
        fechaFin: '2024-01-31',
        take: 20,
        skip: 0,
      };

      await controller.findByDateRange(payload);

      expect(spyService).toHaveBeenCalledWith(payload);
    });

    it('should handle getStats', async () => {
      const spyService = jest.spyOn(service, 'getApagonesByCircuitoStats');
      mockDb.query.mockResolvedValue({ recordset: [] });

      await controller.getApagonesByCircuitoStats();

      expect(spyService).toHaveBeenCalled();
    });
  });

  describe('Integration Tests', () => {
    it('should retrieve last apagon for each circuito', async () => {
      const mockData = [
        {
          idApagon: 100,
          idCircuitoP: 1,
          MWAfectados: 50,
          FechaRetiro: new Date('2024-01-15'),
        },
        {
          idApagon: 200,
          idCircuitoP: 2,
          MWAfectados: 75,
          FechaRetiro: new Date('2024-01-16'),
        },
      ];

      mockDb.query.mockResolvedValue({ recordset: mockData });

      // Simula flujo completo
      const result = await controller.findLastApagonByCircuito({
        take: 20,
        skip: 0,
      });

      expect(result).toHaveLength(2);
      expect(result[0].idCircuitoP).toBe(1);
      expect(result[1].idCircuitoP).toBe(2);
    });

    it('should filter open apagones correctly', async () => {
      const mockData = [
        {
          idApagon: 1,
          FechaCierre: null, // Abierto
        },
        {
          idApagon: 2,
          FechaCierre: null, // Abierto
        },
      ];

      mockDb.query.mockResolvedValue({ recordset: mockData });

      const result = await controller.findOpenApagones({ take: 20, skip: 0 });

      expect(result).toHaveLength(2);
      result.forEach((item) => {
        expect(item.FechaCierre).toBeNull();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      const error = new Error('Database connection failed');
      mockDb.query.mockRejectedValue(error);

      await expect(repository.findAll(20, 0)).rejects.toThrow(
        'Database connection failed'
      );
    });

    it('should return empty array on empty resultset', async () => {
      mockDb.query.mockResolvedValue({ recordset: [] });

      const result = await repository.findAll(20, 0);

      expect(result).toEqual([]);
      expect(Array.isArray(result)).toBe(true);
    });
  });
});
