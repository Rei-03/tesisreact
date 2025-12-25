// app/circuitos/page.jsx
const circuitosPrueba = [
  { id: 1, nombre: "Cumanayagua 1", bloque: 1, mw: 4.5, estado: "Apagado" },
  { id: 2, nombre: "Cruces Centro", bloque: 2, mw: 3.2, estado: "Servicio" },
  { id: 3, nombre: "Palmira Villa", bloque: 1, mw: 2.8, estado: "Propuesto" },
];

export default function CircuitosPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">
          Gestión de Circuitos
        </h2>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700">
          Generar Propuesta (HU4)
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="p-4 font-semibold text-slate-600 text-sm">
                Circuito
              </th>
              <th className="p-4 font-semibold text-slate-600 text-sm">
                Bloque
              </th>
              <th className="p-4 font-semibold text-slate-600 text-sm">
                Carga (MW)
              </th>
              <th className="p-4 font-semibold text-slate-600 text-sm">
                Estado
              </th>
              <th className="p-4 font-semibold text-slate-600 text-sm text-right">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {circuitosPrueba.map((c) => (
              <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                <td className="p-4 font-medium">{c.nombre}</td>
                <td className="p-4">
                  <span className="bg-slate-100 px-2 py-1 rounded text-xs">
                    Bloque {c.bloque}
                  </span>
                </td>
                <td className="p-4">{c.mw} MW</td>
                <td className="p-4">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      c.estado === "Apagado"
                        ? "bg-red-100 text-red-600"
                        : c.estado === "Servicio"
                        ? "bg-green-100 text-green-600"
                        : "bg-yellow-100 text-yellow-600"
                    }`}
                  >
                    {c.estado}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <button className="text-blue-600 hover:underline text-sm font-medium">
                    Editar
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
