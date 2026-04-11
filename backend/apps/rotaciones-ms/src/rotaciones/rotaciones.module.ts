import { Module } from '@nestjs/common';
import { RotacionesService } from './rotaciones.service';
import { RotacionesController } from './rotaciones.controller';
import { AseguramientosModule } from '../aseguramientos/aseguramientos.module';
import { NatsModule } from '../nats/nats.module';

@Module({
  imports: [AseguramientosModule, NatsModule],
  controllers: [RotacionesController],
  providers: [RotacionesService],
})
export class RotacionesModule {}
