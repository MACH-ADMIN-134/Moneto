import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware.js';
import { sendSuccess } from '../../common/response.js';
import { prisma } from '../../config/database.config.js';
import { NotFoundError } from '../../common/errors.js';

const router = Router();

// GET /api/v1/budgets - List budgets with spent calculation
router.get('/', authenticate, async (req, res, next) => {
  try {
    const userId = (req as any).user.id;
    const budgets = await prisma.budget.findMany({
      where: { userId, deletedAt: null },
      include: {
        category: { select: { id: true, name: true, color: true, icon: true } },
      },
    });

    // Calculate actual spent per category for current month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        type: 'expense',
        deletedAt: null,
        transactionDate: { gte: startOfMonth },
      },
    });

    const spentMap: Record<string, number> = {};
    for (const tx of transactions) {
      spentMap[tx.categoryId] = (spentMap[tx.categoryId] || 0) + Number(tx.amount);
    }

    const budgetsWithSpent = budgets.map((b) => {
      const spent = spentMap[b.categoryId] || 0;
      const limit = Number(b.amount);
      const remaining = limit - spent;
      const percentage = limit > 0 ? Math.min(Math.round((spent / limit) * 100), 100) : 0;
      return {
        ...b,
        spent,
        remaining,
        percentage,
        isOver: spent > limit,
      };
    });

    sendSuccess(res, budgetsWithSpent, 'Budgets listed successfully');
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/budgets - Create budget allocation
router.post('/', authenticate, async (req, res, next) => {
  try {
    const userId = (req as any).user.id;
    const { categoryId, amount, period = 'monthly' } = req.body;

    const category = await prisma.category.findUnique({ where: { id: categoryId } });
    if (!category) {
      throw new NotFoundError('Category not found');
    }

    const budget = await prisma.budget.create({
      data: {
        userId,
        categoryId,
        amount: Number(amount),
        period,
        startDate: new Date(),
      },
      include: {
        category: { select: { id: true, name: true, color: true, icon: true } },
      },
    });

    sendSuccess(res, budget, 'Budget created successfully', 201);
  } catch (err) {
    next(err);
  }
});

// PUT /api/v1/budgets/:id - Update budget limit
router.put('/:id', authenticate, async (req, res, next) => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;
    const { categoryId, amount, period } = req.body;

    const existing = await prisma.budget.findFirst({
      where: { id, userId, deletedAt: null },
    });

    if (!existing) {
      throw new NotFoundError('Budget not found');
    }

    const updated = await prisma.budget.update({
      where: { id },
      data: {
        categoryId: categoryId !== undefined ? categoryId : existing.categoryId,
        amount: amount !== undefined ? Number(amount) : existing.amount,
        period: period !== undefined ? period : existing.period,
      },
      include: {
        category: { select: { id: true, name: true, color: true, icon: true } },
      },
    });

    sendSuccess(res, updated, 'Budget updated successfully');
  } catch (err) {
    next(err);
  }
});

// DELETE /api/v1/budgets/:id - Delete budget
router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;

    const existing = await prisma.budget.findFirst({
      where: { id, userId, deletedAt: null },
    });

    if (!existing) {
      throw new NotFoundError('Budget not found');
    }

    await prisma.budget.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    sendSuccess(res, null, 'Budget deleted successfully');
  } catch (err) {
    next(err);
  }
});

export default router;
