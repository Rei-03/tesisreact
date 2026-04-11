// lib/api/apiClient.js
/**
 * Cliente API centralizado para todas las llamadas al backend
 * Proporciona métodos para circuitos, aseguramientos y próximas aperturas
 * Con fallback a datos mock cuando la API no esté disponible
 */

import axios from 'axios';
import { circuitosMock, aseguramientosMock, proxAperturasMock } from "@/data/mock";

// Crear instancia de axios con configuración base
const axiosInstance = axios.create({
  baseURL: 'http://localhost:3001',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token a todas las peticiones
axiosInstance.interceptors.request.use(
  (config) => {
    // Aquí puedes agregar lógica para obtener el token si es necesario
    // Por ahora, solo configuramos headers básicos
    if (typeof window !== 'undefined') {
      // Si tienes autenticación, descomenta esto:
      // const token = localStorage.getItem('token');
      // if (token) {
      //   config.headers.Authorization = `Bearer ${token}`;
      // }
      config.withCredentials = false; // Cambia a true si necesitas cookies
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

let apiAvailable = null; // Caché de disponibilidad de API

// Verificar si la API está disponible
async function checkApiAvailability() {
  if (apiAvailable !== null) return apiAvailable;
  
  try {
    await axiosInstance.head(`/api/health`, {
      timeout: 2000
    });
    apiAvailable = true;
    return apiAvailable;
  } catch (error) {
    apiAvailable = false;
    return false;
  }
}

// Ejecutar con fallback a mock
async function fetchWithFallback(url, options = {}) {
  try {
    const response = await axiosInstance.get(url, { timeout: 5000, ...options });
    return response.data;
  } catch (error) {
    console.warn(`API unavailable (${url}), usando datos mock:`, error?.message);
    return null; // Retorna null para permitir fallback a mock
  }
}

// CIRCUITOS API
const circuitos = {
  getAll: async (page = 1, pageSize = 10, apagable = undefined, bloque = undefined) => {
    let url = `${API_BASE_URL}/circuitos?page=${page}&pageSize=${pageSize}`;
    
    if (apagable !== undefined) {
      url += `&apagable=${apagable}`;
    }
    
    if (bloque !== undefined) {
      url += `&bloque=${encodeURIComponent(bloque)}`;
    }
    
    const data = await fetchWithFallback(url);
    if (data) return data;
    
    // Fallback a mock con filtros aplicados
    let filtered = [...circuitosMock];
    if (apagable !== undefined) {
      filtered = filtered.filter(c => c.Apagable === apagable);
    }
    if (bloque !== undefined) {
      filtered = filtered.filter(c => c.Bloque === bloque);
    }
    
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const paginatedResults = filtered.slice(start, end);
    
    return {
      results: paginatedResults,
      meta: {
        page,
        totalPages: Math.ceil(filtered.length / pageSize),
        total: filtered.length,
        pageSize,
      },
    };
  },

  getApagables: async () => {
    const data = await fetchWithFallback(`/api/circuitos/apagables`);
    return data || circuitosMock.filter(c => c.Apagable === true);
  },

  getById: async (id) => {
    const data = await fetchWithFallback(`/api/circuitos/${id}`);
    return data || circuitosMock.find(c => c.idCircuitoP === id) || null;
  },

  update: async (id, updateData) => {
    try {
      const response = await axiosInstance.put(`/api/circuitos/${id}`, updateData);
      return response.data;
    } catch (error) {
      console.error(`Error updating circuit ${id}:`, error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const response = await axiosInstance.delete(`/api/circuitos/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting circuit ${id}:`, error);
      throw error;
    }
  },
};

// ASEGURAMIENTOS API
const aseguramientos = {
  getAll: async () => {
    const data = await fetchWithFallback(`/api/aseguramientos`);
    return data || aseguramientosMock;
  },

  getByFecha: async (fecha) => {
    const data = await fetchWithFallback(`/api/aseguramientos/fecha/${fecha}`);
    if (data) return data;
    
    // Mock: filtrar aseguramientos que incluyan la fecha
    const fechaDate = new Date(fecha);
    return aseguramientosMock.filter(
      a => new Date(a.fechaInicial) <= fechaDate && new Date(a.fechaFinal) >= fechaDate
    );
  },

  getById: async (id) => {
    const data = await fetchWithFallback(`/api/aseguramientos/${id}`);
    return data || aseguramientosMock.find(a => a.id_CircuitoP === id) || null;
  },

  create: async (createData) => {
    try {
      const response = await axiosInstance.post(`/api/aseguramientos`, createData);
      return response.data;
    } catch (error) {
      console.error("Error creating aseguramiento:", error);
      throw error;
    }
  },

  update: async (id, updateData) => {
    try {
      const response = await axiosInstance.put(`/api/aseguramientos/${id}`, updateData);
      return response.data;
    } catch (error) {
      console.error(`Error updating aseguramiento ${id}:`, error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const response = await axiosInstance.delete(`/api/aseguramientos/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting aseguramiento ${id}:`, error);
      throw error;
    }
  },
};

// PRÓXIMAS APERTURAS API
const proximasAperturas = {
  getAll: async () => {
    const data = await fetchWithFallback(`/api/proximasAperturas`);
    return data || proxAperturasMock;
  },

  getById: async (id) => {
    const data = await fetchWithFallback(`/api/proximasAperturas/${id}`);
    return data || proxAperturasMock.find(p => p.id_Circuito === id) || null;
  },

  create: async (createData) => {
    try {
      const response = await axiosInstance.post(`/api/proximasAperturas`, createData);
      return response.data;
    } catch (error) {
      console.error("Error creating próxima apertura:", error);
      throw error;
    }
  },

  update: async (id, updateData) => {
    try {
      const response = await axiosInstance.put(`/api/proximasAperturas/${id}`, updateData);
      return response.data;
    } catch (error) {
      console.error(`Error updating próxima apertura ${id}:`, error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const response = await axiosInstance.delete(`/api/proximasAperturas/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting próxima apertura ${id}:`, error);
      throw error;
    }
  },
};

// ROTACIONES API
const rotaciones = {
  generar: async (datos) => {
    try {
      const response = await axiosInstance.post(`/api/rotaciones/generar`, datos);
      return response.data;
    } catch (error) {
      console.error("Error generando rotación:", error);
      throw error;
    }
  },

  obtener: async () => {
    try {
      const response = await axiosInstance.get(`/api/rotaciones`);
      return response.data;
    } catch (error) {
      console.error("Error obteniendo rotaciones:", error);
      throw error;
    }
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