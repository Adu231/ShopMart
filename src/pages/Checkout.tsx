import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, MapPin, CreditCard, Package, ChevronRight, QrCode, Landmark, Wallet, ShieldCheck, Lock, Loader2, AlertCircle, Info, DollarSign, X } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { formatPrice, getEstimatedDelivery } from '@/lib/utils';
import type { Address } from '@/types';
import { toast } from 'sonner';

const STEPS = ['Address', 'Payment', 'Summary'];

export default function Checkout() {
  const [step, setStep] = useState(0);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [newAddr, setNewAddr] = useState({ name: '', phone: '', street: '', city: '', state: '', pincode: '' });
  const [showNewAddr, setShowNewAddr] = useState(false);
  const navigate = useNavigate();
  const { items, subtotal, placeOrder } = useCart();
  const { user, isAuthenticated, addresses, addAddress } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      toast.info('Please sign in first to access checkout.');
      navigate('/login?redirect=/checkout', { replace: true });
    } else if (user?.role === 'admin') {
      toast.info('Checkout is restricted to Customer accounts.');
      navigate('/admin', { replace: true });
    } else if (user?.role === 'seller') {
      toast.info('Checkout is restricted to Customer accounts.');
      navigate('/seller', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  // Payment Verification Modal State for online modes (card, upi, netbanking)
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Form Inputs for Payment Gateway Verification
  const [upiId, setUpiId] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardName, setCardName] = useState('');
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');

  // Wallet Balance from LocalStorage
  const walletBalance = parseFloat(localStorage.getItem('shopmart_wallet_balance') || '0');

  // Charges Calculation
  const delivery = subtotal >= 499 ? 0 : 40;
  const cashHandlingFee = paymentMethod === 'cod' ? 49 : 0;
  const total = subtotal + delivery + cashHandlingFee;

  const handleAddAddress = () => {
    if (!newAddr.name || !newAddr.street || !newAddr.city || !newAddr.pincode) return;
    addAddress({ ...newAddr, isDefault: addresses.length === 0 });
    setShowNewAddr(false);
  };

  // Final Order Placement Execution
  const executeOrderPlacement = () => {
    if (!selectedAddress) return;

    // Deduct from wallet if wallet selected
    if (paymentMethod === 'wallet') {
      if (walletBalance < total) {
        toast.error('Insufficient WoodNest Wallet balance!');
        return;
      }
      localStorage.setItem('shopmart_wallet_balance', (walletBalance - total).toString());
    }

    const orderId = placeOrder({
      items,
      status: 'placed',
      totalAmount: total,
      address: selectedAddress,
      paymentMethod: paymentMethod === 'cod' ? 'Cash on Delivery (+₹49 Handling Fee)' : paymentMethod.toUpperCase(),
      estimatedDelivery: getEstimatedDelivery(),
    });

    toast.success('Order placed successfully!');
    navigate(`/order-success/${orderId}`);
  };

  // Handle Place Order Click from Summary / Payment Step
  const handleInitiateOrder = () => {
    if (!selectedAddress) {
      toast.error('Please select a delivery address first.');
      setStep(0);
      return;
    }

    if (paymentMethod === 'cod' || paymentMethod === 'wallet') {
      executeOrderPlacement();
    } else {
      // Open Payment Verification Modal for online payment modes (UPI, Card, NetBanking)
      setShowPaymentModal(true);
    }
  };

  // Submit Payment Gateway Form inside Verification Modal
  const handleConfirmOnlinePayment = (e: React.FormEvent) => {
    e.preventDefault();

    if (paymentMethod === 'upi' && !upiId.includes('@')) {
      toast.error('Please enter a valid UPI VPA ID (e.g. name@okaxis)');
      return;
    }
    if (paymentMethod === 'card' && (cardNumber.length < 16 || !cardExpiry || !cardCvv)) {
      toast.error('Please enter complete 16-digit card number, MM/YY expiry, and CVV code.');
      return;
    }

    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      setShowPaymentModal(false);
      executeOrderPlacement();
    }, 1800);
  };

  if (items.length === 0) { navigate('/cart'); return null; }

  const stepContent = [
    // Step 0: Address
    <div key="addr">
      <h2 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
        <MapPin size={18} className="text-[#2874F0]" /> Delivery Address
      </h2>
      <div className="space-y-3 mb-4">
        {addresses.map(addr => (
          <label key={addr.id} className={`flex gap-3 p-4 border-2 rounded-xl cursor-pointer transition-colors ${selectedAddress?.id === addr.id ? 'border-[#2874F0] bg-blue-50 dark:bg-blue-950/30' : 'border-border hover:border-blue-300'}`}>
            <input type="radio" name="address" checked={selectedAddress?.id === addr.id} onChange={() => setSelectedAddress(addr)} className="mt-1 accent-[#2874F0]" />
            <div className="text-sm">
              <p className="font-semibold text-foreground">{addr.name} <span className="text-muted-foreground font-normal">· {addr.phone}</span></p>
              <p className="text-muted-foreground">{addr.street}, {addr.city}, {addr.state} - {addr.pincode}</p>
              {addr.isDefault && <span className="text-[10px] bg-blue-100 dark:bg-blue-900 text-[#2874F0] px-1.5 py-0.5 rounded mt-1 inline-block font-bold">Default</span>}
            </div>
          </label>
        ))}
      </div>
      <button onClick={() => setShowNewAddr(!showNewAddr)} className="text-[#2874F0] text-sm hover:underline font-bold mb-3 cursor-pointer">+ Add New Address</button>
      {showNewAddr && (
        <div className="border border-border rounded-xl p-4 space-y-3 mb-4 bg-muted/30">
          <div className="grid grid-cols-2 gap-3 text-xs">
            {[['name','Full Name'],['phone','Phone'],['street','Street Address'],['city','City'],['state','State'],['pincode','Pincode']].map(([k,l]) => (
              <div key={k} className={k === 'street' ? 'col-span-2' : ''}>
                <label className="text-muted-foreground mb-1 block font-semibold">{l}</label>
                <input value={newAddr[k as keyof typeof newAddr]} onChange={e => setNewAddr(a => ({ ...a, [k]: e.target.value }))}
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background outline-none focus:border-[#2874F0]" />
              </div>
            ))}
          </div>
          <button onClick={handleAddAddress} className="bg-[#2874F0] text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-[#1D5FD1] cursor-pointer">Save Address</button>
        </div>
      )}
      <button disabled={!selectedAddress} onClick={() => setStep(1)} className="w-full bg-[#FB641B] hover:bg-[#e55a18] disabled:opacity-50 text-white font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md">
        Deliver Here <ChevronRight size={16} />
      </button>
    </div>,

    // Step 1: Payment Method Selection
    <div key="payment">
      <h2 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
        <CreditCard size={18} className="text-[#2874F0]" /> Select Payment Method
      </h2>

      <div className="space-y-3 mb-5">
        {[
          {
            id: 'cod',
            label: 'Cash on Delivery (COD)',
            sub: 'Pay cash/UPI upon doorstep delivery',
            badge: '+₹49 Cash Handling Fee',
            icon: DollarSign,
            available: true,
          },
          {
            id: 'wallet',
            label: 'WoodNest Store Wallet',
            sub: `Instant 1-click checkout · Balance: ${formatPrice(walletBalance)}`,
            badge: '0% Gateway Fee',
            icon: Wallet,
            available: true,
          },
          {
            id: 'upi',
            label: 'UPI / QR Code',
            sub: 'Google Pay, PhonePe, Paytm, BHIM, CRED',
            badge: 'Verification Required',
            icon: QrCode,
            available: true,
          },
          {
            id: 'card',
            label: 'Credit / Debit Card',
            sub: 'Visa, Mastercard, RuPay, Maestro',
            badge: '16-Digit Verification',
            icon: CreditCard,
            available: true,
          },
          {
            id: 'netbanking',
            label: 'Net Banking',
            sub: 'HDFC, ICICI, SBI, Axis, Kotak & 50+ Banks',
            badge: 'Bank Portal Redirect',
            icon: Landmark,
            available: true,
          },
        ].map(opt => {
          const Icon = opt.icon;
          const isSelected = paymentMethod === opt.id;

          return (
            <label
              key={opt.id}
              className={`flex items-start gap-3 p-4 border-2 rounded-xl transition-all cursor-pointer ${
                isSelected
                  ? 'border-[#2874F0] bg-blue-50/60 dark:bg-blue-950/30 shadow-xs'
                  : 'border-border hover:border-blue-300'
              }`}
            >
              <input
                type="radio"
                name="payment"
                value={opt.id}
                checked={isSelected}
                onChange={() => setPaymentMethod(opt.id)}
                className="mt-1 accent-[#2874F0]"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-extrabold text-foreground flex items-center gap-1.5">
                    <Icon size={16} className="text-[#2874F0]" /> {opt.label}
                  </p>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                    opt.id === 'cod' ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300' : 'bg-blue-100 dark:bg-blue-900/40 text-[#2874F0]'
                  }`}>
                    {opt.badge}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{opt.sub}</p>

                {/* COD Handling Fee Warning Box */}
                {isSelected && opt.id === 'cod' && (
                  <div className="mt-2.5 p-2.5 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-900 text-[11px] text-amber-900 dark:text-amber-200 flex items-center gap-2">
                    <Info size={14} className="shrink-0 text-amber-600" />
                    <span>A nominal Cash Handling Fee of <strong>+₹49</strong> is added to COD orders to cover courier cash collection logistics.</span>
                  </div>
                )}
              </div>
            </label>
          );
        })}
      </div>

      <div className="flex gap-3">
        <button onClick={() => setStep(0)} className="flex-1 border border-border text-foreground py-3 rounded-xl text-sm font-semibold hover:bg-muted cursor-pointer">
          Back
        </button>
        <button onClick={() => setStep(2)} className="flex-1 bg-[#FB641B] hover:bg-[#e55a18] text-white font-extrabold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-md">
          Continue to Summary <ChevronRight size={16} />
        </button>
      </div>
    </div>,

    // Step 2: Order Summary & Place Order
    <div key="summary">
      <h2 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
        <Package size={18} className="text-[#2874F0]" /> Order Summary
      </h2>
      <div className="space-y-3 mb-4">
        {items.map(({ product, quantity }) => (
          <div key={product.id} className="flex gap-3 py-2 border-b last:border-0 border-border items-center">
            <img src={product.images[0]} alt={product.name} className="w-14 h-14 rounded-xl object-cover border border-border" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-foreground truncate">{product.name}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Qty: {quantity} × {formatPrice(product.price)}</p>
            </div>
            <p className="text-sm font-black text-foreground">{formatPrice(product.price * quantity)}</p>
          </div>
        ))}
      </div>

      {selectedAddress && (
        <div className="bg-muted p-3.5 rounded-xl mb-4 text-xs space-y-0.5 border border-border">
          <p className="font-bold text-foreground flex items-center gap-1"><MapPin size={14} className="text-[#2874F0]" /> Delivery Address:</p>
          <p className="text-muted-foreground">{selectedAddress.name} ({selectedAddress.phone})</p>
          <p className="text-muted-foreground">{selectedAddress.street}, {selectedAddress.city}, {selectedAddress.state} - {selectedAddress.pincode}</p>
        </div>
      )}

      {/* Selected Payment Mode Notice */}
      <div className="bg-blue-50 dark:bg-blue-950/30 p-3 rounded-xl mb-4 text-xs border border-blue-200 dark:border-blue-900 flex justify-between items-center">
        <div>
          <span className="text-muted-foreground block text-[10px]">Payment Method Selected:</span>
          <span className="font-extrabold text-[#2874F0] uppercase">{paymentMethod.replace(/_/g, ' ')}</span>
        </div>
        {paymentMethod === 'cod' && (
          <span className="text-amber-700 dark:text-amber-300 font-bold text-[11px] bg-amber-100 dark:bg-amber-950/40 px-2 py-0.5 rounded-md">
            +₹49 Cash Handling Fee
          </span>
        )}
      </div>

      <div className="flex gap-3">
        <button onClick={() => setStep(1)} className="flex-1 border border-border text-foreground py-3 rounded-xl text-sm font-semibold hover:bg-muted cursor-pointer">
          Back
        </button>
        <button
          onClick={handleInitiateOrder}
          className="flex-1 bg-[#FB641B] hover:bg-[#e55a18] text-white font-extrabold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-lg text-sm"
        >
          {paymentMethod === 'cod' || paymentMethod === 'wallet' ? 'Place Order' : 'Proceed to Payment Gateway →'}
        </button>
      </div>
    </div>,
  ];

  return (
    <div className="bg-background min-h-screen py-6">
      <div className="max-w-5xl mx-auto px-3 md:px-4">
        {/* Step indicator */}
        <div className="flex items-center justify-center mb-6">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold transition-colors ${i < step ? 'bg-green-500 text-white' : i === step ? 'bg-[#2874F0] text-white' : 'bg-gray-200 dark:bg-gray-700 text-muted-foreground'}`}>
                {i < step ? <Check size={16} /> : i + 1}
              </div>
              <span className={`ml-2 text-sm font-bold ${i === step ? 'text-foreground' : 'text-muted-foreground'}`}>{s}</span>
              {i < STEPS.length - 1 && <ChevronRight size={16} className="mx-3 text-muted-foreground" />}
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 bg-card rounded-2xl border border-border shadow-sm p-6">{stepContent[step]}</div>

          {/* Price Details Sidebar */}
          <div className="bg-card rounded-2xl border border-border shadow-sm p-5 h-fit space-y-3">
            <h3 className="text-xs font-extrabold text-muted-foreground uppercase tracking-wider border-b border-border pb-2">Price Details</h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-muted-foreground">
                <span>{items.length} item(s) Subtotal</span>
                <span className="font-bold text-foreground">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Delivery & Freight</span>
                <span className={delivery === 0 ? 'text-emerald-600 font-bold' : 'font-bold'}>
                  {delivery === 0 ? 'FREE' : formatPrice(delivery)}
                </span>
              </div>

              {/* Cash Handling Charge for COD */}
              {paymentMethod === 'cod' && (
                <div className="flex justify-between text-amber-700 dark:text-amber-300 font-bold bg-amber-50 dark:bg-amber-950/30 p-2 rounded-lg border border-amber-200 dark:border-amber-900">
                  <span>Cash Handling Fee</span>
                  <span>+₹49</span>
                </div>
              )}

              <div className="flex justify-between font-black border-t border-border pt-3 text-base text-foreground">
                <span>Total Amount</span>
                <span className="text-[#2874F0]">{formatPrice(total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ONLINE PAYMENT GATEWAY VERIFICATION MODAL (For UPI, Card, Net Banking) */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                <Lock className="text-[#2874F0]" size={18} /> Confirm {paymentMethod.toUpperCase()} Payment
              </h3>
              <button onClick={() => setShowPaymentModal(false)} className="text-muted-foreground hover:text-foreground">
                <X size={18} />
              </button>
            </div>

            <div className="bg-blue-50 dark:bg-blue-950/30 p-3 rounded-xl border border-blue-200 dark:border-blue-900 flex justify-between items-center text-xs">
              <span className="text-muted-foreground">Total Order Amount:</span>
              <span className="font-black text-sm text-[#2874F0]">{formatPrice(total)}</span>
            </div>

            <form onSubmit={handleConfirmOnlinePayment} className="space-y-4 text-xs">
              {/* UPI MODE */}
              {paymentMethod === 'upi' && (
                <div>
                  <label className="block font-bold text-foreground mb-1.5">Enter UPI VPA ID</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 9876543210@paytm or user@okaxis"
                    value={upiId}
                    onChange={e => setUpiId(e.target.value)}
                    className="w-full bg-background border border-border rounded-xl p-3 text-foreground font-medium outline-none focus:ring-2 focus:ring-[#2874F0]/30"
                  />
                  <p className="text-[10px] text-muted-foreground mt-1">Approve payment request on Google Pay / PhonePe / Paytm.</p>
                </div>
              )}

              {/* CARD MODE */}
              {paymentMethod === 'card' && (
                <div className="space-y-3">
                  <div>
                    <label className="block font-bold text-foreground mb-1">Card Number</label>
                    <input
                      type="text"
                      maxLength={16}
                      required
                      placeholder="16-Digit Card Number"
                      value={cardNumber}
                      onChange={e => setCardNumber(e.target.value.replace(/\D/g, ''))}
                      className="w-full bg-background border border-border rounded-xl p-2.5 font-mono text-foreground font-bold outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-foreground mb-1">Cardholder Name</label>
                    <input
                      type="text"
                      required
                      placeholder="Name on Card"
                      value={cardName}
                      onChange={e => setCardName(e.target.value)}
                      className="w-full bg-background border border-border rounded-xl p-2.5 text-foreground font-medium outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-bold text-foreground mb-1">Expiry (MM/YY)</label>
                      <input
                        type="text"
                        maxLength={5}
                        required
                        placeholder="MM/YY"
                        value={cardExpiry}
                        onChange={e => setCardExpiry(e.target.value)}
                        className="w-full bg-background border border-border rounded-xl p-2.5 font-mono text-center font-bold text-foreground outline-none"
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
                        className="w-full bg-background border border-border rounded-xl p-2.5 font-mono text-center font-bold text-foreground outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* NET BANKING MODE */}
              {paymentMethod === 'netbanking' && (
                <div>
                  <label className="block font-bold text-foreground mb-1.5">Select Net Banking Bank</label>
                  <select
                    value={selectedBank}
                    onChange={e => setSelectedBank(e.target.value)}
                    className="w-full bg-background border border-border rounded-xl p-3 text-foreground font-bold outline-none"
                  >
                    <option value="HDFC Bank">HDFC Bank</option>
                    <option value="ICICI Bank">ICICI Bank</option>
                    <option value="State Bank of India">State Bank of India (SBI)</option>
                    <option value="Axis Bank">Axis Bank</option>
                    <option value="Kotak Mahindra Bank">Kotak Mahindra Bank</option>
                  </select>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="flex-1 bg-muted text-foreground font-semibold py-2.5 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="flex-1 bg-[#2874F0] hover:bg-blue-600 text-white font-extrabold py-2.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isProcessing ? (
                    <><Loader2 size={16} className="animate-spin" /> Verifying Payment...</>
                  ) : (
                    <><ShieldCheck size={16} /> Pay & Confirm {formatPrice(total)}</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
