import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BarChart2, Users, Package, TrendingUp, DollarSign, Settings, LogOut, Home, Bell, CheckCircle, XCircle, AlertCircle, Shield, Search, Save, RefreshCw, Lock, Sliders, AlertTriangle, UserX, UserCheck, Trash2, Send, Eye, ShieldAlert, Flag, Wallet, ArrowDownRight, CheckCircle2, User, KeyRound, Building, ShieldCheck, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { PRODUCTS } from '@/constants/data';
import { formatPrice } from '@/lib/utils';
import { toast } from 'sonner';

// Comprehensive Sellers Data
const INITIAL_SELLERS = [
  { id: 's1', name: 'TechZone India', email: 'techzone@seller.com', date: '2026-07-28', products: 12, status: 'Pending' },
  { id: 's2', name: 'Fashion Hub', email: 'fashionhub@seller.com', date: '2026-08-01', products: 35, status: 'Pending' },
  { id: 's3', name: 'Home Essentials', email: 'homeessentials@seller.com', date: '2026-08-03', products: 8, status: 'Pending' },
  { id: 's4', name: 'Woodcraft Hub', email: 'woodcraft@seller.com', date: '2026-05-10', products: 42, status: 'Active' },
  { id: 's5', name: 'Crafty Timber Co', email: 'craftytimber@seller.com', date: '2026-04-15', products: 28, status: 'Active' },
  { id: 's6', name: 'Apex Furnishings', email: 'apex@seller.com', date: '2026-03-22', products: 5, status: 'Blocked' },
];

const RECENT_ACTIVITY = [
  { type: 'report', msg: 'Customer reported product quality issue on #p1', time: '10 min ago', color: 'text-red-500' },
  { type: 'seller', msg: 'Seller "TechZone India" awaiting approval', time: '15 min ago', color: 'text-orange-600' },
  { type: 'withdrawal', msg: 'Withdrawal of ₹1,50,000 processed to HDFC Bank', time: '30 min ago', color: 'text-green-600' },
  { type: 'user', msg: 'New customer account created: Siddharth R.', time: '45 min ago', color: 'text-purple-600' },
  { type: 'revenue', msg: 'Daily revenue target achieved: ₹2.4L', time: '2 hr ago', color: 'text-green-600' },
];

const INITIAL_USERS = [
  { id: 'u1', name: 'Priya Customer', email: 'customer@demo.com', role: 'customer', status: 'Active', joined: '2026-01-15' },
  { id: 'u2', name: 'Rahul Seller', email: 'seller@demo.com', role: 'seller', status: 'Active', joined: '2026-02-10' },
  { id: 'u3', name: 'Admin User', email: 'admin@demo.com', role: 'admin', status: 'Active', joined: '2026-01-01' },
  { id: 'u4', name: 'Vikram Mehta', email: 'vikram@example.com', role: 'customer', status: 'Active', joined: '2026-04-20' },
  { id: 'u5', name: 'Siddharth Rao', email: 'siddharth@example.com', role: 'customer', status: 'Suspended', joined: '2026-05-12' },
  { id: 'u6', name: 'Crafty Timber Co', email: 'craftytimber@seller.com', role: 'seller', status: 'Active', joined: '2026-06-01' },
];

const INITIAL_REPORTS = [
  { id: 'REP-101', customer: 'Ananya Roy', email: 'ananya@example.com', product: 'Solid Teak 6-Seater Dining Set', productId: 'p1', seller: 'Woodcraft Hub', reason: 'Cracked leg joint delivered', priority: 'High', date: '2026-08-05', status: 'Open', warningSent: false, productUnlisted: false },
  { id: 'REP-102', customer: 'Kavita Singh', email: 'kavita@example.com', product: 'Modern Velvet 3-Seater Sofa', productId: 'p2', seller: 'Home Essentials', reason: 'Upholstery color mismatch & stain', priority: 'Medium', date: '2026-08-04', status: 'In Progress', warningSent: true, productUnlisted: false },
  { id: 'REP-103', customer: 'Amit Patel', email: 'amit@example.com', product: 'Ergonomic Sheesham Study Table', productId: 'p3', seller: 'TechZone India', reason: 'Delayed assembly service (>5 days)', priority: 'Low', date: '2026-08-03', status: 'Resolved', warningSent: false, productUnlisted: false },
  { id: 'REP-104', customer: 'Rohan Sharma', email: 'rohan@example.com', product: 'King Size Storage Teak Bed', productId: 'p4', seller: 'Crafty Timber Co', reason: 'Suspected fake wood veneer coating', priority: 'High', date: '2026-08-02', status: 'Open', warningSent: false, productUnlisted: false },
  { id: 'REP-105', customer: 'Deepak V.', email: 'deepak@example.com', product: 'Solid Oak Center Table', productId: 'p5', seller: 'Apex Furnishings', reason: 'Scratched glass top on arrival', priority: 'Low', date: '2026-08-01', status: 'Open', warningSent: false, productUnlisted: false },
];

