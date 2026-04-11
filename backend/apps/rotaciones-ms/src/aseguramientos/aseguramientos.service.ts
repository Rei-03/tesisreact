import { Injectable } from '@nestjs/common';
import { CreateAseguramientoDto } from './dto/create-aseguramiento.dto';
import { UpdateAseguramientoDto } from './dto/update-aseguramiento.dto';
import { AseguramientosRepository } from './aseguramientos.repository';

@Injectable()
export class AseguramientosService {
  constructor(private readonly aseguramientosRepo: AseguramientosRepository) { }
  create(createAseguramientoDto: CreateAseguramientoDto) {
    return 'This action adds a new aseguramiento';
  }

  async findAll(take?: number, skip?: number, fecha?: string) {
    const defaultFecha = fecha || new Date('2024-05-30 05:00:00.000').toISOString();
    const { records, total } = await this.aseguramientosRepo.findMany({ 
      select: {}, 
      where: { fecha: new Date(defaultFecha) },
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
