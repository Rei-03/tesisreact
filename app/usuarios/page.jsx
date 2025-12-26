"use client";
import { Shield, Trash2, UserPlus } from "lucide-react";
import { useState } from "react";

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState([
    { id: 1, nombre: "Brayan Castellano", login: "bcastellano", rol: "admin" },
    {
      id: 2,
      nombre: "Operador de Guardia",
      login: "operador01",
      rol: "operador",
    },
  ]);

  const [nuevoNombre, setNuevoNombre] = useState("");
  const [nuevoLogin, setNuevoLogin] = useState("");

  const agregarUsuario = (e) => {
    e.preventDefault();
    const nuevo = {
      id: usuarios.length + 1,
      nombre: nuevoNombre,
      login: nuevoLogin,
      rol: "operador",
    };
    setUsuarios([...usuarios, nuevo]);
    setNuevoNombre("");
    setNuevoLogin("");
    alert("Usuario operador creado con éxito");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Shield className="text-blue-600" /> Administración de Personal
        </h2>
      </div>

      {/* Formulario de Creación */}
      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <UserPlus size={20} className="text-green-600" /> Registrar Nuevo
          Operador
        </h3>
        <form
          onSubmit={agregarUsuario}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <input
            type="text"
            placeholder="Nombre Completo"
            className="p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
            value={nuevoNombre}
            onChange={(e) => setNuevoNombre(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Usuario (Login)"
            className="p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
            value={nuevoLogin}
            onChange={(e) => setNuevoLogin(e.target.value)}
            required
          />
          <button
            type="submit"
            className="bg-blue-600 text-white font-bold py-2 rounded-lg hover:bg-blue-700"
          >
            Crear Operador
          </button>
        </form>
      </div>

      {/* Tabla de Usuarios */}
      <div className="bg-white rounded-xl shadow-md border overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b text-slate-600 text-xs uppercase font-bold">
            <tr>
              <th className="p-4">Nombre</th>
              <th className="p-4">Login</th>
              <th className="p-4">Rol</th>
              <th className="p-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {usuarios.map((u) => (
              <tr key={u.id} className="hover:bg-slate-50">
                <td className="p-4 font-medium text-slate-700">{u.nombre}</td>
                <td className="p-4 text-slate-600 font-mono">{u.login}</td>
                <td className="p-4">
                  <span
                    className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${
                      u.rol === "admin"
                        ? "bg-purple-100 text-purple-700"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {u.rol}
                  </span>
                </td>
                <td className="p-4 text-right text-red-400">
                  <button className="hover:text-red-600 transition-colors">
                    <Trash2 size={18} />
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
