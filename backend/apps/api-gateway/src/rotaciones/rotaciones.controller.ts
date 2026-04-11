import { Controller, Post, Body, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { CreateRotacioneDto } from './dto/create-rotacione.dto';
import { RotacionResultadoDto } from './dto/rotacion-resultado.dto';

@Controller('rotaciones')
export class RotacionesController {
  constructor(@Inject('NatsService') private readonly client: ClientProxy) {}

  @Post('generar')
  async generarRotacion(
    @Body() createRotacioneDto: CreateRotacioneDto,
  ): Promise<RotacionResultadoDto> {
    return firstValueFrom(
      this.client.send('rotaciones.generar', createRotacioneDto),
    );
  }
}
