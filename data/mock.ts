import { CircuitoReal, AseguramientoReal, ProxAperturaReal } from '../types';

// Datos mock realistas basados en la estructura de la BD C# (SIGERE y PSFV)
// Incluye circuitos APAGABLES (Apagable = true) y NO APAGABLES (Apagable = false)

export const circuitosMock: CircuitoReal[] = [
  // Bloque 1 - Apagables
  {
    idCircuitoP: 101,
    idProv: "CFG",
    Circuito33: "CIRC-33-A",
    Bloque: 1,
    CircuitoP: "Circuito Comercial Centro",
    Clientes: 1250,
    ZonaAfectada: "Centro Comercial",
    Apagable: true
  },
  {
    idCircuitoP: 102,
    idProv: "CFG",
    Circuito33: "CIRC-33-B",
    Bloque: 1,
    CircuitoP: "Circuito Espartaco",
    Clientes: 1890,
    ZonaAfectada: "Reparto Espartaco",
    Apagable: true
  },
  {
    idCircuitoP: 107,
    idProv: "CFG",
    Circuito33: "CIRC-33-G",
    Bloque: 1,
    CircuitoP: "Circuito Residencial Pérez Leyva",
    Clientes: 2100,
    ZonaAfectada: "Pérez Leyva",
    Apagable: true
  },
  {
    idCircuitoP: 111,
    idProv: "CFG",
    Circuito33: "CIRC-33-K",
    Bloque: 1,
    CircuitoP: "Circuito Santa Elena",
    Clientes: 1560,
    ZonaAfectada: "Santa Elena",
    Apagable: true
  },

  // Bloque 2 - Mix
  {
    idCircuitoP: 104,
    idProv: "CFG",
    Circuito33: "CIRC-33-D",
    Bloque: 2,
    CircuitoP: "Circuito Cruces",
    Clientes: 750,
    ZonaAfectada: "Cruces",
    Apagable: true
  },
  {
    idCircuitoP: 108,
    idProv: "CFG",
    Circuito33: "CIRC-33-H",
    Bloque: 2,
    CircuitoP: "Circuito Hospitalario Provincial",
    Clientes: 320,
    ZonaAfectada: "Hospital",
    Apagable: false
  },
  {
    idCircuitoP: 103,
    idProv: "CFG",
    Circuito33: "CIRC-33-C",
    Bloque: 2,
    CircuitoP: "Circuito Castillo de Jagua",
    Clientes: 1450,
    ZonaAfectada: "Castillo de Jagua",
    Apagable: false
  },
  {
    idCircuitoP: 112,
    idProv: "CFG",
    Circuito33: "CIRC-33-L",
    Bloque: 2,
    CircuitoP: "Circuito Industrial Sur",
    Clientes: 890,
    ZonaAfectada: "Zona Industrial",
    Apagable: true
  },

  // Bloque 3 - Apagables
  {
    idCircuitoP: 105,
    idProv: "CFG",
    Circuito33: "CIRC-33-E",
    Bloque: 3,
    CircuitoP: "Circuito Oeste Industrial",
    Clientes: 1100,
    ZonaAfectada: "Zona Oeste",
    Apagable: true
  },
  {
    idCircuitoP: 109,
    idProv: "CFG",
    Circuito33: "CIRC-33-I",
    Bloque: 3,
    CircuitoP: "Circuito Educativo",
    Clientes: 680,
    ZonaAfectada: "Zona Educativa",
    Apagable: true
  },
  {
    idCircuitoP: 106,
    idProv: "CFG",
    Circuito33: "CIRC-33-F",
    Bloque: 3,
    CircuitoP: "Circuito Reserva Puerto",
    Clientes: 520,
    ZonaAfectada: "Puerto",
    Apagable: false
  },
  {
    idCircuitoP: 110,
    idProv: "CFG",
    Circuito33: "CIRC-33-J",
    Bloque: 3,
    CircuitoP: "Circuito Residencial Oeste",
    Clientes: 950,
    ZonaAfectada: "Residencial Oeste",
    Apagable: true
  },
  {
    idCircuitoP: 113,
    idProv: "CFG",
    Circuito33: "CIRC-33-M",
    Bloque: 3,
    CircuitoP: "Circuito Comercial Este",
    Clientes: 1320,
    ZonaAfectada: "Este Comercial",
    Apagable: true
  }
];

