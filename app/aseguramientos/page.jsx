// app/aseguramientos/page.jsx
"use client";
import React, { useState, useEffect } from "react";
import {
  AlertCircle,
  Edit,
  Plus,
  ShieldCheck,
  Trash2,
  X,
  Calendar,
  FileSpreadsheet,
} from "lucide-react";
import * as XLSX from "xlsx";
import { apiClient } from "@/lib/api/apiClient";
import { getToday, formatDateDisplay, formatDateTimeDisplay } from "@/lib/utils/dateUtils";

export default function AseguramientosPage() {
  // ESTADOS
  const [aseguramientos, setAseguramientos] = useState([]);
  const [circuitos, setCircuitos] = useState([]);
  const [fechaSeleccionada, setFechaSeleccionada] = useState(getToday());
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
  const aseguramientosActivos = aseguramientos.filter(
    (a) => a.fechaInicial <= fechaSeleccionada && a.fechaFinal >= fechaSeleccionada
  );
  const aseguramientosPaginados = aseguramientosActivos
    .sort((a, b) => b.fechaFinal.getTime() - a.fechaFinal.getTime())
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
    XLSX.writeFile(
      libro,
      `Aseguramientos_${formatDateDisplay(fechaSeleccionada)}.xlsx`
    );
  };

  if (cargando) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-slate-600">Cargando aseguramientos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
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

      {/* CABECERA */}
      <div className="flex justify-between items-start bg-white p-6 rounded-xl border shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Aseguramientos Activos</h2>
          <p className="text-sm text-slate-500 mt-1">
            {aseguramientosActivos.length} aseguramiento(s) activo(s) ·{" "}
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
            <Plus size={18} /> Nuevo
          </button>
        </div>
      </div>

      {/* SELECTOR DE FECHA */}
      <div className="bg-white p-4 rounded-xl border shadow-sm">
        <label className="flex items-center gap-3">
          <Calendar size={20} className="text-slate-600" />
          <span className="font-medium text-slate-700">Mostrar aseguramientos para la fecha:</span>
          <input
            type="date"
            value={fechaSeleccionada.toISOString().split("T")[0]}
            onChange={(e) => {
              setFechaSeleccionada(new Date(e.target.value));
              setPagina(1);
            }}
            className="px-3 py-2 border rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </label>
      </div>

      {/* TABLA */}
      <div className="bg-white rounded-xl shadow-md border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-800 text-white">
              <tr>
                <th className="px-6 py-3 font-semibold">Circuito</th>
                <th className="px-6 py-3 font-semibold">Fecha Inicial</th>
                <th className="px-6 py-3 font-semibold">Fecha Final</th>
                <th className="px-6 py-3 font-semibold text-center">MW</th>
                <th className="px-6 py-3 font-semibold">Tipo</th>
                <th className="px-6 py-3 font-semibold">Observaciones</th>
                <th className="px-6 py-3 font-semibold text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {aseguramientosPaginados.length > 0 ? (
                aseguramientosPaginados.map((asg, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-3 font-bold text-blue-600">
                      {asg.CircuitoP}
                    </td>
                    <td className="px-6 py-3 font-mono text-slate-600">
                      {formatDateDisplay(asg.fechaInicial)}
                    </td>
                    <td className="px-6 py-3 font-mono text-slate-600">
                      {formatDateDisplay(asg.fechaFinal)}
                    </td>
                    <td className="px-6 py-3 text-center font-bold">
                      {asg.mw ? `${asg.mw.toFixed(1)} MW` : "—"}
                    </td>
                    <td className="px-6 py-3">
                      <span className="inline-block bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-bold">
                        {asg.tipo}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-slate-600 text-xs">
                      {asg.Observaciones}
                    </td>
                    <td className="px-6 py-3 text-center">
                      <button className="text-slate-400 hover:text-red-600 transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                    No hay aseguramientos activos para esta fecha
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PAGINACIÓN */}
      {totalPaginas > 1 && (
        <div className="flex justify-center items-center gap-2">
          <button
            onClick={() => setPagina(Math.max(1, pagina - 1))}
            disabled={pagina === 1}
            className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
          >
            ←
          </button>
          {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPagina(p)}
              className={`px-3 py-1 rounded font-medium ${
                pagina === p ? "bg-blue-600 text-white" : "border hover:bg-slate-50"
              }`}
            >
              {p}
            </button>
          ))}
          <button
            onClick={() => setPagina(Math.min(totalPaginas, pagina + 1))}
            disabled={pagina === totalPaginas}
            className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
          >
            →
          </button>
        </div>
      )}

      {/* MODAL FORMULARIO */}
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
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="p-6 space-y-4">
              {errorForm && (
                <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-lg text-sm">
                  {errorForm}
                </div>
              )}

              {/* Circuito */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Circuito Asegurado
                </label>
                <select
                  value={formData.id_CircuitoP}
                  onChange={(e) =>
                    setFormData({ ...formData, id_CircuitoP: e.target.value })
                  }
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

              {/* Fecha Inicial */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Fecha Inicial
                </label>
                <input
                  type="date"
                  value={formData.fechaInicial}
                  onChange={(e) =>
                    setFormData({ ...formData, fechaInicial: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Fecha Final */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Fecha Final
                </label>
                <input
                  type="date"
                  value={formData.fechaFinal}
                  onChange={(e) =>
                    setFormData({ ...formData, fechaFinal: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* MW */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  MW (opcional)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.mw}
                  onChange={(e) =>
                    setFormData({ ...formData, mw: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="Ej: 45.5"
                />
              </div>

              {/* Tipo */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Tipo
                </label>
                <select
                  value={formData.tipo}
                  onChange={(e) =>
                    setFormData({ ...formData, tipo: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >
                  <option>Programado</option>
                  <option>Permanente</option>
                  <option>Temporal</option>
                </select>
              </div>

              {/* Observaciones */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Observaciones
                </label>
                <textarea
                  value={formData.Observaciones}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      Observaciones: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
                  rows={3}
                  placeholder="Motivo del aseguramiento..."
                />
              </div>

              {/* Botones */}
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

      {/* Tabla de Aseguramientos */}
      <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs uppercase tracking-wider">
            <tr>
              <th className="p-4 font-semibold">Circuito / Nro</th>
              <th className="p-4 font-semibold">Carga (MW)</th>
              <th className="p-4 font-semibold">Motivo de Protección</th>
              <th className="p-4 font-semibold">Tipo / Horario</th>
              <th className="p-4 font-semibold text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {aseguramientosPrueba.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                <td className="p-4">
                  <div className="font-bold text-slate-700">
                    {item.circuito}
                  </div>
                  <div className="text-xs text-slate-400">ID: {item.nro}</div>
                </td>
                <td className="p-4 font-semibold text-slate-600">
                  {item.mw} MW
                </td>
                <td className="p-4 text-slate-600">
                  <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-medium">
                    {item.motivo}
                  </span>
                </td>
                <td className="p-4">
                  <span
                    className={`text-sm ${
                      item.tipo === "Permanente"
                        ? "text-red-600 font-medium"
                        : "text-slate-500"
                    }`}
                  >
                    {item.tipo}
                  </span>
                </td>
                <td className="p-4 text-right space-x-2">
                  <button
                    className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
                    title="Editar"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    className="p-2 text-slate-400 hover:text-red-600 transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
