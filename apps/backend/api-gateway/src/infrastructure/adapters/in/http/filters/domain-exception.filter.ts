import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';
import { BaseDomainError } from '@financial-system/shared-errors';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (exception instanceof BaseDomainError) {
      return response.status(exception.statusCode).json({
        success: false,
        error: {
          code: exception.code,
          translationKey: exception.translationKey,
          params: exception.params ?? null,
          message: exception.message,
          details: exception.details ?? null,
        },
        timestamp: new Date().toISOString(),
      });
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const res = exception.getResponse();
      const message = typeof res === 'string' ? res : (res as any).message || exception.message;

      return response.status(status).json({
        success: false,
        error: {
          code: `HTTP.${status}`,
          translationKey: 'errors.http.generic',
          params: null,
          message,
          details: null,
        },
        timestamp: new Date().toISOString(),
      });
    }

    console.error('[Unhandled Gateway Exception]', exception);
    return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        code: 'SYSTEM.INTERNAL_ERROR',
        translationKey: 'errors.system.internal_error',
        params: null,
        message: 'Ocorreu um erro interno inesperado no servidor',
        details: null,
      },
      timestamp: new Date().toISOString(),
    });
  }
}