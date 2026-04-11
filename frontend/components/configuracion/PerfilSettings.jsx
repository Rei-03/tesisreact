import { User, Save } from "lucide-react";

export default function PerfilSettings({
  nombrePerfil,
  setNombrePerfil,
  userEmail,
  userRol,
  onGuardar,
  guardando,
}) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200">
      <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
        <User size={20} className="text-blue-600" /> Perfil
      </h3>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Nombre</label>
          <input
            type="text"
            value={nombrePerfil}
            onChange={(e) => setNombrePerfil(e.target.value)}
            className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Email/Login</label>
          <input
            type="text"
            value={userEmail}
            disabled
            className="w-full p-3 border rounded-lg bg-slate-50 text-slate-600"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Rol</label>
          <input
            type="text"
            value={userRol}
            disabled
            className="w-full p-3 border rounded-lg bg-slate-50 text-slate-600 capitalize"
          />
        </div>

        <button
          onClick={onGuardar}
          disabled={guardando}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white px-4 py-3 rounded-lg font-bold transition-colors"
        >
          <Save size={18} /> {guardando ? "Guardando..." : "Guardar Cambios"}
        </button>
      </div>
    </div>
  );
}
