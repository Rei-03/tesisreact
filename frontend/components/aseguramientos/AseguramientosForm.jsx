import { Calendar } from "lucide-react";

export default function AseguramientosForm({
  formData,
  setFormData,
  circuitos,
  onSubmit,
  errorForm,
  mostrarFormulario,
  setMostrarFormulario,
}) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  if (!mostrarFormulario) {
    return null;
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200">
      <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
        <Calendar size={20} className="text-blue-600" /> Nuevo Aseguramiento
      </h3>

      {errorForm && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded">
          {errorForm}
        </div>
      )}

      <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Circuito *
          </label>
          <select
            name="id_CircuitoP"
            value={formData.id_CircuitoP}
            onChange={handleChange}
            className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            required
          >
            <option value="">Selecciona un circuito</option>
            {circuitos.map((c) => (
              <option key={c.idCircuitoP} value={c.idCircuitoP}>
                {c.CircuitoP}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Tipo *
          </label>
          <select
            name="tipo"
            value={formData.tipo}
            onChange={handleChange}
            className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="Programado">Programado</option>
            <option value="Emergencia">Emergencia</option>
            <option value="Preventivo">Preventivo</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Fecha Inicial *
          </label>
          <input
            type="datetime-local"
            name="fechaInicial"
            value={formData.fechaInicial}
            onChange={handleChange}
            className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Fecha Final *
          </label>
          <input
            type="datetime-local"
            name="fechaFinal"
            value={formData.fechaFinal}
            onChange={handleChange}
            className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            MW
          </label>
          <input
            type="number"
            name="mw"
            value={formData.mw}
            onChange={handleChange}
            placeholder="Ej: 25.5"
            step="0.1"
            className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Observaciones *
          </label>
          <textarea
            name="Observaciones"
            value={formData.Observaciones}
            onChange={handleChange}
            placeholder="Describe el motivo del aseguramiento"
            rows="2"
            className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            required
          />
        </div>

        <div className="md:col-span-2 flex gap-3">
          <button
            type="submit"
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold transition-colors"
          >
            Guardar
          </button>
          <button
            type="button"
            onClick={() => setMostrarFormulario(false)}
            className="flex-1 bg-slate-300 hover:bg-slate-400 text-slate-800 px-4 py-2 rounded-lg font-bold transition-colors"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
