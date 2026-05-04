// lib/services/authService.js
/**
 * Servicio de Autenticación con httpOnly Cookies
 * 
 * SEGURIDAD:
 * - Los tokens se almacenan en httpOnly cookies (protegido contra XSS)
 * - Las cookies se envían automáticamente en cada request (withCredentials)
 * - No se almacenan tokens en localStorage
 * - Logout limpia las cookies en el servidor
 */

import axiosInstance from '../api/apiClient';

/**
 * Valida la sesión del usuario verificando el token en las cookies
 * Llama al backend para verificar que el token sea válido
 * @returns {Promise<Object>} Datos del usuario si la sesión es válida
 * @throws {Error} Si la sesión no es válida o el token expiró
 */
export const validateSession = async () => {
  try {
    const response = await axiosInstance.get('/auth/me');

    if (response.data.success && response.data.data) {
      // Actualizar datos locales con los del servidor
      localStorage.setItem('userData', JSON.stringify(response.data.data));
      return response.data.data;
    }

    throw new Error(response.data.message || 'Sesión inválida');
  } catch (error) {
    console.error('Error validando sesión:', error);
    // Limpiar datos si la sesión no es válida
    localStorage.removeItem('userData');
    localStorage.removeItem('token');
    localStorage.removeItem('isAuthenticated');
    throw error;
  }
};

/**
 * Login de usuario
 * @param {string} email - Email del usuario
 * @param {string} password - Contraseña del usuario
 * @returns {Promise<Object>} Datos del usuario autenticado
 */
export const loginUser = async (email, password) => {
  try {
    console.log('🔐 Iniciando login con:', { email, password: '***' });
    console.log('📡 Enviando a:', `${process.env.NEXT_PUBLIC_API_URL}/auth/login`);
    
    const response = await axiosInstance.post('/auth/login', {
      email,
      password,
    });

    console.log('✅ Respuesta del servidor:', response.data);

    if (response.data.success && response.data.data) {
      // El token se guardó automáticamente en cookies httpOnly por el servidor
      // Guardar info del usuario en localStorage (no el token)
      const { accessToken, refreshToken, ...userData } = response.data.data;
      localStorage.setItem('userData', JSON.stringify(userData));
      
      return userData;
    }

    throw new Error(response.data.message || 'Error al iniciar sesión');
  } catch (error) {
    console.error('❌ Error en loginUser:', error);
    throw error;
  }
};

/**
 * Registrar nuevo usuario
 * @param {Object} userData - Datos del usuario
 * @returns {Promise<Object>} Datos del usuario registrado
 */
export const registerUser = async (userData) => {
  try {
    const response = await axiosInstance.post('/auth/register', userData);

    if (response.data.success && response.data.data) {
      // El token se guardó automáticamente en cookies httpOnly por el servidor
      const { accessToken, refreshToken, ...userInfo } = response.data.data;
      localStorage.setItem('userData', JSON.stringify(userInfo));
      
      return userInfo;
    }

    throw new Error(response.data.message || 'Error al registrarse');
  } catch (error) {
    console.error('Error en registerUser:', error);
    throw error;
  }
};

/**
 * Logout de usuario
 * Limpia las cookies en el servidor y el localStorage
 * @returns {Promise<void>}
 */
export const logoutUser = async () => {
  try {
    // Enviar petición de logout (limpia cookies en servidor)
    await axiosInstance.post('/auth/logout', {});
  } catch (error) {
    // Incluso si falla, limpiar localStorage localmente
    console.error('Error en logoutUser:', error);
  } finally {
    // Limpiar datos locales
    localStorage.removeItem('userData');
    localStorage.removeItem('token'); // Fallback antiguo
    localStorage.removeItem('isAuthenticated');
  }
};

/**
 * Obtener datos del usuario actual
 * @returns {Promise<Object>} Datos del usuario autenticado
 */
export const getCurrentUser = async () => {
  try {
    const response = await axiosInstance.post('/auth/me');
    
    if (response.data.success) {
      return response.data.data;
    }

    throw new Error('No autenticado');
  } catch (error) {
    console.error('Error en getCurrentUser:', error);
    throw error;
  }
};

/**
 * Refrescar el token de acceso usando el refresh token en cookies
 * @returns {Promise<Object>} Nuevos datos del usuario
 */
export const refreshAccessToken = async () => {
  try {
    // El refresh token viene en las cookies httpOnly
    // El servidor retornará nuevas cookies con access token actualizado
    const response = await axiosInstance.post('/auth/refresh', {});

    if (response.data.success) {
      return response.data.data;
    }

    throw new Error('No se pudo refrescar el token');
  } catch (error) {
    console.error('Error en refreshAccessToken:', error);
    // Si el refresh falla, el usuario debe hacer login de nuevo
    await logoutUser();
    throw error;
  }
};

/**
 * Obtener datos del usuario almacenados localmente
 * (solo info del usuario, no tokens - estos están en cookies)
 * @returns {Object|null} Datos del usuario o null
 */
export const getStoredUserData = () => {
  try {
    const userData = localStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Error al obtener datos del usuario almacenado:', error);
    return null;
  }
};
