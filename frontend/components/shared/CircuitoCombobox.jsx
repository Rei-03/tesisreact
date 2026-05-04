"use client";
import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, X, Search } from "lucide-react";

/**
 * Componente Combobox autocompletable para seleccionar circuitos
 * Permite búsqueda en tiempo real por CircuitoP
 */
export default function CircuitoCombobox({
  circuitos = [],
  value,
  onChange,
  placeholder = "Buscar y seleccionar circuito...",
  disabled = false,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  // Filtrar circuitos según búsqueda
  const filteredCircuitos = circuitos.filter((c) => {
    if (!c.CircuitoP) return false;
    const searchLower = searchTerm.toLowerCase();
    return (
      c.CircuitoP.toLowerCase().includes(searchLower) ||
      String(c.idCircuitoP).includes(searchTerm)
    );
  });

  // Obtener el circuito seleccionado
  const selectedCircuito = circuitos.find((c) => c.idCircuitoP === Number(value));

  // Cerrar cuando clickean afuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (circuito) => {
    onChange({
      target: {
        name: "id_CircuitoP",
        value: circuito.idCircuitoP,
        circuitoP: circuito.CircuitoP,
      },
    });
    setSearchTerm("");
    setIsOpen(false);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange({ target: { name: "id_CircuitoP", value: "" } });
    setSearchTerm("");
    setIsOpen(false);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      <div className={`relative border rounded-lg bg-white transition-all ${
        isOpen ? "ring-2 ring-blue-500 border-blue-500 shadow-md" : "border-slate-300"
      } ${disabled ? "bg-slate-100" : ""}`}>
        
        {/* Icono búsqueda */}
        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <Search size={16} className="text-slate-400" />
        </div>

        {/* Input - SIN overlay */}
        <input
          ref={inputRef}
          type="text"
          disabled={disabled}
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => {
            if (!disabled) setIsOpen(true);
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setIsOpen(false);
              setSearchTerm("");
            }
          }}
          placeholder={
            searchTerm === "" && value && selectedCircuito
              ? `${selectedCircuito.CircuitoP} (${selectedCircuito.idCircuitoP})`
              : placeholder
          }
          className="w-full pl-9 pr-12 py-2.5 bg-white outline-none placeholder-slate-500 text-sm border-0 disabled:bg-slate-100"
        />

        {/* Icono derecha */}
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none">
          {value && searchTerm === "" && (
            <button
              onClick={handleClear}
              className="pointer-events-auto p-1 hover:bg-red-50 rounded text-slate-400 hover:text-red-600"
              type="button"
            >
              <X size={16} />
            </button>
          )}
          <ChevronDown
            size={18}
            className={`text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
          />
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-300 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
          {filteredCircuitos.length > 0 ? (
            <ul className="py-1">
              {filteredCircuitos.map((circuito) => (
                <li
                  key={circuito.idCircuitoP}
                  onClick={() => handleSelect(circuito)}
                  className={`px-4 py-2 cursor-pointer transition-colors text-sm ${
                    value === circuito.idCircuitoP
                      ? "bg-blue-100 text-blue-900 font-semibold"
                      : "hover:bg-slate-100"
                  }`}
                >
                  <div className="font-medium">{circuito.CircuitoP}</div>
                  <div className="text-xs text-slate-500">ID: {circuito.idCircuitoP}</div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-4 py-4 text-center text-slate-500 text-sm">
              No hay circuitos con "{searchTerm}"
            </div>
          )}
        </div>
      )}
    </div>
  );
}
