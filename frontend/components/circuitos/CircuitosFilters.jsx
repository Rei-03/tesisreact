import { Filter } from "lucide-react";

export default function CircuitosFilters({ 
  soloApagables, 
  setSoloApagables, 
  bloqueSeleccionado, 
  setBloqueSeleccionado
}) {
  const handleBloqueChange = (e) => {
    const value = e.target.value;
    // Convertir a número o null si está vacío
    setBloqueSeleccionado(value ? Number(value) : null);
  };

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

      {/* Input: Bloque (número positivo) */}
      <div className="flex items-center gap-2">
        <label htmlFor="bloque-input" className="text-sm text-slate-700 font-medium">
          Bloque:
        </label>
        <input
          id="bloque-input"
          type="number"
          min="1"
          step="1"
          value={bloqueSeleccionado || ""}
          onChange={handleBloqueChange}
          placeholder="Todos"
          className="w-24 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
        />
      </div>
    </div>
  );
}
