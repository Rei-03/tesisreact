// lib/services/reportesService.js
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import * as XLSX from "xlsx";
import {
  reportesMock,
  aseguramientosReporteMock,
  estadisticasReportesMock,
} from "@/data/mock";

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

    // Por ahora usamos datos mocks
    let reportes = [...reportesMock];

    // Filtrar por fecha desde
    if (filtros.desde) {
      const desdeDate = new Date(filtros.desde).getTime();
      reportes = reportes.filter((r) => {
        const reporteDate = new Date(r.fecha || r.createdAt).getTime();
        return reporteDate >= desdeDate;
      });
    }

    // Filtrar por fecha hasta
    if (filtros.hasta) {
      const hastaDate = new Date(filtros.hasta);
      hastaDate.setHours(23, 59, 59, 999);
      const hastaTime = hastaDate.getTime();
      reportes = reportes.filter((r) => {
        const reporteDate = new Date(r.fecha || r.createdAt).getTime();
        return reporteDate <= hastaTime;
      });
    }

    // Ordenar por fecha descendente (más recientes primero)
    reportes.sort(
      (a, b) =>
        new Date(b.fecha || b.createdAt).getTime() -
        new Date(a.fecha || a.createdAt).getTime()
    );

    return reportes;
  } catch (error) {
    console.error("Error obteniendo reportes:", error);
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

    // Por ahora retornamos datos mocks
    return estadisticasReportesMock;
  } catch (error) {
    console.error("Error obteniendo estadísticas:", error);
    return {
      totalReportes: 0,
      mwTotalApagado: 0,
      circuitosTotales: 0,
    };
  }
};

/**
 * Obtiene un reporte específico por ID
 * @param {number} reporteId - ID del reporte
 * @returns {Promise<Object>} Detalles del reporte
 */
export const obtenerReportePorId = async (reporteId) => {
  try {
    // TODO: Conectar con el endpoint del backend cuando esté listo
    // endpoint: GET /api/reportes/{id}

    const reporte = reportesMock.find((r) => r.id === reporteId);
    if (!reporte) {
      throw new Error("Reporte no encontrado");
    }
    return reporte;
  } catch (error) {
    console.error("Error obteniendo reporte:", error);
    throw error;
  }
};

/**
 * Genera y descarga un reporte como PDF usando jsPDF
 * @param {number} reporteId - ID del reporte a descargar
 * @returns {Promise<void>}
 */
