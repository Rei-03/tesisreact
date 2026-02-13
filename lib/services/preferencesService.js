// lib/services/preferencesService.js

/**
 * Servicio para gestionar preferencias de usuario y sistema
 * MODO DEMO: Usa localStorage
 */

const PREFERENCIAS_DEFAULT = {
  tema: "light", // light o dark
  idioma: "es", // es, en
  zonaHoraria: "America/Havana",
  formatoFecha: "DD/MM/YYYY",
};

/**
 * Obtiene las preferencias del usuario actual
 * @param {number} usuarioId - ID del usuario
 * @returns {Promise<Object>} Preferencias guardadas
 */
export const obtenerPreferencias = async (usuarioId) => {
  try {
    await new Promise((r) => setTimeout(r, 200));
    const stored = localStorage.getItem(`preferencias_${usuarioId}`);
    
    if (stored) {
      return JSON.parse(stored);
    }
    
    // Si no hay preferencias guardadas, usar las default
    localStorage.setItem(`preferencias_${usuarioId}`, JSON.stringify(PREFERENCIAS_DEFAULT));
    return PREFERENCIAS_DEFAULT;
  } catch (e) {
    console.error("Error obteniendo preferencias:", e);
    return PREFERENCIAS_DEFAULT;
  }
};

/**
 * Guarda las preferencias del usuario
 * @param {number} usuarioId - ID del usuario
 * @param {Object} preferencias - Preferencias a guardar
 * @returns {Promise<Object>} Preferencias guardadas
 */
export const guardarPreferencias = async (usuarioId, preferencias) => {
  try {
    await new Promise((r) => setTimeout(r, 300));
    localStorage.setItem(`preferencias_${usuarioId}`, JSON.stringify(preferencias));
    return preferencias;
  } catch (e) {
    console.error("Error guardando preferencias:", e);
    throw e;
  }
};

/**
 * Cambia la contraseña del usuario (MODO DEMO)
 * @param {number} usuarioId - ID del usuario
 * @param {string} passwordActual - Contraseña actual
 * @param {string} passwordNueva - Nueva contraseña
 * @returns {Promise<Object>} Confirmación
 */
export const cambiarContrasena = async (usuarioId, passwordActual, passwordNueva) => {
  try {
    await new Promise((r) => setTimeout(r, 500));
    
    // Obtener usuarios del storage
    const stored = localStorage.getItem("usuarios_mock");
    const usuarios = stored ? JSON.parse(stored) : [];
    
    // Buscar usuario
    const usuario = usuarios.find((u) => u.id === usuarioId);
    if (!usuario) {
      throw new Error("Usuario no encontrado");
    }
    
    // Verificar contraseña actual
    if (usuario.password !== passwordActual) {
      throw new Error("Contraseña actual incorrecta");
    }
    
    // Actualizar contraseña
    usuario.password = passwordNueva;
    localStorage.setItem("usuarios_mock", JSON.stringify(usuarios));
    
    return { message: "Contraseña actualizada exitosamente" };
  } catch (error) {
    console.error("Error cambiando contraseña:", error);
    throw error;
  }
};

/**
 * Actualiza el perfil del usuario
 * @param {number} usuarioId - ID del usuario
 * @param {Object} datos - Datos a actualizar (nombre, etc.)
 * @returns {Promise<Object>} Usuario actualizado
 */
export const actualizarPerfil = async (usuarioId, datos) => {
  try {
    await new Promise((r) => setTimeout(r, 300));
    
    const stored = localStorage.getItem("usuarios_mock");
    const usuarios = stored ? JSON.parse(stored) : [];
    
    const usuario = usuarios.find((u) => u.id === usuarioId);
    if (!usuario) {
      throw new Error("Usuario no encontrado");
    }
    
    // Actualizar datos permitidos
    if (datos.nombre) usuario.nombre = datos.nombre;
    
    localStorage.setItem("usuarios_mock", JSON.stringify(usuarios));
    
    return usuario;
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
    await new Promise((r) => setTimeout(r, 200));
    
    return {
      version: "1.0.0",
      buildDate: "2025-02-13",
      ambiente: "Desarrollo (Demo)",
      apiStatus: "Online",
      apiUrl: "http://localhost:3001",
      baseUrl: typeof window !== "undefined" ? window.location.origin : "N/A",
      navegador: typeof navigator !== "undefined" ? navigator.userAgent : "N/A",
      ultimaActualizacion: new Date().toLocaleString("es-ES"),
    };
  } catch (error) {
    console.error("Error obteniendo info del sistema:", error);
    throw error;
  }
};
