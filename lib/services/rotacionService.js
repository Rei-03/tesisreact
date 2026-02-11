// lib/services/rotacionService.js
import { apiClient } from "@/lib/api/apiClient";

/**
 * Servicio para gestionar las rotaciones de circuitos
 */

/**
 * Genera una rotación de circuitos
 * @param {Object} datos - Datos de la rotación
 * @param {Array} datos.circuitos_propuestos - IDs de circuitos a proponer para apagón
 * @param {number} datos.mw_requerido - MW requeridos a apagar
 * @param {number} datos.mw_total - MW total seleccionado
 * @param {number} datos.cantidad_circuitos - Cantidad de circuitos seleccionados
 * @param {string} datos.motivo - Motivo de la rotación (opcional)
 * @returns {Promise<Object>} Respuesta del servidor con la rotación generada
 */
export const generarRotacion = async (datos = {}) => {
  try {
    // TODO: Conectar con el endpoint del backend cuando esté listo
    // endpoint: POST /api/rotaciones/generar
    
    console.log("Generando rotación con datos:", datos);
    
    // Por ahora, solo mostramos un mensaje
    const response = await fetch("/api/rotaciones/generar", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(datos),
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    const resultado = await response.json();
    return resultado;
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
    // TODO: Conectar con el endpoint del backend cuando esté listo
    // endpoint: GET /api/rotaciones
    
    const response = await fetch("/api/rotaciones", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    const datos = await response.json();
    return datos;
  } catch (error) {
    console.error("Error obteniendo rotaciones:", error);
    throw error;
  }
};
