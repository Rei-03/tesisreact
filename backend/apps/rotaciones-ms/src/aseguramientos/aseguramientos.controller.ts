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
  findAll(@Payload() payload: { page?: number; pageSize?: number; fecha?: string; circuitoP?: string }) {
    const page = payload?.page;
    const pageSize = payload?.pageSize;
    const skip = page && pageSize ? (page - 1) * pageSize : undefined;
    const take = pageSize;
    const fecha = payload?.fecha;
    const circuitoP = payload?.circuitoP;
    return this.aseguramientosService.findAll(take, skip, fecha, circuitoP);
  }

  @MessagePattern('aseguramientos.countByFecha')
  countByFecha(@Payload() payload: { fecha?: string } = {}) {
    return this.aseguramientosService.countByFecha(payload?.fecha);
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
