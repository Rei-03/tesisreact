import { Injectable } from '@nestjs/common';
import { CreateCircuitoDto } from './dto/create-circuito.dto';
import { UpdateCircuitoDto } from './dto/update-circuito.dto';
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

  findAllWithConsumption() {
    return this.circuitoRepo.findWithConsumption(5,0);
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
