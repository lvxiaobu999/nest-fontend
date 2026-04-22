import { ArgumentsHost, Catch, ExceptionFilter, HttpException, Logger } from '@nestjs/common';
import { Request, Response } from 'express';
import { getRequestId, getTraceId } from '../context/request-context';
import { BusinessException } from '../exceptions/business.exception';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('Exception');

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const requestId = getRequestId();
    const traceId = getTraceId();
    const method = request.method;
    const url = request.url;

    let status = 500;
    let message = 'Internal server error';
    let stack: string | undefined;
    let details: unknown;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const responseBody = exceptionResponse as {
          message?: string | string[];
          error?: string;
          errors?: unknown;
          details?: unknown;
        };

        if (typeof responseBody.message === 'string') {
          message = responseBody.message;
        } else if (Array.isArray(responseBody.message) && responseBody.message.length > 0) {
          message = responseBody.message.join('; ');
          details = responseBody.message;
        } else if (typeof responseBody.error === 'string') {
          message = responseBody.error;
        } else {
          message = exception.message;
        }

        if (responseBody.errors !== undefined) {
          details = responseBody.errors;
        } else if (responseBody.details !== undefined) {
          details = responseBody.details;
        }
      } else {
        message = exception.message;
      }

      stack = exception.stack;

      if (exception instanceof BusinessException) {
        response.status(status).json({
          success: false,
          code: exception.getBusinessCode(),
          message,
          data: null,
          error: {
            statusCode: status,
            path: url,
            details,
          },
          meta: {
            requestId,
            traceId,
            timestamp: new Date().toISOString(),
          },
        });
        return;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
      stack = exception.stack;
    }

    // ⭐ 关键：带 requestId + stack
    this.logger.error(`${method} ${url} ${status} - ${message}`, stack, requestId);

    response.status(status).json({
      success: false,
      code: status,
      message,
      error: {
        statusCode: status,
        path: url,
        details,
      },
      meta: {
        requestId,
        traceId,
        timestamp: new Date().toISOString(),
      },
    });
  }
}
