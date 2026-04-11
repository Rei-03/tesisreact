import { Controller, Get, Post, Body, Patch, Param, Delete, Inject, Query } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { FindConsumptionByDateDto } from './dto/find-consumption-by-date.dto';

@Controller('circuitos')
export class CircuitosController {
  constructor(@Inject("NatsService")private readonly client: ClientProxy) {}

  @Get('with-consumption')
  findAllWithConsumption(
    @Query('fecha') fecha: string,
    @Query('take') take?: number,
    @Query('skip') skip?: number,
  ) {
    return firstValueFrom(this.client.send('circuitos.findAllWithConsumption', {
      fecha,
      take: take ? Number(take) : undefined,
      skip: skip ? Number(skip) : undefined,
    }));
  }

  /**
   * 🟢 CIRCUITOS CON CONSUMO Y APAGONES
   * Endpoint combinado que retorna circuitos + consumo + último apagón
   * Usado principalmente por rotaciones-ms para equilibrio automático
   */
  @Get('with-consumption-and-apagones')
  findWithConsumptionAndApagones(
    @Query('fecha') fecha: string,
    @Query('take') take?: number,
    @Query('skip') skip?: number,
  ) {
    return firstValueFrom(this.client.send('circuitos.findWithConsumptionAndApagones', {
      fecha,
      take: take ? Number(take) : undefined,
      skip: skip ? Number(skip) : undefined,
    }));
  }

  @Get()
  findAll(
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
    @Query('apagable') apagable?: string,
    @Query('bloque') bloque?: string,
  ) {
    const pageNum = page ? Number(page) : 1;
    const pageSizeNum = pageSize ? Number(pageSize) : 20;
    const apagableBool = apagable ? apagable === 'true' : undefined;
    
    return firstValueFrom(this.client.send('circuitos.findAll', {
      page: pageNum,
      pageSize: pageSizeNum,
      apagable: apagableBool,
      bloque: bloque || undefined,
    }));
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return firstValueFrom(this.client.send('circuitos.findOne', { id: parseInt(id) }));
  }

}