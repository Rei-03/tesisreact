import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CircuitosService } from './circuitos.service';
import { CreateCircuitoDto } from './dto/create-circuito.dto';
import { UpdateCircuitoDto } from './dto/update-circuito.dto';

@Controller('circuitos')
export class CircuitosController {
  constructor(private readonly circuitosService: CircuitosService) {}

  @MessagePattern('circuitos.findAll')
  findAll() {
    return this.circuitosService.findAll();
  }

  @MessagePattern('circuitos.findAllWithConsumption')
  findAllWithConsumption() {
    return this.circuitosService.findAllWithConsumption();
  }

  @MessagePattern('circuitos.findOne')
  findOne(@Payload() data: { id: number }) {
    return this.circuitosService.findOne(data.id);
  }
}
