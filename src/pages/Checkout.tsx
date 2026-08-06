import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, MapPin, CreditCard, Package, ChevronRight } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { formatPrice, getEstimatedDelivery } from '@/lib/utils';
import type { Address } from '@/types';

const STEPS = ['Address', 'Payment', 'Summary'];

export default function Checkout() {
  const [step, setStep] = useState(0);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [newAddr, setNewAddr] = useState({ name: '', phone: '', street: '', city: '', state: '', pincode: '' });
  const [showNewAddr, setShowNewAddr] = useState(false);
  const navigate = useNavigate();
  const { items, subtotal, placeOrder } = useCart();
  const { addresses, addAddress } = useAuth();

  const delivery = subtotal >= 499 ? 0 : 40;
  const total = subtotal + delivery;

  const handleAddAddress = () => {
    if (!newAddr.name || !newAddr.street || !newAddr.city || !newAddr.pincode) return;
    addAddress({ ...newAddr, isDefault: addresses.length === 0 });
    setShowNewAddr(false);
  };

  const handlePlaceOrder = () => {
    if (!selectedAddress) return;
    const orderId = placeOrder({
      items,
      status: 'placed',
      totalAmount: total,
      address: selectedAddress,
      paymentMethod,
      estimatedDelivery: getEstimatedDelivery(),
    });
    navigate(`/order-success/${orderId}`);
  };

  if (items.length === 0) { navigate('/cart'); return null; }

  const stepContent = [
    // Step 0: Address
    <div key="addr">
      <h2 className="text-base font-bold text-foreground mb-4 flex items-center gap-2"><MapPin size={18} className="text-[#2874F0]" /> Delivery Address</h2>
      <div className="space-y-3 mb-4">
        {addresses.map(addr => (
          <label key={addr.id} className={`flex gap-3 p-4 border-2 rounded-lg cursor-pointer transition-colors ${selectedAddress?.id === addr.id ? 'border-[#2874F0] bg-blue-50 dark:bg-blue-950/30' : 'border-border hover:border-blue-300'}`}>
            <input type="radio" name="address" checked={selectedAddress?.id === addr.id} onChange={() => setSelectedAddress(addr)} className="mt-1 accent-[#2874F0]" />
            <div className="text-sm">
              <p className="font-semibold text-foreground">{addr.name} <span className="text-muted-foreground font-normal">· {addr.phone}</span></p>
              <p className="text-muted-foreground">{addr.street}, {addr.city}, {addr.state} - {addr.pincode}</p>
              {addr.isDefault && <span className="text-[10px] bg-blue-100 dark:bg-blue-900 text-[#2874F0] px-1.5 py-0.5 rounded mt-1 inline-block">Default</span>}
            </div>
          </label>
        ))}
      </div>
      <button onClick={() => setShowNewAddr(!showNewAddr)} className="text-[#2874F0] text-sm hover:underline font-medium mb-3">+ Add New Address</button>
      {showNewAddr && (
        <div className="border border-border rounded-lg p-4 space-y-3 mb-4">
          <div className="grid grid-cols-2 gap-3">
            {[['name','Full Name'],['phone','Phone'],['street','Street Address'],['city','City'],['state','State'],['pincode','Pincode']].map(([k,l]) => (
              <div key={k} className={k === 'street' ? 'col-span-2' : ''}>
                <label className="text-xs text-muted-foreground mb-1 block">{l}</label>
                <input value={newAddr[k as keyof typeof newAddr]} onChange={e => setNewAddr(a => ({ ...a, [k]: e.target.value }))}
                  className="w-full border border-border rounded px-3 py-2 text-sm bg-background outline-none focus:border-[#2874F0]" />
              </div>
            ))}
          </div>
          <button onClick={handleAddAddress} className="bg-[#2874F0] text-white text-sm px-4 py-2 rounded hover:bg-[#1D5FD1]">Save Address</button>
        </div>
      )}
      <button disabled={!selectedAddress} onClick={() => setStep(1)} className="w-full bg-[#FB641B] hover:bg-[#e55a18] disabled:opacity-50 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2">
        Deliver Here <ChevronRight size={16} />
      </button>
    </div>,

    // Step 1: Payment
    <div key="payment">
      <h2 className="text-base font-bold text-foreground mb-4 flex items-center gap-2"><CreditCard size={18} className="text-[#2874F0]" /> Payment Method</h2>
      <div className="space-y-3">
        {[
          { id: 'cod', label: 'Cash on Delivery', sub: 'Pay when your order arrives', available: true },
          { id: 'upi', label: 'UPI / QR Code', sub: 'PhonePe, GPay, Paytm (Coming Soon)', available: false },
          { id: 'card', label: 'Credit / Debit Card', sub: 'Visa, Mastercard, RuPay (Coming Soon)', available: false },
          { id: 'netbanking', label: 'Net Banking', sub: 'All major banks (Coming Soon)', available: false },
        ].map(opt => (
          <label key={opt.id} className={`flex gap-3 p-4 border-2 rounded-lg transition-colors ${opt.available ? 'cursor-pointer' : 'opacity-50 cursor-not-allowed'} ${paymentMethod === opt.id && opt.available ? 'border-[#2874F0] bg-blue-50 dark:bg-blue-950/30' : 'border-border'}`}>
            <input type="radio" name="payment" value={opt.id} checked={paymentMethod === opt.id} onChange={() => opt.available && setPaymentMethod(opt.id)} disabled={!opt.available} className="mt-1 accent-[#2874F0]" />
            <div>
              <p className="text-sm font-semibold text-foreground">{opt.label}</p>
              <p className="text-xs text-muted-foreground">{opt.sub}</p>
            </div>
          </label>
        ))}
      </div>
      <div className="flex gap-3 mt-4">
        <button onClick={() => setStep(0)} className="flex-1 border border-border text-foreground py-3 rounded-lg text-sm font-semibold hover:bg-muted">Back</button>
        <button onClick={() => setStep(2)} className="flex-1 bg-[#FB641B] hover:bg-[#e55a18] text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors">
          Continue <ChevronRight size={16} />
        </button>
      </div>
    </div>,

    // Step 2: Summary
    <div key="summary">
      <h2 className="text-base font-bold text-foreground mb-4 flex items-center gap-2"><Package size={18} className="text-[#2874F0]" /> Order Summary</h2>
      <div className="space-y-3 mb-4">
        {items.map(({ product, quantity }) => (
          <div key={product.id} className="flex gap-3">
            <img src={product.images[0]} alt={product.name} className="w-14 h-14 rounded object-cover" />
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground line-clamp-2">{product.name}</p>
              <p className="text-xs text-muted-foreground">Qty: {quantity} × {formatPrice(product.price)}</p>
            </div>
            <p className="text-sm font-bold text-foreground">{formatPrice(product.price * quantity)}</p>
          </div>
        ))}
      </div>
      {selectedAddress && (
        <div className="bg-muted rounded-lg p-3 mb-4 text-sm">
          <p className="font-semibold text-foreground mb-1">Delivering to:</p>
          <p className="text-muted-foreground">{selectedAddress.name} · {selectedAddress.street}, {selectedAddress.city} - {selectedAddress.pincode}</p>
        </div>
      )}
      <div className="border-t border-border pt-3 space-y-1.5 text-sm mb-4">
        <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatPrice(subtotal)}</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground">Delivery</span><span className={delivery === 0 ? 'text-green-600' : ''}>{delivery === 0 ? 'FREE' : formatPrice(delivery)}</span></div>
        <div className="flex justify-between font-bold text-base border-t border-border pt-2"><span>Total</span><span>{formatPrice(total)}</span></div>
      </div>
      <div className="flex gap-3">
        <button onClick={() => setStep(1)} className="flex-1 border border-border text-foreground py-3 rounded-lg text-sm font-semibold hover:bg-muted">Back</button>
        <button onClick={handlePlaceOrder} className="flex-1 bg-[#FB641B] hover:bg-[#e55a18] text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors">
          Place Order 🎉
        </button>
      </div>
    </div>,
  ];

  return (
    <div className="bg-background min-h-screen py-4">
      <div className="max-w-5xl mx-auto px-3 md:px-4">
        {/* Step indicator */}
        <div className="flex items-center justify-center mb-6">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold transition-colors ${i < step ? 'bg-green-500 text-white' : i === step ? 'bg-[#2874F0] text-white' : 'bg-gray-200 dark:bg-gray-700 text-muted-foreground'}`}>
                {i < step ? <Check size={16} /> : i + 1}
              </div>
              <span className={`ml-2 text-sm font-medium ${i === step ? 'text-foreground' : 'text-muted-foreground'}`}>{s}</span>
              {i < STEPS.length - 1 && <ChevronRight size={16} className="mx-3 text-muted-foreground" />}
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 bg-card rounded shadow-sm p-5">{stepContent[step]}</div>
          <div className="bg-card rounded shadow-sm p-4 h-fit">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Price Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">{items.length} item(s)</span><span>{formatPrice(subtotal)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Delivery</span><span className={delivery === 0 ? 'text-green-600' : ''}>{delivery === 0 ? 'FREE' : formatPrice(delivery)}</span></div>
              <div className="flex justify-between font-bold border-t border-border pt-2 text-base"><span>Total</span><span>{formatPrice(total)}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
