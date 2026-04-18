import { ExceptionFilter, Catch, ArgumentsHost, HttpException, Logger } from '@nestjs/common';
import { Request, Response } from 'express';
import { getRequestId, getTraceId } from '../context/request-context';

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

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      message = exception.message;
      stack = exception.stack;
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
      },
      meta: {
        requestId,
        traceId,
        timestamp: new Date().toISOString(),
      },
    });
  }
}
