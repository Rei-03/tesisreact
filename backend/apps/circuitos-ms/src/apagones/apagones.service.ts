import { Injectable } from '@nestjs/common';
import { ApagonesRepository } from './apagones.repository';
import { FindApagonesPaginationDto } from './dto/find-apagones-pagination.dto';
import { FindApagonesByDateRangeDto } from './dto/find-apagones-by-date-range.dto';

@Injectable()
export class ApagonesService {
  constructor(private readonly apagonesRepo: ApagonesRepository) {}

  /**
   * Obtiene todos los apagones con paginación
   */
  async findAll(payload: FindApagonesPaginationDto) {
    const page = payload.page || 1;
    const pageSize = payload.pageSize || 20;
    const skip = (page - 1) * pageSize;
    const take = pageSize;
    
    const { records, total } = await this.apagonesRepo.findAll(take, skip);
    const totalPages = Math.ceil(total / take);

    return {
      results: records,
      meta: {
        page,
        totalPages,
        total,
        pageSize: take,
      },
    };
  }

  /**
   * Obtiene un apagón específico por ID
   */
  findById(idApagon: number) {
    return this.apagonesRepo.findById(idApagon);
  }

  /**
   * Obtiene todos los apagones de un circuito específico
   */
  findByCircuitoId(idCircuitoP: number, payload: FindApagonesPaginationDto) {
    const page = payload.page || 1;
    const pageSize = payload.pageSize || 20;
    const skip = (page - 1) * pageSize;
    const take = pageSize;
    return this.apagonesRepo.findByCircuitoId(idCircuitoP, take, skip);
  }

  /**
   * Obtiene el último apagón para cada circuito
   * Perfecto para dashboards que muestren el estado más reciente
   */
  findLastApagonByCircuito(payload: FindApagonesPaginationDto) {
    const page = payload.page || 1;
    const pageSize = payload.pageSize || 20;
    const skip = (page - 1) * pageSize;
    const take = pageSize;
    return this.apagonesRepo.findLastApagonByCircuito(take, skip);
  }

  /**
   * Obtiene apagones filtrados por provincia
   */
  findByProvincia(idProv: string, payload: FindApagonesPaginationDto) {
    const page = payload.page || 1;
    const pageSize = payload.pageSize || 20;
    const skip = (page - 1) * pageSize;
    const take = pageSize;
    return this.apagonesRepo.findByProvincia(idProv, take, skip);
  }

  /**
   * Obtiene apagones que aún están abiertos (sin fecha de cierre)
   */
  findOpenApagones(payload: FindApagonesPaginationDto) {
    const page = payload.page || 1;
    const pageSize = payload.pageSize || 20;
    const skip = (page - 1) * pageSize;
    const take = pageSize;
    return this.apagonesRepo.findOpenApagones(take, skip);
  }

  /**
   * Obtiene apagones dentro de un rango de fechas
   */
  findByDateRange(payload: FindApagonesByDateRangeDto) {
    const page = payload.page || 1;
    const pageSize = payload.pageSize || 20;
    const skip = (page - 1) * pageSize;
    const take = pageSize;
    return this.apagonesRepo.findByDateRange(payload.fechaInicio, payload.fechaFin, take, skip);
  }

  /**
   * Obtiene estadísticas de apagones por circuito
   */
  getApagonesByCircuitoStats() {
    return this.apagonesRepo.getApagonesByCircuitoStats();
  }
}
