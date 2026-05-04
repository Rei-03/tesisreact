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
        console.log("Resultado bruto del backend:", resultado);
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
    const datosFormateados = (resultadoRotacion.cola || []).map((c, idx) => ({
      "Índice": idx + 1,
      "Número": c.numero,
      "Zona Afectada": c.nombre,
      "Acción": c.accion === 'encendido' ? 'Encender' : c.accion === 'apagado' ? 'Apagar' : 'Mantener',
    }));

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
      const colaItems = resultadoRotacion.cola || [];
      const circuitosEncendidos = colaItems.filter(c => c.accion === 'encendido');
      
      // Calcular MW total basado en los circuitos encendidos
      const mw_total = circuitosEncendidos.reduce((sum, c) => sum + (c.mw || 0), 0);
      
      const datos = {
        cola: colaItems,
        encendidos: resultadoRotacion.encendidos || [],
        deficitX: parseFloat(deficitX),
        circuitosAEncender: parseInt(circuitosAEncender) || 0,
        cantidad_circuitos: circuitosEncendidos.length,
        cantidad_encendidos: circuitosEncendidos.length,
        cantidad_mantenidos: colaItems.filter(c => c.accion === 'mantenido').length,
        cantidad_apagados: colaItems.filter(c => c.accion === 'apagado').length,
        mw_total: mw_total,
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
                  Encendidos: <span className="font-bold">{resultadoRotacion.cola?.filter(c => c.accion === 'encendido').length || 0}</span> · 
                  Mantenidos: <span className="font-bold">{resultadoRotacion.cola?.filter(c => c.accion === 'mantenido').length || 0}</span> · 
                  Apagados: <span className="font-bold">{resultadoRotacion.cola?.filter(c => c.accion === 'apagado').length || 0}</span>
                </p>
              </div>

              {/* TABLA ENCENDIDOS SEPARADA */}
              {resultadoRotacion.cola?.filter(c => c.accion === 'encendido').length > 0 && (
                <div>
                  <h4 className="font-bold text-green-700 mb-3 flex items-center gap-2">
                    <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                    ✓ Circuitos a Encender ({resultadoRotacion.cola?.filter(c => c.accion === 'encendido').length})
                  </h4>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-green-300 bg-white">
                      <thead className="bg-green-100">
                        <tr>
                          <th className="border border-green-300 px-4 py-2 text-left text-sm font-bold text-green-700 w-16">Índice</th>
                          <th className="border border-green-300 px-4 py-2 text-left text-sm font-bold text-green-700">Número</th>
                          <th className="border border-green-300 px-4 py-2 text-left text-sm font-bold text-green-700">Zona Afectada</th>
                        </tr>
                      </thead>
                      <tbody>
                        {resultadoRotacion.cola?.filter(c => c.accion === 'encendido').map((c, idx) => (
                          <tr key={`encendido-${c.id}`} className={idx % 2 === 0 ? 'bg-green-50' : 'bg-white'}>
                            <td className="border border-green-300 px-4 py-2 text-sm font-bold text-green-700">{resultadoRotacion.cola?.findIndex(item => item.id === c.id && item.accion === 'encendido') + 1}</td>
                            <td className="border border-green-300 px-4 py-2 text-sm font-medium text-green-700">{c.numero}</td>
                            <td className="border border-green-300 px-4 py-2 text-sm text-green-700">{c.nombre}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TABLA PRINCIPAL DE ROTACIÓN (MANTENIDOS + APAGADOS) */}
              {resultadoRotacion.cola?.filter(c => c.accion !== 'encendido').length > 0 && (
              <div>
                <h4 className="font-bold text-slate-700 mb-3 flex items-center gap-2">
                  <span className="w-3 h-3 bg-slate-400 rounded-full"></span>
                  Cola de Rotación ({resultadoRotacion.cola?.filter(c => c.accion !== 'encendido').length})
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-slate-300 bg-white">
                    <thead className="bg-slate-200">
                      <tr>
                        <th className="border border-slate-300 px-4 py-2 text-left text-sm font-bold text-slate-700 w-16">Índice</th>
                        <th className="border border-slate-300 px-4 py-2 text-left text-sm font-bold text-slate-700">Número</th>
                        <th className="border border-slate-300 px-4 py-2 text-left text-sm font-bold text-slate-700">Zona Afectada</th>
                      </tr>
                    </thead>
                    <tbody>
                      {resultadoRotacion.cola?.filter(c => c.accion !== 'encendido').map((c, idx) => {
                        let rowClassName = '';
                        if (c.accion === 'apagado') {
                          rowClassName = 'bg-red-50 hover:bg-red-100';
                        } else if (c.accion === 'mantenido') {
                          rowClassName = 'bg-slate-100 hover:bg-slate-200 opacity-75';
                        }

                        let textColor = 'text-slate-700';
                        if (c.accion === 'apagado') textColor = 'text-red-700';
                        
                        return (
                          <tr key={`${c.accion}-${c.id}`} className={rowClassName}>
                            <td className="border border-slate-300 px-4 py-2 text-sm font-bold text-slate-600">{idx + 1}</td>
                            <td className={`border border-slate-300 px-4 py-2 text-sm font-medium ${textColor}`}>{c.numero}</td>
                            <td className={`border border-slate-300 px-4 py-2 text-sm ${textColor}`}>{c.nombre}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
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