export const descargarReportePDF = async (reporteId) => {
  try {
    // TODO: Cuando el backend esté listo, cambia esto:
    // const response = await fetch(`/api/reportes/${reporteId}/descargar`);
    // const blob = await response.blob();

    // Por ahora generamos el PDF desde los datos mocks locales
    const reporte = await obtenerReportePorId(reporteId);

    // Crear documento PDF
    const doc = new jsPDF();
    const pageHeight = doc.internal.pageSize.getHeight();
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPosition = 15;

    // Encabezado
    doc.setFontSize(18);
    doc.setTextColor(33, 37, 41); // Color oscuro
    doc.text("REPORTE DE ROTACIÓN", pageWidth / 2, yPosition, {
      align: "center",
    });

    yPosition += 10;
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(
      `Sistema de Gestión de Rotación de Circuitos Eléctricos (SGRC)`,
      pageWidth / 2,
      yPosition,
      { align: "center" }
    );

    yPosition += 12;
    doc.setDrawColor(0, 0, 0);
    doc.line(15, yPosition, pageWidth - 15, yPosition);

    // Información General
    yPosition += 8;
    doc.setFontSize(12);
    doc.setTextColor(33, 37, 41);
    doc.text("Información General", 15, yPosition);

    yPosition += 8;
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);

    const infoGeneral = [
      ["ID Rotación:", reporte.idRotacion],
      ["Fecha y Hora:", formatearFechaCompleta(reporte.fecha)],
      ["Tipo:", reporte.tipo],
      ["Bloque:", reporte.bloque.toString()],
      ["Generado por:", reporte.generadoPor],
      ["Estado:", reporte.estado],
    ];

    infoGeneral.forEach(([label, value]) => {
      doc.setFont(undefined, "bold");
      doc.text(label, 15, yPosition);
      doc.setFont(undefined, "normal");
      doc.text(value, 60, yPosition);
      yPosition += 6;
    });

    // Tabla de circuitos
    yPosition += 6;
    doc.setFontSize(12);
    doc.setTextColor(33, 37, 41);
    doc.text("Circuitos Afectados", 15, yPosition);

    yPosition += 8;
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);

    // Headers de tabla
    const tableHeaders = ["ID", "Nombre del Circuito", "MW"];
    let xPos = 15;
    const colWidths = [15, 140, 25];

    doc.setFont(undefined, "bold");
    doc.setFillColor(220, 220, 220);
    tableHeaders.forEach((header, i) => {
      doc.rect(xPos, yPosition - 5, colWidths[i], 7, "F");
      doc.text(header, xPos + 2, yPosition, { align: "left" });
      xPos += colWidths[i];
    });

    // Filas de circuitos
    yPosition += 8;
    doc.setFont(undefined, "normal");
    doc.setTextColor(60, 60, 60);

    reporte.circuitos.forEach((circuito, index) => {
      if (yPosition > pageHeight - 20) {
        doc.addPage();
        yPosition = 15;
      }

      xPos = 15;
      const row = [
        circuito.idCircuito.toString(),
        circuito.nombre,
        circuito.mw.toFixed(2),
      ];

      // Fondo alternado
      if (index % 2 === 0) {
        doc.setFillColor(245, 245, 245);
        doc.rect(xPos - 1, yPosition - 5, 180, 6, "F");
      }

      doc.setDrawColor(200, 200, 200);
      doc.rect(xPos - 1, yPosition - 5, 180, 6);

      row.forEach((cell, i) => {
        doc.text(cell, xPos + 2, yPosition, { align: "left" });
        xPos += colWidths[i];
      });

      yPosition += 7;
    });

    // Resumen
    yPosition += 8;
    doc.setFontSize(11);
    doc.setTextColor(33, 37, 41);
    doc.setFont(undefined, "bold");
    doc.text("Resumen", 15, yPosition);

    yPosition += 6;
    doc.setFontSize(10);
    doc.setFont(undefined, "normal");
    doc.setTextColor(60, 60, 60);

    const resumen = [
      [`Cantidad de Circuitos:`, `${reporte.cantidadCircuitos}`],
      [`MW Total Afectado:`, `${reporte.mwTotal} MW`],
      [`Duración:`, reporte.duracion],
    ];

    resumen.forEach(([label, value]) => {
      doc.setFont(undefined, "bold");
      doc.text(label, 15, yPosition);
      doc.setFont(undefined, "normal");
      doc.text(value, 85, yPosition);
      yPosition += 6;
    });

    // Observaciones
    if (reporte.observaciones) {
      yPosition += 6;
      doc.setFontSize(10);
      doc.setFont(undefined, "bold");
      doc.setTextColor(33, 37, 41);
      doc.text("Observaciones:", 15, yPosition);

      yPosition += 6;
      doc.setFont(undefined, "normal");
      doc.setTextColor(60, 60, 60);
      const observacionesLines = doc.splitTextToSize(
        reporte.observaciones,
        180
      );
      doc.text(observacionesLines, 15, yPosition);
    }

    // Footer
    yPosition = pageHeight - 10;
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    const pageCount = doc.internal.page.length - 1;
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.text(
        `Página ${i} de ${pageCount}`,
        pageWidth / 2,
        yPosition,
        { align: "center" }
      );
      doc.text(
        `Generado: ${new Date().toLocaleString("es-ES")}`,
        15,
        yPosition
      );
    }

    // Descargar
    const fileName = `reporte_rotacion_${reporte.idRotacion}_${formatearFechaArchivo(
      reporte.fecha
    )}.pdf`;
    doc.save(fileName);
  } catch (error) {
    console.error("Error generando PDF:", error);
    throw error;
  }
};

/**
 * Genera y descarga un reporte como Excel
 * @param {number} reporteId - ID del reporte a descargar
 * @returns {Promise<void>}
 */
