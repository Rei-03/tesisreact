import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ApagonesService } from './apagones.service';
import { FindApagonesPaginationDto } from './dto/find-apagones-pagination.dto';
import { FindApagonesByDateRangeDto } from './dto/find-apagones-by-date-range.dto';

@Controller('apagones')
export class ApagonesController {
  constructor(private readonly apagonesService: ApagonesService) {}

  @MessagePattern('apagones.findAll')
  findAll(
    @Payload()
    payload: FindApagonesPaginationDto | { page?: number; pageSize?: number },
  ) {
    return this.apagonesService.findAll(payload);
  }

  @MessagePattern('apagones.findById')
  findById(@Payload() data: { idApagon: number }) {
    return this.apagonesService.findById(data.idApagon);
  }

  @MessagePattern('apagones.findByCircuitoId')
  findByCircuitoId(
    @Payload() data: { idCircuitoP: number; page?: number; pageSize?: number },
  ) {
    return this.apagonesService.findByCircuitoId(data.idCircuitoP, {
      page: data.page,
      pageSize: data.pageSize,
    });
  }

  @MessagePattern('apagones.findLastByCircuito')
  findLastApagonByCircuito(@Payload() payload: FindApagonesPaginationDto) {
    return this.apagonesService.findLastApagonByCircuito(payload);
  }

  @MessagePattern('apagones.findByProvincia')
  findByProvincia(
    @Payload() data: { idProv: string; page?: number; pageSize?: number },
  ) {
    return this.apagonesService.findByProvincia(data.idProv, {
      page: data.page,
      pageSize: data.pageSize,
    });
  }

  @MessagePattern('apagones.findOpen')
  findOpenApagones(@Payload() payload: FindApagonesPaginationDto) {
    return this.apagonesService.findOpenApagones(payload);
  }

  @MessagePattern('apagones.findByDateRange')
  findByDateRange(@Payload() payload: FindApagonesByDateRangeDto) {
    return this.apagonesService.findByDateRange(payload);
  }

  @MessagePattern('apagones.getStats')
  getApagonesByCircuitoStats() {
    return this.apagonesService.getApagonesByCircuitoStats();
  }
}
