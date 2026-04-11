// app/aseguramientos/page.jsx
"use client";
import React, { useState, useEffect } from "react";
import { AlertCircle, Calendar, FileSpreadsheet, ShieldCheck } from "lucide-react";
import * as XLSX from "xlsx";
import { apiClient } from "@/lib/api/apiClient";
import { getToday, formatDateDisplay, formatDateTimeDisplay } from "@/lib/utils/dateUtils";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import AlertMessage from "@/components/shared/AlertMessage";
import Pagination from "@/components/shared/Pagination";
import AseguramientosForm from "@/components/aseguramientos/AseguramientosForm";
import AseguramientosTable from "@/components/aseguramientos/AseguramientosTable";

export default function AseguramientosPage() {
  // ESTADOS
  const [aseguramientos, setAseguramientos] = useState([]);
  const [circuitos, setCircuitos] = useState([]);
  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date());
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [pagina, setPagina] = useState(1);
  const aseguramientosPorPagina = 10;

  // FORM STATE
  const [formData, setFormData] = useState({
    id_CircuitoP: "",
    fechaInicial: "",
    fechaFinal: "",
    Observaciones: "",
    mw: "",
    tipo: "Programado",
  });
  const [errorForm, setErrorForm] = useState(null);

  // CARGAR DATOS
  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setCargando(true);
      setError(null);
      const [asg, circ] = await Promise.all([
        apiClient.aseguramientos.getAll(),
        apiClient.circuitos.getApagables(),
      ]);
      setAseguramientos(asg);
      setCircuitos(circ);
    } catch (err) {
      setError("Error cargando datos: " + (err?.message || "Error desconocido"));
    } finally {
      setCargando(false);
    }
  };

  // FILTRAR POR FECHA
  const fechaComparacion = fechaSeleccionada instanceof Date ? fechaSeleccionada : new Date(fechaSeleccionada);
  const aseguramientosActivos = aseguramientos.filter(
    (a) => {
      const fechaIni = a.fechaInicial instanceof Date ? a.fechaInicial : new Date(a.fechaInicial);
      const fechaFin = a.fechaFinal instanceof Date ? a.fechaFinal : new Date(a.fechaFinal);
      return fechaIni <= fechaComparacion && fechaFin >= fechaComparacion;
    }
  );
  const aseguramientosPaginados = aseguramientosActivos
    .sort((a, b) => {
      const fechaFinA = a.fechaFinal instanceof Date ? a.fechaFinal : new Date(a.fechaFinal);
      const fechaFinB = b.fechaFinal instanceof Date ? b.fechaFinal : new Date(b.fechaFinal);
      return fechaFinB.getTime() - fechaFinA.getTime();
    })
    .slice((pagina - 1) * aseguramientosPorPagina, pagina * aseguramientosPorPagina);

  const totalMW = aseguramientosActivos.reduce((sum, a) => sum + (a.mw || 0), 0);
  const totalPaginas = Math.ceil(
    aseguramientosActivos.length / aseguramientosPorPagina
  );

  // HANDLERS
  const handleSubmitForm = async (e) => {
    e.preventDefault();
    setErrorForm(null);

    // VALIDACIÓN
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
      const circuito = circuitos.find(
        (c) => c.idCircuitoP === Number(formData.id_CircuitoP)
      );
      if (!circuito) {
        setErrorForm("Circuito no encontrado");
        return;
      }

      const nuevoAseguramiento = {
        id_CircuitoP: Number(formData.id_CircuitoP),
        CircuitoP: circuito.CircuitoP || "",
        fechaInicial: new Date(formData.fechaInicial),
        fechaFinal: new Date(formData.fechaFinal),
        Observaciones: formData.Observaciones,
        mw: formData.mw ? Number(formData.mw) : null,
        tipo: formData.tipo,
      };

      await apiClient.aseguramientos.create(nuevoAseguramiento);
      setAseguramientos([...aseguramientos, nuevoAseguramiento]);
      setMostrarFormulario(false);
      setFormData({
        id_CircuitoP: "",
        fechaInicial: "",
        fechaFinal: "",
        Observaciones: "",
        mw: "",
        tipo: "Programado",
      });
    } catch (err) {
      setErrorForm("Error creando aseguramiento: " + (err?.message || "Error desconocido"));
    }
  };

  const exportarAExcel = (datos) => {
    const datosFormateados = datos.map((item) => ({
      "ID Circuito P": item.id_CircuitoP,
      "Circuito": item.CircuitoP,
      "Fecha Inicial": formatDateDisplay(item.fechaInicial),
      "Fecha Final": formatDateDisplay(item.fechaFinal),
      "Observaciones": item.Observaciones,
      "MW": item.mw || "N/A",
      "Tipo": item.tipo,
    }));

    const hoja = XLSX.utils.json_to_sheet(datosFormateados);
    const libro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libro, hoja, "Aseguramientos");
    const nombreFecha = fechaSeleccionada instanceof Date ? formatDateDisplay(fechaSeleccionada) : formatDateDisplay(new Date(fechaSeleccionada));
    XLSX.writeFile(
      libro,
      `Aseguramientos_${nombreFecha}.xlsx`
    );
  };

  if (cargando) {
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
            Los circuitos listados aquí quedan exentos de rotación para proteger
            servicios críticos. Se muestra el estado para la fecha: <strong>{formatDateDisplay(fechaSeleccionada)}</strong>
          </p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <AlertMessage
          type="error"
          title="Error"
          message={error}
          onClose={() => setError(null)}
        />
      )}

      {/* Cabecera y Controles */}
      <div className="flex justify-between items-start bg-white p-6 rounded-xl border shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Aseguramientos Activos</h2>
          <p className="text-sm text-slate-500 mt-1">
            {aseguramientosActivos.length} aseguramiento(s) activo(s) · 
            <span className="font-bold text-blue-600">{totalMW.toFixed(2)} MW</span> protegido(s)
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => exportarAExcel(aseguramientosActivos)}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors"
          >
            <FileSpreadsheet size={18} /> Exportar
          </button>
          <button
            onClick={() => setMostrarFormulario(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors"
          >
            Nuevo
          </button>
        </div>
      </div>

      {/* Selector de Fecha */}
      <div className="bg-white p-4 rounded-xl border shadow-sm">
        <label className="flex items-center gap-3">
          <Calendar size={20} className="text-slate-600" />
          <span className="font-medium text-slate-700">Mostrar aseguramientos para la fecha:</span>
          <input
            type="date"
            value={
              fechaSeleccionada instanceof Date
                ? `${fechaSeleccionada.getFullYear()}-${String(fechaSeleccionada.getMonth() + 1).padStart(2, "0")}-${String(fechaSeleccionada.getDate()).padStart(2, "0")}`
                : new Date().toISOString().split("T")[0]
            }
            onChange={(e) => {
              setFechaSeleccionada(new Date(e.target.value));
              setPagina(1);
            }}
            className="px-3 py-2 border rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </label>
      </div>

      {/* Tabla */}
      <AseguramientosTable
        aseguramientos={aseguramientosPaginados}
        onDelete={() => {}} // Implementar cuando sea necesario
      />

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
                  Circuito Asegurado
                </label>
                <select
                  value={formData.id_CircuitoP}
                  onChange={(e) => setFormData({ ...formData, id_CircuitoP: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">Selecciona un circuito apagable...</option>
                  {circuitos.map((c) => (
                    <option key={c.idCircuitoP} value={c.idCircuitoP}>
                      {c.CircuitoP} (ID: {c.idCircuitoP})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Fecha Inicial</label>
                <input
                  type="date"
                  value={formData.fechaInicial}
                  onChange={(e) => setFormData({ ...formData, fechaInicial: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Fecha Final</label>
                <input
                  type="date"
                  value={formData.fechaFinal}
                  onChange={(e) => setFormData({ ...formData, fechaFinal: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
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
                <label className="block text-sm font-bold text-slate-700 mb-2">Tipo</label>
                <select
                  value={formData.tipo}
                  onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >
                  <option>Programado</option>
                  <option>Permanente</option>
                  <option>Temporal</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Observaciones</label>
                <textarea
                  value={formData.Observaciones}
                  onChange={(e) => setFormData({ ...formData, Observaciones: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
                  rows={3}
                  placeholder="Motivo del aseguramiento..."
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
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
