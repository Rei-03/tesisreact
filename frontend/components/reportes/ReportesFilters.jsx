import { Filter, Download, Loader, BarChart3 } from "lucide-react";

export default function ReportesFilters({
  filtroDesde,
  setFiltroDesde,
  filtroHasta,
  setFiltroHasta,
  onFiltrar,
  onDescargarAseguramientosPDF,
  onDescargarAseguramientosExcel,
  onDescargarEstadisticoPDF,
  descargando,
  estadisticas,
}) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Desde</label>
          <input
            type="date"
            value={filtroDesde}
            onChange={(e) => setFiltroDesde(e.target.value)}
            className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Hasta</label>
          <input
            type="date"
            value={filtroHasta}
            onChange={(e) => setFiltroHasta(e.target.value)}
            className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          onClick={onFiltrar}
          className="mt-6 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold transition-colors"
        >
          <Filter size={18} /> Filtrar
        </button>

        <button
          onClick={onDescargarEstadisticoPDF}
          disabled={descargando === "stats-pdf"}
          className="mt-6 flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-400 text-white px-4 py-2 rounded-lg font-bold transition-colors"
        >
          {descargando === "stats-pdf" ? <Loader size={18} className="animate-spin" /> : <BarChart3 size={18} />}
          Estadísticas
        </button>
      </div>

      {estadisticas && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t">
          <div className="bg-blue-50 p-3 rounded">
            <p className="text-xs text-slate-600">Totales</p>
            <p className="text-2xl font-bold text-blue-600">{estadisticas.totalRotaciones || 0}</p>
          </div>
          <div className="bg-green-50 p-3 rounded">
            <p className="text-xs text-slate-600">MW Promedio</p>
            <p className="text-2xl font-bold text-green-600">{estadisticas.mwPromedio?.toFixed(1) || 0} MW</p>
          </div>
          <div className="bg-yellow-50 p-3 rounded">
            <p className="text-xs text-slate-600">Circuitos Promedio</p>
            <p className="text-2xl font-bold text-yellow-600">{estadisticas.circuitosPromedio?.toFixed(1) || 0}</p>
          </div>
        </div>
      )}

      <div className="mt-4 pt-4 border-t flex gap-2 flex-wrap">
        <button
          onClick={onDescargarAseguramientosPDF}
          disabled={descargando === "aseg-pdf"}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:bg-slate-400 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors"
        >
          {descargando === "aseg-pdf" ? <Loader size={16} className="animate-spin" /> : <Download size={16} />}
          Descargar Aseguramientos (PDF)
        </button>
        <button
          onClick={onDescargarAseguramientosExcel}
          disabled={descargando === "aseg-excel"}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-slate-400 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors"
        >
          {descargando === "aseg-excel" ? <Loader size={16} className="animate-spin" /> : <Download size={16} />}
          Descargar Aseguramientos (XLSX)
        </button>
      </div>
    </div>
  );
}
