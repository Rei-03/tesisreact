import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { NatsModule } from './nats/nats.module';
import { CircuitosModule } from './circuitos/circuitos.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [NatsModule, CircuitosModule, AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
