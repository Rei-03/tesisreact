import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ClientDbModule } from './client-db/client-db.module';
import { CircuitosModule } from './circuitos/circuitos.module';

@Module({
  imports: [ClientDbModule, CircuitosModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
