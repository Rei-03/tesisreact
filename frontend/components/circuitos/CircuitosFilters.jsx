import { Filter, ChevronDown } from "lucide-react";
import { obtenerBloques } from "@/lib/utils/circuitUtils";

export default function CircuitosFilters({ 
  soloApagables, 
  setSoloApagables, 
  bloqueSeleccionado, 
  setBloqueSeleccionado,
  circuitos 
}) {
  const bloques = obtenerBloques(circuitos);

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border flex flex-wrap gap-4 items-center">
      <div className="flex items-center gap-2">
        <Filter size={18} className="text-slate-600" />
        <span className="font-semibold text-slate-700">Filtros:</span>
      </div>

      {/* Checkbox: Solo Apagables */}
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={soloApagables}
          onChange={(e) => setSoloApagables(e.target.checked)}
          className="w-4 h-4"
        />
        <span className="text-sm text-slate-700">Solo Apagables</span>
      </label>

      {/* Select: Bloque */}
      <div className="relative">
        <select
          value={bloqueSeleccionado || ""}
          onChange={(e) => setBloqueSeleccionado(e.target.value || null)}
          className="pl-3 pr-8 py-2 border rounded-lg text-sm bg-white appearance-none cursor-pointer focus:ring-2 focus:ring-blue-500 outline-none"
        >
          <option value="">Todos los Bloques</option>
          {bloques.map((bloque) => (
            <option key={bloque} value={bloque}>
              Bloque {bloque}
            </option>
          ))}
        </select>
        <ChevronDown size={16} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
      </div>
    </div>
  );
}
