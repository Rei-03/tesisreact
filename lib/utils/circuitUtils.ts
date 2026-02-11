// lib/utils/circuitUtils.ts
/**
 * Funciones utilitarias para manejo de circuitos
 */

export interface Circuito {
  idCircuitoP: number;
  CircuitoP: string;
  bloque?: string;
  mw?: number;
  apagable?: boolean;
  clientes?: number;
  [key: string]: any;
}

export interface Apertura {
  bloque?: string;
  mw?: number;
  [key: string]: any;
}

/**
 * Filtra circuitos que son apagables
 */
export function filtrarCircuitosApagables(circuitos: Circuito[]): Circuito[] {
  return circuitos.filter((c) => c.apagable === true || c.Apagable === true);
}

/**
 * Ordena circuitos alfabéticamente por nombre
 */
export function ordenarPorNombre(circuitos: Circuito[]): Circuito[] {
  return [...circuitos].sort((a, b) =>
    (a.CircuitoP || "").localeCompare(b.CircuitoP || "")
  );
}

/**
 * Filtra circuitos por bloque específico
 */
export function filtrarPorBloque(
  circuitos: Circuito[],
  bloque: string | null
): Circuito[] {
  if (!bloque) return circuitos;
  return circuitos.filter((c) => c.bloque === bloque);
}

/**
 * Calcula el total de clientes en una lista de circuitos
 */
export function calcularTotalClientes(circuitos: Circuito[]): number {
  return circuitos.reduce((sum, c) => sum + (c.clientes || 0), 0);
}

/**
 * Calcula MW por bloque desde próximas aperturas
 */
export function calcularMWPorBloque(aperturas: Apertura[]): Record<string, number> {
  const mwPorBloque: Record<string, number> = {};

  aperturas.forEach((apertura) => {
    const bloque = apertura.bloque || "Sin Bloque";
    const mw = apertura.mw || 0;
    mwPorBloque[bloque] = (mwPorBloque[bloque] || 0) + mw;
  });

  return mwPorBloque;
}

/**
 * Obtiene los bloques únicos de una lista de circuitos
 */
export function obtenerBloques(circuitos: Circuito[]): string[] {
  const bloques = new Set<string>();
  circuitos.forEach((c) => {
    if (c.bloque) bloques.add(c.bloque);
  });
  return Array.from(bloques).sort();
}

/**
 * Valida si un circuito puede ser apagado
 */
export function puedeSerApagado(circuito: Circuito): boolean {
  return circuito.apagable === true && (circuito.clientes || 0) > 0;
}

/**
 * Calcula el MW total de una lista de circuitos
 */
export function calcularMWTotal(circuitos: Circuito[]): number {
  return circuitos.reduce((sum, c) => sum + (c.mw || 0), 0);
}
