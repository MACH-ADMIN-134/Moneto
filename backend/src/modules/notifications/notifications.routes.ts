import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware.js';
import { sendSuccess } from '../../common/response.js';

const router = Router();

router.get('/', authenticate, (_req, res, _next) => {
  sendSuccess(res, [
    {
      id: 'notif-1',
      title: 'Welcome to Moneto',
      message: 'Your security-first finance platform is ready.',
      type: 'info',
      isRead: false,
      createdAt: new Date().toISOString(),
    },
  ], 'Notifications listed');
});

export default router;
