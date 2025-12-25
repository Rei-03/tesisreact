// components/Sidebar.js
import {
  FileBarChart,
  LayoutDashboard,
  Map,
  Settings,
  ShieldCheck,
  Zap,
} from "lucide-react";
import Link from "next/link";

const menuItems = [
  {
    name: "Dashboard",
    icon: <LayoutDashboard size={20} />,
    href: "/dashboard",
  },
  { name: "Circuitos", icon: <Zap size={20} />, href: "/circuitos" },
  { name: "Mapa CFG", icon: <Map size={20} />, href: "/mapa" },
  {
    name: "Aseguramientos",
    icon: <ShieldCheck size={20} />,
    href: "/aseguramientos",
  },
  { name: "Reportes", icon: <FileBarChart size={20} />, href: "/reportes" },
  {
    name: "Configuración",
    icon: <Settings size={20} />,
    href: "/configuracion",
  },
];

export default function Sidebar() {
  return (
    <div className="w-64 bg-slate-900 text-white h-screen fixed left-0 top-0 p-4 shadow-xl">
      <div className="mb-8 px-2">
        <h1 className="text-xl font-bold text-yellow-500 flex items-center gap-2">
          <Zap fill="currentColor" /> Sistema Eléctrico
        </h1>
        <p className="text-xs text-slate-400">Despacho Cienfuegos</p>
      </div>

      <nav className="space-y-2">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 transition-colors text-slate-300 hover:text-white"
          >
            {item.icon}
            <span className="font-medium">{item.name}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