const INITIAL_WITHDRAWALS = [
  { id: 'WDR-901', date: '2026-08-06', amount: 150000, method: 'HDFC Bank (A/C ...8812)', status: 'Completed' },
  { id: 'WDR-900', date: '2026-07-28', amount: 250000, method: 'ICICI Bank (A/C ...4019)', status: 'Completed' },
  { id: 'WDR-899', date: '2026-07-15', amount: 355000, method: 'UPI (admin@hdfcbank)', status: 'Completed' },
];

export default function AdminDashboard() {
  const { user, isAuthenticated, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('overview');

  // Products State
  const [productList, setProductList] = useState(PRODUCTS);

  // Sellers State & Filtering
  const [sellersList, setSellersList] = useState(INITIAL_SELLERS);
  const [sellerStatusFilter, setSellerStatusFilter] = useState('All');

  // User Management State
  const [userList, setUserList] = useState(INITIAL_USERS);
  const [userRoleFilter, setUserRoleFilter] = useState('All');
  const [userSearch, setUserSearch] = useState('');

  // Report Management State & Action Details
  const [reportList, setReportList] = useState(INITIAL_REPORTS);
  const [reportPriorityFilter, setReportPriorityFilter] = useState('All');
  const [activeReportModal, setActiveReportModal] = useState<typeof INITIAL_REPORTS[0] | null>(null);

  // Revenue & Withdrawal State
  const [totalEarned, setTotalEarned] = useState(1240000);
  const [availableBalance, setAvailableBalance] = useState(485000);
  const [totalWithdrawn, setTotalWithdrawn] = useState(755000);
  const [withdrawals, setWithdrawals] = useState(INITIAL_WITHDRAWALS);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [payoutMethod, setPayoutMethod] = useState('HDFC Bank (A/C ...8812)');
  const [withdrawing, setWithdrawing] = useState(false);

  // Settings State & Sub-Sections
  const [activeSettingsTab, setActiveSettingsTab] = useState<'profile' | 'security' | 'commission' | 'policies'>('profile');
  const [profileForm, setProfileForm] = useState({
    name: user?.name || 'Admin User',
    email: user?.email || 'admin@demo.com',
    phone: '1800-202-9898',
  });

  const [passwordForm, setPasswordForm] = useState({ current: '', newPw: '', confirmPw: '' });
  const [commissionForm, setCommissionForm] = useState({ rate: 12, minPayout: 5000, autoWithdraw: false });
  const [policyForm, setPolicyForm] = useState({ storeName: 'WoodNest', supportEmail: 'support@woodnest.in', taxRate: 18, maintenance: false });
  const [savingSettings, setSavingSettings] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) navigate('/login');
    if (user && user.role !== 'admin') navigate('/');
  }, [isAuthenticated, user]);

  const stats = [
    { icon: DollarSign, label: 'Platform Revenue', value: '₹1.24 Cr', change: '+18.2%', bg: 'bg-green-50 dark:bg-green-950/30', color: 'text-green-600' },
    { icon: Wallet, label: 'Available Commission', value: formatPrice(availableBalance), change: 'Ready for withdrawal', bg: 'bg-emerald-50 dark:bg-emerald-950/30', color: 'text-emerald-600' },
    { icon: Users, label: 'Total Users', value: userList.length.toString(), change: '+342 this week', bg: 'bg-blue-50 dark:bg-blue-950/30', color: 'text-[#2874F0]' },
    { icon: AlertTriangle, label: 'High Priority Reports', value: reportList.filter(r => r.priority === 'High' && r.status === 'Open').length.toString(), change: 'Requires Action', bg: 'bg-rose-50 dark:bg-rose-950/30', color: 'text-rose-600' },
    { icon: Package, label: 'Active Products', value: productList.length.toString(), change: '+8 today', bg: 'bg-orange-50 dark:bg-orange-950/30', color: 'text-orange-600' },
    { icon: TrendingUp, label: 'Active Sellers', value: sellersList.filter(s => s.status === 'Active').length.toString(), change: `${sellersList.filter(s => s.status === 'Pending').length} pending`, bg: 'bg-teal-50 dark:bg-teal-950/30', color: 'text-teal-600' },
  ];

  const navItems = [
    { id: 'overview', icon: BarChart2, label: 'Overview' },
    { id: 'sellers', icon: Users, label: 'Seller Approvals' },
    { id: 'products', icon: Package, label: 'Products' },
    { id: 'users', icon: Users, label: 'User Management' },
    { id: 'reports', icon: Flag, label: 'Customer Reports' },
    { id: 'revenue', icon: Wallet, label: 'Revenue & Payouts' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

  // Seller Action Handlers
  const handleSellerAction = (sellerId: string, status: 'Active' | 'Blocked') => {
    setSellersList(prev => prev.map(s => s.id === sellerId ? { ...s, status } : s));
    toast.success(`Seller status updated to "${status}"`);
  };

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

  // Report Action Handlers (HYPER-INTERACTIVE & FULLY FUNCTIONAL)
  const handleSendSellerWarning = (reportId: string, sellerName: string) => {
    setReportList(prev => prev.map(r => r.id === reportId ? {
      ...r,
      warningSent: true,
      status: r.status === 'Open' ? 'In Progress' : r.status
    } : r));

    if (activeReportModal?.id === reportId) {
      setActiveReportModal(prev => prev ? { ...prev, warningSent: true, status: prev.status === 'Open' ? 'In Progress' : prev.status } : null);
    }

    toast.success(`Official warning notification sent to seller "${sellerName}" regarding report ${reportId}!`);
  };

  const handleRemoveProductFromListing = (reportId: string, productId: string, productName: string) => {
    setProductList(prev => prev.filter(p => p.id !== productId));
    setReportList(prev => prev.map(r => r.id === reportId ? {
      ...r,
      status: 'Resolved',
      productUnlisted: true
    } : r));

    if (activeReportModal?.id === reportId) {
      setActiveReportModal(prev => prev ? { ...prev, status: 'Resolved', productUnlisted: true } : null);
    }

    toast.success(`Product "${productName}" has been unlisted from store & report ${reportId} resolved!`);
  };

  const handleUpdateReportStatus = (reportId: string, newStatus: string) => {
    setReportList(prev => prev.map(r => r.id === reportId ? { ...r, status: newStatus } : r));

    if (activeReportModal?.id === reportId) {
      setActiveReportModal(prev => prev ? { ...prev, status: newStatus } : null);
    }

    toast.success(`Report ${reportId} marked as ${newStatus}!`);
  };

  // Revenue Withdrawal Handler
  const handleWithdrawRevenue = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(withdrawAmount);
    if (!amount || amount <= 0) {
      toast.error('Please enter a valid withdrawal amount.');
      return;
    }
    if (amount > availableBalance) {
      toast.error(`Insufficient balance. Maximum available: ${formatPrice(availableBalance)}`);
      return;
    }

    setWithdrawing(true);
    setTimeout(() => {
      setWithdrawing(false);
      setAvailableBalance(prev => prev - amount);
      setTotalWithdrawn(prev => prev + amount);

      const newTx = {
        id: `WDR-${Math.floor(100 + Math.random() * 900)}`,
        date: new Date().toISOString().split('T')[0],
        amount,
        method: payoutMethod,
        status: 'Completed',
      };

      setWithdrawals(prev => [newTx, ...prev]);
      setWithdrawAmount('');
      toast.success(`${formatPrice(amount)} successfully withdrawn to ${payoutMethod}!`);
    }, 800);
  };

  // Settings Save Handler
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser({ name: profileForm.name, email: profileForm.email });
    toast.success('Admin profile updated successfully!');
  };

  const handleSavePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPw.length < 6) {
      toast.error('New password must be at least 6 characters.');
      return;
    }
    if (passwordForm.newPw !== passwordForm.confirmPw) {
      toast.error('New passwords do not match.');
      return;
    }
    toast.success('Admin password updated successfully!');
    setPasswordForm({ current: '', newPw: '', confirmPw: '' });
  };

  // Filtered Sellers
  const filteredSellers = sellersList.filter(s => {
    if (sellerStatusFilter === 'All') return true;
    return s.status.toLowerCase() === sellerStatusFilter.toLowerCase();
  });

  // Filtered Users
  const filteredUsers = userList.filter(u => {
    const matchesRole = userRoleFilter === 'All' || u.role.toLowerCase() === userRoleFilter.toLowerCase();
    const matchesSearch = !userSearch.trim() ||
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase());
    return matchesRole && matchesSearch;
  });

  // Filtered Reports (Priority Filter: High, Medium, Low)
  const filteredReports = reportList.filter(r => {
    if (reportPriorityFilter === 'All') return true;
    return r.priority.toLowerCase() === reportPriorityFilter.toLowerCase();
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
                  {sellersList.filter(s => s.status === 'Pending').length}
                </span>
              )}
              {id === 'reports' && (
                <span className="ml-auto bg-rose-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold">
                  {reportList.filter(r => r.priority === 'High' && r.status === 'Open').length}
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
                  <span>{sellersList.filter(s => s.status === 'Pending').length} pending seller approvals</span>
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
                    {sellersList.filter(s => s.status === 'Pending').map(s => (
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
                            onClick={() => handleSellerAction(s.id, 'Active')}
                            className="p-1.5 bg-green-100 dark:bg-green-900/30 text-green-600 rounded hover:bg-green-200 transition-colors"
                          >
                            <CheckCircle size={14} />
                          </button>
                          <button
                            onClick={() => handleSellerAction(s.id, 'Blocked')}
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
              <h1 className="text-xl font-bold text-foreground mb-5">Seller Management ({filteredSellers.length})</h1>
              <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
                <div className="p-4 border-b border-border flex gap-2">
                  {['All', 'Pending', 'Active', 'Blocked'].map(filter => (
                    <button
                      key={filter}
                      onClick={() => setSellerStatusFilter(filter)}
                      className={`text-xs px-3.5 py-1.5 rounded-full font-semibold transition-colors ${
                        sellerStatusFilter === filter
                          ? 'bg-[#2874F0] text-white shadow-sm'
                          : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
                <table className="w-full text-sm">
                  <thead className="bg-muted">
                    <tr>
                      {['Seller Name', 'Email', 'Listed Products', 'Status', 'Applied Date', 'Action'].map(h => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredSellers.map(s => (
                      <tr key={s.id} className="hover:bg-muted/50">
                        <td className="px-4 py-3 font-medium text-foreground">{s.name}</td>
                        <td className="px-4 py-3 text-muted-foreground">{s.email}</td>
                        <td className="px-4 py-3 text-foreground font-semibold">{s.products}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              s.status === 'Active'
                                ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400'
                                : s.status === 'Pending'
                                ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400'
                                : 'bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400'
                            }`}
                          >
                            ● {s.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{s.date}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            {s.status !== 'Active' && (
                              <button
                                onClick={() => handleSellerAction(s.id, 'Active')}
                                className="flex items-center gap-1 text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2.5 py-1 rounded font-medium hover:bg-green-200 transition-colors"
                              >
                                <CheckCircle size={11} /> Approve
                              </button>
                            )}
                            {s.status !== 'Blocked' && (
                              <button
                                onClick={() => handleSellerAction(s.id, 'Blocked')}
                                className="flex items-center gap-1 text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-2.5 py-1 rounded font-medium hover:bg-red-200 transition-colors"
                              >
                                <XCircle size={11} /> Block
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {filteredSellers.length === 0 && (
                  <div className="p-8 text-center text-xs text-muted-foreground">
                    No sellers found matching the "{sellerStatusFilter}" filter.
                  </div>
                )}
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
                      {['Product', 'Category', 'Price', 'Seller', 'Action'].map(h => (
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
                            <span className="font-medium text-foreground max-w-[220px] truncate">{p.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{p.category}</td>
                        <td className="px-4 py-3 font-semibold text-foreground">{formatPrice(p.price)}</td>
                        <td className="px-4 py-3 text-muted-foreground max-w-[140px] truncate">{p.seller}</td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleRemoveProductFromListing(p.id, p.name, p.name)}
                            className="flex items-center gap-1 text-xs bg-rose-100 dark:bg-rose-950/40 text-rose-600 hover:bg-rose-200 px-2.5 py-1 rounded font-semibold transition-colors cursor-pointer"
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

          {/* User Management Section */}
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
                      <th className="px-4 py-3">User Role</th>
                      <th className="px-4 py-3">Account Status</th>
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
                          <span className="capitalize font-bold text-[11px] px-2.5 py-1 rounded bg-[#2874F0]/10 text-[#2874F0] border border-[#2874F0]/20 inline-block">
                            {u.role}
                          </span>
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

          {/* Customer Reports Section (FULLY FUNCTIONAL BUTTONS: Warn Seller, Unlist Item, Resolve) */}
          {activeSection === 'reports' && (
            <div className="space-y-5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-xl font-bold text-foreground">Customer Reports & Escalations</h1>
                  <p className="text-xs text-muted-foreground">Review product quality complaints and take seller enforcement actions</p>
                </div>
              </div>

              {/* Priority Filter Tabs (High, Medium, Low) */}
              <div className="flex gap-2 bg-card p-1.5 rounded-xl border border-border">
                {['All', 'High', 'Medium', 'Low'].map(prio => (
                  <button
                    key={prio}
                    onClick={() => setReportPriorityFilter(prio)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      reportPriorityFilter === prio
                        ? 'bg-[#2874F0] text-white shadow-sm'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    {prio === 'All' ? 'All Priorities' : `${prio} Priority`}
                  </button>
                ))}
              </div>

              {/* Reports Table */}
              <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-muted text-muted-foreground uppercase font-semibold">
                    <tr>
                      <th className="px-4 py-3">Report ID</th>
                      <th className="px-4 py-3">Customer</th>
                      <th className="px-4 py-3">Reported Product</th>
                      <th className="px-4 py-3">Seller</th>
                      <th className="px-4 py-3">Complaint Detail</th>
                      <th className="px-4 py-3">Priority Level</th>
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
                        <td className="px-4 py-3.5 text-foreground max-w-[180px] truncate">{rep.reason}</td>
                        <td className="px-4 py-3.5">
                          <span
                            className={`px-2.5 py-1 rounded text-[10px] font-bold ${
                              rep.priority === 'High'
                                ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400'
                                : rep.priority === 'Medium'
                                ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                                : 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400'
                            }`}
                          >
                            {rep.priority} Priority
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-right space-x-1.5">
                          {/* View Details Modal Trigger */}
                          <button
                            onClick={() => setActiveReportModal(rep)}
                            className="p-1.5 bg-muted hover:bg-muted/80 rounded text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-[11px]"
                            title="View Full Report Details"
                          >
                            <Eye size={13} />
                          </button>

                          {/* 1. Warn Seller Button */}
                          <button
                            onClick={() => handleSendSellerWarning(rep.id, rep.seller)}
                            disabled={rep.warningSent}
                            className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all inline-flex items-center gap-1 cursor-pointer ${
                              rep.warningSent
                                ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 opacity-80'
                                : 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 hover:bg-amber-200'
                            }`}
                            title="Send Official Warning Notification to Seller"
                          >
                            <Send size={12} /> {rep.warningSent ? 'Warning Sent ✓' : 'Warn Seller'}
                          </button>

                          {/* 2. Unlist Item Button */}
                          <button
                            onClick={() => handleRemoveProductFromListing(rep.id, rep.productId, rep.product)}
                            disabled={rep.productUnlisted}
                            className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all inline-flex items-center gap-1 cursor-pointer ${
                              rep.productUnlisted
                                ? 'bg-rose-100 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 opacity-80'
                                : 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 hover:bg-rose-200'
                            }`}
                            title="Unlist Product from Store"
                          >
                            <Trash2 size={12} /> {rep.productUnlisted ? 'Unlisted ✓' : 'Unlist Item'}
                          </button>

                          {/* 3. Resolve Button */}
                          <button
                            onClick={() => handleUpdateReportStatus(rep.id, rep.status === 'Resolved' ? 'Open' : 'Resolved')}
                            className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all inline-flex items-center gap-1 cursor-pointer ${
                              rep.status === 'Resolved'
                                ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300'
                                : 'bg-emerald-600 text-white hover:bg-emerald-700'
                            }`}
                          >
                            <CheckCircle size={12} /> {rep.status === 'Resolved' ? 'Resolved ✓' : 'Resolve'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {filteredReports.length === 0 && (
                  <div className="p-8 text-center text-xs text-muted-foreground">
                    No customer reports match the "{reportPriorityFilter}" priority filter.
                  </div>
                )}
              </div>

              {/* Full Report Details Modal */}
              {activeReportModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                  <div className="bg-card border border-border rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
                    <div className="flex items-center justify-between border-b border-border pb-3">
                      <div>
                        <h3 className="font-bold text-lg text-foreground">Report Ticket ({activeReportModal.id})</h3>
                        <p className="text-xs text-muted-foreground">Submitted on {activeReportModal.date}</p>
                      </div>
                      <button onClick={() => setActiveReportModal(null)} className="text-muted-foreground hover:text-foreground">
                        <X size={20} />
                      </button>
                    </div>

                    <div className="space-y-3 text-xs">
                      <div className="grid grid-cols-2 gap-3 bg-muted p-3 rounded-lg">
                        <div>
                          <span className="text-muted-foreground block">Customer:</span>
                          <span className="font-semibold text-foreground">{activeReportModal.customer}</span>
                          <span className="text-muted-foreground block text-[10px]">{activeReportModal.email}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block">Reported Seller:</span>
                          <span className="font-semibold text-foreground">{activeReportModal.seller}</span>
                        </div>
                      </div>

                      <div>
                        <span className="text-muted-foreground block mb-0.5">Reported Product Name:</span>
                        <span className="font-bold text-sm text-[#2874F0]">{activeReportModal.product}</span>
                      </div>

                      <div className="bg-rose-50 dark:bg-rose-950/30 p-3 rounded-lg border border-rose-200 dark:border-rose-900">
                        <span className="text-rose-800 dark:text-rose-300 font-bold block mb-1">Customer Complaint Reason:</span>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{activeReportModal.reason}</p>
                      </div>

                      <div className="flex justify-between items-center pt-2">
                        <div>
                          <span className="text-muted-foreground block">Priority Level:</span>
                          <span className="font-bold text-rose-600">{activeReportModal.priority}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-muted-foreground block">Current Status:</span>
                          <span className="font-bold text-emerald-600">{activeReportModal.status}</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-3 border-t border-border">
                      <button
                        onClick={() => handleSendSellerWarning(activeReportModal.id, activeReportModal.seller)}
                        disabled={activeReportModal.warningSent}
                        className="bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-white font-bold py-2 rounded-lg text-xs flex items-center justify-center gap-1 transition-colors cursor-pointer"
                      >
                        <Send size={12} /> {activeReportModal.warningSent ? 'Warning Sent' : 'Warn Seller'}
                      </button>
                      <button
                        onClick={() => handleRemoveProductFromListing(activeReportModal.id, activeReportModal.productId, activeReportModal.product)}
                        disabled={activeReportModal.productUnlisted}
                        className="bg-rose-600 hover:bg-rose-700 disabled:opacity-60 text-white font-bold py-2 rounded-lg text-xs flex items-center justify-center gap-1 transition-colors cursor-pointer"
                      >
                        <Trash2 size={12} /> {activeReportModal.productUnlisted ? 'Unlisted' : 'Unlist Item'}
                      </button>
                      <button
                        onClick={() => handleUpdateReportStatus(activeReportModal.id, activeReportModal.status === 'Resolved' ? 'Open' : 'Resolved')}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded-lg text-xs flex items-center justify-center gap-1 transition-colors cursor-pointer"
                      >
                        <CheckCircle size={12} /> {activeReportModal.status === 'Resolved' ? 'Resolved ✓' : 'Resolve'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Revenue & Commission Withdrawal Section */}
          {activeSection === 'revenue' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-xl font-bold text-foreground">Revenue & Commission Payouts</h1>
                <p className="text-xs text-muted-foreground">Withdraw accumulated platform commission fees to your verified bank account or UPI ID</p>
              </div>

              {/* Balance Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-[#2874F0] to-blue-700 text-white rounded-2xl p-5 shadow-md">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-blue-200 font-semibold uppercase tracking-wider">Available for Withdrawal</span>
                    <Wallet size={20} className="text-blue-200" />
                  </div>
                  <div className="text-3xl font-black">{formatPrice(availableBalance)}</div>
                  <div className="text-[11px] text-blue-100 mt-2 flex items-center gap-1">
                    <CheckCircle2 size={13} className="text-emerald-300" /> Ready for immediate payout
                  </div>
                </div>

                <div className="bg-card rounded-2xl p-5 border border-border shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Total Commission Earned</span>
                    <DollarSign size={20} className="text-emerald-600" />
                  </div>
                  <div className="text-3xl font-black text-foreground">{formatPrice(totalEarned)}</div>
                  <div className="text-[11px] text-emerald-600 font-semibold mt-2">+18.5% growth this month</div>
                </div>

                <div className="bg-card rounded-2xl p-5 border border-border shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Total Revenue Withdrawn</span>
                    <ArrowDownRight size={20} className="text-purple-600" />
                  </div>
                  <div className="text-3xl font-black text-foreground">{formatPrice(totalWithdrawn)}</div>
                  <div className="text-[11px] text-muted-foreground mt-2">{withdrawals.length} completed transactions</div>
                </div>
              </div>

              {/* Withdrawal Request Form & Bank Details */}
              <div className="grid md:grid-cols-12 gap-6">
                <div className="md:col-span-6 bg-card rounded-2xl p-6 border border-border shadow-sm space-y-4">
                  <h2 className="text-base font-bold text-foreground flex items-center gap-2 border-b border-border pb-3">
                    <Wallet className="text-[#2874F0]" size={20} /> Withdraw Commission Revenue
                  </h2>
                  <form onSubmit={handleWithdrawRevenue} className="space-y-4 text-xs">
                    <div>
                      <label className="block font-semibold text-foreground mb-1.5">Enter Withdrawal Amount (₹)</label>
                      <input
                        type="number"
                        placeholder="e.g. 50000"
                        value={withdrawAmount}
                        onChange={e => setWithdrawAmount(e.target.value)}
                        className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-[#2874F0]/30 font-bold"
                      />
                      <span className="text-[10px] text-muted-foreground mt-1 block">Max available: {formatPrice(availableBalance)}</span>
                    </div>

                    <div>
                      <label className="block font-semibold text-foreground mb-1.5">Destination Payout Account</label>
                      <select
                        value={payoutMethod}
                        onChange={e => setPayoutMethod(e.target.value)}
                        className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-xs text-foreground outline-none focus:ring-2 focus:ring-[#2874F0]/30 font-medium"
                      >
                        <option value="HDFC Bank (A/C ...8812)">HDFC Bank (Current A/C ...8812)</option>
                        <option value="ICICI Bank (A/C ...4019)">ICICI Bank (A/C ...4019)</option>
                        <option value="UPI (admin@hdfcbank)">Instant UPI (admin@hdfcbank)</option>
                      </select>
                    </div>

                    <button
                      type="submit"
                      disabled={withdrawing}
                      className="w-full bg-[#2874F0] hover:bg-blue-600 active:scale-[0.99] disabled:opacity-60 text-white font-bold py-3 rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer text-xs"
                    >
                      {withdrawing ? (
                        <RefreshCw size={16} className="animate-spin" />
                      ) : (
                        <>
                          <Wallet size={16} /> Process Instant Withdrawal
                        </>
                      )}
                    </button>
                  </form>
                </div>

                {/* Withdrawal History */}
                <div className="md:col-span-6 bg-card rounded-2xl p-6 border border-border shadow-sm space-y-4">
                  <h2 className="text-base font-bold text-foreground border-b border-border pb-3">Recent Payout History</h2>
                  <div className="space-y-3">
                    {withdrawals.map(w => (
                      <div key={w.id} className="flex items-center justify-between p-3 bg-muted rounded-xl text-xs">
                        <div>
                          <div className="font-bold text-foreground">{w.id}</div>
                          <div className="text-[10px] text-muted-foreground">{w.date} · {w.method}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-emerald-600">{formatPrice(w.amount)}</div>
                          <span className="text-[9px] bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 font-bold px-1.5 py-0.5 rounded">
                            {w.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Settings Section */}
          {activeSection === 'settings' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-xl font-bold text-foreground">Admin System Settings</h1>
                <p className="text-xs text-muted-foreground">Manage your admin profile, security credentials, commission rules, and platform policies</p>
              </div>

              {/* Sub-section Tabs */}
              <div className="flex gap-2 bg-card p-1.5 rounded-xl border border-border overflow-x-auto">
                {[
                  { id: 'profile', label: 'Admin Profile', icon: User },
                  { id: 'security', label: 'Security & Password', icon: KeyRound },
                  { id: 'commission', label: 'Commission Rules', icon: DollarSign },
                  { id: 'policies', label: 'Store Policies', icon: Building },
                ].map(tab => {
                  const Icon = tab.icon;
                  const isActive = activeSettingsTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveSettingsTab(tab.id as any)}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                        isActive ? 'bg-[#2874F0] text-white shadow-sm' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                      }`}
                    >
                      <Icon size={15} /> {tab.label}
                    </button>
                  );
                })}
              </div>

              {/* Sub-section 1: Admin Profile */}
              {activeSettingsTab === 'profile' && (
                <div className="bg-card rounded-2xl p-6 border border-border shadow-sm space-y-4">
                  <h2 className="text-sm font-bold text-foreground flex items-center gap-2 border-b border-border pb-3">
                    <User className="text-[#2874F0]" size={18} /> Super Admin Profile Details
                  </h2>
                  <form onSubmit={handleSaveProfile} className="space-y-4 text-xs max-w-lg">
                    <div>
                      <label className="block font-semibold text-foreground mb-1">Admin Full Name</label>
                      <input
                        type="text"
                        value={profileForm.name}
                        onChange={e => setProfileForm({ ...profileForm, name: e.target.value })}
                        className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-foreground outline-none focus:ring-2 focus:ring-[#2874F0]/30"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-foreground mb-1">Official Email Address</label>
                      <input
                        type="email"
                        value={profileForm.email}
                        onChange={e => setProfileForm({ ...profileForm, email: e.target.value })}
                        className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-foreground outline-none focus:ring-2 focus:ring-[#2874F0]/30"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-foreground mb-1">Phone Number</label>
                      <input
                        type="text"
                        value={profileForm.phone}
                        onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })}
                        className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-foreground outline-none focus:ring-2 focus:ring-[#2874F0]/30"
                      />
                    </div>
                    <button
                      type="submit"
                      className="bg-[#2874F0] hover:bg-blue-600 text-white font-bold px-5 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                    >
                      <Save size={14} /> Update Profile Info
                    </button>
                  </form>
                </div>
              )}

              {/* Sub-section 2: Security & Password */}
              {activeSettingsTab === 'security' && (
                <div className="bg-card rounded-2xl p-6 border border-border shadow-sm space-y-4">
                  <h2 className="text-sm font-bold text-foreground flex items-center gap-2 border-b border-border pb-3">
                    <KeyRound className="text-[#2874F0]" size={18} /> Change Admin Password
                  </h2>
                  <form onSubmit={handleSavePassword} className="space-y-4 text-xs max-w-lg">
                    <div>
                      <label className="block font-semibold text-foreground mb-1">Current Password</label>
                      <input
                        type="password"
                        placeholder="Enter current password"
                        value={passwordForm.current}
                        onChange={e => setPasswordForm({ ...passwordForm, current: e.target.value })}
                        required
                        className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-foreground outline-none focus:ring-2 focus:ring-[#2874F0]/30"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-foreground mb-1">New Password</label>
                      <input
                        type="password"
                        placeholder="Min 6 characters"
                        value={passwordForm.newPw}
                        onChange={e => setPasswordForm({ ...passwordForm, newPw: e.target.value })}
                        required
                        className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-foreground outline-none focus:ring-2 focus:ring-[#2874F0]/30"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-foreground mb-1">Confirm New Password</label>
                      <input
                        type="password"
                        placeholder="Repeat new password"
                        value={passwordForm.confirmPw}
                        onChange={e => setPasswordForm({ ...passwordForm, confirmPw: e.target.value })}
                        required
                        className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-foreground outline-none focus:ring-2 focus:ring-[#2874F0]/30"
                      />
                    </div>
                    <button
                      type="submit"
                      className="bg-[#2874F0] hover:bg-blue-600 text-white font-bold px-5 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                    >
                      <ShieldCheck size={14} /> Update Security Password
                    </button>
                  </form>
                </div>
              )}

              {/* Sub-section 3: Commission Management */}
              {activeSettingsTab === 'commission' && (
                <div className="bg-card rounded-2xl p-6 border border-border shadow-sm space-y-4">
                  <h2 className="text-sm font-bold text-foreground flex items-center gap-2 border-b border-border pb-3">
                    <DollarSign className="text-[#2874F0]" size={18} /> Platform Commission Rules
                  </h2>
                  <div className="grid md:grid-cols-2 gap-4 text-xs max-w-xl">
                    <div>
                      <label className="block font-semibold text-foreground mb-1">Seller Commission Fee Rate (%)</label>
                      <input
                        type="number"
                        value={commissionForm.rate}
                        onChange={e => setCommissionForm({ ...commissionForm, rate: Number(e.target.value) })}
                        className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-foreground outline-none focus:ring-2 focus:ring-[#2874F0]/30"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-foreground mb-1">Minimum Payout Threshold (₹)</label>
                      <input
                        type="number"
                        value={commissionForm.minPayout}
                        onChange={e => setCommissionForm({ ...commissionForm, minPayout: Number(e.target.value) })}
                        className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-foreground outline-none focus:ring-2 focus:ring-[#2874F0]/30"
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => toast.success('Commission rules saved!')}
                    className="bg-[#2874F0] hover:bg-blue-600 text-white font-bold px-5 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                  >
                    <Save size={14} /> Save Commission Rules
                  </button>
                </div>
              )}

              {/* Sub-section 4: Store & Platform Policies */}
              {activeSettingsTab === 'policies' && (
                <div className="bg-card rounded-2xl p-6 border border-border shadow-sm space-y-4">
                  <h2 className="text-sm font-bold text-foreground flex items-center gap-2 border-b border-border pb-3">
                    <Building className="text-[#2874F0]" size={18} /> Store & Platform Settings
                  </h2>
                  <div className="grid md:grid-cols-2 gap-4 text-xs max-w-xl">
                    <div>
                      <label className="block font-semibold text-foreground mb-1">Store Brand Name</label>
                      <input
                        type="text"
                        value={policyForm.storeName}
                        onChange={e => setPolicyForm({ ...policyForm, storeName: e.target.value })}
                        className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-foreground outline-none focus:ring-2 focus:ring-[#2874F0]/30"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-foreground mb-1">GST Tax Rate (%)</label>
                      <input
                        type="number"
                        value={policyForm.taxRate}
                        onChange={e => setPolicyForm({ ...policyForm, taxRate: Number(e.target.value) })}
                        className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-foreground outline-none focus:ring-2 focus:ring-[#2874F0]/30"
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => toast.success('Store policies updated!')}
                    className="bg-[#2874F0] hover:bg-blue-600 text-white font-bold px-5 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                  >
                    <Save size={14} /> Save Policy Changes
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
