import { Injectable } from '@nestjs/common';
import { CreateAseguramientoDto } from './dto/create-aseguramiento.dto';
import { UpdateAseguramientoDto } from './dto/update-aseguramiento.dto';
import { AseguramientosRepository } from './aseguramientos.repository';

@Injectable()
export class AseguramientosService {
  constructor(private readonly aseguramientosRepo: AseguramientosRepository) { }
  async create(createAseguramientoDto: CreateAseguramientoDto) {
    return await this.aseguramientosRepo.create({
      id_CircuitoP: createAseguramientoDto.id_CircuitoP,
      CircuitoP: createAseguramientoDto.CircuitoP,
      fechaInicial: createAseguramientoDto.fechaInicial,
      fechaFinal: createAseguramientoDto.fechaFinal,
      Observaciones: createAseguramientoDto.Observaciones,
      tipo: createAseguramientoDto.tipo,
      mw: createAseguramientoDto.mw,
    });
  }

  async findAll(take?: number, skip?: number, fecha?: string, circuitoP?: string) {
    // Si hay fecha, convertirla correctamente. Si no, será null para mostrar historial completo
    let fechaFiltro: Date | null = null;
    
    if (fecha) {
      // Convertir fecha ISO (YYYY-MM-DD) a Date correctamente
      const partes = fecha.split('T')[0].split('-');
      fechaFiltro = new Date(Number(partes[0]), Number(partes[1]) - 1, Number(partes[2]));
    }

    const { records, total } = await this.aseguramientosRepo.findMany({ 
      select: {}, 
      where: { fecha: fechaFiltro, circuitoP },
      take,
      skip
    });

    const totalPages = take ? Math.ceil(total / take) : 1;
    const page = skip && take ? Math.floor(skip / take) + 1 : 1;

    return {
      results: records,
      meta: {
        page,
        totalPages,
        total,
        pageSize: take || total,
      },
    };
  }

  findOne(id: number) {
    return `This action returns a #${id} aseguramiento`;
  }

  update(id: number, updateAseguramientoDto: UpdateAseguramientoDto) {
    return `This action updates a #${id} aseguramiento`;
  }

  remove(id: number) {
    return `This action removes a #${id} aseguramiento`;
  }
}
