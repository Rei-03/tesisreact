import { BaseRPCException } from './base-rpc.exception';

/**
 * Excepción RPC para errores internos del servidor (500)
 */
export class InternalServerErrorRPCException extends BaseRPCException {
  constructor(message: string = 'Error interno del servidor', error: string = 'INTERNAL_SERVER_ERROR', details?: Record<string, any>) {
    super(500, message, error, details);
  }
}
