// lib/api/apiClient.js
/**
 * Cliente API centralizado para todas las llamadas al backend
 * Proporciona métodos para circuitos, aseguramientos y próximas aperturas
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

// Utilidad para manejar errores de respuesta
async function handleResponse(response) {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Error desconocido" }));
    throw new Error(error.message || `Error ${response.status}: ${response.statusText}`);
  }
  return response.json();
}

// CIRCUITOS API
const circuitos = {
  getAll: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/circuitos`);
      return handleResponse(response);
    } catch (error) {
      console.error("Error fetching all circuits:", error);
      return [];
    }
  },

  getApagables: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/circuitos/apagables`);
      return handleResponse(response);
    } catch (error) {
      console.error("Error fetching apagables circuits:", error);
      return [];
    }
  },

  getById: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/circuitos/${id}`);
      return handleResponse(response);
    } catch (error) {
      console.error(`Error fetching circuit ${id}:`, error);
      return null;
    }
  },

  update: async (id, data) => {
    try {
      const response = await fetch(`${API_BASE_URL}/circuitos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return handleResponse(response);
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
      return handleResponse(response);
    } catch (error) {
      console.error(`Error deleting circuit ${id}:`, error);
      throw error;
    }
  },
};

// ASEGURAMIENTOS API
const aseguramientos = {
  getAll: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/aseguramientos`);
      return handleResponse(response);
    } catch (error) {
      console.error("Error fetching aseguramientos:", error);
      return [];
    }
  },

  getByFecha: async (fecha) => {
    try {
      const response = await fetch(`${API_BASE_URL}/aseguramientos/fecha/${fecha}`);
      return handleResponse(response);
    } catch (error) {
      console.error(`Error fetching aseguramientos for date ${fecha}:`, error);
      return [];
    }
  },

  getById: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/aseguramientos/${id}`);
      return handleResponse(response);
    } catch (error) {
      console.error(`Error fetching aseguramiento ${id}:`, error);
      return null;
    }
  },

  create: async (data) => {
    try {
      const response = await fetch(`${API_BASE_URL}/aseguramientos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return handleResponse(response);
    } catch (error) {
      console.error("Error creating aseguramiento:", error);
      throw error;
    }
  },

  update: async (id, data) => {
    try {
      const response = await fetch(`${API_BASE_URL}/aseguramientos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return handleResponse(response);
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
      return handleResponse(response);
    } catch (error) {
      console.error(`Error deleting aseguramiento ${id}:`, error);
      throw error;
    }
  },
};

// PRÓXIMAS APERTURAS API
const proximasAperturas = {
  getAll: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/proximasAperturas`);
      return handleResponse(response);
    } catch (error) {
      console.error("Error fetching próximas aperturas:", error);
      return [];
    }
  },

  getById: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/proximasAperturas/${id}`);
      return handleResponse(response);
    } catch (error) {
      console.error(`Error fetching próxima apertura ${id}:`, error);
      return null;
    }
  },

  create: async (data) => {
    try {
      const response = await fetch(`${API_BASE_URL}/proximasAperturas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return handleResponse(response);
    } catch (error) {
      console.error("Error creating próxima apertura:", error);
      throw error;
    }
  },

  update: async (id, data) => {
    try {
      const response = await fetch(`${API_BASE_URL}/proximasAperturas/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return handleResponse(response);
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
      return handleResponse(response);
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
