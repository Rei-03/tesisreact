import { Server, Info, LogOut } from "lucide-react";

export default function SystemInfo({ infoSistema, onLogout }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200">
      <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
        <Server size={20} className="text-slate-600" /> Información del Sistema
      </h3>

      {infoSistema ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded">
            <span className="text-sm font-medium text-slate-600">Base de Datos</span>
            <span className="font-bold text-slate-800">{infoSistema.baseDatos || "N/A"}</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded">
            <span className="text-sm font-medium text-slate-600">Servidor</span>
            <span className="font-bold text-slate-800">{infoSistema.servidor || "N/A"}</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded">
            <span className="text-sm font-medium text-slate-600">Versión</span>
            <span className="font-bold text-slate-800">{infoSistema.version || "N/A"}</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded">
            <span className="text-sm font-medium text-slate-600">Última Sincronización</span>
            <span className="font-bold text-slate-800">
              {infoSistema.ultimaSincronizacion
                ? new Date(infoSistema.ultimaSincronizacion).toLocaleString('es-ES')
                : "Nunca"}
            </span>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2 text-slate-600">
          <Info size={18} />
          <p className="text-sm">No hay información disponible</p>
        </div>
      )}

      <div className="mt-6 pt-6 border-t">
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg font-bold transition-colors"
        >
          <LogOut size={18} /> Cerrar Sesión
        </button>
      </div>
    </div>
  );
}
