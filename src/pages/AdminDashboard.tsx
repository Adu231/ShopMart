import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BarChart2, Users, Package, TrendingUp, DollarSign, Settings, LogOut, Home, Bell, CheckCircle, XCircle, AlertCircle, Shield, Search, Save, RefreshCw, Lock, Sliders, AlertTriangle, UserX, UserCheck, Trash2, Send, Eye, ShieldAlert, Flag } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { PRODUCTS } from '@/constants/data';
import { formatPrice } from '@/lib/utils';
import { toast } from 'sonner';

const PENDING_SELLERS = [
  { id: 's1', name: 'TechZone India', email: 'techzone@seller.com', date: '2026-07-28', products: 12 },
  { id: 's2', name: 'Fashion Hub', email: 'fashionhub@seller.com', date: '2026-08-01', products: 35 },
  { id: 's3', name: 'Home Essentials', email: 'homeessentials@seller.com', date: '2026-08-03', products: 8 },
];

const RECENT_ACTIVITY = [
  { type: 'report', msg: 'Customer reported product quality issue on #p1', time: '10 min ago', color: 'text-red-500' },
  { type: 'seller', msg: 'Seller "TechZone India" awaiting approval', time: '15 min ago', color: 'text-orange-600' },
  { type: 'user', msg: 'New customer account created: Siddharth R.', time: '45 min ago', color: 'text-purple-600' },
  { type: 'revenue', msg: 'Daily revenue target achieved: ₹2.4L', time: '2 hr ago', color: 'text-green-600' },
  { type: 'user', msg: 'User account #u5 suspended due to policy violation', time: '3 hr ago', color: 'text-[#2874F0]' },
];

const INITIAL_USERS = [
  { id: 'u1', name: 'Priya Customer', email: 'customer@demo.com', role: 'customer', status: 'Active', joined: '2026-01-15', ordersCount: 12 },
  { id: 'u2', name: 'Rahul Seller', email: 'seller@demo.com', role: 'seller', status: 'Active', joined: '2026-02-10', ordersCount: 85 },
  { id: 'u3', name: 'Admin User', email: 'admin@demo.com', role: 'admin', status: 'Active', joined: '2026-01-01', ordersCount: 0 },
  { id: 'u4', name: 'Vikram Mehta', email: 'vikram@example.com', role: 'customer', status: 'Active', joined: '2026-04-20', ordersCount: 3 },
  { id: 'u5', name: 'Siddharth Rao', email: 'siddharth@example.com', role: 'customer', status: 'Suspended', joined: '2026-05-12', ordersCount: 1 },
  { id: 'u6', name: 'Crafty Timber Co', email: 'craftytimber@seller.com', role: 'seller', status: 'Active', joined: '2026-06-01', ordersCount: 42 },
];

const INITIAL_REPORTS = [
  { id: 'REP-101', customer: 'Ananya Roy', email: 'ananya@example.com', product: 'Solid Teak 6-Seater Dining Set', productId: 'p1', seller: 'Woodcraft Hub', reason: 'Cracked leg joint delivered', priority: 'High', date: '2026-08-05', status: 'Open' },
  { id: 'REP-102', customer: 'Kavita Singh', email: 'kavita@example.com', product: 'Modern Velvet 3-Seater Sofa', productId: 'p2', seller: 'Home Essentials', reason: 'Upholstery color mismatch & stain', priority: 'Medium', date: '2026-08-04', status: 'In Progress' },
  { id: 'REP-103', customer: 'Amit Patel', email: 'amit@example.com', product: 'Ergonomic Sheesham Study Table', productId: 'p3', seller: 'TechZone India', reason: 'Delayed assembly service (>5 days)', priority: 'Low', date: '2026-08-03', status: 'Resolved' },
  { id: 'REP-104', customer: 'Rohan Sharma', email: 'rohan@example.com', product: 'King Size Storage Teak Bed', productId: 'p4', seller: 'Crafty Timber Co', reason: 'Suspected fake wood veneer coating', priority: 'High', date: '2026-08-02', status: 'Open' },
];

