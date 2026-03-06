import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CircuitosService } from './circuitos.service';
import { CreateCircuitoDto } from './dto/create-circuito.dto';
import { UpdateCircuitoDto } from './dto/update-circuito.dto';

@Controller('circuitos')
export class CircuitosController {
  constructor(private readonly circuitosService: CircuitosService) {}

  @Post()
  create(@Body() createCircuitoDto: CreateCircuitoDto) {
    return this.circuitosService.create(createCircuitoDto);
  }

  @Get()
  findAll() {
    return this.circuitosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.circuitosService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCircuitoDto: UpdateCircuitoDto) {
    return this.circuitosService.update(+id, updateCircuitoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.circuitosService.remove(+id);
  }
}
