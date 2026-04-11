import { Lock, Eye, EyeOff, Save } from "lucide-react";
import { useState } from "react";

export default function SecuritySettings({
  passwordActual,
  setPasswordActual,
  passwordNueva,
  setPasswordNueva,
  passwordConfirm,
  setPasswordConfirm,
  onCambiarContrasena,
  guardando,
}) {
  const [mostrarPasswordes, setMostrarPasswordes] = useState({
    actual: false,
    nueva: false,
    confirmar: false,
  });

  const toggleVisibilidad = (campo) => {
    setMostrarPasswordes((prev) => ({
      ...prev,
      [campo]: !prev[campo],
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onCambiarContrasena();
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200">
      <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
        <Lock size={20} className="text-red-600" /> Seguridad
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Contraseña Actual
          </label>
          <div className="relative">
            <input
              type={mostrarPasswordes.actual ? "text" : "password"}
              value={passwordActual}
              onChange={(e) => setPasswordActual(e.target.value)}
              className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-red-500 pr-10"
              required
            />
            <button
              type="button"
              onClick={() => toggleVisibilidad("actual")}
              className="absolute right-3 top-3 text-slate-600"
            >
              {mostrarPasswordes.actual ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Nueva Contraseña
          </label>
          <div className="relative">
            <input
              type={mostrarPasswordes.nueva ? "text" : "password"}
              value={passwordNueva}
              onChange={(e) => setPasswordNueva(e.target.value)}
              placeholder="Mín. 6 caracteres"
              className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-red-500 pr-10"
              required
            />
            <button
              type="button"
              onClick={() => toggleVisibilidad("nueva")}
              className="absolute right-3 top-3 text-slate-600"
            >
              {mostrarPasswordes.nueva ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Confirmar Nueva Contraseña
          </label>
          <div className="relative">
            <input
              type={mostrarPasswordes.confirmar ? "text" : "password"}
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              placeholder="Repite la nueva contraseña"
              className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-red-500 pr-10"
              required
            />
            <button
              type="button"
              onClick={() => toggleVisibilidad("confirmar")}
              className="absolute right-3 top-3 text-slate-600"
            >
              {mostrarPasswordes.confirmar ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={guardando}
          className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 disabled:bg-slate-400 text-white px-4 py-3 rounded-lg font-bold transition-colors"
        >
          <Save size={18} /> {guardando ? "Cambiando..." : "Cambiar Contraseña"}
        </button>
      </form>
    </div>
  );
}