export const aseguramientosMock: AseguramientoReal[] = [
  // Aseguramientos para HOY (enero 4, 2026) - usar fechas que incluyan hoy
  {
    id_CircuitoP: 108,
    CircuitoP: "Circuito Hospitalario Provincial",
    fechaInicial: new Date(2026, 0, 1),  // enero 1
    fechaFinal: new Date(2026, 11, 31),  // diciembre 31
    Observaciones: "Protección hospitalaria prioritaria - Servicios de emergencia 24/7",
    mw: 15.7,
    tipo: "Permanente"
  },
  {
    id_CircuitoP: 103,
    CircuitoP: "Circuito Castillo de Jagua",
    fechaInicial: new Date(2026, 0, 1),
    fechaFinal: new Date(2026, 11, 31),
    Observaciones: "Protección de patrimonio histórico",
    mw: 8.5,
    tipo: "Permanente"
  },
  {
    id_CircuitoP: 104,
    CircuitoP: "Circuito Cruces",
    fechaInicial: new Date(2026, 0, 2),
    fechaFinal: new Date(2026, 0, 8),
    Observaciones: "Mantenimiento programado de infraestructura vial",
    mw: 12.3,
    tipo: "Programado"
  },
  {
    id_CircuitoP: 109,
    CircuitoP: "Circuito Educativo",
    fechaInicial: new Date(2026, 0, 4),  // Hoy
    fechaFinal: new Date(2026, 0, 10),
    Observaciones: "Período de exámenes en universidades e institutos",
    mw: 9.8,
    tipo: "Temporal"
  },
  {
    id_CircuitoP: 102,
    CircuitoP: "Circuito Espartaco",
    fechaInicial: new Date(2026, 0, 3),
    fechaFinal: new Date(2026, 0, 15),
    Observaciones: "Reparación de red de distribución",
    mw: 22.1,
    tipo: "Temporal"
  },
  {
    id_CircuitoP: 112,
    CircuitoP: "Circuito Industrial Sur",
    fechaInicial: new Date(2026, 0, 4),  // Hoy
    fechaFinal: new Date(2026, 0, 6),
    Observaciones: "Mantenimiento de equipos industriales críticos",
    mw: 18.9,
    tipo: "Programado"
  }
];

export const proxAperturasMock: ProxAperturaReal[] = [
  {
    id_Circuito: 101,
    Circiuto: "Circuito Comercial Centro",
    MWHoraActual: 18.5,
    Bloque: 1
  },
  {
    id_Circuito: 102,
    Circiuto: "Circuito Espartaco",
    MWHoraActual: 22.3,
    Bloque: 1
  },
  {
    id_Circuito: 107,
    Circiuto: "Circuito Residencial Pérez Leyva",
    MWHoraActual: 19.7,
    Bloque: 1
  },
  {
    id_Circuito: 111,
    Circiuto: "Circuito Santa Elena",
    MWHoraActual: 14.2,
    Bloque: 1
  },
  {
    id_Circuito: 104,
    Circiuto: "Circuito Cruces",
    MWHoraActual: 8.9,
    Bloque: 2
  },
  {
    id_Circuito: 112,
    Circiuto: "Circuito Industrial Sur",
    MWHoraActual: 25.1,
    Bloque: 2
  },
  {
    id_Circuito: 105,
    Circiuto: "Circuito Oeste Industrial",
    MWHoraActual: 15.2,
    Bloque: 3
  },
  {
    id_Circuito: 109,
    Circiuto: "Circuito Educativo",
    MWHoraActual: 11.6,
    Bloque: 3
  },
  {
    id_Circuito: 110,
    Circiuto: "Circuito Residencial Oeste",
    MWHoraActual: 16.8,
    Bloque: 3
  },
  {
    id_Circuito: 113,
    Circiuto: "Circuito Comercial Este",
    MWHoraActual: 19.4,
    Bloque: 3
  }
];