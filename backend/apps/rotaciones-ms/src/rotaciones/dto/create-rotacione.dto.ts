/**
 * DTO para solicitar generación de rotación de energía
 * 
 * El servicio obtiene:
 * - Circuitos con consumo desde circuitos-ms
 * - Apagones históricos desde circuitos-ms
 * - Aseguramientos desde aseguramientos-ms
 * - Crea cola NUEVA cada vez basándose en estado actual
 */
export class CreateRotacioneDto {
  /**
   * Déficit de potencia en MW que debe ser cubierto
   * Ejemplo: 50 (para cubrir 50 MW de falta)
   */
  deficitX!: number;

  /**
   * Fecha de referencia para obtener consumos
   * Si no se proporciona, usa la fecha actual
   */
  fecha?: Date;

  /**
   * Si es true: solo apaga circuitos para cubrir el déficit
   * Si es false (default): también enciende circuitos FIFO
   * 
   * IMPORTANTE: Si enciendes circuitos, su consumo se suma al déficit
   * Ejemplo: déficit 50 MW + encender 2 circuitos (30 MW total)
   *          → déficit efectivo = 80 MW (necesita apagar más)
   */
  soloApagar?: boolean;
}
