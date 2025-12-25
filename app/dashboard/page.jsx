// app/dashboard/page.jsx
import { Activity, AlertTriangle, Shield, Zap } from 'lucide-react';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Estado del Sistema (CFG)</h2>
      
      {/* Rejilla de Tarjetas de Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Tarjeta Déficit */}
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 font-medium">Déficit Generación</p>
              <h3 className="text-2xl font-bold text-slate-800">45.2 MW</h3>
            </div>
            <div className="bg-red-50 p-2 rounded-lg text-red-600">
              <Activity size={24} />
            </div>
          </div>
        </div>

        {/* Tarjeta Afectados */}
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 font-medium">MW Afectados</p>
              <h3 className="text-2xl font-bold text-slate-800">52.0 MW</h3>
            </div>
            <div className="bg-orange-50 p-2 rounded-lg text-orange-600">
              <Zap size={24} />
            </div>
          </div>
        </div>

        {/* Tarjeta Asegurados */}
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 font-medium">MW Asegurados (HU2)</p>
              <h3 className="text-2xl font-bold text-slate-800">6.8 MW</h3>
            </div>
            <div className="bg-green-50 p-2 rounded-lg text-green-600">
              <Shield size={24} />
            </div>
          </div>
        </div>

        {/* Tarjeta Alertas */}
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 font-medium">Alertas Activas</p>
              <h3 className="text-2xl font-bold text-slate-800">3</h3>
            </div>
            <div className="bg-yellow-50 p-2 rounded-lg text-yellow-600">
              <AlertTriangle size={24} />
            </div>
          </div>
        </div>

      </div>

      {/* Aquí irá el gráfico de Recharts más adelante */}
      <div className="bg-white p-8 rounded-xl shadow-sm border h-64 flex items-center justify-center text-slate-400 border-dashed italic">
        Espacio reservado para el Gráfico de Rotación (Recharts)
      </div>
    </div>
  );
}