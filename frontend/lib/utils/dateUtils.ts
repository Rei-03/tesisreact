// lib/utils/dateUtils.ts
/**
 * Funciones utilitarias para manejo de fechas
 */

/**
 * Obtiene la fecha actual en formato YYYY-MM-DD
 */
export function getToday(): string {
  const today = new Date();
  return today.toISOString().split("T")[0];
}

/**
 * Formatea una fecha para display en español (DD/MM/YYYY)
 */
export function formatDateDisplay(date: Date | string): string {
  if (!date) return "";

  const dateObj = typeof date === "string" ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) {
    return "";
  }

  const day = String(dateObj.getDate()).padStart(2, "0");
  const month = String(dateObj.getMonth() + 1).padStart(2, "0");
  const year = dateObj.getFullYear();

  return `${day}/${month}/${year}`;
}

/**
 * Formatea una fecha con hora para display (DD/MM/YYYY HH:mm)
 */
export function formatDateTimeDisplay(date: Date | string): string {
  if (!date) return "";

  const dateObj = typeof date === "string" ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) {
    return "";
  }

  const day = String(dateObj.getDate()).padStart(2, "0");
  const month = String(dateObj.getMonth() + 1).padStart(2, "0");
  const year = dateObj.getFullYear();
  const hours = String(dateObj.getHours()).padStart(2, "0");
  const minutes = String(dateObj.getMinutes()).padStart(2, "0");

  return `${day}/${month}/${year} ${hours}:${minutes}`;
}

/**
 * Convierte string YYYY-MM-DD a formato display DD/MM/YYYY
 */
export function formatISODateDisplay(isoString: string): string {
  if (!isoString) return "";
  const date = new Date(isoString);
  return formatDateDisplay(date);
}

/**
 * Obtiene el número de días entre dos fechas
 */
export function diasEntre(fecha1: Date | string, fecha2: Date | string): number {
  const date1 = typeof fecha1 === "string" ? new Date(fecha1) : fecha1;
  const date2 = typeof fecha2 === "string" ? new Date(fecha2) : fecha2;

  const milisegundosPorDia = 1000 * 60 * 60 * 24;
  const diferencia = Math.abs(date2.getTime() - date1.getTime());

  return Math.floor(diferencia / milisegundosPorDia);
}

/**
 * Verifica si una fecha es pasada
 */
export function esFechaPasada(fecha: Date | string): boolean {
  const fechaObj = typeof fecha === "string" ? new Date(fecha) : fecha;
  return fechaObj < new Date();
}

/**
 * Verifica si una fecha es hoy
 */
export function esFechaHoy(fecha: Date | string): boolean {
  const fechaObj = typeof fecha === "string" ? new Date(fecha) : fecha;
  const hoy = new Date();

  return (
    fechaObj.getDate() === hoy.getDate() &&
    fechaObj.getMonth() === hoy.getMonth() &&
    fechaObj.getFullYear() === hoy.getFullYear()
  );
}

/**
 * Suma días a una fecha
 */
export function sumarDias(fecha: Date | string, dias: number): Date {
  const fechaObj = typeof fecha === "string" ? new Date(fecha) : new Date(fecha);
  fechaObj.setDate(fechaObj.getDate() + dias);
  return fechaObj;
}

/**
 * Obtiene el inicio del día (00:00:00)
 */
export function getInicioDia(fecha: Date | string): Date {
  const fechaObj = typeof fecha === "string" ? new Date(fecha) : new Date(fecha);
  fechaObj.setHours(0, 0, 0, 0);
  return fechaObj;
}

/**
 * Obtiene el fin del día (23:59:59)
 */
export function getFinDia(fecha: Date | string): Date {
  const fechaObj = typeof fecha === "string" ? new Date(fecha) : new Date(fecha);
  fechaObj.setHours(23, 59, 59, 999);
  return fechaObj;
}
