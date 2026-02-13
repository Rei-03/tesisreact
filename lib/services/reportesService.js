// lib/services/reportesService.js

/**
 * Servicio para gestionar reportes y rotaciones
 */

/**
 * Obtiene el historial de reportes/rotaciones con filtros opcionales
 * @param {Object} filtros - Filtros de búsqueda
 * @param {string} filtros.desde - Fecha inicio (YYYY-MM-DD)
 * @param {string} filtros.hasta - Fecha fin (YYYY-MM-DD)
 * @returns {Promise<Array>} Lista de reportes
 */
export const obtenerReportes = async (filtros = {}) => {
  try {
    // TODO: Conectar con el endpoint del backend cuando esté listo
    // endpoint: GET /api/reportes o GET /api/rotaciones/historial
    // Parámetros: ?desde=YYYY-MM-DD&hasta=YYYY-MM-DD
    
    const params = new URLSearchParams();
    if (filtros.desde) params.append("desde", filtros.desde);
    if (filtros.hasta) params.append("hasta", filtros.hasta);
    
    const queryString = params.toString();
    const url = queryString ? `/api/reportes?${queryString}` : "/api/reportes";
    
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    const datos = await response.json();
    return datos || [];
  } catch (error) {
    console.error("Error obteniendo reportes:", error);
    throw error;
  }
};

/**
 * Descarga un reporte como PDF
 * @param {number} reporteId - ID del reporte a descargar
 * @returns {Promise<void>}
 */
export const descargarReportePDF = async (reporteId) => {
  try {
    // TODO: Conectar con el endpoint del backend cuando esté listo
    // endpoint: GET /api/reportes/{id}/descargar o POST /api/reportes/{id}/pdf
    
    const response = await fetch(`/api/reportes/${reporteId}/descargar`, {
      method: "GET",
      headers: {
        "Accept": "application/pdf",
      },
    });

    if (!response.ok) {
      throw new Error(`Error descargando reporte: ${response.status}`);
    }

    // Obtener el blob y crear un enlace de descarga
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `reporte_${reporteId}_${new Date().toISOString().split("T")[0]}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error descargando reporte:", error);
    throw error;
  }
};

/**
 * Obtiene estadísticas de los reportes
 * @returns {Promise<Object>} Estadísticas generales
 */
export const obtenerEstadisticasReportes = async () => {
  try {
    // TODO: Conectar con endpoint cuando esté listo
    // endpoint: GET /api/reportes/estadisticas
    
    const response = await fetch("/api/reportes/estadisticas", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    const datos = await response.json();
    return datos;
  } catch (error) {
    console.error("Error obteniendo estadísticas:", error);
    return { totalReportes: 0, mwTotalApagado: 0, circuitosTotales: 0 };
  }
};
