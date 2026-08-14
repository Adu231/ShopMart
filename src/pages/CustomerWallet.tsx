import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Wallet, Plus, ArrowUpRight, ArrowDownLeft, ShieldCheck, CreditCard, Landmark, CheckCircle2, History, ChevronRight, AlertCircle, RefreshCw, ExternalLink } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { formatPrice, formatDate } from '@/lib/utils';
import CustomerLayout from '@/components/layout/CustomerLayout';
import { BankAccount } from '@/pages/AccountSettings';
import { toast } from 'sonner';
import { api } from '@/services/api';

interface Transaction {
  id: string;
  type: 'credit' | 'debit';
  title: string;
  category: 'refund' | 'add_funds' | 'order_payment' | 'withdrawal';
  amount: number;
  date: string;
  status: 'completed' | 'processing';
  referenceId: string;
}

export default function CustomerWallet() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Wallet Balance State
  const [balance, setBalance] = useState<number>(() => {
    try {
      const stored = localStorage.getItem(`shopmart_wallet_balance_${user?.id || 'guest'}`) || localStorage.getItem('shopmart_wallet_balance');
      const parsed = stored ? parseFloat(stored) : 0;
      return isNaN(parsed) ? 0 : parsed;
    } catch {
      return 0;
    }
  });

  // Wallet Transactions State
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const stored = localStorage.getItem(`shopmart_wallet_txns_${user?.id || 'guest'}`) || localStorage.getItem('shopmart_wallet_txns');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          return parsed.filter((t: any) =>
            t.id &&
            !t.id.startsWith('TXN-98') &&
            !t.title?.includes('Axis Bank') &&
            !t.title?.includes('ICICI Bank')
          );
        }
      }
      return [];
    } catch {
      return [];
    }
  });

  // Saved User Bank Accounts State (From Settings)
  const [savedBankAccounts, setSavedBankAccounts] = useState<BankAccount[]>(() => {
    try {
      const stored = localStorage.getItem('shopmart_user_bank_accounts');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed.filter((b: any) => !['bank-1', 'bank-2'].includes(b.id));
      }
      return [];
    } catch {
      return [];
    }
  });

  const [txnFilter, setTxnFilter] = useState<'all' | 'credit' | 'debit'>('all');
  const [loading, setLoading] = useState(false);

  // Modals
  const [showAddMoneyModal, setShowAddMoneyModal] = useState(false);
  const [addAmount, setAddAmount] = useState<string>('1000');
  const [addPaymentMode, setAddPaymentMode] = useState<string>('upi');

  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState<string>('1000');
  const [selectedBankId, setSelectedBankId] = useState<string>('');

  useEffect(() => {
    if (!isAuthenticated) navigate('/login?redirect=/wallet');
  }, [isAuthenticated]);

  // Fetch live wallet balance and transactions from backend API
  useEffect(() => {
    if (isAuthenticated) {
      setLoading(true);
      api.wallet.get().then(res => {
        setLoading(false);
        if (res && res.success) {
          if (res.balance !== undefined) {
            setBalance(Number(res.balance));
          }
          if (Array.isArray(res.transactions)) {
            setTransactions(res.transactions);
          }
        }
      }).catch(err => {
        setLoading(false);
        console.error('[WALET API FETCH ERROR]', err);
      });
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (user?.id) {
      localStorage.setItem(`shopmart_wallet_balance_${user.id}`, balance.toString());
      localStorage.setItem('shopmart_wallet_balance', balance.toString());
    }
  }, [balance, user?.id]);

  useEffect(() => {
    if (user?.id) {
      localStorage.setItem(`shopmart_wallet_txns_${user.id}`, JSON.stringify(transactions));
      localStorage.setItem('shopmart_wallet_txns', JSON.stringify(transactions));
    }
  }, [transactions, user?.id]);

  // Sync saved bank accounts whenever modal opens
  useEffect(() => {
    try {
      const stored = localStorage.getItem('shopmart_user_bank_accounts');
      if (stored) {
        const parsed = JSON.parse(stored);
        setSavedBankAccounts(parsed);
        if (parsed.length > 0 && !selectedBankId) {
          const defaultAcc = parsed.find((b: BankAccount) => b.isDefault) || parsed[0];
          setSelectedBankId(defaultAcc.id);
        }
      }
    } catch (err) {
      console.error(err);
    }
  }, [showWithdrawModal]);

  if (!isAuthenticated) return null;

  const activeBank = savedBankAccounts.find(b => b.id === selectedBankId) || savedBankAccounts[0];

  // Add Money Handler -> Redirects to Payment Gateway Confirmation Page!
  const handleAddMoney = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(addAmount);
    if (isNaN(amt) || amt <= 0) {
      toast.error('Please enter a valid amount.');
      return;
    }

    sessionStorage.setItem('pending_wallet_topup', JSON.stringify({
      amount: amt,
      paymentMode: addPaymentMode,
    }));
    setShowAddMoneyModal(false);
    navigate('/wallet/payment');
  };

  // Withdraw Money Handler using Dropdown Selected Saved Bank Account!
  const handleWithdrawMoney = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeBank) {
      toast.error('No valid bank account selected.');
      return;
    }

    const amt = parseFloat(withdrawAmount);
    if (isNaN(amt) || amt <= 0) {
      toast.error('Please enter a valid amount.');
      return;
    }
    if (amt > balance) {
      toast.error('Insufficient wallet balance for this withdrawal.');
      return;
    }

    const res = await api.wallet.withdraw(amt, activeBank.bankName, activeBank.accountNumber);
    if (res && res.success) {
      if (res.balance !== undefined) setBalance(Number(res.balance));
      if (res.transaction) {
        setTransactions(prev => [res.transaction, ...prev]);
      }
      toast.success(`Withdrawal of ${formatPrice(amt)} to ${activeBank.bankName} (**** ${activeBank.accountNumber.slice(-4)}) submitted!`);
      setShowWithdrawModal(false);
      setWithdrawAmount('1000');
    } else {
      toast.error(res?.message || 'Withdrawal failed.');
    }
  };

  const filteredTxns = transactions.filter(t => {
    if (txnFilter === 'credit') return t.type === 'credit';
    if (txnFilter === 'debit') return t.type === 'debit';
    return true;
  });

  return (
    <CustomerLayout title="WoodNest Wallet & Refunds" showBackToDashboard>
      {/* Wallet Balance Hero Card */}
      <div className="bg-gradient-to-br from-[#2874F0] via-blue-600 to-indigo-700 rounded-3xl p-6 md:p-8 text-white shadow-xl mb-6 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-blue-200 text-xs font-bold uppercase tracking-wider">
              <Wallet size={16} /> WoodNest Digital Store Wallet
            </div>
            <p className="text-3xl md:text-4xl font-black tracking-tight">{formatPrice(balance)}</p>
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
              <span className="bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                <CheckCircle2 size={12} /> Active & Verified
              </span>
              <span className="bg-white/15 text-blue-100 px-2.5 py-0.5 rounded-full font-medium">
                1-Click Instant Order Checkout Enabled
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setShowAddMoneyModal(true)}
              className="px-5 py-3 bg-white text-[#2874F0] hover:bg-blue-50 font-extrabold rounded-2xl text-xs flex items-center gap-2 shadow-lg transition-all cursor-pointer active:scale-95"
            >
              <Plus size={16} /> Add Money to Wallet
            </button>
            <button
              onClick={() => setShowWithdrawModal(true)}
              className="px-5 py-3 bg-white/20 hover:bg-white/30 text-white font-extrabold rounded-2xl text-xs flex items-center gap-2 backdrop-blur-sm transition-all cursor-pointer active:scale-95"
            >
              <Landmark size={16} /> Withdraw to Bank
            </button>
          </div>
        </div>
      </div>

      {/* Wallet Benefits Banner */}
      <div className="grid sm:grid-cols-3 gap-3 mb-6">
        <div className="bg-card rounded-2xl p-4 border border-border shadow-sm flex items-center gap-3">
          <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl text-emerald-600 shrink-0">
            <ShieldCheck size={20} />
          </div>
          <div>
            <p className="text-xs font-bold text-foreground">Instant Refunds</p>
            <p className="text-[10px] text-muted-foreground">Order cancellations & returns credited in 1 sec</p>
          </div>
        </div>
        <div className="bg-card rounded-2xl p-4 border border-border shadow-sm flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 dark:bg-blue-950/30 rounded-xl text-[#2874F0] shrink-0">
            <CreditCard size={20} />
          </div>
          <div>
            <p className="text-xs font-bold text-foreground">0% Payment Gateway Fee</p>
            <p className="text-[10px] text-muted-foreground">Free top-ups via UPI, Credit & Debit cards</p>
          </div>
        </div>
        <div className="bg-card rounded-2xl p-4 border border-border shadow-sm flex items-center gap-3">
          <div className="p-2.5 bg-purple-50 dark:bg-purple-950/30 rounded-xl text-purple-600 shrink-0">
            <Landmark size={20} />
          </div>
          <div>
            <p className="text-xs font-bold text-foreground font-bold">Linked Bank Accounts</p>
            <p className="text-[10px] text-muted-foreground">{savedBankAccounts.length} account(s) connected in settings</p>
          </div>
        </div>
      </div>

      {/* Wallet Transaction History Table */}
      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-border bg-muted/30 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-foreground text-sm flex items-center gap-2">
              <History size={16} className="text-[#2874F0]" /> Wallet Statement & Transactions
            </h3>
            <p className="text-[11px] text-muted-foreground">Full ledger of refunds, deposits & withdrawals</p>
          </div>

          <div className="flex items-center gap-1.5 bg-background p-1 rounded-xl border border-border text-xs">
            <button
              onClick={() => setTxnFilter('all')}
              className={`px-3 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                txnFilter === 'all' ? 'bg-[#2874F0] text-white shadow-xs' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              All ({transactions.length})
            </button>
            <button
              onClick={() => setTxnFilter('credit')}
              className={`px-3 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                txnFilter === 'credit' ? 'bg-emerald-600 text-white shadow-xs' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Credits (+)
            </button>
            <button
              onClick={() => setTxnFilter('debit')}
              className={`px-3 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                txnFilter === 'debit' ? 'bg-rose-600 text-white shadow-xs' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Debits (-)
            </button>
          </div>
        </div>

        {filteredTxns.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            <History size={48} className="mx-auto mb-2 opacity-50" />
            <p className="font-semibold text-xs">No transaction records found</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredTxns.map(txn => (
              <div key={txn.id} className="p-4 hover:bg-muted/40 transition-colors flex items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className={`p-2.5 rounded-xl shrink-0 ${
                    txn.type === 'credit' ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600' : 'bg-rose-100 dark:bg-rose-950/40 text-rose-600'
                  }`}>
                    {txn.type === 'credit' ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-foreground truncate">{txn.title}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      Ref: <span className="font-mono">{txn.referenceId}</span> · {formatDate(txn.date)}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <p className={`font-black text-sm ${
                    txn.type === 'credit' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                  }`}>
                    {txn.type === 'credit' ? '+' : '-'}{formatPrice(txn.amount)}
                  </p>
                  <span className="text-[9px] px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 rounded-full font-bold uppercase tracking-wider inline-block mt-0.5">
                    ● {txn.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 1. ADD MONEY MODAL */}
      {showAddMoneyModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                <Plus className="text-[#2874F0]" size={18} /> Add Money to WoodNest Wallet
              </h3>
              <button onClick={() => setShowAddMoneyModal(false)} className="text-muted-foreground hover:text-foreground">
                ✕
              </button>
            </div>

            <form onSubmit={handleAddMoney} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-foreground mb-1.5">Select Top-Up Amount (₹)</label>
                <div className="grid grid-cols-4 gap-2 mb-3">
                  {['500', '1000', '2500', '5000'].map(amt => (
                    <button
                      type="button"
                      key={amt}
                      onClick={() => setAddAmount(amt)}
                      className={`py-2 rounded-xl font-bold transition-all border cursor-pointer ${
                        addAmount === amt
                          ? 'bg-[#2874F0] text-white border-[#2874F0] shadow-sm'
                          : 'bg-background border-border text-foreground hover:bg-muted'
                      }`}
                    >
                      ₹{amt}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  min="1"
                  required
                  value={addAmount}
                  onChange={e => setAddAmount(e.target.value)}
                  placeholder="Enter custom amount"
                  className="w-full bg-background border border-border rounded-xl p-3 text-foreground font-bold outline-none focus:ring-2 focus:ring-[#2874F0]/30"
                />
              </div>

              <div>
                <label className="block font-semibold text-foreground mb-1.5">Select Preferred Payment Mode</label>
                <select
                  value={addPaymentMode}
                  onChange={e => setAddPaymentMode(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-foreground outline-none font-medium"
                >
                  <option value="upi">UPI (Google Pay / PhonePe / Paytm)</option>
                  <option value="credit_card">Credit / Debit Card (16-Digit Verification)</option>
                  <option value="net_banking">Net Banking (All Major Indian Banks)</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddMoneyModal(false)}
                  className="flex-1 bg-muted text-foreground font-semibold py-2.5 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#2874F0] hover:bg-blue-600 text-white font-bold py-2.5 rounded-xl transition-colors shadow-md cursor-pointer flex items-center justify-center gap-1"
                >
                  Proceed to Payment Gateway <ChevronRight size={14} />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. WITHDRAW MONEY MODAL (UPDATED TO USE SAVED BANK ACCOUNTS DROPDOWN OR REDIRECT TO SETTINGS) */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                <Landmark className="text-purple-600" size={18} /> Withdraw Funds to Bank
              </h3>
              <button onClick={() => setShowWithdrawModal(false)} className="text-muted-foreground hover:text-foreground">
                ✕
              </button>
            </div>

            <div className="bg-purple-50 dark:bg-purple-950/30 p-3 rounded-xl border border-purple-200 dark:border-purple-900 text-[11px]">
              <span className="font-bold text-purple-900 dark:text-purple-200 block">Available Balance: {formatPrice(balance)}</span>
              <span className="text-muted-foreground">0% Transfer Fee · Direct NEFT/IMPS transfer to verified bank</span>
            </div>

            {/* IF NO SAVED BANK ACCOUNTS FOUND */}
            {savedBankAccounts.length === 0 ? (
              <div className="p-6 text-center space-y-3 bg-muted/30 rounded-xl border border-dashed border-border">
                <AlertCircle size={36} className="mx-auto text-amber-500" />
                <p className="font-extrabold text-foreground text-sm">No Linked Bank Account Found</p>
                <p className="text-xs text-muted-foreground">
                  You have not added any bank account to your profile yet. Please add a bank account in Account Settings to enable withdrawals.
                </p>
                <button
                  type="button"
                  onClick={() => { setShowWithdrawModal(false); navigate('/settings'); }}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-md"
                >
                  <Plus size={14} /> Add Bank Account in Settings <ExternalLink size={13} />
                </button>
              </div>
            ) : (
              /* IF SAVED BANK ACCOUNTS EXIST -> SHOW DROPDOWN */
              <form onSubmit={handleWithdrawMoney} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-semibold text-foreground mb-1">Select Destination Bank Account</label>
                  <select
                    value={selectedBankId}
                    onChange={e => setSelectedBankId(e.target.value)}
                    className="w-full bg-background border border-border rounded-xl p-3 text-foreground font-bold outline-none focus:ring-2 focus:ring-purple-500/30"
                  >
                    {savedBankAccounts.map(acc => (
                      <option key={acc.id} value={acc.id}>
                        {acc.bankName} — A/C **** {acc.accountNumber.slice(-4)} ({acc.accountHolder}) {acc.isDefault ? '[Primary]' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Selected Bank Details Preview Card */}
                {activeBank && (
                  <div className="bg-card p-3 rounded-xl border border-border text-[11px] space-y-0.5">
                    <p className="font-bold text-foreground">{activeBank.bankName} (Verified)</p>
                    <p className="text-muted-foreground font-mono">Account Number: **** {activeBank.accountNumber.slice(-4)}</p>
                    <p className="text-muted-foreground">Account Holder: {activeBank.accountHolder}</p>
                    <p className="text-muted-foreground font-mono">IFSC Code: {activeBank.ifscCode}</p>
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-semibold text-foreground">Withdrawal Amount (₹)</label>
                    <button
                      type="button"
                      onClick={() => navigate('/settings')}
                      className="text-[10px] text-purple-600 hover:underline font-bold"
                    >
                      + Manage Accounts in Settings
                    </button>
                  </div>
                  <input
                    type="number"
                    min="1"
                    max={balance}
                    required
                    value={withdrawAmount}
                    onChange={e => setWithdrawAmount(e.target.value)}
                    className="w-full bg-background border border-border rounded-xl p-2.5 text-foreground font-bold outline-none focus:ring-2 focus:ring-purple-500/30"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowWithdrawModal(false)}
                    className="flex-1 bg-muted text-foreground font-semibold py-2.5 rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold py-2.5 rounded-xl transition-colors shadow-md cursor-pointer"
                  >
                    Confirm & Withdraw
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </CustomerLayout>
  );
}
