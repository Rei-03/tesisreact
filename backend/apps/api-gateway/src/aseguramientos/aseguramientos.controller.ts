import { Controller, Get, Post, Body, Patch, Param, Delete, Inject, Query } from '@nestjs/common';
import { CreateAseguramientoDto } from './dto/create-aseguramiento.dto';
import { UpdateAseguramientoDto } from './dto/update-aseguramiento.dto';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Controller('/rotaciones/aseguramientos')
export class AseguramientosController {
  constructor(@Inject('NatsService') private readonly client: ClientProxy) {}

  @Post()
  create(@Body() createAseguramientoDto: CreateAseguramientoDto) {
    return firstValueFrom(
      this.client.send('aseguramientos.create', createAseguramientoDto),
    );
  }

  @Get()
  findAll(
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
    @Query('fecha') fecha?: string,
    @Query('circuitoP') circuitoP?: string,
  ) {
    const pageNum = page ? Number(page) : 1;
    const pageSizeNum = pageSize ? Number(pageSize) : 20;
    return firstValueFrom(
      this.client.send('aseguramientos.findAll', {
        page: pageNum,
        pageSize: pageSizeNum,
        fecha,
        circuitoP,
      })
    );
  }

  @Get('count')
  countByFecha(@Query('fecha') fecha?: string) {
    return firstValueFrom(
      this.client.send('aseguramientos.countByFecha', {
        fecha,
      }),
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return firstValueFrom(
      this.client.send('aseguramientos.findOne', { id: parseInt(id) }),
    );
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateAseguramientoDto: UpdateAseguramientoDto,
  ) {
    return firstValueFrom(
      this.client.send('aseguramientos.update', {
        id: parseInt(id),
        updateAseguramientoDto,
      }),
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return firstValueFrom(
      this.client.send('aseguramientos.delete', { id: parseInt(id) }),
    );
  }
}
