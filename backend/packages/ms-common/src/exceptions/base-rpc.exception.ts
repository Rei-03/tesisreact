import { RpcException } from '@nestjs/microservices';

/**
 * Interfaz que define el formato estándar de una excepción RPC
 */
export interface IRPCError {
  status: number;
  message: string;
  error?: string;
  details?: Record<string, any>;
}

/**
 * Excepción base RPC que establece una interfaz fija para todas las excepciones RPC
 * Extiende RpcException de NestJS y proporciona un formato consistente
 */
export class BaseRPCException extends RpcException {
  private readonly errorData: IRPCError;

  constructor(
    status: number,
    message: string,
    error?: string,
    details?: Record<string, any>,
  ) {
    const errorData: IRPCError = {
      status,
      message,
      ...(error && { error }),
      ...(details && { details }),
    };

    super(errorData);
    this.errorData = errorData;
  }

  /**
   * Obtiene los datos del error en el formato estándar
   */
  getError(): IRPCError {
    return this.errorData;
  }

  /**
   * Obtiene el código de estado HTTP
   */
  getStatus(): number {
    return this.errorData.status;
  }

  /**
   * Obtiene el mensaje de error
   */
  getMessage(): string {
    return this.errorData.message;
  }

  /**
   * Obtiene el tipo de error
   */
  getErrorType(): string | undefined {
    return this.errorData.error;
  }

  /**
   * Obtiene los detalles adicionales del error
   */
  getDetails(): Record<string, any> | undefined {
    return this.errorData.details;
  }
}
