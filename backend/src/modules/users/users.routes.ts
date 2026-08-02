import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth.middleware.js';
import { sendSuccess } from '../../common/response.js';
import { prisma } from '../../config/database.config.js';
import { NotFoundError } from '../../common/errors.js';

const router = Router();

// GET /api/v1/users - List users (Admin only)
router.get('/', authenticate, authorize(['admin']), async (_req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        status: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    sendSuccess(res, users, 'Users list retrieved');
  } catch (err) {
    next(err);
  }
});

// PATCH /api/v1/users/:id/role - Update user role (Admin only)
router.patch('/:id/role', authenticate, authorize(['admin']), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { role },
      select: { id: true, email: true, role: true, status: true },
    });

    sendSuccess(res, updated, 'User role updated successfully');
  } catch (err) {
    next(err);
  }
});

export default router;
