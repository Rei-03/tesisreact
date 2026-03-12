import { BaseRPCException } from './base-rpc.exception';

/**
 * Excepción RPC para conflicto de datos (409)
 */
export class ConflictRPCException extends BaseRPCException {
  constructor(message: string = 'Conflicto', error: string = 'CONFLICT', details?: Record<string, any>) {
    super(409, message, error, details);
  }
}
