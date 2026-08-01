import rateLimit from 'express-rate-limit';
import { RATE_LIMIT_CONFIG, AUTH_RATE_LIMIT_CONFIG } from '../config/security.config.js';

export const globalRateLimiter = rateLimit({
  ...RATE_LIMIT_CONFIG,
  message: {
    success: false,
    statusCode: 429,
    error: 'Too Many Requests',
    message: 'Global rate limit exceeded. Please slow down requests.',
  },
});

export const authRateLimiter = rateLimit(AUTH_RATE_LIMIT_CONFIG);
