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
  findAll(payload: FindApagonesPaginationDto) {
    const take = payload.take || 20;
    const skip = payload.skip || 0;
    return this.apagonesRepo.findAll(take, skip);
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
    const take = payload.take || 20;
    const skip = payload.skip || 0;
    return this.apagonesRepo.findByCircuitoId(idCircuitoP, take, skip);
  }

  /**
   * Obtiene el último apagón para cada circuito
   * Perfecto para dashboards que muestren el estado más reciente
   */
  findLastApagonByCircuito(payload: FindApagonesPaginationDto) {
    const take = payload.take || 20;
    const skip = payload.skip || 0;
    return this.apagonesRepo.findLastApagonByCircuito(take, skip);
  }

  /**
   * Obtiene apagones filtrados por provincia
   */
  findByProvincia(idProv: string, payload: FindApagonesPaginationDto) {
    const take = payload.take || 20;
    const skip = payload.skip || 0;
    return this.apagonesRepo.findByProvincia(idProv, take, skip);
  }

  /**
   * Obtiene apagones que aún están abiertos (sin fecha de cierre)
   */
  findOpenApagones(payload: FindApagonesPaginationDto) {
    const take = payload.take || 20;
    const skip = payload.skip || 0;
    return this.apagonesRepo.findOpenApagones(take, skip);
  }

  /**
   * Obtiene apagones dentro de un rango de fechas
   */
  findByDateRange(payload: FindApagonesByDateRangeDto) {
    const take = payload.take || 20;
    const skip = payload.skip || 0;
    return this.apagonesRepo.findByDateRange(payload.fechaInicio, payload.fechaFin, take, skip);
  }

  /**
   * Obtiene estadísticas de apagones por circuito
   */
  getApagonesByCircuitoStats() {
    return this.apagonesRepo.getApagonesByCircuitoStats();
  }
}
