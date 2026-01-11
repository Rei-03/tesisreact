// lib/api/apiClient.js
/**
 * Cliente API centralizado para todas las llamadas al backend
 * Proporciona métodos para circuitos, aseguramientos y próximas aperturas
 * Con fallback a datos mock cuando la API no esté disponible
 */

import { circuitosMock, aseguramientosMock, proxAperturasMock } from "@/data/mock";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";
let apiAvailable = null; // Caché de disponibilidad de API

// Verificar si la API está disponible
async function checkApiAvailability() {
  if (apiAvailable !== null) return apiAvailable;
  
  try {
    const response = await fetch(`${API_BASE_URL}/health`, { 
      method: "HEAD",
      signal: AbortSignal.timeout(2000) 
    });
    apiAvailable = response.ok;
    return apiAvailable;
  } catch (error) {
    apiAvailable = false;
    return false;
  }
}

// Utilidad para manejar errores de respuesta
async function handleResponse(response) {
  if (!response.ok) {
    try {
      const error = await response.json();
      throw new Error(error.message || `Error ${response.status}: ${response.statusText}`);
    } catch (e) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
  }
  return response.json();
}

// Ejecutar con fallback a mock
async function fetchWithFallback(url, options = {}) {
  try {
    const isAvailable = await checkApiAvailability();
    if (!isAvailable) {
      console.warn("API no disponible, usando datos mock");
      return null;
    }

    const response = await fetch(url, { signal: AbortSignal.timeout(5000), ...options });
    return await handleResponse(response);
  } catch (error) {
    console.warn(`Fetch failed for ${url}:`, error.message);
    apiAvailable = false;
    return null;
  }
}

// CIRCUITOS API
const circuitos = {
  getAll: async () => {
    const data = await fetchWithFallback(`${API_BASE_URL}/circuitos`);
    return data || circuitosMock;
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
      const response = await fetch(`${API_BASE_URL}/circuitos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });
      return await handleResponse(response);
    } catch (error) {
      console.error(`Error updating circuit ${id}:`, error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/circuitos/${id}`, {
        method: "DELETE",
      });
      return await handleResponse(response);
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
      const response = await fetch(`${API_BASE_URL}/aseguramientos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(createData),
      });
      return await handleResponse(response);
    } catch (error) {
      console.error("Error creating aseguramiento:", error);
      throw error;
    }
  },

  update: async (id, updateData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/aseguramientos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });
      return await handleResponse(response);
    } catch (error) {
      console.error(`Error updating aseguramiento ${id}:`, error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/aseguramientos/${id}`, {
        method: "DELETE",
      });
      return await handleResponse(response);
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
      const response = await fetch(`${API_BASE_URL}/proximasAperturas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(createData),
      });
      return await handleResponse(response);
    } catch (error) {
      console.error("Error creating próxima apertura:", error);
      throw error;
    }
  },

  update: async (id, updateData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/proximasAperturas/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });
      return await handleResponse(response);
    } catch (error) {
      console.error(`Error updating próxima apertura ${id}:`, error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/proximasAperturas/${id}`, {
        method: "DELETE",
      });
      return await handleResponse(response);
    } catch (error) {
      console.error(`Error deleting próxima apertura ${id}:`, error);
      throw error;
    }
  },
};

// Exportar cliente API
export const apiClient = {
  circuitos,
  aseguramientos,
  proximasAperturas,
};
