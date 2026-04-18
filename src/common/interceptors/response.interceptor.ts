import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { getRequestId, getTraceId } from '../context/request-context';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data: any) => ({
        success: true,
        code: 0,
        message: 'ok',
        data: data === undefined ? null : data,
        meta: {
          requestId: getRequestId(),
          traceId: getTraceId(),
          timestamp: new Date().toISOString(),
        },
      })),
    );
  }
}
