import React, { useEffect, useState } from 'react';
import { apiRequest } from '../api/client';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Target, Plus, CheckCircle, Calendar, Trash2 } from 'lucide-react';

interface Goal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  remaining: number;
  percentage: number;
  isCompleted: boolean;
  category: string;
  targetDate?: string;
}

export const GoalsPage: React.FC = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [showContribModal, setShowContribModal] = useState(false);
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [category, setCategory] = useState('Safety');
  const [contribAmount, setContribAmount] = useState('');

  const loadGoals = async () => {
    try {
      const res = await apiRequest<Goal[]>('/goals');
      setGoals(res);
    } catch (_err) {
      // Demo fallback
      setGoals([
        { id: '1', title: 'Emergency Reserve Fund', targetAmount: 20000.00, currentAmount: 14200.50, remaining: 5799.50, percentage: 71, isCompleted: false, category: 'Safety', targetDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString() },
        { id: '2', title: 'European Summer Trip', targetAmount: 5000.00, currentAmount: 3200.00, remaining: 1800.00, percentage: 64, isCompleted: false, category: 'Travel', targetDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString() },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGoals();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiRequest('/goals', {
        method: 'POST',
        body: JSON.stringify({
          title,
          targetAmount: parseFloat(targetAmount),
          currentAmount: currentAmount ? parseFloat(currentAmount) : 0,
          category,
        }),
      });
      setShowGoalModal(false);
      setTitle('');
      setTargetAmount('');
      setCurrentAmount('');
      loadGoals();
    } catch (err: any) {
      alert(err.message || 'Failed to create goal');
    }
  };

  const handleContribute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGoalId) return;
    try {
      await apiRequest(`/goals/${selectedGoalId}/contribute`, {
        method: 'PATCH',
        body: JSON.stringify({ amount: parseFloat(contribAmount) }),
      });
      setShowContribModal(false);
      setContribAmount('');
      loadGoals();
    } catch (err: any) {
      alert(err.message || 'Failed to add contribution');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this savings goal?')) return;
    try {
      await apiRequest(`/goals/${id}`, { method: 'DELETE' });
      loadGoals();
    } catch (err: any) {
      alert(err.message || 'Failed to delete goal');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Savings & Financial Goals
          </h1>
          <p className="text-slate-500 text-sm">
            Set target savings milestones, track contribution progress, and celebrate reaching your financial goals.
          </p>
        </div>
        <Button variant="primary" onClick={() => setShowGoalModal(true)}>
          <Plus size={16} className="mr-2" /> Create Savings Goal
        </Button>
      </div>

      {loading ? (
        <div className="py-12 text-center text-slate-400">Loading savings goals...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {goals.map((g) => {
            const isCompleted = g.isCompleted;
            return (
              <Card key={g.id} className="space-y-4 hover:border-emerald-500/40 transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-600 dark:text-emerald-400 font-bold">
                      <Target size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-slate-100">{g.title}</h3>
                      <p className="text-xs text-slate-400">{g.category}</p>
                    </div>
                  </div>
                  <button onClick={() => handleDelete(g.id)} className="text-slate-400 hover:text-rose-500 transition-colors p-1">
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm font-bold">
                    <span className="text-emerald-600 dark:text-emerald-400">${Number(g.currentAmount).toLocaleString('en-US', { minimumFractionDigits: 2 })} Saved</span>
                    <span className="text-slate-500">Target: ${Number(g.targetAmount).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${isCompleted ? 'bg-emerald-500' : 'bg-gradient-to-r from-emerald-500 to-teal-400'}`}
                      style={{ width: `${Math.min(g.percentage, 100)}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 text-xs font-semibold">
                  <Badge variant={isCompleted ? 'success' : 'info'}>
                    {isCompleted ? 'Goal Completed!' : `${g.percentage}% Achieved`}
                  </Badge>

                  {g.targetDate && (
                    <span className="text-slate-400 flex items-center gap-1">
                      <Calendar size={12} /> Target: {new Date(g.targetDate).toLocaleDateString()}
                    </span>
                  )}
                </div>

                {!isCompleted && (
                  <div className="pt-2">
                    <Button
                      variant="outline"
                      className="w-full text-xs"
                      onClick={() => {
                        setSelectedGoalId(g.id);
                        setShowContribModal(true);
                      }}
                    >
                      <CheckCircle size={14} className="mr-2" /> Add Savings Contribution
                    </Button>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Create Goal Modal */}
      {showGoalModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-md space-y-4 shadow-2xl animate-fade-in">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Create Savings Goal</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">Goal Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Emergency Fund, New Car"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">Target Amount ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="10000.00"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">Initial Saved ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={currentAmount}
                    onChange={(e) => setCurrentAmount(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:border-emerald-500"
                >
                  <option value="Safety">Safety & Emergency</option>
                  <option value="Travel">Travel & Vacation</option>
                  <option value="Vehicle">Vehicle & Housing</option>
                  <option value="Retirement">Retirement & Investing</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowGoalModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary">
                  Create Goal
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Contribute Modal */}
      {showContribModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-md space-y-4 shadow-2xl animate-fade-in">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Add Goal Contribution</h3>
            <form onSubmit={handleContribute} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">Contribution Amount ($)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="500.00"
                  value={contribAmount}
                  onChange={(e) => setContribAmount(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowContribModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary">
                  Save Contribution
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
