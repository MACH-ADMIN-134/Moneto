import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './context/ThemeContext';
import { Layout } from './components/layout/Layout';
import { Card } from './components/ui/Card';
import { Badge } from './components/ui/Badge';
import { Button } from './components/ui/Button';
import { Shield, TrendingUp, CreditCard, Users, Lock, Server, Database } from 'lucide-react';

const queryClient = new QueryClient();

export const AppContent: React.FC<{ activeTab: string }> = ({ activeTab: _activeTab }) => {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-brand-600 to-emerald-800 p-6 md:p-8 text-white shadow-xl">
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold">
            <Shield size={14} /> Enterprise Security Baseline Active
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Moneto Personal Finance</h1>
          <p className="text-emerald-100 text-sm max-w-xl">
            Mobile-first, API-driven, Dockerized finance platform initialized with Argon2id password encryption, JWT refresh token rotation, and multi-environment PostgreSQL isolation.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Net Worth</span>
            <TrendingUp size={18} className="text-brand-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">$15,420.50</div>
          <Badge variant="success">+12.4% vs last month</Badge>
        </Card>

        <Card className="space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Monthly Income</span>
            <Shield size={18} className="text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">$4,500.00</div>
          <Badge variant="info">Verified Source</Badge>
        </Card>

        <Card className="space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Payables</span>
            <CreditCard size={18} className="text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">$145.50</div>
          <Badge variant="warning">3 Bills Pending</Badge>
        </Card>

        <Card className="space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Peer Lending</span>
            <Users size={18} className="text-indigo-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">$500.00</div>
          <Badge variant="neutral">1 Active Loan</Badge>
        </Card>
      </div>

      {/* Infrastructure Status Grid */}
      <Card className="space-y-4">
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Server size={20} className="text-brand-500" /> System Foundation Status
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-2">
            <div className="flex items-center gap-2 font-semibold text-sm text-slate-800 dark:text-slate-200">
              <Lock size={16} className="text-emerald-500" /> DevSecOps Stack
            </div>
            <p className="text-xs text-slate-500">Argon2id + Dual JWT Token Rotation with HTTP-Only Cookie isolation and audit log trace.</p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-2">
            <div className="flex items-center gap-2 font-semibold text-sm text-slate-800 dark:text-slate-200">
              <Database size={16} className="text-sky-500" /> Isolated Environments
            </div>
            <p className="text-xs text-slate-500">PostgreSQL instances provisioned for moneto_dev, moneto_test, and moneto_prod schemas.</p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-2">
            <div className="flex items-center gap-2 font-semibold text-sm text-slate-800 dark:text-slate-200">
              <Server size={16} className="text-purple-500" /> Nginx Reverse Proxy
            </div>
            <p className="text-xs text-slate-500">Routing `/api/v1` traffic to Node.js backend container with rate limits and HSTS headers.</p>
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <Button variant="primary">
            Explore Foundation Docs
          </Button>
        </div>
      </Card>
    </div>
  );
};

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <Layout>
          {({ activeTab }) => <AppContent activeTab={activeTab} />}
        </Layout>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
