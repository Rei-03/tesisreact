// lib/api/apiClient.js
/**
 * Cliente API centralizado para todas las llamadas al backend
 * API Gateway: http://localhost:3001
 */

import axios from 'axios';

// Crear instancia de axios con configuración base
const axiosInstance = axios.create({
  baseURL: 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token y manejo de errores
axiosInstance.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      // Agregar token de autenticación si está disponible
      const token = localStorage.getItem('token');
      if (token) {
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
    return response.data;
  },

  getApagables: async () => {
    const response = await axiosInstance.get('/circuitos', { params: { apagable: true } });
    return response.data;
  },

  getById: async (id) => {
    const response = await axiosInstance.get(`/circuitos/${id}`);
    return response.data;
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
  getAll: async () => {
    const response = await axiosInstance.get('/aseguramientos');
    return response.data;
  },

  getByFecha: async (fecha) => {
    const response = await axiosInstance.get('/aseguramientos', { 
      params: { fecha } 
    });
    return response.data;
  },

  getById: async (id) => {
    const response = await axiosInstance.get(`/aseguramientos/${id}`);
    return response.data;
  },

  create: async (createData) => {
    const response = await axiosInstance.post('/aseguramientos', createData);
    return response.data;
  },

  update: async (id, updateData) => {
    const response = await axiosInstance.put(`/aseguramientos/${id}`, updateData);
    return response.data;
  },

  delete: async (id) => {
    const response = await axiosInstance.delete(`/aseguramientos/${id}`);
    return response.data;
  },
};


// PRÓXIMAS APERTURAS API
const proximasAperturas = {
  getAll: async () => {
    const response = await axiosInstance.get('/proximasAperturas');
    return response.data;
  },

  getById: async (id) => {
    const response = await axiosInstance.get(`/proximasAperturas/${id}`);
    return response.data;
  },

  create: async (createData) => {
    const response = await axiosInstance.post('/proximasAperturas', createData);
    return response.data;
  },

  update: async (id, updateData) => {
    const response = await axiosInstance.put(`/proximasAperturas/${id}`, updateData);
    return response.data;
  },

  delete: async (id) => {
    const response = await axiosInstance.delete(`/proximasAperturas/${id}`);
    return response.data;
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
  proximasAperturas,
  rotaciones,
};

export default axiosInstance;