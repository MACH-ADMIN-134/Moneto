export const ARGON2_CONFIG = {
  type: 2, // Argon2id
  memoryCost: 65536, // 64 MB
  timeCost: 3, // 3 iterations
  parallelism: 4, // 4 threads
} as const;

export const RATE_LIMIT_CONFIG = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
} as const;

export const AUTH_RATE_LIMIT_CONFIG = {
  windowMs: 60 * 1000, // 1 minute
  max: 5, // 5 login/register attempts per minute
  message: {
    success: false,
    statusCode: 429,
    error: 'Too Many Requests',
    message: 'Too many authentication attempts. Please try again after 60 seconds.',
  },
} as const;
