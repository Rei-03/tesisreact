import { Module } from '@nestjs/common';
import { AseguramientosService } from './aseguramientos.service';
import { AseguramientosController } from './aseguramientos.controller';
import { AseguramientosRepository } from './aseguramientos.repository';

@Module({
  controllers: [AseguramientosController],
  providers: [AseguramientosService, AseguramientosRepository],
})
export class AseguramientosModule {}