export const descargarReporteExcel = async (reporteId) => {
  try {
    // TODO: Cuando el backend esté listo, conecta aquí
    // const response = await fetch(`/api/reportes/${reporteId}/descargar`);
    // const data = await response.json();

    const reporte = await obtenerReportePorId(reporteId);

    // Crear workbook
    const workbook = XLSX.utils.book_new();

    // ========== HOJA 1: Información General ==========
    const infoSheet = XLSX.utils.aoa_to_sheet([
      ["REPORTE DE ROTACIÓN"],
      ["Sistema de Gestión de Rotación de Circuitos Eléctricos (SGRC)"],
      [],
      ["INFORMACIÓN GENERAL"],
      ["ID Rotación:", reporte.idRotacion],
      ["Fecha y Hora:", formatearFechaCompleta(reporte.fecha)],
      ["Tipo de Reporte:", reporte.tipo],
      ["Bloque:", reporte.bloque],
      ["Generado por:", reporte.generadoPor],
      ["Usuario:", reporte.usuario],
      ["Estado:", reporte.estado],
      ["Duración:", reporte.duracion],
      [],
      ["RESUMEN"],
      ["Cantidad de Circuitos:", reporte.cantidadCircuitos],
      ["MW Total Afectado:", reporte.mwTotal],
      [],
      ["OBSERVACIONES"],
      [reporte.observaciones || "Sin observaciones"],
    ]);

    // Ajustar ancho de columnas
    infoSheet["!cols"] = [{ wch: 25 }, { wch: 50 }];

    XLSX.utils.book_append_sheet(workbook, infoSheet, "Información General");

    // ========== HOJA 2: Circuitos Detallados ==========
    const circuitosData = [
      ["ID Circuito", "Nombre del Circuito", "MW Afectado"],
      ...reporte.circuitos.map((c) => [c.idCircuito, c.nombre, c.mw]),
      [],
      ["TOTAL", "", reporte.mwTotal],
    ];

    const circuitosSheet = XLSX.utils.aoa_to_sheet(circuitosData);

    // Estilos (nota: XLSX tiene limitaciones, aplicaremos estilos básicos)
    circuitosSheet["!cols"] = [{ wch: 15 }, { wch: 40 }, { wch: 15 }];

    XLSX.utils.book_append_sheet(workbook, circuitosSheet, "Circuitos");

    // ========== HOJA 3: Estadísticas (si es que hay más datos) ==========
    const statsSheet = XLSX.utils.aoa_to_sheet([
      ["ESTADÍSTICAS DEL REPORTE"],
      [],
      ["Métrica", "Valor"],
      ["Total Circuitos", reporte.cantidadCircuitos],
      ["MW Total", reporte.mwTotal],
      ["MW Promedio por Circuito", (reporte.mwTotal / reporte.cantidadCircuitos).toFixed(2)],
      ["Duración", reporte.duracion],
      ["Fecha Generación", formatearFechaCompleta(reporte.fecha)],
    ]);

    statsSheet["!cols"] = [{ wch: 30 }, { wch: 20 }];

    XLSX.utils.book_append_sheet(workbook, statsSheet, "Estadísticas");

    // Descargar
    const fileName = `reporte_rotacion_${reporte.idRotacion}_${formatearFechaArchivo(
      reporte.fecha
    )}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  } catch (error) {
    console.error("Error generando Excel:", error);
    throw error;
  }
};

/**
 * Obtiene reportes de aseguramientos
 * @returns {Promise<Array>} Lista de aseguramientos
 */
export const obtenerReportesAseguramientos = async () => {
  try {
    // TODO: Conectar con endpoint cuando esté listo
    // endpoint: GET /api/reportes/aseguramientos

    return aseguramientosReporteMock;
  } catch (error) {
    console.error("Error obteniendo reportes de aseguramientos:", error);
    throw error;
  }
};

/**
 * Genera reporte de aseguramientos en PDF
 * @returns {Promise<void>}
 */
export const descargarReporteAseguramientosPDF = async () => {
  try {
    const aseguramientos = await obtenerReportesAseguramientos();

    const doc = new jsPDF();
    const pageHeight = doc.internal.pageSize.getHeight();
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPosition = 15;

    // Encabezado
    doc.setFontSize(18);
    doc.setTextColor(33, 37, 41);
    doc.text("REPORTE DE ASEGURAMIENTOS", pageWidth / 2, yPosition, {
      align: "center",
    });

    yPosition += 10;
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(
      `Fecha de Generación: ${new Date().toLocaleString("es-ES")}`,
      pageWidth / 2,
      yPosition,
      { align: "center" }
    );

    yPosition += 12;
    doc.setDrawColor(0, 0, 0);
    doc.line(15, yPosition, pageWidth - 15, yPosition);

    // Tabla de aseguramientos
    yPosition += 12;
    doc.setFontSize(11);
    doc.setTextColor(33, 37, 41);
    doc.setFont(undefined, "bold");
    doc.text("Circuitos Asegurados", 15, yPosition);

    yPosition += 10;
    doc.setFontSize(9);
    doc.setFont(undefined, "normal");

    const tableHeaders = ["Circuito", "Tipo", "MW", "Desde", "Hasta"];
    let xPos = 15;
    const colWidths = [80, 20, 15, 25, 25];

    doc.setFont(undefined, "bold");
    doc.setTextColor(60, 60, 60);
    doc.setFillColor(220, 220, 220);
    tableHeaders.forEach((header, i) => {
      doc.rect(xPos, yPosition - 5, colWidths[i], 7, "F");
      doc.text(header, xPos + 2, yPosition, { align: "left" });
      xPos += colWidths[i];
    });

    yPosition += 10;
    doc.setFont(undefined, "normal");
    doc.setTextColor(60, 60, 60);

    aseguramientos.forEach((aseg, index) => {
      if (yPosition > pageHeight - 20) {
        doc.addPage();
        yPosition = 15;
      }

      xPos = 15;
      const row = [
        aseg.circuito.substring(0, 25),
        aseg.tipo,
        aseg.mw.toString(),
        formatearFecha(aseg.fechaInicial),
        formatearFecha(aseg.fechaFinal),
      ];

      if (index % 2 === 0) {
        doc.setFillColor(245, 245, 245);
        doc.rect(xPos - 1, yPosition - 5, 165, 6, "F");
      }

      doc.setDrawColor(200, 200, 200);
      doc.rect(xPos - 1, yPosition - 5, 165, 6);

      row.forEach((cell, i) => {
        doc.text(cell, xPos + 2, yPosition, { align: "left" });
        xPos += colWidths[i];
      });

      yPosition += 7;
    });

    // Resumen al final
    yPosition += 8;
    doc.setFontSize(11);
    doc.setFont(undefined, "bold");
    doc.setTextColor(33, 37, 41);
    doc.text("Resumen", 15, yPosition);

    yPosition += 6;
    doc.setFontSize(10);
    doc.setFont(undefined, "normal");
    const totalMW = aseguramientos.reduce((sum, a) => sum + a.mw, 0);
    doc.text(`Total de Circuitos Asegurados: ${aseguramientos.length}`, 15, yPosition);
    yPosition += 6;
    doc.text(`MW Total Asegurado: ${totalMW.toFixed(2)} MW`, 15, yPosition);

    // Footer
    yPosition = pageHeight - 10;
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Generado: ${new Date().toLocaleString("es-ES")}`,
      15,
      yPosition
    );

    const fileName = `reporte_aseguramientos_${formatearFechaArchivo(
      new Date()
    )}.pdf`;
    doc.save(fileName);
  } catch (error) {
    console.error("Error generando reporte aseguramientos PDF:", error);
    throw error;
  }
};

