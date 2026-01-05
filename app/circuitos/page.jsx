"use client";
import React, { useState, useEffect } from "react";
import {
  AlertCircle,
  FileSpreadsheet,
  MapPin,
  Filter,
  ChevronDown,
} from "lucide-react";
import * as XLSX from "xlsx";
import { apiClient } from "@/lib/api/apiClient";
import { 
  filtrarCircuitosApagables, 
  ordenarPorNombre,
  filtrarPorBloque,
  calcularTotalClientes 
} from "@/lib/utils/circuitUtils";

export default function CircuitosPage() {
  const [circuitos, setCircuitos] = useState([]);
  const [soloApagables, setSoloApagables] = useState(true);
  const [bloqueSeleccionado, setBloqueSeleccionado] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [pagina, setPagina] = useState(1);
  const circuitosPorPagina = 10;

  // CARGAR DATOS
  useEffect(() => {
    cargarCircuitos();
  }, []);

  const cargarCircuitos = async () => {
    try {
      setCargando(true);
      setError(null);
      const datos = await apiClient.circuitos.getAll();
      setCircuitos(datos);
    } catch (err) {
      setError("Error cargando circuitos: " + (err?.message || "Error desconocido"));
    } finally {
      setCargando(false);
    }
  };

  // FILTRAR DATOS
  let circuitosFiltrados = [...circuitos];
  if (soloApagables) {
    circuitosFiltrados = filtrarCircuitosApagables(circuitosFiltrados);
  }
  if (bloqueSeleccionado) {
    circuitosFiltrados = filtrarPorBloque(circuitosFiltrados, bloqueSeleccionado);
  }
  circuitosFiltrados = ordenarPorNombre(circuitosFiltrados);

  // PAGINACIÓN
  const totalPaginas = Math.ceil(circuitosFiltrados.length / circuitosPorPagina);
  const inicio = (pagina - 1) * circuitosPorPagina;
  const fin = inicio + circuitosPorPagina;
  const circuitosPaginados = circuitosFiltrados.slice(inicio, fin);

  // EXPORTACIÓN
  const exportarAExcel = (datos, nombreArchivo) => {
    const datosFormateados = datos.map((item) => ({
      "ID Circuito P": item.idCircuitoP,
      "Provincia": item.idProv,
      "Circuito 33": item.Circuito33 || "N/A",
      "Bloque": item.Bloque || "N/A",
      "Nombre Circuito": item.CircuitoP || "N/A",
      "Clientes": item.Clientes || 0,
      "Zona Afectada": item.ZonaAfectada || "N/A",
      "¿Apagable?": item.Apagable ? "Sí" : "No",
    }));

    const hoja = XLSX.utils.json_to_sheet(datosFormateados);
    const libro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libro, hoja, "Circuitos");
    XLSX.writeFile(libro, `${nombreArchivo}_${new Date().toISOString().split("T")[0]}.xlsx`);
  };

  const totalClientes = calcularTotalClientes(circuitosFiltrados);
  const bloques = Array.from(
    new Set(circuitos.filter(c => c.Bloque).map(c => c.Bloque))
  ).sort((a, b) => (a || 0) - (b || 0));

  if (cargando) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-slate-600">Cargando circuitos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* CABECERA */}
      <div className="flex justify-between items-start bg-white p-6 rounded-xl border shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Gestión de Circuitos</h2>
          <p className="text-sm text-slate-500 mt-1">
            {circuitosFiltrados.length} circuito(s) mostrado(s) · {totalClientes.toLocaleString()} clientes
          </p>
        </div>
        <button
          onClick={() => exportarAExcel(circuitosFiltrados, "Circuitos_Reporte")}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors"
        >
          <FileSpreadsheet size={18} /> Exportar
        </button>
      </div>

      {/* FILTROS */}
      <div className="bg-white p-4 rounded-xl border shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Filter size={18} className="text-slate-600" />
          <span className="font-bold text-slate-700">Filtros</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* FILTRO: Solo Apagables */}
          <label className="flex items-center gap-3 p-3 border rounded-lg hover:bg-slate-50 cursor-pointer">
            <input
              type="checkbox"
              checked={soloApagables}
              onChange={(e) => {
                setSoloApagables(e.target.checked);
                setPagina(1);
              }}
              className="w-4 h-4 rounded border-slate-300"
            />
            <span className="font-medium text-slate-700">
              Solo circuitos apagables
            </span>
          </label>

          {/* FILTRO: Por Bloque */}
          <div className="relative">
            <select
              value={bloqueSeleccionado || ""}
              onChange={(e) => {
                setBloqueSeleccionado(e.target.value ? Number(e.target.value) : null);
                setPagina(1);
              }}
              className="w-full p-3 border rounded-lg appearance-none bg-white cursor-pointer hover:border-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Todos los bloques</option>
              {bloques.map((bloque) => (
                <option key={bloque} value={bloque}>
                  Bloque {bloque}
                </option>
              ))}
            </select>
            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
          </div>
        </div>
      </div>

      {/* TABLA */}
      <div className="bg-white rounded-xl shadow-md border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-800 text-white">
              <tr>
                <th className="px-6 py-3 font-semibold">ID Circuito P</th>
                <th className="px-6 py-3 font-semibold">Circuito 33</th>
                <th className="px-6 py-3 font-semibold">Nombre (CircuitoP)</th>
                <th className="px-6 py-3 font-semibold text-center">Bloque</th>
                <th className="px-6 py-3 font-semibold text-center">Clientes</th>
                <th className="px-6 py-3 font-semibold">Zona Afectada</th>
                <th className="px-6 py-3 font-semibold text-center">Apagable</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {circuitosPaginados.length > 0 ? (
                circuitosPaginados.map((circuito) => (
                  <tr key={circuito.idCircuitoP} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-3 font-mono font-bold text-blue-600">
                      {circuito.idCircuitoP}
                    </td>
                    <td className="px-6 py-3 font-mono text-slate-600">
                      {circuito.Circuito33 || "—"}
                    </td>
                    <td className="px-6 py-3 font-medium text-slate-800">
                      {circuito.CircuitoP || "—"}
                    </td>
                    <td className="px-6 py-3 text-center">
                      <span className="inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">
                        {circuito.Bloque || "—"}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-center text-slate-700">
                      {circuito.Clientes?.toLocaleString() || "0"}
                    </td>
                    <td className="px-6 py-3 text-slate-600">
                      <div className="flex items-center gap-1">
                        <MapPin size={14} className="text-slate-400" />
                        {circuito.ZonaAfectada || "—"}
                      </div>
                    </td>
                    <td className="px-6 py-3 text-center">
                      {circuito.Apagable ? (
                        <span className="inline-block bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">
                          ✓ Sí
                        </span>
                      ) : (
                        <span className="inline-block bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold">
                          ✗ No
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                    No hay circuitos que coincidan con los filtros
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
                pagina === p
                  ? "bg-blue-600 text-white"
                  : "border hover:bg-slate-50"
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

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg flex items-start gap-3">
          <AlertCircle size={20} className="mt-0.5 shrink-0" />
          <div>
            <p className="font-bold">Error</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
}
