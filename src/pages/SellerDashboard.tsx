import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BarChart2, Package, ShoppingBag, TrendingUp, DollarSign, Star, Plus, LogOut, Home, AlertCircle, Settings, Wallet, CheckCircle2, ArrowDownRight, Layers, Boxes, Trash2, Edit, Save, RefreshCw, User, KeyRound, Building, ShieldCheck, AlertTriangle, ChevronRight, Download, FileSpreadsheet, Calendar, X, FileText, Upload, Image as ImageIcon, MessageSquare, ThumbsUp } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { PRODUCTS } from '@/constants/data';
import { formatPrice } from '@/lib/utils';
import { toast } from 'sonner';

const SELLER_PRODUCTS_INITIAL = PRODUCTS.filter(p => p.seller.includes('Samsung') || p.id === 'p8' || p.id === 'p10' || p.id === 'p18').slice(0, 6);

const INITIAL_SELLER_ORDERS = [
  { id: 'ORD001', product: 'Samsung Galaxy S24 Ultra', customer: 'Priya S.', amount: 89999, status: 'shipped', date: '2026-08-01' },
  { id: 'ORD002', product: 'Samsung 55" Crystal 4K TV', customer: 'Rahul V.', amount: 46990, status: 'delivered', date: '2026-07-28' },
  { id: 'ORD003', product: 'Sony WH-1000XM5', customer: 'Anjali P.', amount: 24990, status: 'packed', date: '2026-08-03' },
  { id: 'ORD004', product: 'Samsung Washing Machine', customer: 'Vikram S.', amount: 34990, status: 'placed', date: '2026-08-04' },
];

const DEFAULT_REMOVED_PRODUCTS = [
  { id: 'p99', name: 'Vintage Sheesham Armchair', category: 'Chairs', price: 14999, seller: 'Samsung Electronics / WoodNest Seller', removedDate: '2026-08-02', reason: 'Failed quality assurance inspection - polish defect reported by multiple customers.' },
];

const INITIAL_SELLER_WITHDRAWALS = [
  { id: 'WDR-S101', date: '2026-08-05', amount: 120000, method: 'HDFC Bank (A/C ...4819)', status: 'Completed' },
  { id: 'WDR-S100', date: '2026-07-25', amount: 200000, method: 'HDFC Bank (A/C ...4819)', status: 'Completed' },
  { id: 'WDR-S099', date: '2026-07-10', amount: 300120, method: 'UPI (samsung@hdfcbank)', status: 'Completed' },
];

const INITIAL_CUSTOMER_REVIEWS = [
  { id: 'rev-1', customer: 'Ananya Roy', rating: 5, date: '2026-08-04', product: 'Solid Teak 6-Seater Dining Set', comment: 'Exquisite timber finish! Woodcraft Hub delivered ahead of schedule and the assembly team was professional.', sellerReply: 'Thank you Ananya! We take great pride in our teak wood craftsmanship.' },
  { id: 'rev-2', customer: 'Rahul Sharma', rating: 4, date: '2026-08-02', product: 'Samsung Galaxy S24 Ultra', comment: 'Great phone, camera quality is unbelievable. Delivery took 3 days instead of 2.', sellerReply: '' },
  { id: 'rev-3', customer: 'Kavita Singh', rating: 5, date: '2026-07-29', product: 'Modern Velvet 3-Seater Sofa', comment: 'Super comfortable sofa and rich emerald color velvet fabric. Fits perfectly in our living room!', sellerReply: 'Glad you loved the velvet upholstery Kavita!' },
  { id: 'rev-4', customer: 'Vikram Mehta', rating: 3, date: '2026-07-20', product: 'Ergonomic Sheesham Study Table', comment: 'Table wood quality is decent, but drawer slider was a bit stiff initially.', sellerReply: '' },
];

const STATUS_COLORS: Record<string, string> = {
  placed: 'bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400',
  packed: 'bg-orange-100 dark:bg-orange-950/40 text-orange-700 dark:text-orange-400',
  shipped: 'bg-yellow-100 dark:bg-yellow-950/40 text-yellow-800 dark:text-yellow-300',
  delivered: 'bg-green-100 dark:bg-green-950/40 text-green-700 dark:text-green-400',
  cancelled: 'bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400',
};

// DYNAMIC DATASETS FOR SALES REPORTS BY PERIOD (Weekly, Monthly, Yearly)
const SALES_PERIOD_DATA = {
  weekly: {
    unitsSold: '315 Units',
    revenue: 185400,
    aov: 21200,
    growth: '+8.4% vs last week',
    products: [
      { id: 'p1', name: 'Solid Teak 6-Seater Dining Set', category: 'Dining', price: 44999, units: 3, revenue: 134997, stock: 12 },
      { id: 'p2', name: 'Modern Velvet 3-Seater Sofa', category: 'Living Room', price: 34999, units: 1, revenue: 34999, stock: 8 },
      { id: 'p3', name: 'Ergonomic Sheesham Study Table', category: 'Study', price: 15400, units: 1, revenue: 15400, stock: 15 },
    ]
  },
  monthly: {
    unitsSold: '1,420 Units',
    revenue: 854620,
    aov: 24850,
    growth: '+18.5% growth this month',
    products: [
      { id: 'p1', name: 'Solid Teak 6-Seater Dining Set', category: 'Dining', price: 44999, units: 12, revenue: 539988, stock: 12 },
      { id: 'p2', name: 'Modern Velvet 3-Seater Sofa', category: 'Living Room', price: 34999, units: 6, revenue: 209994, stock: 8 },
      { id: 'p3', name: 'Ergonomic Sheesham Study Table', category: 'Study', price: 15400, units: 7, revenue: 107800, stock: 15 },
    ]
  },
  yearly: {
    unitsSold: '16,850 Units',
    revenue: 9840000,
    aov: 28500,
    growth: '+32.1% YoY growth',
    products: [
      { id: 'p1', name: 'Solid Teak 6-Seater Dining Set', category: 'Dining', price: 44999, units: 110, revenue: 4949890, stock: 12 },
      { id: 'p2', name: 'Modern Velvet 3-Seater Sofa', category: 'Living Room', price: 34999, units: 85, revenue: 2974915, stock: 8 },
      { id: 'p3', name: 'Ergonomic Sheesham Study Table', category: 'Study', price: 15400, units: 124, revenue: 1909600, stock: 15 },
    ]
  }
};

