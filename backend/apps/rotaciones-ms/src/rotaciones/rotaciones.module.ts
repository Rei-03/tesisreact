import { Module } from '@nestjs/common';
import { RotacionesService } from './rotaciones.service';
import { RotacionesController } from './rotaciones.controller';
import { AseguramientosModule } from '../aseguramientos/aseguramientos.module';

@Module({
  imports: [AseguramientosModule],
  controllers: [RotacionesController],
  providers: [RotacionesService],
})
export class RotacionesModule {}
