import { Controller, Get, Post, Body, Patch, Param, Delete, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Controller('circuitos')
export class CircuitosController {
  constructor(@Inject("NatsService")private readonly client: ClientProxy) {}

  @Get()
  findAll() {
    return firstValueFrom(this.client.send('circuitos.findAll', {}));
  }

  @Get('with-consumption')
  findAllWithConsumption() {
    return firstValueFrom(this.client.send('circuitos.findAllWithConsumption', {}));
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return firstValueFrom(this.client.send('circuitos.findOne', { id: parseInt(id) }));
  }

}