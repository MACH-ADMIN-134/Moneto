import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware.js';
import { sendSuccess } from '../../common/response.js';
import { prisma } from '../../config/database.config.js';

const router = Router();

// GET /api/v1/dashboard - Aggregate stats for Dashboard Page
router.get('/', authenticate, async (req, res, next) => {
  try {
    const userId = (req as any).user.id;

    // Accounts Summary
    const accounts = await prisma.account.findMany({
      where: { userId, deletedAt: null },
      orderBy: { balance: 'desc' },
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

    // Lending Summary
    const lendRequests = await prisma.lendRequest.findMany({
      where: { userId, deletedAt: null },
    });
    const totalLent = lendRequests
      .filter((l) => l.type === 'lent' && l.status !== 'settled')
      .reduce((sum, l) => sum + Number(l.principalAmount), 0);
    const totalBorrowed = lendRequests
      .filter((l) => l.type === 'borrowed' && l.status !== 'settled')
      .reduce((sum, l) => sum + Number(l.principalAmount), 0);
    const activeLoansCount = lendRequests.filter((l) => l.status === 'active').length;

    // Payables Summary
    const payables = await prisma.payable.findMany({
      where: { userId, deletedAt: null, status: 'pending' },
      orderBy: { dueDate: 'asc' },
    });
    const pendingPayablesCount = payables.length;
    const totalPendingPayablesAmount = payables.reduce((sum, p) => sum + Number(p.amount), 0);

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
      accountSummary: {
        count: accounts.length,
        totalBalance: accountBalance,
        topAccounts: accounts.slice(0, 3),
      },
      lendingSummary: {
        activeCount: activeLoansCount,
        totalLent,
        totalBorrowed,
      },
      payablesSummary: {
        pendingCount: pendingPayablesCount,
        totalPendingAmount: totalPendingPayablesAmount,
        upcoming: payables.slice(0, 3),
      },
      investmentsCount: investments.length,
      recentTransactions,
    }, 'Dashboard metrics retrieved successfully');
  } catch (err) {
    next(err);
  }
});

export default router;