/**
 * Genera reporte de aseguramientos en Excel
 * @returns {Promise<void>}
 */
export const descargarReporteAseguramientosExcel = async () => {
  try {
    const aseguramientos = await obtenerReportesAseguramientos();

    const workbook = XLSX.utils.book_new();

    const aseguramientosData = [
      [
        "Circuito",
        "Tipo",
        "MW",
        "Fecha Inicial",
        "Fecha Final",
        "Observaciones",
      ],
      ...aseguramientos.map((a) => [
        a.circuito,
        a.tipo,
        a.mw,
        formatearFecha(a.fechaInicial),
        formatearFecha(a.fechaFinal),
        a.observaciones,
      ]),
      [],
      ["Total MW:", aseguramientos.reduce((sum, a) => sum + a.mw, 0)],
    ];

    const sheet = XLSX.utils.aoa_to_sheet(aseguramientosData);
    sheet["!cols"] = [
      { wch: 30 },
      { wch: 12 },
      { wch: 10 },
      { wch: 18 },
      { wch: 18 },
      { wch: 40 },
    ];

    XLSX.utils.book_append_sheet(workbook, sheet, "Aseguramientos");

    const fileName = `reporte_aseguramientos_${formatearFechaArchivo(
      new Date()
    )}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  } catch (error) {
    console.error("Error generando reporte aseguramientos Excel:", error);
    throw error;
  }
};

/**
 * Genera reporte estadístico de déficit y rotaciones
 * @returns {Promise<Object>} Datos estadísticos
 */
export const obtenerReporteEstadistico = async () => {
  try {
    // TODO: Conectar con endpoint cuando esté listo
    // endpoint: GET /api/reportes/estadisticas

    const reportes = await obtenerReportes();
    const stats = await obtenerEstadisticasReportes();

    return {
      ...stats,
      totalReportesHistoria: reportes.length,
      ultimaRotacion: reportes[0]?.fecha || new Date(),
      reportesUltimos30Dias: reportes.filter((r) => {
        const hace30 = new Date();
        hace30.setDate(hace30.getDate() - 30);
        return new Date(r.fecha) >= hace30;
      }).length,
    };
  } catch (error) {
    console.error("Error obteniendo reporte estadístico:", error);
    throw error;
  }
};

/**
 * Genera reporte estadístico en PDF
 * @returns {Promise<void>}
 */
export const descargarReporteEstadisticoPDF = async () => {
  try {
    const stats = await obtenerReporteEstadistico();

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPosition = 15;

    // Encabezado
    doc.setFontSize(18);
    doc.setTextColor(33, 37, 41);
    doc.text("REPORTE ESTADÍSTICO", pageWidth / 2, yPosition, {
      align: "center",
    });

    yPosition += 10;
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(
      `Período: ${new Date().toLocaleString("es-ES")}`,
      pageWidth / 2,
      yPosition,
      { align: "center" }
    );

    yPosition += 12;
    doc.setDrawColor(0, 0, 0);
    doc.line(15, yPosition, pageWidth - 15, yPosition);

    // Estadísticas principales
    yPosition += 12;
    doc.setFontSize(12);
    doc.setTextColor(33, 37, 41);
    doc.setFont(undefined, "bold");
    doc.text("Estadísticas Generales", 15, yPosition);

    yPosition += 10;
    doc.setFontSize(10);
    doc.setFont(undefined, "normal");
    doc.setTextColor(60, 60, 60);

    const metricas = [
      ["Total de Reportes:", stats.totalReportes.toString()],
      ["MW Total Apagado:", `${stats.mwTotalApagado} MW`],
      ["Circuitos Totales:", stats.circuitosTotales.toString()],
      ["Circuitos Apagables:", stats.circuitosApagables.toString()],
      [
        "Promedio MW por Rotación:",
        `${stats.promedioMWPorRotacion.toFixed(2)} MW`,
      ],
    ];

    metricas.forEach(([label, value]) => {
      doc.setFont(undefined, "bold");
      doc.text(label, 15, yPosition);
      doc.setFont(undefined, "normal");
      doc.text(value, 100, yPosition);
      yPosition += 8;
    });

    // Bloques más rotados
    yPosition += 8;
    doc.setFontSize(12);
    doc.setFont(undefined, "bold");
    doc.setTextColor(33, 37, 41);
    doc.text("Bloques Más Rotados", 15, yPosition);

    yPosition += 10;
    doc.setFontSize(10);
    doc.setFont(undefined, "normal");
    doc.setTextColor(60, 60, 60);

    stats.bloquesMasRotados.forEach((item) => {
      doc.text(`Bloque ${item.bloque}: ${item.cantidad} rotaciones`, 15, yPosition);
      yPosition += 6;
    });

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Generado: ${new Date().toLocaleString("es-ES")}`,
      15,
      285
    );

    const fileName = `reporte_estadistico_${formatearFechaArchivo(
      new Date()
    )}.pdf`;
    doc.save(fileName);
  } catch (error) {
    console.error("Error generando reporte estadístico PDF:", error);
    throw error;
  }
};

// ===== FUNCIONES DE UTILIDAD =====

/**
 * Formatea una fecha en formato completo para mostrar
 * @param {Date} fecha - Fecha a formatear
 * @returns {string} Fecha formateada
 */
function formatearFechaCompleta(fecha) {
  if (!fecha) return "N/A";
  const date = new Date(fecha);
  return date.toLocaleString("es-ES", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

/**
 * Formatea una fecha en formato corto (DD/MM/YYYY)
 * @param {Date} fecha - Fecha a formatear
 * @returns {string} Fecha formateada
 */
function formatearFecha(fecha) {
  if (!fecha) return "N/A";
  const date = new Date(fecha);
  return date.toLocaleDateString("es-ES", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

/**
 * Formatea una fecha para usar en nombres de archivo
 * @param {Date} fecha - Fecha a formatear
 * @returns {string} Fecha formateada (YYYYMMDD_HHMMSS)
 */
function formatearFechaArchivo(fecha) {
  if (!fecha) fecha = new Date();
  const date = new Date(fecha);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}${month}${day}_${hours}${minutes}`;
}
