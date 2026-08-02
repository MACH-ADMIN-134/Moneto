import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware.js';
import { sendSuccess } from '../../common/response.js';
import { prisma } from '../../config/database.config.js';

const router = Router();

// GET /api/v1/settings - Get user settings
router.get('/', authenticate, async (req, res, next) => {
  try {
    const userId = (req as any).user.id;
    let settings = await prisma.userSetting.findUnique({
      where: { userId },
    });

    if (!settings) {
      settings = await prisma.userSetting.create({
        data: {
          userId,
          theme: 'system',
          defaultCurrency: 'USD',
          emailNotifications: true,
          pushNotifications: true,
          twoFactorEnabled: false,
        },
      });
    }

    sendSuccess(res, settings, 'Settings retrieved successfully');
  } catch (err) {
    next(err);
  }
});

// PUT /api/v1/settings - Update user settings
router.put('/', authenticate, async (req, res, next) => {
  try {
    const userId = (req as any).user.id;
    const { theme, defaultCurrency, emailNotifications, pushNotifications, twoFactorEnabled } = req.body;

    const settings = await prisma.userSetting.upsert({
      where: { userId },
      update: {
        theme: theme !== undefined ? theme : undefined,
        defaultCurrency: defaultCurrency !== undefined ? defaultCurrency : undefined,
        emailNotifications: emailNotifications !== undefined ? emailNotifications : undefined,
        pushNotifications: pushNotifications !== undefined ? pushNotifications : undefined,
        twoFactorEnabled: twoFactorEnabled !== undefined ? twoFactorEnabled : undefined,
      },
      create: {
        userId,
        theme: theme || 'system',
        defaultCurrency: defaultCurrency || 'USD',
        emailNotifications: emailNotifications !== undefined ? emailNotifications : true,
        pushNotifications: pushNotifications !== undefined ? pushNotifications : true,
        twoFactorEnabled: twoFactorEnabled !== undefined ? twoFactorEnabled : false,
      },
    });

    sendSuccess(res, settings, 'Settings updated successfully');
  } catch (err) {
    next(err);
  }
});

export default router;
