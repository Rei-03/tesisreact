import {
  Circuito,
  CircuitoConPeso,
  ResultadoRotacion,
} from './interfaces/circuito.interface';

/**
 * Servicio puramente funcional para algoritmo de rotación de energía
 * 
 * Principios:
 * - Usa map, filter, sort (no loops imperativos)
 * - Immutable (no modifica datos de entrada)
 * - Determinista (mismo input = mismo output)
 * - Sin efectos secundarios
 */
export class RotacionAlgoritmo {
  /**
   * Calcula el tiempo transcurrido en minutos desde una fecha
   * @param fecha Fecha de referencia
   * @param ahora Fecha actual (por defecto Date.now())
   * @returns Tiempo en minutos
   */
  private static calcularMinutosTranscurridos(
    fecha: Date,
    ahora: Date = new Date(),
  ): number {
    const ms = ahora.getTime() - fecha.getTime();
    return Math.max(0, Math.floor(ms / 60000)); // Evita negativos
  }

  /**
   * Enriquece circuitos con información de peso y tiempo
   * @param circuitos Lista de circuitos
   * @param ahora Fecha actual (por defecto Date.now())
   * @returns Circuitos enriquecidos con tiempos y pesos
   */
  private static enriquecerCircuitos(
    circuitos: Circuito[],
    ahora: Date = new Date(),
  ): CircuitoConPeso[] {
    return circuitos.map((c) => ({
      ...c,
      tiempoEncendidoMinutos:
        c.estado === 'encendido'
          ? this.calcularMinutosTranscurridos(c.ultimoCambioEstado, ahora)
          : 0,
      tiempoApagadoMinutos:
        c.estado === 'apagado'
          ? this.calcularMinutosTranscurridos(c.ultimoCambioEstado, ahora)
          : 0,
    }));
  }



  /**
   * Algoritmo principal de rotación de energía (MODIFICADO)
   * 
   * Nueva Lógica:
   * 1. PRIMERO: Quitar de apagados `circuitosAEncender` circuitos (los que llevan más tiempo apagado)
   *    - Marcarlos como "encendidos"
   * 2. SEGUNDO: Considerar el resto de apagados
   *    - Si consumo de encendidos >= déficit: Marcar también para encender el resto que llevan más tiempo apagado
   * 3. TERCERO: Si no se cumple déficit con apagados
   *    - Apagar los circuitos que llevan más tiempo encendidos hasta cumplir el déficit
   * 
   * @param circuitos Circuitos disponibles (ya filtrados sin protegidos)
   * @param deficitX Déficit de potencia a cubrir en MW
   * @param debeEncender Si true, puede encender circuitos
   * @param colaActual Cola actual de apagados (no se usa actualmente)
   * @param circuitosAEncender Cantidad de circuitos a encender solicitados
   * @returns Resultado con IDs de apagados, encendidos y placeholder para mantenidos
   */
  public static ejecutar(
    circuitos: Circuito[],
    deficitX: number,
    debeEncender: boolean = false,
    colaActual: string[] = [],
    circuitosAEncender: number = 0,
  ): ResultadoRotacion {
    // Validaciones iniciales
    if (!Array.isArray(circuitos) || circuitos.length === 0) {
      return { apagados: [], encendidos: [] };
    }

    if (deficitX < 0) {
      throw new Error('El déficit de potencia no puede ser negativo');
    }

    // Enriquecer circuitos con tiempos calculados
    const circuitosEnriquecidos = this.enriquecerCircuitos(circuitos);

    // Separar circuitos por estado
    const apagados = circuitosEnriquecidos.filter((c) => c.estado === 'apagado');
    const encendidosDisponibles = circuitosEnriquecidos.filter(
      (c) => c.estado === 'encendido',
    );

    let aEncender: CircuitoConPeso[] = [];
    let aApagar: CircuitoConPeso[] = [];

    // Fase 1: Si debeEncender, quitar primero `circuitosAEncender` de apagados (los que llevan más tiempo apagado)
    if (debeEncender && circuitosAEncender > 0) {
      // Ordenar apagados por tiempo apagado DESCENDENTE (más tiempo = primero)
      const apagadosOrdenados = apagados.sort(
        (a, b) => b.tiempoApagadoMinutos - a.tiempoApagadoMinutos,
      );

      // Tomar los primeros `circuitosAEncender` para encender
      const primerosAEncender = apagadosOrdenados.slice(0, circuitosAEncender);
      const restoApagados = apagadosOrdenados.slice(circuitosAEncender);

      aEncender = primerosAEncender;
      const consumoEncendidos = aEncender.reduce((sum, c) => sum + c.consumo.mw, 0);

      // Fase 2: Si consumo de encendidos >= déficit, encender el resto de apagados también
      if (consumoEncendidos >= deficitX) {
        // Ordenar resto por tiempo apagado DESCENDENTE
        const restoOrdenado = restoApagados.sort(
          (a, b) => b.tiempoApagadoMinutos - a.tiempoApagadoMinutos,
        );
        aEncender = [...aEncender, ...restoOrdenado];
      } else {
        // Fase 3: Si no se cumple déficit, apagar circuitos que llevan más tiempo encendidos
        const deficitFaltante = deficitX - consumoEncendidos;

        // Ordenar encendidos por tiempo encendido DESCENDENTE (más tiempo = primero)
        const encendidosOrdenados = encendidosDisponibles.sort(
          (a, b) => b.tiempoEncendidoMinutos - a.tiempoEncendidoMinutos,
        );

        // Seleccionar secuencialmente hasta cubrir déficit faltante
        let consumoAcumulado = 0;
        aApagar = encendidosOrdenados.filter((c) => {
          if (consumoAcumulado >= deficitFaltante) {
            return false; // Ya cubrimos el déficit
          }
          consumoAcumulado += c.consumo.mw;
          return true;
        });
      }
    }

    // Extraer IDs
    const idsApagar = aApagar.map((c) => c.idCircuitoP.toString());
    const idsEncender = aEncender.map((c) => c.idCircuitoP.toString());

    return {
      apagados: idsApagar,
      encendidos: idsEncender,
      mantenidos: [], // Se calcula en el service
    };
  }
}
