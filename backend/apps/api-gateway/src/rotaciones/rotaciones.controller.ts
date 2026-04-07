import { Controller, Post, Body, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { CreateRotacioneDto } from './dto/create-rotacione.dto';
import { RotacionResultadoDto } from './dto/rotacion-resultado.dto';

@Controller('rotaciones')
export class RotacionesController {
  constructor(@Inject('NatsService') private readonly client: ClientProxy) {}

  /**
   * 🟢 GENERAR ROTACIÓN
   * 
   * POST /rotaciones/generar
   * 
   * El servicio (rotaciones-ms) obtiene automáticamente:
   * - Circuitos con consumo desde circuitos-ms
   * - Apagones históricos desde circuitos-ms
   * - Aseguramientos desde BD
   * - Determina estado actual de cada circuito
   * 
   * Si soloApagar = false (default):
   *   - Enciende circuitos FIFO
   *   - Su consumo se suma al déficit
   *   - Ejemplo: 50 MW + 30 MW (encendidos) = apaga 80 MW total
   * 
   * Si soloApagar = true:
   *   - Solo apaga, NO enciende
   *   - Resultado.encendidos estará vacío
   */
  @Post('generar')
  async generarRotacion(
    @Body() createRotacioneDto: CreateRotacioneDto,
  ): Promise<RotacionResultadoDto> {
    return firstValueFrom(
      this.client.send('rotaciones.generar', createRotacioneDto),
    );
  }
}
