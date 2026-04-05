import { Type } from "class-transformer";
import { IsBoolean, IsNumber, IsString } from "class-validator";

export class CreateRotacioneDto {
	@IsNumber()
	deficitX!: number;

	@Type(() => Date)
  fecha?: Date;

	@IsBoolean()
  soloApagar?: boolean;
}
