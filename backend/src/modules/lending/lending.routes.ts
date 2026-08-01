import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware.js';
import { sendSuccess } from '../../common/response.js';

const router = Router();

router.get('/', authenticate, (_req, res, _next) => {
  sendSuccess(res, [
    {
      id: 'lend-1',
      counterpartyName: 'Alex Smith',
      type: 'lent',
      principalAmount: 500.00,
      interestRate: 0.00,
      currency: 'USD',
      status: 'active',
    },
  ], 'Lend requests listed');
});

export default router;
