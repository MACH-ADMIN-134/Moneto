import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware.js';
import { sendSuccess } from '../../common/response.js';

const router = Router();

router.get('/', authenticate, (_req, res, _next) => {
  sendSuccess(res, [
    {
      id: 'pay-1',
      title: 'Electricity Utility Bill',
      billerName: 'City Power Corp',
      amount: 145.50,
      currency: 'USD',
      dueDate: new Date(Date.now() + 864000000).toISOString(),
      frequency: 'monthly',
      status: 'pending',
    },
  ], 'Payables listed');
});

export default router;
