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

// Interceptor para manejo de respuestas y errores
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || error.message || 'Error desconocido';
    const statusCode = error.response?.status;
    
    console.error(`API Error [${statusCode}]:`, message);
    
    // Si es 401 (no autorizado), la sesión es inválida
    if (statusCode === 401) {
      if (typeof window !== 'undefined') {
        // Limpiar datos locales
        localStorage.removeItem('userData');
        localStorage.removeItem('token');
        localStorage.removeItem('isAuthenticated');
        
        // Redirigir a login SOLO si no estamos ya en la página de login
        const isLoginPage = window.location.pathname === '/loguin' || window.location.pathname === '/login';
        if (!isLoginPage) {
          // Usar un pequeño delay para evitar múltiples redirecciones
          setTimeout(() => {
            window.location.href = '/loguin';
          }, 500);
        }
      }
    }
    
    // Lanzar error personalizado
    throw {
      status: statusCode,
      message,
      originalError: error,
    };
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