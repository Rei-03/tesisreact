import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ClientDbModule } from './client-db/client-db.module';
import { AseguramientosModule } from './aseguramientos/aseguramientos.module';
import { RotacionesModule } from './rotaciones/rotaciones.module';
import { NatsModule } from './nats/nats.module';


@Module({
  imports: [ClientDbModule, AseguramientosModule, RotacionesModule, NatsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
