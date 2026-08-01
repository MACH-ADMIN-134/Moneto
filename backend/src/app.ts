import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';

import { env } from './config/env.config.js';
import { HELMET_CONFIG } from './config/security.config.js';
import { openApiSpec } from './config/swagger.config.js';
import { requestId } from './middleware/requestId.middleware.js';
import { globalRateLimiter } from './middleware/rateLimiter.middleware.js';
import { auditLogger } from './middleware/auditLogger.middleware.js';
import { errorHandler } from './middleware/errorHandler.middleware.js';

// Import Module Routers
import observabilityRoutes from './modules/observability/observability.routes.js';
import featureFlagsRoutes from './modules/feature-flags/featureFlags.routes.js';
import authRoutes from './modules/auth/auth.routes.js';
import usersRoutes from './modules/users/users.routes.js';
import dashboardRoutes from './modules/dashboard/dashboard.routes.js';
import categoriesRoutes from './modules/categories/categories.routes.js';
import transactionsRoutes from './modules/transactions/transactions.routes.js';
import payablesRoutes from './modules/payables/payables.routes.js';
import lendingRoutes from './modules/lending/lending.routes.js';
import settingsRoutes from './modules/settings/settings.routes.js';
import notificationsRoutes from './modules/notifications/notifications.routes.js';

const app = express();

// Security & Request Correlation Middleware
app.use(requestId);
app.use(helmet(HELMET_CONFIG));
app.use(cors({ origin: env.CORS_ORIGIN.split(','), credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(globalRateLimiter);
app.use(auditLogger);

// Mount OpenAPI Swagger UI
app.use(`${env.API_PREFIX}/docs`, swaggerUi.serve, swaggerUi.setup(openApiSpec));

// Mount Observability & Health Routes (/health, /ready, /live)
app.use(env.API_PREFIX, observabilityRoutes);
app.use(`${env.API_PREFIX}/feature-flags`, featureFlagsRoutes);

// Mount Application Module Routes
app.use(`${env.API_PREFIX}/auth`, authRoutes);
app.use(`${env.API_PREFIX}/users`, usersRoutes);
app.use(`${env.API_PREFIX}/dashboard`, dashboardRoutes);
app.use(`${env.API_PREFIX}/categories`, categoriesRoutes);
app.use(`${env.API_PREFIX}/transactions`, transactionsRoutes);
app.use(`${env.API_PREFIX}/payables`, payablesRoutes);
app.use(`${env.API_PREFIX}/lending`, lendingRoutes);
app.use(`${env.API_PREFIX}/settings`, settingsRoutes);
app.use(`${env.API_PREFIX}/notifications`, notificationsRoutes);

// Global 404 Fallback
app.use('*', (_req, res) => {
  res.status(404).json({
    success: false,
    statusCode: 404,
    error: 'NotFound',
    message: 'The requested API endpoint does not exist',
  });
});

// Global Error Boundary
app.use(errorHandler);

export default app;