export default function AdminDashboard() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('overview');

  // Products State
  const [productList, setProductList] = useState(PRODUCTS);

  // User Management State
  const [userList, setUserList] = useState(INITIAL_USERS);
  const [userRoleFilter, setUserRoleFilter] = useState('All');
  const [userSearch, setUserSearch] = useState('');

  // Report Management State
  const [reportList, setReportList] = useState(INITIAL_REPORTS);
  const [reportStatusFilter, setReportStatusFilter] = useState('All');
  const [selectedReport, setSelectedReport] = useState<typeof INITIAL_REPORTS[0] | null>(null);

  // Settings State
  const [settings, setSettings] = useState({
    storeName: 'WoodNest',
    supportEmail: 'support@woodnest.in',
    tollFreePhone: '1800-202-9898',
    commissionRate: 12,
    freeShippingThreshold: 1999,
    taxRate: 18,
    autoApproveSellers: false,
    require2FA: true,
    maintenanceMode: false,
    enableSMSNotifications: true,
  });

  const [savingSettings, setSavingSettings] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) navigate('/login');
    if (user && user.role !== 'admin') navigate('/');
  }, [isAuthenticated, user]);

  const stats = [
    { icon: DollarSign, label: 'Platform Revenue', value: '₹1.24 Cr', change: '+18.2%', bg: 'bg-green-50 dark:bg-green-950/30', color: 'text-green-600' },
    { icon: Users, label: 'Total Users', value: userList.length.toString(), change: '+342 this week', bg: 'bg-blue-50 dark:bg-blue-950/30', color: 'text-[#2874F0]' },
    { icon: AlertTriangle, label: 'Customer Reports', value: reportList.filter(r => r.status === 'Open').length.toString(), change: 'Requires Action', bg: 'bg-rose-50 dark:bg-rose-950/30', color: 'text-rose-600' },
    { icon: Package, label: 'Active Products', value: productList.length.toString(), change: '+8 today', bg: 'bg-orange-50 dark:bg-orange-950/30', color: 'text-orange-600' },
    { icon: TrendingUp, label: 'Active Sellers', value: '1,247', change: '+12 pending', bg: 'bg-teal-50 dark:bg-teal-950/30', color: 'text-teal-600' },
    { icon: Shield, label: 'Commission Earned', value: '₹12.4L', change: '+8.5% MoM', bg: 'bg-red-50 dark:bg-red-950/30', color: 'text-red-600' },
  ];

  const navItems = [
    { id: 'overview', icon: BarChart2, label: 'Overview' },
    { id: 'sellers', icon: Users, label: 'Seller Approvals' },
    { id: 'products', icon: Package, label: 'Products' },
    { id: 'users', icon: Users, label: 'User Management' },
    { id: 'reports', icon: Flag, label: 'Customer Reports' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

  // User Action Handlers
  const handleToggleUserStatus = (userId: string) => {
    setUserList(prev => prev.map(u => {
      if (u.id === userId) {
        const nextStatus = u.status === 'Active' ? 'Suspended' : 'Active';
        toast.success(`User ${u.name} account is now ${nextStatus}`);
        return { ...u, status: nextStatus };
      }
      return u;
    }));
  };

  const handleRemoveUser = (userId: string, userName: string) => {
    setUserList(prev => prev.filter(u => u.id !== userId));
    toast.success(`User account "${userName}" permanently removed.`);
  };

  const handleChangeUserRole = (userId: string, newRole: string) => {
    setUserList(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
    toast.success(`User role updated to ${newRole}`);
  };

  // Report Action Handlers
  const handleSendSellerWarning = (sellerName: string, reportId: string) => {
    toast.info(`Official policy warning notification sent to seller "${sellerName}" regarding report ${reportId}.`);
  };

  const handleRemoveProductFromListing = (productId: string, productName: string) => {
    setProductList(prev => prev.filter(p => p.id !== productId));
    setReportList(prev => prev.map(r => r.productId === productId ? { ...r, status: 'Resolved' } : r));
    toast.success(`Product "${productName}" has been removed from platform listings!`);
  };

  const handleUpdateReportStatus = (reportId: string, status: string) => {
    setReportList(prev => prev.map(r => r.id === reportId ? { ...r, status } : r));
    toast.success(`Report ${reportId} marked as ${status}`);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    setTimeout(() => {
      setSavingSettings(false);
      toast.success('Admin Console Settings saved successfully!');
    }, 600);
  };

  // Filtered Users
  const filteredUsers = userList.filter(u => {
    const matchesRole = userRoleFilter === 'All' || u.role.toLowerCase() === userRoleFilter.toLowerCase();
    const matchesSearch = !userSearch.trim() ||
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase());
    return matchesRole && matchesSearch;
  });

  // Filtered Reports
  const filteredReports = reportList.filter(r => {
    return reportStatusFilter === 'All' || r.status.toLowerCase() === reportStatusFilter.toLowerCase();
  });

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar with Official Brand Logo Header */}
      <aside className="w-60 bg-[#172337] text-white flex flex-col flex-shrink-0">
        <div className="p-4 border-b border-white/10">
          <Link to="/" className="flex items-center gap-2.5 group cursor-pointer" title="Return to WoodNest Home">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#2874F0] to-blue-500 flex items-center justify-center text-white font-black text-xl shadow-md group-hover:scale-105 transition-transform">
              W
            </div>
            <div>
              <div className="text-white font-extrabold text-lg leading-none tracking-tight">WoodNest</div>
              <div className="text-[10px] text-blue-300 leading-none mt-1 font-medium">Admin Console</div>
            </div>
          </Link>
        </div>

        <div className="p-4 border-b border-white/10 flex items-center gap-3">
          <div className="w-10 h-10 bg-[#2874F0] rounded-full flex items-center justify-center font-bold text-sm text-white shrink-0 shadow-sm">
            {user?.name?.charAt(0).toUpperCase() || 'A'}
          </div>
          <div className="truncate">
            <p className="text-sm font-semibold text-white truncate">{user?.name || 'Admin User'}</p>
            <span className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full mt-0.5 inline-block font-medium border border-blue-400/20">
              Super Admin
            </span>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => setActiveSection(id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                activeSection === id ? 'bg-[#2874F0] text-white shadow-md' : 'text-gray-400 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Icon size={16} /> {label}
              {id === 'sellers' && (
                <span className="ml-auto bg-orange-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold">
                  {PENDING_SELLERS.length}
                </span>
              )}
              {id === 'reports' && reportList.filter(r => r.status === 'Open').length > 0 && (
                <span className="ml-auto bg-rose-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold">
                  {reportList.filter(r => r.status === 'Open').length}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-3 border-t border-white/10 space-y-1">
          <Link to="/" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-gray-400 hover:bg-white/10 hover:text-white transition-colors">
            <Home size={16} /> View Store
          </Link>
          <button onClick={() => { logout(); navigate('/'); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-gray-400 hover:bg-red-500/20 hover:text-red-300 transition-colors">
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Panel Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-6">
          {/* Overview Section */}
          {activeSection === 'overview' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <h1 className="text-xl font-bold text-foreground">Platform Overview</h1>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Bell size={16} />
                  <span>{PENDING_SELLERS.length} pending seller approvals</span>
                </div>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {stats.map(({ icon: Icon, label, value, change, bg, color }) => (
                  <div key={label} className="bg-card rounded-xl p-4 shadow-sm border border-border">
                    <div className="flex items-center justify-between mb-3">
                      <div className={`${bg} p-2.5 rounded-lg`}><Icon size={18} className={color} /></div>
                      <span className="text-xs text-green-600 font-medium">{change}</span>
                    </div>
                    <p className="text-2xl font-bold text-foreground">{value}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
                  </div>
                ))}
              </div>

              {/* Activity & Approvals */}
              <div className="grid md:grid-cols-2 gap-5">
                <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
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

                <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
                  <div className="p-4 border-b border-border">
                    <h2 className="text-sm font-semibold text-foreground">Pending Seller Approvals</h2>
                  </div>
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
                          <button
                            onClick={() => toast.success(`Approved seller "${s.name}"`)}
                            className="p-1.5 bg-green-100 dark:bg-green-900/30 text-green-600 rounded hover:bg-green-200 transition-colors"
                          >
                            <CheckCircle size={14} />
                          </button>
                          <button
                            onClick={() => toast.error(`Rejected seller "${s.name}"`)}
                            className="p-1.5 bg-red-100 dark:bg-red-900/30 text-red-600 rounded hover:bg-red-200 transition-colors"
                          >
                            <XCircle size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Seller Approvals Section */}
          {activeSection === 'sellers' && (
            <div>
              <h1 className="text-xl font-bold text-foreground mb-5">Seller Management</h1>
              <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
                <div className="p-4 border-b border-border flex gap-2">
                  {['All', 'Pending', 'Active', 'Blocked'].map(f => (
                    <button
                      key={f}
                      className={`text-xs px-3 py-1.5 rounded-full font-medium ${
                        f === 'Pending' ? 'bg-orange-100 text-orange-700' : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
                <table className="w-full text-sm">
                  <thead className="bg-muted">
                    <tr>
                      {['Seller', 'Email', 'Products', 'Applied', 'Action'].map(h => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">{h}</th>
                      ))}
                    </tr>
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
                            <button
                              onClick={() => toast.success(`Approved seller "${s.name}"`)}
                              className="flex items-center gap-1 text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2.5 py-1 rounded font-medium hover:bg-green-200 transition-colors"
                            >
                              <CheckCircle size={11} /> Approve
                            </button>
                            <button
                              onClick={() => toast.error(`Rejected seller "${s.name}"`)}
                              className="flex items-center gap-1 text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-2.5 py-1 rounded font-medium hover:bg-red-200 transition-colors"
                            >
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

          {/* Products Section */}
          {activeSection === 'products' && (
            <div>
              <h1 className="text-xl font-bold text-foreground mb-5">All Products ({productList.length})</h1>
              <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted">
                    <tr>
                      {['Product', 'Category', 'Price', 'Stock', 'Seller', 'Action'].map(h => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {productList.map(p => (
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
                          <button
                            onClick={() => handleRemoveProductFromListing(p.id, p.name)}
                            className="flex items-center gap-1 text-xs bg-rose-100 dark:bg-rose-950/40 text-rose-600 hover:bg-rose-200 px-2.5 py-1 rounded font-semibold transition-colors"
                          >
                            <Trash2 size={12} /> Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* User Management Section (NEW) */}
          {activeSection === 'users' && (
            <div className="space-y-5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-xl font-bold text-foreground">User Account Management</h1>
                  <p className="text-xs text-muted-foreground">Manage platform accounts across customers, sellers, and administrators</p>
                </div>
                {/* Search */}
                <div className="relative md:w-64">
                  <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={userSearch}
                    onChange={e => setUserSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-xs border border-border rounded-lg bg-background text-foreground outline-none focus:ring-2 focus:ring-[#2874F0]/30"
                  />
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                </div>
              </div>

              {/* Role Filter Tabs */}
              <div className="flex gap-2 bg-card p-1.5 rounded-xl border border-border">
                {['All', 'Customer', 'Seller', 'Admin'].map(r => (
                  <button
                    key={r}
                    onClick={() => setUserRoleFilter(r)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      userRoleFilter === r
                        ? 'bg-[#2874F0] text-white shadow-sm'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>

              {/* Users Table */}
              <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-muted text-muted-foreground uppercase font-semibold">
                    <tr>
                      <th className="px-4 py-3">User Profile</th>
                      <th className="px-4 py-3">Role</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Joined Date</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredUsers.map(u => (
                      <tr key={u.id} className="hover:bg-muted/40 transition-colors">
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#2874F0]/10 text-[#2874F0] font-bold flex items-center justify-center text-xs">
                              {u.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-semibold text-foreground">{u.name}</div>
                              <div className="text-[10px] text-muted-foreground">{u.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <select
                            value={u.role}
                            onChange={e => handleChangeUserRole(u.id, e.target.value)}
                            className="bg-background border border-border text-foreground text-[11px] rounded px-2 py-1 font-semibold outline-none focus:ring-1 focus:ring-[#2874F0]"
                          >
                            <option value="customer">Customer</option>
                            <option value="seller">Seller</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>
                        <td className="px-4 py-3.5">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                              u.status === 'Active'
                                ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400'
                                : 'bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400'
                            }`}
                          >
                            ● {u.status}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-muted-foreground">{u.joined}</td>
                        <td className="px-4 py-3.5 text-right space-x-2">
                          <button
                            onClick={() => handleToggleUserStatus(u.id)}
                            className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
                              u.status === 'Active'
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 hover:bg-amber-200'
                                : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 hover:bg-emerald-200'
                            }`}
                          >
                            {u.status === 'Active' ? 'Suspend' : 'Activate'}
                          </button>
                          <button
                            onClick={() => handleRemoveUser(u.id, u.name)}
                            className="px-2.5 py-1 bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 hover:bg-rose-200 rounded text-[11px] font-semibold transition-colors inline-flex items-center gap-1"
                          >
                            <Trash2 size={12} /> Delete Account
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Report Management Section (NEW) */}
          {activeSection === 'reports' && (
            <div className="space-y-5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-xl font-bold text-foreground">Customer Reports & Escalations</h1>
                  <p className="text-xs text-muted-foreground">Review product quality complaints and take seller enforcement actions</p>
                </div>
              </div>

              {/* Status Filter */}
              <div className="flex gap-2 bg-card p-1.5 rounded-xl border border-border">
                {['All', 'Open', 'In Progress', 'Resolved'].map(st => (
                  <button
                    key={st}
                    onClick={() => setReportStatusFilter(st)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      reportStatusFilter === st
                        ? 'bg-[#2874F0] text-white shadow-sm'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>

              {/* Reports List */}
              <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-muted text-muted-foreground uppercase font-semibold">
                    <tr>
                      <th className="px-4 py-3">Report ID</th>
                      <th className="px-4 py-3">Customer</th>
                      <th className="px-4 py-3">Reported Product</th>
                      <th className="px-4 py-3">Seller</th>
                      <th className="px-4 py-3">Complaint Detail</th>
                      <th className="px-4 py-3">Priority</th>
                      <th className="px-4 py-3 text-right">Admin Enforcement</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredReports.map(rep => (
                      <tr key={rep.id} className="hover:bg-muted/40 transition-colors">
                        <td className="px-4 py-3.5 font-bold text-[#2874F0]">{rep.id}</td>
                        <td className="px-4 py-3.5">
                          <div className="font-semibold text-foreground">{rep.customer}</div>
                          <div className="text-[10px] text-muted-foreground">{rep.email}</div>
                        </td>
                        <td className="px-4 py-3.5 font-semibold text-foreground max-w-[160px] truncate">{rep.product}</td>
                        <td className="px-4 py-3.5 text-muted-foreground">{rep.seller}</td>
                        <td className="px-4 py-3.5 text-foreground max-w-[200px] truncate">{rep.reason}</td>
                        <td className="px-4 py-3.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              rep.priority === 'High'
                                ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400'
                                : rep.priority === 'Medium'
                                ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                                : 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400'
                            }`}
                          >
                            {rep.priority}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-right space-x-1.5">
                          <button
                            onClick={() => handleSendSellerWarning(rep.seller, rep.id)}
                            className="px-2.5 py-1 bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 hover:bg-amber-200 rounded text-[11px] font-semibold transition-colors inline-flex items-center gap-1"
                            title="Send Official Warning to Seller"
                          >
                            <Send size={12} /> Warn Seller
                          </button>
                          <button
                            onClick={() => handleRemoveProductFromListing(rep.productId, rep.product)}
                            className="px-2.5 py-1 bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 hover:bg-rose-200 rounded text-[11px] font-semibold transition-colors inline-flex items-center gap-1"
                            title="Unlist Product from Store"
                          >
                            <Trash2 size={12} /> Unlist Item
                          </button>
                          <button
                            onClick={() => handleUpdateReportStatus(rep.id, 'Resolved')}
                            className="px-2.5 py-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 hover:bg-emerald-200 rounded text-[11px] font-semibold transition-colors"
                          >
                            Resolve
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Settings Section (FULLY FUNCTIONAL) */}
          {activeSection === 'settings' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-xl font-bold text-foreground">Admin System Settings</h1>
                <p className="text-xs text-muted-foreground">Configure store defaults, seller commission fees, tax rates, and security policies</p>
              </div>

              <form onSubmit={handleSaveSettings} className="space-y-6">
                {/* General Settings Card */}
                <div className="bg-card rounded-xl p-6 border border-border shadow-sm space-y-4">
                  <h2 className="text-sm font-bold text-foreground flex items-center gap-2 border-b border-border pb-3">
                    <Sliders className="text-[#2874F0]" size={18} /> General Store Configuration
                  </h2>
                  <div className="grid md:grid-cols-3 gap-4 text-xs">
                    <div>
                      <label className="block font-semibold text-foreground mb-1">Store Name</label>
                      <input
                        type="text"
                        value={settings.storeName}
                        onChange={e => setSettings({ ...settings, storeName: e.target.value })}
                        className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground outline-none focus:ring-2 focus:ring-[#2874F0]/30"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-foreground mb-1">Support Email</label>
                      <input
                        type="email"
                        value={settings.supportEmail}
                        onChange={e => setSettings({ ...settings, supportEmail: e.target.value })}
                        className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground outline-none focus:ring-2 focus:ring-[#2874F0]/30"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-foreground mb-1">Toll-Free Support Line</label>
                      <input
                        type="text"
                        value={settings.tollFreePhone}
                        onChange={e => setSettings({ ...settings, tollFreePhone: e.target.value })}
                        className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground outline-none focus:ring-2 focus:ring-[#2874F0]/30"
                      />
                    </div>
                  </div>
                </div>

                {/* Financial Rules Card */}
                <div className="bg-card rounded-xl p-6 border border-border shadow-sm space-y-4">
                  <h2 className="text-sm font-bold text-foreground flex items-center gap-2 border-b border-border pb-3">
                    <DollarSign className="text-[#2874F0]" size={18} /> Commission & Tax Settings
                  </h2>
                  <div className="grid md:grid-cols-3 gap-4 text-xs">
                    <div>
                      <label className="block font-semibold text-foreground mb-1">Seller Commission Rate (%)</label>
                      <input
                        type="number"
                        value={settings.commissionRate}
                        onChange={e => setSettings({ ...settings, commissionRate: Number(e.target.value) })}
                        className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground outline-none focus:ring-2 focus:ring-[#2874F0]/30"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-foreground mb-1">Free Shipping Min Threshold (₹)</label>
                      <input
                        type="number"
                        value={settings.freeShippingThreshold}
                        onChange={e => setSettings({ ...settings, freeShippingThreshold: Number(e.target.value) })}
                        className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground outline-none focus:ring-2 focus:ring-[#2874F0]/30"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-foreground mb-1">Standard GST Tax Rate (%)</label>
                      <input
                        type="number"
                        value={settings.taxRate}
                        onChange={e => setSettings({ ...settings, taxRate: Number(e.target.value) })}
                        className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground outline-none focus:ring-2 focus:ring-[#2874F0]/30"
                      />
                    </div>
                  </div>
                </div>

                {/* Security & Access Toggles */}
                <div className="bg-card rounded-xl p-6 border border-border shadow-sm space-y-4">
                  <h2 className="text-sm font-bold text-foreground flex items-center gap-2 border-b border-border pb-3">
                    <Lock className="text-[#2874F0]" size={18} /> Security & System Policies
                  </h2>
                  <div className="space-y-3 text-xs">
                    <label className="flex items-center justify-between p-3 bg-muted rounded-lg cursor-pointer">
                      <div>
                        <div className="font-semibold text-foreground">Enforce Two-Factor Authentication (2FA) for Admins & Sellers</div>
                        <div className="text-muted-foreground text-[11px]">Require OTP verification upon portal sign in.</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.require2FA}
                        onChange={e => setSettings({ ...settings, require2FA: e.target.checked })}
                        className="w-4 h-4 text-[#2874F0] rounded border-border"
                      />
                    </label>

                    <label className="flex items-center justify-between p-3 bg-muted rounded-lg cursor-pointer">
                      <div>
                        <div className="font-semibold text-foreground">Auto-Approve Verified Sellers</div>
                        <div className="text-muted-foreground text-[11px]">Bypass manual review for sellers with verified GSTIN credentials.</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.autoApproveSellers}
                        onChange={e => setSettings({ ...settings, autoApproveSellers: e.target.checked })}
                        className="w-4 h-4 text-[#2874F0] rounded border-border"
                      />
                    </label>
                  </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={savingSettings}
                    className="bg-[#2874F0] hover:bg-blue-600 text-white font-bold px-6 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer"
                  >
                    {savingSettings ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
                    {savingSettings ? 'Saving Settings...' : 'Save Settings Changes'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
