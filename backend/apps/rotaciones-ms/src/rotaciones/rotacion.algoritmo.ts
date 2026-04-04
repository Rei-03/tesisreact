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
   * Calcula el peso para decisión de apagado
   * Fórmula: (tiempoEncendido * 0.8) + (consumoActual * 0.2)
   * 
   * @param circuito Circuito con tiempo calculado
   * @returns Peso de apagado
   */
  private static calcularPesoApagado(circuito: CircuitoConPeso): number {
    return circuito.tiempoEncendidoMinutos * 0.8 +
      circuito.consumo.mw * 0.2;
  }

  /**
   * Selecciona circuitos para apagar hasta cubrir el déficit
   * Priorización: peso (tiempo 0.8 + consumo 0.2)
   * 
   * @param circuitos Circuitos disponibles para apagar (encendidos, no protegidos)
   * @param deficitX Déficit de potencia a cubrir en MW
   * @returns Objeto con circuitos seleccionados y consumo total
   */
  private static seleccionarCircuitosApagar(
    circuitos: CircuitoConPeso[],
    deficitX: number,
  ): { seleccionados: CircuitoConPeso[]; consumoTotal: number } {
    // Filtrar solo encendidos y calcular peso
    const encendidosConPeso = circuitos
      .filter((c) => c.estado === 'encendido')
      .map((c) => ({
        ...c,
        pesoApagado: this.calcularPesoApagado(c),
      }));

    // Ordenar por peso (mayor primero - más tiempo encendido = prioridad)
    const ordenados = encendidosConPeso.sort(
      (a, b) => (b.pesoApagado ?? 0) - (a.pesoApagado ?? 0),
    );

    // Seleccionar secuencialmente hasta cubrir déficit
    let consumoAcumulado = 0;
    const seleccionados = ordenados.filter((c) => {
      if (consumoAcumulado >= deficitX) {
        return false; // Ya cubrimos el déficit
      }
      consumoAcumulado += c.consumo.mw;
      return true;
    });

    return {
      seleccionados,
      consumoTotal: consumoAcumulado,
    };
  }

  /**
   * Selecciona circuitos para encender siguiendo lógica FIFO
   * Priorización estricta a circuitos que llevan más tiempo apagados
   * 
   * @param circuitos Circuitos disponibles para encender (apagados)
   * @param colaActual Cola actual de apagados (para orden FIFO)
   * @returns Circuitos a encender ordenados por FIFO
   */
  private static seleccionarCircuitosEncender(
    circuitos: CircuitoConPeso[],
    colaActual: string[] = [],
  ): CircuitoConPeso[] {
    // Filtrar solo apagados y agregar posición en cola
    const apagadosConPosicion = circuitos
      .filter((c) => c.estado === 'apagado')
      .map((c) => ({
        ...c,
        posicionCola: colaActual.indexOf(c.idCircuitoP.toString()),
      }));

    // Ordenar por tiempo apagado (FIFO - el primero en la cola sale primero)
    // Secundariamente, ordenar por ID para determinismo
    const ordenados = apagadosConPosicion.sort((a, b) => {
      // Los que están en cola van primero, por orden de cola
      const aPosicion = a.posicionCola ?? Infinity;
      const bPosicion = b.posicionCola ?? Infinity;

      if (aPosicion !== bPosicion) {
        return aPosicion - bPosicion; // Orden de cola
      }

      // Si no está en cola, ordenar por tiempo apagado (más tiempo = primero)
      if (aPosicion === Infinity && bPosicion === Infinity) {
        return b.tiempoApagadoMinutos - a.tiempoApagadoMinutos;
      }

      return 0;
    });

    return ordenados;
  }

  /**
   * Actualiza la cola de apagados con nuevos apagados y removiendo encendidos
   * 
   * @param colaActual Cola actual
   * @param nuevosApagados IDs de circuitos nuevamente apagados
   * @param aEncender IDs de circuitos a encender (remover de cola)
   * @returns Nueva cola actualizada
   */
  private static actualizarCola(
    colaActual: string[] = [],
    nuevosApagados: string[],
    aEncender: string[],
  ): string[] {
    // Remover IDs que se encenderán
    const colaSinEncendidos = colaActual.filter(
      (id) => !aEncender.includes(id),
    );

    // Agregar nuevos apagados al final
    return [...colaSinEncendidos, ...nuevosApagados];
  }

  /**
   * Algoritmo principal de rotación de energía
   * 
   * Lógica:
   * 1. Si NO soloApagar: selecciona circuitos a encender FIFO
   *    - Calcula su consumo total
   *    - SUMA ese consumo al déficit (porque ahora consumen)
   * 2. Selecciona circuitos a apagar priorizando por tiempo + consumo
   *    - Debe cubrir: déficitOriginal + consumoEncendidos
   * 3. Actualiza cola manteniendo integridad
   * 
   * @param circuitos Circuitos disponibles (ya filtrados sin protegidos)
   * @param deficitX Déficit de potencia a cubrir en MW
   * @param soloApagar Si true, solo apaga (no enciende)
   * @param colaActual Cola actual de apagados (para FIFO)
   * @returns Resultado con cola actualizada e IDs de circuitos a encender
   */
  public static ejecutar(
    circuitos: Circuito[],
    deficitX: number,
    soloApagar: boolean = false,
    colaActual: string[] = [],
  ): ResultadoRotacion {
    // Validaciones iniciales
    if (!Array.isArray(circuitos) || circuitos.length === 0) {
      return { cola: colaActual, encendidos: [] };
    }

    if (deficitX < 0) {
      throw new Error('El déficit de potencia no puede ser negativo');
    }

    // Enriquecer circuitos con tiempos calculados
    const circuitosEnriquecidos = this.enriquecerCircuitos(circuitos);

    // Fase 1: Seleccionar circuitos a ENCENDER (si no soloApagar)
    let aEncender: CircuitoConPeso[] = [];
    let consumoEncendidos = 0;

    if (!soloApagar) {
      aEncender = this.seleccionarCircuitosEncender(
        circuitosEnriquecidos,
        colaActual,
      );
      
      // Calcular consumo total de los que vamos a encender
      consumoEncendidos = aEncender.reduce((sum, c) => sum + c.consumo.mw, 0);
    }

    // Fase 2: Calcular déficit AUMENTADO
    // Si enciendes circuitos, su consumo se suma al déficit
    // Porque ahora esos circuitos consumen de la alimentación
    const deficitAumentado = deficitX + consumoEncendidos;

    // Fase 3: Seleccionar circuitos a APAGAR basándose en déficit aumentado
    const { seleccionados: aApagar } = this.seleccionarCircuitosApagar(
      circuitosEnriquecidos,
      deficitAumentado,
    );

    // Extraer IDs
    const idsApagar = aApagar.map((c) => c.idCircuitoP.toString());
    const idsEncender = aEncender.map((c) => c.idCircuitoP.toString());

    // Actualizar cola
    const colaNueva = this.actualizarCola(
      colaActual,
      idsApagar,
      idsEncender,
    );

    return {
      cola: colaNueva,
      encendidos: idsEncender,
    };
  }
}
