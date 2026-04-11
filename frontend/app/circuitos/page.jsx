"use client";
import React, { useState, useEffect } from "react";
import {
  AlertCircle,
  FileSpreadsheet,
  Zap,
} from "lucide-react";
import * as XLSX from "xlsx";
import { apiClient } from "@/lib/api/apiClient";
import { generarRotacion } from "@/lib/services/rotacionService";
import RotacionModal from "@/components/RotacionModal";
import { 
  filtrarCircuitosApagables, 
  ordenarPorNombre,
  filtrarPorBloque,
} from "@/lib/utils/circuitUtils";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import AlertMessage from "@/components/shared/AlertMessage";
import Pagination from "@/components/shared/Pagination";
import CircuitosFilters from "@/components/circuitos/CircuitosFilters";
import CircuitosTable from "@/components/circuitos/CircuitosTable";

export default function CircuitosPage() {
  const [circuitos, setCircuitos] = useState([]);
  const [soloApagables, setSoloApagables] = useState(true);
  const [bloqueSeleccionado, setBloqueSeleccionado] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [totalCircuitos, setTotalCircuitos] = useState(0);
  const [bloques, setBloques] = useState([]);
  const [modalRotacionAbierto, setModalRotacionAbierto] = useState(false);
  const [mensajeRotacion, setMensajeRotacion] = useState(null);
  
  const circuitosPorPagina = 10;

  // CARGAR BLOQUES (solo una vez)
  useEffect(() => {
    const cargarBloques = async () => {
      try {
        // Obtener todos los circuitos sin paginación para extraer bloques únicos
        const response = await apiClient.circuitos.getAll(1, 1000);
        const bq = [...new Set(response.results?.map(c => c.Bloque).filter(Boolean))].sort();
        setBloques(bq);
      } catch (err) {
        console.error("Error cargando bloques:", err);
      }
    };
    cargarBloques();
  }, []);

  // CARGAR DATOS CON FILTROS Y PAGINACIÓN
  useEffect(() => {
    cargarCircuitos();
  }, [pagina, soloApagables, bloqueSeleccionado]);

  const cargarCircuitos = async () => {
    try {
      setCargando(true);
      setError(null);
      const datos = await apiClient.circuitos.getAll(
        pagina,
        circuitosPorPagina,
        soloApagables ? true : undefined,
        bloqueSeleccionado ? bloqueSeleccionado : undefined
      );
      
      if (datos && datos.results) {
        setCircuitos(datos.results);
        setTotalPaginas(datos.meta.totalPages);
        setTotalCircuitos(datos.meta.total);
      } else {
        setCircuitos([]);
        setTotalPaginas(1);
        setTotalCircuitos(0);
      }
    } catch (err) {
      setError("Error cargando circuitos: " + (err?.message || "Error desconocido"));
      setCircuitos([]);
      setTotalPaginas(1);
      setTotalCircuitos(0);
    } finally {
      setCargando(false);
    }
  };

  const manejarConfirmarRotacion = async (datos) => {
    try {
      // Llamar al servicio
      const respuesta = await generarRotacion(datos);
      
      setMensajeRotacion({
        tipo: "éxito",
        texto: `Rotación insertada exitosamente con ${datos.cantidad_circuitos} circuito(s) y ${datos.mw_total.toFixed(2)} MW.`
      });
      
      console.log("Rotación confirmada:", respuesta);
    } catch (error) {
      console.error("Error confirmando rotación:", error);
      setMensajeRotacion({
        tipo: "error",
        texto: "Error al confirmar la rotación: " + (error?.message || "Error desconocido")
      });
    }
  };

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

  if (cargando) {
    return <LoadingSpinner message="Cargando circuitos..." />;
  }

  return (
    <div className="space-y-6">
      {/* CABECERA */}
      <div className="flex justify-between items-start bg-white p-6 rounded-xl border shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Gestión de Circuitos</h2>
          <p className="text-sm text-slate-500 mt-1">
            {circuitosFiltrados.length} circuito(s) mostrado(s) · {circuitosFiltrados.reduce((sum, c) => sum + (c.Clientes || 0), 0).toLocaleString()} clientes
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setModalRotacionAbierto(true)}
            disabled={circuitos.length === 0}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:bg-slate-400 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors"
          >
            <Zap size={18} />
            Generar Rotación
          </button>
          <button
            onClick={() => exportarAExcel(circuitos, "Circuitos_Reporte")}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors"
          >
            <FileSpreadsheet size={18} /> Exportar
          </button>
        </div>
      </div>


      {/* MENSAJE DE ROTACIÓN */}
      {mensajeRotacion && (
        <AlertMessage
          type={mensajeRotacion.tipo}
          title={mensajeRotacion.tipo === "éxito" ? "Éxito" : "Error"}
          message={mensajeRotacion.texto}
          onClose={() => setMensajeRotacion(null)}
        />
      )}

      {/* ERROR */}
      {error && (
        <AlertMessage
          type="error"
          title="Error"
          message={error}
          onClose={() => setError(null)}
        />
      )}

      {/* FILTROS */}
      <CircuitosFilters
        soloApagables={soloApagables}
        setSoloApagables={(value) => {
          setSoloApagables(value);
          setPagina(1);
        }}
        bloqueSeleccionado={bloqueSeleccionado}
        setBloqueSeleccionado={(value) => {
          setBloqueSeleccionado(value);
          setPagina(1);
        }}
        circuitos={circuitos}
      />

      {/* TABLA */}
      <CircuitosTable
        circuitos={circuitosPaginados}
        onSelectCircuito={(circuito) => console.log("Seleccionado:", circuito)}
      />

      {/* PAGINACIÓN */}
      {totalPaginas > 1 && (
        <Pagination
          currentPage={pagina}
          totalPages={totalPaginas}
          onPageChange={setPagina}
        />
      )}

      {/* MODAL DE ROTACIÓN */}
      <RotacionModal
        isOpen={modalRotacionAbierto}
        onClose={() => setModalRotacionAbierto(false)}
        circuitosDisponibles={circuitos}
        onConfirmar={manejarConfirmarRotacion}
      />
    </div>
  );
}
