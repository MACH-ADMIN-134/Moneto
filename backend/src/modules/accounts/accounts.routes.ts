import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware.js';
import { sendSuccess } from '../../common/response.js';
import { prisma } from '../../config/database.config.js';
import { NotFoundError } from '../../common/errors.js';

const router = Router();

// GET /api/v1/accounts - List user accounts
router.get('/', authenticate, async (req, res, next) => {
  try {
    const userId = (req as any).user.id;
    const accounts = await prisma.account.findMany({
      where: { userId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });

    const netBalance = accounts.reduce((acc, curr) => acc + Number(curr.balance), 0);

    sendSuccess(res, { accounts, netBalance }, 'Accounts fetched successfully');
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/accounts - Create new account
router.post('/', authenticate, async (req, res, next) => {
  try {
    const userId = (req as any).user.id;
    const { name, type, balance, currency, institution, accountNumber } = req.body;

    const account = await prisma.account.create({
      data: {
        userId,
        name,
        type: type || 'checking',
        balance: balance ? Number(balance) : 0,
        currency: currency || 'USD',
        institution,
        accountNumber,
      },
    });

    sendSuccess(res, account, 'Account created successfully', 201);
  } catch (err) {
    next(err);
  }
});

// PUT /api/v1/accounts/:id - Update account
router.put('/:id', authenticate, async (req, res, next) => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;
    const { name, type, balance, currency, institution, accountNumber } = req.body;

    const existing = await prisma.account.findFirst({
      where: { id, userId, deletedAt: null },
    });

    if (!existing) {
      throw new NotFoundError('Account not found');
    }

    const updated = await prisma.account.update({
      where: { id },
      data: {
        name: name !== undefined ? name : existing.name,
        type: type !== undefined ? type : existing.type,
        balance: balance !== undefined ? Number(balance) : existing.balance,
        currency: currency !== undefined ? currency : existing.currency,
        institution: institution !== undefined ? institution : existing.institution,
        accountNumber: accountNumber !== undefined ? accountNumber : existing.accountNumber,
      },
    });

    sendSuccess(res, updated, 'Account updated successfully');
  } catch (err) {
    next(err);
  }
});

// DELETE /api/v1/accounts/:id - Soft delete account
router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;

    const existing = await prisma.account.findFirst({
      where: { id, userId, deletedAt: null },
    });

    if (!existing) {
      throw new NotFoundError('Account not found');
    }

    await prisma.account.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    sendSuccess(res, null, 'Account deleted successfully');
  } catch (err) {
    next(err);
  }
});

export default router;
