/**
 * Información de un circuito en la rotación
 */
export interface CircuitoRotacion {
  id: number;
  numero: string;
  nombre: string;
}

/**
 * DTO que representa el resultado de una rotación
 */
export class RotacionResultadoDto {
  /**
   * Circuitos a APAGAR (cola de rotación)
   */
  cola: CircuitoRotacion[];

  /**
   * Circuitos a ENCENDER
   * Array vacío si soloApagar=true
   */
  encendidos: CircuitoRotacion[];
}
