import { AlertCircle, CheckCircle } from "lucide-react";

export default function AlertMessage({ type = "error", title, message, onClose }) {
  const isError = type === "error";
  const bgColor = isError ? "bg-red-50 border-red-200 text-red-800" : "bg-green-50 border-green-200 text-green-800";
  const Icon = isError ? AlertCircle : CheckCircle;

  return (
    <div className={`p-4 rounded-lg border flex items-start gap-3 ${bgColor}`}>
      <Icon size={20} className="mt-0.5 shrink-0" />
      <div className="flex-1">
        {title && <p className="font-bold">{title}</p>}
        <p className="text-sm">{message}</p>
      </div>
      {onClose && (
        <button onClick={onClose} className="text-lg font-bold leading-none">
          ✕
        </button>
      )}
    </div>
  );
}
