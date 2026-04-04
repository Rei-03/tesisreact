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

  findAll() {
    return this.circuitoRepo.find(5,0);
  }

  findAllWithConsumption(payload: FindConsumptionByDateDto) {
    const take = payload.take || 20;
    const skip = payload.skip || 0;
    return this.circuitoRepo.findWithConsumptionByDate(payload.fecha, take, skip);
  }

  /**
   * Obtiene circuitos con consumo Y último apagón de cada circuito
   * Optimizado para rotaciones-ms que necesita ambos datos
   */
  findWithConsumptionAndApagones(payload: FindConsumptionByDateDto) {
    const take = payload.take || 20;
    const skip = payload.skip || 0;
    return this.circuitoRepo.findWithConsumptionAndLastApagon(payload.fecha, take, skip);
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
