export default function CircuitosTable({ circuitos = [], onSelectCircuito }) {
  return (
    <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-800 text-white">
            <tr>
              <th className="px-6 py-3 font-semibold">ID</th>
              <th className="px-6 py-3 font-semibold">Circuito</th>
              <th className="px-6 py-3 font-semibold text-center">Bloque</th>
              <th className="px-6 py-3 font-semibold text-center">Clientes</th>
              <th className="px-6 py-3 font-semibold text-center">Tensión</th>
              <th className="px-6 py-3 font-semibold">Zona Afectada</th>
              <th className="px-6 py-3 font-semibold text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {circuitos.map((circuito, idx) => (
              <tr key={idx} className="hover:bg-slate-50">
                <td className="px-6 py-3 font-bold text-blue-600">{circuito.idCircuitoP}</td>
                <td className="px-6 py-3 font-semibold">{circuito.CircuitoP}</td>
                <td className="px-6 py-3 text-center text-sm">{circuito.Bloque || "—"}</td>
                <td className="px-6 py-3 text-center text-sm">{circuito.Clientes || 0}</td>
                <td className="px-6 py-3 text-center text-sm">{circuito.Tension || "—"}</td>
                <td className="px-6 py-3 text-sm text-slate-600">{circuito.ZonaAfectada || "—"}</td>
                <td className="px-6 py-3 text-center">
                  <button
                    onClick={() => onSelectCircuito(circuito)}
                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-xs font-bold hover:bg-blue-200 transition"
                  >
                    Ver
                  </button>
                </td>
              </tr>
            ))}
            {circuitos.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                  No hay circuitos para mostrar
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
