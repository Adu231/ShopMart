import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BarChart2, Users, Package, ShoppingBag, TrendingUp, DollarSign, Settings, LogOut, Home, Bell, CheckCircle, XCircle, AlertCircle, Shield } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { PRODUCTS } from '@/constants/data';
import { formatPrice } from '@/lib/utils';

const PENDING_SELLERS = [
  { id: 's1', name: 'TechZone India', email: 'techzone@seller.com', date: '2026-07-28', products: 12 },
  { id: 's2', name: 'Fashion Hub', email: 'fashionhub@seller.com', date: '2026-08-01', products: 35 },
  { id: 's3', name: 'Home Essentials', email: 'homeessentials@seller.com', date: '2026-08-03', products: 8 },
];

const RECENT_ACTIVITY = [
  { type: 'order', msg: 'New order #ORD8823 placed for ₹89,999', time: '2 min ago', color: 'text-[#2874F0]' },
  { type: 'seller', msg: 'Seller "TechZone India" awaiting approval', time: '15 min ago', color: 'text-orange-600' },
  { type: 'report', msg: 'Customer reported product quality issue', time: '1 hr ago', color: 'text-red-500' },
  { type: 'revenue', msg: 'Daily revenue target achieved: ₹2.4L', time: '2 hr ago', color: 'text-green-600' },
  { type: 'user', msg: 'New customer registration: Meera K.', time: '3 hr ago', color: 'text-purple-600' },
];

