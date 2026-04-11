// lib/api/apiClient.js
/**
 * Cliente API centralizado para todas las llamadas al backend
 * Proporciona métodos para circuitos, aseguramientos y próximas aperturas
 * Con fallback a datos mock cuando la API no esté disponible
 */

import axios from 'axios';
import { circuitosMock, aseguramientosMock, proxAperturasMock } from "@/data/mock";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
let apiAvailable = null; // Caché de disponibilidad de API

// Verificar si la API está disponible
async function checkApiAvailability() {
  if (apiAvailable !== null) return apiAvailable;
  
  try {
    await axios.head(`${API_BASE_URL}/health`, {
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
    const response = await axios.get(url, { timeout: 5000, ...options });
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
    const data = await fetchWithFallback(`${API_BASE_URL}/circuitos/apagables`);
    return data || circuitosMock.filter(c => c.Apagable === true);
  },

  getById: async (id) => {
    const data = await fetchWithFallback(`${API_BASE_URL}/circuitos/${id}`);
    return data || circuitosMock.find(c => c.idCircuitoP === id) || null;
  },

  update: async (id, updateData) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/circuitos/${id}`, updateData);
      return response.data;
    } catch (error) {
      console.error(`Error updating circuit ${id}:`, error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/circuitos/${id}`);
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
    const data = await fetchWithFallback(`${API_BASE_URL}/aseguramientos`);
    return data || aseguramientosMock;
  },

  getByFecha: async (fecha) => {
    const data = await fetchWithFallback(`${API_BASE_URL}/aseguramientos/fecha/${fecha}`);
    if (data) return data;
    
    // Mock: filtrar aseguramientos que incluyan la fecha
    const fechaDate = new Date(fecha);
    return aseguramientosMock.filter(
      a => new Date(a.fechaInicial) <= fechaDate && new Date(a.fechaFinal) >= fechaDate
    );
  },

  getById: async (id) => {
    const data = await fetchWithFallback(`${API_BASE_URL}/aseguramientos/${id}`);
    return data || aseguramientosMock.find(a => a.id_CircuitoP === id) || null;
  },

  create: async (createData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/aseguramientos`, createData);
      return response.data;
    } catch (error) {
      console.error("Error creating aseguramiento:", error);
      throw error;
    }
  },

  update: async (id, updateData) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/aseguramientos/${id}`, updateData);
      return response.data;
    } catch (error) {
      console.error(`Error updating aseguramiento ${id}:`, error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/aseguramientos/${id}`);
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
    const data = await fetchWithFallback(`${API_BASE_URL}/proximasAperturas`);
    return data || proxAperturasMock;
  },

  getById: async (id) => {
    const data = await fetchWithFallback(`${API_BASE_URL}/proximasAperturas/${id}`);
    return data || proxAperturasMock.find(p => p.id_Circuito === id) || null;
  },

  create: async (createData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/proximasAperturas`, createData);
      return response.data;
    } catch (error) {
      console.error("Error creating próxima apertura:", error);
      throw error;
    }
  },

  update: async (id, updateData) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/proximasAperturas/${id}`, updateData);
      return response.data;
    } catch (error) {
      console.error(`Error updating próxima apertura ${id}:`, error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/proximasAperturas/${id}`);
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
      const response = await axios.post(`${API_BASE_URL}/rotaciones/generar`, datos);
      return response.data;
    } catch (error) {
      console.error("Error generando rotación:", error);
      throw error;
    }
  },

  obtener: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/rotaciones`);
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