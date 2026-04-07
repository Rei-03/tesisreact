import { Controller, Get, Post, Body, Patch, Param, Delete, Inject, Query } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { FindConsumptionByDateDto } from './dto/find-consumption-by-date.dto';

@Controller('circuitos')
export class CircuitosController {
  constructor(@Inject("NatsService")private readonly client: ClientProxy) {}

  @Get()
  findAll() {
    return firstValueFrom(this.client.send('circuitos.findAll', {}));
  }

  @Post('with-consumption')
  findAllWithConsumption(@Body() payload: FindConsumptionByDateDto) {
    return firstValueFrom(this.client.send('circuitos.findAllWithConsumption', payload));
  }

  /**
   * 🟢 CIRCUITOS CON CONSUMO Y APAGONES
   * Endpoint combinado que retorna circuitos + consumo + último apagón
   * Usado principalmente por rotaciones-ms para equilibrio automático
   */
  @Post('with-consumption-and-apagones')
  findWithConsumptionAndApagones(@Body() payload: FindConsumptionByDateDto) {
    return firstValueFrom(this.client.send('circuitos.findWithConsumptionAndApagones', payload));
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return firstValueFrom(this.client.send('circuitos.findOne', { id: parseInt(id) }));
  }

}