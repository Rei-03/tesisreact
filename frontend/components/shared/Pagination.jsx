import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  return (
    <div className="flex items-center justify-center gap-2 mt-4">
      <button
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className="p-2 rounded border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100"
      >
        <ChevronLeft size={18} />
      </button>

      <span className="text-sm text-slate-600">
        Página <span className="font-bold">{currentPage}</span> de <span className="font-bold">{totalPages}</span>
      </span>

      <button
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className="p-2 rounded border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100"
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );
}
