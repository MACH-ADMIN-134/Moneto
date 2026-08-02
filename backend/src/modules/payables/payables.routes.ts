import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware.js';
import { sendSuccess } from '../../common/response.js';
import { prisma } from '../../config/database.config.js';
import { NotFoundError } from '../../common/errors.js';

const router = Router();

// GET /api/v1/payables - List bills and payables
router.get('/', authenticate, async (req, res, next) => {
  try {
    const userId = (req as any).user.id;
    const payables = await prisma.payable.findMany({
      where: { userId, deletedAt: null },
      orderBy: { dueDate: 'asc' },
    });

    const pendingTotal = payables
      .filter((p) => p.status === 'pending' || p.status === 'overdue')
      .reduce((sum, p) => sum + Number(p.amount), 0);

    sendSuccess(res, { payables, pendingTotal }, 'Payables listed successfully');
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/payables - Create bill
router.post('/', authenticate, async (req, res, next) => {
  try {
    const userId = (req as any).user.id;
    const { title, billerName, amount, currency, dueDate, frequency } = req.body;

    const payable = await prisma.payable.create({
      data: {
        userId,
        title,
        billerName,
        amount: Number(amount),
        currency: currency || 'USD',
        dueDate: new Date(dueDate),
        frequency: frequency || 'monthly',
        status: 'pending',
      },
    });

    sendSuccess(res, payable, 'Payable bill created successfully', 201);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/v1/payables/:id/pay - Mark payable bill as paid
router.patch('/:id/pay', authenticate, async (req, res, next) => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;

    const payable = await prisma.payable.findFirst({
      where: { id, userId, deletedAt: null },
    });

    if (!payable) {
      throw new NotFoundError('Payable bill not found');
    }

    const updated = await prisma.payable.update({
      where: { id },
      data: { status: 'paid' },
    });

    sendSuccess(res, updated, 'Payable bill marked as paid');
  } catch (err) {
    next(err);
  }
});

// DELETE /api/v1/payables/:id - Delete payable bill
router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;

    const payable = await prisma.payable.findFirst({
      where: { id, userId, deletedAt: null },
    });

    if (!payable) {
      throw new NotFoundError('Payable bill not found');
    }

    await prisma.payable.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    sendSuccess(res, null, 'Payable deleted successfully');
  } catch (err) {
    next(err);
  }
});

export default router;
