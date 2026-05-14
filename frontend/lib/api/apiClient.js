// lib/api/apiClient.js
/**
 * Cliente API centralizado para todas las llamadas al backend
 * API Gateway: ${process.env.NEXT_PUBLIC_API_URL}
 * 
 * SEGURIDAD:
 * - Usa httpOnly cookies para tokens (protegido contra XSS)
 * - Las cookies se envían automáticamente con credentials: 'include'
 * - No almacena tokens en localStorage (más seguro)
 */

import axios from 'axios';

// Crear instancia de axios con configuración base
const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
  // IMPORTANTE: Enviar cookies automáticamente en cada request
  withCredentials: true,
});

// Interceptor para agregar token fallback y manejo de errores
axiosInstance.interceptors.request.use(
  (config) => {
    console.log(`📤 [${config.method?.toUpperCase()}] ${config.baseURL}${config.url}`, {
      data: config.data,
      headers: config.headers,
    });
    
    // Las cookies httpOnly se envían automáticamente con withCredentials: true
    // Pero si por alguna razón hay un token en localStorage (fallback), lo seguimos soportando
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token && !config.headers.Authorization) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Token Refresh Logic ────────────────────────────────────────────────────
// Cola de requests que fallaron con 401 mientras se refrescaba el token
let isRefreshing = false;
let failedQueue = [];

/**
 * Procesa la cola de requests pendientes tras un intento de refresh.
 * @param {Error|null} error - null si el refresh fue exitoso, Error si falló
 */
const processQueue = (error) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve();
    }
  });
  failedQueue = [];
};

/**
 * Redirige al login limpiando datos locales.
 */
const redirectToLogin = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('userData');
  localStorage.removeItem('token');
  localStorage.removeItem('isAuthenticated');
  const isLoginPage =
    window.location.pathname === '/loguin' ||
    window.location.pathname === '/login';
  if (!isLoginPage) {
    window.location.href = '/loguin';
  }
};

// Interceptor para manejo de respuestas y errores
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const statusCode = error.response?.status;
    
    // Mejorar manejo de errores de red (sin respuesta del servidor)
    if (!error.response) {
      const networkError = {
        isNetworkError: true,
        message: error.message || 'Error de conexión con el servidor',
        details: error.code || 'NETWORK_ERROR',
      };
      
      const url = originalRequest?.url || 'unknown';
      const method = originalRequest?.method?.toUpperCase() || 'unknown';
      console.error(
        `❌ Network Error [${method}] ${url}:`,
        networkError.message,
        `(${networkError.details})`
      );
      
      // No reintentar si es error de red
      return Promise.reject(networkError);
    }

    const message =
      error.response?.data?.message || error.message || 'Error desconocido';

    // No registrar como error los 401 esperados en /auth/me (sin sesión)
    const isExpectedUnauthorized = 
      statusCode === 401 && originalRequest.url === '/auth/me' && !originalRequest._retry;
    
    if (!isExpectedUnauthorized) {
      console.error(`API Error [${statusCode}]:`, message);
    }

    // ── Manejo de 401: intentar refresh antes de redirigir a login ──────────
    if (statusCode === 401 && !originalRequest._retry) {
      // Marcar request para no reintentar si el refresh también falla
      originalRequest._retry = true;

      // Ignorar los endpoints de auth para evitar bucles infinitos
      const isAuthEndpoint =
        originalRequest.url?.includes('/auth/login') ||
        originalRequest.url?.includes('/auth/refresh') ||
        originalRequest.url?.includes('/auth/register');

      if (!isAuthEndpoint) {
        // Si ya hay un refresh en curso, encolar este request
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then(() => axiosInstance(originalRequest))
            .catch((err) => Promise.reject(err));
        }

        isRefreshing = true;

        try {
          // Intentar refrescar el token (usa el refreshToken en cookie httpOnly)
          await axiosInstance.post('/auth/refresh', {});
          processQueue(null);
          // Reintentar el request original con el nuevo accessToken (en cookie)
          return axiosInstance(originalRequest);
        } catch (refreshError) {
          processQueue(refreshError);
          redirectToLogin();
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      // Si el endpoint de auth falla con 401, limpiar y redirigir
      redirectToLogin();
    }

    // Lanzar error personalizado
    return Promise.reject({
      status: statusCode,
      message,
      originalError: error,
    });
  }
);