export default function AdminDashboard() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('overview');

  useEffect(() => {
    if (!isAuthenticated) navigate('/login');
    if (user && user.role !== 'admin') navigate('/');
  }, [isAuthenticated, user]);

  const stats = [
    { icon: DollarSign, label: 'Platform Revenue', value: '₹1.24 Cr', change: '+18.2%', bg: 'bg-green-50 dark:bg-green-950/30', color: 'text-green-600' },
    { icon: Users, label: 'Total Users', value: '24,891', change: '+342 this week', bg: 'bg-blue-50 dark:bg-blue-950/30', color: 'text-[#2874F0]' },
    { icon: ShoppingBag, label: 'Total Orders', value: '8,234', change: '+156 today', bg: 'bg-purple-50 dark:bg-purple-950/30', color: 'text-purple-600' },
    { icon: Package, label: 'Active Products', value: PRODUCTS.length.toString(), change: '+8 today', bg: 'bg-orange-50 dark:bg-orange-950/30', color: 'text-orange-600' },
    { icon: TrendingUp, label: 'Active Sellers', value: '1,247', change: '+12 pending', bg: 'bg-teal-50 dark:bg-teal-950/30', color: 'text-teal-600' },
    { icon: Shield, label: 'Commission Earned', value: '₹12.4L', change: '+8.5% MoM', bg: 'bg-red-50 dark:bg-red-950/30', color: 'text-red-600' },
  ];

  const navItems = [
    { id: 'overview', icon: BarChart2, label: 'Overview' },
    { id: 'sellers', icon: Users, label: 'Seller Approvals' },
    { id: 'products', icon: Package, label: 'Products' },
    { id: 'orders', icon: ShoppingBag, label: 'Orders' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <aside className="w-56 bg-[#172337] text-white flex flex-col flex-shrink-0">
        <div className="p-4 border-b border-white/10">
          <Link to="/" className="text-lg font-bold italic text-white">ShopMart</Link>
          <p className="text-xs text-blue-300 mt-0.5">Admin Console</p>
        </div>
        <div className="p-4 border-b border-white/10">
          <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center font-bold text-sm mb-1">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <p className="text-sm font-medium">{user?.name}</p>
          <span className="text-[10px] bg-red-500/20 text-red-300 px-1.5 py-0.5 rounded mt-1 inline-block">● Super Admin</span>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(({ id, icon: Icon, label }) => (
            <button key={id} onClick={() => setActiveSection(id)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${activeSection === id ? 'bg-[#2874F0] text-white' : 'text-gray-400 hover:bg-white/10 hover:text-white'}`}>
              <Icon size={16} /> {label}
              {id === 'sellers' && <span className="ml-auto bg-orange-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold">{PENDING_SELLERS.length}</span>}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-white/10 space-y-1">
          <Link to="/" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:bg-white/10 hover:text-white transition-colors">
            <Home size={16} /> View Store
          </Link>
          <button onClick={() => { logout(); navigate('/'); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:bg-red-500/20 hover:text-red-300 transition-colors">
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <div className="p-6">
          {activeSection === 'overview' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <h1 className="text-xl font-bold text-foreground">Platform Overview</h1>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Bell size={16} />
                  <span>{PENDING_SELLERS.length} pending approvals</span>
                </div>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
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
              {/* Activity Feed */}
              <div className="grid md:grid-cols-2 gap-5">
                <div className="bg-card rounded-xl shadow-sm overflow-hidden">
                  <div className="p-4 border-b border-border flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-foreground">Recent Activity</h2>
                    <Bell size={15} className="text-muted-foreground" />
                  </div>
                  <div className="divide-y divide-border">
                    {RECENT_ACTIVITY.map((act, i) => (
                      <div key={i} className="px-4 py-3 flex items-start gap-3">
                        <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${act.color.replace('text-', 'bg-')}`} />
                        <div className="flex-1">
                          <p className="text-sm text-foreground">{act.msg}</p>
                          <p className="text-xs text-muted-foreground">{act.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-card rounded-xl shadow-sm overflow-hidden">
                  <div className="p-4 border-b border-border"><h2 className="text-sm font-semibold text-foreground">Pending Seller Approvals</h2></div>
                  <div className="divide-y divide-border">
                    {PENDING_SELLERS.map(s => (
                      <div key={s.id} className="px-4 py-3 flex items-center gap-3">
                        <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center text-sm font-bold text-orange-600">
                          {s.name.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-foreground">{s.name}</p>
                          <p className="text-xs text-muted-foreground">{s.products} products · {s.date}</p>
                        </div>
                        <div className="flex gap-1.5">
                          <button className="p-1.5 bg-green-100 dark:bg-green-900/30 text-green-600 rounded hover:bg-green-200 transition-colors"><CheckCircle size={14} /></button>
                          <button className="p-1.5 bg-red-100 dark:bg-red-900/30 text-red-600 rounded hover:bg-red-200 transition-colors"><XCircle size={14} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'sellers' && (
            <div>
              <h1 className="text-xl font-bold text-foreground mb-5">Seller Management</h1>
              <div className="bg-card rounded-xl shadow-sm overflow-hidden">
                <div className="p-4 border-b border-border flex gap-2">
                  {['All', 'Pending', 'Active', 'Blocked'].map(f => (
                    <button key={f} className={`text-xs px-3 py-1.5 rounded-full font-medium ${f === 'Pending' ? 'bg-orange-100 text-orange-700' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>{f}</button>
                  ))}
                </div>
                <table className="w-full text-sm">
                  <thead className="bg-muted">
                    <tr>{['Seller', 'Email', 'Products', 'Applied', 'Action'].map(h => <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">{h}</th>)}</tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {PENDING_SELLERS.map(s => (
                      <tr key={s.id} className="hover:bg-muted/50">
                        <td className="px-4 py-3 font-medium text-foreground">{s.name}</td>
                        <td className="px-4 py-3 text-muted-foreground">{s.email}</td>
                        <td className="px-4 py-3 text-foreground">{s.products}</td>
                        <td className="px-4 py-3 text-muted-foreground">{s.date}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button className="flex items-center gap-1 text-xs bg-green-100 dark:bg-green-900/30 text-green-700 px-2.5 py-1 rounded font-medium hover:bg-green-200">
                              <CheckCircle size={11} /> Approve
                            </button>
                            <button className="flex items-center gap-1 text-xs bg-red-100 dark:bg-red-900/30 text-red-700 px-2.5 py-1 rounded font-medium hover:bg-red-200">
                              <XCircle size={11} /> Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeSection === 'products' && (
            <div>
              <h1 className="text-xl font-bold text-foreground mb-5">All Products ({PRODUCTS.length})</h1>
              <div className="bg-card rounded-xl shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted">
                    <tr>{['Product', 'Category', 'Price', 'Stock', 'Seller', 'Rating'].map(h => <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">{h}</th>)}</tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {PRODUCTS.slice(0, 12).map(p => (
                      <tr key={p.id} className="hover:bg-muted/50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <img src={p.images[0]} alt="" className="w-10 h-10 rounded object-cover" />
                            <span className="font-medium text-foreground max-w-[180px] truncate">{p.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{p.category}</td>
                        <td className="px-4 py-3 font-semibold text-foreground">{formatPrice(p.price)}</td>
                        <td className="px-4 py-3"><span className={p.stock > 10 ? 'text-green-600' : 'text-orange-600'}>{p.stock}</span></td>
                        <td className="px-4 py-3 text-muted-foreground max-w-[120px] truncate">{p.seller}</td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-0.5 bg-green-600 text-white text-xs px-1.5 py-0.5 rounded">{p.rating} ★</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {(activeSection === 'orders' || activeSection === 'settings') && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <AlertCircle size={48} className="text-muted-foreground mb-4" strokeWidth={1} />
              <h2 className="text-lg font-bold text-foreground mb-2">{activeSection === 'settings' ? 'System Settings' : 'Orders Management'}</h2>
              <p className="text-muted-foreground text-sm">This section is under development. Full functionality coming soon.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
