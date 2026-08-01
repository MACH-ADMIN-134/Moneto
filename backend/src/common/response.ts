import { Response } from 'express';

export interface ApiResponse<T = unknown> {
  success: boolean;
  statusCode: number;
  message: string;
  data?: T;
  meta?: {
    timestamp: string;
    requestId?: string;
    [key: string]: unknown;
  };
}

export function sendSuccess<T>(
  res: Response,
  data: T,
  message = 'Operation successful',
  statusCode = 200,
  meta?: Record<string, unknown>
): Response {
  const requestId = res.getHeader('X-Request-ID') as string | undefined;

  const payload: ApiResponse<T> = {
    success: true,
    statusCode,
    message,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      ...(requestId ? { requestId } : {}),
      ...meta,
    },
  };
  return res.status(statusCode).json(payload);
}
