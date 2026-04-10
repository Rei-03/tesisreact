import { Trash2 } from "lucide-react";
import { formatDateTimeDisplay } from "@/lib/utils/dateUtils";

export default function AseguramientosTable({
  aseguramientos = [],
  onDelete,
  eliminando,
}) {
  const handleDelete = (id, nombre) => {
    if (window.confirm(`¿Eliminar aseguramiento "${nombre}"?`)) {
      onDelete(id);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-800 text-white">
            <tr>
              <th className="px-6 py-3 font-semibold">Circuito</th>
              <th className="px-6 py-3 font-semibold">Tipo</th>
              <th className="px-6 py-3 font-semibold">Desde</th>
              <th className="px-6 py-3 font-semibold">Hasta</th>
              <th className="px-6 py-3 font-semibold text-center">MW</th>
              <th className="px-6 py-3 font-semibold">Observaciones</th>
              <th className="px-6 py-3 font-semibold text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {aseguramientos.map((asg) => (
              <tr key={asg.id} className="hover:bg-slate-50">
                <td className="px-6 py-3 font-bold text-blue-600">{asg.CircuitoP}</td>
                <td className="px-6 py-3">
                  <span className={`inline-block px-2 py-1 rounded text-xs font-bold ${
                    asg.tipo === "Emergencia" ? "bg-red-100 text-red-700" :
                    asg.tipo === "Preventivo" ? "bg-yellow-100 text-yellow-700" :
                    "bg-purple-100 text-purple-700"
                  }`}>
                    {asg.tipo}
                  </span>
                </td>
                <td className="px-6 py-3 text-xs">{formatDateTimeDisplay(asg.fechaInicial)}</td>
                <td className="px-6 py-3 text-xs">{formatDateTimeDisplay(asg.fechaFinal)}</td>
                <td className="px-6 py-3 text-center font-bold">{asg.mw ? asg.mw.toFixed(2) : "—"} MW</td>
                <td className="px-6 py-3 text-xs text-slate-600 max-w-xs truncate">{asg.Observaciones}</td>
                <td className="px-6 py-3 text-center">
                  <button
                    onClick={() => handleDelete(asg.id, asg.CircuitoP)}
                    disabled={eliminando === asg.id}
                    className="text-red-600 hover:text-red-800 disabled:opacity-50 transition"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
            {aseguramientos.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                  No hay aseguramientos para mostrar
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
