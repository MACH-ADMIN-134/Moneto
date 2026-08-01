import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware.js';
import { sendSuccess } from '../../common/response.js';

const router = Router();

router.get('/', authenticate, (_req, res, _next) => {
  sendSuccess(res, {
    items: [
      {
        id: 'tx-1',
        amount: 3500.00,
        currency: 'USD',
        type: 'income',
        categoryName: 'Salary & Income',
        description: 'Monthly Salary Deposit',
        date: new Date().toISOString(),
      },
      {
        id: 'tx-2',
        amount: 1200.00,
        currency: 'USD',
        type: 'expense',
        categoryName: 'Housing & Rent',
        description: 'Apartment Rent',
        date: new Date().toISOString(),
      },
    ],
    pagination: { page: 1, limit: 20, total: 2 },
  }, 'Transactions listed');
});

router.post('/', authenticate, (req, res, _next) => {
  const { amount, type, categoryId, description } = req.body;
  sendSuccess(res, {
    id: `tx-${Date.now()}`,
    amount,
    currency: 'USD',
    type,
    categoryId,
    description,
    date: new Date().toISOString(),
  }, 'Transaction logged successfully', 201);
});

export default router;
