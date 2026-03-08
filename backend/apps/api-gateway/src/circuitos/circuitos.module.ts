import { Module } from '@nestjs/common';
import { CircuitosController } from './circuitos.controller';

@Module({
  controllers: [CircuitosController],
})
export class CircuitosModule {}
