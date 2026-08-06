import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, TrendingUp, Heart, Star, Package, ChevronRight, MapPin, Bell, Settings, Truck, CheckCircle2, Clock, ShieldCheck, Tag, Wallet } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { formatPrice, formatDate } from '@/lib/utils';
import CustomerLayout from '@/components/layout/CustomerLayout';
import { useEffect, useState } from 'react';

const STATUS_COLORS: Record<string, string> = {
  placed: 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300',
  confirmed: 'bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300',
  packed: 'bg-orange-100 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300',
  shipped: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950/40 dark:text-yellow-300',
  out_for_delivery: 'bg-teal-100 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300',
  delivered: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300',
  cancelled: 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300',
  returned: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  refunded: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
};

export default function CustomerDashboard() {
  const { user, isAuthenticated } = useAuth();
  const { orders } = useCart();
  const { wishlistCount } = useWishlist();
  const navigate = useNavigate();

  const [walletBalance] = useState<number>(() => {
    try {
      const stored = localStorage.getItem('shopmart_wallet_balance');
      return stored ? parseFloat(stored) : 5400;
    } catch {
      return 5400;
    }
  });

  useEffect(() => {
    if (!isAuthenticated) navigate('/login?redirect=/dashboard');
  }, [isAuthenticated]);

  if (!isAuthenticated) return null;

  const totalSpent = orders.reduce((s, o) => s + o.totalAmount, 0);
  const activeOrder = orders.find(o => o.status === 'out_for_delivery' || o.status === 'shipped') || orders[0];
  const recentOrders = orders.slice(0, 4);

  const stats = [
    { icon: ShoppingBag, label: 'Total Orders', value: `${orders.length} Orders`, color: 'text-[#2874F0]', bg: 'bg-blue-50 dark:bg-blue-950/30', link: '/orders' },
    { icon: Wallet, label: 'Wallet Balance', value: formatPrice(walletBalance), color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-950/30', link: '/wallet' },
    { icon: Heart, label: 'Saved Wishlist', value: `${wishlistCount || 5} Saved Items`, color: 'text-rose-500', bg: 'bg-rose-50 dark:bg-rose-950/30', link: '/wishlist' },
    { icon: Star, label: 'WoodNest Rewards', value: `${Math.floor(totalSpent / 100)} Points`, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-950/30', link: '/settings' },
  ];

  const quickLinks = [
    { icon: Package, label: 'My Orders & Fulfillment', to: '/orders', desc: `${orders.length} active order history`, iconBg: 'bg-blue-50 dark:bg-blue-950/30', iconColor: 'text-[#2874F0]' },
    { icon: Wallet, label: 'WoodNest Store Wallet', to: '/wallet', desc: `Balance: ${formatPrice(walletBalance)} · Add/Withdraw`, iconBg: 'bg-purple-50 dark:bg-purple-950/30', iconColor: 'text-purple-600' },
    { icon: Heart, label: 'Saved Wishlist', to: '/wishlist', desc: `${wishlistCount || 5} saved items`, iconBg: 'bg-rose-50 dark:bg-rose-950/30', iconColor: 'text-rose-500' },
    { icon: MapPin, label: 'Saved Delivery Addresses', to: '/addresses', desc: 'Bengaluru, Karnataka (Primary)', iconBg: 'bg-emerald-50 dark:bg-emerald-950/30', iconColor: 'text-emerald-600' },
    { icon: Settings, label: 'Account Profile Settings', to: '/settings', desc: 'Manage password & details', iconBg: 'bg-amber-50 dark:bg-amber-950/30', iconColor: 'text-amber-600' },
  ];

  return (
    <CustomerLayout title={`Welcome back, ${user?.name?.split(' ')[0] || 'Priya'}!`}>
      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-5">
        {stats.map(({ icon: Icon, label, value, color, bg, link }) => (
          <Link
            key={label}
            to={link}
            className="bg-card rounded-2xl p-4 flex items-center gap-3 hover:shadow-md transition-all border border-border group"
          >
            <div className={`${bg} p-3 rounded-xl flex-shrink-0 group-hover:scale-105 transition-transform`}>
              <Icon size={20} className={color} />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground font-medium">{label}</p>
              <p className="text-sm font-black text-foreground truncate">{value}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Active Order Delivery Stepper Card */}
      {activeOrder && (
        <div className="bg-gradient-to-r from-blue-600 to-[#2874F0] text-white rounded-2xl p-5 mb-5 shadow-md space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/20 pb-3">
            <div className="flex items-center gap-2">
              <Truck size={20} className="text-blue-200" />
              <span className="font-extrabold text-sm tracking-tight">Active Delivery Status — Order #{activeOrder.id}</span>
            </div>
            <span className="text-xs bg-white/20 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider text-blue-100">
              ● {activeOrder.status.replace(/_/g, ' ')}
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <img src={activeOrder.items[0]?.product.images[0]} alt="" className="w-12 h-12 rounded-xl object-cover border border-white/30 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-bold truncate text-sm">{activeOrder.items[0]?.product.name}</p>
              <p className="text-blue-100 text-[11px]">Expected Delivery: Tomorrow by 5:00 PM · Verified Courier Partner</p>
            </div>
            <Link to={`/orders`} className="bg-white text-[#2874F0] font-bold px-3.5 py-1.5 rounded-xl text-xs shadow-sm hover:bg-blue-50 transition-colors shrink-0">
              Track Order
            </Link>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-5 gap-5 mb-5">
        {/* Quick Links */}
        <div className="md:col-span-2 bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
          <div className="px-5 py-3.5 border-b border-border bg-muted/30 flex items-center justify-between">
            <h2 className="font-bold text-foreground text-sm">Quick Access</h2>
            <ShieldCheck size={16} className="text-[#2874F0]" />
          </div>
          <div className="divide-y divide-border">
            {quickLinks.map(({ icon: Icon, label, to, desc, iconBg, iconColor }) => (
              <Link
                key={to}
                to={to}
                className="flex items-center gap-3 px-5 py-3.5 hover:bg-muted/50 transition-colors group"
              >
                <div className={`${iconBg} p-2 rounded-xl flex-shrink-0`}>
                  <Icon size={16} className={iconColor} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-foreground">{label}</p>
                  <p className="text-[10px] text-muted-foreground">{desc}</p>
                </div>
                <ChevronRight size={14} className="text-muted-foreground group-hover:translate-x-0.5 transition-transform flex-shrink-0" />
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Orders Table / Cards */}
        <div className="md:col-span-3 bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-border bg-muted/30">
            <h2 className="font-bold text-foreground text-sm">Recent Orders ({orders.length})</h2>
            <Link to="/orders" className="text-xs text-[#2874F0] hover:underline flex items-center gap-0.5 font-bold">
              View All Orders <ChevronRight size={12} />
            </Link>
          </div>

          <div className="divide-y divide-border">
            {recentOrders.map(order => (
              <Link
                key={order.id}
                to={`/orders`}
                className="flex items-center gap-3 px-5 py-3.5 hover:bg-muted/50 transition-colors"
              >
                <img
                  src={order.items[0]?.product.images[0]}
                  alt=""
                  className="w-12 h-12 rounded-xl object-cover flex-shrink-0 border border-border"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-foreground truncate">{order.items[0]?.product.name}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {order.items.length} item(s) · {formatDate(order.createdAt)}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs font-black text-foreground">{formatPrice(order.totalAmount)}</p>
                  <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold capitalize mt-1 inline-block ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-600'}`}>
                    ● {order.status.replace(/_/g, ' ')}
                  </span>
                </div>
                <ChevronRight size={14} className="text-muted-foreground flex-shrink-0 ml-1" />
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Promo & Wishlist Action Banner */}
      <div className="grid sm:grid-cols-2 gap-4">
        <Link
          to="/wallet"
          className="bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl p-5 text-white shadow-md hover:shadow-lg transition-all flex items-center gap-4 group cursor-pointer"
        >
          <div className="p-3 bg-white/20 rounded-xl shrink-0 group-hover:scale-105 transition-transform">
            <Wallet size={28} className="text-white" />
          </div>
          <div>
            <p className="font-extrabold text-sm">Manage WoodNest Wallet</p>
            <p className="text-purple-100 text-xs mt-0.5">Top-up balance, receive refunds & withdraw funds</p>
          </div>
        </Link>
        <Link
          to="/products"
          className="bg-gradient-to-br from-[#2874F0] to-blue-600 rounded-2xl p-5 text-white shadow-md hover:shadow-lg transition-all flex items-center gap-4 group cursor-pointer"
        >
          <div className="p-3 bg-white/20 rounded-xl shrink-0 group-hover:scale-105 transition-transform">
            <ShoppingBag size={28} className="text-white" />
          </div>
          <div>
            <p className="font-extrabold text-sm">Explore New Arrivals</p>
            <p className="text-blue-100 text-xs mt-0.5">Handcrafted solid wood furniture collections</p>
          </div>
        </Link>
      </div>
    </CustomerLayout>
  );
}
