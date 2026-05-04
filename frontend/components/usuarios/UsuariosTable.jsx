import { Trash2, AlertCircle } from "lucide-react";

export default function UsuariosTable({ 
  usuarios = [], 
  onDeleteUser, 
  eliminando, 
  currentUserId 
}) {
  const handleDelete = (usuario) => {
    if (currentUserId === usuario.id) {
      alert("No puedes eliminarte a ti mismo");
      return;
    }

    if (window.confirm(`¿Eliminar usuario "${usuario.name}"?`)) {
      onDeleteUser(usuario.id, usuario.name);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
      <div className="p-4 bg-slate-50 border-b font-bold text-slate-700">
        Lista de Usuarios
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-800 text-white">
            <tr>
              <th className="px-6 py-3 font-semibold">Nombre</th>
              <th className="px-6 py-3 font-semibold">Email</th>
              <th className="px-6 py-3 font-semibold">Rol</th>
              <th className="px-6 py-3 font-semibold text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {usuarios.map((usuario) => (
              <tr key={usuario.id} className="hover:bg-slate-50">
                <td className="px-6 py-3 font-semibold">{usuario.name}</td>
                <td className="px-6 py-3 font-mono text-sm text-slate-600">{usuario.email}</td>
                <td className="px-6 py-3">
                  <span className={`inline-block px-2 py-1 rounded text-xs font-bold ${
                    usuario.role === "admin" ? "bg-red-100 text-red-700" :
                    usuario.role === "supervisor" ? "bg-yellow-100 text-yellow-700" :
                    "bg-blue-100 text-blue-700"
                  }`}>
                    {usuario.role}
                  </span>
                  {currentUserId === usuario.id && (
                    <span className="ml-2 text-xs text-slate-500">(Tú)</span>
                  )}
                </td>
                <td className="px-6 py-3 text-center">
                  <button
                    onClick={() => handleDelete(usuario)}
                    disabled={eliminando === usuario.id}
                    className="text-red-600 hover:text-red-800 disabled:opacity-50 transition"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
            {usuarios.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                  No hay usuarios registrados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
