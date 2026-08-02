import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware.js';
import { sendSuccess } from '../../common/response.js';
import { prisma } from '../../config/database.config.js';
import { NotFoundError } from '../../common/errors.js';

const router = Router();

// GET /api/v1/goals - List savings goals with progress
router.get('/', authenticate, async (req, res, next) => {
  try {
    const userId = (req as any).user.id;
    const goals = await prisma.goal.findMany({
      where: { userId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });

    const items = goals.map((g) => {
      const target = Number(g.targetAmount);
      const current = Number(g.currentAmount);
      const remaining = Math.max(0, target - current);
      const percentage = target > 0 ? Math.min(Math.round((current / target) * 100), 100) : 0;
      const isCompleted = current >= target;

      return {
        ...g,
        remaining,
        percentage,
        isCompleted,
      };
    });

    sendSuccess(res, items, 'Goals listed successfully');
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/goals - Create new goal
router.post('/', authenticate, async (req, res, next) => {
  try {
    const userId = (req as any).user.id;
    const { title, targetAmount, currentAmount, targetDate, category } = req.body;

    const goal = await prisma.goal.create({
      data: {
        userId,
        title,
        targetAmount: Number(targetAmount),
        currentAmount: currentAmount ? Number(currentAmount) : 0,
        targetDate: targetDate ? new Date(targetDate) : null,
        category: category || 'General',
        status: 'in_progress',
      },
    });

    sendSuccess(res, goal, 'Goal created successfully', 201);
  } catch (err) {
    next(err);
  }
});

// PUT /api/v1/goals/:id - Update goal details
router.put('/:id', authenticate, async (req, res, next) => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;
    const { title, targetAmount, currentAmount, targetDate, category, status } = req.body;

    const existing = await prisma.goal.findFirst({
      where: { id, userId, deletedAt: null },
    });

    if (!existing) {
      throw new NotFoundError('Goal not found');
    }

    const newTarget = targetAmount !== undefined ? Number(targetAmount) : Number(existing.targetAmount);
    const newCurrent = currentAmount !== undefined ? Number(currentAmount) : Number(existing.currentAmount);
    const computedStatus = status !== undefined ? status : (newCurrent >= newTarget ? 'completed' : 'in_progress');

    const updated = await prisma.goal.update({
      where: { id },
      data: {
        title: title !== undefined ? title : existing.title,
        targetAmount: newTarget,
        currentAmount: newCurrent,
        targetDate: targetDate ? new Date(targetDate) : existing.targetDate,
        category: category !== undefined ? category : existing.category,
        status: computedStatus,
      },
    });

    sendSuccess(res, updated, 'Goal updated successfully');
  } catch (err) {
    next(err);
  }
});

// PATCH /api/v1/goals/:id/contribute - Contribute funds to goal
router.patch('/:id/contribute', authenticate, async (req, res, next) => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;
    const { amount } = req.body;

    const goal = await prisma.goal.findFirst({
      where: { id, userId, deletedAt: null },
    });

    if (!goal) {
      throw new NotFoundError('Goal not found');
    }

    const newCurrent = Number(goal.currentAmount) + Number(amount);
    const target = Number(goal.targetAmount);
    const status = newCurrent >= target ? 'completed' : 'in_progress';

    const updated = await prisma.goal.update({
      where: { id },
      data: {
        currentAmount: newCurrent,
        status,
      },
    });

    sendSuccess(res, updated, 'Contribution added to goal');
  } catch (err) {
    next(err);
  }
});

// DELETE /api/v1/goals/:id - Delete goal
router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;

    const goal = await prisma.goal.findFirst({
      where: { id, userId, deletedAt: null },
    });

    if (!goal) {
      throw new NotFoundError('Goal not found');
    }

    await prisma.goal.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    sendSuccess(res, null, 'Goal deleted successfully');
  } catch (err) {
    next(err);
  }
});

export default router;
