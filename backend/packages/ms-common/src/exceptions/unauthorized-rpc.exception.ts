import { BaseRPCException } from './base-rpc.exception';

/**
 * Excepción RPC para errores de autenticación (401)
 */
export class UnauthorizedRPCException extends BaseRPCException {
  constructor(message: string = 'No autorizado', error: string = 'UNAUTHORIZED', details?: Record<string, any>) {
    super(401, message, error, details);
  }
}
