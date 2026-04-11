import { Shield } from "lucide-react";

export default function AseguramientosTable({ aseguramientos = [] }) {
  return (
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
  );
}
