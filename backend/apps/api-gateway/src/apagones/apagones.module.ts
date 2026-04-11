import { Module } from '@nestjs/common';
import { ApagonesController } from './apagones.controller';

@Module({
  controllers: [ApagonesController],
})
export class ApagonesModule {}
