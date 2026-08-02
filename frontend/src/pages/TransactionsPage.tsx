import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../api/client';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import {
  Plus,
  Search,
  Filter,
  Trash2,
  Edit3,
  ArrowUpRight,
  ArrowDownRight,
  ArrowRightLeft,
  X,
  ArrowUpDown,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';

export interface Transaction {
  id: string;
  amount: number;
  currency: string;
  type: 'income' | 'expense' | 'transfer' | string;
  description: string;
  transactionDate: string;
  categoryId: string;
  accountId?: string | null;
  category?: { id: string; name: string; color: string; icon: string; type: string };
  account?: { id: string; name: string; type: string };
}

interface Category {
  id: string;
  name: string;
  type: string;
}

interface Account {
  id: string;
  name: string;
  type: string;
}

interface TransactionsResponse {
  items: Transaction[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const TransactionsPage: React.FC = () => {
  const queryClient = useQueryClient();

  // Search & Filter State
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [sortField, setSortField] = useState<'date' | 'amount'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Modal States
  const [showModal, setShowModal] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);

  // Form States
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'income' | 'expense' | 'transfer'>('expense');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [accountId, setAccountId] = useState('');
  const [transactionDate, setTransactionDate] = useState(new Date().toISOString().split('T')[0]);
  const [formError, setFormError] = useState('');

  // 1. Fetch Categories & Accounts
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      try {
        return await apiRequest<Category[]>('/categories');
      } catch (_err) {
        return [
          { id: 'c1', name: 'Salary & Income', type: 'income' },
          { id: 'c2', name: 'Housing & Rent', type: 'expense' },
          { id: 'c3', name: 'Groceries & Dining', type: 'expense' },
          { id: 'c4', name: 'Utilities & Bills', type: 'expense' },
          { id: 'c5', name: 'Account Transfer', type: 'transfer' },
        ];
      }
    },
  });

  const { data: accountsData } = useQuery<{ accounts: Account[] }>({
    queryKey: ['accounts'],
    queryFn: async () => {
      try {
        return await apiRequest<{ accounts: Account[] }>('/accounts');
      } catch (_err) {
        return { accounts: [] };
      }
    },
  });
  const accounts = accountsData?.accounts ?? [];

  // 2. Fetch Transactions List with React Query
  const {
    data: txResponse,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<TransactionsResponse>({
    queryKey: ['transactions', search, filterType],
    queryFn: async () => {
      const query = new URLSearchParams();
      if (search) query.append('search', search);
      if (filterType) query.append('type', filterType);
      query.append('limit', '100');

      try {
        return await apiRequest<TransactionsResponse>(`/transactions?${query.toString()}`);
      } catch (_err) {
        // Fallback demo ledger data if offline or starting up
        const items: Transaction[] = [
          { id: '1', amount: 5200.00, currency: 'USD', type: 'income', description: 'Bi-weekly Tech Salary Deposit', transactionDate: new Date().toISOString(), categoryId: 'c1', category: { id: 'c1', name: 'Salary & Income', color: '#10B981', icon: 'briefcase', type: 'income' } },
          { id: '2', amount: 1850.00, currency: 'USD', type: 'expense', description: 'Luxury Apartment Monthly Rent', transactionDate: new Date(Date.now() - 86400000).toISOString(), categoryId: 'c2', category: { id: 'c2', name: 'Housing & Rent', color: '#EF4444', icon: 'home', type: 'expense' } },
          { id: '3', amount: 142.80, currency: 'USD', type: 'expense', description: 'Whole Foods Market', transactionDate: new Date(Date.now() - 172800000).toISOString(), categoryId: 'c3', category: { id: 'c3', name: 'Groceries & Dining', color: '#8B5CF6', icon: 'shopping-cart', type: 'expense' } },
          { id: '4', amount: 500.00, currency: 'USD', type: 'transfer', description: 'Transfer to High Yield Savings', transactionDate: new Date(Date.now() - 259200000).toISOString(), categoryId: 'c5', category: { id: 'c5', name: 'Account Transfer', color: '#64748B', icon: 'repeat', type: 'transfer' } },
        ];
        return { items, pagination: { page: 1, limit: 100, total: items.length, totalPages: 1 } };
      }
    },
  });

  const rawItems = txResponse?.items ?? [];

  // Sortable Table Logic
  const sortedItems = [...rawItems].sort((a, b) => {
    if (sortField === 'date') {
      const dateA = new Date(a.transactionDate).getTime();
      const dateB = new Date(b.transactionDate).getTime();
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    } else {
      const amtA = Number(a.amount);
      const amtB = Number(b.amount);
      return sortOrder === 'asc' ? amtA - amtB : amtB - amtA;
    }
  });

  // 3. React Query Mutations: Create, Edit, Delete
  const createMutation = useMutation({
    mutationFn: async (payload: any) => {
      return apiRequest<Transaction>('/transactions', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      closeModal();
    },
    onError: (err: any) => {
      setFormError(err.message || 'Failed to record transaction');
    },
  });

  const editMutation = useMutation({
    mutationFn: async (params: { id: string; payload: any }) => {
      return apiRequest<Transaction>(`/transactions/${params.id}`, {
        method: 'PUT',
        body: JSON.stringify(params.payload),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      closeModal();
    },
    onError: (err: any) => {
      setFormError(err.message || 'Failed to update transaction');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest<void>(`/transactions/${id}`, { method: 'DELETE' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    },
    onError: (err: any) => {
      alert(err.message || 'Failed to delete transaction');
    },
  });

  // Form Handlers & Validation
  const openCreateModal = () => {
    setEditingTx(null);
    setDescription('');
    setType('expense');
    setAmount('');
    setCategoryId(categories.find((c) => c.type === 'expense')?.id || categories[0]?.id || '');
    setAccountId(accounts[0]?.id || '');
    setTransactionDate(new Date().toISOString().split('T')[0]);
    setFormError('');
    setShowModal(true);
  };

  const openEditModal = (tx: Transaction) => {
    setEditingTx(tx);
    setDescription(tx.description);
    setType((tx.type as any) || 'expense');
    setAmount(tx.amount.toString());
    setCategoryId(tx.categoryId);
    setAccountId(tx.accountId || '');
    setTransactionDate(new Date(tx.transactionDate).toISOString().split('T')[0]);
    setFormError('');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingTx(null);
    setFormError('');
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!description.trim()) {
      setFormError('Description is required');
      return;
    }
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setFormError('Amount must be a positive number');
      return;
    }
    if (!categoryId) {
      setFormError('Please select a category');
      return;
    }

    const payload = {
      description,
      type,
      amount: numAmount,
      categoryId,
      accountId: accountId || null,
      transactionDate: new Date(transactionDate).toISOString(),
    };

    if (editingTx) {
      editMutation.mutate({ id: editingTx.id, payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this transaction record?')) {
      deleteMutation.mutate(id);
    }
  };

  const toggleSort = (field: 'date' | 'amount') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Transaction Ledger
          </h1>
          <p className="text-slate-500 text-sm">
            Log, filter, sort, and manage Income, Expense, and Account Transfer records.
          </p>
        </div>
        <Button variant="primary" onClick={openCreateModal}>
          <Plus size={16} className="mr-2" /> New Transaction
        </Button>
      </div>

      {/* Filter & Search Toolbar */}
      <Card className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-slate-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:border-emerald-500"
            >
              <option value="">All Types</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
              <option value="transfer">Transfer</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Transactions Table Container */}
      <Card className="overflow-hidden p-0">
        {isLoading ? (
          <div className="py-16 text-center text-slate-400 space-y-3">
            <RefreshCw size={24} className="animate-spin mx-auto text-emerald-500" />
            <p className="text-sm font-medium">Loading transaction records...</p>
          </div>
        ) : isError ? (
          <div className="py-16 text-center text-rose-500 space-y-3">
            <AlertCircle size={32} className="mx-auto" />
            <p className="font-bold">Failed to load transactions</p>
            <p className="text-xs text-slate-400">{(error as any)?.message || 'An error occurred'}</p>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Try Again
            </Button>
          </div>
        ) : sortedItems.length === 0 ? (
          <div className="py-16 text-center text-slate-400 space-y-3">
            <p className="text-base font-semibold text-slate-700 dark:text-slate-300">No transactions found</p>
            <p className="text-xs">Try adjusting your search query or log a new transaction.</p>
            <Button variant="outline" size="sm" onClick={openCreateModal}>
              <Plus size={14} className="mr-1" /> New Transaction
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 uppercase text-[11px] tracking-wider border-b border-slate-200 dark:border-slate-800 select-none">
                <tr>
                  <th className="px-6 py-4">Transaction</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Account</th>
                  <th className="px-6 py-4 cursor-pointer hover:text-slate-900 dark:hover:text-slate-100" onClick={() => toggleSort('date')}>
                    <div className="flex items-center gap-1">
                      Date <ArrowUpDown size={12} />
                    </div>
                  </th>
                  <th className="px-6 py-4 text-right cursor-pointer hover:text-slate-900 dark:hover:text-slate-100" onClick={() => toggleSort('amount')}>
                    <div className="flex items-center justify-end gap-1">
                      Amount <ArrowUpDown size={12} />
                    </div>
                  </th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {sortedItems.map((tx) => {
                  const isIncome = tx.type === 'income';
                  const isExpense = tx.type === 'expense';

                  return (
                    <tr key={tx.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-900/60 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`p-2.5 rounded-xl font-bold text-white shadow-sm ${
                              isIncome ? 'bg-emerald-500' : isExpense ? 'bg-rose-500' : 'bg-slate-600'
                            }`}
                          >
                            {isIncome ? <ArrowUpRight size={16} /> : isExpense ? <ArrowDownRight size={16} /> : <ArrowRightLeft size={16} />}
                          </div>
                          <div>
                            <span className="font-semibold text-slate-900 dark:text-slate-100 block">{tx.description}</span>
                            <span className="text-[11px] text-slate-400 capitalize">{tx.type}</span>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {tx.category?.name || 'Uncategorized'}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-xs text-slate-500 font-medium">
                        {tx.account?.name || 'Cash Wallet'}
                      </td>

                      <td className="px-6 py-4 text-xs text-slate-500 font-medium">
                        {new Date(tx.transactionDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>

                      <td className={`px-6 py-4 text-right font-extrabold ${isIncome ? 'text-emerald-600 dark:text-emerald-400' : isExpense ? 'text-slate-900 dark:text-slate-100' : 'text-sky-500'}`}>
                        {isIncome ? '+' : isExpense ? '-' : ''}${Number(tx.amount).toFixed(2)}
                      </td>

                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => openEditModal(tx)}
                            title="Edit Record"
                            className="text-slate-400 hover:text-emerald-500 transition-colors p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                          >
                            <Edit3 size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(tx.id)}
                            title="Delete Record"
                            className="text-slate-400 hover:text-rose-500 transition-colors p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Create / Edit Transaction Modal */}
      {(showModal || editingTx) && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-md space-y-4 shadow-2xl animate-fade-in relative">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {editingTx ? 'Edit Transaction' : 'New Transaction'}
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
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">Description</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bi-weekly Salary, Whole Foods Market"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">Type</label>
                  <select
                    value={type}
                    onChange={(e) => {
                      const newType = e.target.value as 'income' | 'expense' | 'transfer';
                      setType(newType);
                      const matchingCat = categories.find((c) => c.type === newType);
                      if (matchingCat) setCategoryId(matchingCat.id);
                    }}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:border-emerald-500"
                  >
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                    <option value="transfer">Transfer</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">Amount ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">Category</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:border-emerald-500"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.type})
                    </option>
                  ))}
                </select>
              </div>

              {accounts.length > 0 && (
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">Linked Account (Optional)</label>
                  <select
                    value={accountId}
                    onChange={(e) => setAccountId(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:border-emerald-500"
                  >
                    <option value="">No linked account (Unassigned)</option>
                    {accounts.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name} ({a.type})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">Transaction Date</label>
                <input
                  type="date"
                  required
                  value={transactionDate}
                  onChange={(e) => setTransactionDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:border-emerald-500"
                />
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
                  {editingTx
                    ? editMutation.isPending ? 'Saving...' : 'Update Record'
                    : createMutation.isPending ? 'Saving...' : 'Save Transaction'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
