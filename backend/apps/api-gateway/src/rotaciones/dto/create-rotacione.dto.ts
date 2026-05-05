import { Type } from "class-transformer";
import { IsNumber, IsOptional } from "class-validator";

export class CreateRotacioneDto {
	@IsNumber()
	deficitX!: number;

	@Type(() => Date)
	@IsOptional()
	fecha?: Date;

	@IsNumber()
	@IsOptional()
	circuitosAEncender?: number;

	@IsNumber()
	@IsOptional()
	soloApagar?: boolean;
}
