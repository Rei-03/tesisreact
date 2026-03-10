import { Type } from 'class-transformer'
import { IsNumber, IsPositive, IsSemVer, IsString, Min } from 'class-validator'

export class CreateAseguramientoDto {
    @IsNumber()
    @Min(0)
    id_CircuitoP: number
    
    @IsString()
    circuitoP: string
    
    @Type(() => Date)
    fechaInicial: Date

    @Type(() => Date)
    fechaFinal: Date
    
    @IsString()
    observaciones: string
    
    @IsString()
    tipo: string
    
    @IsNumber()
    @Min(0)
    mw: number
}
