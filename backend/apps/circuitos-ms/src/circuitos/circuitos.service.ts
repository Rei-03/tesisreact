import { Injectable } from '@nestjs/common';
import { CreateCircuitoDto } from './dto/create-circuito.dto';
import { UpdateCircuitoDto } from './dto/update-circuito.dto';
import { FindConsumptionByDateDto } from './dto/find-consumption-by-date.dto';
import { CircuitosRepository } from './circuitos.repository';

@Injectable()
export class CircuitosService {
  constructor(private readonly circuitoRepo: CircuitosRepository){}
  create(createCircuitoDto: CreateCircuitoDto) {
    return 'This action adds a new circuito';
  }

  async findAll(take: number = 20, skip: number = 0, apagable?: boolean, bloque?: string) {
    const page = skip / take + 1;
    const { records, total } = await this.circuitoRepo.findWithFilters(take, skip, apagable, bloque);
    const totalPages = Math.ceil(total / take);

    return {
      results: records,
      meta: {
        page: Math.floor(page),
        totalPages,
        total,
        pageSize: take,
      },
    };
  }

  findAllWithConsumption(payload: FindConsumptionByDateDto) {
    const take = payload.take || 20;
    const skip = payload.skip || 0;
    const fecha = payload.fecha || new Date().toISOString().split('T')[0];
    return this.circuitoRepo.findWithConsumptionByDate(fecha, take, skip);
  }

  /**
   * Obtiene circuitos con consumo Y último apagón de cada circuito
   * Optimizado para rotaciones-ms que necesita ambos datos
   */
  async findWithConsumptionAndApagones(payload: FindConsumptionByDateDto) {
    const take = payload.take || 20;
    const skip = payload.skip || 0;
    const fecha = payload.fecha || new Date().toISOString().split('T')[0];
    
    const records = await this.circuitoRepo.findWithConsumptionAndLastApagon(fecha, take, skip);
    
    if (!records || records.length === 0) {
      return {
        results: [],
        meta: {
          page: Math.ceil((skip + 1) / take),
          totalPages: 0,
          total: 0,
          pageSize: take,
        },
      };
    }

    return {
      results: records,
      meta: {
        page: Math.ceil((skip + 1) / take),
        totalPages: Math.ceil(records.length / take),
        total: records.length,
        pageSize: take,
      },
    };
  }

  findOne(id: number) {
    return `This action returns a #${id} circuito`;
  }

  update(id: number, updateCircuitoDto: UpdateCircuitoDto) {
    return `This action updates a #${id} circuito`;
  }

  remove(id: number) {
    return `This action removes a #${id} circuito`;
  }
}
