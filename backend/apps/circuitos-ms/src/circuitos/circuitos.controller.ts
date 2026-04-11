import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CircuitosService } from './circuitos.service';
import { CreateCircuitoDto } from './dto/create-circuito.dto';
import { UpdateCircuitoDto } from './dto/update-circuito.dto';
import { FindConsumptionByDateDto } from './dto/find-consumption-by-date.dto';

@Controller('circuitos')
export class CircuitosController {
  constructor(private readonly circuitosService: CircuitosService) {}

  @MessagePattern('circuitos.findAll')
  findAll(@Payload() payload: { page?: number; pageSize?: number; apagable?: boolean; bloque?: string }) {
    const page = payload?.page || 1;
    const pageSize = payload?.pageSize || 20;
    const skip = (page - 1) * pageSize;
    const take = pageSize;
    return this.circuitosService.findAll(take, skip, payload?.apagable, payload?.bloque);
  }

  @MessagePattern('circuitos.findAllWithConsumption')
  findAllWithConsumption(@Payload() payload: FindConsumptionByDateDto) {
    return this.circuitosService.findAllWithConsumption(payload);
  }

  @MessagePattern('circuitos.findWithConsumptionAndApagones')
  async findWithConsumptionAndApagones(@Payload() payload: FindConsumptionByDateDto) {
    return this.circuitosService.findWithConsumptionAndApagones(payload);
  }

  @MessagePattern('circuitos.findOne')
  findOne(@Payload() data: { id: number }) {
    return this.circuitosService.findOne(data.id);
  }
}
