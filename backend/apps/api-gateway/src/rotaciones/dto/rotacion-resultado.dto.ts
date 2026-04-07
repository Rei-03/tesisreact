/**
 * DTO que representa el resultado de una rotación
 */
export class RotacionResultadoDto {
  /**
   * IDs de circuitos a APAGAR (cola de rotación)
   */
  cola: number[];

  /**
   * IDs de circuitos a ENCENDER
   * Array vacío si soloApagar=true
   */
  encendidos: number[];
}
