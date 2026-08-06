
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BarChart2, Package, ShoppingBag, TrendingUp, DollarSign, Star, Plus, LogOut, Home, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { PRODUCTS } from '@/constants/data';
import { formatPrice } from '@/lib/utils';

const SELLER_PRODUCTS = PRODUCTS.filter(p => p.seller.includes('Samsung') || p.id === 'p8' || p.id === 'p10' || p.id === 'p18').slice(0, 6);

const MOCK_ORDERS = [
  { id: 'ORD001', product: 'Samsung Galaxy S24 Ultra', customer: 'Priya S.', amount: 89999, status: 'shipped', date: '2026-08-01' },
  { id: 'ORD002', product: 'Samsung 55" Crystal 4K TV', customer: 'Rahul V.', amount: 46990, status: 'delivered', date: '2026-07-28' },
  { id: 'ORD003', product: 'Sony WH-1000XM5', customer: 'Anjali P.', amount: 24990, status: 'packed', date: '2026-08-03' },
  { id: 'ORD004', product: 'Samsung Washing Machine', customer: 'Vikram S.', amount: 34990, status: 'placed', date: '2026-08-04' },
];

const STATUS_COLORS: Record<string, string> = {
  placed: 'bg-blue-100 text-blue-700', packed: 'bg-orange-100 text-orange-700',
  shipped: 'bg-yellow-100 text-yellow-700', delivered: 'bg-green-100 text-green-700',
};

