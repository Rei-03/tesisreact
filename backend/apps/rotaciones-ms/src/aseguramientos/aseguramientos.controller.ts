import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AseguramientosService } from './aseguramientos.service';
import { CreateAseguramientoDto } from './dto/create-aseguramiento.dto';
import { UpdateAseguramientoDto } from './dto/update-aseguramiento.dto';

@Controller('aseguramientos')
export class AseguramientosController {
  constructor(private readonly aseguramientosService: AseguramientosService) {}

  @MessagePattern('aseguramientos.create')
  create(@Payload() createAseguramientoDto: CreateAseguramientoDto) {
    return this.aseguramientosService.create(createAseguramientoDto);
  }

  @MessagePattern('aseguramientos.findAll')
  findAll() {
    return this.aseguramientosService.findAll();
  }

  @MessagePattern('aseguramientos.findOne')
  findOne(@Payload() data: { id: number }) {
    return this.aseguramientosService.findOne(data.id);
  }

  @MessagePattern('aseguramientos.update')
  update(@Payload() data: { id: number; updateAseguramientoDto: UpdateAseguramientoDto }) {
    return this.aseguramientosService.update(data.id, data.updateAseguramientoDto);
  }

  @MessagePattern('aseguramientos.delete')
  remove(@Payload() data: { id: number }) {
    return this.aseguramientosService.remove(data.id);
  }
}
