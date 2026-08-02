import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware.js';
import { sendSuccess } from '../../common/response.js';
import { prisma } from '../../config/database.config.js';
import { NotFoundError } from '../../common/errors.js';

const router = Router();

// GET /api/v1/lending - List peer loans & repayments
router.get('/', authenticate, async (req, res, next) => {
  try {
    const userId = (req as any).user.id;
    const loans = await prisma.lendRequest.findMany({
      where: { userId, deletedAt: null },
      include: {
        transactions: { orderBy: { paymentDate: 'desc' } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const totalLent = loans
      .filter((l) => l.type === 'lent' && l.status !== 'settled')
      .reduce((sum, l) => sum + Number(l.principalAmount), 0);

    const totalBorrowed = loans
      .filter((l) => l.type === 'borrowed' && l.status !== 'settled')
      .reduce((sum, l) => sum + Number(l.principalAmount), 0);

    sendSuccess(res, { loans, summary: { totalLent, totalBorrowed } }, 'Lending records fetched successfully');
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/lending - Create new peer loan
router.post('/', authenticate, async (req, res, next) => {
  try {
    const userId = (req as any).user.id;
    const { counterpartyName, counterpartyContact, type, principalAmount, interestRate, dueDate, notes } = req.body;

    const loan = await prisma.lendRequest.create({
      data: {
        userId,
        counterpartyName,
        counterpartyContact,
        type: type || 'lent',
        principalAmount: Number(principalAmount),
        interestRate: interestRate ? Number(interestRate) : 0.00,
        dueDate: dueDate ? new Date(dueDate) : null,
        notes,
        status: 'active',
      },
    });

    sendSuccess(res, loan, 'Loan record created successfully', 201);
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/lending/:id/repay - Record repayment
router.post('/:id/repay', authenticate, async (req, res, next) => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;
    const { amount, notes } = req.body;

    const loan = await prisma.lendRequest.findFirst({
      where: { id, userId, deletedAt: null },
      include: { transactions: true },
    });

    if (!loan) {
      throw new NotFoundError('Loan record not found');
    }

    const repayTx = await prisma.lendTransaction.create({
      data: {
        lendRequestId: loan.id,
        amount: Number(amount),
        type: 'repayment',
        notes,
      },
    });

    // Check total repaid
    const totalRepaid = loan.transactions.reduce((sum, t) => sum + Number(t.amount), 0) + Number(amount);
    const isFullySettled = totalRepaid >= Number(loan.principalAmount);

    await prisma.lendRequest.update({
      where: { id },
      data: {
        status: isFullySettled ? 'settled' : 'partially_settled',
      },
    });

    sendSuccess(res, repayTx, 'Repayment recorded successfully');
  } catch (err) {
    next(err);
  }
});

export default router;
