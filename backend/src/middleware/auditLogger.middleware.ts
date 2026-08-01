import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth.middleware.js';
import { logger } from '../common/logger.js';

export function auditLogger(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const isMutating = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method);

    if (isMutating) {
      logger.info('Audit Log Event', {
        userId: req.user?.id || 'anonymous',
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
