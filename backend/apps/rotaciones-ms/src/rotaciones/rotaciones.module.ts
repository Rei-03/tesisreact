import { Module } from '@nestjs/common';
import { RotacionesService } from './rotaciones.service';
import { RotacionesController } from './rotaciones.controller';

@Module({
  controllers: [RotacionesController],
  providers: [RotacionesService],
})
export class RotacionesModule {}
