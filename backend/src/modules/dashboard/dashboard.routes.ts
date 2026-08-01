import { Router } from 'express';
import { authenticate, AuthenticatedRequest } from '../../middleware/auth.middleware.js';
import { sendSuccess } from '../../common/response.js';

const router = Router();

router.get('/summary', authenticate, (_req: AuthenticatedRequest, res, _next) => {
  sendSuccess(res, {
    netWorth: 15420.50,
    monthlyIncome: 4500.00,
    monthlyExpenses: 2150.25,
    activePayablesCount: 3,
    activeLendCount: 2,
    currency: 'USD',
  }, 'Dashboard summary retrieved');
});

export default router;
