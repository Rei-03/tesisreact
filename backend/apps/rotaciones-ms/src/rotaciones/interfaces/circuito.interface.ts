/**
 * Interfaz que representa un circuito eléctrico con información de consumo y estado
 */
export interface Circuito {
  // Datos básicos del circuito
  idCircuitoP: number;
  idProv: string;
  Circuito33: string;
  Bloque: number;
  CircuitoP: string;
  Clientes: number;
  ZonaAfectada: string;
  Apagable: boolean;
  
  // Estado del circuito
  estado: 'encendido' | 'apagado';
  protegido: boolean;
  ultimoCambioEstado: Date; // Última fecha de cambio de estado
  
  // Información de consumo
  consumo: {
    mw: number; // Consumo actual en MW
    historico: number[]; // Array de 24 horas
    fechaReferencia: string; // YYYY-MM-DD
  };
  
  // Información del último apagón (opcional)
  ultimoApagon?: {
    idApagon: number;
    FechaRetiro: Date;
    FechaCierre: Date | null;
    MWAfectados: number;
    Observaciones: string;
    AbiertoPor: number;
    estado: 'abierto' | 'cerrado';
  };
}

/**
 * Resultado del algoritmo de rotación de energía
 */
export interface ResultadoRotacion {
  cola: string[]; // IDs de circuitos apagados (o entrando en apagón)
  encendidos: string[]; // IDs de circuitos a encender
}

/**
 * Información de circuito con peso calculado para decisiones
 */
export interface CircuitoConPeso extends Circuito {
  tiempoEncendidoMinutos: number; // Tiempo que lleva encendido en minutos
  tiempoApagadoMinutos: number; // Tiempo que lleva apagado en minutos
  pesoApagado?: number; // Peso para decisión de apagado: (tiempo * 0.8) + (consumo * 0.2)
  posicionCola?: number; // Posición en la cola (para FIFO al encender)
}
