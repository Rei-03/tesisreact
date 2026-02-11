// app/dashboard/page.jsx
"use client";
import React, { useState, useEffect } from "react";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Grid3x3,
  Zap,
  Users,
  Shield,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { apiClient } from "@/lib/api/apiClient";
import { generarRotacion } from "@/lib/services/rotacionService";
import RotacionModal from "@/components/RotacionModal";
import {
  calcularTotalClientes,
  calcularMWPorBloque,
} from "@/lib/utils/circuitUtils";
import { getToday } from "@/lib/utils/dateUtils";

export default function DashboardPage() {
  const [circuitos, setCircuitos] = useState([]);
  const [aseguramientos, setAseguramientos] = useState([]);
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
      const [circ, asg, prox] = await Promise.all([
        apiClient.circuitos.getApagables(),
        apiClient.aseguramientos.getByFecha(hoy),
        apiClient.proximasAperturas.getAll(),
      ]);
      setCircuitos(circ || []);
      setAseguramientos(asg || []);
      setProxAperturas(prox || []);
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

  // CALCULAR MÉTRICAS
  const totalCircuitosApagables = circuitos.length;
  const totalAseguramientosHoy = aseguramientos.length;
  const totalMWAsegurado = aseguramientos.reduce((sum, a) => sum + (a.mw || 0), 0);
  const totalClientes = calcularTotalClientes(circuitos);
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
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-slate-600">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Panel de Control</h2>
          <p className="text-slate-500 text-sm mt-1">Provincia: CFG · Estado del sistema en tiempo real</p>
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
        <div
          className={`p-4 rounded-lg border flex items-start gap-3 ${
            mensajeRotacion.tipo === "éxito"
              ? "bg-green-50 border-green-200 text-green-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          <AlertTriangle size={20} className="mt-0.5 shrink-0" />
          <div>
            <p className="font-bold">
              {mensajeRotacion.tipo === "éxito" ? "Éxito" : "Error"}
            </p>
            <p className="text-sm">{mensajeRotacion.texto}</p>
          </div>
        </div>
      )}

      {/* TARJETAS DE RESUMEN */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Circuitos Apagables */}
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-blue-500 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-slate-500 font-medium">Circuitos Apagables</p>
              <h3 className="text-3xl font-bold text-slate-800 mt-2">{totalCircuitosApagables}</h3>
              <p className="text-xs text-slate-400 mt-2">{totalClientes.toLocaleString()} clientes</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <Grid3x3 className="text-blue-600" size={24} />
            </div>
          </div>
        </div>

        {/* Card 2: Aseguramientos Hoy */}
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-green-500 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-slate-500 font-medium">Aseguramientos Hoy</p>
              <h3 className="text-3xl font-bold text-slate-800 mt-2">{totalAseguramientosHoy}</h3>
              <p className="text-xs text-slate-400 mt-2">{totalMWAsegurado.toFixed(1)} MW protegidos</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <Shield className="text-green-600" size={24} />
            </div>
          </div>
        </div>

        {/* Card 3: MW Total Disponible */}
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-yellow-500 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-slate-500 font-medium">MW Hora Actual</p>
              <h3 className="text-3xl font-bold text-slate-800 mt-2">
                {Object.values(mwPorBloque)
                  .reduce((a, b) => a + b, 0)
                  .toFixed(1)}
              </h3>
              <p className="text-xs text-slate-400 mt-2">{proxAperturas.length} circuitos monitoreados</p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-lg">
              <Zap className="text-yellow-600" size={24} />
            </div>
          </div>
        </div>

        {/* Card 4: Próximas Aperturas */}
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-red-500 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-slate-500 font-medium">Próx. Aperturas</p>
              <h3 className="text-3xl font-bold text-slate-800 mt-2">{proxAperturas.length}</h3>
              <p className="text-xs text-slate-400 mt-2">Agrupadas por bloque</p>
            </div>
            <div className="bg-red-100 p-3 rounded-lg">
              <AlertTriangle className="text-red-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* GRÁFICOS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico: MW por Bloque */}
        <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200">
          <h3 className="text-lg font-bold text-slate-700 mb-4 flex items-center gap-2">
            <BarChart3 className="text-blue-600" size={20} /> MW por Bloque (Hora Actual)
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dataGraficoMW}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="bloque" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} tickFormatter={(v) => `${v}MW`} />
                <Tooltip contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }} />
                <Bar dataKey="MW" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico: Déficit vs Asegurados */}
        <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200">
          <h3 className="text-lg font-bold text-slate-700 mb-4 flex items-center gap-2">
            <Activity className="text-green-600" size={20} /> Evolución Déficit (24h)
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dataGraficoHora}>
                <defs>
                  <linearGradient id="colorDeficit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorAsegurados" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="hora" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} tickFormatter={(v) => `${v}MW`} />
                <Tooltip contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }} />
                <Legend />
                <Area type="monotone" dataKey="deficit" stroke="#ef4444" name="Déficit" fill="url(#colorDeficit)" strokeWidth={2} />
                <Area type="monotone" dataKey="asegurados" stroke="#10b981" name="Asegurados" fill="url(#colorAsegurados)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* TABLA: Últimos Aseguramientos */}
      <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
        <div className="p-4 bg-slate-50 border-b font-bold text-slate-700 flex items-center gap-2">
          <Shield className="text-green-600" size={18} /> Aseguramientos Activos Hoy
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-800 text-white">
              <tr>
                <th className="px-6 py-3 font-semibold">Circuito</th>
                <th className="px-6 py-3 font-semibold">Tipo</th>
                <th className="px-6 py-3 font-semibold text-center">MW</th>
                <th className="px-6 py-3 font-semibold">Observaciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {aseguramientos.slice(0, 5).map((asg, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="px-6 py-3 font-bold text-blue-600">{asg.CircuitoP}</td>
                  <td className="px-6 py-3">
                    <span className="inline-block bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs font-bold">
                      {asg.tipo}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-center font-bold">{asg.mw?.toFixed(1) || "—"} MW</td>
                  <td className="px-6 py-3 text-slate-600 text-xs">{asg.Observaciones}</td>
                </tr>
              ))}
              {aseguramientos.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                    No hay aseguramientos activos hoy
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

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
