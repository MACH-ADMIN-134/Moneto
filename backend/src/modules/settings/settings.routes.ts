import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware.js';
import { sendSuccess } from '../../common/response.js';

const router = Router();

router.get('/', authenticate, (_req, res, _next) => {
  sendSuccess(res, {
    theme: 'system',
    defaultCurrency: 'USD',
    emailNotifications: true,
    pushNotifications: true,
    twoFactorEnabled: false,
  }, 'Settings retrieved');
});

router.put('/', authenticate, (req, res, _next) => {
  const { theme, defaultCurrency, emailNotifications, pushNotifications } = req.body;
  sendSuccess(res, {
    theme: theme || 'system',
    defaultCurrency: defaultCurrency || 'USD',
    emailNotifications: emailNotifications ?? true,
    pushNotifications: pushNotifications ?? true,
    twoFactorEnabled: false,
  }, 'Settings updated');
});

export default router;
