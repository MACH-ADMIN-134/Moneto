import React, { useEffect, useState } from 'react';
import { apiRequest } from '../api/client';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { PieChart, Plus, AlertTriangle, CheckCircle, Trash2 } from 'lucide-react';

interface Budget {
  id: string;
  amount: number;
  spent: number;
  remaining: number;
  percentage: number;
  isOver: boolean;
  category: { id: string; name: string; color: string; icon: string };
}

interface Category {
  id: string;
  name: string;
  type: string;
}

export const BudgetsPage: React.FC = () => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form states
  const [categoryId, setCategoryId] = useState('');
  const [amount, setAmount] = useState('');

  const loadData = async () => {
    try {
      const [bRes, cRes] = await Promise.all([
        apiRequest<Budget[]>('/budgets'),
        apiRequest<Category[]>('/categories'),
      ]);
      setBudgets(bRes);
      setCategories(cRes.filter((c) => c.type === 'expense'));
      if (cRes.length > 0 && !categoryId) {
        setCategoryId(cRes[0].id);
      }
    } catch (_err) {
      // Demo fallback
      setBudgets([
        { id: '1', amount: 2000.00, spent: 1850.00, remaining: 150.00, percentage: 93, isOver: false, category: { id: 'c1', name: 'Housing & Rent', color: '#EF4444', icon: 'home' } },
        { id: '2', amount: 600.00, spent: 420.00, remaining: 180.00, percentage: 70, isOver: false, category: { id: 'c2', name: 'Groceries & Dining', color: '#8B5CF6', icon: 'shopping-cart' } },
        { id: '3', amount: 200.00, spent: 240.00, remaining: -40.00, percentage: 100, isOver: true, category: { id: 'c3', name: 'Utilities & Bills', color: '#F59E0B', icon: 'zap' } },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiRequest('/budgets', {
        method: 'POST',
        body: JSON.stringify({ categoryId, amount: parseFloat(amount) }),
      });
      setShowModal(false);
      setAmount('');
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to set budget');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this budget allocation?')) return;
    try {
      await apiRequest(`/budgets/${id}`, { method: 'DELETE' });
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete budget');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Monthly Category Budgets
          </h1>
          <p className="text-slate-500 text-sm">
            Set expense limits by category and track real-time spending progress to prevent overspending.
          </p>
        </div>
        <Button variant="primary" onClick={() => setShowModal(true)}>
          <Plus size={16} className="mr-2" /> Set Category Budget
        </Button>
      </div>

      {loading ? (
        <div className="py-12 text-center text-slate-400">Loading budget allocations...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {budgets.map((b) => {
            const isOver = b.isOver;
            return (
              <Card key={b.id} className="space-y-4 relative">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-2xl flex items-center justify-center text-white font-bold text-sm shadow-md"
                      style={{ backgroundColor: b.category?.color || '#10B981' }}
                    >
                      <PieChart size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-slate-100">{b.category?.name || 'Category'}</h3>
                      <p className="text-xs text-slate-400">Monthly Allocation</p>
                    </div>
                  </div>
                  <button onClick={() => handleDelete(b.id)} className="text-slate-400 hover:text-rose-500 transition-colors p-1">
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm font-semibold">
                    <span className="text-slate-500">Spent: ${b.spent.toFixed(2)}</span>
                    <span className="text-slate-900 dark:text-slate-100">Limit: ${Number(b.amount).toFixed(2)}</span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${isOver ? 'bg-rose-500' : b.percentage > 85 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                      style={{ width: `${Math.min(b.percentage, 100)}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 text-xs font-semibold">
                  {isOver ? (
                    <Badge variant="danger" className="flex items-center gap-1">
                      <AlertTriangle size={12} /> Over by ${Math.abs(b.remaining).toFixed(2)}
                    </Badge>
                  ) : (
                    <Badge variant="success" className="flex items-center gap-1">
                      <CheckCircle size={12} /> ${b.remaining.toFixed(2)} Remaining
                    </Badge>
                  )}
                  <span className="text-slate-400">{b.percentage}% Used</span>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Set Budget Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-md space-y-4 shadow-2xl animate-fade-in">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Set Monthly Budget</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">Expense Category</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:border-emerald-500"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">Monthly Limit ($)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="500.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary">
                  Save Budget
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
