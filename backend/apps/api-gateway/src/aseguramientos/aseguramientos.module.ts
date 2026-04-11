import { Module } from '@nestjs/common';
import { AseguramientosController } from './aseguramientos.controller';

@Module({
  controllers: [AseguramientosController],
})
export class AseguramientosModule {}
