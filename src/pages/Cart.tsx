import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingBag, Tag, ArrowRight } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { formatPrice } from '@/lib/utils';
import { COUPONS } from '@/constants/data';
import { toast } from 'sonner';
import LoginRequiredModal from '@/components/modals/LoginRequiredModal';

export default function Cart() {
  const { items, removeFromCart, updateQuantity, subtotal } = useCart();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<typeof COUPONS[0] | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    if (user?.role === 'admin') {
      toast.info('Product purchasing is restricted to Customer accounts.');
      navigate('/admin', { replace: true });
    } else if (user?.role === 'seller') {
      toast.info('Product purchasing is restricted to Customer accounts.');
      navigate('/seller', { replace: true });
    }
  }, [user, navigate]);

  const applyCoupon = () => {
    const coupon = COUPONS.find(c => c.code.toUpperCase() === couponCode.toUpperCase());
    if (!coupon) { toast.error('Invalid coupon code'); return; }
    if (subtotal < coupon.minOrder) { toast.error(`Minimum order ₹${coupon.minOrder} required`); return; }
    setAppliedCoupon(coupon);
    toast.success(`Coupon "${coupon.code}" applied!`);
  };

  const discount = appliedCoupon
    ? appliedCoupon.type === 'percentage' ? Math.round(subtotal * appliedCoupon.discount / 100) : appliedCoupon.discount
    : 0;

  const delivery = subtotal >= 499 ? 0 : 40;
  const total = subtotal - discount + delivery;

  const handleCheckout = () => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }
    navigate('/checkout');
  };

  if (items.length === 0) return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4 px-4">
      <ShoppingBag size={72} className="text-muted-foreground" strokeWidth={1} />
      <h2 className="text-xl font-bold text-foreground">Your cart is empty</h2>
      <p className="text-muted-foreground text-sm text-center">Add items to it now.</p>
      <Link to="/products" className="bg-[#2874F0] hover:bg-[#1D5FD1] text-white px-8 py-2.5 rounded font-semibold transition-colors">Shop Now</Link>
    </div>
  );

  return (
    <div className="bg-background min-h-screen py-4">
      <div className="max-w-7xl mx-auto px-3 md:px-4">
        <h1 className="text-xl font-bold text-foreground mb-4">My Cart ({items.length} items)</h1>
        <div className="grid lg:grid-cols-3 gap-4">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-3">
            {items.map(({ product, quantity }) => (
              <div key={product.id} className="bg-card rounded shadow-sm p-4 flex gap-4">
                <Link to={`/products/${product.id}`} className="flex-shrink-0">
                  <img src={product.images[0]} alt={product.name} className="w-20 h-20 md:w-24 md:h-24 object-cover rounded" />
                </Link>
                <div className="flex-1 min-w-0">
                  <Link to={`/products/${product.id}`} className="text-sm font-medium text-foreground hover:text-[#2874F0] line-clamp-2">{product.name}</Link>
                  <p className="text-xs text-muted-foreground mt-0.5">Seller: {product.seller}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-base font-bold text-foreground">{formatPrice(product.price)}</span>
                    <span className="text-xs text-muted-foreground line-through">{formatPrice(product.originalPrice)}</span>
                    <span className="text-xs text-green-600 font-medium">{product.discount}% off</span>
                  </div>
                  <div className="flex items-center gap-3 mt-3">
                    <div className="flex items-center border border-border rounded overflow-hidden">
                      <button onClick={() => updateQuantity(product.id, quantity - 1)} className="px-2.5 py-1 hover:bg-muted transition-colors"><Minus size={12} /></button>
                      <span className="px-3 py-1 text-sm font-medium border-x border-border">{quantity}</span>
                      <button onClick={() => updateQuantity(product.id, quantity + 1)} className="px-2.5 py-1 hover:bg-muted transition-colors"><Plus size={12} /></button>
                    </div>
                    <button onClick={() => removeFromCart(product.id)} className="text-muted-foreground hover:text-red-500 transition-colors p-1">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="space-y-3">
            {/* Coupon */}
            <div className="bg-card rounded shadow-sm p-4">
              <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2"><Tag size={15} /> Apply Coupon</h3>
              <div className="flex gap-2">
                <input type="text" placeholder="Enter coupon code" value={couponCode} onChange={e => setCouponCode(e.target.value.toUpperCase())} className="flex-1 border border-border rounded px-3 py-2 text-sm bg-background text-foreground outline-none focus:border-[#2874F0]" />
                <button onClick={applyCoupon} className="bg-[#2874F0] hover:bg-[#1D5FD1] text-white px-3 py-2 rounded text-sm font-medium transition-colors">Apply</button>
              </div>
              {appliedCoupon && (
                <div className="mt-2 flex items-center justify-between bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-xs p-2 rounded">
                  <span>"{appliedCoupon.code}" applied — Saving {formatPrice(discount)}</span>
                  <button onClick={() => setAppliedCoupon(null)} className="hover:text-red-500">✕</button>
                </div>
              )}
              <div className="mt-2 flex gap-2 flex-wrap">
                {COUPONS.map(c => <span key={c.code} onClick={() => setCouponCode(c.code)} className="text-xs border border-dashed border-[#2874F0] text-[#2874F0] px-2 py-0.5 rounded cursor-pointer hover:bg-blue-50">{c.code}</span>)}
              </div>
            </div>

            <div className="bg-card rounded shadow-sm p-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">Price Details</h3>
              <div className="space-y-2.5 text-sm">
                {[
                  { label: `Price (${items.length} items)`, value: formatPrice(subtotal), color: '' },
                  { label: 'Discount', value: `-${formatPrice(discount)}`, color: 'text-green-600' },
                  { label: 'Delivery Charges', value: delivery === 0 ? 'FREE' : `+${formatPrice(delivery)}`, color: delivery === 0 ? 'text-green-600' : '' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="flex justify-between">
                    <span className="text-muted-foreground">{label}</span>
                    <span className={`font-medium text-foreground ${color}`}>{value}</span>
                  </div>
                ))}
                <div className="border-t border-border pt-2.5 flex justify-between font-bold text-base">
                  <span className="text-foreground">Total Amount</span>
                  <span className="text-foreground">{formatPrice(total)}</span>
                </div>
                {discount > 0 && <p className="text-green-600 font-semibold text-xs text-right">You save {formatPrice(discount)} 🎉</p>}
              </div>
              <button onClick={handleCheckout} className="w-full mt-4 bg-[#FB641B] hover:bg-[#e55a18] text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer">
                Place Order <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <LoginRequiredModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        actionText="checkout and place orders"
        redirectUrl="/checkout"
      />
    </div>
  );
}
