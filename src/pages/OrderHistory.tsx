import { Link, useNavigate } from 'react-router-dom';
import { Package, ChevronRight } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { formatPrice, formatDate } from '@/lib/utils';
import { useEffect, useState } from 'react';
import CustomerLayout from '@/components/layout/CustomerLayout';

const STATUS_COLORS: Record<string, string> = {
  placed: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
  confirmed: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
  packed: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300',
  shipped: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
  out_for_delivery: 'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300',
  delivered: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
  cancelled: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
  returned: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400',
  refunded: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400',
};

const STATUS_FILTERS = ['All', 'placed', 'confirmed', 'shipped', 'delivered', 'cancelled'];

export default function OrderHistory() {
  const { orders } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    if (!isAuthenticated) navigate('/login?redirect=/orders');
  }, [isAuthenticated]);

  if (!isAuthenticated) return null;

  const filtered = filter === 'All' ? orders : orders.filter(o => o.status === filter);

  return (
    <CustomerLayout title="My Orders" showBackToDashboard>
      {/* Filter chips */}
      <div className="flex gap-2 overflow-x-auto pb-1 mb-4">
        {STATUS_FILTERS.map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors flex-shrink-0 ${
              filter === s
                ? 'bg-[#2874F0] text-white shadow-sm'
                : 'bg-card text-muted-foreground hover:bg-muted border border-border'
            }`}
          >
            {s === 'All' ? `All (${orders.length})` : s.charAt(0).toUpperCase() + s.slice(1).replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-card rounded-xl p-12 flex flex-col items-center border border-border">
          <Package size={60} className="text-muted-foreground mb-3" strokeWidth={1} />
          <p className="font-semibold text-foreground mb-1">
            No {filter !== 'All' ? filter : ''} orders found
          </p>
          <p className="text-sm text-muted-foreground mb-4">
            {filter === 'All' ? 'Your orders will appear here once placed' : `No orders with status "${filter}"`}
          </p>
          <Link
            to="/products"
            className="text-sm bg-[#2874F0] text-white px-6 py-2.5 rounded-lg font-medium hover:bg-[#1D5FD1] transition-colors"
          >
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(order => (
            <div key={order.id} className="bg-card rounded-xl shadow-sm overflow-hidden border border-border">
              {/* Order header */}
              <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-muted/40 border-b border-border">
                <div className="flex items-center gap-5 text-xs text-muted-foreground">
                  <div>
                    <p className="uppercase tracking-widest text-[10px] font-medium mb-0.5">Order ID</p>
                    <p className="font-bold text-foreground text-sm">{order.id}</p>
                  </div>
                  <div>
                    <p className="uppercase tracking-widest text-[10px] font-medium mb-0.5">Date</p>
                    <p className="font-medium text-foreground">{formatDate(order.createdAt)}</p>
                  </div>
                  <div>
                    <p className="uppercase tracking-widest text-[10px] font-medium mb-0.5">Total</p>
                    <p className="font-bold text-foreground">{formatPrice(order.totalAmount)}</p>
                  </div>
                </div>
                <span className={`text-xs px-3 py-1 rounded-full font-semibold capitalize ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-600'}`}>
                  {order.status.replace(/_/g, ' ')}
                </span>
              </div>

              {/* Items */}
              <div className="p-4">
                <div className="space-y-2 mb-3">
                  {order.items.map(({ product, quantity }) => (
                    <div key={product.id} className="flex gap-3 py-2 border-b last:border-0 border-border">
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground line-clamp-1">{product.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Qty: {quantity} × {formatPrice(product.price)}
                        </p>
                      </div>
                      <p className="text-sm font-bold text-foreground flex-shrink-0">{formatPrice(product.price * quantity)}</p>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between pt-1">
                  <p className="text-xs text-muted-foreground">
                    📍 {order.address.city}, {order.address.state}
                  </p>
                  <Link
                    to={`/order-success/${order.id}`}
                    className="flex items-center gap-1 text-[#2874F0] text-sm hover:underline font-medium"
                  >
                    Track Order <ChevronRight size={13} />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </CustomerLayout>
  );
}