export default function SellerDashboard() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('overview');

  useEffect(() => {
    if (!isAuthenticated) navigate('/login');
    if (user && user.role !== 'seller' && user.role !== 'admin') navigate('/');
  }, [isAuthenticated, user]);

  const stats = [
    { icon: DollarSign, label: 'Total Revenue', value: '₹8,54,620', change: '+12.5%', bg: 'bg-green-50 dark:bg-green-950/30', color: 'text-green-600' },
    { icon: ShoppingBag, label: 'Total Orders', value: '347', change: '+8.2%', bg: 'bg-blue-50 dark:bg-blue-950/30', color: 'text-[#2874F0]' },
    { icon: Package, label: 'Active Products', value: SELLER_PRODUCTS.length.toString(), change: '+2', bg: 'bg-purple-50 dark:bg-purple-950/30', color: 'text-purple-600' },
    { icon: Star, label: 'Avg. Rating', value: '4.4', change: '+0.1', bg: 'bg-yellow-50 dark:bg-yellow-950/30', color: 'text-yellow-600' },
  ];

  const navItems = [
    { id: 'overview', icon: BarChart2, label: 'Overview' },
    { id: 'products', icon: Package, label: 'Products' },
    { id: 'orders', icon: ShoppingBag, label: 'Orders' },
    { id: 'revenue', icon: TrendingUp, label: 'Revenue' },
  ];

  const barData = [
    { month: 'Mar', value: 65000 }, { month: 'Apr', value: 82000 }, { month: 'May', value: 74000 },
    { month: 'Jun', value: 91000 }, { month: 'Jul', value: 108000 }, { month: 'Aug', value: 95000 },
  ];
  const maxVal = Math.max(...barData.map(d => d.value));

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <aside className="w-56 bg-[#172337] text-white flex flex-col flex-shrink-0">
        <div className="p-4 border-b border-white/10">
          <Link to="/" className="text-lg font-bold italic text-white">ShopMart</Link>
          <p className="text-xs text-blue-300 mt-0.5">Seller Portal</p>
        </div>
        <div className="p-4 border-b border-white/10">
          <div className="w-10 h-10 bg-[#2874F0] rounded-full flex items-center justify-center font-bold text-sm mb-1">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <p className="text-sm font-medium">{user?.name}</p>
          <p className="text-xs text-gray-400 truncate">{user?.email}</p>
          <span className="text-[10px] bg-green-500/20 text-green-300 px-1.5 py-0.5 rounded mt-1 inline-block">● Active Seller</span>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(({ id, icon: Icon, label }) => (
            <button key={id} onClick={() => setActiveSection(id)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${activeSection === id ? 'bg-[#2874F0] text-white' : 'text-gray-400 hover:bg-white/10 hover:text-white'}`}>
              <Icon size={16} /> {label}
            </button>
          ))}
        </nav>
        <div className="p-3 space-y-1 border-t border-white/10">
          <Link to="/" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:bg-white/10 hover:text-white transition-colors">
            <Home size={16} /> Storefront
          </Link>
          <button onClick={() => { logout(); navigate('/'); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:bg-red-500/20 hover:text-red-300 transition-colors">
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-6">
          {activeSection === 'overview' && (
            <div className="space-y-5">
              <h1 className="text-xl font-bold text-foreground">Overview</h1>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map(({ icon: Icon, label, value, change, bg, color }) => (
                  <div key={label} className="bg-card rounded-xl p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <div className={`${bg} p-2.5 rounded-lg`}><Icon size={18} className={color} /></div>
                      <span className="text-xs text-green-600 font-medium">{change}</span>
                    </div>
                    <p className="text-2xl font-bold text-foreground">{value}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
                  </div>
                ))}
              </div>
              {/* Revenue Chart */}
              <div className="bg-card rounded-xl p-5 shadow-sm">
                <h2 className="text-sm font-semibold text-foreground mb-4">Monthly Revenue (₹)</h2>
                <div className="flex items-end gap-3 h-36">
                  {barData.map(({ month, value }) => (
                    <div key={month} className="flex-1 flex flex-col items-center gap-1">
                      <span className="text-xs text-muted-foreground">{formatPrice(value).replace('₹', '')}</span>
                      <div className="w-full bg-[#2874F0] rounded-t transition-all" style={{ height: `${(value / maxVal) * 100}px` }} />
                      <span className="text-xs text-muted-foreground">{month}</span>
                    </div>
                  ))}
                </div>
              </div>
              {/* Recent Orders */}
              <div className="bg-card rounded-xl shadow-sm overflow-hidden">
                <div className="p-4 border-b border-border"><h2 className="text-sm font-semibold text-foreground">Recent Orders</h2></div>
                <div className="divide-y divide-border">
                  {MOCK_ORDERS.map(o => (
                    <div key={o.id} className="flex items-center justify-between px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-foreground">{o.product}</p>
                        <p className="text-xs text-muted-foreground">{o.customer} · {o.date}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${STATUS_COLORS[o.status]}`}>{o.status}</span>
                        <span className="text-sm font-bold text-foreground">{formatPrice(o.amount)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeSection === 'products' && (
            <div>
              <div className="flex items-center justify-between mb-5">
                <h1 className="text-xl font-bold text-foreground">My Products ({SELLER_PRODUCTS.length})</h1>
                <button className="flex items-center gap-2 bg-[#2874F0] hover:bg-[#1D5FD1] text-white text-sm px-4 py-2 rounded-lg font-medium transition-colors">
                  <Plus size={15} /> Add Product
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {SELLER_PRODUCTS.map(p => (
                  <div key={p.id} className="bg-card rounded-xl shadow-sm overflow-hidden">
                    <img src={p.images[0]} alt={p.name} className="w-full h-36 object-cover" />
                    <div className="p-3">
                      <p className="text-sm font-semibold text-foreground line-clamp-1">{p.name}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-base font-bold text-foreground">{formatPrice(p.price)}</span>
                        <span className={`text-xs px-2 py-0.5 rounded font-medium ${p.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{p.stock > 0 ? `${p.stock} in stock` : 'Out of stock'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === 'orders' && (
            <div>
              <h1 className="text-xl font-bold text-foreground mb-5">Orders</h1>
              <div className="bg-card rounded-xl shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted">
                    <tr>{['Order ID', 'Product', 'Customer', 'Amount', 'Status', 'Date'].map(h => <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">{h}</th>)}</tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {MOCK_ORDERS.map(o => (
                      <tr key={o.id} className="hover:bg-muted/50 transition-colors">
                        <td className="px-4 py-3 text-[#2874F0] font-medium">{o.id}</td>
                        <td className="px-4 py-3 text-foreground max-w-[200px] truncate">{o.product}</td>
                        <td className="px-4 py-3 text-foreground">{o.customer}</td>
                        <td className="px-4 py-3 font-bold text-foreground">{formatPrice(o.amount)}</td>
                        <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${STATUS_COLORS[o.status]}`}>{o.status}</span></td>
                        <td className="px-4 py-3 text-muted-foreground">{o.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeSection === 'revenue' && (
            <div className="space-y-5">
              <h1 className="text-xl font-bold text-foreground">Revenue Analytics</h1>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: 'This Month', value: '₹95,000', sub: '+12.5% vs last month', color: 'text-green-600' },
                  { label: 'Total Revenue', value: '₹8,54,620', sub: 'Since joining', color: 'text-[#2874F0]' },
                  { label: 'Pending Payout', value: '₹23,450', sub: 'Processing in 3 days', color: 'text-orange-600' },
                ].map(({ label, value, sub, color }) => (
                  <div key={label} className="bg-card rounded-xl p-5 shadow-sm">
                    <p className="text-sm text-muted-foreground">{label}</p>
                    <p className={`text-2xl font-bold mt-1 ${color}`}>{value}</p>
                    <p className="text-xs text-muted-foreground mt-1">{sub}</p>
                  </div>
                ))}
              </div>
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4 flex gap-3">
                <AlertCircle size={18} className="text-yellow-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-yellow-800 dark:text-yellow-200">Withdrawal requests are processed every Monday. Minimum withdrawal amount is ₹1,000.</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
