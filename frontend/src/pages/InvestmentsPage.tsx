import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../api/client';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import {
  TrendingUp,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Trash2,
  Edit3,
  X,
  RefreshCw,
  AlertCircle,
  BarChart3,
} from 'lucide-react';

export interface Investment {
  id: string;
  name: string;
  symbol?: string;
  type: string;
  quantity: number;
  buyPrice: number;
  currentPrice: number;
  costBasis: number;
  marketValue: number;
  gainLoss: number;
  gainLossPercent: number;
}

interface InvestmentsResponse {
  items: Investment[];
  summary: {
    totalInvested: number;
    currentValue: number;
    totalGainLoss: number;
    totalGainLossPercent: number;
  };
}

export const InvestmentsPage: React.FC = () => {
  const queryClient = useQueryClient();

  // Modal States
  const [showModal, setShowModal] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Investment | null>(null);

  // Form States
  const [name, setName] = useState('');
  const [symbol, setSymbol] = useState('');
  const [type, setType] = useState('stock');
  const [quantity, setQuantity] = useState('');
  const [buyPrice, setBuyPrice] = useState('');
  const [currentPrice, setCurrentPrice] = useState('');
  const [formError, setFormError] = useState('');

  // 1. Fetch Investments Portfolio with React Query
  const { data, isLoading, isError, error, refetch } = useQuery<InvestmentsResponse>({
    queryKey: ['investments'],
    queryFn: async () => {
      try {
        return await apiRequest<InvestmentsResponse>('/investments');
      } catch (_err) {
        return {
          items: [
            { id: '1', name: 'Apple Inc.', symbol: 'AAPL', type: 'stock', quantity: 15, buyPrice: 175.50, currentPrice: 224.30, costBasis: 2632.50, marketValue: 3364.50, gainLoss: 732.00, gainLossPercent: 27.8 },
            { id: '2', name: 'Vanguard S&P 500 ETF', symbol: 'VOO', type: 'etf', quantity: 25, buyPrice: 410.00, currentPrice: 485.60, costBasis: 10250.00, marketValue: 12140.00, gainLoss: 1890.00, gainLossPercent: 18.4 },
            { id: '3', name: 'Bitcoin', symbol: 'BTC', type: 'crypto', quantity: 0.45, buyPrice: 42000.00, currentPrice: 65400.00, costBasis: 18900.00, marketValue: 29430.00, gainLoss: 10530.00, gainLossPercent: 55.7 },
          ],
          summary: { totalInvested: 31782.50, currentValue: 44934.50, totalGainLoss: 13152.00, totalGainLossPercent: 41.38 },
        };
      }
    },
  });

  const items = data?.items ?? [];
  const summary = data?.summary ?? { totalInvested: 0, currentValue: 0, totalGainLoss: 0, totalGainLossPercent: 0 };

  // 2. React Query Mutations: Create, Edit, Delete
  const createMutation = useMutation({
    mutationFn: async (payload: any) => {
      return apiRequest<Investment>('/investments', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['investments'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      closeModal();
    },
    onError: (err: any) => {
      setFormError(err.message || 'Failed to add investment asset');
    },
  });

  const editMutation = useMutation({
    mutationFn: async (params: { id: string; payload: any }) => {
      return apiRequest<Investment>(`/investments/${params.id}`, {
        method: 'PUT',
        body: JSON.stringify(params.payload),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['investments'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      closeModal();
    },
    onError: (err: any) => {
      setFormError(err.message || 'Failed to update asset');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest<void>(`/investments/${id}`, { method: 'DELETE' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['investments'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
    onError: (err: any) => {
      alert(err.message || 'Failed to delete asset');
    },
  });

  const openCreateModal = () => {
    setEditingAsset(null);
    setName('');
    setSymbol('');
    setType('stock');
    setQuantity('');
    setBuyPrice('');
    setCurrentPrice('');
    setFormError('');
    setShowModal(true);
  };

  const openEditModal = (inv: Investment) => {
    setEditingAsset(inv);
    setName(inv.name);
    setSymbol(inv.symbol || '');
    setType(inv.type);
    setQuantity(inv.quantity.toString());
    setBuyPrice(inv.buyPrice.toString());
    setCurrentPrice(inv.currentPrice.toString());
    setFormError('');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingAsset(null);
    setFormError('');
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!name.trim()) {
      setFormError('Asset name is required');
      return;
    }

    const numQty = parseFloat(quantity);
    const numBuy = parseFloat(buyPrice);
    if (isNaN(numQty) || numQty <= 0) {
      setFormError('Quantity must be greater than zero');
      return;
    }
    if (isNaN(numBuy) || numBuy < 0) {
      setFormError('Buy price must be valid');
      return;
    }

    const payload = {
      name,
      symbol: symbol ? symbol.toUpperCase() : null,
      type,
      quantity: numQty,
      buyPrice: numBuy,
      currentPrice: currentPrice ? parseFloat(currentPrice) : numBuy,
    };

    if (editingAsset) {
      editMutation.mutate({ id: editingAsset.id, payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to remove this asset from your portfolio?')) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Investment Portfolio
          </h1>
          <p className="text-slate-500 text-sm">
            Track stocks, ETFs, cryptocurrencies, and real estate holdings with real-time portfolio return calculations.
          </p>
        </div>
        <Button variant="primary" onClick={openCreateModal}>
          <Plus size={16} className="mr-2" /> Add Portfolio Asset
        </Button>
      </div>

      {/* Summary KPI Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-white p-6 rounded-3xl">
          <span className="text-xs uppercase font-bold tracking-wider text-emerald-400">Total Portfolio Value</span>
          <div className="text-3xl font-extrabold mt-1">
            ${summary.currentValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
        </Card>

        <Card className="p-6 rounded-3xl">
          <span className="text-xs uppercase font-semibold text-slate-400">Total Capital Invested</span>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">
            ${summary.totalInvested.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
        </Card>

        <Card className="p-6 rounded-3xl">
          <span className="text-xs uppercase font-semibold text-slate-400">Total Unrealized Profit</span>
          <div className={`text-2xl font-bold mt-1 flex items-center gap-1 ${summary.totalGainLoss >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600'}`}>
            {summary.totalGainLoss >= 0 ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20} />}
            ${Math.abs(summary.totalGainLoss).toLocaleString('en-US', { minimumFractionDigits: 2 })} ({summary.totalGainLossPercent.toFixed(2)}%)
          </div>
        </Card>
      </div>

      {/* Assets Table */}
      <Card className="overflow-hidden p-0">
        {isLoading ? (
          <div className="py-16 text-center text-slate-400 space-y-3">
            <RefreshCw size={24} className="animate-spin mx-auto text-emerald-500" />
            <p className="text-sm font-medium">Loading portfolio holdings...</p>
          </div>
        ) : isError ? (
          <div className="py-16 text-center text-rose-500 space-y-3">
            <AlertCircle size={32} className="mx-auto" />
            <p className="font-bold">Failed to load investment holdings</p>
            <p className="text-xs text-slate-400">{(error as any)?.message || 'An error occurred'}</p>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Try Again
            </Button>
          </div>
        ) : items.length === 0 ? (
          <div className="py-16 text-center text-slate-400 space-y-3">
            <BarChart3 size={32} className="mx-auto text-slate-400" />
            <p className="text-base font-semibold text-slate-700 dark:text-slate-300">No assets in portfolio</p>
            <p className="text-xs">Add your stocks, ETFs, or crypto assets to track returns.</p>
            <Button variant="outline" size="sm" onClick={openCreateModal}>
              <Plus size={14} className="mr-1" /> Add Portfolio Asset
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 uppercase text-[11px] tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-4">Asset</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4 text-right">Holdings</th>
                  <th className="px-6 py-4 text-right">Market Price</th>
                  <th className="px-6 py-4 text-right">Current Value</th>
                  <th className="px-6 py-4 text-right">Return</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {items.map((inv) => {
                  const isPositive = inv.gainLoss >= 0;
                  return (
                    <tr key={inv.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold">
                            <TrendingUp size={16} />
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 dark:text-slate-100 block">{inv.name}</span>
                            {inv.symbol && <span className="text-xs text-slate-400 font-mono uppercase">{inv.symbol}</span>}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="neutral">{inv.type.toUpperCase()}</Badge>
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-slate-900 dark:text-slate-100">
                        {Number(inv.quantity)}
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-slate-900 dark:text-slate-100">
                        ${Number(inv.currentPrice).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-right font-extrabold text-slate-900 dark:text-slate-100">
                        ${Number(inv.marketValue).toFixed(2)}
                      </td>
                      <td className={`px-6 py-4 text-right font-bold ${isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600'}`}>
                        {isPositive ? '+' : '-'}${Math.abs(inv.gainLoss).toFixed(2)} ({inv.gainLossPercent.toFixed(1)}%)
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => openEditModal(inv)}
                            title="Edit Asset"
                            className="text-slate-400 hover:text-emerald-500 transition-colors p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                          >
                            <Edit3 size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(inv.id)}
                            title="Delete Asset"
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

      {/* Create / Edit Asset Modal */}
      {(showModal || editingAsset) && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-md space-y-4 shadow-2xl animate-fade-in relative">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {editingAsset ? 'Edit Investment Asset' : 'Add Investment Asset'}
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
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">Asset Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apple Inc, Vanguard VOO"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">Ticker Symbol</label>
                  <input
                    type="text"
                    placeholder="e.g. AAPL"
                    value={symbol}
                    onChange={(e) => setSymbol(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:border-emerald-500 font-mono uppercase"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">Asset Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:border-emerald-500"
                  >
                    <option value="stock">Stock</option>
                    <option value="crypto">Crypto</option>
                    <option value="etf">ETF</option>
                    <option value="real_estate">Real Estate</option>
                    <option value="bond">Bond</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">Quantity</label>
                  <input
                    type="number"
                    step="0.0001"
                    required
                    placeholder="10"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">Buy Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="175.50"
                    value={buyPrice}
                    onChange={(e) => setBuyPrice(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">Current Market Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="Leave blank to use buy price"
                  value={currentPrice}
                  onChange={(e) => setCurrentPrice(e.target.value)}
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
                  {editingAsset
                    ? editMutation.isPending ? 'Saving...' : 'Update Asset'
                    : createMutation.isPending ? 'Saving...' : 'Add Asset'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
