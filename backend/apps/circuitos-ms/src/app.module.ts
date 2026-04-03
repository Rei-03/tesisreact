import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ClientDbModule } from './client-db/client-db.module';
import { CircuitosModule } from './circuitos/circuitos.module';
import { NatsModule } from './nats/nats.module';
import { ApagonesModule } from './apagones/apagones.module';

@Module({
  imports: [ClientDbModule, CircuitosModule, ApagonesModule, NatsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
