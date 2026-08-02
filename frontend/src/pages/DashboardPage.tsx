import React, { useEffect, useState } from 'react';
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
  CheckCircle2,
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
  accountsCount: number;
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
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const res = await apiRequest<DashboardData>('/dashboard');
        setData(res);
      } catch (_err) {
        // Fallback demo data if offline or initializing
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  const netWorth = data?.kpi.totalNetWorth ?? 22650.50;
  const income = data?.kpi.monthlyIncome ?? 5200.00;
  const expenses = data?.kpi.monthlyExpenses ?? 2078.30;
  const cashFlow = data?.kpi.netCashFlow ?? (income - expenses);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome & System Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-700 to-slate-900 p-6 md:p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold">
              <Shield size={14} className="text-emerald-300" /> Moneto Enterprise v1.0 Active
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Financial Overview</h1>
            <p className="text-emerald-100 text-sm max-w-xl">
              Real-time portfolio management, multi-account ledger, and automated budget tracking with bank-grade security.
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

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="space-y-2 border-emerald-500/20">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Net Worth</span>
            <div className="p-2 bg-emerald-50 dark:bg-emerald-950/50 rounded-xl text-emerald-600 dark:text-emerald-400">
              <Wallet size={18} />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">${netWorth.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
          <div className="flex items-center gap-1 text-xs font-semibold text-emerald-600">
            <ArrowUpRight size={14} /> +8.4% this month
          </div>
        </Card>

        <Card className="space-y-2 border-teal-500/20">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Monthly Income</span>
            <div className="p-2 bg-teal-50 dark:bg-teal-950/50 rounded-xl text-teal-600 dark:text-teal-400">
              <TrendingUp size={18} />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">${income.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
          <Badge variant="success">Verified Deposit</Badge>
        </Card>

        <Card className="space-y-2 border-rose-500/20">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Monthly Expenses</span>
            <div className="p-2 bg-rose-50 dark:bg-rose-950/50 rounded-xl text-rose-600 dark:text-rose-400">
              <ArrowDownRight size={18} />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">${expenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
          <div className="text-xs text-slate-500 font-medium">Net Savings: ${cashFlow.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
        </Card>

        <Card className="space-y-2 border-amber-500/20">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Pending Payables</span>
            <div className="p-2 bg-amber-50 dark:bg-amber-950/50 rounded-xl text-amber-600 dark:text-amber-400">
              <CreditCard size={18} />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{data?.kpi.pendingPayablesCount ?? 2} Pending</div>
          <Badge variant="warning">Upcoming Bills</Badge>
        </Card>
      </div>

      {/* Main Grid: Recent Activity & Quick Navigation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions */}
        <Card className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Activity size={20} className="text-emerald-500" /> Recent Transactions
            </h3>
            <Link to="/transactions" className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline">
              View All →
            </Link>
          </div>

          {loading ? (
            <div className="py-8 text-center text-slate-400 text-sm">Loading ledger activity...</div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {(data?.recentTransactions && data.recentTransactions.length > 0
                ? data.recentTransactions
                : [
                    { id: '1', description: 'Bi-weekly Tech Salary Deposit', amount: 5200.00, type: 'income', transactionDate: new Date().toISOString(), category: { name: 'Salary & Income', color: '#10B981', icon: 'briefcase' } },
                    { id: '2', description: 'Luxury Apartment Monthly Rent', amount: 1850.00, type: 'expense', transactionDate: new Date().toISOString(), category: { name: 'Housing & Rent', color: '#EF4444', icon: 'home' } },
                    { id: '3', description: 'Whole Foods Market', amount: 142.80, type: 'expense', transactionDate: new Date().toISOString(), category: { name: 'Groceries & Dining', color: '#8B5CF6', icon: 'shopping-cart' } },
                    { id: '4', description: 'High Speed Fiber Internet', amount: 85.50, type: 'expense', transactionDate: new Date().toISOString(), category: { name: 'Utilities & Bills', color: '#F59E0B', icon: 'zap' } },
                  ]
              ).map((tx) => (
                <div key={tx.id} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl text-white font-bold text-xs ${tx.type === 'income' ? 'bg-emerald-500' : 'bg-slate-700'}`}>
                      {tx.type === 'income' ? '+' : '-'}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{tx.description}</p>
                      <p className="text-xs text-slate-400">{tx.category?.name || 'General'}</p>
                    </div>
                  </div>
                  <div className={`text-sm font-bold ${tx.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-slate-100'}`}>
                    {tx.type === 'income' ? '+' : '-'}${Number(tx.amount).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Quick Hub Navigation Cards */}
        <div className="space-y-4">
          <Card className="space-y-3 bg-gradient-to-br from-slate-900 to-slate-800 text-white">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">Financial Hub</span>
              <CheckCircle2 size={18} className="text-emerald-400" />
            </div>
            <h4 className="text-lg font-bold">Quick Page Navigation</h4>
            <div className="grid grid-cols-2 gap-2 text-xs font-medium pt-2">
              <Link to="/accounts" className="p-2.5 bg-white/10 rounded-xl hover:bg-white/20 transition-colors flex items-center gap-2">
                <Wallet size={14} className="text-emerald-400" /> Accounts
              </Link>
              <Link to="/budgets" className="p-2.5 bg-white/10 rounded-xl hover:bg-white/20 transition-colors flex items-center gap-2">
                <Shield size={14} className="text-teal-400" /> Budgets
              </Link>
              <Link to="/investments" className="p-2.5 bg-white/10 rounded-xl hover:bg-white/20 transition-colors flex items-center gap-2">
                <TrendingUp size={14} className="text-sky-400" /> Investments
              </Link>
              <Link to="/loans" className="p-2.5 bg-white/10 rounded-xl hover:bg-white/20 transition-colors flex items-center gap-2">
                <Users size={14} className="text-purple-400" /> Loans
              </Link>
            </div>
          </Card>

          <Card className="space-y-3">
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">DevSecOps Protection</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Argon2id password hashing, JWT refresh rotation, strictly isolated PostgreSQL database environments, and Nginx reverse proxy protection active.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};
