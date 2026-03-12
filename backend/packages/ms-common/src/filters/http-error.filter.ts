import {
  Catch,
  ExceptionFilter,
  ArgumentsHost,
  HttpException,
  BadRequestException,
  UnauthorizedException,
  ForbiddenException,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Response } from 'express';
import { throwError } from 'rxjs';

/**
 * Respuesta estándar del servidor al fronted
 */
export interface IHttpErrorResponse {
  success: false;
  status: number;
  message: string;
  error: string;
  details?: Record<string, any>;
  timestamp?: string;
  path?: string;
}

/**
 * Filtro de excepciones HTTP para el frontend
 *
 * Se encarga de:
 * - Capturar excepciones HTTP de NestJS
 * - Convertir objetos planos de rxjs en respuestas formateadas
 * - Devolver respuestas consistentes al cliente con código y mensaje correcto
 * - Mapear códigos de error HTTP a mensajes descriptivos
 */
@Catch(HttpException)
export class HttpErrorFilter implements ExceptionFilter {
  private readonly errorMessages: Record<number, string> = {
    400: 'Solicitud inválida',
    401: 'No autorizado',
    403: 'Acceso prohibido',
    404: 'Recurso no encontrado',
    409: 'Conflicto',
    422: 'Entidad no procesable',
    500: 'Error interno del servidor',
    502: 'Puerta de enlace incorrecta',
    503: 'Servicio no disponible',
  };

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    const errorData = this.formatError(
      exception,
      exceptionResponse,
      status,
      request.url,
    );

    response.status(status).json(errorData);
  }

  /**
   * Formatea la excepción al formato estándar de respuesta
   */
  private formatError(
    exception: HttpException,
    exceptionResponse: any,
    status: number,
    path: string,
  ): IHttpErrorResponse {
    let message = this.errorMessages[status] || exception.message;
    let error = this.getErrorType(status);
    let details: Record<string, any> | undefined;

    // Si la respuesta es un objeto plano (ej: de rxjs)
    if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
      message = exceptionResponse.message || message;
      error = exceptionResponse.error || error;
      
      // Si hay validación errors, incluirlos en details
      if (Array.isArray(exceptionResponse.message)) {
        details = {
          validationErrors: exceptionResponse.message,
        };
        message = 'Error de validación';
      }
      
      // Si hay un objeto de detalles, incluirlo
      if (exceptionResponse.details) {
        details = {
          ...details,
          ...exceptionResponse.details,
        };
      }
    }

    return {
      success: false,
      status,
      message,
      error,
      ...(details && { details }),
      timestamp: new Date().toISOString(),
      path,
    };
  }

  /**
   * Mapea el código HTTP al tipo de error
   */
  private getErrorType(status: number): string {
    const errorTypeMap: Record<number, string> = {
      400: 'BAD_REQUEST',
      401: 'UNAUTHORIZED',
      403: 'FORBIDDEN',
      404: 'NOT_FOUND',
      409: 'CONFLICT',
      422: 'UNPROCESSABLE_ENTITY',
      500: 'INTERNAL_SERVER_ERROR',
      502: 'BAD_GATEWAY',
      503: 'SERVICE_UNAVAILABLE',
    };

    return errorTypeMap[status] || 'INTERNAL_SERVER_ERROR';
  }
}
