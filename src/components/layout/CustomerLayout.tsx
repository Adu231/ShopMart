import { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, Heart, MapPin, Bell, Settings, ChevronLeft, LogOut, ArrowLeft, Wallet } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Overview', to: '/dashboard' },
  { icon: Package, label: 'My Orders', to: '/orders' },
  { icon: Wallet, label: 'My Wallet', to: '/wallet' },
  { icon: Heart, label: 'Wishlist', to: '/wishlist' },
  { icon: MapPin, label: 'Addresses', to: '/addresses' },
  { icon: Bell, label: 'Notifications', to: '/notifications' },
  { icon: Settings, label: 'Settings', to: '/settings' },
];

interface Props {
  children: ReactNode;
  title: string;
  showBackToDashboard?: boolean;
}

export default function CustomerLayout({ children, title, showBackToDashboard = false }: Props) {
  const { user, logout } = useAuth();
  const { orders } = useCart();
  const { wishlistCount } = useWishlist();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/'); };

  const badges: Record<string, number | undefined> = {
    '/orders': orders.length || undefined,
    '/wishlist': wishlistCount || undefined,
  };

  return (
    <div className="bg-[#F1F3F6] dark:bg-[#0f0f0f] min-h-screen">
      {/* Mobile horizontal tabs */}
      <div className="md:hidden bg-card border-b border-border sticky top-0 z-20 shadow-sm">
        <div className="flex overflow-x-auto px-2 py-1.5 gap-1">
          {NAV_ITEMS.map(({ icon: Icon, label, to }) => (
            <Link
              key={to}
              to={to}
              className={cn(
                'flex flex-col items-center gap-0.5 px-3 py-2 rounded-lg text-[11px] font-medium whitespace-nowrap transition-colors flex-shrink-0',
                pathname === to
                  ? 'bg-[#2874F0]/10 text-[#2874F0]'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              )}
            >
              <Icon size={15} />
              {label}
            </Link>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-3 md:px-4 py-4 md:py-6">
        {/* Back to shopping */}
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-[#2874F0] mb-4 transition-colors group"
        >
          <ChevronLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" />
          Back to Shopping
        </Link>

        <div className="flex gap-4 items-start">
          {/* Desktop Sidebar */}
          <aside className="hidden md:flex flex-col w-56 flex-shrink-0 sticky top-6">
            {/* Profile card */}
            <div className="bg-gradient-to-br from-[#2874F0] to-blue-700 rounded-xl p-4 mb-3 text-white shadow-md">
              <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold mb-3 ring-2 ring-white/30">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <p className="font-bold text-sm leading-tight">{user?.name}</p>
              <p className="text-blue-200 text-xs mt-0.5 truncate">{user?.email}</p>
              <span className="inline-block mt-2.5 text-[10px] bg-white/20 px-2.5 py-1 rounded-full capitalize font-semibold tracking-wide">
                {user?.role}
              </span>
            </div>

            {/* Navigation */}
            <nav className="bg-card rounded-xl shadow-sm overflow-hidden border border-border">
              {NAV_ITEMS.map(({ icon: Icon, label, to }) => {
                const isActive = pathname === to;
                const badge = badges[to];
                return (
                  <Link
                    key={to}
                    to={to}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 text-sm border-l-[3px] transition-all',
                      isActive
                        ? 'border-[#2874F0] bg-[#2874F0]/5 text-[#2874F0] font-semibold'
                        : 'border-transparent text-foreground hover:bg-muted hover:border-gray-200 dark:hover:border-gray-700'
                    )}
                  >
                    <Icon size={17} className={isActive ? 'text-[#2874F0]' : 'text-muted-foreground'} />
                    <span className="flex-1 truncate">{label}</span>
                    {badge !== undefined && (
                      <span className="bg-[#2874F0] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                        {badge}
                      </span>
                    )}
                  </Link>
                );
              })}
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 border-l-[3px] border-transparent transition-all border-t border-border mt-1 font-medium cursor-pointer"
              >
                <LogOut size={17} />
                Logout
              </button>
            </nav>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 min-w-0">
            {showBackToDashboard && (
              <button
                onClick={() => navigate('/dashboard')}
                className="inline-flex items-center gap-1.5 text-xs text-[#2874F0] font-semibold hover:underline mb-3"
              >
                <ArrowLeft size={13} /> Back to Dashboard
              </button>
            )}
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
