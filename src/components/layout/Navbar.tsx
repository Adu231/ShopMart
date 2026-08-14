import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, Heart, Moon, Sun, User, Menu, X, LogOut, ChevronDown, Package, LayoutDashboard } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { api } from '@/services/api';

export default function Navbar() {
  const [query, setQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { user, logout, isAuthenticated } = useAuth();
  const { totalItems } = useCart();
  const { wishlistCount } = useWishlist();
  const dropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.admin.getCategories().then(res => {
      if (res && res.success && Array.isArray(res.categories)) {
        setCategories(res.categories);
      }
    }).catch(err => console.error(err));
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) setUserOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) { navigate(`/products?q=${encodeURIComponent(query.trim())}`); setMenuOpen(false); }
  };

  const handleLogout = () => { logout(); setUserOpen(false); navigate('/'); };

  const getDropdownNav = () => {
    if (user?.role === 'admin') {
      return [{ to: '/admin', icon: LayoutDashboard, label: 'Admin Panel' }];
    }
    if (user?.role === 'seller') {
      return [{ to: '/seller', icon: LayoutDashboard, label: 'Seller Panel' }];
    }
    return [
      { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { to: '/orders', icon: Package, label: 'My Orders' },
      { to: '/wishlist', icon: Heart, label: 'Wishlist' },
    ];
  };

  return (
    <header className="sticky top-0 z-50">
      <div className="bg-[#2874F0]">
        <div className="max-w-7xl mx-auto px-3 py-2.5 flex items-center gap-3">
          <Link to="/" className="flex-shrink-0 mr-1">
            <div className="text-white font-bold text-xl leading-none">WoodNest</div>
            <div className="text-[10px] text-blue-200 leading-none">Design Your Space</div>
          </Link>

          <form onSubmit={handleSearch} className="flex-1 hidden md:flex max-w-2xl">
            <input type="text" placeholder="Search sofas, beds, tables, chairs and more" value={query} onChange={e => setQuery(e.target.value)} className="flex-1 px-4 py-2 text-sm text-gray-800 rounded-l outline-none" />
            <button type="submit" className="bg-[#FB641B] hover:bg-[#e55a18] px-4 py-2 rounded-r transition-colors">
              <Search size={18} className="text-white" />
            </button>
          </form>

          <div className="flex items-center gap-1 ml-auto md:ml-0">
            <div className="relative" ref={dropRef}>
              {isAuthenticated ? (
                <button onClick={() => setUserOpen(!userOpen)} className="flex items-center gap-1 text-white hover:bg-blue-600 px-2.5 py-1.5 rounded text-sm font-medium transition-colors">
                  <User size={16} />
                  <span className="hidden md:block max-w-[70px] truncate">{user?.name.split(' ')[0]}</span>
                  <ChevronDown size={12} />
                </button>
              ) : (
                <Link to="/login" className="flex items-center gap-1 text-white hover:bg-blue-600 px-2.5 py-1.5 rounded text-sm font-medium transition-colors">
                  <User size={16} /><span>Login</span>
                </Link>
              )}
              {userOpen && isAuthenticated && (
                <div className="absolute right-0 top-full mt-1 w-52 bg-white dark:bg-gray-800 rounded shadow-xl border border-gray-200 dark:border-gray-700 z-50">
                  <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                    <p className="font-semibold text-sm text-gray-900 dark:text-white">{user?.name}</p>
                    <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                    <span className="text-[10px] bg-blue-100 dark:bg-blue-900 text-[#2874F0] dark:text-blue-300 px-1.5 py-0.5 rounded capitalize mt-1 inline-block">{user?.role}</span>
                  </div>
                  {getDropdownNav().map(({ to, icon: Icon, label }) => (
                    <Link key={to} to={to} onClick={() => setUserOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300">
                      <Icon size={14} /> {label}
                    </Link>
                  ))}
                  <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 w-full border-t border-gray-100 dark:border-gray-700 font-medium cursor-pointer">
                    <LogOut size={14} /> Logout
                  </button>
                </div>
              )}
            </div>

            {(!user || user.role === 'customer') ? (
              [
                { to: '/wishlist', icon: Heart, label: 'Wishlist', count: wishlistCount },
                { to: '/cart', icon: ShoppingCart, label: 'Cart', count: totalItems },
              ].map(({ to, icon: Icon, label, count }) => (
                <Link key={to} to={to} className="relative flex items-center gap-1 text-white hover:bg-blue-600 px-2.5 py-1.5 rounded text-sm font-medium transition-colors">
                  <Icon size={16} />
                  <span className="hidden md:block">{label}</span>
                  {count > 0 && (
                    <span className="absolute -top-1 -right-1 bg-[#FB641B] text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold">
                      {count > 9 ? '9+' : count}
                    </span>
                  )}
                </Link>
              ))
            ) : (
              <Link to={user.role === 'admin' ? '/admin' : '/seller'} className="hidden md:flex items-center gap-1.5 bg-white/15 hover:bg-white/25 text-white px-3 py-1.5 rounded text-xs font-semibold transition-colors border border-white/20">
                <LayoutDashboard size={14} /> {user.role === 'admin' ? 'Admin Dashboard' : 'Seller Dashboard'}
              </Link>
            )}

            <button onClick={toggleTheme} className="text-white hover:bg-blue-600 p-1.5 rounded transition-colors">
              {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
            </button>
            <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-white hover:bg-blue-600 p-1.5 rounded">
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        <div className="md:hidden px-3 pb-2.5">
          <form onSubmit={handleSearch} className="flex">
            <input type="text" placeholder="Search furniture & decor..." value={query} onChange={e => setQuery(e.target.value)} className="flex-1 px-3 py-2 text-sm text-gray-800 rounded-l outline-none" />
            <button type="submit" className="bg-[#FB641B] px-3 py-2 rounded-r"><Search size={16} className="text-white" /></button>
          </form>
        </div>
      </div>

      {categories.length > 0 && (
        <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 hidden md:block">
          <div className="max-w-7xl mx-auto px-4 flex items-center gap-5 overflow-x-auto scrollbar-hide py-1.5">
            {categories.map(cat => (
              <Link key={cat.id} to={`/products?category=${encodeURIComponent(cat.name)}`} className="flex items-center gap-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 hover:text-[#2874F0] whitespace-nowrap transition-colors py-1">
                <img src={cat.image_url || cat.image || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=300&q=80'} alt={cat.name} className="w-7 h-7 rounded object-cover" />
                <span>{cat.name}</span>
              </Link>
            ))}
            <Link to="/signup?role=seller" className="text-xs font-medium text-[#2874F0] dark:text-blue-400 hover:underline whitespace-nowrap ml-auto">Sell Your Furniture</Link>
          </div>
        </div>
      )}

      {menuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 border-b shadow-lg divide-y divide-gray-100 dark:divide-gray-800">
          {categories.map(cat => (
            <Link key={cat.id} to={`/products?category=${encodeURIComponent(cat.name)}`} onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
              <img src={cat.image_url || cat.image || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=300&q=80'} alt={cat.name} className="w-8 h-8 rounded object-cover" /> {cat.name}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
