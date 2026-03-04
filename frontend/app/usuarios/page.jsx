"use client";
import { Shield, Trash2, UserPlus, AlertCircle, Loader, Lock } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import {
  obtenerUsuarios,
  crearUsuario,
  eliminarUsuario,
  validarLoginUnico,
} from "@/lib/services/usuariosService";

export default function UsuariosPage() {
  const { isAuthenticated, isLoading, user, isAdmin } = useAuth();
  const router = useRouter();
  
  const [usuarios, setUsuarios] = useState([]);
  const [cargandoUsuarios, setCargandoUsuarios] = useState(true);
  const [error, setError] = useState(null);
  const [exito, setExito] = useState(null);
  
  const [nuevoNombre, setNuevoNombre] = useState("");
  const [nuevoLogin, setNuevoLogin] = useState("");
  const [nuevoPassword, setNuevoPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [nuevoRol, setNuevoRol] = useState("operador");
  const [cargando, setCargando] = useState(false);
  const [loginUnico, setLoginUnico] = useState(true);
  const [eliminando, setEliminando] = useState(null);

  // Protección: verificar autenticación y permisos de admin
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !isAdmin())) {
      router.push("/loguin");
    }
  }, [isAuthenticated, isLoading, router, isAdmin]);

  // Cargar usuarios al montar el componente
  useEffect(() => {
    if (isAuthenticated && isAdmin()) {
      cargarUsuarios();
    }
  }, [isAuthenticated, isAdmin()]);

  const cargarUsuarios = async () => {
    try {
      setCargandoUsuarios(true);
      setError(null);
      const datos = await obtenerUsuarios();
      setUsuarios(datos);
    } catch (err) {
      setError("Error cargando usuarios: " + (err?.message || "Error desconocido"));
    } finally {
      setCargandoUsuarios(false);
    }
  };

  const validarLogin = async (login) => {
    if (!login) {
      setLoginUnico(false);
      return;
    }
    
    // Verificar que no exista un usuario con ese login
    const existe = usuarios.some((u) => u.login === login);
    setLoginUnico(!existe);
  };

  const agregarUsuario = async (e) => {
    e.preventDefault();
    setError(null);
    setExito(null);

    // Validaciones
    if (!nuevoNombre.trim()) {
      setError("El nombre es requerido");
      return;
    }
    if (!nuevoLogin.trim()) {
      setError("El login es requerido");
      return;
    }
    if (!loginUnico) {
      setError("El login ya existe");
      return;
    }
    if (!nuevoPassword) {
      setError("La contraseña es requerida");
      return;
    }
    if (nuevoPassword.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }
    if (nuevoPassword !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    try {
      setCargando(true);
      const nuevoUsuario = {
        nombre: nuevoNombre,
        login: nuevoLogin,
        password: nuevoPassword,
        rol: nuevoRol,
      };

      await crearUsuario(nuevoUsuario);

      setExito(`Usuario "${nuevoNombre}" creado exitosamente como ${nuevoRol}`);
      setNuevoNombre("");
      setNuevoLogin("");
      setNuevoPassword("");
      setConfirmPassword("");
      setNuevoRol("operador");
      
      // Recargar usuarios
      await cargarUsuarios();
    } catch (err) {
      setError("Error creando usuario: " + (err?.message || "Error desconocido"));
    } finally {
      setCargando(false);
    }
  };

  const handleEliminarUsuario = async (usuarioId, nombreUsuario) => {
    if (!window.confirm(`¿Estás seguro de que quieres eliminar a "${nombreUsuario}"?`)) {
      return;
    }

    // No permitir eliminarse a sí mismo
    if (user?.id === usuarioId) {
      setError("No puedes eliminarte a ti mismo");
      return;
    }

    try {
      setEliminando(usuarioId);
      await eliminarUsuario(usuarioId);
      setExito(`Usuario "${nombreUsuario}" eliminado`);
      await cargarUsuarios();
    } catch (err) {
      setError("Error eliminando usuario: " + (err?.message || "Error desconocido"));
    } finally {
      setEliminando(null);
    }
  };

  // Si aún está cargando la autenticación
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-slate-600">Cargando...</p>
        </div>
      </div>
    );
  }

  // Si no es autenticado o no es admin, no mostrar nada (protección en useEffect redirige)
  if (!isAuthenticated || !isAdmin()) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Lock size={48} className="mx-auto text-red-600 mb-4" />
          <p className="text-slate-600">No tienes permisos para acceder a esta página</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Cabecera */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Shield className="text-blue-600" /> Administración de Usuarios
        </h2>
        <p className="text-sm text-slate-500">
          Rol actual: <span className="font-bold text-blue-600">{user?.rol || "admin"}</span>
        </p>
      </div>

      {/* Mensajes de Error y Éxito */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg flex items-start gap-3">
          <AlertCircle size={20} className="mt-0.5 shrink-0" />
          <div>
            <p className="font-bold">Error</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      {exito && (
        <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-lg">
          <p className="font-bold">✓ {exito}</p>
        </div>
      )}

      {/* Formulario de Creación */}
      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <UserPlus size={20} className="text-green-600" /> Registrar Nuevo Usuario
        </h3>
        <form
          onSubmit={agregarUsuario}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Nombre Completo *
            </label>
            <input
              type="text"
              placeholder="Ej: Juan Pérez"
              className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              value={nuevoNombre}
              onChange={(e) => setNuevoNombre(e.target.value)}
              disabled={cargando}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Login (Usuario) *
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Ej: jperez"
                className={`w-full p-2 border rounded-lg outline-none focus:ring-2 ${
                  loginUnico ? "focus:ring-blue-500" : "border-red-500 focus:ring-red-500"
                }`}
                value={nuevoLogin}
                onChange={(e) => {
                  setNuevoLogin(e.target.value);
                  validarLogin(e.target.value);
                }}
                disabled={cargando}
                required
              />
              {nuevoLogin && (
                <span className={`text-xs ${loginUnico ? "text-green-600" : "text-red-600"}`}>
                  {loginUnico ? "✓ Disponible" : "✗ Ya existe"}
                </span>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Rol *
            </label>
            <select
              value={nuevoRol}
              onChange={(e) => setNuevoRol(e.target.value)}
              disabled={cargando}
              className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="operador">Operador</option>
              <option value="admin">Administrador</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Contraseña *
            </label>
            <input
              type="password"
              placeholder="Mínimo 6 caracteres"
              className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              value={nuevoPassword}
              onChange={(e) => setNuevoPassword(e.target.value)}
              disabled={cargando}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Confirmar Contraseña *
            </label>
            <input
              type="password"
              placeholder="Repite la contraseña"
              className={`w-full p-2 border rounded-lg outline-none focus:ring-2 ${
                nuevoPassword && confirmPassword && nuevoPassword !== confirmPassword
                  ? "border-red-500 focus:ring-red-500"
                  : "focus:ring-blue-500"
              }`}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={cargando}
              required
            />
          </div>

          <button
            type="submit"
            disabled={cargando || !loginUnico}
            className="bg-blue-600 text-white font-bold py-2 rounded-lg hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 mt-6"
          >
            {cargando ? (
              <>
                <Loader size={18} className="animate-spin" />
                Creando...
              </>
            ) : (
              <>
                <UserPlus size={18} />
                Crear Usuario
              </>
            )}
          </button>
        </form>
      </div>

      {/* Tabla de Usuarios */}
      <div className="bg-white rounded-xl shadow-md border overflow-hidden">
        <div className="p-4 border-b bg-slate-50">
          <h3 className="font-bold text-slate-700">
            Usuarios Registrados ({usuarios.length})
          </h3>
        </div>

        {cargandoUsuarios ? (
          <div className="flex items-center justify-center p-8">
            <Loader size={24} className="animate-spin text-blue-600" />
            <p className="ml-3 text-slate-600">Cargando usuarios...</p>
          </div>
        ) : usuarios.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            No hay usuarios registrados aún
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b text-slate-600 text-xs uppercase font-bold">
                <tr>
                  <th className="p-4">Nombre</th>
                  <th className="p-4">Login</th>
                  <th className="p-4">Rol</th>
                  <th className="p-4 text-center">Creado</th>
                  <th className="p-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {usuarios.map((u) => (
                  <tr key={u.id || u.idUsuario} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-medium text-slate-700">
                      {u.nombre}
                      {u.id === user?.id && (
                        <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                          Tú
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-slate-600 font-mono text-sm">{u.login}</td>
                    <td className="p-4">
                      <span
                        className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase ${
                          u.rol === "admin"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {u.rol}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-slate-500 text-center">
                      {u.createdAt
                        ? new Date(u.createdAt).toLocaleDateString("es-ES")
                        : "N/A"}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleEliminarUsuario(u.id || u.idUsuario, u.nombre)}
                        disabled={
                          eliminando === (u.id || u.idUsuario) || u.id === user?.id
                        }
                        className="text-red-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title={u.id === user?.id ? "No puedes eliminarte a ti mismo" : "Eliminar usuario"}
                      >
                        {eliminando === (u.id || u.idUsuario) ? (
                          <Loader size={18} className="animate-spin" />
                        ) : (
                          <Trash2 size={18} />
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
