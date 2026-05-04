"use client";
import React, { useState, useEffect, useCallback } from "react";
import {
  AlertCircle,
  Calendar,
  FileSpreadsheet,
  ShieldCheck,
} from "lucide-react";
import * as XLSX from "xlsx";
import {
  obtenerAseguramientos,
  crearAseguramiento,
  eliminarAseguramiento,
} from "@/lib/services/aseguramientosService";
import { apiClient } from "@/lib/api/apiClient";
import { formatDateDisplay, formatDateTimeDisplay } from "@/lib/utils/dateUtils";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import AlertMessage from "@/components/shared/AlertMessage";
import Pagination from "@/components/shared/Pagination";
import AseguramientosTable from "@/components/aseguramientos/AseguramientosTable";
import CircuitoAutocomplete from "@/components/shared/CircuitoAutocomplete";

export default function AseguramientosPage() {
  // ESTADOS
  const [aseguramientos, setAseguramientos] = useState([]);
  const [circuitos, setCircuitos] = useState([]);
  const [fechaSeleccionada, setFechaSeleccionada] = useState(null); // null = historial completo
  const [cargandoAseguramientos, setCargandoAseguramientos] = useState(true);
  const [cargandoCircuitos, setCargandoCircuitos] = useState(true);
  const [error, setError] = useState(null);
  const [exito, setExito] = useState(null);
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [totalAseguramientos, setTotalAseguramientos] = useState(0);
  const [totalMW, setTotalMW] = useState(0);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [eliminando, setEliminando] = useState(null);

  const aseguramientosPorPagina = 10;

  // Función para cargar circuitos (una sola vez)
  const cargarCircuitos = useCallback(async () => {
    try {
      setCargandoCircuitos(true);
      const datos = await apiClient.circuitos.getApagables();
      setCircuitos(datos?.results || datos || []);
    } catch (err) {
      setError("Error cargando circuitos: " + (err?.message || "Error desconocido"));
    } finally {
      setCargandoCircuitos(false);
    }
  }, []);

  // Función para cargar aseguramientos con paginación
  const cargarAseguramientos = useCallback(async () => {
    try {
      setCargandoAseguramientos(true);
      setError(null);

      // Convertir fecha a ISO solo si está seleccionada
      let fechaISO = undefined;
      if (fechaSeleccionada) {
        if (fechaSeleccionada instanceof Date) {
          fechaISO = fechaSeleccionada.toISOString().split("T")[0];
        } else {
          fechaISO = new Date(fechaSeleccionada).toISOString().split("T")[0];
        }
      }

      const datos = await obtenerAseguramientos(
        pagina,
        aseguramientosPorPagina,
        fechaISO
      );

      if (datos?.results) {
        setAseguramientos(datos.results);
        setTotalPaginas(datos.meta.totalPages);
        setTotalAseguramientos(datos.meta.total);
        
        // Calcular total MW
        const mwTotal = datos.results.reduce((sum, a) => sum + (a.mw || 0), 0);
        setTotalMW(mwTotal);
      } else {
        setAseguramientos([]);
        setTotalPaginas(1);
        setTotalAseguramientos(0);
        setTotalMW(0);
      }
    } catch (err) {
      const mensajeError = err?.message || "Error desconocido";
      setError(`Error cargando aseguramientos: ${mensajeError}`);
      setAseguramientos([]);
      setTotalPaginas(1);
      setTotalAseguramientos(0);
      setTotalMW(0);
    } finally {
      setCargandoAseguramientos(false);
    }
  }, [pagina, fechaSeleccionada]);

  // Cargar circuitos una sola vez al montar
  useEffect(() => {
    cargarCircuitos();
  }, [cargarCircuitos]);

  // Cargar aseguramientos cuando cambia página o fecha
  useEffect(() => {
    cargarAseguramientos();
  }, [cargarAseguramientos]);

  // ESTADO DE FORMULARIO
  const [formData, setFormData] = useState({
    id_CircuitoP: "",
    CircuitoP: "",
    fechaInicial: "",
    fechaFinal: "",
    Observaciones: "",
    mw: "",
    tipo: "Programado",
  });
  const [errorForm, setErrorForm] = useState(null);

  // HANDLERS DEL FORMULARIO
  const handleSubmitForm = async (e) => {
    e.preventDefault();
    setErrorForm(null);

    // VALIDACIONES
    if (!formData.id_CircuitoP) {
      setErrorForm("Selecciona un circuito");
      return;
    }
    if (!formData.fechaInicial || !formData.fechaFinal) {
      setErrorForm("Completa las fechas");
      return;
    }
    if (new Date(formData.fechaInicial) > new Date(formData.fechaFinal)) {
      setErrorForm("Fecha inicial no puede ser posterior a fecha final");
      return;
    }
    if (!formData.Observaciones.trim()) {
      setErrorForm("Añade observaciones");
      return;
    }

    try {
      setCargando(true);
      
      // Usar CircuitoP si viene en formData (desde ComboBox), si no, buscarlo
      let circuitoP = formData.CircuitoP;
      if (!circuitoP) {
        const circuito = circuitos.find(
          (c) => c.idCircuitoP === Number(formData.id_CircuitoP)
        );
        if (!circuito) {
          setErrorForm("Circuito no encontrado");
          return;
        }
        circuitoP = circuito.CircuitoP || "";
      }

      const nuevoAseguramiento = {
        id_CircuitoP: Number(formData.id_CircuitoP),
        CircuitoP: circuitoP,
        fechaInicial: new Date(formData.fechaInicial),
        fechaFinal: new Date(formData.fechaFinal),
        Observaciones: formData.Observaciones,
        mw: formData.mw ? Number(formData.mw) : null,
        tipo: formData.tipo,
      };

      await crearAseguramiento(nuevoAseguramiento);
      
      setExito(`Aseguramiento creado exitosamente para ${circuitoP}`);
      setMostrarFormulario(false);
      setFormData({
        id_CircuitoP: "",
        CircuitoP: "",
        fechaInicial: "",
        fechaFinal: "",
        Observaciones: "",
        mw: "",
        tipo: "Programado",
      });

      // Recargar aseguramientos
      await cargarAseguramientos();
    } catch (err) {
      setErrorForm("Error creando aseguramiento: " + (err?.message || "Error desconocido"));
    } finally {
      setCargando(false);
    }
  };

  const handleEliminarAseguramiento = async (id) => {
    try {
      setEliminando(id);
      await eliminarAseguramiento(id);
      setExito("Aseguramiento eliminado");
      await cargarAseguramientos();
    } catch (err) {
      setError("Error eliminando aseguramiento: " + (err?.message || "Error desconocido"));
    } finally {
      setEliminando(null);
    }
  };

  // EXPORTACIÓN
  const exportarAExcel = (datos) => {
    const datosFormateados = datos.map((item) => ({
      "ID Circuito P": item.id_CircuitoP,
      "Circuito": item.CircuitoP,
      "Fecha Inicial": formatDateTimeDisplay(item.fechaInicial),
      "Fecha Final": formatDateTimeDisplay(item.fechaFinal),
      "Observaciones": item.Observaciones,
      "MW": item.mw || "N/A",
      "Tipo": item.tipo,
    }));

    const hoja = XLSX.utils.json_to_sheet(datosFormateados);
    const libro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libro, hoja, "Aseguramientos");
    const nombreFecha = fechaSeleccionada 
      ? formatDateDisplay(fechaSeleccionada) 
      : "Historial";
    XLSX.writeFile(libro, `Aseguramientos_${nombreFecha}.xlsx`);
  };

  if (cargandoAseguramientos || cargandoCircuitos) {
    return <LoadingSpinner message="Cargando aseguramientos..." />;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* BANNER INFO */}
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg flex items-start gap-3">
        <AlertCircle className="text-blue-600 mt-1 shrink-0" size={20} />
        <div className="flex-1">
          <h3 className="text-blue-800 font-bold">Gestión de Circuitos Asegurados</h3>
          <p className="text-blue-700 text-sm">
            Los circuitos listados aquí quedan exentos de rotación para proteger servicios críticos.
            {fechaSeleccionada ? (
              <> Se muestra el estado para la fecha: <strong>{formatDateDisplay(fechaSeleccionada)}</strong></>
            ) : (
              <> Se muestra el <strong>historial completo</strong> de protecciones ordenado del más reciente al más antiguo</>
            )}
          </p>
        </div>
      </div>

      {/* Mensajes */}
      {error && (
        <AlertMessage
          type="error"
          title="Error"
          message={error}
          onClose={() => setError(null)}
        />
      )}

      {exito && (
        <AlertMessage
          type="success"
          title="Éxito"
          message={exito}
          onClose={() => setExito(null)}
        />
      )}

      {/* Cabecera y Controles */}
      <div className="flex justify-between items-start bg-white p-6 rounded-xl border shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <ShieldCheck className="text-blue-600" /> 
            {fechaSeleccionada ? "Aseguramientos Activos" : "Historial de Aseguramientos"}
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            {totalAseguramientos} aseguramiento(s) · 
            <span className="font-bold text-blue-600">{totalMW.toFixed(2)} MW</span> protegido(s)
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => exportarAExcel(aseguramientos)}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors"
          >
            <FileSpreadsheet size={18} /> Exportar
          </button>
          <button
            onClick={() => setMostrarFormulario(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors"
          >
            + Nuevo
          </button>
        </div>
      </div>

      {/* Selector de Fecha */}
      <div className="bg-white p-4 rounded-xl border shadow-sm">
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-3 flex-1">
            <Calendar size={20} className="text-slate-600" />
            <span className="font-medium text-slate-700">Filtrar por fecha (opcional):</span>
            <input
              type="date"
              value={
                fechaSeleccionada
                  ? `${fechaSeleccionada.getFullYear()}-${String(fechaSeleccionada.getMonth() + 1).padStart(2, "0")}-${String(fechaSeleccionada.getDate()).padStart(2, "0")}`
                  : ""
              }
              onChange={(e) => {
                if (e.target.value) {
                  setFechaSeleccionada(new Date(e.target.value));
                  setPagina(1);
                }
              }}
              className="px-3 py-2 border rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="Sin filtro"
            />
          </label>
          {fechaSeleccionada && (
            <button
              onClick={() => {
                setFechaSeleccionada(null);
                setPagina(1);
              }}
              className="px-3 py-2 bg-slate-200 hover:bg-slate-300 rounded-lg font-medium text-slate-700 transition-colors"
            >
              Limpiar filtro
            </button>
          )}
        </div>
        {fechaSeleccionada && (
          <p className="text-sm text-slate-500 mt-2">
            Mostrando aseguramientos activos el {formatDateDisplay(fechaSeleccionada)}
          </p>
        )}
        {!fechaSeleccionada && (
          <p className="text-sm text-slate-500 mt-2">
            Mostrando historial completo de protecciones
          </p>
        )}
      </div>

      {/* Tabla */}
      {cargandoAseguramientos ? (
        <LoadingSpinner message="Cargando..." />
      ) : (
        <AseguramientosTable
          aseguramientos={aseguramientos}
          onDelete={handleEliminarAseguramiento}
          eliminando={eliminando}
        />
      )}

      {/* Paginación */}
      {totalPaginas > 1 && (
        <Pagination
          currentPage={pagina}
          totalPages={totalPaginas}
          onPageChange={setPagina}
        />
      )}

      {/* Modal Formulario */}
      {mostrarFormulario && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border">
            <div className="p-6 border-b flex justify-between items-center bg-slate-50">
              <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <ShieldCheck className="text-blue-600" /> Crear Aseguramiento
              </h3>
              <button
                onClick={() => {
                  setMostrarFormulario(false);
                  setErrorForm(null);
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="p-6 space-y-4">
              {errorForm && (
                <AlertMessage
                  type="error"
                  title="Error"
                  message={errorForm}
                />
              )}

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Circuito Asegurado *
                </label>
                <CircuitoAutocomplete
                  circuitos={circuitos}
                  value={
                    formData.id_CircuitoP
                      ? {
                          id_CircuitoP: Number(formData.id_CircuitoP),
                          CircuitoP: formData.CircuitoP,
                        }
                      : null
                  }
                  onChange={(value) => {
                    if (value) {
                      setFormData({ ...formData, ...value });
                    } else {
                      setFormData({
                        ...formData,
                        id_CircuitoP: "",
                        CircuitoP: "",
                      });
                    }
                  }}
                  placeholder="Busca por nombre o ID..."
                  disabled={cargando}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Tipo *</label>
                <select
                  value={formData.tipo}
                  onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
                >
                  <option>Programado</option>
                  <option>Emergencia</option>
                  <option>Preventivo</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Fecha Inicial *</label>
                <input
                  type="datetime-local"
                  value={formData.fechaInicial}
                  onChange={(e) => setFormData({ ...formData, fechaInicial: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Fecha Final *</label>
                <input
                  type="datetime-local"
                  value={formData.fechaFinal}
                  onChange={(e) => setFormData({ ...formData, fechaFinal: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">MW (opcional)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.mw}
                  onChange={(e) => setFormData({ ...formData, mw: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="Ej: 45.5"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Observaciones *</label>
                <textarea
                  value={formData.Observaciones}
                  onChange={(e) => setFormData({ ...formData, Observaciones: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
                  rows={3}
                  placeholder="Motivo del aseguramiento..."
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setMostrarFormulario(false);
                    setErrorForm(null);
                  }}
                  className="flex-1 px-4 py-2 border rounded-lg font-medium hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={cargando}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 disabled:bg-slate-400 transition-colors"
                >
                  {cargando ? "Guardando..." : "Guardar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
