import { Module } from '@nestjs/common';
import { CircuitosService } from './circuitos.service';
import { CircuitosController } from './circuitos.controller';
import { CircuitosRepository } from './circuitos.repository';

@Module({
  controllers: [CircuitosController],
  providers: [CircuitosService, CircuitosRepository],
})
export class CircuitosModule {}
