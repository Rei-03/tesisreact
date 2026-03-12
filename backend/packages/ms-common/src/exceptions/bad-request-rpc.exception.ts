import { BaseRPCException } from './base-rpc.exception';

/**
 * Excepción RPC para solicitudes mal formadas (400)
 */
export class BadRequestRPCException extends BaseRPCException {
  constructor(message: string, error: string = 'BAD_REQUEST', details?: Record<string, any>) {
    super(400, message, error, details);
  }
}
