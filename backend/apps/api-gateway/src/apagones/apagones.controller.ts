import { Controller, Get, Inject, Query } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Controller('/apagones')
export class ApagonesController {
  constructor(@Inject('NatsService') private readonly client: ClientProxy) {}

  @Get()
  findAll(
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    const pageNum = page ? Number(page) : 1;
    const pageSizeNum = pageSize ? Number(pageSize) : 20;
    return firstValueFrom(
      this.client.send('apagones.findAll', {
        page: pageNum,
        pageSize: pageSizeNum,
      })
    );
  }

  @Get(':id')
  findById(@Query('id') id?: string) {
    return firstValueFrom(
      this.client.send('apagones.findById', { 
        idApagon: parseInt(id || '0') 
      })
    );
  }
}
