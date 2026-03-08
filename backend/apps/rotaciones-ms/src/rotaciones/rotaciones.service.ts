import { Injectable } from '@nestjs/common';
import { CreateRotacioneDto } from './dto/create-rotacione.dto';
import { UpdateRotacioneDto } from './dto/update-rotacione.dto';

@Injectable()
export class RotacionesService {
  create(createRotacioneDto: CreateRotacioneDto) {
    return 'This action adds a new rotacione';
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
