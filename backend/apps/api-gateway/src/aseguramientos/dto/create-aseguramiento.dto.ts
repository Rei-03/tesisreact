import { Type } from 'class-transformer'
import { IsNumber, IsOptional, IsString, Min } from 'class-validator'

export class CreateAseguramientoDto {
    @IsNumber()
    @Min(0)
    id_CircuitoP: number
    
    @IsString()
    CircuitoP: string
    
    @Type(() => Date)
    fechaInicial: Date

    @Type(() => Date)
    fechaFinal: Date
    
    @IsString()
    Observaciones: string
    
    @IsString()
    tipo: string
    
    @IsNumber()
    @IsOptional()
    mw?: number
}
