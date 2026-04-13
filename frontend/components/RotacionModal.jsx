// components/RotacionModal.jsx
"use client";
import React, { useState, useEffect } from "react";
import {
  X,
  AlertTriangle,
  Zap,
  FileSpreadsheet,
  Check,
  Loader,
} from "lucide-react";
import * as XLSX from "xlsx";
import { apiClient } from "@/lib/api/apiClient";

export default function RotacionModal({ 
  isOpen, 
  onClose, 
  circuitosDisponibles = [],
  onConfirmar,
}) {
  const [paso, setPaso] = useState(1); // 1: Input, 2: Resultado
  const [deficitX, setDeficitX] = useState("");
  const [circuitosAEncender, setCircuitosAEncender] = useState("0");
  const [cargandoRotacion, setCargandoRotacion] = useState(false);
  const [resultadoRotacion, setResultadoRotacion] = useState(null);
  const [error, setError] = useState(null);
  const [confirmando, setConfirmando] = useState(false);
  const [circuitosConDetalles, setCircuitosConDetalles] = useState({
    encendidos: [],
    apagados: [],
    mantenidos: [],
  });

  // Resetear modal cuando se cierra
  useEffect(() => {
    if (!isOpen) {
      setPaso(1);
      setDeficitX("");
      setCircuitosAEncender("0");
      setResultadoRotacion(null);
      setError(null);
      setConfirmando(false);
      setCircuitosConDetalles({ encendidos: [], apagados: [], mantenidos: [] });
    }
  }, [isOpen]);

  /**
   * Obtiene detalles de un circuito
   */
  const getCircuitoDetalles = (idCircuitoP) => {
    return circuitosDisponibles.find(c => c.idCircuitoP === idCircuitoP) || null;
  };

  /**
   * Ejecuta la rotación automática
   */
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
        circuitosAEncender: parseInt(circuitosAEncender) || 0,
      });

      // Procesar resultado del backend (ya enriquecido con nombre, número y acción)
      if (resultado && resultado.cola) {
        // Filtrar por acción
        const encendidos = (resultado.encendidos || []).filter(c => c.accion === 'encendido');
        const apagados = (resultado.cola || []).filter(c => c.accion === 'apagado');
        const mantenidos = (resultado.cola || []).filter(c => c.accion === 'mantenido');

        setCircuitosConDetalles({
          encendidos,
          apagados,
          mantenidos,
        });

        setResultadoRotacion(resultado);
        setPaso(2);
      } else {
        setError("Respuesta inválida del servidor");
      }
    } catch (error) {
      console.error("Error generando rotación:", error);
      setError("Error al generar rotación: " + (error?.message || "Error desconocido"));
    } finally {
      setCargandoRotacion(false);
    }
  };

  /**
   * Exporta los resultados a Excel
   */
  const exportarAExcel = () => {
    const { encendidos, apagados, mantenidos } = circuitosConDetalles;
    
    const datosFormateados = [
      ...encendidos.map(c => ({
        "Estado": "Encendido ✓",
        "Número": c.numero,
        "Nombre": c.nombre,
        "ID": c.id,
      })),
      ...apagados.map(c => ({
        "Estado": "Apagado",
        "Número": c.numero,
        "Nombre": c.nombre,
        "ID": c.id,
      })),
      ...mantenidos.map(c => ({
        "Estado": "Mantenido",
        "Número": c.numero,
        "Nombre": c.nombre,
        "ID": c.id,
      })),
    ];

    const hoja = XLSX.utils.json_to_sheet(datosFormateados);
    const libro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libro, hoja, "Rotación");
    XLSX.writeFile(
      libro,
      `Rotacion_${deficitX}MW_${new Date().toISOString().split("T")[0]}.xlsx`
    );
  };

  /**
   * Confirma la rotación
   */
  const confirmarRotacion = async () => {
    setConfirmando(true);
    setError(null);

    try {
      const datos = {
        cola: resultadoRotacion.cola,
        encendidos: resultadoRotacion.encendidos || [],
        deficitX: parseFloat(deficitX),
        circuitosAEncender: parseInt(circuitosAEncender) || 0,
        cantidad_apagados: resultadoRotacion.cola.length,
        cantidad_encendidos: (resultadoRotacion.encendidos || []).length,
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
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-screen overflow-y-auto">
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
          {/* PASO 1 - INPUT */}
          {paso === 1 && (
            <form onSubmit={ejecutarRotacionAutomatica} className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm font-bold text-blue-900">⚡ Generador Automático de Rotaciones</p>
                <p className="text-sm text-blue-800 mt-1">
                  Ingresa el déficit en MW y la rotación se generará automáticamente
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
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  required
                  disabled={cargandoRotacion}
                />
              </div>

              {/* INPUT CIRCUITOS A ENCENDER */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Circuitos a Encender <span className="text-slate-500">(opcional)</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={circuitosAEncender}
                  onChange={(e) => setCircuitosAEncender(e.target.value)}
                  placeholder="0 - solo apagar"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  disabled={cargandoRotacion}
                />
                <p className="text-xs text-slate-500 mt-1">
                  Ingresa 0 para solo apagar circuitos, o un número mayor para encender esa cantidad
                </p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-lg flex items-start gap-2">
                  <AlertTriangle size={18} className="mt-0.5 shrink-0" />
                  <p className="text-sm">{error}</p>
                </div>
              )}

              {/* BOTÓN GENERAR */}
              <button
                type="submit"
                disabled={cargandoRotacion}
                className="w-full bg-red-600 hover:bg-red-700 disabled:bg-slate-400 text-white px-4 py-3 rounded-lg font-bold transition-colors flex items-center justify-center gap-2"
              >
                {cargandoRotacion && <Loader size={18} className="animate-spin" />}
                {cargandoRotacion ? "Generando..." : "Generar Rotación"}
              </button>
            </form>
          )}

          {/* PASO 2 - RESULTADOS */}
          {paso === 2 && resultadoRotacion && (
            <div className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <Check size={20} className="text-green-600" />
                  <p className="font-bold text-green-900">Rotación Generada Exitosamente</p>
                </div>
                <p className="text-sm text-green-800 mt-2">
                  Déficit: <span className="font-bold">{deficitX} MW</span> · 
                  Circuitos a apagar: <span className="font-bold">{circuitosConDetalles.apagados.length}</span> · 
                  Circuitos mantenidos: <span className="font-bold">{circuitosConDetalles.mantenidos.length}</span>
                  {parseInt(circuitosAEncender) > 0 && circuitosConDetalles.encendidos?.length > 0 && (
                    <> · Circuitos a encender: <span className="font-bold">{circuitosConDetalles.encendidos.length}</span></>
                  )}
                </p>
              </div>

              {/* CIRCUITOS ENCENDIDOS (VERDE) - AL INICIO */}
              {circuitosConDetalles.encendidos.length > 0 && (
                <div>
                  <h4 className="font-bold text-green-700 mb-3 flex items-center gap-2">
                    <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                    ✓ Circuitos a Encender ({circuitosConDetalles.encendidos.length})
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {circuitosConDetalles.encendidos.map((c) => (
                      <div
                        key={c.id}
                        className="bg-green-50 border-l-4 border-green-500 p-3 rounded-lg text-sm hover:bg-green-100 transition-colors"
                      >
                        <p className="font-bold text-green-700">{c.nombre}</p>
                        <div className="grid grid-cols-2 gap-1 text-xs text-green-600 mt-1">
                          <span>Número: {c.numero}</span>
                          <span>ID: {c.id}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* CIRCUITOS APAGADOS (ROJO) */}
              {circuitosConDetalles.apagados.length > 0 && (
                <div>
                  <h4 className="font-bold text-red-700 mb-3 flex items-center gap-2">
                    <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                    Circuitos a Apagar ({circuitosConDetalles.apagados.length})
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {circuitosConDetalles.apagados.map((c) => (
                      <div
                        key={c.id}
                        className="bg-red-50 border-l-4 border-red-500 p-3 rounded-lg text-sm hover:bg-red-100 transition-colors"
                      >
                        <p className="font-bold text-red-700">{c.nombre}</p>
                        <div className="grid grid-cols-2 gap-1 text-xs text-red-600 mt-1">
                          <span>Número: {c.numero}</span>
                          <span>ID: {c.id}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* CIRCUITOS MANTENIDOS (GRIS) */}
              {circuitosConDetalles.mantenidos.length > 0 && (
                <div>
                  <h4 className="font-bold text-slate-700 mb-3 flex items-center gap-2">
                    <span className="w-3 h-3 bg-slate-400 rounded-full"></span>
                    Circuitos Mantenidos ({circuitosConDetalles.mantenidos.length})
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {circuitosConDetalles.mantenidos.map((c) => (
                      <div
                        key={c.id}
                        className="bg-slate-100 border-l-4 border-slate-400 p-3 rounded-lg text-sm hover:bg-slate-200 transition-colors opacity-75"
                      >
                        <p className="font-bold text-slate-700">{c.nombre}</p>
                        <div className="grid grid-cols-2 gap-1 text-xs text-slate-600 mt-1">
                          <span>Número: {c.numero}</span>
                          <span>ID: {c.id}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* BOTONES */}
              <div className="flex gap-3">
                <button
                  onClick={() => setPaso(1)}
                  className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-800 px-4 py-2 rounded-lg font-bold transition-colors"
                >
                  Volver
                </button>
                <button
                  onClick={exportarAExcel}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold transition-colors flex items-center justify-center gap-2"
                >
                  <FileSpreadsheet size={18} />
                  Exportar
                </button>
                <button
                  onClick={confirmarRotacion}
                  disabled={confirmando}
                  className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-slate-400 text-white px-4 py-2 rounded-lg font-bold transition-colors flex items-center justify-center gap-2"
                >
                  {confirmando && <Loader size={18} className="animate-spin" />}
                  {confirmando ? "Confirmando..." : "Confirmar"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

