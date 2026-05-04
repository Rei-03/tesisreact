"use client";
import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, X } from "lucide-react";

/**
 * Componente Autocomplete para Circuitos
 * - Muestra lista al tener focus
 * - Filtra mientras escribes
 * - Al seleccionar, devuelve {id_CircuitoP, CircuitoP}
 */
export default function CircuitoAutocomplete({
  circuitos = [],
  value = null, // {id_CircuitoP, CircuitoP}
  onChange,
  placeholder = "Selecciona o busca un circuito...",
  disabled = false,
}) {
  const [inputValue, setInputValue] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [filtered, setFiltered] = useState([]);
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  // Encontrar el circuito seleccionado
  const selectedCircuito = value
    ? circuitos.find((c) => c.idCircuitoP === value.id_CircuitoP)
    : null;

  // Filtrar circuitos según input
  useEffect(() => {
    if (inputValue.trim() === "") {
      setFiltered(circuitos);
    } else {
      const search = inputValue.toLowerCase();
      setFiltered(
        circuitos.filter(
          (c) =>
            c.CircuitoP?.toLowerCase().includes(search) ||
            String(c.idCircuitoP).includes(inputValue)
        )
      );
    }
  }, [inputValue, circuitos]);

  // Cerrar al clickear fuera
  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Seleccionar opción
  function handleSelect(circuito) {
    onChange({
      id_CircuitoP: circuito.idCircuitoP,
      CircuitoP: circuito.CircuitoP,
    });
    setInputValue("");
    setIsOpen(false);
  }

  // Limpiar selección
  function handleClear(e) {
    e.stopPropagation();
    onChange(null);
    setInputValue("");
    setIsOpen(false);
    inputRef.current?.focus();
  }

  return (
    <div ref={containerRef} className="relative w-full">
      {/* INPUT */}
      <div
        className={`relative w-full flex items-center gap-2 px-4 py-2 border rounded-lg bg-white transition-all ${
          isOpen
            ? "border-blue-500 ring-2 ring-blue-100"
            : ""
        } ${disabled ? "bg-slate-100 cursor-not-allowed" : ""}`}
      >
        <input
          ref={inputRef}
          type="text"
          disabled={disabled}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setIsOpen(false);
            }
          }}
          placeholder={
            !inputValue && selectedCircuito
              ? `${selectedCircuito.CircuitoP} (${selectedCircuito.idCircuitoP})`
              : placeholder
          }
          className="flex-1 outline-none bg-transparent text-sm placeholder-slate-500 disabled:bg-slate-100"
        />

        {/* BOTONES DERECHA */}
        <div className="flex items-center gap-2">
          {value && !inputValue && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 hover:bg-red-50 rounded text-slate-400 hover:text-red-600 transition"
            >
              <X size={16} />
            </button>
          )}
          <ChevronDown
            size={18}
            className={`text-slate-400 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </div>
      </div>

      {/* DROPDOWN */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-300 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
          {filtered.length > 0 ? (
            <ul>
              {filtered.map((c) => (
                <li
                  key={c.idCircuitoP}
                  onClick={() => handleSelect(c)}
                  className={`px-4 py-3 cursor-pointer transition-colors border-l-4 ${
                    value?.id_CircuitoP === c.idCircuitoP
                      ? "bg-blue-50 text-blue-900 border-l-blue-500 font-semibold"
                      : "hover:bg-slate-50 border-l-transparent"
                  }`}
                >
                  <div className="font-medium">{c.CircuitoP}</div>
                  <div className="text-xs text-slate-500">ID: {c.idCircuitoP}</div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-4 py-6 text-center text-slate-400 text-sm">
              No hay circuitos disponibles
            </div>
          )}
        </div>
      )}
    </div>
  );
}
