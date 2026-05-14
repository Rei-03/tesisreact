import { Type } from 'class-transformer'
import { IsNumber, IsOptional, IsString, Min, IsISO8601 } from 'class-validator'

export class CreateAseguramientoDto {
    @IsNumber()
    @Min(0)
    id_CircuitoP: number
    
    @IsString()
    CircuitoP: string
    
    @IsISO8601()
    fechaInicial: string

    @IsISO8601()
    fechaFinal: string
    
    @IsString()
    Observaciones: string
    
    @IsString()
    tipo: string
    
    @IsNumber()
    @IsOptional()
    mw?: number
}
