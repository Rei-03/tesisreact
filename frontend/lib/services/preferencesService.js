// lib/services/preferencesService.js

import axiosInstance from '../api/apiClient';

/**
 * Servicio para gestionar preferencias de usuario y sistema
 */

const PREFERENCIAS_DEFAULT = {
  tema: "light", // light o dark
  idioma: "es", // es, en
  zonaHoraria: "America/Havana",
  formatoFecha: "DD/MM/YYYY",
};

/**
 * Obtiene las preferencias del usuario actual
 * @param {string} usuarioId - ID del usuario
 * @returns {Promise<Object>} Preferencias guardadas
 */
export const obtenerPreferencias = async (usuarioId) => {
  try {
    const response = await axiosInstance.get(`/auth/users/${usuarioId}/preferences`);
    return response.data?.data || PREFERENCIAS_DEFAULT;
  } catch (error) {
    console.error("Error obteniendo preferencias:", error);
    return PREFERENCIAS_DEFAULT;
  }
};

/**
 * Guarda las preferencias del usuario
 * @param {string} usuarioId - ID del usuario
 * @param {Object} preferencias - Preferencias a guardar
 * @returns {Promise<Object>} Preferencias guardadas
 */
export const guardarPreferencias = async (usuarioId, preferencias) => {
  try {
    const response = await axiosInstance.put(
      `/auth/users/${usuarioId}/preferences`,
      preferencias
    );
    return response.data?.data || preferencias;
  } catch (error) {
    console.error("Error guardando preferencias:", error);
    throw error;
  }
};

/**
 * Cambia la contraseña del usuario
 * @param {string} usuarioId - ID del usuario
 * @param {string} passwordActual - Contraseña actual
 * @param {string} passwordNueva - Nueva contraseña
 * @returns {Promise<Object>} Confirmación
 */
export const cambiarContrasena = async (usuarioId, passwordActual, passwordNueva) => {
  try {
    const response = await axiosInstance.post('/auth/change-password', {
      usuarioId,
      passwordActual,
      passwordNueva,
    });
    
    if (response.data.success) {
      return response.data.data || { message: "Contraseña actualizada exitosamente" };
    }
    throw new Error(response.data.message || "Error al cambiar contraseña");
  } catch (error) {
    console.error("Error cambiando contraseña:", error);
    throw error;
  }
};

/**
 * Actualiza el perfil del usuario
 * @param {string} usuarioId - ID del usuario
 * @param {Object} datos - Datos a actualizar (nombre, etc.)
 * @returns {Promise<Object>} Usuario actualizado
 */
export const actualizarPerfil = async (usuarioId, datos) => {
  try {
    const response = await axiosInstance.put(`/auth/users/${usuarioId}`, datos);
    
    if (response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.message || "Error al actualizar perfil");
  } catch (error) {
    console.error("Error actualizando perfil:", error);
    throw error;
  }
};

/**
 * Obtiene información del sistema
 * @returns {Promise<Object>} Información del sistema
 */
export const obtenerInfoSistema = async () => {
  try {
    const response = await axiosInstance.get('/system/info');
    
    return response.data?.data || {
      version: "1.0.0",
      buildDate: new Date().toISOString(),
      ambiente: "Producción",
      apiStatus: "Online",
      apiUrl: "http://localhost:3000",
      baseUrl: typeof window !== "undefined" ? window.location.origin : "N/A",
      navegador: typeof navigator !== "undefined" ? navigator.userAgent : "N/A",
      ultimaActualizacion: new Date().toLocaleString("es-ES"),
    };
  } catch (error) {
    console.error("Error obteniendo info del sistema:", error);
    return {
      version: "1.0.0",
      buildDate: new Date().toISOString(),
      ambiente: "Producción",
      apiStatus: "Offline",
      apiUrl: "http://localhost:3000",
      baseUrl: typeof window !== "undefined" ? window.location.origin : "N/A",
      navegador: typeof navigator !== "undefined" ? navigator.userAgent : "N/A",
      ultimaActualizacion: new Date().toLocaleString("es-ES"),
    };
  }
};
