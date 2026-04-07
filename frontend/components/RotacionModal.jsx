// components/RotacionModal.jsx
"use client";
import React, { useState, useEffect } from "react";
import {
  X,
  AlertTriangle,
  Zap,
  FileSpreadsheet,
  Check,
  ChevronRight,
  Plus,
  Trash2,
} from "lucide-react";
import * as XLSX from "xlsx";
import { apiClient } from "@/lib/api/apiClient";

export default function RotacionModal({ 
  isOpen, 
  onClose, 
  circuitosDisponibles = [],
  onConfirmar,
  cargando = false
}) {
  const [paso, setPaso] = useState(1); // 1: Input MW, 2: Resultado
  const [modo, setModo] = useState("automatica"); // "automatica" o "manual"
  const [mwRequerido, setMwRequerido] = useState("");
  const [deficitX, setDeficitX] = useState("");
  const [soloApagar, setSoloApagar] = useState(false);
  const [cargandoRotacion, setCargandoRotacion] = useState(false);
  const [resultadoRotacion, setResultadoRotacion] = useState(null);
  const [circuitosSeleccionados, setCircuitosSeleccionados] = useState([]);
  const [mwTotal, setMwTotal] = useState(0);
  const [error, setError] = useState(null);
  const [confirmando, setConfirmando] = useState(false);
  const [circuitoSelectoParaAgregar, setCircuitoSelectoParaAgregar] = useState("");

  // Resetear modal cuando se cierra
  useEffect(() => {
    if (!isOpen) {
      setModo("automatica");
      setPaso(1);
      setDeficitX("");
      setSoloApagar(false);
      setResultadoRotacion(null);
      setMwRequerido("");
      setCircuitosSeleccionados([]);
      setMwTotal(0);
      setError(null);
      setConfirmando(false);
      setCircuitoSelectoParaAgregar("");
    }
  }, [isOpen]);

  // ════════════════════════════════════════════════════════════════════
  // MODO AUTOMÁTICO - Rotación por Déficit
  // ════════════════════════════════════════════════════════════════════

  const ejecutarRotacionAutomatica = async (e) => {
    e.preventDefault();
    
    if (!deficitX || deficitX <= 0) {
      setError("Por favor ingresa un déficit válido (mayor a 0)");
      return;
    }

    try {
      setCargandoRotacion(true);
      setError(null);
      
      const resultado = await apiClient.rotaciones.generar({
        deficitX: parseFloat(deficitX),
        soloApagar: soloApagar,
      });

      if (resultado.success) {
        setResultadoRotacion(resultado.data);
        setPaso(2);
      } else {
        setError(resultado.error || "Error desconocido al generar rotación");
      }
    } catch (error) {
      console.error("Error generando rotación:", error);
      setError("Error al generar rotación: " + (error?.message || "Error desconocido"));
    } finally {
      setCargandoRotacion(false);
    }
  };

  // ════════════════════════════════════════════════════════════════════
  // MODO MANUAL - Selección de circuitos
  // ════════════════════════════════════════════════════════════════════

  /**
   * Elimina un circuito de la selección
   */
  const eliminarCircuito = (idx) => {
    const circuito = circuitosSeleccionados[idx];
    const mwCircuito = circuito.mw || circuito.MW || 0;
    
    const nuevosCircuitos = circuitosSeleccionados.filter((_, i) => i !== idx);
    const nuevoMwTotal = mwTotal - mwCircuito;
    
    setCircuitosSeleccionados(nuevosCircuitos);
    setMwTotal(nuevoMwTotal);
  };

  /**
   * Obtiene los circuitos disponibles para agregar (no están en la selección)
   */
  const getCircuitosDisponiblesParaAgregar = () => {
    const idsSeleccionados = new Set(
      circuitosSeleccionados.map(c => c.idCircuitoP || c.id)
    );
    return circuitosDisponibles.filter(c => !idsSeleccionados.has(c.idCircuitoP || c.id));
  };

  /**
   * Agrega un circuito a la selección
   */
  const agregarCircuito = () => {
    if (!circuitoSelectoParaAgregar) {
      setError("Selecciona un circuito para agregar");
      return;
    }

    const circuitoAgregar = circuitosDisponibles.find(
      c => (c.idCircuitoP || c.id) === parseInt(circuitoSelectoParaAgregar)
    );

    if (!circuitoAgregar) {
      setError("Circuito no encontrado");
      return;
    }

    const mwCircuito = circuitoAgregar.mw || circuitoAgregar.MW || 0;
    const mwTarget = parseFloat(mwRequerido);
    const nuevoMwTotal = mwTotal + mwCircuito;

    // Validar límite de MW (permitir un 20% de exceso como en la selección original)
    if (nuevoMwTotal > mwTarget * 1.2) {
      setError(`Agregar este circuito (${mwCircuito.toFixed(2)} MW) excedería el límite. MW disponible: ${(mwTarget * 1.2 - mwTotal).toFixed(2)} MW`);
      return;
    }

    setCircuitosSeleccionados([...circuitosSeleccionados, circuitoAgregar]);
    setMwTotal(nuevoMwTotal);
    setCircuitoSelectoParaAgregar("");
    setError(null);
  };

  /**
   * Selecciona circuitos automáticamente para alcanzar los MW requeridos
   * Usa un algoritmo greedy para optimizar la selección
   */
  const seleccionarCircuitosPorMW = () => {
    setError(null);

    if (!mwRequerido || isNaN(mwRequerido) || parseFloat(mwRequerido) <= 0) {
      setError("Ingresa una cantidad válida de MW");
      return;
    }

    const mwTarget = parseFloat(mwRequerido);

    if (circuitosDisponibles.length === 0) {
      setError("No hay circuitos disponibles");
      return;
    }

    // Ordenar circuitos por MW de mayor a menor para optimizar
    const circuitosOrdenados = [...circuitosDisponibles]
      .filter(c => c.mw || c.MW) // Solo con MW disponible
      .sort((a, b) => (b.mw || b.MW) - (a.mw || a.MW));

    if (circuitosOrdenados.length === 0) {
      setError("No hay circuitos con información de MW");
      return;
    }

    // Algoritmo greedy para seleccionar circuitos
    const seleccionados = [];
    let mwAcumulado = 0;

    for (const circuito of circuitosOrdenados) {
      const mwCircuito = circuito.mw || circuito.MW || 0;
      if (mwAcumulado < mwTarget) {
        seleccionados.push(circuito);
        mwAcumulado += mwCircuito;
      }
      if (mwAcumulado >= mwTarget) break;
    }

    if (seleccionados.length === 0) {
      setError("No se pudieron seleccionar circuitos");
      return;
    }

    const totalMW = seleccionados.reduce((sum, c) => sum + (c.mw || c.MW || 0), 0);

    if (totalMW < mwTarget * 0.9) { // Permite 10% de tolerancia
      setError(
        `Solo se pudo alcanzar ${totalMW.toFixed(2)} MW de ${mwTarget} MW requeridos con ${seleccionados.length} circuito(s)`
      );
    }

    setCircuitosSeleccionados(seleccionados);
    setMwTotal(totalMW);
    setPaso(2);
  };

  /**
   * Exporta los circuitos seleccionados a Excel
   */
  const exportarAExcel = () => {
    if (circuitosSeleccionados.length === 0) {
      setError("No hay circuitos para exportar");
      return;
    }

    const datosFormateados = circuitosSeleccionados.map((item) => ({
      "ID Circuito": item.idCircuitoP || item.id,
      "Nombre": item.CircuitoP || item.nombre || "N/A",
      "Bloque": item.Bloque || item.bloque || "N/A",
      "MW": (item.mw || item.MW || 0).toFixed(2),
      "Clientes": item.Clientes || item.clientes || 0,
      "Zona": item.ZonaAfectada || item.zona || "N/A",
    }));

    const hoja = XLSX.utils.json_to_sheet(datosFormateados);
    const libro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libro, hoja, "Rotación");
    XLSX.writeFile(
      libro,
      `Rotacion_${mwRequerido}MW_${new Date().toISOString().split("T")[0]}.xlsx`
    );
  };

  /**
   * Confirma e inserta la rotación
   */
  const confirmarRotacion = async () => {
    if (circuitosSeleccionados.length === 0) {
      setError("No hay circuitos para confirmar");
      return;
    }

    setConfirmando(true);
    setError(null);

    try {
      const datos = {
        circuitos_propuestos: circuitosSeleccionados.map(c => c.idCircuitoP || c.id),
        mw_requerido: parseFloat(mwRequerido),
        mw_total: mwTotal,
        cantidad_circuitos: circuitosSeleccionados.length,
        motivo: `Rotación de ${mwRequerido} MW con ${circuitosSeleccionados.length} circuito(s)`,
      };

      await onConfirmar(datos);
      onClose();
    } catch (err) {
      setError("Error al confirmar la rotación: " + (err?.message || "Error desconocido"));
    } finally {
      setConfirmando(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-screen overflow-y-auto">
        {/* HEADER */}
        <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white">
          <div className="flex items-center gap-2">
            <Zap className="text-red-600" size={24} />
            <h2 className="text-2xl font-bold text-slate-800">Generar Rotación</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X size={24} className="text-slate-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* PASO 1 - MODO AUTOMÁTICO */}
          {paso === 1 && modo === "automatica" && (
            <form id="form-rotacion-automatica" onSubmit={ejecutarRotacionAutomatica} className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm font-bold text-blue-900">⚡ Modo Automático</p>
                <p className="text-sm text-blue-800 mt-1">
                  Ingresa el déficit en MW y ejecuta la rotación automática
                </p>
              </div>

              {/* INPUT DÉFICIT */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Déficit a Cubrir (MW) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={deficitX}
                  onChange={(e) => setDeficitX(e.target.value)}
                  placeholder="Ej: 50.5"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  required
                  disabled={cargandoRotacion}
                />
              </div>

              {/* CHECKBOX SOLO APAGAR */}
              <label className="flex items-center gap-3 p-3 border rounded-lg hover:bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={soloApagar}
                  onChange={(e) => setSoloApagar(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300"
                  disabled={cargandoRotacion}
                />
                <span className="font-medium text-slate-700">
                  Solo apagar (sin encender circuitos)
                </span>
              </label>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-lg flex items-start gap-2">
                  <AlertTriangle size={18} className="mt-0.5 shrink-0" />
                  <p className="text-sm">{error}</p>
                </div>
              )}
            </form>
          )}

          {/* PASO 1 - MODO MANUAL */}
          {paso === 1 && modo === "manual" && (
            <div className="space-y-4">
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <p className="text-sm font-bold text-purple-900">🔧 Modo Manual</p>
                <p className="text-sm text-purple-800 mt-1">
                  Selecciona manualmente los circuitos a apagar
                </p>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  ¿Cuántos MW deseas apagar?
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={mwRequerido}
                    onChange={(e) => {
                      setMwRequerido(e.target.value);
                      setError(null);
                    }}
                    placeholder="Ej: 50.5"
                    className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                    disabled={cargando}
                  />
                  <span className="flex items-center px-3 py-2 bg-slate-100 rounded-lg font-bold text-slate-700">
                    MW
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Seleccionaremos automáticamente los circuitos más eficientes para alcanzar esta demanda.
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm font-bold text-blue-900">
                  📊 Disponibilidad actual:
                </p>
                <p className="text-sm text-blue-800 mt-1">
                  {circuitosDisponibles.length} circuitos apagables
                  {circuitosDisponibles.length > 0 && (
                    <span>
                      {" "}
                      ·{" "}
                      {circuitosDisponibles
                        .reduce((sum, c) => sum + (c.mw || c.MW || 0), 0)
                        .toFixed(2)}{" "}
                      MW disponibles
                    </span>
                  )}
                </p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-lg flex items-start gap-2">
                  <AlertTriangle size={18} className="mt-0.5 shrink-0" />
                  <p className="text-sm">{error}</p>
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={seleccionarCircuitosPorMW}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold transition-colors"
                >
                  Seleccionar circuitos
                </button>
                <button
                  onClick={() => setModo("automatica")}
                  className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-800 px-4 py-2 rounded-lg font-bold transition-colors"
                >
                  Volver a Automático
                </button>
              </div>
            </div>
          )}

          {/* PASO 2 - MODO AUTOMÁTICO - RESULTADOS */}
          {paso === 2 && modo === "automatica" && resultadoRotacion && (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm font-bold text-green-900">✓ Rotación Generada</p>
              </div>

              {/* CIRCUITOS A APAGAR */}
              {resultadoRotacion.cola && resultadoRotacion.cola.length > 0 && (
                <div>
                  <h4 className="font-bold text-red-700 mb-3 flex items-center gap-2">
                    <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                    Circuitos a Apagar ({resultadoRotacion.cola.length})
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {resultadoRotacion.cola.map((circuitoId) => {
                      const circuito = circuitosDisponibles.find(c => c.idCircuitoP === circuitoId);
                      return (
                        <div
                          key={circuitoId}
                          className="bg-red-50 border-l-4 border-red-500 p-2 rounded text-xs"
                        >
                          <p className="font-bold text-red-700">{circuitoId}</p>
                          <p className="text-red-600 text-xs">
                            {circuito?.CircuitoP || "Desconocido"}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* CIRCUITOS A ENCENDER */}
              {resultadoRotacion.encendidos && resultadoRotacion.encendidos.length > 0 && (
                <div>
                  <h4 className="font-bold text-green-700 mb-3 flex items-center gap-2">
                    <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                    Circuitos a Encender ({resultadoRotacion.encendidos.length})
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {resultadoRotacion.encendidos.map((circuitoId) => {
                      const circuito = circuitosDisponibles.find(c => c.idCircuitoP === circuitoId);
                      return (
                        <div
                          key={circuitoId}
                          className="bg-green-50 border-l-4 border-green-500 p-2 rounded text-xs"
                        >
                          <p className="font-bold text-green-700">{circuitoId}</p>
                          <p className="text-green-600 text-xs">
                            {circuito?.CircuitoP || "Desconocido"}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-lg flex items-start gap-2">
                  <AlertTriangle size={18} className="mt-0.5 shrink-0" />
                  <p className="text-sm">{error}</p>
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={onClose}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-bold transition-colors"
                >
                  Cerrar
                </button>
                <button
                  onClick={() => {
                    setPaso(1);
                    setDeficitX("");
                    setSoloApagar(false);
                    setResultadoRotacion(null);
                  }}
                  className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-800 px-4 py-2 rounded-lg font-bold transition-colors"
                >
                  Nueva Rotación
                </button>
              </div>
            </div>
          )}

          {/* PASO 2 - MODO MANUAL - RESULTADO */}
          {paso === 2 && modo === "manual" && (
            <div className="space-y-4">
              {/* RESUMEN */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-xs text-green-600 font-bold">MW REQUERIDO</p>
                    <p className="text-2xl font-bold text-green-700 mt-1">
                      {parseFloat(mwRequerido).toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-green-600 font-bold">MW TOTAL</p>
                    <p className="text-2xl font-bold text-green-700 mt-1">
                      {mwTotal.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-green-600 font-bold">CIRCUITOS</p>
                    <p className="text-2xl font-bold text-green-700 mt-1">
                      {circuitosSeleccionados.length}
                    </p>
                  </div>
                </div>
              </div>

              {/* INFO DE MW DISPONIBLE PARA AGREGAR */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-xs text-amber-700 font-bold">⚡ ESPACIO DISPONIBLE</p>
                <p className="text-sm text-amber-800 mt-1">
                  Puedes agregar hasta{" "}
                  <span className="font-bold">
                    {(parseFloat(mwRequerido) * 1.2 - mwTotal).toFixed(2)} MW
                  </span>
                  {" "}más
                </p>
              </div>

              {/* TABLA DE CIRCUITOS SELECCIONADOS */}
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-slate-800 text-white px-4 py-3 font-bold">
                  Circuitos Seleccionados ({circuitosSeleccionados.length})
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-100 border-b">
                      <tr>
                        <th className="px-4 py-2 text-left font-semibold text-slate-700">
                          Circuito
                        </th>
                        <th className="px-4 py-2 text-center font-semibold text-slate-700">
                          Bloque
                        </th>
                        <th className="px-4 py-2 text-right font-semibold text-slate-700">
                          MW
                        </th>
                        <th className="px-4 py-2 text-center font-semibold text-slate-700">
                          Acción
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {circuitosSeleccionados.map((circuito, idx) => (
                        <tr key={`circ-${idx}`} className="hover:bg-slate-50">
                          <td className="px-4 py-2 font-medium text-blue-600">
                            {circuito.CircuitoP || circuito.nombre || "N/A"}
                          </td>
                          <td className="px-4 py-2 text-center">
                            <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold">
                              {circuito.Bloque || circuito.bloque || "—"}
                            </span>
                          </td>
                          <td className="px-4 py-2 text-right font-bold">
                            {(circuito.mw || circuito.MW || 0).toFixed(2)} MW
                          </td>
                          <td className="px-4 py-2 text-center">
                            <button
                              onClick={() => eliminarCircuito(idx)}
                              className="p-1.5 hover:bg-red-100 rounded text-red-600 hover:text-red-700 transition-colors"
                              title="Eliminar circuito"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* AGREGAR CIRCUITO */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Agregar más circuitos
                </label>
                <div className="flex gap-2">
                  <select
                    value={circuitoSelectoParaAgregar}
                    onChange={(e) => {
                      setCircuitoSelectoParaAgregar(e.target.value);
                      setError(null);
                    }}
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:border-blue-500 outline-none"
                  >
                    <option value="">Selecciona un circuito...</option>
                    {getCircuitosDisponiblesParaAgregar().map((circ) => (
                      <option key={circ.idCircuitoP || circ.id} value={circ.idCircuitoP || circ.id}>
                        {circ.CircuitoP || circ.nombre} ({(circ.mw || circ.MW || 0).toFixed(2)} MW)
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={agregarCircuito}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold transition-colors"
                  >
                    Agregar
                  </button>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-lg flex items-start gap-2">
                  <AlertTriangle size={18} className="mt-0.5 shrink-0" />
                  <p className="text-sm">{error}</p>
                </div>
              )}
            </div>
          )}
        </div>
        <div className="border-t p-6 bg-slate-50 flex gap-3 justify-end sticky bottom-0">
          {paso === 1 && (
            <>
              <button
                onClick={onClose}
                className="px-4 py-2 border border-slate-300 rounded-lg font-bold text-slate-700 hover:bg-slate-100 transition-colors"
              >
                Cancelar
              </button>
              {modo === "automatica" && (
                <>
                  <button
                    type="button"
                    onClick={() => setModo("manual")}
                    className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg font-bold transition-colors"
                  >
                    Modo Manual
                  </button>
                  <button
                    type="submit"
                    form="form-rotacion-automatica"
                    disabled={cargandoRotacion || !deficitX}
                    className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:bg-slate-400 text-white rounded-lg font-bold transition-colors"
                  >
                    {cargandoRotacion ? (
                      <>
                        <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Generando...
                      </>
                    ) : (
                      <>
                        <Zap size={18} />
                        Ejecutar Rotación
                      </>
                    )}
                  </button>
                </>
              )}
              {modo === "manual" && (
                <>
                  <button
                    type="button"
                    onClick={() => setModo("automatica")}
                    className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg font-bold transition-colors"
                  >
                    Volver a Automático
                  </button>
                  <button
                    onClick={seleccionarCircuitosPorMW}
                    disabled={!mwRequerido}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white rounded-lg font-bold transition-colors"
                  >
                    Seleccionar Circuitos
                  </button>
                </>
              )}
            </>
          )}

          {paso === 2 && modo === "manual" && (
            <>
              <button
                onClick={() => setPaso(1)}
                className="px-4 py-2 border border-slate-300 rounded-lg font-bold text-slate-700 hover:bg-slate-100 transition-colors"
                disabled={confirmando}
              >
                ← Atrás
              </button>
              <button
                onClick={exportarAExcel}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold transition-colors"
                disabled={confirmando}
              >
                <FileSpreadsheet size={18} />
                Exportar
              </button>
              <button
                onClick={confirmarRotacion}
                disabled={confirmando}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-slate-400 text-white rounded-lg font-bold transition-colors"
              >
                {confirmando ? (
                  <>
                    <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Confirmando...
                  </>
                ) : (
                  <>
                    <Check size={18} />
                    Confirmar e Insertar
                  </>
                )}
              </button>
            </>
          )}

          {paso === 2 && modo === "automatica" && (
            <>
              <button
                onClick={onClose}
                className="px-4 py-2 border border-slate-300 rounded-lg font-bold text-slate-700 hover:bg-slate-100 transition-colors"
              >
                Cerrar
              </button>
              <button
                onClick={() => {
                  setPaso(1);
                  setDeficitX("");
                  setSoloApagar(false);
                  setResultadoRotacion(null);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition-colors"
              >
                Nueva Rotación
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

