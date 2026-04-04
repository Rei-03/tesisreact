import { Module } from '@nestjs/common';
import { RotacionesController } from './rotaciones.controller';

@Module({
  controllers: [RotacionesController],
})
export class RotacionesModule {}
