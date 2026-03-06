import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ClientDbModule } from './client-db/client-db.module';

@Module({
  imports: [ClientDbModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
