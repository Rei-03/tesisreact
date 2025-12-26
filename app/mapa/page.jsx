// app/mapa/page.jsx
"use client";
import "leaflet/dist/leaflet.css";
import dynamic from "next/dynamic";
import { useEffect } from "react";

// Cargamos el mapa de forma dinámica para evitar errores de SSR (Server Side Rendering)
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const CircleMarker = dynamic(
  () => import("react-leaflet").then((mod) => mod.CircleMarker),
  { ssr: false }
);
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), {
  ssr: false,
});

// Datos simulados de circuitos con coordenadas (Cienfuegos)
const puntosCircuitos = [
  {
    id: "C-84",
    nombre: "Espartaco",
    lat: 22.145,
    lng: -80.435,
    mw: 1.39,
    estado: "Apagado",
  },
  {
    id: "C-55",
    nombre: "Cruces Centro",
    lat: 22.341,
    lng: -80.267,
    mw: 1.18,
    estado: "Apagado",
  },
  {
    id: "C-24",
    nombre: "Pérez Leyva",
    lat: 22.15,
    lng: -80.44,
    mw: 0.25,
    estado: "Servicio",
  },
  {
    id: "C-122",
    nombre: "Hospital Provincial",
    lat: 22.155,
    lng: -80.43,
    mw: 1.2,
    estado: "Asegurado",
  },
];

export default function MapaPage() {
  const position = [22.145, -80.435]; // Centro de Cienfuegos

  // Asegurar que los iconos se configuren correctamente para Next.js
  useEffect(() => {
    if (typeof window !== "undefined") {
      const L = require("leaflet");
      // Fix para los iconos de Leaflet en Next.js
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
        iconUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
        shadowUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
      });
    }
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">
          Mapa de Afectaciones en Tiempo Real
        </h2>
        <div className="flex gap-4 text-xs font-bold uppercase">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 bg-red-500 rounded-full"></span> Apagado
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 bg-green-500 rounded-full"></span> Servicio
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 bg-blue-500 rounded-full"></span> Asegurado
          </span>
        </div>
      </div>

      <div className="h-[calc(100vh-200px)] w-full rounded-xl border-4 border-white shadow-lg overflow-hidden z-0">
        <MapContainer
          center={position}
          zoom={10}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />

          {puntosCircuitos.map((punto) => (
            <CircleMarker
              key={punto.id}
              center={[punto.lat, punto.lng]}
              radius={12}
              pathOptions={{
                fillColor:
                  punto.estado === "Apagado"
                    ? "#ef4444"
                    : punto.estado === "Asegurado"
                    ? "#3b82f6"
                    : "#22c55e",
                color: "white",
                weight: 2,
                fillOpacity: 0.8,
              }}
            >
              <Popup>
                <div className="p-1">
                  <h4 className="font-bold border-b mb-1">{punto.nombre}</h4>
                  <p className="text-xs">ID: {punto.id}</p>
                  <p className="text-xs font-bold text-red-600">
                    Carga: {punto.mw} MW
                  </p>
                  <p className="text-xs italic">Estado: {punto.estado}</p>
                </div>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
