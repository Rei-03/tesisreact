import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { CreateRotacioneDto } from './dto/create-rotacione.dto';
import { UpdateRotacioneDto } from './dto/update-rotacione.dto';
import { AseguramientosRepository } from '../aseguramientos/aseguramientos.repository';

@Injectable()
export class RotacionesService {
  constructor(
    private readonly aseguramientosRepo: AseguramientosRepository,
    @Inject('NatsService') private readonly natsClient: ClientProxy,
  ) {}

  async generate(createRotacioneDto: CreateRotacioneDto) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Obtener aseguramientos de hoy
    const aseguramientos = await this.aseguramientosRepo.findMany({
      select: {},
      where: { fecha: today },
    });

    // Obtener consumo de cada circuito para hoy
    const consumoCircuitos = await firstValueFrom(
      this.natsClient.send('circuitos.findAllWithConsumption', {
        fecha: today.toISOString().split('T')[0],
      }),
    );
    // Por implementar: algoritmo de rotación
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

