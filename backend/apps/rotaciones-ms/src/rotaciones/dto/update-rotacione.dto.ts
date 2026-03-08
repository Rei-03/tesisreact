import { PartialType } from '@nestjs/mapped-types';
import { CreateRotacioneDto } from './create-rotacione.dto';

export class UpdateRotacioneDto extends PartialType(CreateRotacioneDto) {}
