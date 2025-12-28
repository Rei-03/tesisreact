"use client";
import { Download, FileText, Search } from "lucide-react";

export default function ReportesPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">
          Historial de Reportes y Rotaciones
        </h2>
      </div>

      {/* Filtros de búsqueda */}
      <div className="bg-white p-4 rounded-xl shadow-sm border flex flex-wrap gap-4 items-end">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-slate-500 uppercase">
            Desde
          </label>
          <input
            type="date"
            className="border rounded-lg p-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-slate-500 uppercase">
            Hasta
          </label>
          <input
            type="date"
            className="border rounded-lg p-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button className="bg-slate-800 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-slate-700 transition-all">
          <Search size={18} /> Filtrar
        </button>
      </div>

      {/* Tabla de Reportes Generados */}
      <div className="bg-white rounded-xl shadow-md border overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b text-slate-600 text-xs uppercase font-bold">
            <tr>
              <th className="p-4">Fecha y Hora</th>
              <th className="p-4">Tipo de Reporte</th>
              <th className="p-4">Generado por</th>
              <th className="p-4">MW Totales</th>
              <th className="p-4 text-right">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            <tr className="hover:bg-slate-50">
              <td className="p-4 font-mono text-sm">2025-05-10 08:30</td>
              <td className="p-4">
                <span className="flex items-center gap-2">
                  <FileText size={16} className="text-blue-500" /> Rotación
                  Bloque 1
                </span>
              </td>
              <td className="p-4 text-sm font-medium text-slate-600">
                B. Castellano
              </td>
              <td className="p-4 font-bold text-red-600">12.5 MW</td>
              <td className="p-4 text-right">
                <button
                  className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-colors"
                  title="Descargar PDF"
                >
                  <Download size={20} />
                </button>
              </td>
            </tr>
            {/* Aquí irán los datos del backend */}
          </tbody>
        </table>
      </div>
    </div>
  );
}
