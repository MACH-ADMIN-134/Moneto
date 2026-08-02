import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware.js';
import { sendSuccess } from '../../common/response.js';
import { prisma } from '../../config/database.config.js';
import { NotFoundError } from '../../common/errors.js';

const router = Router();

// GET /api/v1/transactions - List transactions with filters and pagination
router.get('/', authenticate, async (req, res, next) => {
  try {
    const userId = (req as any).user.id;
    const { type, categoryId, accountId, search, page = '1', limit = '50' } = req.query;

    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = parseInt(limit as string, 10) || 50;
    const skip = (pageNum - 1) * limitNum;

    const where: any = { userId, deletedAt: null };

    if (type) where.type = type;
    if (categoryId) where.categoryId = categoryId;
    if (accountId) where.accountId = accountId;
    if (search) {
      where.description = { contains: search as string, mode: 'insensitive' };
    }

    const [items, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        include: {
          category: { select: { id: true, name: true, color: true, icon: true, type: true } },
          account: { select: { id: true, name: true, type: true } },
        },
        orderBy: { transactionDate: 'desc' },
        skip,
        take: limitNum,
      }),
      prisma.transaction.count({ where }),
    ]);

    sendSuccess(res, {
      items,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    }, 'Transactions listed successfully');
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/transactions - Create new transaction
router.post('/', authenticate, async (req, res, next) => {
  try {
    const userId = (req as any).user.id;
    const { amount, currency = 'USD', type, categoryId, accountId, description, transactionDate } = req.body;

    const category = await prisma.category.findUnique({ where: { id: categoryId } });
    if (!category) {
      throw new NotFoundError('Category not found');
    }

    const transaction = await prisma.transaction.create({
      data: {
        userId,
        accountId: accountId || null,
        categoryId,
        amount: Number(amount),
        currency,
        type: type || category.type || 'expense',
        description,
        transactionDate: transactionDate ? new Date(transactionDate) : new Date(),
      },
      include: {
        category: { select: { id: true, name: true, color: true, icon: true } },
        account: { select: { id: true, name: true } },
      },
    });

    // Update account balance if linked
    if (accountId) {
      const numAmount = Number(amount);
      const balanceChange = (type || category.type) === 'income' ? numAmount : -numAmount;
      await prisma.account.update({
        where: { id: accountId },
        data: { balance: { increment: balanceChange } },
      });
    }

    sendSuccess(res, transaction, 'Transaction logged successfully', 201);
  } catch (err) {
    next(err);
  }
});

// PUT /api/v1/transactions/:id - Update transaction
router.put('/:id', authenticate, async (req, res, next) => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;
    const { amount, currency, type, categoryId, accountId, description, transactionDate } = req.body;

    const existing = await prisma.transaction.findFirst({
      where: { id, userId, deletedAt: null },
    });

    if (!existing) {
      throw new NotFoundError('Transaction not found');
    }

    // Reverse previous account balance adjustment if account was linked
    if (existing.accountId) {
      const oldAmount = Number(existing.amount);
      const reverseChange = existing.type === 'income' ? -oldAmount : oldAmount;
      await prisma.account.update({
        where: { id: existing.accountId },
        data: { balance: { increment: reverseChange } },
      });
    }

    const updated = await prisma.transaction.update({
      where: { id },
      data: {
        amount: amount !== undefined ? Number(amount) : existing.amount,
        currency: currency !== undefined ? currency : existing.currency,
        type: type !== undefined ? type : existing.type,
        categoryId: categoryId !== undefined ? categoryId : existing.categoryId,
        accountId: accountId !== undefined ? accountId : existing.accountId,
        description: description !== undefined ? description : existing.description,
        transactionDate: transactionDate ? new Date(transactionDate) : existing.transactionDate,
      },
      include: {
        category: { select: { id: true, name: true, color: true, icon: true } },
        account: { select: { id: true, name: true } },
      },
    });

    // Apply new account balance adjustment if account is linked
    if (updated.accountId) {
      const newAmount = Number(updated.amount);
      const newBalanceChange = updated.type === 'income' ? newAmount : -newAmount;
      await prisma.account.update({
        where: { id: updated.accountId },
        data: { balance: { increment: newBalanceChange } },
      });
    }

    sendSuccess(res, updated, 'Transaction updated successfully');
  } catch (err) {
    next(err);
  }
});

// DELETE /api/v1/transactions/:id - Delete transaction
router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;

    const tx = await prisma.transaction.findFirst({
      where: { id, userId, deletedAt: null },
    });

    if (!tx) {
      throw new NotFoundError('Transaction not found');
    }

    await prisma.transaction.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    // Reverse balance adjustment if linked to account
    if (tx.accountId) {
      const numAmount = Number(tx.amount);
      const reverseChange = tx.type === 'income' ? -numAmount : numAmount;
      await prisma.account.update({
        where: { id: tx.accountId },
        data: { balance: { increment: reverseChange } },
      });
    }

    sendSuccess(res, null, 'Transaction deleted successfully');
  } catch (err) {
    next(err);
  }
});

export default router;
