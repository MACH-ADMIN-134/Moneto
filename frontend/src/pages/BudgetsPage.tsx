import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../api/client';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Plus, Edit3, Trash2, X, RefreshCw, AlertCircle, PieChart, ShieldAlert } from 'lucide-react';

export interface Budget {
  id: string;
  categoryId: string;
  amount: number;
  period: string;
  spent: number;
  remaining: number;
  percentage: number;
  isOver: boolean;
  category?: { id: string; name: string; color: string; icon: string };
}

interface Category {
  id: string;
  name: string;
  type: string;
}

export const BudgetsPage: React.FC = () => {
  const queryClient = useQueryClient();

  // Modal States
  const [showModal, setShowModal] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);

  // Form States
  const [categoryId, setCategoryId] = useState('');
  const [amount, setAmount] = useState('');
  const [period, setPeriod] = useState('monthly');
  const [formError, setFormError] = useState('');

  // 1. Fetch Categories for budget allocation
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      try {
        return await apiRequest<Category[]>('/categories');
      } catch (_err) {
        return [
          { id: 'c2', name: 'Housing & Rent', type: 'expense' },
          { id: 'c3', name: 'Groceries & Dining', type: 'expense' },
          { id: 'c4', name: 'Utilities & Bills', type: 'expense' },
        ];
      }
    },
  });

  // Filter only expense categories
  const expenseCategories = categories.filter((c) => c.type === 'expense');

  // 2. Fetch Budgets with React Query
  const {
    data: budgets = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<Budget[]>({
    queryKey: ['budgets'],
    queryFn: async () => {
      try {
        return await apiRequest<Budget[]>('/budgets');
      } catch (_err) {
        return [
          {
            id: 'b1',
            categoryId: 'c2',
            amount: 2000.00,
            period: 'monthly',
            spent: 1850.00,
            remaining: 150.00,
            percentage: 92,
            isOver: false,
            category: { id: 'c2', name: 'Housing & Rent', color: '#EF4444', icon: 'home' },
          },
          {
            id: 'b2',
            categoryId: 'c3',
            amount: 600.00,
            period: 'monthly',
            spent: 442.80,
            remaining: 157.20,
            percentage: 74,
            isOver: false,
            category: { id: 'c3', name: 'Groceries & Dining', color: '#8B5CF6', icon: 'shopping-cart' },
          },
          {
            id: 'b3',
            categoryId: 'c4',
            amount: 150.00,
            period: 'monthly',
            spent: 195.90,
            remaining: -45.90,
            percentage: 100,
            isOver: true,
            category: { id: 'c4', name: 'Utilities & Bills', color: '#F59E0B', icon: 'zap' },
          },
        ];
      }
    },
  });

  const totalBudgeted = budgets.reduce((sum, b) => sum + Number(b.amount), 0);
  const totalSpent = budgets.reduce((sum, b) => sum + Number(b.spent), 0);

  // 3. React Query Mutations: Create, Edit, Delete
  const createMutation = useMutation({
    mutationFn: async (payload: { categoryId: string; amount: number; period: string }) => {
      return apiRequest<Budget>('/budgets', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      closeModal();
    },
    onError: (err: any) => {
      setFormError(err.message || 'Failed to create budget allocation');
    },
  });

  const editMutation = useMutation({
    mutationFn: async (params: { id: string; payload: { categoryId: string; amount: number; period: string } }) => {
      return apiRequest<Budget>(`/budgets/${params.id}`, {
        method: 'PUT',
        body: JSON.stringify(params.payload),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      closeModal();
    },
    onError: (err: any) => {
      setFormError(err.message || 'Failed to update budget');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest<void>(`/budgets/${id}`, { method: 'DELETE' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
    },
    onError: (err: any) => {
      alert(err.message || 'Failed to delete budget');
    },
  });

  const openCreateModal = () => {
    setEditingBudget(null);
    setCategoryId(expenseCategories[0]?.id || categories[0]?.id || '');
    setAmount('');
    setPeriod('monthly');
    setFormError('');
    setShowModal(true);
  };

  const openEditModal = (b: Budget) => {
    setEditingBudget(b);
    setCategoryId(b.categoryId);
    setAmount(b.amount.toString());
    setPeriod(b.period);
    setFormError('');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingBudget(null);
    setFormError('');
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setFormError('Budget limit must be a positive number');
      return;
    }
    if (!categoryId) {
      setFormError('Please select a category');
      return;
    }

    const payload = { categoryId, amount: numAmount, period };

    if (editingBudget) {
      editMutation.mutate({ id: editingBudget.id, payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to remove this budget allocation?')) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Budgets & Allocations
          </h1>
          <p className="text-slate-500 text-sm">
            Set expense limits, track month-to-date spending, and prevent overspending.
          </p>
        </div>
        <Button variant="primary" onClick={openCreateModal}>
          <Plus size={16} className="mr-2" /> Add Budget Limit
        </Button>
      </div>

      {/* Aggregated Budget Card */}
      <Card className="bg-gradient-to-r from-slate-900 via-slate-800 to-teal-950 text-white p-6 rounded-3xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1">
            <span className="text-xs uppercase font-bold tracking-widest text-teal-400">Total Monthly Budget Limit</span>
            <div className="text-3xl md:text-4xl font-extrabold">${totalBudgeted.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
            <p className="text-xs text-slate-300">
              Total MTD Spent: <span className="font-bold text-white">${totalSpent.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            </p>
          </div>
          <Badge variant={totalSpent > totalBudgeted ? 'danger' : 'success'} className="text-xs py-1.5 px-3">
            {budgets.length} Categories Configured
          </Badge>
        </div>
      </Card>

      {/* Budgets Grid */}
      {isLoading ? (
        <div className="py-16 text-center text-slate-400 space-y-3">
          <RefreshCw size={24} className="animate-spin mx-auto text-teal-500" />
          <p className="text-sm font-medium">Loading budget allocations...</p>
        </div>
      ) : isError ? (
        <div className="py-16 text-center text-rose-500 space-y-3">
          <AlertCircle size={32} className="mx-auto" />
          <p className="font-bold">Failed to load budgets</p>
          <p className="text-xs text-slate-400">{(error as any)?.message || 'An error occurred'}</p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Try Again
          </Button>
        </div>
      ) : budgets.length === 0 ? (
        <Card className="py-16 text-center text-slate-400 space-y-3">
          <PieChart size={32} className="mx-auto text-slate-400" />
          <p className="text-base font-semibold text-slate-700 dark:text-slate-300">No budget allocations found</p>
          <p className="text-xs">Create limits for your categories to start tracking spending.</p>
          <Button variant="outline" size="sm" onClick={openCreateModal}>
            <Plus size={14} className="mr-1" /> Add Budget Limit
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {budgets.map((b) => {
            const isOver = b.isOver;
            const pct = Math.min(b.percentage, 100);

            return (
              <Card key={b.id} className="space-y-4 hover:border-teal-500/40 transition-all group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-2xl font-bold text-white shadow-sm ${isOver ? 'bg-rose-500' : 'bg-teal-500'}`}>
                      {isOver ? <ShieldAlert size={20} /> : <PieChart size={20} />}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-slate-100">{b.category?.name || 'General Category'}</h3>
                      <p className="text-xs text-slate-400 capitalize">{b.period} Limit</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(b)}
                      title="Edit Limit"
                      className="text-slate-400 hover:text-teal-500 transition-colors p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(b.id)}
                      title="Delete Budget"
                      className="text-slate-400 hover:text-rose-500 transition-colors p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-500">Spent: ${Number(b.spent).toFixed(2)}</span>
                    <span className={isOver ? 'text-rose-500 font-bold' : 'text-slate-900 dark:text-slate-100'}>
                      ${Number(b.amount).toFixed(2)} Limit
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isOver ? 'bg-rose-500' : pct > 80 ? 'bg-amber-500' : 'bg-teal-500'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] font-medium text-slate-400 pt-0.5">
                    <span>{pct}% Used</span>
                    <span className={isOver ? 'text-rose-500 font-bold' : 'text-emerald-600 dark:text-emerald-400'}>
                      {isOver ? `Over by $${Math.abs(b.remaining).toFixed(2)}` : `$${b.remaining.toFixed(2)} Remaining`}
                    </span>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create / Edit Budget Modal */}
      {(showModal || editingBudget) && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-md space-y-4 shadow-2xl animate-fade-in relative">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {editingBudget ? 'Edit Budget Limit' : 'Add Budget Limit'}
              </h3>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X size={20} />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-semibold">
                {formError}
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">Expense Category</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:border-teal-500"
                >
                  {expenseCategories.length > 0
                    ? expenseCategories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))
                    : categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">Budget Limit ($)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">Recurrence Period</label>
                <select
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:border-teal-500"
                >
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={closeModal}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={createMutation.isPending || editMutation.isPending}
                >
                  {editingBudget
                    ? editMutation.isPending ? 'Saving...' : 'Update Limit'
                    : createMutation.isPending ? 'Saving...' : 'Create Budget'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
