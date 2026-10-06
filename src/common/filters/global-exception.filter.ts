import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { RequestWithId } from '../middleware/request-id.middleware';
import { ApiErrorResponse } from '../interfaces/api-response.interface';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<RequestWithId>();

    const requestId =
      request.requestId || (request.headers?.['x-request-id'] as string) || '';

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let errorCode = 'INTERNAL_SERVER_ERROR';
    let errorMessage = 'An unexpected internal server error occurred';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        errorMessage = exceptionResponse;
        errorCode = this.statusToErrorCode(status);
      } else if (
        typeof exceptionResponse === 'object' &&
        exceptionResponse !== null
      ) {
        const resObj = exceptionResponse as Record<string, unknown>;
        errorCode = (resObj.error as string) || this.statusToErrorCode(status);

        if (Array.isArray(resObj.message)) {
          errorMessage = resObj.message.join('; ');
        } else if (typeof resObj.message === 'string') {
          errorMessage = resObj.message;
        } else {
          errorMessage = exception.message;
        }
      }
    } else if (exception instanceof Error) {
      errorMessage = exception.message;
      errorCode = exception.name || 'ERROR';
    }

    this.logger.error(
      `[${requestId}] ${request.method} ${request.url} - Status: ${status} - Error: ${errorMessage}`,
      exception instanceof Error ? exception.stack : undefined,
    );

    const errorBody: ApiErrorResponse = {
      success: false,
      requestId,
      data: null,
      error: {
        code: errorCode.toUpperCase().replace(/\s+/g, '_'),
        message: errorMessage,
      },
    };

    if (!response.headersSent) {
      response.setHeader('X-REQUEST-ID', requestId);
      response.status(status).json(errorBody);
    }
  }

  private statusToErrorCode(status: number): string {
    switch (status) {
      case HttpStatus.BAD_REQUEST:
        return 'BAD_REQUEST';
      case HttpStatus.UNAUTHORIZED:
        return 'UNAUTHORIZED';
      case HttpStatus.FORBIDDEN:
        return 'FORBIDDEN';
      case HttpStatus.NOT_FOUND:
        return 'NOT_FOUND';
      case HttpStatus.CONFLICT:
        return 'CONFLICT';
      case HttpStatus.UNPROCESSABLE_ENTITY:
        return 'UNPROCESSABLE_ENTITY';
      case HttpStatus.TOO_MANY_REQUESTS:
        return 'TOO_MANY_REQUESTS';
      case HttpStatus.NOT_IMPLEMENTED:
        return 'NOT_IMPLEMENTED';
      default:
        return 'INTERNAL_SERVER_ERROR';
    }
  }
}
