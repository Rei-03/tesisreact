import { BaseRPCException } from './base-rpc.exception';

/**
 * Excepción RPC para recurso no encontrado (404)
 */
export class NotFoundRPCException extends BaseRPCException {
  constructor(message: string = 'Recurso no encontrado', error: string = 'NOT_FOUND', details?: Record<string, any>) {
    super(404, message, error, details);
  }
}
