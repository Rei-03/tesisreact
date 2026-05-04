// app/dashboard/page.jsx
"use client";
import React, { useState, useEffect } from "react";
import {
  AlertTriangle,
  Grid3x3,
  Zap,
  Shield,
} from "lucide-react";
import { apiClient } from "@/lib/api/apiClient";
import { generarRotacion } from "@/lib/services/rotacionService";
import RotacionModal from "@/components/RotacionModal";
import {
  calcularMWPorBloque,
} from "@/lib/utils/circuitUtils";
import { getToday } from "@/lib/utils/dateUtils";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import AlertMessage from "@/components/shared/AlertMessage";
import DashboardMetricCard from "@/components/dashboard/DashboardMetricCard";
import DashboardCharts from "@/components/dashboard/DashboardCharts";
import DashboardAseguramientosTable from "@/components/dashboard/DashboardAseguramientosTable";

export default function DashboardPage() {
  const [circuitos, setCircuitos] = useState([]);
  const [totalAseguramientosHoy, setTotalAseguramientosHoy] = useState(0);
  const [aseguramientos, setAseguramientos] = useState([]);
  const [circuitosApagados, setCircuitosApagados] = useState([]);
  const [proxAperturas, setProxAperturas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [modalRotacionAbierto, setModalRotacionAbierto] = useState(false);
  const [mensajeRotacion, setMensajeRotacion] = useState(null);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setCargando(true);
      const hoy = getToday();
      const [circ, asgCount, asgListado, abiertos, prox] = await Promise.all([
        apiClient.circuitos.getApagables(),
        apiClient.aseguramientos.countByFecha(hoy),
        apiClient.aseguramientos.getAll(1, 5),
        apiClient.apagones.getOpen(),
        apiClient.proximasAperturas.getAll(),
      ]);

      const abiertosRaw = (abiertos?.results || abiertos) || [];
      const abiertosArray = Array.isArray(abiertosRaw) ? abiertosRaw : [];

      // Evita inflar la métrica cuando llegan múltiples registros del mismo circuito.
      const abiertosPorCircuito = Array.from(
        new Map(
          abiertosArray.map((item, index) => [
            item?.idCircuitoP != null
              ? `circuito-${item.idCircuitoP}`
              : `apagon-${item?.idApagon ?? index}`,
            item,
          ])
        ).values()
      );

      // Extraer arrays correctamente de la respuesta de la API
      setCircuitos((circ?.results || circ) || []);
      setTotalAseguramientosHoy(Number(asgCount?.count || 0));
      setAseguramientos((asgListado?.results || asgListado) || []);
      setCircuitosApagados(abiertosPorCircuito);
      setProxAperturas((prox?.results || prox) || []);
    } catch (err) {
      console.error("Error loading dashboard data:", err);
    } finally {
      setCargando(false);
    }
  };

  const manejarConfirmarRotacion = async (datos) => {
    try {
      // Llamar al servicio
      const respuesta = await generarRotacion(datos);
      
      // Extraer valores con seguridad
      const cantidadCircuitos = datos?.cantidad_circuitos || 0;
      const mwTotal = (datos?.mw_total !== undefined && datos.mw_total !== null) 
        ? datos.mw_total 
        : 0;
      
      setMensajeRotacion({
        tipo: "éxito",
        texto: `Rotación insertada exitosamente con ${cantidadCircuitos} circuito(s) y ${parseFloat(mwTotal).toFixed(2)} MW.`
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

  // CALCULAR MÉTRICAS
  const totalCircuitosApagados = circuitosApagados.length;
  const mwPorBloque = calcularMWPorBloque(proxAperturas);

  // DATOS PARA GRÁFICOS
  const dataGraficoMW = Object.entries(mwPorBloque).map(([bloque, mw]) => ({
    bloque: `Bloque ${bloque}`,
    MW: parseFloat(mw.toFixed(1)),
  }));

  const dataGraficoHora = [
    { hora: "08:00", deficit: 20, asegurados: 8 },
    { hora: "10:00", deficit: 35, asegurados: 12 },
    { hora: "12:00", deficit: 45, asegurados: 14 },
    { hora: "14:00", deficit: 52, asegurados: 18 },
    { hora: "16:00", deficit: 40, asegurados: 14 },
    { hora: "18:00", deficit: 55, asegurados: 20 },
    { hora: "20:00", deficit: 60, asegurados: 22 },
  ];

  if (cargando) {
    return <LoadingSpinner message="Cargando dashboard..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Panel de Control</h2>
        </div>
        <button
          onClick={() => setModalRotacionAbierto(true)}
          disabled={circuitos.length === 0}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:bg-slate-400 text-white px-4 py-2 rounded-lg font-bold transition-colors"
        >
          <Zap size={18} />
          Generar Rotación
        </button>
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

      {/* TARJETAS DE RESUMEN */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardMetricCard
          icon={Grid3x3}
          title="Circuitos Apagados"
          value={totalCircuitosApagados}
          subtitle="Con apagón sin hora de cierre"
          bgColor="border-blue-500"
          iconBgColor="bg-blue-100 text-blue-600"
        />
        <DashboardMetricCard
          icon={Shield}
          title="Aseguramientos Hoy"
          value={totalAseguramientosHoy}
          subtitle="Conteo del día"
          bgColor="border-green-500"
          iconBgColor="bg-green-100 text-green-600"
        />
        <DashboardMetricCard
          icon={Zap}
          title="MW Hora Actual"
          value={Object.values(mwPorBloque).reduce((a, b) => a + b, 0).toFixed(1)}
          subtitle={`${proxAperturas.length} circuitos monitoreados`}
          bgColor="border-yellow-500"
          iconBgColor="bg-yellow-100 text-yellow-600"
        />
        <DashboardMetricCard
          icon={AlertTriangle}
          title="Próx. Aperturas"
          value={proxAperturas.length}
          subtitle="Agrupadas por bloque"
          bgColor="border-red-500"
          iconBgColor="bg-red-100 text-red-600"
        />
      </div>

      {/* GRÁFICOS */}
      <DashboardCharts
        mwData={dataGraficoMW}
        horaData={dataGraficoHora}
      />

      {/* TABLA: Últimos Aseguramientos */}
      <DashboardAseguramientosTable aseguramientos={aseguramientos} />

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
