"use client";
import React, { useState, useEffect } from "react";
import {
  Download,
  FileText,
  Search,
  AlertCircle,
  Loader,
  BarChart3,
  Shield,
} from "lucide-react";
import {
  obtenerReportes,
  descargarReportePDF,
  descargarReporteExcel,
  descargarReporteAseguramientosPDF,
  descargarReporteAseguramientosExcel,
  descargarReporteEstadisticoPDF,
  obtenerEstadisticasReportes,
} from "@/lib/services/reportesService";

export default function ReportesPage() {
  const [reportes, setReportes] = useState([]);
  const [reportesFiltrados, setReportesFiltrados] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [filtroDesde, setFiltroDesde] = useState("");
  const [filtroHasta, setFiltroHasta] = useState("");
  const [descargando, setDescargando] = useState(null);
  const [estadisticas, setEstadisticas] = useState(null);
  const [tabActiva, setTabActiva] = useState("reportes"); // reportes, aseguramientos, estadisticas

  // Cargar reportes al montar
  useEffect(() => {
    cargarDatos();
  }, []);

  // Aplicar filtros cuando cambien
  useEffect(() => {
    aplicarFiltros();
  }, [reportes, filtroDesde, filtroHasta]);

  const cargarDatos = async () => {
    try {
      setCargando(true);
      setError(null);
      const datos = await obtenerReportes();
      const stats = await obtenerEstadisticasReportes();
      setReportes(datos);
      setEstadisticas(stats);
    } catch (err) {
      setError("Error cargando reportes: " + (err?.message || "Error desconocido"));
      setReportes([]);
    } finally {
      setCargando(false);
    }
  };

  const aplicarFiltros = () => {
    let filtrados = [...reportes];

    // Filtrar por fecha desde
    if (filtroDesde) {
      const desdeDate = new Date(filtroDesde).getTime();
      filtrados = filtrados.filter((r) => {
        const reporteDate = new Date(r.fecha || r.createdAt).getTime();
        return reporteDate >= desdeDate;
      });
    }

    // Filtrar por fecha hasta
    if (filtroHasta) {
      const hastaDate = new Date(filtroHasta);
      hastaDate.setHours(23, 59, 59, 999);
      const hastaTime = hastaDate.getTime();
      filtrados = filtrados.filter((r) => {
        const reporteDate = new Date(r.fecha || r.createdAt).getTime();
        return reporteDate <= hastaTime;
      });
    }

    // Ordenar por fecha descendente (más recientes primero)
    filtrados.sort(
      (a, b) =>
        new Date(b.fecha || b.createdAt).getTime() -
        new Date(a.fecha || a.createdAt).getTime()
    );

    setReportesFiltrados(filtrados);
  };

  const handleFiltrar = () => {
    aplicarFiltros();
  };

  const handleDescargarPDF = async (reporteId) => {
    try {
      setDescargando(`pdf-${reporteId}`);
      await descargarReportePDF(reporteId);
    } catch (err) {
      setError("Error descargando PDF: " + err?.message);
    } finally {
      setDescargando(null);
    }
  };

  const handleDescargarExcel = async (reporteId) => {
    try {
      setDescargando(`excel-${reporteId}`);
      await descargarReporteExcel(reporteId);
    } catch (err) {
      setError("Error descargando Excel: " + err?.message);
    } finally {
      setDescargando(null);
    }
  };

  const handleDescargarAseguramientosPDF = async () => {
    try {
      setDescargando("aseg-pdf");
      await descargarReporteAseguramientosPDF();
    } catch (err) {
      setError("Error descargando reportes: " + err?.message);
    } finally {
      setDescargando(null);
    }
  };

  const handleDescargarAseguramientosExcel = async () => {
    try {
      setDescargando("aseg-excel");
      await descargarReporteAseguramientosExcel();
    } catch (err) {
      setError("Error descargando reportes: " + err?.message);
    } finally {
      setDescargando(null);
    }
  };

  const handleDescargarEstadisticoPDF = async () => {
    try {
      setDescargando("stats-pdf");
      await descargarReporteEstadisticoPDF();
    } catch (err) {
      setError("Error descargando estadísticas: " + err?.message);
    } finally {
      setDescargando(null);
    }
  };

  const limpiarFiltros = () => {
    setFiltroDesde("");
    setFiltroHasta("");
  };

  // Función para formatear fechas
  const formatearFecha = (fecha) => {
    if (!fecha) return "N/A";
    const date = new Date(fecha);
    return date.toLocaleString("es-ES", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (cargando) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-slate-600">Cargando reportes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cabecera */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">
            Módulo de Reportes y Exportación
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Genera, visualiza y descarga reportes en PDF y Excel
          </p>
        </div>
      </div>

      {/* Tabs de navegación */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="flex border-b">
          <button
            onClick={() => setTabActiva("reportes")}
            className={`px-6 py-4 font-semibold text-sm transition-colors flex items-center gap-2 ${
              tabActiva === "reportes"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-slate-600 hover:text-slate-800"
            }`}
          >
            <FileText size={18} /> Historial de Rotaciones
          </button>
          <button
            onClick={() => setTabActiva("aseguramientos")}
            className={`px-6 py-4 font-semibold text-sm transition-colors flex items-center gap-2 ${
              tabActiva === "aseguramientos"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-slate-600 hover:text-slate-800"
            }`}
          >
            <Shield size={18} /> Aseguramientos
          </button>
          <button
            onClick={() => setTabActiva("estadisticas")}
            className={`px-6 py-4 font-semibold text-sm transition-colors flex items-center gap-2 ${
              tabActiva === "estadisticas"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-slate-600 hover:text-slate-800"
            }`}
          >
            <BarChart3 size={18} /> Estadísticas
          </button>
        </div>
      </div>

      {/* Mensaje de error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg flex items-start gap-3">
          <AlertCircle size={20} className="mt-0.5 shrink-0" />
          <div>
            <p className="font-bold">Error</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* TAB 1: HISTORIAL DE REPORTES */}
      {tabActiva === "reportes" && (
        <>
          {/* Filtros de búsqueda */}
          <div className="bg-white p-4 rounded-xl shadow-sm border space-y-4">
            <h3 className="font-semibold text-slate-800">Filtrar Reportes</h3>
            <div className="flex flex-wrap gap-4 items-end">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-500 uppercase">
                  Desde
                </label>
                <input
                  type="date"
                  value={filtroDesde}
                  onChange={(e) => setFiltroDesde(e.target.value)}
                  className="border rounded-lg p-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-500 uppercase">
                  Hasta
                </label>
                <input
                  type="date"
                  value={filtroHasta}
                  onChange={(e) => setFiltroHasta(e.target.value)}
                  className="border rounded-lg p-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                onClick={handleFiltrar}
                className="bg-slate-800 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-slate-700 transition-all"
              >
                <Search size={18} /> Filtrar
              </button>
              <button
                onClick={limpiarFiltros}
                className="bg-slate-200 text-slate-800 px-6 py-2 rounded-lg font-bold hover:bg-slate-300 transition-all"
              >
                Limpiar
              </button>
            </div>
          </div>

          {/* Tabla de Reportes */}
          <div className="bg-white rounded-xl shadow-md border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b text-slate-600 text-xs uppercase font-bold">
                  <tr>
                    <th className="p-4">Fecha y Hora</th>
                    <th className="p-4">Tipo de Reporte</th>
                    <th className="p-4">Generado por</th>
                    <th className="p-4">Circuitos</th>
                    <th className="p-4">MW Totales</th>
                    <th className="p-4 text-right">Descargas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {reportesFiltrados.length > 0 ? (
                    reportesFiltrados.map((reporte) => (
                      <tr
                        key={reporte.id || reporte.idRotacion}
                        className="hover:bg-slate-50 transition-colors"
                      >
                        <td className="p-4 font-mono text-sm">
                          {formatearFecha(reporte.fecha || reporte.createdAt)}
                        </td>
                        <td className="p-4">
                          <span className="flex items-center gap-2">
                            <FileText size={16} className="text-blue-500" />
                            {reporte.tipo || "Rotación"}
                            {reporte.bloque && ` - Bloque ${reporte.bloque}`}
                          </span>
                        </td>
                        <td className="p-4 text-sm font-medium text-slate-600">
                          {reporte.generadoPor || reporte.usuario || "Sistema"}
                        </td>
                        <td className="p-4 text-center font-semibold">
                          {reporte.cantidadCircuitos ||
                            reporte.cantidad_circuitos ||
                            0}
                        </td>
                        <td className="p-4 font-bold text-red-600">
                          {reporte.mwTotal || reporte.mw_total || 0} MW
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() =>
                                handleDescargarPDF(
                                  reporte.id || reporte.idRotacion
                                )
                              }
                              disabled={
                                descargando === `pdf-${reporte.id || reporte.idRotacion}`
                              }
                              className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Descargar PDF"
                            >
                              {descargando === `pdf-${reporte.id || reporte.idRotacion}` ? (
                                <Loader size={20} className="animate-spin" />
                              ) : (
                                <Download size={20} />
                              )}
                            </button>
                            <button
                              onClick={() =>
                                handleDescargarExcel(
                                  reporte.id || reporte.idRotacion
                                )
                              }
                              disabled={
                                descargando === `excel-${reporte.id || reporte.idRotacion}`
                              }
                              className="text-green-600 hover:bg-green-50 p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Descargar Excel"
                            >
                              {descargando === `excel-${reporte.id || reporte.idRotacion}` ? (
                                <Loader size={20} className="animate-spin" />
                              ) : (
                                <Download size={20} />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-500">
                        {reportes.length === 0
                          ? "No hay reportes generados aún"
                          : "No hay reportes que coincidan con los filtros"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Nota informativa */}
          {reportesFiltrados.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-lg text-sm">
              <p className="font-semibold">💡 Información</p>
              <p>
                Los reportes se generan automáticamente cuando creas una rotación en la página de Circuitos.
                Descarga en PDF para un formato profesional o en Excel para análisis adicional.
              </p>
            </div>
          )}
        </>
      )}

      {/* TAB 2: ASEGURAMIENTOS */}
      {tabActiva === "aseguramientos" && (
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-xl shadow-md border">
            <h3 className="text-lg font-bold text-slate-800 mb-4">
              Reportes de Aseguramientos
            </h3>
            <p className="text-slate-600 mb-6">
              Descarga reportes detallados de todos los circuitos asegurados en el sistema.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={handleDescargarAseguramientosPDF}
                disabled={descargando === "aseg-pdf"}
                className="bg-red-50 border border-red-200 hover:border-red-400 p-4 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3"
              >
                <FileText size={24} className="text-red-600" />
                <div className="text-left">
                  <p className="font-bold text-slate-800">Descargar PDF</p>
                  <p className="text-xs text-slate-500">
                    Formato de documento profesional
                  </p>
                </div>
                {descargando === "aseg-pdf" && (
                  <Loader size={20} className="animate-spin ml-auto" />
                )}
              </button>

              <button
                onClick={handleDescargarAseguramientosExcel}
                disabled={descargando === "aseg-excel"}
                className="bg-green-50 border border-green-200 hover:border-green-400 p-4 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3"
              >
                <FileText size={24} className="text-green-600" />
                <div className="text-left">
                  <p className="font-bold text-slate-800">Descargar Excel</p>
                  <p className="text-xs text-slate-500">
                    Para análisis y cálculos
                  </p>
                </div>
                {descargando === "aseg-excel" && (
                  <Loader size={20} className="animate-spin ml-auto" />
                )}
              </button>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-lg text-sm">
            <p className="font-semibold">📋 Contenido del Reporte</p>
            <ul className="mt-2 space-y-1 list-disc list-inside">
              <li>Listado de todos los circuitos asegurados</li>
              <li>Tipo de aseguramiento (Permanente, Programado, Temporal)</li>
              <li>MW asegurado por circuito</li>
              <li>Fechas de validez del aseguramiento</li>
              <li>Observaciones y restricciones</li>
              <li>Total de MW asegurados</li>
            </ul>
          </div>
        </div>
      )}

      {/* TAB 3: ESTADÍSTICAS */}
      {tabActiva === "estadisticas" && (
        <div className="space-y-4">
          {/* Tarjetas de estadísticas */}
          {estadisticas && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-lg border shadow-sm">
                <p className="text-xs text-slate-500 uppercase font-bold">
                  Total Reportes
                </p>
                <p className="text-2xl font-bold text-slate-800 mt-2">
                  {estadisticas.totalReportes}
                </p>
              </div>

              <div className="bg-white p-4 rounded-lg border shadow-sm">
                <p className="text-xs text-slate-500 uppercase font-bold">
                  Circuitos Apagables
                </p>
                <p className="text-2xl font-bold text-blue-600 mt-2">
                  {estadisticas.circuitosApagables}
                </p>
              </div>

              <div className="bg-white p-4 rounded-lg border shadow-sm">
                <p className="text-xs text-slate-500 uppercase font-bold">
                  MW Total Apagado
                </p>
                <p className="text-2xl font-bold text-red-600 mt-2">
                  {estadisticas.mwTotalApagado} MW
                </p>
              </div>

              <div className="bg-white p-4 rounded-lg border shadow-sm">
                <p className="text-xs text-slate-500 uppercase font-bold">
                  Promedio MW
                </p>
                <p className="text-2xl font-bold text-green-600 mt-2">
                  {estadisticas.promedioMWPorRotacion.toFixed(1)} MW
                </p>
              </div>
            </div>
          )}

          {/* Descargar reporte estadístico */}
          <div className="bg-white p-6 rounded-xl shadow-md border">
            <h3 className="text-lg font-bold text-slate-800 mb-4">
              Reporte Estadístico General
            </h3>
            <p className="text-slate-600 mb-6">
              Descarga un análisis completo de estadísticas del sistema con gráficos y comparativas.
            </p>

            <button
              onClick={handleDescargarEstadisticoPDF}
              disabled={descargando === "stats-pdf"}
              className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {descargando === "stats-pdf" ? (
                <>
                  <Loader size={20} className="animate-spin" />
                  Generando PDF...
                </>
              ) : (
                <>
                  <BarChart3 size={20} />
                  Descargar Reporte Estadístico (PDF)
                </>
              )}
            </button>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-lg text-sm">
            <p className="font-semibold">📊 Métricas Incluidas</p>
            <ul className="mt-2 space-y-1 list-disc list-inside">
              <li>Total de reportes generados</li>
              <li>MW total apagado en el período</li>
              <li>Cantidad de circuitos afectados</li>
              <li>Promedio de MW por rotación</li>
              <li>Bloques más rotados</li>
              <li>Tendencias temporales</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
