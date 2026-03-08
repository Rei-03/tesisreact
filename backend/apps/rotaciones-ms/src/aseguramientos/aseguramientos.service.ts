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

  findAll() {
    return this.aseguramientosRepo.findMany({ select: {}, where: { fecha: new Date('2024-05-30 05:00:00.000') } });
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
