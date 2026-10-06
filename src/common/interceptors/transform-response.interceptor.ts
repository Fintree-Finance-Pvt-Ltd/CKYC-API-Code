import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiSuccessResponse } from '../interfaces/api-response.interface';
import { RequestWithId } from '../middleware/request-id.middleware';

@Injectable()
export class TransformResponseInterceptor<T> implements NestInterceptor<
  T,
  ApiSuccessResponse<T>
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiSuccessResponse<T>> {
    const request = context.switchToHttp().getRequest<RequestWithId>();
    const requestId =
      request.requestId || (request.headers?.['x-request-id'] as string) || '';

    return next.handle().pipe(
      map((data) => {
        if (
          data &&
          typeof data === 'object' &&
          'success' in data &&
          'requestId' in data &&
          'error' in data
        ) {
          return data;
        }

        return {
          success: true,
          requestId,
          data,
          error: null,
        };
      }),
    );
  }
}
