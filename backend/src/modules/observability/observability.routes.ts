import { Router } from 'express';
import { sendSuccess } from '../../common/response.js';
import { prisma } from '../../config/database.config.js';

const router = Router();

// Liveness Probe (verifies HTTP event loop is responsive)
router.get('/live', (_req, res) => {
  sendSuccess(res, {
    status: 'alive',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  }, 'Service process is live');
});

// Readiness Probe (verifies database connectivity)
router.get('/ready', async (_req, res, _next) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    sendSuccess(res, {
      status: 'ready',
      database: 'connected',
      timestamp: new Date().toISOString(),
    }, 'Service and database are ready');
  } catch (err) {
    res.status(503).json({
      success: false,
      statusCode: 503,
      error: 'ServiceUnavailable',
      message: 'Database readiness probe failed',
      details: err instanceof Error ? err.message : String(err),
    });
  }
});

// Overall Health Status
router.get('/health', (_req, res) => {
  sendSuccess(res, {
    status: 'healthy',
    uptime: process.uptime(),
    version: '0.1.1-alpha',
    environment: process.env.NODE_ENV || 'development',
  }, 'Moneto API service operational');
});

export default router;
