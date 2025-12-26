// app/dashboard/page.jsx
"use client";
import { Activity } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// Datos simulados de la evolución del déficit en Cienfuegos
const dataGrafico = [
  { hora: "08:00", deficit: 20, afectados: 18 },
  { hora: "10:00", deficit: 35, afectados: 32 },
  { hora: "12:00", deficit: 45, afectados: 45 },
  { hora: "14:00", deficit: 52, afectados: 50 },
  { hora: "16:00", deficit: 40, afectados: 38 },
  { hora: "18:00", deficit: 55, afectados: 52 },
  { hora: "20:00", deficit: 60, afectados: 58 },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Estado del Sistema (CFG)</h2>

      {/* Rejilla de Tarjetas (las que ya tenías) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-red-500">
          <p className="text-sm text-slate-500 font-medium">
            Déficit Generación
          </p>
          <h3 className="text-2xl font-bold text-slate-800">45.2 MW</h3>
        </div>
        {/* ... (las otras tarjetas) ... */}
      </div>

      {/* Gráfico de Rotación */}
      <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200">
        <h3 className="text-lg font-bold text-slate-700 mb-4 flex items-center gap-2">
          <Activity className="text-blue-600" size={20} /> Evolución de Carga y
          Déficit (24h)
        </h3>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dataGrafico}>
              <defs>
                <linearGradient id="colorDeficit" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorAfectados" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#e2e8f0"
              />
              <XAxis
                dataKey="hora"
                stroke="#64748b"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#64748b"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}MW`}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: "8px",
                  border: "none",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                }}
              />
              <Legend verticalAlign="top" height={36} />
              <Area
                type="monotone"
                dataKey="deficit"
                stroke="#ef4444"
                name="Déficit Demandado"
                fillOpacity={1}
                fill="url(#colorDeficit)"
                strokeWidth={3}
              />
              <Area
                type="monotone"
                dataKey="afectados"
                stroke="#3b82f6"
                name="Carga Afectada"
                fillOpacity={1}
                fill="url(#colorAfectados)"
                strokeWidth={3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
