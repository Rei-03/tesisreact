// lib/services/usuariosService.js

import axiosInstance from '../api/apiClient';

/**
 * Servicio para gestionar usuarios
 * Conectado directamente con el backend (sin modo demo)
 */

/**
 * Obtiene la lista de todos los usuarios
 * @returns {Promise<Array>} Lista de usuarios
 */
export const obtenerUsuarios = async () => {
  try {
    const response = await axiosInstance.get("/auth/users");
    return response.data?.data || [];
  } catch (error) {
    console.error("Error obteniendo usuarios:", error);
    throw error;
  }
};

/**
 * Obtiene un usuario por ID
 * @param {string} id - ID del usuario
 * @returns {Promise<Object>} Datos del usuario
 */
export const obtenerUsuarioPorId = async (id) => {
  try {
    const response = await axiosInstance.get(`/auth/users/${id}`);
    return response.data?.data;
  } catch (error) {
    console.error("Error obteniendo usuario:", error);
    throw error;
  }
};

/**
 * Crea un nuevo usuario
 * @param {Object} datos - Datos del nuevo usuario
 * @param {string} datos.email - Email del usuario
 * @param {string} datos.name - Nombre completo del usuario
 * @param {string} datos.password - Contraseña
 * @param {string} datos.role - Rol del usuario
 * @returns {Promise<Object>} Usuario creado
 */
export const crearUsuario = async (datos = {}) => {
  try {
    const response = await axiosInstance.post("/auth/register", datos);
    if (response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.message || "Error al crear usuario");
  } catch (error) {
    console.error("Error creando usuario:", error);
    throw error;
  }
};

/**
 * Actualiza un usuario existente
 * @param {string} id - ID del usuario
 * @param {Object} datos - Datos a actualizar
 * @returns {Promise<Object>} Usuario actualizado
 */
export const actualizarUsuario = async (id, datos) => {
  try {
    const response = await axiosInstance.put(`/auth/users/${id}`, datos);
    if (response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.message || "Error al actualizar usuario");
  } catch (error) {
    console.error("Error actualizando usuario:", error);
    throw error;
  }
};

/**
 * Elimina un usuario
 * @param {string} id - ID del usuario a eliminar
 * @returns {Promise<void>}
 */
export const eliminarUsuario = async (id) => {
  try {
    const response = await axiosInstance.delete(`/auth/users/${id}`);
    if (!response.data.success) {
      throw new Error(response.data.message || "Error al eliminar usuario");
    }
  } catch (error) {
    console.error("Error eliminando usuario:", error);
    throw error;
  }
};
