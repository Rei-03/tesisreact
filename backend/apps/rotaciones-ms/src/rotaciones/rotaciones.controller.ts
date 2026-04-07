import { Controller, Post, Body, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { RotacionesService } from './rotaciones.service';
import { CreateRotacioneDto } from './dto/create-rotacione.dto';
import { UpdateRotacioneDto } from './dto/update-rotacione.dto';
import { RotacionResultadoDto } from './dto/rotacion-resultado.dto';

@Controller('rotaciones')
export class RotacionesController {
  private readonly logger = new Logger(RotacionesController.name);

  constructor(private readonly rotacionesService: RotacionesService) {}

  /**
   * 🟢 ENDPOINT PRINCIPAL (SIMPLIFICADO + FLEXIBLE)
   * 
   * POST /rotaciones/generar
   * Body: { deficitX: number, fecha?: Date, soloApagar?: boolean }
   * 
   * El servicio obtiene automáticamente:
   * - Circuitos con consumo
   * - Apagones
   * - Aseguramientos
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
  ): Promise<any> {
    try {
      this.logger.log(
        `Rotación solicitada: déficit ${createRotacioneDto.deficitX} MW${createRotacioneDto.soloApagar ? ' (solo apagar)' : ''}`,
      );

      const resultado: RotacionResultadoDto =
        await this.rotacionesService.generate(createRotacioneDto);

      this.logger.log(
        `Rotación generada: ${resultado.cola.length} apagados, ${resultado.encendidos.length} encendidos`,
      );

      return {
        success: true,
        data: resultado,
        timestamp: new Date(),
      };
    } catch (error) {
      this.logger.error(`Error generando rotación: ${error}`);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
        timestamp: new Date(),
      };
    }
  }

  /**
   * 📌 ENDPOINT MICROSERVICIO (NATS)
   * Pattern: rotaciones.generar
   */
  @MessagePattern('rotaciones.generar')
  async generarRotacionNats(
    @Payload() createRotacioneDto: CreateRotacioneDto,
  ): Promise<RotacionResultadoDto> {
    this.logger.log('Rotación solicitada via NATS');
    return this.rotacionesService.generate(createRotacioneDto);
  }

  @MessagePattern('rotaciones.findOne')
  findOne(@Payload() data: { id: number }) {
    return this.rotacionesService.findOne(data.id);
  }

  @MessagePattern('rotaciones.update')
  update(@Payload() data: { id: number; updateRotacioneDto: UpdateRotacioneDto }) {
    return this.rotacionesService.update(data.id, data.updateRotacioneDto);
  }

  @MessagePattern('rotaciones.delete')
  remove(@Payload() data: { id: number }) {
    return this.rotacionesService.remove(data.id);
  }
}
