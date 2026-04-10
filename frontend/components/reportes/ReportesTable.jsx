import { FileText, Download, Loader } from "lucide-react";

export default function ReportesTable({
  reportes = [],
  onDescargarPDF,
  onDescargarExcel,
  descargando,
}) {
  return (
    <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
      <div className="p-4 bg-slate-50 border-b font-bold text-slate-700 flex items-center gap-2">
        <FileText className="text-blue-600" size={18} /> Reportes de Rotaciones
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-800 text-white">
            <tr>
              <th className="px-6 py-3 font-semibold">Circuitos</th>
              <th className="px-6 py-3 font-semibold">MW</th>
              <th className="px-6 py-3 font-semibold">Fecha</th>
              <th className="px-6 py-3 font-semibold text-center">Descargas</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {reportes.map((reporte) => (
              <tr key={reporte.id} className="hover:bg-slate-50">
                <td className="px-6 py-3 font-semibold">{reporte.cantidad_circuitos || 0}</td>
                <td className="px-6 py-3 font-bold text-blue-600">{reporte.mw_total?.toFixed(2) || 0} MW</td>
                <td className="px-6 py-3 text-sm text-slate-600">{new Date(reporte.createdAt).toLocaleDateString('es-ES')}</td>
                <td className="px-6 py-3 text-center flex gap-2 justify-center">
                  <button
                    onClick={() => onDescargarPDF(reporte.id)}
                    disabled={descargando === `pdf-${reporte.id}`}
                    className="flex items-center gap-1 text-red-600 hover:text-red-800 disabled:opacity-50 text-xs"
                  >
                    {descargando === `pdf-${reporte.id}` ? <Loader size={14} className="animate-spin" /> : <Download size={14} />}
                    PDF
                  </button>
                  <button
                    onClick={() => onDescargarExcel(reporte.id)}
                    disabled={descargando === `excel-${reporte.id}`}
                    className="flex items-center gap-1 text-green-600 hover:text-green-800 disabled:opacity-50 text-xs"
                  >
                    {descargando === `excel-${reporte.id}` ? <Loader size={14} className="animate-spin" /> : <Download size={14} />}
                    XLSX
                  </button>
                </td>
              </tr>
            ))}
            {reportes.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                  No hay reportes para mostrar
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
