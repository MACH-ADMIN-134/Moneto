import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware.js';
import { sendSuccess } from '../../common/response.js';
import { prisma } from '../../config/database.config.js';

const router = Router();

// GET /api/v1/categories - List system and user categories
router.get('/', authenticate, async (req, res, next) => {
  try {
    const userId = (req as any).user.id;
    const categories = await prisma.category.findMany({
      where: {
        OR: [
          { isSystem: true },
          { userId },
        ],
        deletedAt: null,
      },
      orderBy: { name: 'asc' },
    });

    sendSuccess(res, categories, 'Categories listed successfully');
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/categories - Create custom category
router.post('/', authenticate, async (req, res, next) => {
  try {
    const userId = (req as any).user.id;
    const { name, type, icon, color } = req.body;

    const category = await prisma.category.create({
      data: {
        userId,
        name,
        type: type || 'expense',
        icon: icon || 'folder',
        color: color || '#10B981',
        isSystem: false,
      },
    });

    sendSuccess(res, category, 'Category created successfully', 201);
  } catch (err) {
    next(err);
  }
});

export default router;
