"use client";
import React, { useState, useEffect } from "react";
import {
  Settings,
  User,
  Lock,
  Server,
  AlertCircle,
  Loader,
  Eye,
  EyeOff,
  Info,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import {
  cambiarContrasena,
  actualizarPerfil,
  obtenerInfoSistema,
} from "@/lib/services/preferencesService";

export default function ConfiguracionPage() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();

  // Estados generales
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [exito, setExito] = useState(null);
  const [guardando, setGuardando] = useState(false);

  // Perfil
  const [nombrePerfil, setNombrePerfil] = useState("");
  const [passwordActual, setPasswordActual] = useState("");
  const [passwordNueva, setPasswordNueva] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [mostrarPasswordes, setMostrarPasswordes] = useState({
    actual: false,
    nueva: false,
    confirmar: false,
  });

  // Info del sistema
  const [infoSistema, setInfoSistema] = useState(null);

  // Protección de acceso
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/loguin");
    }
  }, [isAuthenticated, isLoading, router]);

  // Cargar datos
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      cargarDatos();
    }
  }, [isAuthenticated, user?.id]);

  const cargarDatos = async () => {
    try {
      setCargando(true);
      setError(null);

      const info = await obtenerInfoSistema();
      setInfoSistema(info);
      setNombrePerfil(user.nombre || "");
    } catch (err) {
      setError("Error cargando configuración: " + (err?.message || "Error desconocido"));
    } finally {
      setCargando(false);
    }
  };

  const handleGuardarPerfil = async () => {
    setError(null);
    setExito(null);

    if (!nombrePerfil.trim()) {
      setError("El nombre no puede estar vacío");
      return;
    }

    try {
      setGuardando(true);
      await actualizarPerfil(user.id, { nombre: nombrePerfil });
      setExito("Perfil actualizado exitosamente");
    } catch (err) {
      setError("Error actualizando perfil: " + (err?.message || "Error desconocido"));
    } finally {
      setGuardando(false);
    }
  };

  const handleCambiarContrasena = async () => {
    setError(null);
    setExito(null);

    if (!passwordActual || !passwordNueva || !passwordConfirm) {
      setError("Todos los campos de contraseña son requeridos");
      return;
    }

    if (passwordNueva.length < 6) {
      setError("La nueva contraseña debe tener al menos 6 caracteres");
      return;
    }

    if (passwordNueva !== passwordConfirm) {
      setError("Las nuevas contraseñas no coinciden");
      return;
    }

    if (passwordActual === passwordNueva) {
      setError("La nueva contraseña debe ser diferente a la actual");
      return;
    }

    try {
      setGuardando(true);
      await cambiarContrasena(user.id, passwordActual, passwordNueva);
      setPasswordActual("");
      setPasswordNueva("");
      setPasswordConfirm("");
      setExito("Contraseña cambiad exitosamente");
    } catch (err) {
      setError("Error: " + (err?.message || "No se pudo cambiar la contraseña"));
    } finally {
      setGuardando(false);
    }
  };

  const handleCerrarSesion = () => {
    if (window.confirm("¿Estás seguro de que deseas cerrar sesión?")) {
      logout();
      router.push("/loguin");
    }
  };

  if (isLoading || cargando) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader size={48} className="mx-auto animate-spin text-blue-600 mb-4" />
          <p className="text-slate-600">Cargando configuración...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-8">
      {/* Cabecera */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Settings className="text-blue-600" /> Configuración
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Personaliza tu experiencia en el sistema
          </p>
        </div>
      </div>

      {/* Mensajes */}
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
        <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-lg flex items-start gap-3">
          <div>
            <p className="font-bold">✓ {exito}</p>
          </div>
        </div>
      )}

      {/* SECCIÓN 1: PERFIL DE USUARIO */}
      <div className="bg-white rounded-xl shadow-md border p-6 space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b">
          <User className="text-blue-600" size={24} />
          <h3 className="text-lg font-bold text-slate-800">Perfil de Usuario</h3>
        </div>

        {/* Editar Perfil */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Nombre Completo
            </label>
            <input
              type="text"
              value={nombrePerfil}
              onChange={(e) => setNombrePerfil(e.target.value)}
              disabled={guardando}
              className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Usuario (Login)
            </label>
            <input
              type="text"
              value={user?.login || ""}
              disabled
              className="w-full px-4 py-2 border rounded-lg bg-slate-100 text-slate-500"
            />
            <p className="text-xs text-slate-500 mt-1">No se puede cambiar</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Rol
            </label>
            <div className="px-4 py-2 border rounded-lg bg-slate-50">
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold uppercase inline-block ${
                  user?.rol === "admin"
                    ? "bg-purple-100 text-purple-700"
                    : "bg-blue-100 text-blue-700"
                }`}
              >
                {user?.rol}
              </span>
            </div>
          </div>

          <button
            onClick={handleGuardarPerfil}
            disabled={guardando || nombrePerfil === user?.nombre}
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {guardando ? (
              <>
                <Loader size={18} className="animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Settings size={18} />
                Guardar Cambios
              </>
            )}
          </button>
        </div>

        {/* Cambiar Contraseña */}
        <div className="border-t pt-6 space-y-4">
          <h4 className="font-bold text-slate-700 flex items-center gap-2">
            <Lock size={18} /> Cambiar Contraseña
          </h4>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Contraseña Actual
            </label>
            <div className="relative">
              <input
                type={mostrarPasswordes.actual ? "text" : "password"}
                value={passwordActual}
                onChange={(e) => setPasswordActual(e.target.value)}
                disabled={guardando}
                className="w-full px-4 py-2 pr-10 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100"
              />
              <button
                type="button"
                onClick={() =>
                  setMostrarPasswordes({
                    ...mostrarPasswordes,
                    actual: !mostrarPasswordes.actual,
                  })
                }
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
              >
                {mostrarPasswordes.actual ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Nueva Contraseña
            </label>
            <div className="relative">
              <input
                type={mostrarPasswordes.nueva ? "text" : "password"}
                value={passwordNueva}
                onChange={(e) => setPasswordNueva(e.target.value)}
                disabled={guardando}
                className="w-full px-4 py-2 pr-10 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100"
              />
              <button
                type="button"
                onClick={() =>
                  setMostrarPasswordes({
                    ...mostrarPasswordes,
                    nueva: !mostrarPasswordes.nueva,
                  })
                }
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
              >
                {mostrarPasswordes.nueva ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Confirmar Nueva Contraseña
            </label>
            <div className="relative">
              <input
                type={mostrarPasswordes.confirmar ? "text" : "password"}
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                disabled={guardando}
                className="w-full px-4 py-2 pr-10 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100"
              />
              <button
                type="button"
                onClick={() =>
                  setMostrarPasswordes({
                    ...mostrarPasswordes,
                    confirmar: !mostrarPasswordes.confirmar,
                  })
                }
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
              >
                {mostrarPasswordes.confirmar ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            onClick={handleCambiarContrasena}
            disabled={
              guardando ||
              !passwordActual ||
              !passwordNueva ||
              !passwordConfirm
            }
            className="w-full bg-amber-600 text-white py-2 rounded-lg font-medium hover:bg-amber-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {guardando ? (
              <>
                <Loader size={18} className="animate-spin" />
                Procesando...
              </>
            ) : (
              "Cambiar Contraseña"
            )}
          </button>
        </div>
      </div>

      {/* SECCIÓN 2: INFORMACIÓN DEL SISTEMA */}
      {infoSistema && (
        <div className="bg-white rounded-xl shadow-md border p-6 space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b">
            <Info className="text-blue-600" size={24} />
            <h3 className="text-lg font-bold text-slate-800">Información del Sistema</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase mb-1">Versión</p>
              <p className="text-lg font-mono text-slate-800">{infoSistema.version}</p>
            </div>

            <div>
              <p className="text-xs font-bold text-slate-500 uppercase mb-1">Ambiente</p>
              <p className="text-lg font-mono text-slate-800">{infoSistema.ambiente}</p>
            </div>

            <div>
              <p className="text-xs font-bold text-slate-500 uppercase mb-1">Estado de la API</p>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <p className="text-lg font-mono text-green-600">{infoSistema.apiStatus}</p>
              </div>
            </div>

            <div>
              <p className="text-xs font-bold text-slate-500 uppercase mb-1">Fecha de Build</p>
              <p className="text-lg font-mono text-slate-800">{infoSistema.buildDate}</p>
            </div>
          </div>

          <div className="border-t pt-6">
            <p className="text-xs font-bold text-slate-500 uppercase mb-2">Información Técnica</p>
            <div className="bg-slate-50 rounded-lg p-4 text-xs font-mono text-slate-600 break-all">
              {infoSistema.navegador}
            </div>
          </div>
        </div>
      )}

      {/* Botón Cerrar Sesión */}
      <div className="bg-white rounded-xl shadow-md border p-6">
        <button
          onClick={handleCerrarSesion}
          className="w-full bg-red-600 text-white py-3 rounded-lg font-bold hover:bg-red-700 transition-colors"
        >
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
}
