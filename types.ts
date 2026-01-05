// types.ts - Interfaces basadas en la estructura real de la base de datos C#

// Tabla: SIGERE.ap_circuitos
export interface CircuitoReal {
  idCircuitoP: number;        // PK
  idProv: string;             // Ej: "CFG"
  Circuito33: string | null;
  Bloque: number | null;      // 1, 2, 3, etc.
  CircuitoP: string | null;   // Nombre para mostrar
  Clientes: number | null;    // Cantidad de clientes
  ZonaAfectada: string | null;
  Apagable: boolean;          // true/false - FILTRO CLAVE: WHERE Apagable = 1
}

// Alias para consistencia con BD real
export type ApCircuito = CircuitoReal;

// Tabla: PSFV.ap_Aseguramientos
export interface AseguramientoReal {
  id_CircuitoP: number;       // FK a ap_circuitos
  CircuitoP: string;          // Nombre del circuito
  fechaInicial: Date;
  fechaFinal: Date;
  Observaciones: string;
  mw: number | null;          // MegaWatts
  tipo: string;               // Tipo de aseguramiento
}

// Alias para consistencia con BD real
export type ApAseguramiento = AseguramientoReal;

// Tabla: PSFV.ap_ProxAperturas
export interface ProxAperturaReal {
  id_Circuito: number;        // FK a ap_circuitos (singular)
  Circiuto: string;           // NOTA: "Circiuto" con una 'i' (error de BD, mantener typo)
  MWHoraActual: number | null;
  Bloque: number | null;
}

// Alias para consistencia con BD real
export type ApProxApertura = ProxAperturaReal;

// Tipos auxiliares
export interface AfectacionResumen {
  idCircuitoP: number;
  CircuitoP: string;
  Bloque: number | null;
  ZonaAfectada: string | null;
  Clientes: number | null;
  MWAfectado: number | null;
  tiempoAfectado: number; // en minutos
}

export interface ResumenDashboard {
  totalCircuitosApagables: number;
  totalAseguramientosActivos: number;
  totalMWAsegurado: number;
  totalMWDisponible: number;
  totalClientes: number;
  proximasAperturas: number;
}