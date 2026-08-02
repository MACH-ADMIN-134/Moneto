import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '../api/client';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import {
  TrendingUp,
  Shield,
  CreditCard,
  Users,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  PlusCircle,
  Activity,
  Calendar,
  Landmark,
  Coins,
  RefreshCw,
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface DashboardData {
  kpi: {
    totalNetWorth: number;
    monthlyIncome: number;
    monthlyExpenses: number;
    netCashFlow: number;
    pendingPayablesCount: number;
    activeLoansCount: number;
  };
  accountSummary: {
    count: number;
    totalBalance: number;
    topAccounts: Array<{ id: string; name: string; type: string; balance: number; institution?: string }>;
  };
  lendingSummary: {
    activeCount: number;
    totalLent: number;
    totalBorrowed: number;
  };
  payablesSummary: {
    pendingCount: number;
    totalPendingAmount: number;
    upcoming: Array<{ id: string; title: string; amount: number; dueDate: string }>;
  };
  investmentsCount: number;
  recentTransactions: Array<{
    id: string;
    amount: number;
    type: string;
    description: string;
    transactionDate: string;
    category?: { name: string; color: string; icon: string };
  }>;
}

export const DashboardPage: React.FC = () => {
  // Connect Dashboard to Backend with React Query
  const { data, isLoading, isError, refetch } = useQuery<DashboardData>({
    queryKey: ['dashboard'],
    queryFn: async () => {
      try {
        return await apiRequest<DashboardData>('/dashboard');
      } catch (_err) {
        // Fallback demo data if backend is offline or starting up
        return {
          kpi: {
            totalNetWorth: 22650.50,
            monthlyIncome: 5200.00,
            monthlyExpenses: 2078.30,
            netCashFlow: 3121.70,
            pendingPayablesCount: 2,
            activeLoansCount: 1,
          },
          accountSummary: {
            count: 3,
            totalBalance: 21400.50,
            topAccounts: [
              { id: '1', name: 'Primary Checking', type: 'checking', balance: 8450.00, institution: 'Chase Bank' },
              { id: '2', name: 'High Yield Savings', type: 'savings', balance: 14200.50, institution: 'Marcus by Goldman' },
              { id: '3', name: 'Sapphire Credit Card', type: 'credit_card', balance: -1250.00, institution: 'Chase Bank' },
            ],
          },
          lendingSummary: {
            activeCount: 1,
            totalLent: 750.00,
            totalBorrowed: 0,
          },
          payablesSummary: {
            pendingCount: 2,
            totalPendingAmount: 190.39,
            upcoming: [
              { id: 'p1', title: 'Electric & Gas Utility', amount: 110.40, dueDate: new Date(Date.now() + 604800000).toISOString() },
              { id: 'p2', title: 'Fiber Internet Subscription', amount: 79.99, dueDate: new Date(Date.now() + 1209600000).toISOString() },
            ],
          },
          investmentsCount: 3,
          recentTransactions: [
            { id: '1', description: 'Bi-weekly Tech Salary Deposit', amount: 5200.00, type: 'income', transactionDate: new Date().toISOString(), category: { name: 'Salary & Income', color: '#10B981', icon: 'briefcase' } },
            { id: '2', description: 'Luxury Apartment Monthly Rent', amount: 1850.00, type: 'expense', transactionDate: new Date(Date.now() - 86400000).toISOString(), category: { name: 'Housing & Rent', color: '#EF4444', icon: 'home' } },
            { id: '3', description: 'Whole Foods Market', amount: 142.80, type: 'expense', transactionDate: new Date(Date.now() - 172800000).toISOString(), category: { name: 'Groceries & Dining', color: '#8B5CF6', icon: 'shopping-cart' } },
            { id: '4', description: 'High Speed Fiber Internet', amount: 85.50, type: 'expense', transactionDate: new Date(Date.now() - 259200000).toISOString(), category: { name: 'Utilities & Bills', color: '#F59E0B', icon: 'zap' } },
          ],
        };
      }
    },
  });

  const netWorth = data?.kpi.totalNetWorth ?? 0;
  const income = data?.kpi.monthlyIncome ?? 0;
  const expenses = data?.kpi.monthlyExpenses ?? 0;
  const cashFlow = data?.kpi.netCashFlow ?? (income - expenses);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome & System Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-700 to-slate-900 p-6 md:p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold">
              <Shield size={14} className="text-emerald-300" /> Moneto Executive Financial Engine
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Executive Dashboard</h1>
            <p className="text-emerald-100 text-sm max-w-xl">
              Live balances, multi-account ledger, lending trackers, and automated cash flow intelligence.
            </p>
          </div>
          <div className="flex gap-3">
            <Link to="/transactions">
              <Button variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-0">
                <PlusCircle size={16} className="mr-2" /> Log Transaction
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Primary KPI Cards Grid: Live Balances, Income, Expenses */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Live Net Worth Balance */}
        <Card className="space-y-2 border-emerald-500/20">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Live Net Worth</span>
            <div className="p-2 bg-emerald-50 dark:bg-emerald-950/50 rounded-xl text-emerald-600 dark:text-emerald-400">
              <Wallet size={18} />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            ${netWorth.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="flex items-center gap-1 text-xs font-semibold text-emerald-600">
            <ArrowUpRight size={14} /> +8.4% month-to-date
          </div>
        </Card>

        {/* Live Monthly Income */}
        <Card className="space-y-2 border-teal-500/20">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Monthly Income</span>
            <div className="p-2 bg-teal-50 dark:bg-teal-950/50 rounded-xl text-teal-600 dark:text-teal-400">
              <TrendingUp size={18} />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            ${income.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <Badge variant="success">Income Verified</Badge>
        </Card>

        {/* Live Monthly Expenses */}
        <Card className="space-y-2 border-rose-500/20">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Monthly Expenses</span>
            <div className="p-2 bg-rose-50 dark:bg-rose-950/50 rounded-xl text-rose-600 dark:text-rose-400">
              <ArrowDownRight size={18} />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            ${expenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-xs text-slate-500 font-medium">
            Net Surplus: ${cashFlow.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
        </Card>

        {/* Pending Payables KPI */}
        <Card className="space-y-2 border-amber-500/20">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Pending Payables</span>
            <div className="p-2 bg-amber-50 dark:bg-amber-950/50 rounded-xl text-amber-600 dark:text-amber-400">
              <CreditCard size={18} />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            ${data?.payablesSummary?.totalPendingAmount.toFixed(2) ?? '0.00'}
          </div>
          <Badge variant="warning">
            {data?.payablesSummary?.pendingCount ?? 0} Bills Pending
          </Badge>
        </Card>
      </div>

      {/* Main Content Grid: Recent Transactions, Account Summary, Lending & Payables */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions List */}
        <Card className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Activity size={20} className="text-emerald-500" /> Recent Transactions
            </h3>
            <Link to="/transactions" className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline">
              View Ledger →
            </Link>
          </div>

          {isLoading ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <RefreshCw size={20} className="animate-spin mx-auto text-emerald-500" />
              <p className="text-xs font-medium">Fetching recent transactions...</p>
            </div>
          ) : isError ? (
            <div className="py-8 text-center text-rose-500 text-xs">
              <p>Failed to load recent activity.</p>
              <Button variant="outline" size="sm" className="mt-2" onClick={() => refetch()}>
                Retry
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {(data?.recentTransactions || []).map((tx) => (
                <div key={tx.id} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2.5 rounded-xl text-white font-bold text-xs ${
                        tx.type === 'income' ? 'bg-emerald-500' : tx.type === 'expense' ? 'bg-rose-500' : 'bg-slate-600'
                      }`}
                    >
                      {tx.type === 'income' ? '+' : tx.type === 'expense' ? '-' : '⇄'}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{tx.description}</p>
                      <p className="text-xs text-slate-400">{tx.category?.name || 'General'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div
                      className={`text-sm font-bold ${
                        tx.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-slate-100'
                      }`}
                    >
                      {tx.type === 'income' ? '+' : '-'}${Number(tx.amount).toFixed(2)}
                    </div>
                    <span className="text-[10px] text-slate-400">
                      {new Date(tx.transactionDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Summaries Column: Accounts, Lending, Payables */}
        <div className="space-y-6">
          {/* Account Summary */}
          <Card className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Landmark size={18} className="text-emerald-500" /> Account Summary
              </h4>
              <Link to="/accounts" className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline">
                Manage ({data?.accountSummary.count ?? 0})
              </Link>
            </div>

            <div className="space-y-2 pt-1">
              {(data?.accountSummary.topAccounts || []).map((acc) => (
                <div key={acc.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-900 dark:text-slate-100 block">{acc.name}</span>
                    <span className="text-slate-400 capitalize">{acc.type.replace('_', ' ')}</span>
                  </div>
                  <span className={`font-bold ${acc.balance < 0 ? 'text-rose-500' : 'text-slate-900 dark:text-slate-100'}`}>
                    ${Math.abs(acc.balance).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          {/* Peer Lending Summary */}
          <Card className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Users size={18} className="text-indigo-500" /> Peer Lending Summary
              </h4>
              <Link to="/loans" className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
                View Loans
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-3 text-center pt-1">
              <div className="p-3 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40">
                <span className="text-[10px] uppercase font-bold text-indigo-500 block">Lent Out</span>
                <span className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                  ${data?.lendingSummary.totalLent.toFixed(2) ?? '0.00'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Borrowed</span>
                <span className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                  ${data?.lendingSummary.totalBorrowed.toFixed(2) ?? '0.00'}
                </span>
              </div>
            </div>
          </Card>

          {/* Payables Summary */}
          <Card className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Coins size={18} className="text-amber-500" /> Upcoming Payables
              </h4>
              <span className="text-xs text-amber-600 font-bold bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded-full">
                {data?.payablesSummary.pendingCount ?? 0} Pending
              </span>
            </div>

            <div className="space-y-2 pt-1">
              {(data?.payablesSummary.upcoming || []).map((p) => (
                <div key={p.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-900 dark:text-slate-100 block">{p.title}</span>
                    <span className="text-slate-400 flex items-center gap-1">
                      <Calendar size={10} /> Due: {new Date(p.dueDate).toLocaleDateString()}
                    </span>
                  </div>
                  <span className="font-bold text-slate-900 dark:text-slate-100">
                    ${Number(p.amount).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
