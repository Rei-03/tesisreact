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
   * Algoritmo principal de rotación de energía (v5)
   * 
   * Lógica:
   * 1. Separar circuitos a encender obligatorios (si hay)
   * 
   * 2. Con apagados restantes, sumar consumo hasta cumplir deficitX:
   *    - Circuitos sumados hasta cumplir → MANTENIDOS
   *    - Resto que sobran → AENCENDER
   * 
   * 3. Si consumo total de apagados < déficit:
   *    - Sumar encendidos (ordenados por mayor tiempo encendido) hasta cubrir déficit
   *    - Los necesarios → AAPAGAR
   *    - El resto se mantiene encendido
   *    - Los apagados sobrantes NO se encienden
   * 
   * @param circuitos Circuitos disponibles (ya filtrados sin protegidos)
   * @param deficitX Déficit de potencia a cubrir en MW
   * @param circuitosAEncender Cantidad de circuitos a encender obligatoriamente
   * @returns Resultado con IDs de apagados, encendidos, mantenidos
   */
  public static ejecutar(
    circuitos: Circuito[],
    deficitX: number,
    circuitosAEncender: number = 0,
  ): ResultadoRotacion {
    if (!Array.isArray(circuitos) || circuitos.length === 0) {
      return { apagados: [], encendidos: [], mantenidos: [] };
    }

    if (deficitX < 0) {
      throw new Error('El déficit de potencia no puede ser negativo');
    }

    const circuitosEnriquecidos = this.enriquecerCircuitos(circuitos);

    const apagados = circuitosEnriquecidos.filter((c) => c.estado === 'apagado');
    const encendidosDisponibles = circuitosEnriquecidos.filter(
      (c) => c.estado === 'encendido',
    );

    // Paso 1: Separar obligatorios a encender
    let aEncenderObligatorios: CircuitoConPeso[] = [];
    let apagadosRestantes: CircuitoConPeso[] = apagados;

    if (circuitosAEncender > 0) {
      const apagadosOrdenados = apagados.sort(
        (a, b) => b.tiempoApagadoMinutos - a.tiempoApagadoMinutos,
      );
      aEncenderObligatorios = apagadosOrdenados.slice(0, circuitosAEncender);
      apagadosRestantes = apagadosOrdenados.slice(circuitosAEncender);
    }

    // Paso 2: Sumar apagados restantes hasta cumplir déficit
    let mantenidos: CircuitoConPeso[] = [];
    let aEncenderAdicionales: CircuitoConPeso[] = [];
    let consumoAcumulado = 0;
    let indiceCumplimiento = -1;

    for (let i = 0; i < apagadosRestantes.length; i++) {
      const circuito = apagadosRestantes[i];
      mantenidos.push(circuito);
      consumoAcumulado += circuito.consumo.mw;

      // Registrar en qué índice se cumple el déficit
      if (consumoAcumulado >= deficitX && indiceCumplimiento === -1) {
        indiceCumplimiento = i;
      }
    }

    // Si cubrimos el déficit con apagados, el resto se enciende
    if (indiceCumplimiento !== -1) {
      aEncenderAdicionales = apagadosRestantes.slice(indiceCumplimiento + 1);
      mantenidos = apagadosRestantes.slice(0, indiceCumplimiento + 1);
    }

    // Paso 3: Si no cubrimos con apagados, apagar encendidos
    let aApagar: CircuitoConPeso[] = [];
    if (consumoAcumulado < deficitX) {
      const deficitPendiente = deficitX - consumoAcumulado;
      const encendidosOrdenados = encendidosDisponibles.sort(
        (a, b) => b.tiempoEncendidoMinutos - a.tiempoEncendidoMinutos,
      );

      let consumoEncendidos = 0;
      for (const circuito of encendidosOrdenados) {
        if (consumoEncendidos >= deficitPendiente) {
          break;
        }
        aApagar.push(circuito);
        consumoEncendidos += circuito.consumo.mw;
      }

      // Los apagados restantes NO se encienden en este caso
      aEncenderAdicionales = [];
    }

    // Convertir a IDs
    const idsApagar = aApagar.map((c) => c.idCircuitoP.toString());
    const idsEncender = [
      ...aEncenderObligatorios,
      ...aEncenderAdicionales,
    ].map((c) => c.idCircuitoP.toString());
    const idsMantenidos = mantenidos.map((c) => c.idCircuitoP.toString());

    return {
      apagados: idsApagar,
      encendidos: idsEncender,
      mantenidos: idsMantenidos,
    };
  }
}
