import { BaseRPCException } from './base-rpc.exception';

/**
 * Excepción RPC para acceso prohibido (403)
 */
export class ForbiddenRPCException extends BaseRPCException {
  constructor(message: string = 'Acceso prohibido', error: string = 'FORBIDDEN', details?: Record<string, any>) {
    super(403, message, error, details);
  }
}
