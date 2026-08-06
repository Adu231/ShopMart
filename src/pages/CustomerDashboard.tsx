import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, TrendingUp, Heart, Star, Package, ChevronRight, MapPin, Bell, Settings } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { formatPrice, formatDate } from '@/lib/utils';
import CustomerLayout from '@/components/layout/CustomerLayout';
import { useEffect } from 'react';

const STATUS_COLORS: Record<string, string> = {
  placed: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  confirmed: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  packed: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  shipped: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
  out_for_delivery: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300',
  delivered: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  returned: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  refunded: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
};

export default function CustomerDashboard() {
  const { user, isAuthenticated } = useAuth();
  const { orders } = useCart();
  const { wishlistCount } = useWishlist();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) navigate('/login?redirect=/dashboard');
  }, [isAuthenticated]);

  if (!isAuthenticated) return null;

  const totalSpent = orders.reduce((s, o) => s + o.totalAmount, 0);
  const recentOrders = orders.slice(0, 3);

  const stats = [
    { icon: ShoppingBag, label: 'Total Orders', value: String(orders.length), color: 'text-[#2874F0]', bg: 'bg-blue-50 dark:bg-blue-950/30', link: '/orders' },
    { icon: TrendingUp, label: 'Total Spent', value: formatPrice(totalSpent), color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-950/30', link: '/orders' },
    { icon: Heart, label: 'Wishlist', value: `${wishlistCount} items`, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-950/30', link: '/wishlist' },
    { icon: Star, label: 'Loyalty Points', value: `${Math.floor(totalSpent / 100)} pts`, color: 'text-yellow-600', bg: 'bg-yellow-50 dark:bg-yellow-950/30', link: '/settings' },
  ];

  const quickLinks = [
    { icon: Package, label: 'My Orders', to: '/orders', desc: `${orders.length} orders placed`, iconBg: 'bg-blue-50 dark:bg-blue-950/30', iconColor: 'text-[#2874F0]' },
    { icon: Heart, label: 'Wishlist', to: '/wishlist', desc: `${wishlistCount} saved items`, iconBg: 'bg-red-50 dark:bg-red-950/30', iconColor: 'text-red-500' },
    { icon: MapPin, label: 'Addresses', to: '/addresses', desc: 'Manage delivery addresses', iconBg: 'bg-green-50 dark:bg-green-950/30', iconColor: 'text-green-600' },
    { icon: Bell, label: 'Notifications', to: '/notifications', desc: 'View your updates', iconBg: 'bg-orange-50 dark:bg-orange-950/30', iconColor: 'text-orange-500' },
    { icon: Settings, label: 'Settings', to: '/settings', desc: 'Account & preferences', iconBg: 'bg-purple-50 dark:bg-purple-950/30', iconColor: 'text-purple-600' },
  ];

  return (
    <CustomerLayout title={`Welcome back, ${user?.name?.split(' ')[0]}!`}>
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        {stats.map(({ icon: Icon, label, value, color, bg, link }) => (
          <Link
            key={label}
            to={link}
            className="bg-card rounded-xl shadow-sm p-4 flex items-center gap-3 hover:shadow-md transition-shadow border border-border"
          >
            <div className={`${bg} p-2.5 rounded-lg flex-shrink-0`}>
              <Icon size={20} className={color} />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="text-sm font-bold text-foreground truncate">{value}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid md:grid-cols-5 gap-4 mb-4">
        {/* Quick Links */}
        <div className="md:col-span-2 bg-card rounded-xl shadow-sm border border-border overflow-hidden">
          <div className="px-5 py-3.5 border-b border-border bg-muted/30">
            <h2 className="font-semibold text-foreground text-sm">Quick Access</h2>
          </div>
          <div>
            {quickLinks.map(({ icon: Icon, label, to, desc, iconBg, iconColor }) => (
              <Link
                key={to}
                to={to}
                className="flex items-center gap-3 px-5 py-3.5 hover:bg-muted transition-colors border-b last:border-0 border-border group"
              >
                <div className={`${iconBg} p-2 rounded-lg flex-shrink-0`}>
                  <Icon size={15} className={iconColor} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{label}</p>
                  <p className="text-xs text-muted-foreground">{desc}</p>
                </div>
                <ChevronRight size={14} className="text-muted-foreground group-hover:translate-x-0.5 transition-transform flex-shrink-0" />
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="md:col-span-3 bg-card rounded-xl shadow-sm border border-border overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-border bg-muted/30">
            <h2 className="font-semibold text-foreground text-sm">Recent Orders</h2>
            <Link to="/orders" className="text-xs text-[#2874F0] hover:underline flex items-center gap-0.5 font-medium">
              View All <ChevronRight size={12} />
            </Link>
          </div>
          {recentOrders.length === 0 ? (
            <div className="flex flex-col items-center py-12">
              <ShoppingBag size={44} className="text-muted-foreground mb-3" strokeWidth={1} />
              <p className="text-sm font-medium text-foreground mb-1">No orders yet</p>
              <p className="text-xs text-muted-foreground mb-4">Start shopping to see your orders here</p>
              <Link to="/products" className="text-sm bg-[#2874F0] text-white px-5 py-2 rounded-lg font-medium hover:bg-[#1D5FD1] transition-colors">
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {recentOrders.map(order => (
                <Link
                  key={order.id}
                  to={`/order-success/${order.id}`}
                  className="flex items-center gap-3 px-5 py-3.5 hover:bg-muted/50 transition-colors"
                >
                  <img
                    src={order.items[0]?.product.images[0]}
                    alt=""
                    className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{order.items[0]?.product.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {order.items.length} item(s) · {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-foreground">{formatPrice(order.totalAmount)}</p>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold capitalize mt-1 inline-block ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-600'}`}>
                      {order.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <ChevronRight size={13} className="text-muted-foreground flex-shrink-0 ml-1" />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Promo banners */}
      <div className="grid sm:grid-cols-2 gap-3">
        <Link
          to="/products"
          className="bg-gradient-to-r from-[#2874F0] to-blue-500 rounded-xl p-5 text-white hover:shadow-lg transition-shadow flex items-center gap-4 group"
        >
          <ShoppingBag size={36} className="opacity-80 flex-shrink-0 group-hover:scale-110 transition-transform" />
          <div>
            <p className="font-bold text-base">Continue Shopping</p>
            <p className="text-blue-100 text-sm mt-0.5">Explore thousands of products</p>
          </div>
        </Link>
        <Link
          to="/wishlist"
          className="bg-gradient-to-r from-rose-500 to-red-400 rounded-xl p-5 text-white hover:shadow-lg transition-shadow flex items-center gap-4 group"
        >
          <Heart size={36} className="opacity-80 flex-shrink-0 group-hover:scale-110 transition-transform" />
          <div>
            <p className="font-bold text-base">My Wishlist</p>
            <p className="text-red-100 text-sm mt-0.5">{wishlistCount} item{wishlistCount !== 1 ? 's' : ''} saved for later</p>
          </div>
        </Link>
      </div>
    </CustomerLayout>
  );
}
