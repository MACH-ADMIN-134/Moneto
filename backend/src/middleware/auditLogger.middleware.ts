import { Response, NextFunction } from 'express';
import { CorrelatedRequest } from './requestId.middleware.js';
import { logger } from '../common/logger.js';

export function auditLogger(req: CorrelatedRequest, res: Response, next: NextFunction): void {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const isMutating = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method);

    if (isMutating) {
      logger.info('Audit Log Event', {
        requestId: req.id,
        correlationId: req.correlationId,
        method: req.method,
        path: req.originalUrl,
        statusCode: res.statusCode,
        ip: req.ip,
        userAgent: req.get('user-agent'),
        durationMs: duration,
      });
    }
  });

  next();
}
