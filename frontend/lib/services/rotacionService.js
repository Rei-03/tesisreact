// lib/services/rotacionService.js
import axios from 'axios';
import { apiClient } from "@/lib/api/apiClient";

/**
 * Servicio para gestionar las rotaciones de circuitos
 */

/**
 * Genera una rotación de circuitos
 * @param {Object} datos - Datos de la rotación
 * @param {number} datos.deficitX - MW de déficit a cubrir
 * @param {boolean} datos.soloApagar - Si true, solo apaga. Si false, enciende También
 * @param {string} datos.fecha - Fecha (opcional)
 * @returns {Promise<Object>} Respuesta del servidor con la rotación generada
 */
export const generarRotacion = async (datos = {}) => {
  try {
    console.log("Generando rotación con datos:", datos);
    const response = await apiClient.rotaciones.generar(datos);
    return response.data;
  } catch (error) {
    console.error("Error generando rotación:", error);
    throw error;
  }
};

/**
 * Obtiene el historial de rotaciones
 * @returns {Promise<Array>} Lista de rotaciones
 */
export const obtenerRotaciones = async () => {
  try {
    const response = await apiClient.rotaciones.obtener();
    return response;
  } catch (error) {
    console.error("Error obteniendo rotaciones:", error);
    throw error;
  }
};