// CIRCUITOS API
const circuitos = {
  getAll: async (page = 1, pageSize = 10, apagable = undefined, bloque = undefined) => {
    const params = new URLSearchParams();
    params.append('page', page);
    params.append('pageSize', pageSize);
    
    if (apagable !== undefined) params.append('apagable', apagable);
    if (bloque !== undefined) params.append('bloque', bloque);
    
    const response = await axiosInstance.get(`/circuitos?${params}`);
    return response.data?.data || response.data;
  },

  getApagables: async (page = 1, pageSize = 500) => {
    const response = await axiosInstance.get('/circuitos', {
      params: {
        page,
        pageSize,
        apagable: true,
      },
    });
    return response.data?.data || response.data;
  },

  getById: async (id) => {
    const response = await axiosInstance.get(`/circuitos/${id}`);
    return response.data?.data || response.data;
  },

  getCurrentHourTotalMW: async () => {
    const response = await axiosInstance.get('/circuitos/mw-current-total');
    return response.data?.data || response.data;
  },

  update: async (id, updateData) => {
    const response = await axiosInstance.put(`/circuitos/${id}`, updateData);
    return response.data;
  },

  delete: async (id) => {
    const response = await axiosInstance.delete(`/circuitos/${id}`);
    return response.data;
  },
};


// ASEGURAMIENTOS API
const aseguramientos = {
  getAll: async (page = 1, pageSize = 10, fecha = undefined) => {
    const params = new URLSearchParams();
    params.append('page', page);
    params.append('pageSize', pageSize);
    
    if (fecha !== undefined) params.append('fecha', fecha);
    
    const response = await axiosInstance.get(`/rotaciones/aseguramientos?${params}`);
    return response.data?.data || response.data;
  },

  getByFecha: async (fecha, page = 1, pageSize = 10) => {
    const params = new URLSearchParams();
    params.append('page', page);
    params.append('pageSize', pageSize);
    params.append('fecha', fecha);
    
    const response = await axiosInstance.get(`/rotaciones/aseguramientos?${params}`);
    return response.data?.data || response.data;
  },

  countByFecha: async (fecha) => {
    const params = new URLSearchParams();
    if (fecha !== undefined) params.append('fecha', fecha);

    const response = await axiosInstance.get(`/rotaciones/aseguramientos/count?${params}`);
    return response.data?.data || response.data;
  },

  getById: async (id) => {
    const response = await axiosInstance.get(`/rotaciones/aseguramientos/${id}`);
    return response.data?.data || response.data;
  },

  create: async (createData) => {
    const response = await axiosInstance.post('/rotaciones/aseguramientos', createData);
    return response.data;
  },

  update: async (id, updateData) => {
    const response = await axiosInstance.put(`/rotaciones/aseguramientos/${id}`, updateData);
    return response.data;
  },

  delete: async (id) => {
    const response = await axiosInstance.delete(`/rotaciones/aseguramientos/${id}`);
    return response.data;
  },
};

// APAGONES API
const apagones = {
  getAll: async (page = 1, pageSize = 20) => {
    const params = new URLSearchParams();
    params.append('page', page);
    params.append('pageSize', pageSize);

    const response = await axiosInstance.get(`/apagones?${params}`);
    return response.data?.data || response.data;
  },

  getOpen: async (page = 1, pageSize = 200) => {
    const params = new URLSearchParams();
    params.append('page', page);
    params.append('pageSize', pageSize);

    const response = await axiosInstance.get(`/apagones/open?${params}`);
    const payload = response.data?.data || response.data;

    console.log('[apiClient] apagones.getOpen -> payload', {
      page,
      pageSize,
      keys: payload ? Object.keys(payload) : [],
      resultsCount: Array.isArray(payload?.results)
        ? payload.results.length
        : Array.isArray(payload)
          ? payload.length
          : null,
      meta: payload?.meta || null,
      raw: response.data,
    });

    return payload;
  },

  getById: async (id) => {
    const response = await axiosInstance.get(`/apagones/${id}`);
    return response.data?.data || response.data;
  },
};


// ROTACIONES API
const rotaciones = {
  generar: async (datos) => {
    const response = await axiosInstance.post('/rotaciones/generar', datos);
    return response.data;
  },

  obtener: async () => {
    const response = await axiosInstance.get('/rotaciones');
    return response.data;
  },
};

// Exportar cliente API
export const apiClient = {
  circuitos,
  aseguramientos,
  apagones,
  rotaciones,
};

export default axiosInstance;