import { Module } from '@nestjs/common';
import { ApagonesService } from './apagones.service';
import { ApagonesController } from './apagones.controller';
import { ApagonesRepository } from './apagones.repository';

@Module({
  controllers: [ApagonesController],
  providers: [ApagonesService, ApagonesRepository],
})
export class ApagonesModule {}
