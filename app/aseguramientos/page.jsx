// app/aseguramientos/page.jsx
"use client";
import { AlertCircle, Edit, Plus, ShieldCheck, Trash2 } from "lucide-react";

// Datos de prueba basados en tu lógica de "Asegurados"
const aseguramientosPrueba = [
  {
    id: 1,
    circuito: "C-122",
    nro: "1510",
    mw: 1.2,
    motivo: "Hospital Provincial",
    tipo: "Permanente",
  },
  {
    id: 2,
    circuito: "C-40",
    nro: "23",
    mw: 0.8,
    motivo: "Bombeo de Agua",
    tipo: "Temporal (08:00-16:00)",
  },
  {
    id: 3,
    circuito: "C-15",
    nro: "1205",
    mw: 2.1,
    motivo: "Zona Priorizada",
    tipo: "Permanente",
  },
];

export default function AseguramientosPage() {
  return (
    <div className="space-y-6">
      {/* Banner de Información */}
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg flex items-start gap-3">
        <AlertCircle className="text-blue-600 mt-1" size={20} />
        <div>
          <h3 className="text-blue-800 font-bold">
            Gestión de Circuitos Priorizados
          </h3>
          <p className="text-blue-700 text-sm">
            Los circuitos listados aquí serán omitidos automáticamente por el
            algoritmo de rotación para evitar afectaciones en puntos críticos.
          </p>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <ShieldCheck className="text-green-600" /> Circuitos Asegurados
        </h2>
        <button className="flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-lg transition-all shadow-sm font-medium">
          <Plus size={18} /> Añadir Aseguramiento
        </button>
      </div>

      {/* Tabla de Aseguramientos */}
      <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs uppercase tracking-wider">
            <tr>
              <th className="p-4 font-semibold">Circuito / Nro</th>
              <th className="p-4 font-semibold">Carga (MW)</th>
              <th className="p-4 font-semibold">Motivo de Protección</th>
              <th className="p-4 font-semibold">Tipo / Horario</th>
              <th className="p-4 font-semibold text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {aseguramientosPrueba.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                <td className="p-4">
                  <div className="font-bold text-slate-700">
                    {item.circuito}
                  </div>
                  <div className="text-xs text-slate-400">ID: {item.nro}</div>
                </td>
                <td className="p-4 font-semibold text-slate-600">
                  {item.mw} MW
                </td>
                <td className="p-4 text-slate-600">
                  <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-medium">
                    {item.motivo}
                  </span>
                </td>
                <td className="p-4">
                  <span
                    className={`text-sm ${
                      item.tipo === "Permanente"
                        ? "text-red-600 font-medium"
                        : "text-slate-500"
                    }`}
                  >
                    {item.tipo}
                  </span>
                </td>
                <td className="p-4 text-right space-x-2">
                  <button
                    className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
                    title="Editar"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    className="p-2 text-slate-400 hover:text-red-600 transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
