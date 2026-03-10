import { PartialType } from '@nestjs/mapped-types';
import { CreateAseguramientoDto } from './create-aseguramiento.dto';

export class UpdateAseguramientoDto extends PartialType(CreateAseguramientoDto) {}
