import React, { useEffect, useState } from 'react';
import { apiRequest } from '../api/client';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Users, Plus, Coins, CheckCircle2, DollarSign } from 'lucide-react';

interface Loan {
  id: string;
  counterpartyName: string;
  counterpartyContact?: string;
  type: string; // lent | borrowed
  principalAmount: number;
  interestRate: number;
  status: string;
  notes?: string;
  transactions?: Array<{ id: string; amount: number; paymentDate: string }>;
}

export const LoansPage: React.FC = () => {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [summary, setSummary] = useState({ totalLent: 0, totalBorrowed: 0 });
  const [loading, setLoading] = useState(true);
  const [showLoanModal, setShowLoanModal] = useState(false);
  const [showRepayModal, setShowRepayModal] = useState(false);
  const [selectedLoanId, setSelectedLoanId] = useState<string | null>(null);

  // Form states
  const [counterpartyName, setCounterpartyName] = useState('');
  const [counterpartyContact, setCounterpartyContact] = useState('');
  const [type, setType] = useState('lent');
  const [principalAmount, setPrincipalAmount] = useState('');
  const [repayAmount, setRepayAmount] = useState('');

  const loadLoans = async () => {
    try {
      const res = await apiRequest<{ loans: Loan[]; summary: { totalLent: number; totalBorrowed: number } }>('/lending');
      setLoans(res.loans);
      setSummary(res.summary);
    } catch (_err) {
      // Demo fallback
      setLoans([
        { id: '1', counterpartyName: 'Marcus Wright', counterpartyContact: 'marcus@example.com', type: 'lent', principalAmount: 750.00, interestRate: 0, status: 'active', notes: 'Loan for laptop repair' },
        { id: '2', counterpartyName: 'Elena Rostova', counterpartyContact: 'elena@example.com', type: 'borrowed', principalAmount: 250.00, interestRate: 0, status: 'settled', notes: 'Concert tickets split' },
      ]);
      setSummary({ totalLent: 750.00, totalBorrowed: 0 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLoans();
  }, []);

  const handleCreateLoan = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiRequest('/lending', {
        method: 'POST',
        body: JSON.stringify({
          counterpartyName,
          counterpartyContact,
          type,
          principalAmount: parseFloat(principalAmount),
        }),
      });
      setShowLoanModal(false);
      setCounterpartyName('');
      setCounterpartyContact('');
      setPrincipalAmount('');
      loadLoans();
    } catch (err: any) {
      alert(err.message || 'Failed to create loan record');
    }
  };

  const handleRepay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLoanId) return;
    try {
      await apiRequest(`/lending/${selectedLoanId}/repay`, {
        method: 'POST',
        body: JSON.stringify({ amount: parseFloat(repayAmount) }),
      });
      setShowRepayModal(false);
      setRepayAmount('');
      loadLoans();
    } catch (err: any) {
      alert(err.message || 'Failed to record repayment');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Peer Lending & Borrowing
          </h1>
          <p className="text-slate-500 text-sm">
            Track money lent to friends/family or borrowed funds, repayments, and outstanding balances.
          </p>
        </div>
        <Button variant="primary" onClick={() => setShowLoanModal(true)}>
          <Plus size={16} className="mr-2" /> Record Loan / Debt
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="bg-gradient-to-r from-emerald-900 to-slate-900 text-white p-6 rounded-3xl">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-xs uppercase font-bold text-emerald-400">Total Money Lent Out</span>
              <div className="text-3xl font-extrabold mt-1">${summary.totalLent.toFixed(2)}</div>
            </div>
            <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-2xl">
              <Coins size={24} />
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white p-6 rounded-3xl">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-xs uppercase font-bold text-indigo-400">Total Borrowed Outstanding</span>
              <div className="text-3xl font-extrabold mt-1">${summary.totalBorrowed.toFixed(2)}</div>
            </div>
            <div className="p-3 bg-indigo-500/20 text-indigo-400 rounded-2xl">
              <DollarSign size={24} />
            </div>
          </div>
        </Card>
      </div>

      {/* Loan Cards */}
      {loading ? (
        <div className="py-12 text-center text-slate-400">Loading peer lending records...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {loans.map((loan) => {
            const isLent = loan.type === 'lent';
            const isSettled = loan.status === 'settled';

            return (
              <Card key={loan.id} className="space-y-4 hover:border-emerald-500/40 transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-2xl font-bold text-white ${isLent ? 'bg-emerald-600' : 'bg-indigo-600'}`}>
                      <Users size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-slate-100">{loan.counterpartyName}</h3>
                      <p className="text-xs text-slate-400">{loan.counterpartyContact || 'No contact specified'}</p>
                    </div>
                  </div>
                  <Badge variant={isSettled ? 'success' : 'warning'}>
                    {isSettled ? 'Fully Settled' : 'Active Loan'}
                  </Badge>
                </div>

                <div className="flex items-baseline justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-xs text-slate-400 font-semibold uppercase">{isLent ? 'Principal Lent' : 'Principal Borrowed'}</span>
                  <div className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
                    ${Number(loan.principalAmount).toFixed(2)}
                  </div>
                </div>

                {loan.notes && <p className="text-xs text-slate-500 italic">"{loan.notes}"</p>}

                {!isSettled && (
                  <div className="pt-2">
                    <Button
                      variant="outline"
                      className="w-full text-xs"
                      onClick={() => {
                        setSelectedLoanId(loan.id);
                        setShowRepayModal(true);
                      }}
                    >
                      <CheckCircle2 size={14} className="mr-2" /> Record Repayment
                    </Button>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Create Loan Modal */}
      {showLoanModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-md space-y-4 shadow-2xl animate-fade-in">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Record Peer Loan / Borrow</h3>
            <form onSubmit={handleCreateLoan} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">Counterparty Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Marcus Wright"
                  value={counterpartyName}
                  onChange={(e) => setCounterpartyName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">Loan Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:border-emerald-500"
                >
                  <option value="lent">Money I Lent Out</option>
                  <option value="borrowed">Money I Borrowed</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">Principal Amount ($)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="250.00"
                  value={principalAmount}
                  onChange={(e) => setPrincipalAmount(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowLoanModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary">
                  Save Loan Record
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Repayment Modal */}
      {showRepayModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-md space-y-4 shadow-2xl animate-fade-in">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Record Repayment</h3>
            <form onSubmit={handleRepay} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">Repayment Amount ($)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="100.00"
                  value={repayAmount}
                  onChange={(e) => setRepayAmount(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowRepayModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary">
                  Record Repayment
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
