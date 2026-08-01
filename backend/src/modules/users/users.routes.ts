import { Router } from 'express';
import { authenticate, AuthenticatedRequest } from '../../middleware/auth.middleware.js';
import { sendSuccess } from '../../common/response.js';

const router = Router();

router.get('/me', authenticate, (req: AuthenticatedRequest, res, _next) => {
  sendSuccess(res, {
    id: req.user?.id,
    email: req.user?.email,
    fullName: 'Moneto Demo User',
    role: req.user?.role || 'user',
    status: 'active',
  }, 'User profile retrieved');
});

router.put('/me', authenticate, (req: AuthenticatedRequest, res, _next) => {
  const { fullName } = req.body;
  sendSuccess(res, {
    id: req.user?.id,
    email: req.user?.email,
    fullName: fullName || 'Moneto Demo User',
    role: req.user?.role || 'user',
  }, 'User profile updated');
});

export default router;
