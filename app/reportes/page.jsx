"use client";
import React, { useState, useEffect } from "react";
import { Download, FileText, Search, AlertCircle, Loader } from "lucide-react";
import { obtenerReportes, descargarReportePDF } from "@/lib/services/reportesService";

export default function ReportesPage() {
  const [reportes, setReportes] = useState([]);
  const [reportesFiltrados, setReportesFiltrados] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [filtroDesde, setFiltroDesde] = useState("");
  const [filtroHasta, setFiltroHasta] = useState("");
  const [descargando, setDescargando] = useState(null);

  // Cargar reportes al montar
  useEffect(() => {
    cargarReportes();
  }, []);

  // Aplicar filtros cuando cambien
  useEffect(() => {
    aplicarFiltros();
  }, [reportes, filtroDesde, filtroHasta]);

  const cargarReportes = async () => {
    try {
      setCargando(true);
      setError(null);
      const datos = await obtenerReportes();
      setReportes(datos);
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
    // Los filtros ya se aplican automáticamente via useEffect
    // Este botón es más para confirmar manualmente si lo desea
    aplicarFiltros();
  };

  const handleDescargar = async (reporteId) => {
    try {
      setDescargando(reporteId);
      await descargarReportePDF(reporteId);
    } catch (err) {
      setError("Error descargando reporte: " + err?.message);
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
            Historial de Reportes y Rotaciones
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            {reportesFiltrados.length} reporte(s) mostrado(s)
          </p>
        </div>
      </div>

      {/* Filtros de búsqueda */}
      <div className="bg-white p-4 rounded-xl shadow-sm border space-y-4">
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

      {/* Tabla de Reportes Generados */}
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
                <th className="p-4 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {reportesFiltrados.length > 0 ? (
                reportesFiltrados.map((reporte) => (
                  <tr key={reporte.id || reporte.idRotacion} className="hover:bg-slate-50 transition-colors">
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
                      {reporte.cantidadCircuitos || reporte.cantidad_circuitos || 0}
                    </td>
                    <td className="p-4 font-bold text-red-600">
                      {reporte.mwTotal || reporte.mw_total || 0} MW
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleDescargar(reporte.id || reporte.idRotacion)}
                        disabled={descargando === (reporte.id || reporte.idRotacion)}
                        className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Descargar PDF"
                      >
                        {descargando === (reporte.id || reporte.idRotacion) ? (
                          <Loader size={20} className="animate-spin" />
                        ) : (
                          <Download size={20} />
                        )}
                      </button>
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
            Usa los filtros de fecha para buscar reportes específicos.
          </p>
        </div>
      )}
    </div>
  );
}