// Helper function to trigger browser CSV download
const downloadCSV = (filename: string, csvContent: string) => {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export default function SellerDashboard() {
  const { user, isAuthenticated, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('overview');

  // Product Management Sub-sections & Add Product Modal
  const [productSubTab, setProductSubTab] = useState<'listed' | 'stock' | 'removed'>('listed');
  const [sellerProducts, setSellerProducts] = useState(SELLER_PRODUCTS_INITIAL);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    category: 'Living Room',
    price: '',
    stock: '15',
    imageUrlInput: '',
    description: '',
  });

  // Multiple Image Files Upload State from Device (NEW FEATURE)
  const [deviceImageFiles, setDeviceImageFiles] = useState<string[]>([]);

  // Removed Items from localStorage or default
  const [removedItems, setRemovedItems] = useState<any[]>([]);

  // Orders State (Editable Status)
  const [sellerOrders, setSellerOrders] = useState(INITIAL_SELLER_ORDERS);

  // Customer Reviews State & Filters (NEW SECTION)
  const [reviewsList, setReviewsList] = useState(INITIAL_CUSTOMER_REVIEWS);
  const [reviewStarFilter, setReviewStarFilter] = useState<string>('All');
  const [sellerReplies, setSellerReplies] = useState<Record<string, string>>({});

  // Revenue & Withdrawal State
  const [availableBalance, setAvailableBalance] = useState(234500);
  const [totalRevenue, setTotalRevenue] = useState(854620);
  const [totalWithdrawn, setTotalWithdrawn] = useState(620120);
  const [withdrawals, setWithdrawals] = useState(INITIAL_SELLER_WITHDRAWALS);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [payoutAccount, setPayoutAccount] = useState('HDFC Bank (A/C ...4819)');
  const [withdrawing, setWithdrawing] = useState(false);

  // Sales Reports Period State (DYNAMICALLY RECALCULATED)
  const [reportPeriod, setReportPeriod] = useState<'weekly' | 'monthly' | 'yearly'>('monthly');

  // Settings & Sub-Sections
  const [activeSettingsTab, setActiveSettingsTab] = useState<'account' | 'profile' | 'security'>('account');
  const [accountDetails, setAccountDetails] = useState({
    accountHolder: 'Samsung Electronics India',
    bankName: 'HDFC Bank Ltd.',
    accountNumber: '50100234819201',
    ifscCode: 'HDFC0000240',
    upiId: 'samsung@hdfcbank',
    gstin: '29AAACS1234F1Z5',
  });

  const [profileForm, setProfileForm] = useState({
    storeName: 'Samsung Official Store / WoodNest Hub',
    ownerName: user?.name || 'Rahul Seller',
    email: user?.email || 'seller@demo.com',
    phone: '9876543211',
  });

  const [passwordForm, setPasswordForm] = useState({ current: '', newPw: '', confirmPw: '' });

  useEffect(() => {
    if (!isAuthenticated) navigate('/login');
    if (user && user.role !== 'seller' && user.role !== 'admin') navigate('/');
  }, [isAuthenticated, user]);

  useEffect(() => {
    // Load unlisted/removed products from localStorage
    try {
      const stored = JSON.parse(localStorage.getItem('shopmart_removed_products') || '[]');
      setRemovedItems([...stored, ...DEFAULT_REMOVED_PRODUCTS]);
    } catch {
      setRemovedItems(DEFAULT_REMOVED_PRODUCTS);
    }
  }, []);

  const stats = [
    { icon: DollarSign, label: 'Total Revenue', value: formatPrice(totalRevenue), change: '+12.5%', bg: 'bg-green-50 dark:bg-green-950/30', color: 'text-green-600' },
    { icon: Wallet, label: 'Available Payout', value: formatPrice(availableBalance), change: 'Ready to withdraw', bg: 'bg-[#2874F0]/10', color: 'text-[#2874F0]' },
    { icon: ShoppingBag, label: 'Total Orders', value: sellerOrders.length.toString(), change: '+8.2%', bg: 'bg-purple-50 dark:bg-purple-950/30', color: 'text-purple-600' },
    { icon: Package, label: 'Active Products', value: sellerProducts.length.toString(), change: '+2', bg: 'bg-orange-50 dark:bg-orange-950/30', color: 'text-orange-600' },
  ];

  const navItems = [
    { id: 'overview', icon: BarChart2, label: 'Overview' },
    { id: 'products', icon: Package, label: 'Product Management' },
    { id: 'orders', icon: ShoppingBag, label: 'Orders' },
    { id: 'revenue', icon: TrendingUp, label: 'Revenue Analytics' },
    { id: 'analytics', icon: FileSpreadsheet, label: 'Sales Reports & Analytics' },
    { id: 'reviews', icon: Star, label: 'Customer Reviews' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

  const barData = [
    { month: 'Mar', value: 65000 }, { month: 'Apr', value: 82000 }, { month: 'May', value: 74000 },
    { month: 'Jun', value: 91000 }, { month: 'Jul', value: 108000 }, { month: 'Aug', value: 95000 },
  ];
  const maxVal = Math.max(...barData.map(d => d.value));

  // Multiple File Upload Handler from Device
  const handleDeviceImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileList = Array.from(files);
    const readPromises = fileList.map(file => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (event) => resolve(event.target?.result as string);
        reader.readAsDataURL(file);
      });
    });

    Promise.all(readPromises).then(base64Images => {
      setDeviceImageFiles(prev => [...prev, ...base64Images]);
      toast.success(`${base64Images.length} image(s) loaded from device!`);
    });
  };

  const handleRemoveDeviceImage = (index: number) => {
    setDeviceImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Handler: Add New Product Form Submit
  const handleAddProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.name.trim() || !newProduct.price) {
      toast.error('Please enter product name and price.');
      return;
    }

    // Combine uploaded device images and typed URL
    const combinedImages: string[] = [...deviceImageFiles];
    if (newProduct.imageUrlInput.trim()) {
      combinedImages.push(newProduct.imageUrlInput.trim());
    }
    if (combinedImages.length === 0) {
      combinedImages.push('https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=500&q=80');
    }

    const createdProd = {
      id: `p_seller_${Date.now()}`,
      name: newProduct.name,
      category: newProduct.category,
      price: Number(newProduct.price),
      stock: Number(newProduct.stock) || 10,
      images: combinedImages,
      description: newProduct.description || 'Premium solid wood furniture item.',
      rating: 5.0,
      reviewsCount: 1,
      seller: profileForm.storeName,
      discount: 10,
    };

    setSellerProducts(prev => [createdProd, ...prev]);
    toast.success(`New product "${newProduct.name}" with ${combinedImages.length} image(s) listed successfully!`);
    setShowAddProductModal(false);
    setDeviceImageFiles([]);
    setNewProduct({
      name: '',
      category: 'Living Room',
      price: '',
      stock: '15',
      imageUrlInput: '',
      description: '',
    });
  };

  // Handler: Update Stock Count
  const handleUpdateStock = (productId: string, delta: number) => {
    setSellerProducts(prev => prev.map(p => {
      if (p.id === productId) {
        const nextStock = Math.max(0, p.stock + delta);
        toast.success(`Stock for "${p.name}" updated to ${nextStock}`);
        return { ...p, stock: nextStock };
      }
      return p;
    }));
  };

  // Handler: Update Order Status
  const handleUpdateOrderStatus = (orderId: string, newStatus: string) => {
    setSellerOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    toast.success(`Order #${orderId} status changed to "${newStatus.toUpperCase()}"!`);
  };

  // Handler: Seller Reply to Customer Review
  const handlePostSellerReply = (reviewId: string) => {
    const replyText = sellerReplies[reviewId];
    if (!replyText || !replyText.trim()) {
      toast.error('Please enter a public reply before submitting.');
      return;
    }
    setReviewsList(prev => prev.map(r => r.id === reviewId ? { ...r, sellerReply: replyText.trim() } : r));
    toast.success('Public reply posted successfully on customer review!');
    setSellerReplies(prev => ({ ...prev, [reviewId]: '' }));
  };

  // Handler: Revenue Withdrawal
  const handleWithdrawRevenue = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(withdrawAmount);
    if (!amount || amount <= 0) {
      toast.error('Please enter a valid withdrawal amount.');
      return;
    }
    if (amount > availableBalance) {
      toast.error(`Insufficient payout balance. Max available: ${formatPrice(availableBalance)}`);
      return;
    }

    setWithdrawing(true);
    setTimeout(() => {
      setWithdrawing(false);
      setAvailableBalance(prev => prev - amount);
      setTotalWithdrawn(prev => prev + amount);

      const newTx = {
        id: `WDR-S${Math.floor(102 + Math.random() * 900)}`,
        date: new Date().toISOString().split('T')[0],
        amount,
        method: payoutAccount,
        status: 'Completed',
      };

      setWithdrawals(prev => [newTx, ...prev]);
      setWithdrawAmount('');
      toast.success(`${formatPrice(amount)} requested for payout to ${accountDetails.bankName}!`);
    }, 800);
  };

  // Handler: Export Account Statement CSV
  const handleExportAccountStatement = () => {
    let csv = 'Transaction ID,Date,Amount (INR),Payout Method,Status\n';
    withdrawals.forEach(w => {
      csv += `"${w.id}","${w.date}","${w.amount}","${w.method}","${w.status}"\n`;
    });
    downloadCSV(`WoodNest_Seller_Withdrawal_Statement_${Date.now()}.csv`, csv);
    toast.success('Withdrawal account statement downloaded as CSV!');
  };

  // Handler: Export Sales Report CSV (DYNAMIC FOR PERIOD)
  const handleExportSalesReport = () => {
    const dataset = SALES_PERIOD_DATA[reportPeriod];
    let csv = `WoodNest Seller ${reportPeriod.toUpperCase()} Sales Report\n`;
    csv += `Period,Units Sold,Total Revenue (INR),AOV (INR)\n`;
    csv += `"${reportPeriod}","${dataset.unitsSold}","${dataset.revenue}","${dataset.aov}"\n\n`;
    csv += 'Product ID,Product Name,Category,Price (INR),Units Sold,Sales Revenue (INR),Stock Remaining\n';
    dataset.products.forEach(p => {
      csv += `"${p.id}","${p.name.replace(/"/g, '""')}","${p.category}","${p.price}","${p.units}","${p.revenue}","${p.stock}"\n`;
    });
    downloadCSV(`WoodNest_Seller_Sales_Report_${reportPeriod}_${Date.now()}.csv`, csv);
    toast.success(`Seller ${reportPeriod} sales & performance report exported as CSV!`);
  };

  // Handler: Save Account Details
  const handleSaveAccountDetails = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Withdrawal account details saved successfully!');
  };

  // Handler: Save Profile
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser({ name: profileForm.ownerName });
    toast.success('Seller store profile updated!');
  };

  // Handler: Save Password
  const handleSavePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPw.length < 6) {
      toast.error('New password must be at least 6 characters.');
      return;
    }
    if (passwordForm.newPw !== passwordForm.confirmPw) {
      toast.error('Passwords do not match.');
      return;
    }
    toast.success('Seller password updated successfully!');
    setPasswordForm({ current: '', newPw: '', confirmPw: '' });
  };

  // Filtered Customer Reviews
  const filteredReviews = reviewsList.filter(r => {
    if (reviewStarFilter === 'All') return true;
    if (reviewStarFilter === '5 Stars') return r.rating === 5;
    if (reviewStarFilter === '4 Stars') return r.rating === 4;
    if (reviewStarFilter === '3 Stars & Below') return r.rating <= 3;
    return true;
  });

  // Current Sales Period Dynamic Dataset
  const currentSalesData = SALES_PERIOD_DATA[reportPeriod];

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar with Official WoodNest Emblem Logo Header */}
      <aside className="w-60 bg-[#172337] text-white flex flex-col flex-shrink-0">
        <div className="p-4 border-b border-white/10">
          <Link to="/" className="flex items-center gap-2.5 group cursor-pointer" title="Return to WoodNest Home">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#2874F0] to-blue-500 flex items-center justify-center text-white font-black text-xl shadow-md group-hover:scale-105 transition-transform">
              W
            </div>
            <div>
              <div className="text-white font-extrabold text-lg leading-none tracking-tight">WoodNest</div>
              <div className="text-[10px] text-blue-300 leading-none mt-1 font-medium">Seller Portal</div>
            </div>
          </Link>
        </div>

        <div className="p-4 border-b border-white/10">
          <div className="w-10 h-10 bg-[#2874F0] rounded-full flex items-center justify-center font-bold text-sm mb-1 text-white shadow-sm">
            {user?.name?.charAt(0).toUpperCase() || 'S'}
          </div>
          <p className="text-sm font-semibold text-white truncate">{user?.name || 'Seller Store'}</p>
          <p className="text-xs text-blue-200/80 truncate">{user?.email}</p>
          <span className="text-[10px] bg-green-500/20 text-green-300 px-2 py-0.5 rounded-full mt-1.5 inline-block font-medium border border-green-400/20">
            ● Active Verified Seller
          </span>
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
            </button>
          ))}
        </nav>

        <div className="p-3 space-y-1 border-t border-white/10">
          <Link to="/" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-gray-400 hover:bg-white/10 hover:text-white transition-colors">
            <Home size={16} /> Storefront
          </Link>
          <button onClick={() => { logout(); navigate('/'); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-gray-400 hover:bg-red-500/20 hover:text-red-300 transition-colors">
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-6">
          {/* Overview Section */}
          {activeSection === 'overview' && (
            <div className="space-y-5">
              <h1 className="text-xl font-bold text-foreground">Seller Dashboard Overview</h1>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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

              {/* Monthly Revenue Chart */}
              <div className="bg-card rounded-xl p-5 shadow-sm border border-border">
                <h2 className="text-sm font-semibold text-foreground mb-4">Monthly Revenue Analytics (₹)</h2>
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

              {/* Recent Orders List */}
              <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
                <div className="p-4 border-b border-border"><h2 className="text-sm font-semibold text-foreground">Recent Orders</h2></div>
                <div className="divide-y divide-border">
                  {sellerOrders.map(o => (
                    <div key={o.id} className="flex items-center justify-between px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-foreground">{o.product}</p>
                        <p className="text-xs text-muted-foreground">{o.customer} · {o.date}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold capitalize ${STATUS_COLORS[o.status]}`}>{o.status}</span>
                        <span className="text-sm font-bold text-foreground">{formatPrice(o.amount)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Product Management Section (WITH MULTIPLE DEVICE FILE UPLOAD) */}
          {activeSection === 'products' && (
            <div className="space-y-5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-xl font-bold text-foreground">Product Management</h1>
                  <p className="text-xs text-muted-foreground">Manage your store listings, adjust inventory stocks, and review admin unlisted items</p>
                </div>
                <button
                  onClick={() => setShowAddProductModal(true)}
                  className="flex items-center gap-2 bg-[#2874F0] hover:bg-[#1D5FD1] text-white text-xs px-4 py-2.5 rounded-xl font-bold transition-all shadow-md shrink-0 cursor-pointer"
                >
                  <Plus size={16} /> Add New Product
                </button>
              </div>

              {/* Sub-Section Navigation Tabs */}
              <div className="flex gap-2 bg-card p-1.5 rounded-xl border border-border overflow-x-auto">
                {[
                  { id: 'listed', label: 'Listed Products', icon: Layers },
                  { id: 'stock', label: 'Stock Management', icon: Boxes },
                  { id: 'removed', label: 'Removed Items by Admin', icon: Trash2 },
                ].map(tab => {
                  const Icon = tab.icon;
                  const isActive = productSubTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setProductSubTab(tab.id as any)}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                        isActive ? 'bg-[#2874F0] text-white shadow-sm' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                      }`}
                    >
                      <Icon size={15} /> {tab.label}
                      {tab.id === 'removed' && removedItems.length > 0 && (
                        <span className="bg-rose-500 text-white text-[10px] rounded-full px-1.5 py-0.2 font-bold">
                          {removedItems.length}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Sub-Section 1: Listed Products */}
              {productSubTab === 'listed' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {sellerProducts.map(p => (
                    <div key={p.id} className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
                      <img src={p.images[0]} alt={p.name} className="w-full h-36 object-cover" />
                      <div className="p-4">
                        <p className="text-sm font-semibold text-foreground line-clamp-1">{p.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{p.category}</p>
                        <div className="flex items-center justify-between mt-3 pt-2 border-t border-border">
                          <span className="text-base font-bold text-foreground">{formatPrice(p.price)}</span>
                          <span className={`text-xs px-2.5 py-0.5 rounded font-semibold ${p.stock > 0 ? 'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400' : 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400'}`}>
                            {p.stock > 0 ? `${p.stock} in stock` : 'Out of stock'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Sub-Section 2: Stock Management */}
              {productSubTab === 'stock' && (
                <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-muted text-muted-foreground uppercase font-semibold">
                      <tr>
                        <th className="px-4 py-3">Product</th>
                        <th className="px-4 py-3">Category</th>
                        <th className="px-4 py-3">Unit Price</th>
                        <th className="px-4 py-3">Stock Status</th>
                        <th className="px-4 py-3 text-center">Current Quantity</th>
                        <th className="px-4 py-3 text-right">Quick Adjust</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {sellerProducts.map(p => (
                        <tr key={p.id} className="hover:bg-muted/40 transition-colors">
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-3">
                              <img src={p.images[0]} alt="" className="w-10 h-10 rounded object-cover" />
                              <span className="font-semibold text-foreground max-w-[200px] truncate">{p.name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3.5 text-muted-foreground">{p.category}</td>
                          <td className="px-4 py-3.5 font-bold text-foreground">{formatPrice(p.price)}</td>
                          <td className="px-4 py-3.5">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              p.stock > 10
                                ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400'
                                : p.stock > 0
                                ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400'
                                : 'bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400'
                            }`}>
                              ● {p.stock > 10 ? 'In Stock' : p.stock > 0 ? 'Low Stock' : 'Out of Stock'}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-center font-bold text-sm text-foreground">{p.stock}</td>
                          <td className="px-4 py-3.5 text-right">
                            <div className="inline-flex items-center gap-1 bg-muted p-1 rounded-lg border border-border">
                              <button
                                onClick={() => handleUpdateStock(p.id, -1)}
                                className="w-6 h-6 rounded bg-background hover:bg-muted text-foreground font-bold flex items-center justify-center transition-colors"
                              >
                                -
                              </button>
                              <span className="w-8 text-center font-bold text-foreground">{p.stock}</span>
                              <button
                                onClick={() => handleUpdateStock(p.id, 1)}
                                className="w-6 h-6 rounded bg-background hover:bg-muted text-foreground font-bold flex items-center justify-center transition-colors"
                              >
                                +
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Sub-Section 3: Removed Items by Admin */}
              {productSubTab === 'removed' && (
                <div className="space-y-4">
                  <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-xl flex items-center gap-3 text-xs text-amber-800 dark:text-amber-200">
                    <AlertTriangle size={18} className="shrink-0 text-amber-600" />
                    <span>The following items were unlisted by the platform admin. Click on any item to view official admin audit notes.</span>
                  </div>

                  <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-muted text-muted-foreground uppercase font-semibold">
                        <tr>
                          <th className="px-4 py-3">Product Name</th>
                          <th className="px-4 py-3">Category</th>
                          <th className="px-4 py-3">Price</th>
                          <th className="px-4 py-3">Unlisted Date</th>
                          <th className="px-4 py-3">Admin Removal Reason</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {removedItems.map(item => (
                          <tr key={item.id} className="hover:bg-muted/40 transition-colors">
                            <td className="px-4 py-3.5">
                              <div className="flex items-center gap-3">
                                <img src={item.images?.[0] || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=100&q=80'} alt="" className="w-10 h-10 rounded object-cover" />
                                <span className="font-semibold text-foreground max-w-[200px] truncate">{item.name}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3.5 text-muted-foreground">{item.category}</td>
                            <td className="px-4 py-3.5 font-bold text-foreground">{formatPrice(item.price)}</td>
                            <td className="px-4 py-3.5 text-muted-foreground">{item.removedDate}</td>
                            <td className="px-4 py-3.5">
                              <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 p-2.5 rounded-lg text-[11px] leading-relaxed max-w-md font-medium">
                                <strong>Admin Note:</strong> {item.reason}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {removedItems.length === 0 && (
                      <div className="p-8 text-center text-xs text-muted-foreground">
                        No products have been unlisted by the platform admin.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Add Product Modal (SUPPORTING MULTIPLE DEVICE FILE UPLOADS) */}
              {showAddProductModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                  <div className="bg-card border border-border rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
                    <div className="flex items-center justify-between border-b border-border pb-3">
                      <h3 className="font-bold text-lg text-foreground flex items-center gap-2">
                        <Plus className="text-[#2874F0]" size={20} /> Add New Product Listing
                      </h3>
                      <button onClick={() => setShowAddProductModal(false)} className="text-muted-foreground hover:text-foreground">
                        <X size={20} />
                      </button>
                    </div>

                    <form onSubmit={handleAddProductSubmit} className="space-y-4 text-xs">
                      <div>
                        <label className="block font-semibold text-foreground mb-1">Product Title / Name</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Modern Teak Wood Coffee Table"
                          value={newProduct.name}
                          onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
                          className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-foreground outline-none focus:ring-2 focus:ring-[#2874F0]/30 font-medium"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block font-semibold text-foreground mb-1">Category</label>
                          <select
                            value={newProduct.category}
                            onChange={e => setNewProduct({ ...newProduct, category: e.target.value })}
                            className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-foreground outline-none focus:ring-2 focus:ring-[#2874F0]/30 font-medium"
                          >
                            <option value="Living Room">Living Room</option>
                            <option value="Dining">Dining</option>
                            <option value="Bedroom">Bedroom</option>
                            <option value="Chairs">Chairs</option>
                            <option value="Tables">Tables</option>
                            <option value="Study">Study</option>
                          </select>
                        </div>
                        <div>
                          <label className="block font-semibold text-foreground mb-1">Price (₹)</label>
                          <input
                            type="number"
                            required
                            placeholder="e.g. 18999"
                            value={newProduct.price}
                            onChange={e => setNewProduct({ ...newProduct, price: e.target.value })}
                            className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-foreground outline-none focus:ring-2 focus:ring-[#2874F0]/30 font-bold"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block font-semibold text-foreground mb-1">Initial Stock Quantity</label>
                        <input
                          type="number"
                          required
                          placeholder="15"
                          value={newProduct.stock}
                          onChange={e => setNewProduct({ ...newProduct, stock: e.target.value })}
                          className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-foreground outline-none focus:ring-2 focus:ring-[#2874F0]/30 font-medium"
                        />
                      </div>

                      {/* MULTIPLE LOCAL DEVICE IMAGE FILE UPLOAD (NEW FEATURE) */}
                      <div className="bg-muted p-3.5 rounded-xl border border-border space-y-2">
                        <label className="block font-semibold text-foreground flex items-center justify-between">
                          <span className="flex items-center gap-1.5"><Upload size={14} className="text-[#2874F0]" /> Upload Product Images from Device</span>
                          <span className="text-[10px] text-muted-foreground">Select multiple images</span>
                        </label>

                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleDeviceImageUpload}
                          className="w-full text-xs text-muted-foreground file:mr-3 file:py-2 file:px-3.5 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#2874F0] file:text-white hover:file:bg-blue-600 cursor-pointer"
                        />

                        {/* Thumbnail Previews */}
                        {deviceImageFiles.length > 0 && (
                          <div className="flex gap-2 overflow-x-auto pt-2">
                            {deviceImageFiles.map((img, idx) => (
                              <div key={idx} className="relative group shrink-0">
                                <img src={img} alt={`Device upload ${idx + 1}`} className="w-14 h-14 object-cover rounded-lg border border-border" />
                                <button
                                  type="button"
                                  onClick={() => handleRemoveDeviceImage(idx)}
                                  className="absolute -top-1 -right-1 bg-rose-600 text-white rounded-full p-0.5 shadow-md hover:bg-rose-700 transition-colors"
                                >
                                  <X size={10} />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Optional Image URL Input */}
                      <div>
                        <label className="block font-semibold text-foreground mb-1">Or Add Image URL</label>
                        <input
                          type="text"
                          placeholder="https://images.unsplash.com/..."
                          value={newProduct.imageUrlInput}
                          onChange={e => setNewProduct({ ...newProduct, imageUrlInput: e.target.value })}
                          className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-foreground outline-none focus:ring-2 focus:ring-[#2874F0]/30 text-[11px]"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold text-foreground mb-1">Description</label>
                        <textarea
                          rows={2}
                          placeholder="Brief description of timber quality, dimensions, finish..."
                          value={newProduct.description}
                          onChange={e => setNewProduct({ ...newProduct, description: e.target.value })}
                          className="w-full bg-background border border-border rounded-xl p-3 text-foreground outline-none focus:ring-2 focus:ring-[#2874F0]/30"
                        />
                      </div>

                      <div className="flex gap-2 pt-2 border-t border-border">
                        <button
                          type="button"
                          onClick={() => setShowAddProductModal(false)}
                          className="flex-1 bg-muted text-foreground font-semibold py-2.5 rounded-xl transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="flex-1 bg-[#2874F0] hover:bg-blue-600 text-white font-bold py-2.5 rounded-xl transition-colors shadow-md cursor-pointer"
                        >
                          Publish Product Listing
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Orders Section */}
          {activeSection === 'orders' && (
            <div className="space-y-5">
              <div>
                <h1 className="text-xl font-bold text-foreground">Order Fulfillment</h1>
                <p className="text-xs text-muted-foreground">Update fulfillment status for customer purchases</p>
              </div>

              <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-muted text-muted-foreground uppercase font-semibold">
                    <tr>
                      <th className="px-4 py-3">Order ID</th>
                      <th className="px-4 py-3">Product Name</th>
                      <th className="px-4 py-3">Customer</th>
                      <th className="px-4 py-3">Amount</th>
                      <th className="px-4 py-3">Fulfillment Status</th>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3 text-right">Change Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {sellerOrders.map(o => (
                      <tr key={o.id} className="hover:bg-muted/40 transition-colors">
                        <td className="px-4 py-3.5 text-[#2874F0] font-bold">{o.id}</td>
                        <td className="px-4 py-3.5 font-semibold text-foreground max-w-[200px] truncate">{o.product}</td>
                        <td className="px-4 py-3.5 text-foreground">{o.customer}</td>
                        <td className="px-4 py-3.5 font-bold text-foreground">{formatPrice(o.amount)}</td>
                        <td className="px-4 py-3.5">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${STATUS_COLORS[o.status]}`}>
                            ● {o.status}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-muted-foreground">{o.date}</td>
                        <td className="px-4 py-3.5 text-right">
                          <select
                            value={o.status}
                            onChange={e => handleUpdateOrderStatus(o.id, e.target.value)}
                            className="bg-background border border-border text-foreground text-[11px] font-bold rounded-lg px-2 py-1 outline-none focus:ring-2 focus:ring-[#2874F0]/30 cursor-pointer"
                          >
                            <option value="placed">Placed</option>
                            <option value="packed">Packed</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Revenue Analytics Section */}
          {activeSection === 'revenue' && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-xl font-bold text-foreground">Revenue Analytics & Payouts</h1>
                  <p className="text-xs text-muted-foreground">Withdraw accumulated store sales revenue directly to your registered bank account</p>
                </div>
                <button
                  onClick={handleExportAccountStatement}
                  className="flex items-center gap-2 bg-[#2874F0] hover:bg-blue-600 text-white text-xs px-4 py-2.5 rounded-xl font-bold shadow-md transition-all shrink-0 cursor-pointer"
                >
                  <Download size={15} /> Export Account Statement (CSV)
                </button>
              </div>

              {/* Balance Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-[#2874F0] to-blue-700 text-white rounded-2xl p-5 shadow-md">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-blue-200 font-semibold uppercase tracking-wider">Available for Withdrawal</span>
                    <Wallet size={20} className="text-blue-200" />
                  </div>
                  <div className="text-3xl font-black">{formatPrice(availableBalance)}</div>
                  <div className="text-[11px] text-blue-100 mt-2 flex items-center gap-1">
                    <CheckCircle2 size={13} className="text-emerald-300" /> Instant seller payout enabled
                  </div>
                </div>

                <div className="bg-card rounded-2xl p-5 border border-border shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Total Sales Revenue</span>
                    <DollarSign size={20} className="text-emerald-600" />
                  </div>
                  <div className="text-3xl font-black text-foreground">{formatPrice(totalRevenue)}</div>
                  <div className="text-[11px] text-emerald-600 font-semibold mt-2">+12.5% growth vs last month</div>
                </div>

                <div className="bg-card rounded-2xl p-5 border border-border shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Total Revenue Withdrawn</span>
                    <ArrowDownRight size={20} className="text-purple-600" />
                  </div>
                  <div className="text-3xl font-black text-foreground">{formatPrice(totalWithdrawn)}</div>
                  <div className="text-[11px] text-muted-foreground mt-2">Processed to {accountDetails.bankName}</div>
                </div>
              </div>

              {/* Withdrawal Request & History Grid */}
              <div className="grid md:grid-cols-12 gap-6">
                <div className="md:col-span-6 bg-card rounded-2xl p-6 border border-border shadow-sm space-y-4">
                  <h2 className="text-base font-bold text-foreground flex items-center gap-2 border-b border-border pb-3">
                    <Wallet className="text-[#2874F0]" size={20} /> Request Revenue Payout
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
                      <span className="text-[10px] text-muted-foreground mt-1 block">Max available balance: {formatPrice(availableBalance)}</span>
                    </div>

                    <div>
                      <label className="block font-semibold text-foreground mb-1.5">Payout Bank Account</label>
                      <select
                        value={payoutAccount}
                        onChange={e => setPayoutAccount(e.target.value)}
                        className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-xs text-foreground outline-none focus:ring-2 focus:ring-[#2874F0]/30 font-semibold"
                      >
                        <option value={accountDetails.bankName}>{accountDetails.bankName} - A/C ({accountDetails.accountNumber.slice(-4)})</option>
                        <option value="UPI">{accountDetails.upiId}</option>
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
                          <Wallet size={16} /> Withdraw Revenue Now
                        </>
                      )}
                    </button>
                  </form>
                </div>

                {/* Withdrawal History Ledger Div */}
                <div className="md:col-span-6 bg-card rounded-2xl p-6 border border-border shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-border pb-3">
                    <h2 className="text-base font-bold text-foreground">Withdrawal History Ledger</h2>
                    <span className="text-xs text-muted-foreground">{withdrawals.length} transactions</span>
                  </div>

                  <div className="space-y-3">
                    {withdrawals.map(w => (
                      <div key={w.id} className="flex items-center justify-between p-3.5 bg-muted rounded-xl text-xs border border-border">
                        <div>
                          <div className="font-bold text-foreground">{w.id}</div>
                          <div className="text-[10px] text-muted-foreground mt-0.5">{w.date} · {w.method}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-emerald-600 text-sm">{formatPrice(w.amount)}</div>
                          <span className="text-[9px] bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 font-bold px-2 py-0.5 rounded-full inline-block mt-0.5">
                            ● {w.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Sales Reports & Analytics Section (FULLY DYNAMIC RECALCULATION BY PERIOD) */}
          {activeSection === 'analytics' && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-xl font-bold text-foreground">Sales Reports & Performance Analytics</h1>
                  <p className="text-xs text-muted-foreground">Monitor weekly, monthly, and yearly product selling performance with live metric updates</p>
                </div>

                <div className="flex items-center gap-3">
                  {/* Period Filter Tabs */}
                  <div className="flex bg-card p-1 rounded-xl border border-border text-xs">
                    {(['weekly', 'monthly', 'yearly'] as const).map(p => (
                      <button
                        key={p}
                        onClick={() => setReportPeriod(p)}
                        className={`px-3.5 py-1.5 rounded-lg font-semibold capitalize transition-all cursor-pointer ${
                          reportPeriod === p ? 'bg-[#2874F0] text-white shadow-sm' : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={handleExportSalesReport}
                    className="flex items-center gap-2 bg-[#2874F0] hover:bg-blue-600 text-white text-xs px-4 py-2.5 rounded-xl font-bold shadow-md transition-all cursor-pointer"
                  >
                    <Download size={15} /> Export Sales Report (CSV)
                  </button>
                </div>
              </div>

              {/* Dynamic Performance Metrics Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-card rounded-xl p-4 border border-border shadow-sm">
                  <span className="text-xs text-muted-foreground font-semibold">Total Product Units Sold</span>
                  <div className="text-2xl font-black text-foreground mt-1">{currentSalesData.unitsSold}</div>
                  <span className="text-[11px] text-emerald-600 font-semibold mt-1 inline-block">{currentSalesData.growth}</span>
                </div>

                <div className="bg-card rounded-xl p-4 border border-border shadow-sm">
                  <span className="text-xs text-muted-foreground font-semibold">Net Selling Revenue</span>
                  <div className="text-2xl font-black text-foreground mt-1">{formatPrice(currentSalesData.revenue)}</div>
                  <span className="text-[11px] text-emerald-600 font-semibold mt-1 inline-block">Active period revenue</span>
                </div>

                <div className="bg-card rounded-xl p-4 border border-border shadow-sm">
                  <span className="text-xs text-muted-foreground font-semibold">Avg. Order Value (AOV)</span>
                  <div className="text-2xl font-black text-foreground mt-1">{formatPrice(currentSalesData.aov)}</div>
                  <span className="text-[11px] text-blue-600 font-semibold mt-1 inline-block">Calculated average</span>
                </div>

                <div className="bg-card rounded-xl p-4 border border-border shadow-sm">
                  <span className="text-xs text-muted-foreground font-semibold">Store Rating Score</span>
                  <div className="text-2xl font-black text-foreground mt-1">4.8 / 5.0 ★</div>
                  <span className="text-[11px] text-amber-600 font-semibold mt-1 inline-block">Top Rated Seller</span>
                </div>
              </div>

              {/* Dynamic Product Performance Table */}
              <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
                <div className="p-4 border-b border-border flex items-center justify-between">
                  <h2 className="text-sm font-bold text-foreground">Product Sales Performance ({reportPeriod.toUpperCase()})</h2>
                  <span className="text-xs text-muted-foreground font-semibold uppercase">{reportPeriod} view</span>
                </div>
                <table className="w-full text-xs text-left">
                  <thead className="bg-muted text-muted-foreground uppercase font-semibold">
                    <tr>
                      <th className="px-4 py-3">Product Name</th>
                      <th className="px-4 py-3">Category</th>
                      <th className="px-4 py-3">Unit Price</th>
                      <th className="px-4 py-3">Units Sold ({reportPeriod})</th>
                      <th className="px-4 py-3">Period Sales Revenue</th>
                      <th className="px-4 py-3">Stock Left</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {currentSalesData.products.map(p => (
                      <tr key={p.id} className="hover:bg-muted/40 transition-colors">
                        <td className="px-4 py-3.5 font-bold text-foreground">{p.name}</td>
                        <td className="px-4 py-3.5 text-muted-foreground">{p.category}</td>
                        <td className="px-4 py-3.5 font-semibold text-foreground">{formatPrice(p.price)}</td>
                        <td className="px-4 py-3.5 font-bold text-foreground">{p.units} units</td>
                        <td className="px-4 py-3.5 font-bold text-emerald-600">{formatPrice(p.revenue)}</td>
                        <td className="px-4 py-3.5"><span className="font-semibold text-foreground">{p.stock} units</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Customer Reviews & Ratings Section (NEW SECTION) */}
          {activeSection === 'reviews' && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-xl font-bold text-foreground">Customer Reviews & Ratings</h1>
                  <p className="text-xs text-muted-foreground">Monitor buyer feedback, view star ratings, and post public seller replies</p>
                </div>

                {/* Rating Filter Tabs */}
                <div className="flex gap-1.5 bg-card p-1 rounded-xl border border-border text-xs">
                  {['All', '5 Stars', '4 Stars', '3 Stars & Below'].map(f => (
                    <button
                      key={f}
                      onClick={() => setReviewStarFilter(f)}
                      className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                        reviewStarFilter === f ? 'bg-[#2874F0] text-white shadow-sm' : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              {/* Rating Summary Header Card */}
              <div className="bg-card rounded-2xl p-6 border border-border shadow-sm grid md:grid-cols-12 gap-6 items-center">
                <div className="md:col-span-4 text-center md:text-left border-r border-border pr-6">
                  <div className="text-4xl font-black text-foreground">4.8 <span className="text-xl text-amber-500">★</span></div>
                  <div className="text-xs text-muted-foreground mt-1">Based on {reviewsList.length} verified customer reviews</div>
                  <div className="flex items-center gap-1 mt-2 justify-center md:justify-start">
                    {[1, 2, 3, 4, 5].map(star => (
                      <Star key={star} size={16} className="text-amber-500 fill-amber-500" />
                    ))}
                  </div>
                </div>

                <div className="md:col-span-8 space-y-1.5 text-xs">
                  <div className="flex items-center gap-3">
                    <span className="w-12 text-muted-foreground font-semibold">5 Stars</span>
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full" style={{ width: '75%' }} />
                    </div>
                    <span className="w-8 font-bold text-foreground">75%</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="w-12 text-muted-foreground font-semibold">4 Stars</span>
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full" style={{ width: '20%' }} />
                    </div>
                    <span className="w-8 font-bold text-foreground">20%</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="w-12 text-muted-foreground font-semibold">3 Stars</span>
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full" style={{ width: '5%' }} />
                    </div>
                    <span className="w-8 font-bold text-foreground">5%</span>
                  </div>
                </div>
              </div>

              {/* Reviews List */}
              <div className="space-y-4">
                {filteredReviews.map(rev => (
                  <div key={rev.id} className="bg-card rounded-2xl p-5 border border-border shadow-sm space-y-3">
                    <div className="flex items-center justify-between border-b border-border pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-foreground text-sm">{rev.customer}</span>
                          <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-full font-semibold">
                            ✓ Verified Buyer
                          </span>
                        </div>
                        <span className="text-[11px] text-[#2874F0] font-semibold">{rev.product}</span>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: rev.rating }).map((_, i) => (
                            <Star key={i} size={14} className="text-amber-500 fill-amber-500" />
                          ))}
                        </div>
                        <span className="text-[10px] text-muted-foreground">{rev.date}</span>
                      </div>
                    </div>

                    <p className="text-xs text-foreground leading-relaxed italic">"{rev.comment}"</p>

                    {/* Existing Seller Reply */}
                    {rev.sellerReply ? (
                      <div className="bg-muted p-3 rounded-xl text-xs space-y-1 border-l-4 border-[#2874F0]">
                        <span className="font-bold text-[#2874F0] block">Official Seller Reply:</span>
                        <p className="text-foreground">{rev.sellerReply}</p>
                      </div>
                    ) : (
                      /* Seller Reply Form */
                      <div className="pt-2 space-y-2">
                        <textarea
                          rows={2}
                          placeholder="Write an official public reply to this customer..."
                          value={sellerReplies[rev.id] || ''}
                          onChange={e => setSellerReplies({ ...sellerReplies, [rev.id]: e.target.value })}
                          className="w-full bg-background border border-border rounded-xl p-2.5 text-xs text-foreground outline-none focus:ring-2 focus:ring-[#2874F0]/30"
                        />
                        <button
                          onClick={() => handlePostSellerReply(rev.id)}
                          className="bg-[#2874F0] hover:bg-blue-600 text-white font-bold px-4 py-1.5 rounded-lg text-xs transition-colors shadow-sm cursor-pointer"
                        >
                          Submit Public Reply
                        </button>
                      </div>
                    )}
                  </div>
                ))}

                {filteredReviews.length === 0 && (
                  <div className="p-8 text-center text-xs text-muted-foreground bg-card rounded-xl border border-border">
                    No customer reviews match the "{reviewStarFilter}" filter.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Settings Section */}
          {activeSection === 'settings' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-xl font-bold text-foreground">Seller Account Settings</h1>
                <p className="text-xs text-muted-foreground">Manage your seller store profile, security credentials, and payout bank account details</p>
              </div>

              {/* Sub-Section Navigation Tabs */}
              <div className="flex gap-2 bg-card p-1.5 rounded-xl border border-border overflow-x-auto">
                {[
                  { id: 'account', label: 'Account Details (Payout Bank)', icon: Wallet },
                  { id: 'profile', label: 'Seller Profile', icon: User },
                  { id: 'security', label: 'Security & Password', icon: KeyRound },
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

              {/* Sub-Section 1: Account Details (Withdrawal Account) */}
              {activeSettingsTab === 'account' && (
                <div className="bg-card rounded-2xl p-6 border border-border shadow-sm space-y-4 max-w-xl">
                  <h2 className="text-sm font-bold text-foreground flex items-center gap-2 border-b border-border pb-3">
                    <Wallet className="text-[#2874F0]" size={18} /> Bank & Payout Account Details
                  </h2>
                  <form onSubmit={handleSaveAccountDetails} className="space-y-4 text-xs">
                    <div>
                      <label className="block font-semibold text-foreground mb-1">Account Holder Full Name</label>
                      <input
                        type="text"
                        value={accountDetails.accountHolder}
                        onChange={e => setAccountDetails({ ...accountDetails, accountHolder: e.target.value })}
                        required
                        className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-foreground outline-none focus:ring-2 focus:ring-[#2874F0]/30 font-medium"
                      />
                    </div>
                    <div className="grid md:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-semibold text-foreground mb-1">Bank Name</label>
                        <input
                          type="text"
                          value={accountDetails.bankName}
                          onChange={e => setAccountDetails({ ...accountDetails, bankName: e.target.value })}
                          required
                          className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-foreground outline-none focus:ring-2 focus:ring-[#2874F0]/30 font-medium"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-foreground mb-1">IFSC Code</label>
                        <input
                          type="text"
                          value={accountDetails.ifscCode}
                          onChange={e => setAccountDetails({ ...accountDetails, ifscCode: e.target.value })}
                          required
                          className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-foreground outline-none focus:ring-2 focus:ring-[#2874F0]/30 font-medium uppercase"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block font-semibold text-foreground mb-1">Bank Account Number</label>
                      <input
                        type="text"
                        value={accountDetails.accountNumber}
                        onChange={e => setAccountDetails({ ...accountDetails, accountNumber: e.target.value })}
                        required
                        className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-foreground outline-none focus:ring-2 focus:ring-[#2874F0]/30 font-medium"
                      />
                    </div>
                    <div className="grid md:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-semibold text-foreground mb-1">Instant UPI ID (Optional)</label>
                        <input
                          type="text"
                          value={accountDetails.upiId}
                          onChange={e => setAccountDetails({ ...accountDetails, upiId: e.target.value })}
                          className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-foreground outline-none focus:ring-2 focus:ring-[#2874F0]/30 font-medium"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-foreground mb-1">Business GSTIN</label>
                        <input
                          type="text"
                          value={accountDetails.gstin}
                          onChange={e => setAccountDetails({ ...accountDetails, gstin: e.target.value })}
                          className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-foreground outline-none focus:ring-2 focus:ring-[#2874F0]/30 font-medium uppercase"
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="bg-[#2874F0] hover:bg-blue-600 text-white font-bold px-6 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                    >
                      <Save size={14} /> Save Payout Account Details
                    </button>
                  </form>
                </div>
              )}

              {/* Sub-Section 2: Seller Profile */}
              {activeSettingsTab === 'profile' && (
                <div className="bg-card rounded-2xl p-6 border border-border shadow-sm space-y-4 max-w-xl">
                  <h2 className="text-sm font-bold text-foreground flex items-center gap-2 border-b border-border pb-3">
                    <User className="text-[#2874F0]" size={18} /> Store Profile Information
                  </h2>
                  <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
                    <div>
                      <label className="block font-semibold text-foreground mb-1">Store Brand Name</label>
                      <input
                        type="text"
                        value={profileForm.storeName}
                        onChange={e => setProfileForm({ ...profileForm, storeName: e.target.value })}
                        className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-foreground outline-none focus:ring-2 focus:ring-[#2874F0]/30 font-medium"
                      />
                    </div>
                    <div className="grid md:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-semibold text-foreground mb-1">Owner Name</label>
                        <input
                          type="text"
                          value={profileForm.ownerName}
                          onChange={e => setProfileForm({ ...profileForm, ownerName: e.target.value })}
                          className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-foreground outline-none focus:ring-2 focus:ring-[#2874F0]/30 font-medium"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-foreground mb-1">Business Email</label>
                        <input
                          type="email"
                          value={profileForm.email}
                          onChange={e => setProfileForm({ ...profileForm, email: e.target.value })}
                          className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-foreground outline-none focus:ring-2 focus:ring-[#2874F0]/30 font-medium"
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="bg-[#2874F0] hover:bg-blue-600 text-white font-bold px-6 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                    >
                      <Save size={14} /> Update Store Profile
                    </button>
                  </form>
                </div>
              )}

              {/* Sub-Section 3: Security & Password */}
              {activeSettingsTab === 'security' && (
                <div className="bg-card rounded-2xl p-6 border border-border shadow-sm space-y-4 max-w-xl">
                  <h2 className="text-sm font-bold text-foreground flex items-center gap-2 border-b border-border pb-3">
                    <KeyRound className="text-[#2874F0]" size={18} /> Update Password Credentials
                  </h2>
                  <form onSubmit={handleSavePassword} className="space-y-4 text-xs">
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
                      className="bg-[#2874F0] hover:bg-blue-600 text-white font-bold px-6 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                    >
                      <ShieldCheck size={14} /> Update Security Password
                    </button>
                  </form>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
