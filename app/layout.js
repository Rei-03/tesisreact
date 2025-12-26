// app/layout.js
import { AuthProvider } from '@/contexts/AuthContext';
import './globals.css';
import LayoutClientWrapper from './LayoutClientWrapper';

export const metadata = {
  title: 'Sistema de Rotación de Circuitos - CFG',
  description: 'Gestión de déficit de generación eléctrica',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className="bg-slate-50 text-slate-900">
        <AuthProvider>
          <LayoutClientWrapper>
            {children}
          </LayoutClientWrapper>
        </AuthProvider>
      </body>
    </html>
  );
}