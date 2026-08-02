import React, { useEffect, useState } from 'react';
import { apiRequest } from '../api/client';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Wallet, Plus, CreditCard, Landmark, Trash2 } from 'lucide-react';

interface Account {
  id: string;
  name: string;
  type: string;
  balance: number;
  currency: string;
  institution?: string;
  accountNumber?: string;
}

export const AccountsPage: React.FC = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [netBalance, setNetBalance] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [type, setType] = useState('checking');
  const [balance, setBalance] = useState('');
  const [institution, setInstitution] = useState('');

  const loadAccounts = async () => {
    try {
      const res = await apiRequest<{ accounts: Account[]; netBalance: number }>('/accounts');
      setAccounts(res.accounts);
      setNetBalance(res.netBalance);
    } catch (_err) {
      // Demo fallback
      setAccounts([
        { id: '1', name: 'Primary Checking', type: 'checking', balance: 8450.00, currency: 'USD', institution: 'Chase Bank', accountNumber: '****4821' },
        { id: '2', name: 'High Yield Savings', type: 'savings', balance: 14200.50, currency: 'USD', institution: 'Marcus by Goldman', accountNumber: '****9104' },
        { id: '3', name: 'Sapphire Credit Card', type: 'credit_card', balance: -1250.00, currency: 'USD', institution: 'Chase Bank', accountNumber: '****3390' },
      ]);
      setNetBalance(21400.50);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAccounts();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiRequest('/accounts', {
        method: 'POST',
        body: JSON.stringify({
          name,
          type,
          balance: parseFloat(balance || '0'),
          institution,
        }),
      });
      setShowModal(false);
      setName('');
      setBalance('');
      setInstitution('');
      loadAccounts();
    } catch (err: any) {
      alert(err.message || 'Failed to create account');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this account?')) return;
    try {
      await apiRequest(`/accounts/${id}`, { method: 'DELETE' });
      loadAccounts();
    } catch (err: any) {
      alert(err.message || 'Failed to delete account');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Accounts & Balances
          </h1>
          <p className="text-slate-500 text-sm">
            Manage your bank accounts, credit cards, investment accounts, and cash reserves in one place.
          </p>
        </div>
        <Button variant="primary" onClick={() => setShowModal(true)}>
          <Plus size={16} className="mr-2" /> Add New Account
        </Button>
      </div>

      {/* Net Balance Card */}
      <Card className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white p-6 rounded-3xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1">
            <span className="text-xs uppercase font-bold tracking-widest text-emerald-400">Aggregated Liquidity</span>
            <div className="text-3xl md:text-4xl font-extrabold">${netBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
          </div>
          <Badge variant="success" className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-xs py-1.5 px-3">
            {accounts.length} Connected Accounts
          </Badge>
        </div>
      </Card>

      {/* Accounts List Grid */}
      {loading ? (
        <div className="py-12 text-center text-slate-400">Loading accounts...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {accounts.map((acc) => {
            const isNegative = acc.balance < 0;
            return (
              <Card key={acc.id} className="space-y-4 hover:border-emerald-500/50 transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-600 dark:text-emerald-400 font-bold">
                      {acc.type === 'credit_card' ? <CreditCard size={20} /> : acc.type === 'savings' ? <Landmark size={20} /> : <Wallet size={20} />}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-slate-100">{acc.name}</h3>
                      <p className="text-xs text-slate-400">{acc.institution || 'Direct Financial Institution'}</p>
                    </div>
                  </div>
                  <button onClick={() => handleDelete(acc.id)} className="text-slate-400 hover:text-rose-500 transition-colors p-1">
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="pt-2 flex items-baseline justify-between">
                  <span className="text-xs text-slate-400 uppercase font-semibold">{acc.type.replace('_', ' ')}</span>
                  <div className={`text-xl font-extrabold ${isNegative ? 'text-rose-500' : 'text-slate-900 dark:text-slate-100'}`}>
                    ${Math.abs(acc.balance).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </div>
                </div>

                {acc.accountNumber && (
                  <div className="text-[11px] text-slate-400 font-mono tracking-wider">
                    {acc.accountNumber}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Add Account Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-md space-y-4 shadow-2xl animate-fade-in">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Add Financial Account</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">Account Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Primary Checking"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">Account Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:border-emerald-500"
                >
                  <option value="checking">Checking Account</option>
                  <option value="savings">Savings Account</option>
                  <option value="credit_card">Credit Card</option>
                  <option value="investment">Investment Account</option>
                  <option value="cash">Cash Wallet</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">Initial Balance ($)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="0.00"
                  value={balance}
                  onChange={(e) => setBalance(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">Institution Name</label>
                <input
                  type="text"
                  placeholder="e.g. Chase Bank, Fidelity"
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary">
                  Create Account
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
