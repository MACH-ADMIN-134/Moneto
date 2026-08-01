import { Request, Response, NextFunction } from 'express';
import { AppError } from '../common/errors.js';
import { logger } from '../common/logger.js';
import { env } from '../config/env.config.js';

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): Response {
  if (err instanceof AppError) {
    if (!err.isOperational) {
      logger.error('Non-operational AppError:', err);
    }
    return res.status(err.statusCode).json({
      success: false,
      statusCode: err.statusCode,
      error: err.name,
      message: err.message,
      details: err.details,
      meta: { timestamp: new Date().toISOString() },
    });
  }

  logger.error('Unhandled System Exception:', err);

  return res.status(500).json({
    success: false,
    statusCode: 500,
    error: 'InternalServerError',
    message: env.NODE_ENV === 'production' ? 'An unexpected internal server error occurred' : err.message,
    meta: { timestamp: new Date().toISOString() },
  });
}
