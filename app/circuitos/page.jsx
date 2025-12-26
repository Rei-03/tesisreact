"use client";
import {
  AlertCircle,
  Check,
  FileSpreadsheet,
  MapPin,
  X,
  Zap,
} from "lucide-react";
import { useState } from "react";
import * as XLSX from "xlsx";

export default function CircuitosPage() {
  // ESTADOS
  const [mostrarPropuesta, setMostrarPropuesta] = useState(false);

  // DATOS SIMULADOS (En el futuro vendrán de tu API/SQL Server)
  const [circuitosApagados, setCircuitosApagados] = useState([
    {
      bloque: 1,
      id: "C-84",
      nro: "1435",
      clientes: 3218,
      mw: 1.39,
      tiempo: "07:50",
      zona: "Espartaco",
    },
    {
      bloque: 1,
      id: "C-24",
      nro: "1400",
      clientes: 997,
      mw: 0.25,
      tiempo: "08:30",
      zona: "Pérez Leyva",
    },
    {
      bloque: 2,
      id: "C-55",
      nro: "76",
      clientes: 4093,
      mw: 1.18,
      tiempo: "07:22",
      zona: "Cruces (S...)",
    },
  ]);

  const propuestaCalculada = [
    { bloque: 1, id: "C-21", nro: "1400", mw: 0.29, zona: "Santa Elena" },
    { bloque: 1, id: "C-88", nro: "52", mw: 1.15, zona: "Castillo de Jagua" },
  ];

  // LÓGICA DE EXPORTACIÓN
  const exportarAExcel = (datos, nombreArchivo) => {
    // Formateamos los datos para que las columnas se vean bien en el Excel
    const datosFormateados = datos.map((item) => ({
      Bloque: item.bloque,
      "ID Circuito": item.id,
      Número: item.nro,
      "Carga (MW)": item.mw,
      "Zona/Observación": item.zona,
      ...(item.clientes && { Clientes: item.clientes }),
      ...(item.tiempo && { "Tiempo Transcurrido": item.tiempo }),
    }));

    const hoja = XLSX.utils.json_to_sheet(datosFormateados);
    const libro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libro, hoja, "Reporte");
    XLSX.writeFile(libro, `${nombreArchivo}.xlsx`);
  };

  const totalPropuesta = propuestaCalculada.reduce(
    (acc, curr) => acc + curr.mw,
    0
  );

  return (
    <div className="space-y-6">
      {/* CABECERA DE LA PÁGINA */}
      <div className="flex justify-between items-center bg-white p-6 rounded-xl border shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">
            Monitoreo de Circuitos
          </h2>
          <p className="text-sm text-slate-500 font-medium italic">
            Gestión de afectaciones y rotación de bloques
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() =>
              exportarAExcel(circuitosApagados, "Estado_Actual_Apagados")
            }
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors shadow-sm"
          >
            <FileSpreadsheet size={18} /> Exportar Estado Actual
          </button>
          <button
            onClick={() => setMostrarPropuesta(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors shadow-md"
          >
            <Zap size={18} /> Generar Propuesta
          </button>
        </div>
      </div>

      {/* TABLA DE CIRCUITOS APAGADOS (ESTADO ACTUAL) */}
      <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
        <div className="p-4 bg-slate-50 border-b flex items-center gap-2 text-slate-700 font-bold">
          <AlertCircle size={18} className="text-red-500" />
          Circuitos Actualmente Afectados
        </div>
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-800 text-slate-200 text-xs uppercase tracking-wider">
            <tr>
              <th className="p-4 font-semibold text-center border-r border-slate-700">
                Bloque
              </th>
              <th className="p-4 font-semibold text-center">ID / Nro</th>
              <th className="p-4 font-semibold text-center">Clientes</th>
              <th className="p-4 font-semibold text-center">Carga MW</th>
              <th className="p-4 font-semibold text-center">Tiempo</th>
              <th className="p-4 font-semibold">Zona / Observación</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {circuitosApagados.map((c, index) => (
              <tr key={index} className="hover:bg-blue-50/50 transition-colors">
                <td className="p-4 text-center border-r border-slate-50 font-bold text-blue-700 bg-slate-50/30">
                  {c.bloque}
                </td>
                <td className="p-4 text-center">
                  <div className="font-bold text-slate-700">{c.id}</div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    {c.nro}
                  </div>
                </td>
                <td className="p-4 text-center text-slate-600">
                  {c.clientes.toLocaleString()}
                </td>
                <td className="p-4 text-center text-red-600 font-black">
                  {c.mw.toFixed(2)}
                </td>
                <td className="p-4 text-center font-mono text-slate-600">
                  {c.tiempo}
                </td>
                <td className="p-4 text-slate-500 text-sm max-w-[200px] truncate">
                  <div className="flex items-center gap-1">
                    <MapPin size={12} /> {c.zona}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL DE PROPUESTA (VENTANA EMERGENTE) */}
      {mostrarPropuesta && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-all">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border animate-in zoom-in duration-200">
            {/* Cabecera Modal */}
            <div className="p-6 border-b flex justify-between items-center bg-slate-50">
              <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Zap className="text-yellow-500 fill-yellow-500" /> Propuesta de
                Rotación
              </h3>
              <button
                onClick={() => setMostrarPropuesta(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={24} />
              </button>
            </div>

            {/* Contenido Modal */}
            <div className="p-6 space-y-4">
              <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl">
                <p className="text-sm text-blue-800">
                  Afectación sugerida para cubrir el déficit detectado. Los
                  circuitos pertenecen al{" "}
                  <span className="font-black">Bloque 1</span>.
                </p>
              </div>

              <div className="border rounded-xl overflow-hidden divide-y">
                {propuestaCalculada.map((c) => (
                  <div
                    key={c.id}
                    className="p-4 flex justify-between items-center hover:bg-slate-50 transition-colors"
                  >
                    <div>
                      <div className="font-bold text-slate-800">
                        {c.id}{" "}
                        <span className="text-xs font-normal text-slate-400 italic">
                          #{c.nro}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 flex items-center gap-1">
                        <MapPin size={10} /> {c.zona}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-black text-red-600">
                        {c.mw.toFixed(2)} MW
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center pt-4 px-2 border-t text-slate-800 font-bold">
                <span>Total de la Orden:</span>
                <span className="text-2xl font-black text-blue-600 font-mono">
                  {totalPropuesta.toFixed(2)} MW
                </span>
              </div>
            </div>

            {/* Acciones Modal */}
            <div className="p-6 bg-slate-50 flex flex-col gap-3">
              <div className="flex gap-3">
                <button
                  onClick={() =>
                    exportarAExcel(
                      propuestaCalculada,
                      "Orden_Para_Carros_Brigada"
                    )
                  }
                  className="flex-1 bg-white border border-slate-300 text-slate-700 py-3 rounded-xl font-bold hover:bg-slate-100 transition-colors flex items-center justify-center gap-2"
                >
                  <FileSpreadsheet size={18} /> Descargar Orden
                </button>
                <button
                  onClick={() => {
                    alert(
                      "Rotación Registrada. Se ha actualizado el estado del sistema."
                    );
                    setMostrarPropuesta(false);
                  }}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 flex items-center justify-center gap-2"
                >
                  <Check size={20} /> Registrar Orden
                </button>
              </div>
              <button
                onClick={() => setMostrarPropuesta(false)}
                className="text-center text-slate-400 text-xs hover:underline"
              >
                Cerrar sin guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
