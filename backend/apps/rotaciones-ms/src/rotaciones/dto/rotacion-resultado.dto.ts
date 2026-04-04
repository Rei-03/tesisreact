import { ResultadoRotacion } from '../interfaces/circuito.interface';

/**
 * DTO que representa el resultado del algoritmo de rotación de energía
 */
export class RotacionResultadoDto implements ResultadoRotacion {
  /**
   * Lista de IDs de circuitos que están en cola de apagado
   * (entrando o ya en estado apagado)
   */
  cola: string[];

  /**
   * Lista de IDs de circuitos que deben ser encendidos ahora
   */
  encendidos: string[];

  constructor(resultado: ResultadoRotacion) {
    this.cola = resultado.cola;
    this.encendidos = resultado.encendidos;
  }
}
