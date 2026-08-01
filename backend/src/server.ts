import app from './app.js';
import { env } from './config/env.config.js';
import { logger } from './common/logger.js';

const server = app.listen(env.PORT, () => {
  logger.info(`🛡 Moneto Backend API listening on port ${env.PORT} [${env.NODE_ENV.toUpperCase()}]`);
  logger.info(`👉 Base API Endpoint: http://localhost:${env.PORT}${env.API_PREFIX}`);
});

const gracefulShutdown = (signal: string) => {
  logger.info(`Received ${signal}. Initiating graceful shutdown...`);
  server.close(() => {
    logger.info('HTTP server closed. Exiting process.');
    process.exit(0);
  });

  setTimeout(() => {
    logger.error('Forced shutdown due to timeout.');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
