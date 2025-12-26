// app/LayoutClientWrapper.js
"use client";
import Sidebar from '@/components/Sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function LayoutClientWrapper({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, isLoading, logout } = useAuth();
  const isLoginPage = pathname === '/loguin' || pathname === '/login';

  const handleLogout = () => {
    logout();
    router.push('/loguin');
  };

  useEffect(() => {
    // Si no está cargando y no está autenticado, redirigir al login
    if (!isLoading && !isAuthenticated && !isLoginPage) {
      router.push('/loguin');
    }
    // Si está autenticado y está en la página de login, redirigir al dashboard
    if (!isLoading && isAuthenticated && isLoginPage) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isLoading, isLoginPage, router]);

  // Mostrar loading mientras se verifica la autenticación
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-slate-500">Cargando...</div>
      </div>
    );
  }

  // Si es la página de login, devolvemos el contenido limpio (sin sidebar)
  if (isLoginPage) {
    return <>{children}</>;
  }

  // Si no está autenticado, no mostrar nada (se redirigirá)
  if (!isAuthenticated) {
    return null;
  }

  // Si está autenticado, mostrar el layout completo
  return (
    <div className="flex">
      {/* Barra Lateral Fija */}
      <Sidebar />

      {/* Área de Contenido Principal */}
      <main className="flex-1 ml-64 min-h-screen">
        {/* Header Superior con Datos de Resumen (TU HEADER) */}
        <header className="h-16 bg-white border-b flex items-center justify-between px-8 sticky top-0 z-10">
          <div className="flex gap-8">
            <div>
              <span className="text-xs text-slate-500 block">Déficit Actual</span>
              <span className="font-bold text-red-600">45.2 MW</span>
            </div>
            <div>
              <span className="text-xs text-slate-500 block">Estado Sistema</span>
              <span className="font-bold text-orange-500">Crítico</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">Operador: B. Castellano</span>
            <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center text-xs text-slate-600 font-bold">BC</div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Cerrar sesión"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Salir</span>
            </button>
          </div>
        </header>

        {/* Contenido Dinámico de las Páginas */}
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}