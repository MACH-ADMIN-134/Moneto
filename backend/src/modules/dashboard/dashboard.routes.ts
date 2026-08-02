import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware.js';
import { sendSuccess } from '../../common/response.js';
import { prisma } from '../../config/database.config.js';

const router = Router();

// GET /api/v1/dashboard - Aggregate stats for Dashboard Page
router.get('/', authenticate, async (req, res, next) => {
  try {
    const userId = (req as any).user.id;

    // Accounts Net Balance
    const accounts = await prisma.account.findMany({
      where: { userId, deletedAt: null },
    });
    const accountBalance = accounts.reduce((acc, curr) => acc + Number(curr.balance), 0);

    // Investments Value
    const investments = await prisma.investment.findMany({
      where: { userId, deletedAt: null },
    });
    const investmentValue = investments.reduce((acc, curr) => acc + (Number(curr.quantity) * Number(curr.currentPrice)), 0);

    const totalNetWorth = accountBalance + investmentValue;

    // Monthly Income & Expense
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const monthlyTxs = await prisma.transaction.findMany({
      where: {
        userId,
        deletedAt: null,
        transactionDate: { gte: startOfMonth },
      },
    });

    let monthlyIncome = 0;
    let monthlyExpenses = 0;

    for (const tx of monthlyTxs) {
      const amt = Number(tx.amount);
      if (tx.type === 'income') monthlyIncome += amt;
      else if (tx.type === 'expense') monthlyExpenses += amt;
    }

    // Pending Payables Count
    const pendingPayablesCount = await prisma.payable.count({
      where: { userId, status: 'pending', deletedAt: null },
    });

    // Active Loans Count
    const activeLoansCount = await prisma.lendRequest.count({
      where: { userId, status: 'active', deletedAt: null },
    });

    // Recent 5 Transactions
    const recentTransactions = await prisma.transaction.findMany({
      where: { userId, deletedAt: null },
      include: {
        category: { select: { name: true, color: true, icon: true } },
        account: { select: { name: true } },
      },
      orderBy: { transactionDate: 'desc' },
      take: 5,
    });

    sendSuccess(res, {
      kpi: {
        totalNetWorth,
        monthlyIncome,
        monthlyExpenses,
        netCashFlow: monthlyIncome - monthlyExpenses,
        pendingPayablesCount,
        activeLoansCount,
      },
      accountsCount: accounts.length,
      investmentsCount: investments.length,
      recentTransactions,
    }, 'Dashboard metrics retrieved successfully');
  } catch (err) {
    next(err);
  }
});

export default router;
