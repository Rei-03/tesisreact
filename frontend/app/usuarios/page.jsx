"use client";
import { Shield } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import {
  obtenerUsuarios,
  crearUsuario,
  eliminarUsuario,
} from "@/lib/services/usuariosService";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import AlertMessage from "@/components/shared/AlertMessage";
import UsuariosForm from "@/components/usuarios/UsuariosForm";
import UsuariosTable from "@/components/usuarios/UsuariosTable";

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

  // Memoizar cargarUsuarios para evitar recreaciones innecesarias
  const cargarUsuarios = useCallback(async () => {
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
  }, []);

  // Ejecutar una sola vez al cargar la página para validar permisos
  useEffect(() => {
    if (isLoading) return; // Esperar a que cargue autenticación
    
    if (!isAuthenticated || !isAdmin()) {
      router.push("/loguin");
    }
  }, []); // Solo ejecutar una vez

  // Cargar usuarios cuando está autenticado
  useEffect(() => {
    if (isAuthenticated && isAdmin()) {
      cargarUsuarios();
    }
  }, [isAuthenticated, cargarUsuarios, isAdmin]);

  const agregarUsuario = async (formData) => {
    setError(null);
    setExito(null);

    // Validaciones
    if (!formData.nombre.trim()) {
      setError("El nombre es requerido");
      return;
    }
    if (!formData.login.trim()) {
      setError("El login es requerido");
      return;
    }
    if (!loginUnico) {
      setError("El login ya existe");
      return;
    }
    if (!formData.password) {
      setError("La contraseña es requerida");
      return;
    }
    if (formData.password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    try {
      setCargando(true);
      const nuevoUsuario = {
        nombre: formData.nombre,
        login: formData.login,
        password: formData.password,
        rol: formData.rol,
      };

      await crearUsuario(nuevoUsuario);

      setExito(`Usuario "${formData.nombre}" creado exitosamente como ${formData.rol}`);
      
      // Recargar usuarios
      await cargarUsuarios();
    } catch (err) {
      setError("Error creando usuario: " + (err?.message || "Error desconocido"));
    } finally {
      setCargando(false);
    }
  };

  const validarLogin = (login, usuariosActuales) => {
    if (!login) {
      setLoginUnico(false);
      return;
    }
    
    // Verificar que no exista un usuario con ese login
    const existe = usuariosActuales.some((u) => u.login === login);
    setLoginUnico(!existe);
  };
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
    return <LoadingSpinner message="Cargando..." />;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
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
        <AlertMessage
          type="error"
          title="Error"
          message={error}
          onClose={() => setError(null)}
        />
      )}

      {exito && (
        <AlertMessage
          type="success"
          title="Éxito"
          message={exito}
          onClose={() => setExito(null)}
        />
      )}

      {/* Formulario de Creación */}
      <UsuariosForm
        onSubmit={agregarUsuario}
        loading={cargando}
        loginUnico={loginUnico}
        onValidarLogin={validarLogin}
        usuarios={usuarios}
      />

      {/* Tabla de Usuarios */}
      {cargandoUsuarios ? (
        <LoadingSpinner message="Cargando usuarios..." />
      ) : (
        <UsuariosTable
          usuarios={usuarios}
          onDeleteUser={handleEliminarUsuario}
          eliminando={eliminando}
          currentUserId={user?.id}
        />
      )}
    </div>
  );
};
