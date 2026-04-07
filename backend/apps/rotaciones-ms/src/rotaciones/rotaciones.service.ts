import { Inject, Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { CreateRotacioneDto } from './dto/create-rotacione.dto';
import { UpdateRotacioneDto } from './dto/update-rotacione.dto';
import { RotacionResultadoDto } from './dto/rotacion-resultado.dto';
import { AseguramientosRepository } from '../aseguramientos/aseguramientos.repository';
import { RotacionAlgoritmo } from './rotacion.algoritmo';
import { Circuito, ResultadoRotacion } from './interfaces/circuito.interface';

@Injectable()
export class RotacionesService {
  private readonly logger = new Logger(RotacionesService.name);

  constructor(
    private readonly aseguramientosRepo: AseguramientosRepository,
    @Inject('NatsService') private readonly natsClient: ClientProxy,
  ) {}

  /**
   * Genera plan de rotación de energía NUEVA cada vez
   * 
   * Proceso:
   * 1. Obtiene circuitos con consumos desde circuitos-ms
   * 2. Obtiene aseguramientos para identificar protegidos
   * 3. Enriquece circuitos con estado y timestamps
   * 4. Ejecuta algoritmo considerando soloApagar
   * 5. Retorna qué apagar y qué encender
   * 
   * IMPORTANTE: Si enciendes circuitos, su consumo se suma al déficit
   * (porque van a consumir potencia)
   * Ejemplo: déficit 50 + encender 30 MW = necesita apagar 80 MW total
   * 
   * @param createRotacioneDto Solo contiene deficitX, fecha, soloApagar
   * @returns Resultado con cola nueva e IDs a encender (vacío si soloApagar)
   */
  async generate(
    createRotacioneDto: CreateRotacioneDto,
  ): Promise<RotacionResultadoDto> {
    // Validar entrada
    if (!createRotacioneDto.deficitX || createRotacioneDto.deficitX <= 0) {
      throw new BadRequestException('El déficit de potencia debe ser mayor a 0');
    }

    const fecha = createRotacioneDto.fecha || new Date();
    const soloApagar = createRotacioneDto.soloApagar ?? false;

    this.logger.debug(
      `Generando rotación para fecha ${fecha}, déficit ${createRotacioneDto.deficitX} MW${soloApagar ? ' (solo apagar)' : ''}`,
    );

    try {
      // Obtener circuitos con consumo y apagones
      const circuitos = await this.obtenerCircuitosConDatos(fecha);
      this.logger.debug(`Obtenidos ${circuitos.length} circuitos`);

      // Obtener aseguramientos para identificar protegidos
      const aseguramientos = await this.obtenerAseguramientos(fecha);
      const idsProtegidos = new Set(aseguramientos.map((a) => a.idCircuitoP));
      this.logger.debug(`Identificados ${idsProtegidos.size} circuitos protegidos`);

      // Enriquecer circuitos con estado y protección
      const circuitosEnriquecidos = this.enriquecerCircuitos(
        circuitos,
        idsProtegidos,
        fecha,
      );

      // Filtrar solo aptos (no protegidos)
      const circuitosAptos = circuitosEnriquecidos.filter((c) => !c.protegido);

      if (circuitosAptos.length === 0) {
        throw new BadRequestException(
          'No hay circuitos disponibles para rotación (todos protegidos)',
        );
      }

      this.logger.debug(`Circuitos aptos: ${circuitosAptos.length}`);

      // Ejecutar algoritmo con parámetro soloApagar
      const resultado: ResultadoRotacion = RotacionAlgoritmo.ejecutar(
        circuitosAptos,
        createRotacioneDto.deficitX,
        soloApagar, // ← Nuevo parámetro
        [], // Cola VACÍA: siempre crea nueva
      );

      this.logger.debug(
        `Rotación generada: ${resultado.cola.length} apagados, ${resultado.encendidos.length} encendidos${soloApagar ? ' (encendidos bloqueados)' : ''}`,
      );

      return new RotacionResultadoDto(resultado);
    } catch (error) {
      this.logger.error(`Error generando rotación: ${error}`);
      throw error;
    }
  }

  /**
   * Obtiene circuitos con consumo y apagones desde circuitos-ms
   * @param fecha Fecha para la que obtener datos
   * @returns Circuitos con consumo e información de apagones
   */
  private async obtenerCircuitosConDatos(fecha: Date): Promise<any[]> {
    try {
      const circuitos = await firstValueFrom(
        this.natsClient.send('circuitos.findWithConsumptionAndApagones', {
          fecha: fecha.toISOString().split('T')[0],
          take: 1000,
          skip: 0,
        }),
      );
      return circuitos || [];
    } catch (error) {
      this.logger.error('Error obteniendo circuitos desde circuitos-ms:', error);
      throw new BadRequestException(
        'No se pudieron obtener los circuitos del servicio',
      );
    }
  }

  /**
   * Obtiene aseguramientos (circuitos protegidos) de la fecha
   * @param fecha Fecha de referencia
   * @returns Array de aseguramientos
   */
  private async obtenerAseguramientos(fecha: Date): Promise<any[]> {
    try {
      const hoy = new Date(fecha);
      hoy.setHours(0, 0, 0, 0);

      const aseguramientos = await this.aseguramientosRepo.findMany({
        select: { idCircuitoP: true },
        where: { fecha: hoy },
      });
      return aseguramientos || [];
    } catch (error) {
      this.logger.warn('Error obteniendo aseguramientos:', error);
      return []; // Si falla, asume que no hay protegidos
    }
  }

  /**
   * Enriquece circuitos con estado actual, protección y timestamps
   * Esta lógica determina si el circuito está encendido o apagado
   * basándose en el último apagón
   * 
   * @param circuitos Raw data de circuitos
   * @param idsProtegidos Set de IDs protegidos
   * @param ahora Fecha actual
   * @returns Circuitos enriquecidos tipo Circuito
   */
  private enriquecerCircuitos(
    circuitos: any[],
    idsProtegidos: Set<number>,
    ahora: Date,
  ): Circuito[] {
    return circuitos.map((c) => {
      // Determinar estado basado en último apagón
      // Si tiene apagón abierto (sin FechaCierre) → está apagado
      // Si no tiene apagón o el apagón está cerrado → está encendido
      const tieneApagonAbierto =
        c.ultimoApagon && c.ultimoApagon.FechaCierre === null;
      const estado = tieneApagonAbierto ? 'apagado' : 'encendido';

      // Timestamp del último cambio de estado
      // Si está apagado: FechaRetiro del apagón
      // Si está encendido: FechaCierre del apagón O timestamp actual
      let ultimoCambioEstado = new Date();
      if (c.ultimoApagon) {
        ultimoCambioEstado = tieneApagonAbierto
          ? new Date(c.ultimoApagon.FechaRetiro)
          : new Date(c.ultimoApagon.FechaCierre);
      }

      return {
        idCircuitoP: c.idCircuitoP,
        idProv: c.idProv,
        Circuito33: c.Circuito33,
        Bloque: c.Bloque,
        CircuitoP: c.CircuitoP,
        Clientes: c.Clientes,
        ZonaAfectada: c.ZonaAfectada,
        Apagable: c.Apagable,
        estado: estado as 'encendido' | 'apagado',
        protegido: idsProtegidos.has(c.idCircuitoP),
        ultimoCambioEstado,
        consumo: c.consumo || {
          mw: 0,
          historico: [],
          fechaReferencia: ahora.toISOString().split('T')[0],
        },
        ultimoApagon: c.ultimoApagon,
      };
    });
  }

  findAll() {
    return `This action returns all rotaciones`;
  }

  findOne(id: number) {
    return `This action returns a #${id} rotacione`;
  }

  update(id: number, updateRotacioneDto: UpdateRotacioneDto) {
    return `This action updates a #${id} rotacione`;
  }

  remove(id: number) {
    return `This action removes a #${id} rotacione`;
  }
}

