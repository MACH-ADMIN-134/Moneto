import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

export interface CorrelatedRequest extends Request {
  id?: string;
  correlationId?: string;
}

export function requestId(req: CorrelatedRequest, res: Response, next: NextFunction): void {
  const existingRequestId = req.headers['x-request-id'] as string;
  const existingCorrelationId = req.headers['x-correlation-id'] as string;

  const generatedId = crypto.randomUUID();

  req.id = existingRequestId || generatedId;
  req.correlationId = existingCorrelationId || req.id;

  res.setHeader('X-Request-ID', req.id);
  res.setHeader('X-Correlation-ID', req.correlationId);

  next();
}
