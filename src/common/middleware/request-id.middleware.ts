import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

export interface RequestWithId extends Request {
  requestId?: string;
  client?: any;
}

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(req: RequestWithId, res: Response, next: NextFunction): void {
    const incomingId =
      (req.headers['x-request-id'] as string) ||
      (req.headers['X-REQUEST-ID'] as string);

    const requestId = incomingId || `CKYC-${uuidv4()}`;

    req.requestId = requestId;
    res.setHeader('X-REQUEST-ID', requestId);

    next();
  }
}
