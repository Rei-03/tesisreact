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
import { BarChart3, Activity } from "lucide-react";

export default function DashboardCharts({ mwData, horaData }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Gráfico: MW por Bloque */}
      <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200">
        <h3 className="text-lg font-bold text-slate-700 mb-4 flex items-center gap-2">
          <BarChart3 className="text-blue-600" size={20} /> MW por Bloque (Hora Actual)
        </h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={mwData}>
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
            <AreaChart data={horaData}>
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
  );
}
