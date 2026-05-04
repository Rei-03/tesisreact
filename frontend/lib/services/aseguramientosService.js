// lib/services/aseguramientosService.js
import { apiClient } from "@/lib/api/apiClient";

/**
 * Servicio para gestionar los aseguramientos de circuitos
 */

/**
 * Obtiene aseguramientos con paginación y filtro de fecha
 * @param {number} page - Número de página (por defecto 1)
 * @param {number} pageSize - Cantidad de registros por página (por defecto 10)
 * @param {string} fecha - Fecha para filtra(r aseguramientos activos en esa fecha (formato ISO)
 * @returns {Promise<Object>} Respuesta del servidor con lista paginada de aseguramientos
 */
export const obtenerAseguramientos = async (page = 1, pageSize = 10, fecha = undefined) => {
  try {
    const response = await apiClient.aseguramientos.getAll(page, pageSize, fecha);
    return response;
  } catch (error) {
    console.error("Error obteniendo aseguramientos:", error);
    throw error;
  }
};

/**
 * Obtiene aseguramientos filtrados por una fecha específica
 * @param {string} fecha - Fecha en formato ISO (YYYY-MM-DD)
 * @param {number} page - Número de página (por defecto 1)
 * @param {number} pageSize - Cantidad de registros por página (por defecto 10)
 * @returns {Promise<Object>} Respuesta del servidor con aseguramientos para esa fecha
 */
export const obtenerAseguramientosPorFecha = async (fecha, page = 1, pageSize = 10) => {
  try {
    const response = await apiClient.aseguramientos.getByFecha(fecha, page, pageSize);
    return response;
  } catch (error) {
    console.error("Error obteniendo aseguramientos por fecha:", error);
    throw error;
  }
};

/**
 * Crea un nuevo aseguramiento
 * @param {Object} datos - Datos del aseguramiento
 * @param {number} datos.id_CircuitoP - ID del circuito
 * @param {string} datos.CircuitoP - Nombre del circuito
 * @param {Date} datos.fechaInicial - Fecha inicial del aseguramiento
 * @param {Date} datos.fechaFinal - Fecha final del aseguramiento
 * @param {string} datos.Observaciones - Observaciones
 * @param {number} datos.mw - MW afectados
 * @param {string} datos.tipo - Tipo de aseguramiento (Programado, Emergencia, Preventivo)
 * @returns {Promise<Object>} Respuesta del servidor con el aseguramiento creado
 */
export const crearAseguramiento = async (datos) => {
  try {
    console.log("Creando aseguramiento con datos:", datos);
    const response = await apiClient.aseguramientos.create(datos);
    return response;
  } catch (error) {
    console.error("Error creando aseguramiento:", error);
    throw error;
  }
};

/**
 * Actualiza un aseguramiento existente
 * @param {number} id - ID del aseguramiento a actualizar
 * @param {Object} datos - Datos a actualizar
 * @returns {Promise<Object>} Respuesta del servidor con el aseguramiento actualizado
 */
export const actualizarAseguramiento = async (id, datos) => {
  try {
    const response = await apiClient.aseguramientos.update(id, datos);
    return response;
  } catch (error) {
    console.error("Error actualizando aseguramiento:", error);
    throw error;
  }
};

/**
 * Elimina un aseguramiento
 * @param {number} id - ID del aseguramiento a eliminar
 * @returns {Promise<Object>} Respuesta del servidor
 */
export const eliminarAseguramiento = async (id) => {
  try {
    const response = await apiClient.aseguramientos.delete(id);
    return response;
  } catch (error) {
    console.error("Error eliminando aseguramiento:", error);
    throw error;
  }
};
