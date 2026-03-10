import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { RotacionesService } from './rotaciones.service';
import { CreateRotacioneDto } from './dto/create-rotacione.dto';
import { UpdateRotacioneDto } from './dto/update-rotacione.dto';

@Controller('rotaciones')
export class RotacionesController {
  constructor(private readonly rotacionesService: RotacionesService) {}

  @MessagePattern('rotaciones.generate')
  create(@Payload() createRotacioneDto: CreateRotacioneDto) {
    return this.rotacionesService.generate(createRotacioneDto);
  }

  @MessagePattern('rotaciones.findOne')
  findOne(@Payload() data: { id: number }) {
    return this.rotacionesService.findOne(data.id);
  }

  @MessagePattern('rotaciones.update')
  update(@Payload() data: { id: number; updateRotacioneDto: UpdateRotacioneDto }) {
    return this.rotacionesService.update(data.id, data.updateRotacioneDto);
  }

  @MessagePattern('rotaciones.delete')
  remove(@Payload() data: { id: number }) {
    return this.rotacionesService.remove(data.id);
  }
}
