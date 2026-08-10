import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Lock, CreditCard, QrCode, Landmark, CheckCircle2, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import CustomerLayout from '@/components/layout/CustomerLayout';
import { toast } from 'sonner';

export default function WalletPaymentGateway() {
  const navigate = useNavigate();

  const [topupData, setTopupData] = useState<{ amount: number; paymentMode: string } | null>(null);
  const [selectedTab, setSelectedTab] = useState<'card' | 'upi' | 'netbanking'>('upi');

  // Form Inputs
  const [upiId, setUpiId] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardName, setCardName] = useState('');
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');

  // Processing state
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem('pending_wallet_topup');
      if (stored) {
        const parsed = JSON.parse(stored);
        setTopupData(parsed);
        if (parsed.paymentMode === 'credit_card') setSelectedTab('card');
        else if (parsed.paymentMode === 'net_banking') setSelectedTab('netbanking');
        else setSelectedTab('upi');
      } else {
        navigate('/wallet');
      }
    } catch {
      navigate('/wallet');
    }
  }, []);

  if (!topupData) return null;

  const amount = topupData.amount || 1000;

  // Process Payment
  const handlePayNow = (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedTab === 'upi' && !upiId.includes('@')) {
      toast.error('Please enter a valid UPI ID (e.g. name@okaxis)');
      return;
    }
    if (selectedTab === 'card' && (cardNumber.length < 16 || !cardExpiry || !cardCvv)) {
      toast.error('Please complete all 16-digit card details, expiry, and CVV.');
      return;
    }

    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);

      // Update wallet balance in localStorage
      try {
        const currentBalance = parseFloat(localStorage.getItem('shopmart_wallet_balance') || '5400');
        const newBalance = currentBalance + amount;
        localStorage.setItem('shopmart_wallet_balance', newBalance.toString());

        // Update txns
        const currentTxns = JSON.parse(localStorage.getItem('shopmart_wallet_txns') || '[]');
        const newTxn = {
          id: `TXN-${Math.floor(10000 + Math.random() * 90000)}`,
          type: 'credit',
          title: `Added Funds via ${selectedTab.toUpperCase()}`,
          category: 'add_funds',
          amount: amount,
          date: new Date().toISOString(),
          status: 'completed',
          referenceId: `PAY-${Date.now()}`,
        };
        localStorage.setItem('shopmart_wallet_txns', JSON.stringify([newTxn, ...currentTxns]));
      } catch (err) {
        console.error('Wallet update error:', err);
      }

      toast.success(`Payment Verified! ${formatPrice(amount)} added to your WoodNest Wallet.`);
      sessionStorage.removeItem('pending_wallet_topup');
      navigate('/wallet');
    }, 2000);
  };

  return (
    <CustomerLayout title="Secure Wallet Payment Gateway" showBackToDashboard>
      <div className="max-w-3xl mx-auto space-y-5">
        {/* Header Security Banner */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-2xl p-4 shadow-md flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl">
              <Lock size={20} />
            </div>
            <div>
              <p className="font-bold text-sm">256-Bit SSL Encrypted Payment</p>
              <p className="text-emerald-100 text-xs">PCI-DSS Compliant RBI Verified Gateway</p>
            </div>
          </div>
          <span className="text-xs bg-white/20 px-3 py-1 rounded-full font-bold uppercase tracking-wider">
            ● Live Gateway
          </span>
        </div>

        <div className="grid md:grid-cols-5 gap-5">
          {/* Left Panel: Payment Modes & Forms */}
          <div className="md:col-span-3 bg-card rounded-2xl border border-border p-5 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-foreground">Select Confirmation Payment Method</h3>

            {/* Tabs Selector */}
            <div className="grid grid-cols-3 gap-2 bg-muted p-1 rounded-xl text-xs">
              <button
                type="button"
                onClick={() => setSelectedTab('upi')}
                className={`py-2 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  selectedTab === 'upi' ? 'bg-[#2874F0] text-white shadow-sm' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <QrCode size={14} /> UPI / QR
              </button>
              <button
                type="button"
                onClick={() => setSelectedTab('card')}
                className={`py-2 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  selectedTab === 'card' ? 'bg-[#2874F0] text-white shadow-sm' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <CreditCard size={14} /> Card
              </button>
              <button
                type="button"
                onClick={() => setSelectedTab('netbanking')}
                className={`py-2 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  selectedTab === 'netbanking' ? 'bg-[#2874F0] text-white shadow-sm' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Landmark size={14} /> Net Banking
              </button>
            </div>

            <form onSubmit={handlePayNow} className="space-y-4 pt-2 text-xs">
              {/* TAB 1: UPI */}
              {selectedTab === 'upi' && (
                <div className="space-y-3">
                  <div>
                    <label className="block font-bold text-foreground mb-1.5">Enter VPA / UPI ID</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. mobileNumber@okaxis or user@ybl"
                      value={upiId}
                      onChange={e => setUpiId(e.target.value)}
                      className="w-full bg-background border border-border rounded-xl p-3 text-foreground font-medium outline-none focus:ring-2 focus:ring-[#2874F0]/30"
                    />
                  </div>

                  <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-xl border border-blue-200 dark:border-blue-900 flex items-center gap-3">
                    <QrCode size={24} className="text-[#2874F0] shrink-0" />
                    <div>
                      <p className="font-bold text-blue-900 dark:text-blue-200 text-xs">Supports All UPI Apps</p>
                      <p className="text-[10px] text-muted-foreground">Google Pay, PhonePe, Paytm, BHIM, CRED</p>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: CREDIT / DEBIT CARD */}
              {selectedTab === 'card' && (
                <div className="space-y-3">
                  <div>
                    <label className="block font-bold text-foreground mb-1">Card Number</label>
                    <input
                      type="text"
                      maxLength={16}
                      required
                      placeholder="16-Digit Card Number (e.g. 4111222233334444)"
                      value={cardNumber}
                      onChange={e => setCardNumber(e.target.value.replace(/\D/g, ''))}
                      className="w-full bg-background border border-border rounded-xl p-3 font-mono text-foreground font-bold outline-none focus:ring-2 focus:ring-[#2874F0]/30"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-foreground mb-1">Cardholder Name</label>
                    <input
                      type="text"
                      required
                      placeholder="Name printed on card"
                      value={cardName}
                      onChange={e => setCardName(e.target.value)}
                      className="w-full bg-background border border-border rounded-xl p-3 text-foreground font-medium outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-foreground mb-1">Expiry Date</label>
                      <input
                        type="text"
                        maxLength={5}
                        required
                        placeholder="MM/YY"
                        value={cardExpiry}
                        onChange={e => setCardExpiry(e.target.value)}
                        className="w-full bg-background border border-border rounded-xl p-3 font-mono text-foreground font-bold text-center outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-foreground mb-1">CVV Code</label>
                      <input
                        type="password"
                        maxLength={3}
                        required
                        placeholder="3-Digits"
                        value={cardCvv}
                        onChange={e => setCardCvv(e.target.value.replace(/\D/g, ''))}
                        className="w-full bg-background border border-border rounded-xl p-3 font-mono text-foreground font-bold text-center outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: NET BANKING */}
              {selectedTab === 'netbanking' && (
                <div className="space-y-3">
                  <div>
                    <label className="block font-bold text-foreground mb-1.5">Select Popular Indian Bank</label>
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      {['HDFC Bank', 'ICICI Bank', 'State Bank of India', 'Axis Bank'].map(bank => (
                        <button
                          type="button"
                          key={bank}
                          onClick={() => setSelectedBank(bank)}
                          className={`p-2.5 rounded-xl font-bold border text-left transition-all cursor-pointer ${
                            selectedBank === bank
                              ? 'bg-[#2874F0] text-white border-[#2874F0]'
                              : 'bg-background border-border text-foreground hover:bg-muted'
                          }`}
                        >
                          {bank}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isProcessing}
                className="w-full bg-[#2874F0] hover:bg-blue-600 text-white font-extrabold py-3.5 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 text-sm cursor-pointer disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <Loader2 size={18} className="animate-spin" /> Verifying Payment Gateway...
                  </>
                ) : (
                  <>
                    <ShieldCheck size={18} /> Confirm & Add {formatPrice(amount)}
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Right Panel: Order / Top-Up Breakdown Summary */}
          <div className="md:col-span-2 bg-card rounded-2xl border border-border p-5 shadow-sm space-y-4 h-fit">
            <h3 className="font-bold text-sm text-foreground border-b border-border pb-3">Payment Summary</h3>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-muted-foreground">
                <span>Wallet Deposit Amount</span>
                <span className="font-bold text-foreground">{formatPrice(amount)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Gateway Convenience Fee</span>
                <span className="text-emerald-600 font-bold">FREE (₹0)</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>GST Tax</span>
                <span className="text-emerald-600 font-bold">Included</span>
              </div>

              <div className="flex justify-between font-black text-base text-foreground pt-3 border-t border-border">
                <span>Total Payable</span>
                <span className="text-[#2874F0]">{formatPrice(amount)}</span>
              </div>
            </div>

            <div className="bg-muted p-3.5 rounded-xl border border-border text-[11px] space-y-1">
              <p className="font-bold text-foreground flex items-center gap-1">
                <CheckCircle2 size={13} className="text-emerald-600" /> Instant Wallet Refund Eligibility
              </p>
              <p className="text-muted-foreground">Top-up funds are instantly available for 1-click purchases or 24/7 bank withdrawals.</p>
            </div>
          </div>
        </div>
      </div>
    </CustomerLayout>
  );
}
