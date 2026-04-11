import { Module } from '@nestjs/common';
import { NatsModule } from './nats/nats.module';
import { CircuitosModule } from './circuitos/circuitos.module';
import { AuthModule } from './auth/auth.module';
import { RedisModule } from './redis/redis.module';
import { RotacionesModule } from './rotaciones/rotaciones.module';
import { ApagonesModule } from './apagones/apagones.module';
import { AseguramientosModule } from './aseguramientos/aseguramientos.module';

@Module({
  imports: [NatsModule, CircuitosModule, AuthModule, RedisModule, RotacionesModule, ApagonesModule, AseguramientosModule],
})
export class AppModule {}
