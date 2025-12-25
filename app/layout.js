// app/layout.js
import Sidebar from '@/components/Sidebar';
import './globals.css';

export const metadata = {
  title: 'Sistema de Rotación de Circuitos - CFG',
  description: 'Gestión de déficit de generación eléctrica',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className="bg-slate-50 text-slate-900">
        <div className="flex">
          {/* Barra Lateral Fija */}
          <Sidebar />

          {/* Área de Contenido Principal */}
          <main className="flex-1 ml-64 min-h-screen">
            {/* Header Superior con Datos de Resumen */}
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
                <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center text-xs">BC</div>
              </div>
            </header>

            {/* Contenido Dinámico de las Páginas */}
            <div className="p-8">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}