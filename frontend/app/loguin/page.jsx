// app/login/page.jsx
"use client";
import { useAuth } from "@/contexts/AuthContext";
import { AlertCircle, Lock, User, Zap, Loader } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { autenticarUsuario } from "@/lib/services/usuariosService";

export default function LoginPage() {
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setCargando(true);

    try {
      // Autenticar con el servicio (usa modo demo por ahora)
      const usuarioAutenticado = await autenticarUsuario(usuario, password);
      
      // Guardar en AuthContext
      login({
        id: usuarioAutenticado.id,
        nombre: usuarioAutenticado.nombre,
        login: usuarioAutenticado.login,
        rol: usuarioAutenticado.rol,
      });
      
      // Redirigir al dashboard
      router.push("/dashboard");
    } catch (err) {
      setError(err?.message || "Error en la autenticación");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      {/* Fondo decorativo sutil */}
      <div className="absolute inset-0 overflow-hidden opacity-20 pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-500 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-red-500 rounded-full blur-3xl"></div>
      </div>

      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden z-10">
        <div className="p-8 bg-slate-50 border-b flex flex-col items-center">
          <div className="bg-blue-600 p-3 rounded-xl mb-4 shadow-lg shadow-blue-200">
            <Zap className="text-white fill-white" size={32} />
          </div>
          <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight">
            SIGERE <span className="text-blue-600">Web</span>
          </h1>
          <p className="text-slate-500 text-sm font-medium mt-1">
            Despacho Provincial Cienfuegos
          </p>
        </div>

        <form onSubmit={handleLogin} className="p-8 space-y-6">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-3 flex items-center gap-2 text-red-700 text-sm animate-bounce">
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase ml-1">
              Usuario
            </label>
            <div className="relative">
              <User
                className="absolute left-3 top-3 text-slate-400"
                size={20}
              />
              <input
                type="text"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-slate-700"
                placeholder="Ej: bcastellano"
                required
                disabled={cargando}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase ml-1">
              Contraseña
            </label>
            <div className="relative">
              <Lock
                className="absolute left-3 top-3 text-slate-400"
                size={20}
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-slate-700"
                placeholder="••••••••"
                required
                disabled={cargando}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={cargando}
            className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 disabled:cursor-not-allowed text-white py-4 rounded-xl font-bold transition-all shadow-lg active:scale-[0.98] flex items-center justify-center gap-2"
          >
            {cargando ? (
              <>
                <Loader size={20} className="animate-spin" />
                Accediendo...
              </>
            ) : (
              "Acceder al Sistema"
            )}
          </button>
        </form>

        {/* Ayuda de credenciales en modo demo */}
        <div className="p-4 bg-blue-50 border-t border-blue-200">
          <p className="text-xs font-bold text-blue-800 mb-2">📝 Credenciales Demo:</p>
          <div className="space-y-1 text-[11px] text-blue-700">
            <p><strong>Admin:</strong> bcastellano / admin123</p>
            <p><strong>Operador:</strong> clopez / operador123</p>
            <p><strong>Operador:</strong> mgarcia / operador123</p>
          </div>
        </div>

        <div className="p-4 bg-slate-50 border-t text-center">
          <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">
            Empresa Eléctrica Cienfuegos © 2025
          </p>
        </div>
      </div>
    </div>
  );
}
