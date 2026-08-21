import { useParams, Link } from 'react-router-dom';
import { CheckCircle, Package, MapPin, Clock, ArrowRight, Home, Check } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { formatPrice, formatDate } from '@/lib/utils';

const STATUS_STEPS = ['placed', 'confirmed', 'packed', 'shipped', 'out_for_delivery', 'delivered'];

export default function OrderSuccess() {
  const { id } = useParams<{ id: string }>();
  const { orders } = useCart();
  const order = orders.find(o => o.id === id);

  if (!order) return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4">
      <p className="text-muted-foreground">Order not found</p>
      <Link to="/" className="text-[#2874F0] hover:underline">Go Home</Link>
    </div>
  );

  const currentStep = STATUS_STEPS.indexOf(order.status);

  return (
    <div className="bg-background min-h-screen py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-card rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-8 text-white text-center">
            <CheckCircle size={56} className="mx-auto mb-3" />
            <h1 className="text-2xl font-bold mb-1">Order Placed Successfully!</h1>
            <p className="text-green-100 text-sm">Your order has been confirmed</p>
          </div>
          <div className="p-6 space-y-5">
            <div className="flex justify-between text-sm">
              <div><p className="text-muted-foreground">Order ID</p><p className="font-bold text-foreground">{order.id}</p></div>
              <div className="text-right"><p className="text-muted-foreground">Total Amount</p><p className="font-bold text-foreground text-base">{formatPrice(order.totalAmount)}</p></div>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 flex items-center gap-3">
              <Clock size={18} className="text-green-600" />
              <div>
                <p className="text-sm font-semibold text-foreground">Estimated Delivery</p>
                <p className="text-sm text-green-700 dark:text-green-400 font-medium">{order.estimatedDelivery}</p>
              </div>
            </div>

            {/* Order tracking */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2"><Package size={16} /> Order Status</h3>
              <div className="flex items-center justify-between relative">
                <div className="absolute top-3 left-3 right-3 h-0.5 bg-gray-200 dark:bg-gray-700 z-0" />
                <div className="absolute top-3 left-3 h-0.5 bg-green-500 z-0 transition-all" style={{ width: `${(currentStep / (STATUS_STEPS.length - 1)) * 100}%` }} />
                {STATUS_STEPS.map((s, i) => (
                  <div key={s} className="flex flex-col items-center z-10">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold ${i <= currentStep ? 'bg-green-500 border-green-500 text-white' : 'bg-card border-gray-300 dark:border-gray-600 text-muted-foreground'}`}>
                      {i <= currentStep ? <Check size={12} /> : i + 1}
                    </div>
                    <span className="text-[9px] text-muted-foreground mt-1 capitalize text-center w-12 leading-tight">{s.replace(/_/g, ' ')}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Address */}
            <div className="flex gap-3 bg-muted rounded-lg p-3">
              <MapPin size={16} className="text-[#2874F0] mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-semibold text-foreground">Delivering to {order.address.name}</p>
                <p className="text-muted-foreground">{order.address.street}, {order.address.city}, {order.address.state} - {order.address.pincode}</p>
                <p className="text-muted-foreground">Payment: {order.paymentMethod === 'cod' ? 'Cash on Delivery' : order.paymentMethod.toUpperCase()}</p>
              </div>
            </div>

            {/* Items */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-2">Items Ordered</h3>
              <div className="space-y-2">
                {order.items.map(({ product, quantity }) => (
                  <div key={product.id} className="flex gap-3">
                    <img src={product.images[0]} alt={product.name} className="w-12 h-12 rounded object-cover" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground line-clamp-1">{product.name}</p>
                      <p className="text-xs text-muted-foreground">Qty: {quantity} · {formatPrice(product.price * quantity)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <Link to="/orders" className="flex-1 border border-border rounded-lg py-2.5 text-sm font-semibold text-foreground hover:bg-muted transition-colors text-center flex items-center justify-center gap-2">
                <Package size={15} /> My Orders
              </Link>
              <Link to="/" className="flex-1 bg-[#2874F0] hover:bg-[#1D5FD1] text-white rounded-lg py-2.5 text-sm font-semibold transition-colors text-center flex items-center justify-center gap-2">
                <Home size={15} /> Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
