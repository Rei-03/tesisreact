/**
 * Información de un circuito en la rotación
 */
export interface CircuitoRotacion {
  id: number;
  numero: string;
  nombre: string;
}

/**
 * DTO que representa el resultado del algoritmo de rotación de energía
 */
export class RotacionResultadoDto {
  /**
   * Lista de objetos con información del circuito que está en cola de apagado
   */
  cola: CircuitoRotacion[];

  /**
   * Lista de objetos con información del circuito que deben ser encendidos ahora
   */
  encendidos: CircuitoRotacion[];

  constructor(cola: CircuitoRotacion[], encendidos: CircuitoRotacion[]) {
    this.cola = cola;
    this.encendidos = encendidos;
  }
}
