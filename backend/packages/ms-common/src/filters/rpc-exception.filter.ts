import { Catch, RpcExceptionFilter, ArgumentsHost } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { throwError } from 'rxjs';
import { BaseRPCException, type IRPCError } from '../exceptions/base-rpc.exception';

/**
 * Filtro de excepciones RPC para mantener el formato consistente
 * en las comunicaciones entre microservicios
 *
 * Se encarga de:
 * - Capturar excepciones RPC (incluyendo BaseRPCException)
 * - Asegurar que el formato de respuesta sea consistente
 * - Mantener la información de estado y mensaje de error
 */
@Catch(RpcException)
export class CustomRpcExceptionFilter implements RpcExceptionFilter<RpcException> {
  catch(exception: RpcException, host: ArgumentsHost) {
    // Verificar si es una BaseRPCException
    if (exception instanceof BaseRPCException) {
      return throwError(() => exception.getError());
    }

    // Para otras RpcExceptions, intentar extraer los datos
    const error = exception.getError() as any;

    // Si ya tiene el formato correcto, devolverlo
    if (this.isFormattedError(error)) {
      return throwError(() => error);
    }

    // Si no, construir el formato esperado
    return throwError(() => this.formatError(error));
  }

  /**
   * Verifica si el error ya tiene el formato esperado
   */
  private isFormattedError(error: any): error is IRPCError {
    return (
      error &&
      typeof error === 'object' &&
      typeof error.status === 'number' &&
      typeof error.message === 'string'
    );
  }

  /**
   * Formatea el error al formato estándar IRPCError
   */
  private formatError(error: any): IRPCError {
    if (typeof error === 'string') {
      return {
        status: 500,
        message: error,
        error: 'INTERNAL_SERVER_ERROR',
      };
    }

    if (error && typeof error === 'object') {
      return {
        status: error.status || 500,
        message: error.message || 'An unexpected error occurred',
        error: error.error || error.type || 'INTERNAL_SERVER_ERROR',
        details: error.details || error.data,
      };
    }

    return {
      status: 500,
      message: 'An unexpected error occurred',
      error: 'INTERNAL_SERVER_ERROR',
    };
  }
}
