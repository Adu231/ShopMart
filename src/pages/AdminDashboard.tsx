import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BarChart2, Users, Package, TrendingUp, DollarSign, Settings, LogOut, Home, Bell, CheckCircle, XCircle, AlertCircle, Shield, Search, Save, RefreshCw, Lock, Sliders, AlertTriangle, UserX, UserCheck, Trash2, Send, Eye, ShieldAlert, Flag, Wallet, ArrowDownRight, CheckCircle2, User, KeyRound, Building, ShieldCheck, X, Download, FileSpreadsheet, FileText, Tag, Copy, Percent, Plus, Ticket, Calendar, ArrowRight, Upload, Image as ImageIcon, Sparkles } from 'lucide-react';
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

const INITIAL_COUPONS = [
  {
    id: 'coup-1',
    code: 'WOODFEST50',
    title: 'Grand WoodFest 50% Flat Savings',
    discountType: 'percentage',
    discountValue: 50,
    minOrderValue: 4999,
    maxDiscount: 2500,
    expiryDate: '2026-12-31',
    usageLimit: 500,
    usedCount: 142,
    category: 'All Categories',
    status: 'Active',
  },
  {
    id: 'coup-2',
    code: 'WOODNIGHT20',
    title: 'Night Owl 20% Instant Discount',
    discountType: 'percentage',
    discountValue: 20,
    minOrderValue: 2999,
    maxDiscount: 1500,
    expiryDate: '2026-10-15',
    usageLimit: 300,
    usedCount: 89,
    category: 'Living Room',
    status: 'Active',
  },
  {
    id: 'coup-3',
    code: 'WELCOME100',
    title: 'New Customer ₹100 Flat Voucher',
    discountType: 'fixed',
    discountValue: 100,
    minOrderValue: 999,
    maxDiscount: 100,
    expiryDate: '2026-12-31',
    usageLimit: 1000,
    usedCount: 310,
    category: 'All Categories',
    status: 'Active',
  },
  {
    id: 'coup-4',
    code: 'TEAKSPECIAL',
    title: 'Teak Dining Table 30% OFF Special',
    discountType: 'percentage',
    discountValue: 30,
    minOrderValue: 9999,
    maxDiscount: 3500,
    expiryDate: '2026-07-31',
    usageLimit: 100,
    usedCount: 45,
    category: 'Dining',
    status: 'Expired',
  },
];

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

export default function AdminDashboard() {
  const { user, isAuthenticated, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('overview');

  // Products State
  const [productList, setProductList] = useState(PRODUCTS);

  // Mandatory Product Removal Reason Modal State
  const [pendingRemoval, setPendingRemoval] = useState<{ id: string; name: string; reportId?: string } | null>(null);
  const [removalReasonInput, setRemovalReasonInput] = useState('');

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

  // COUPON MANAGEMENT STATE
  const [couponsList, setCouponsList] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('shopmart_coupons') || '[]');
      return saved.length > 0 ? saved : INITIAL_COUPONS;
    } catch {
      return INITIAL_COUPONS;
    }
  });
  const [couponFilter, setCouponFilter] = useState<'All' | 'Active' | 'Expired'>('All');
  const [showAddCouponModal, setShowAddCouponModal] = useState(false);
  const [newCoupon, setNewCoupon] = useState({
    code: '',
    title: '',
    discountType: 'percentage',
    discountValue: '20',
    minOrderValue: '1999',
    maxDiscount: '1000',
    expiryDate: '2026-12-31',
    usageLimit: '200',
    category: 'All Categories',
  });

  // LANDING PAGE & HERO BANNERS MANAGEMENT STATE (NEW FEATURE)
  const [landingSettings, setLandingSettings] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('shopmart_landing_settings') || '{}');
      return {
        announcementText: saved.announcementText || "🔥 GRAND WOODFEST SALE: FLAT 50% OFF + EXTRA ₹500 OFF WITH COUPON 'WOODFEST50' | FREE EXPRESS FREIGHT ON ALL ORDERS!",
        announcementEnabled: saved.announcementEnabled !== undefined ? saved.announcementEnabled : true,
        discountBadgeText: saved.discountBadgeText || "GRAND WOODFEST SALE 50% OFF",
        heroSlides: saved.heroSlides?.length > 0 ? saved.heroSlides : [
          {
            id: 'slide-1',
            title: 'Crafting Timeless Comfort for Every Room',
            subtitle: '100% Solid Teak Wood Furniture with Lifetime Warranty & Free Assembly.',
            bgColor: 'from-amber-900 via-amber-800 to-[#172337]',
            cta: 'Explore Teak Collections',
            badgeText: 'GRAND FESTIVAL SALE',
            image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80',
            link: '/products',
          },
          {
            id: 'slide-2',
            title: 'Modern Living Room Velvet Sofas',
            subtitle: 'Plush velvet upholstery, high-density foam, & royal emerald finish.',
            bgColor: 'from-emerald-900 via-teal-800 to-[#172337]',
            cta: 'Shop Sofas & Recliners',
            badgeText: 'FLAT 40% OFF',
            image: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=1200&q=80',
            link: '/products',
          },
        ],
      };
    } catch {
      return {
        announcementText: "🔥 GRAND WOODFEST SALE: FLAT 50% OFF + EXTRA ₹500 OFF WITH COUPON 'WOODFEST50' | FREE EXPRESS FREIGHT ON ALL ORDERS!",
        announcementEnabled: true,
        discountBadgeText: "GRAND WOODFEST SALE 50% OFF",
        heroSlides: [
          {
            id: 'slide-1',
            title: 'Crafting Timeless Comfort for Every Room',
            subtitle: '100% Solid Teak Wood Furniture with Lifetime Warranty & Free Assembly.',
            bgColor: 'from-amber-900 via-amber-800 to-[#172337]',
            cta: 'Explore Teak Collections',
            badgeText: 'GRAND FESTIVAL SALE',
            image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80',
            link: '/products',
          },
        ],
      };
    }
  });

  const [showAddSlideModal, setShowAddSlideModal] = useState(false);
  const [newSlide, setNewSlide] = useState({
    title: '',
    subtitle: '',
    badgeText: 'FESTIVAL SPECIAL',
    cta: 'Explore Offer Now',
    image: '',
    link: '/products',
  });

  // Settings State & Sub-Sections
  const [activeSettingsTab, setActiveSettingsTab] = useState<'profile' | 'security' | 'commission' | 'policies'>('profile');
  const [profileForm, setProfileForm] = useState({
    name: user?.name || 'Super Admin',
    email: user?.email || 'admin@woodnest.com',
    phone: '+91 98765 43210',
  });
  const [passwordForm, setPasswordForm] = useState({ current: '', newPw: '', confirmPw: '' });

  const adminBarData = [
    { month: 'Mar', value: 140000 },
    { month: 'Apr', value: 185000 },
    { month: 'May', value: 210000 },
    { month: 'Jun', value: 245000 },
    { month: 'Jul', value: 280000 },
    { month: 'Aug', value: 180000 },
  ];
  const maxAdminVal = Math.max(...adminBarData.map(d => d.value));

  useEffect(() => {
    if (!isAuthenticated) navigate('/login');
    if (user && user.role !== 'admin') navigate('/');
  }, [isAuthenticated, user]);

  useEffect(() => {
    try {
      localStorage.setItem('shopmart_coupons', JSON.stringify(couponsList));
    } catch (e) {
      console.error(e);
    }
  }, [couponsList]);

  const stats = [
    { icon: DollarSign, label: 'Platform Revenue', value: '₹1.24 Cr', change: '+18.2%', bg: 'bg-green-50 dark:bg-green-950/30', color: 'text-green-600' },
    { icon: Wallet, label: 'Available Commission', value: formatPrice(availableBalance), change: 'Ready for withdrawal', bg: 'bg-emerald-50 dark:bg-emerald-950/30', color: 'text-emerald-600' },
    { icon: Users, label: 'Total Users', value: userList.length.toString(), change: '+342 this week', bg: 'bg-blue-50 dark:bg-blue-950/30', color: 'text-[#2874F0]' },
    { icon: Tag, label: 'Active Coupons', value: couponsList.filter(c => c.status === 'Active').length.toString(), change: 'Live promos', bg: 'bg-indigo-50 dark:bg-indigo-950/30', color: 'text-indigo-600' },
    { icon: AlertTriangle, label: 'High Priority Reports', value: reportList.filter(r => r.priority === 'High' && r.status === 'Open').length.toString(), change: 'Requires Action', bg: 'bg-rose-50 dark:bg-rose-950/30', color: 'text-rose-600' },
    { icon: Package, label: 'Active Products', value: productList.length.toString(), change: '+8 today', bg: 'bg-orange-50 dark:bg-orange-950/30', color: 'text-orange-600' },
  ];

  const navItems = [
    { id: 'overview', icon: BarChart2, label: 'Overview' },
    { id: 'landing', icon: Sliders, label: 'Landing Page & Banners' },
    { id: 'sellers', icon: Users, label: 'Seller Approvals' },
    { id: 'products', icon: Package, label: 'Products' },
    { id: 'users', icon: Users, label: 'User Management' },
    { id: 'coupons', icon: Tag, label: 'Coupon Management' },
    { id: 'reports', icon: Flag, label: 'Customer Reports' },
    { id: 'revenue', icon: Wallet, label: 'Revenue & Payouts' },
    { id: 'exports', icon: FileText, label: 'Reports & Export Portal' },
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
        toast.success(`User "${u.name}" account set to ${nextStatus}`);
        return { ...u, status: nextStatus };
      }
      return u;
    }));
  };

  const handleRemoveUser = (userId: string, userName: string) => {
    setUserList(prev => prev.filter(u => u.id !== userId));
    toast.success(`User account "${userName}" permanently removed.`);
  };

  // Trigger Product Removal Modal
  const initiateProductRemoval = (productId: string, productName: string, reportId?: string) => {
    setPendingRemoval({ id: productId, name: productName, reportId });
    setRemovalReasonInput('');
  };

  // Confirm Product Removal with Mandatory Reason
  const confirmProductRemoval = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingRemoval) return;
    if (!removalReasonInput.trim()) {
      toast.error('Please enter a valid reason for product removal.');
      return;
    }

    const targetProd = productList.find(p => p.id === pendingRemoval.id);
    const prodName = targetProd?.name || pendingRemoval.name;

    setProductList(prev => prev.filter(p => p.id !== pendingRemoval.id));

    if (pendingRemoval.reportId) {
      setReportList(prev => prev.map(r => r.id === pendingRemoval.reportId ? {
        ...r,
        status: 'Resolved',
        productUnlisted: true
      } : r));
    }

    const removedItem = {
      id: pendingRemoval.id,
      name: prodName,
      category: targetProd?.category || 'Furniture',
      price: targetProd?.price || 19999,
      images: targetProd?.images || ['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=500&q=80'],
      seller: targetProd?.seller || 'Samsung Electronics / WoodNest Seller',
      removedDate: new Date().toISOString().split('T')[0],
      reason: removalReasonInput.trim(),
    };

    const existing = JSON.parse(localStorage.getItem('shopmart_removed_products') || '[]');
    localStorage.setItem('shopmart_removed_products', JSON.stringify([removedItem, ...existing]));

    toast.success(`Product "${prodName}" unlisted and removal reason recorded.`);
    setPendingRemoval(null);
    setRemovalReasonInput('');
  };

  // LANDING PAGE SETTINGS HANDLERS
  const handleSaveLandingSettings = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      localStorage.setItem('shopmart_landing_settings', JSON.stringify(landingSettings));
      window.dispatchEvent(new Event('storage'));
      toast.success('Landing Page headlines, offer announcement ticker & hero slides updated live!');
    } catch (err) {
      toast.error('Failed to save landing page settings.');
    }
  };

  const handleDeviceSlideImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setNewSlide(prev => ({ ...prev, image: base64 }));
      toast.success('Hero slide image loaded from device!');
    };
    reader.readAsDataURL(file);
  };

  const handleAddSlideSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSlide.title.trim() || !newSlide.subtitle.trim()) {
      toast.error('Please enter headline title and subtitle.');
      return;
    }

    const createdSlide = {
      id: `slide-${Date.now()}`,
      title: newSlide.title.trim(),
      subtitle: newSlide.subtitle.trim(),
      bgColor: 'from-amber-900 via-amber-800 to-[#172337]',
      cta: newSlide.cta || 'Shop Now',
      badgeText: newSlide.badgeText || 'SPECIAL OFFER',
      image: newSlide.image || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80',
      link: newSlide.link || '/products',
    };

    const updated = {
      ...landingSettings,
      heroSlides: [...landingSettings.heroSlides, createdSlide]
    };

    setLandingSettings(updated);
    try {
      localStorage.setItem('shopmart_landing_settings', JSON.stringify(updated));
      window.dispatchEvent(new Event('storage'));
    } catch (e) {}

    toast.success('New Hero Banner slide added to storefront!');
    setShowAddSlideModal(false);
    setNewSlide({ title: '', subtitle: '', badgeText: 'FESTIVAL SPECIAL', cta: 'Explore Offer Now', image: '', link: '/products' });
  };

  const handleRemoveSlide = (slideId: string) => {
    const updated = {
      ...landingSettings,
      heroSlides: landingSettings.heroSlides.filter(s => s.id !== slideId)
    };
    setLandingSettings(updated);
    try {
      localStorage.setItem('shopmart_landing_settings', JSON.stringify(updated));
      window.dispatchEvent(new Event('storage'));
    } catch (e) {}
    toast.error('Hero slide removed.');
  };

  // COUPON ACTION HANDLERS
  const handleAddCouponSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCoupon.code.trim() || !newCoupon.title.trim()) {
      toast.error('Please enter promo code and coupon title.');
      return;
    }

    const formattedCode = newCoupon.code.trim().toUpperCase().replace(/\s+/g, '');
    if (couponsList.some(c => c.code === formattedCode)) {
      toast.error(`Coupon code "${formattedCode}" already exists!`);
      return;
    }

    const createdCoupon = {
      id: `coup-${Date.now()}`,
      code: formattedCode,
      title: newCoupon.title.trim(),
      discountType: newCoupon.discountType as 'percentage' | 'fixed',
      discountValue: Number(newCoupon.discountValue) || 10,
      minOrderValue: Number(newCoupon.minOrderValue) || 999,
      maxDiscount: Number(newCoupon.maxDiscount) || 1000,
      expiryDate: newCoupon.expiryDate || '2026-12-31',
      usageLimit: Number(newCoupon.usageLimit) || 100,
      usedCount: 0,
      category: newCoupon.category,
      status: 'Active',
    };

    setCouponsList(prev => [createdCoupon, ...prev]);
    toast.success(`New coupon "${formattedCode}" published successfully!`);
    setShowAddCouponModal(false);
    setNewCoupon({
      code: '',
      title: '',
      discountType: 'percentage',
      discountValue: '20',
      minOrderValue: '1999',
      maxDiscount: '1000',
      expiryDate: '2026-12-31',
      usageLimit: '200',
      category: 'All Categories',
    });
  };

  const handleToggleCouponStatus = (couponId: string) => {
    setCouponsList(prev => prev.map(c => {
      if (c.id === couponId) {
        const nextStatus = c.status === 'Active' ? 'Inactive' : 'Active';
        toast.success(`Coupon ${c.code} status changed to ${nextStatus}!`);
        return { ...c, status: nextStatus };
      }
      return c;
    }));
  };

  const handleDeleteCoupon = (couponId: string, code: string) => {
    setCouponsList(prev => prev.filter(c => c.id !== couponId));
    toast.error(`Coupon promo code "${code}" deleted.`);
  };

  const handleCopyCoupon = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success(`Coupon code "${code}" copied to clipboard!`);
  };

  // Report Action Handlers
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
      toast.success(`${formatPrice(amount)} withdrawn to ${payoutMethod}!`);
    }, 800);
  };

  // CSV Report Exports
  const exportUsersReport = () => {
    let csv = 'User ID,Full Name,Email Address,Role,Account Status,Joined Date\n';
    userList.forEach(u => {
      csv += `"${u.id}","${u.name}","${u.email}","${u.role}","${u.status}","${u.joined}"\n`;
    });
    downloadCSV(`WoodNest_Admin_Users_Report_${Date.now()}.csv`, csv);
    toast.success('Users list report exported as CSV!');
  };

  const exportRevenueReport = () => {
    let csv = 'Withdrawal ID,Date,Amount (INR),Payout Method,Status\n';
    withdrawals.forEach(w => {
      csv += `"${w.id}","${w.date}","${w.amount}","${w.method}","${w.status}"\n`;
    });
    downloadCSV(`WoodNest_Admin_Revenue_Withdrawals_Report_${Date.now()}.csv`, csv);
    toast.success('Platform commission revenue report exported as CSV!');
  };

  const exportSellersReport = () => {
    let csv = 'Seller ID,Brand Name,Email,Registration Date,Listed Products,Approval Status\n';
    sellersList.forEach(s => {
      csv += `"${s.id}","${s.name}","${s.email}","${s.date}","${s.products}","${s.status}"\n`;
    });
    downloadCSV(`WoodNest_Admin_Sellers_Audit_${Date.now()}.csv`, csv);
    toast.success('Sellers audit report exported as CSV!');
  };

  const exportCustomerReportsCSV = () => {
    let csv = 'Report ID,Customer Name,Email,Product,Seller,Complaint Reason,Priority,Status,Warning Sent,Product Unlisted\n';
    reportList.forEach(r => {
      csv += `"${r.id}","${r.customer}","${r.email}","${r.product.replace(/"/g, '""')}","${r.seller}","${r.reason.replace(/"/g, '""')}","${r.priority}","${r.status}","${r.warningSent}","${r.productUnlisted}"\n`;
    });
    downloadCSV(`WoodNest_Admin_Customer_Complaints_Report_${Date.now()}.csv`, csv);
    toast.success('Customer Complaints & Quality audit report exported as CSV!');
  };

  const exportCouponsReportCSV = () => {
    let csv = 'Coupon ID,Promo Code,Offer Title,Discount Type,Discount Value,Min Order (INR),Max Discount (INR),Expiry Date,Usage Counter,Status\n';
    couponsList.forEach(c => {
      csv += `"${c.id}","${c.code}","${c.title.replace(/"/g, '""')}","${c.discountType}","${c.discountValue}","${c.minOrderValue}","${c.maxDiscount}","${c.expiryDate}","${c.usedCount}/${c.usageLimit}","${c.status}"\n`;
    });
    downloadCSV(`WoodNest_Admin_Coupons_Report_${Date.now()}.csv`, csv);
    toast.success('Platform Coupons & Promo code report exported as CSV!');
  };

  const exportMasterSystemPackage = () => {
    exportUsersReport();
    setTimeout(() => exportRevenueReport(), 300);
    setTimeout(() => exportSellersReport(), 600);
    setTimeout(() => exportCustomerReportsCSV(), 900);
    setTimeout(() => exportCouponsReportCSV(), 1200);
    toast.success('All platform data reports package exported successfully!');
  };

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

  const filteredSellers = sellersList.filter(s => {
    if (sellerStatusFilter === 'All') return true;
    return s.status.toLowerCase() === sellerStatusFilter.toLowerCase();
  });

  const filteredUsers = userList.filter(u => {
    const matchesRole = userRoleFilter === 'All' || u.role.toLowerCase() === userRoleFilter.toLowerCase();
    const matchesSearch = !userSearch.trim() ||
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase());
    return matchesRole && matchesSearch;
  });

  const filteredReports = reportList.filter(r => {
    if (reportPriorityFilter === 'All') return true;
    return r.priority.toLowerCase() === reportPriorityFilter.toLowerCase();
  });

  const filteredCoupons = couponsList.filter(c => {
    if (couponFilter === 'All') return true;
    return c.status === couponFilter;
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

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => setActiveSection(id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                activeSection === id ? 'bg-[#2874F0] text-white shadow-md' : 'text-gray-400 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Icon size={16} /> <span className="truncate">{label}</span>
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
              {id === 'coupons' && (
                <span className="ml-auto bg-indigo-500 text-white text-[10px] rounded-full px-1.5 py-0.2 font-bold">
                  {couponsList.filter(c => c.status === 'Active').length}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-3 border-t border-white/10 space-y-1">
          <Link to="/" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-gray-400 hover:bg-white/10 hover:text-white transition-colors">
            <Home size={16} /> View Storefront
          </Link>
          <button onClick={() => { logout(); navigate('/'); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-gray-400 hover:bg-red-500/20 hover:text-red-300 transition-colors cursor-pointer">
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-6">
          {/* OVERVIEW SECTION */}
          {activeSection === 'overview' && (
            <div className="space-y-6">
              {/* Header & Quick Action Shortcuts */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-xl font-black text-foreground">Super Admin Platform Overview</h1>
                  <p className="text-xs text-muted-foreground">Real-time platform operations, seller approvals, system health & commission earnings</p>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <button
                    onClick={() => setActiveSection('sellers')}
                    className="bg-[#2874F0] hover:bg-blue-600 text-white font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                  >
                    <Users size={14} /> Approve Sellers ({sellersList.filter(s => s.status === 'Pending').length})
                  </button>
                  <button
                    onClick={() => setShowAddCouponModal(true)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                  >
                    <Plus size={14} /> Create Coupon
                  </button>
                  <button
                    onClick={exportMasterSystemPackage}
                    className="bg-card hover:bg-muted text-foreground border border-border font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Download size={14} className="text-[#2874F0]" /> Export System Data
                  </button>
                </div>
              </div>

              {/* 6 Stat KPI Cards */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {stats.map(({ icon: Icon, label, value, change, bg, color }) => (
                  <div key={label} className="bg-card rounded-2xl shadow-xs p-4 border border-border flex items-center gap-3">
                    <div className={`${bg} p-2.5 rounded-xl shrink-0`}>
                      <Icon size={18} className={color} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] text-muted-foreground font-medium">{label}</p>
                      <p className="text-sm font-black text-foreground truncate">{value}</p>
                      <span className="text-[9px] text-muted-foreground font-semibold">{change}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* High Priority Quality Complaints Banner */}
              {reportList.filter(r => r.priority === 'High' && r.status === 'Open').length > 0 && (
                <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-rose-600 text-white rounded-xl">
                      <ShieldAlert size={18} />
                    </div>
                    <div>
                      <p className="font-extrabold text-rose-900 dark:text-rose-200">
                        {reportList.filter(r => r.priority === 'High' && r.status === 'Open').length} High Priority Customer Complaint(s) Require Audit
                      </p>
                      <p className="text-muted-foreground text-[11px]">Inspect product defect tickets, send official seller warnings, or unlist violating products.</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveSection('reports')}
                    className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-xl font-bold text-xs shrink-0 cursor-pointer shadow-sm"
                  >
                    Audit Customer Reports →
                  </button>
                </div>
              )}

              {/* 2-Column Grid: Commission Revenue Chart & Pending Sellers Table */}
              <div className="grid lg:grid-cols-3 gap-5">
                {/* Left Column: Platform Commission Revenue Chart */}
                <div className="lg:col-span-2 bg-card rounded-2xl border border-border shadow-sm p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-extrabold text-sm text-foreground flex items-center gap-2">
                        <TrendingUp size={16} className="text-[#2874F0]" /> Monthly Platform Commission Earnings
                      </h3>
                      <p className="text-[11px] text-muted-foreground font-medium">10% Platform fee collected from vendor sales (Mar 2026 - Aug 2026)</p>
                    </div>
                    <span className="text-xs bg-emerald-100 text-emerald-700 font-bold px-2.5 py-0.5 rounded-full">
                      +18.2% Growth
                    </span>
                  </div>

                  <div className="h-44 flex items-end gap-3 pt-6 pb-2 px-3 bg-muted/20 rounded-xl border border-border">
                    {adminBarData.map(d => {
                      const heightPercent = Math.max(15, Math.round((d.value / maxAdminVal) * 100));
                      return (
                        <div key={d.month} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                          <span className="text-[10px] font-bold text-[#2874F0] opacity-0 group-hover:opacity-100 transition-opacity">
                            {formatPrice(d.value)}
                          </span>
                          <div
                            style={{ height: `${heightPercent}%` }}
                            className="w-full bg-gradient-to-t from-[#2874F0] to-blue-400 rounded-t-lg transition-all group-hover:from-blue-600 group-hover:to-blue-500 shadow-xs"
                          />
                          <span className="text-[11px] font-bold text-muted-foreground">{d.month}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Right Column: Real-time Operations Activity Feed */}
                <div className="bg-card rounded-2xl border border-border p-5 shadow-sm space-y-3">
                  <h3 className="font-extrabold text-sm text-foreground flex items-center gap-2 border-b border-border pb-2">
                    <Bell size={16} className="text-[#2874F0]" /> Operations Feed
                  </h3>
                  <div className="divide-y divide-border text-xs">
                    {RECENT_ACTIVITY.map((act, idx) => (
                      <div key={idx} className="py-2.5 flex items-center justify-between gap-2">
                        <span className={`font-semibold text-[11px] leading-tight ${act.color}`}>{act.msg}</span>
                        <span className="text-[9px] text-muted-foreground font-mono shrink-0">{act.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Pending Seller Approvals Table Widget */}
              <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden text-xs">
                <div className="px-5 py-4 border-b border-border bg-muted/30 flex items-center justify-between">
                  <h3 className="font-extrabold text-sm text-foreground flex items-center gap-2">
                    <Users size={16} className="text-[#2874F0]" /> Pending Seller Applications ({sellersList.filter(s => s.status === 'Pending').length})
                  </h3>
                  <button onClick={() => setActiveSection('sellers')} className="text-xs text-[#2874F0] font-bold hover:underline">
                    Manage All Sellers ({sellersList.length}) →
                  </button>
                </div>

                <table className="w-full text-left">
                  <thead className="bg-muted text-muted-foreground uppercase font-semibold text-[10px] tracking-wider">
                    <tr>
                      <th className="px-4 py-3">Seller ID</th>
                      <th className="px-4 py-3">Brand Name</th>
                      <th className="px-4 py-3">Email Address</th>
                      <th className="px-4 py-3">Reg Date</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Quick Decision</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {sellersList.filter(s => s.status === 'Pending').map(s => (
                      <tr key={s.id} className="hover:bg-muted/40 transition-colors">
                        <td className="px-4 py-3.5 font-mono font-bold text-[#2874F0]">{s.id}</td>
                        <td className="px-4 py-3.5 font-bold text-foreground">{s.name}</td>
                        <td className="px-4 py-3.5 text-muted-foreground">{s.email}</td>
                        <td className="px-4 py-3.5 text-muted-foreground">{s.date}</td>
                        <td className="px-4 py-3.5">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                            ● Pending Verification
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <div className="inline-flex items-center gap-2">
                            <button
                              onClick={() => handleSellerAction(s.id, 'Active')}
                              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-colors cursor-pointer"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleSellerAction(s.id, 'Blocked')}
                              className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg transition-colors cursor-pointer"
                            >
                              Reject
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

          {/* LANDING PAGE & HERO BANNERS MANAGEMENT SECTION (NEW FEATURE) */}
          {activeSection === 'landing' && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
                    <Sliders className="text-[#2874F0]" size={24} /> Storefront Landing Page & Hero Banners
                  </h1>
                  <p className="text-xs text-muted-foreground">Manage landing page offer announcement ticker, headlines, hero slider images, and discount promo badges</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowAddSlideModal(true)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow-md cursor-pointer transition-colors"
                  >
                    <Plus size={16} /> Add Hero Slide Banner
                  </button>
                  <Link
                    to="/"
                    target="_blank"
                    className="bg-muted hover:bg-muted/80 text-foreground font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 border border-border cursor-pointer"
                  >
                    <Eye size={15} /> Preview Storefront
                  </Link>
                </div>
              </div>

              <form onSubmit={handleSaveLandingSettings} className="space-y-6">
                {/* 1. Announcement Bar & Offer Ticker Settings */}
                <div className="bg-card p-6 rounded-2xl border border-border shadow-sm space-y-4 text-xs">
                  <div className="flex items-center justify-between border-b border-border pb-3">
                    <h3 className="font-extrabold text-sm text-foreground flex items-center gap-2">
                      <Sparkles className="text-amber-500" size={18} /> Top Announcement Bar & Offer Marquee
                    </h3>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <span className="font-bold text-muted-foreground">Status:</span>
                      <input
                        type="checkbox"
                        checked={landingSettings.announcementEnabled}
                        onChange={e => setLandingSettings({ ...landingSettings, announcementEnabled: e.target.checked })}
                        className="w-4 h-4 rounded text-[#2874F0] cursor-pointer"
                      />
                      <span className={`font-bold ${landingSettings.announcementEnabled ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {landingSettings.announcementEnabled ? 'Active' : 'Disabled'}
                      </span>
                    </label>
                  </div>

                  <div>
                    <label className="block font-semibold text-foreground mb-1">Announcement Ticker Text</label>
                    <textarea
                      rows={2}
                      value={landingSettings.announcementText}
                      onChange={e => setLandingSettings({ ...landingSettings, announcementText: e.target.value })}
                      className="w-full bg-background border border-border rounded-xl p-3 font-semibold text-foreground outline-none"
                    />
                    <p className="text-[10px] text-muted-foreground mt-1">This announcement ticker scrolls continuously at the top of the storefront landing page.</p>
                  </div>
                </div>

                {/* 2. Hero Slider Slides List */}
                <div className="bg-card p-6 rounded-2xl border border-border shadow-sm space-y-4 text-xs">
                  <div className="flex items-center justify-between border-b border-border pb-3">
                    <h3 className="font-extrabold text-sm text-foreground flex items-center gap-2">
                      <ImageIcon className="text-[#2874F0]" size={18} /> Hero Banner Slides ({landingSettings.heroSlides.length})
                    </h3>
                    <button
                      type="button"
                      onClick={() => setShowAddSlideModal(true)}
                      className="text-xs bg-[#2874F0]/10 text-[#2874F0] font-bold px-3 py-1.5 rounded-xl hover:bg-[#2874F0]/20 cursor-pointer"
                    >
                      + Add Slide
                    </button>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    {landingSettings.heroSlides.map((slide: any, idx: number) => (
                      <div key={slide.id || idx} className="bg-muted/30 rounded-2xl border border-border p-4 space-y-3 relative group">
                        <div className="relative h-36 rounded-xl overflow-hidden border border-border bg-black/40">
                          <img src={slide.image} alt="" className="w-full h-full object-cover opacity-80" />
                          <span className="absolute top-2 left-2 bg-black/60 text-white font-bold text-[10px] px-2 py-0.5 rounded-full">
                            Slide #{idx + 1}
                          </span>
                          <span className="absolute bottom-2 left-2 bg-amber-500 text-white font-extrabold text-[10px] px-2 py-0.5 rounded-full">
                            {slide.badgeText || 'PROMO'}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveSlide(slide.id)}
                            className="absolute top-2 right-2 bg-rose-600 text-white p-1 rounded-full opacity-90 hover:opacity-100 cursor-pointer"
                            title="Remove Slide"
                          >
                            <X size={12} />
                          </button>
                        </div>

                        <div className="space-y-1">
                          <p className="font-extrabold text-foreground text-sm line-clamp-1">{slide.title}</p>
                          <p className="text-muted-foreground text-[11px] line-clamp-2">{slide.subtitle}</p>
                          <p className="text-[10px] text-[#2874F0] font-bold mt-1">CTA: "{slide.cta}" → {slide.link}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="bg-[#2874F0] hover:bg-blue-600 text-white font-black px-8 py-3.5 rounded-xl transition-all shadow-md cursor-pointer flex items-center gap-2 text-xs"
                  >
                    <Save size={16} /> Save & Publish Landing Settings
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Seller Approvals */}
          {activeSection === 'sellers' && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-xl font-bold text-foreground">Seller Verification & Approvals</h1>
                  <p className="text-xs text-muted-foreground">Approve new vendor applications and manage active store status</p>
                </div>

                <div className="flex items-center gap-1 bg-card p-1.5 rounded-xl border border-border text-xs">
                  {['All', 'Pending', 'Active', 'Blocked'].map(s => (
                    <button
                      key={s}
                      onClick={() => setSellerStatusFilter(s)}
                      className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                        sellerStatusFilter === s ? 'bg-[#2874F0] text-white shadow-xs' : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-muted text-muted-foreground uppercase font-semibold text-[10px]">
                    <tr>
                      <th className="px-4 py-3">Seller ID</th>
                      <th className="px-4 py-3">Brand Name</th>
                      <th className="px-4 py-3">Email Address</th>
                      <th className="px-4 py-3">Reg Date</th>
                      <th className="px-4 py-3 text-center">Products</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredSellers.map(s => (
                      <tr key={s.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3.5 font-mono font-bold text-[#2874F0]">{s.id}</td>
                        <td className="px-4 py-3.5 font-bold text-foreground">{s.name}</td>
                        <td className="px-4 py-3.5 text-muted-foreground">{s.email}</td>
                        <td className="px-4 py-3.5 text-muted-foreground">{s.date}</td>
                        <td className="px-4 py-3.5 text-center font-bold">{s.products}</td>
                        <td className="px-4 py-3.5">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            s.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : s.status === 'Pending' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-700'
                          }`}>
                            ● {s.status}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          {s.status === 'Pending' ? (
                            <div className="inline-flex items-center gap-2">
                              <button
                                onClick={() => handleSellerAction(s.id, 'Active')}
                                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-colors cursor-pointer"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleSellerAction(s.id, 'Blocked')}
                                className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg transition-colors cursor-pointer"
                              >
                                Reject
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleSellerAction(s.id, s.status === 'Active' ? 'Blocked' : 'Active')}
                              className="text-muted-foreground hover:text-foreground font-semibold underline cursor-pointer"
                            >
                              {s.status === 'Active' ? 'Block Store' : 'Unblock Store'}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Products */}
          {activeSection === 'products' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-bold text-foreground">Catalog Product Moderation</h1>
                  <p className="text-xs text-muted-foreground">Audit active store listings and unlist policy-violating products</p>
                </div>
                <span className="text-xs font-bold text-muted-foreground bg-card px-3 py-1.5 rounded-xl border border-border">
                  Total Catalog: {productList.length} Products
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                {productList.map(p => (
                  <div key={p.id} className="bg-card rounded-2xl border border-border overflow-hidden p-4 shadow-sm space-y-3 flex flex-col justify-between">
                    <div className="flex gap-3">
                      <img src={p.images[0]} alt="" className="w-16 h-16 rounded-xl object-cover border border-border shrink-0" />
                      <div className="min-w-0">
                        <p className="font-bold text-foreground text-xs line-clamp-1">{p.name}</p>
                        <p className="text-muted-foreground text-[11px] mt-0.5">{p.category}</p>
                        <p className="font-extrabold text-[#2874F0] text-sm mt-1">{formatPrice(p.price)}</p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-border flex items-center justify-between">
                      <span className="text-[10px] text-muted-foreground truncate">Seller: <strong>{p.seller}</strong></span>
                      <button
                        onClick={() => initiateProductRemoval(p.id, p.name)}
                        className="px-3 py-1.5 bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-200 font-bold rounded-xl text-[11px] flex items-center gap-1 transition-colors cursor-pointer shrink-0"
                      >
                        <Trash2 size={12} /> Unlist Product
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* User Management */}
          {activeSection === 'users' && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-xl font-bold text-foreground">Platform User Management</h1>
                  <p className="text-xs text-muted-foreground">Manage customer accounts, seller credentials, and system roles</p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 text-muted-foreground" size={14} />
                    <input
                      type="text"
                      placeholder="Search users by name or email..."
                      value={userSearch}
                      onChange={e => setUserSearch(e.target.value)}
                      className="bg-card border border-border rounded-xl pl-9 pr-3 py-2 text-xs font-medium outline-none text-foreground w-60"
                    />
                  </div>

                  <div className="flex items-center gap-1 bg-card p-1 rounded-xl border border-border text-xs">
                    {['All', 'Customer', 'Seller', 'Admin'].map(r => (
                      <button
                        key={r}
                        onClick={() => setUserRoleFilter(r)}
                        className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                          userRoleFilter === r ? 'bg-[#2874F0] text-white shadow-xs' : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-muted text-muted-foreground uppercase font-semibold text-[10px]">
                    <tr>
                      <th className="px-4 py-3">User ID</th>
                      <th className="px-4 py-3">Full Name</th>
                      <th className="px-4 py-3">Email Address</th>
                      <th className="px-4 py-3">Role</th>
                      <th className="px-4 py-3">Account Status</th>
                      <th className="px-4 py-3">Joined Date</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredUsers.map(u => (
                      <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3.5 font-mono font-bold text-[#2874F0]">{u.id}</td>
                        <td className="px-4 py-3.5 font-bold text-foreground">{u.name}</td>
                        <td className="px-4 py-3.5 text-muted-foreground">{u.email}</td>
                        <td className="px-4 py-3.5">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            u.role === 'admin' ? 'bg-purple-100 text-purple-700' : u.role === 'seller' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            u.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                          }`}>
                            ● {u.status}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-muted-foreground">{u.joined}</td>
                        <td className="px-4 py-3.5 text-right">
                          {u.role !== 'admin' && (
                            <div className="inline-flex items-center gap-2">
                              <button
                                onClick={() => handleToggleUserStatus(u.id)}
                                className="text-muted-foreground hover:text-foreground font-semibold underline cursor-pointer"
                              >
                                {u.status === 'Active' ? 'Suspend' : 'Activate'}
                              </button>
                              <button
                                onClick={() => handleRemoveUser(u.id, u.name)}
                                className="text-rose-600 hover:text-rose-700 font-bold cursor-pointer"
                                title="Remove User"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* COUPON MANAGEMENT SECTION */}
          {activeSection === 'coupons' && (
            <div className="space-y-5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
                    <Tag className="text-[#2874F0]" size={24} /> Coupon & Discount Management
                  </h1>
                  <p className="text-xs text-muted-foreground">Create promo codes, define percentage/flat discounts, set minimum cart requirements, and monitor usage</p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 bg-card p-1.5 rounded-xl border border-border text-xs">
                    {(['All', 'Active', 'Expired'] as const).map(f => (
                      <button
                        key={f}
                        onClick={() => setCouponFilter(f)}
                        className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                          couponFilter === f ? 'bg-[#2874F0] text-white shadow-xs' : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        {f} ({f === 'All' ? couponsList.length : couponsList.filter(c => c.status === f).length})
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => setShowAddCouponModal(true)}
                    className="bg-[#2874F0] hover:bg-blue-600 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow-md cursor-pointer transition-colors shrink-0"
                  >
                    <Plus size={16} /> Create New Coupon
                  </button>
                </div>
              </div>

              {/* Coupon KPI Summary Cards */}
              <div className="grid sm:grid-cols-4 gap-4">
                <div className="bg-card p-4 rounded-xl border border-border shadow-xs">
                  <p className="text-xs text-muted-foreground font-semibold">Active Coupons</p>
                  <p className="text-2xl font-black text-indigo-600 mt-1">{couponsList.filter(c => c.status === 'Active').length}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">Live customer promo codes</p>
                </div>
                <div className="bg-card p-4 rounded-xl border border-border shadow-xs">
                  <p className="text-xs text-muted-foreground font-semibold">Total Coupon Redemptions</p>
                  <p className="text-2xl font-black text-foreground mt-1">
                    {couponsList.reduce((acc, c) => acc + c.usedCount, 0)} Uses
                  </p>
                  <p className="text-[10px] text-emerald-600 font-bold mt-1">+24.5% vs last month</p>
                </div>
                <div className="bg-card p-4 rounded-xl border border-border shadow-xs">
                  <p className="text-xs text-muted-foreground font-semibold">Avg Customer Savings</p>
                  <p className="text-2xl font-black text-emerald-600 mt-1">₹1,850</p>
                  <p className="text-[10px] text-muted-foreground mt-1">Per redeemed order</p>
                </div>
                <div className="bg-card p-4 rounded-xl border border-border shadow-xs">
                  <p className="text-xs text-muted-foreground font-semibold">Total Discount Savings</p>
                  <p className="text-2xl font-black text-[#2874F0] mt-1">₹10.5 Lakhs</p>
                  <p className="text-[10px] text-muted-foreground mt-1">Total customer incentive</p>
                </div>
              </div>

              {/* Coupons List Table */}
              <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-muted text-muted-foreground uppercase font-semibold text-[10px] tracking-wider">
                    <tr>
                      <th className="px-4 py-3">Promo Code</th>
                      <th className="px-4 py-3">Offer Title</th>
                      <th className="px-4 py-3">Discount Value</th>
                      <th className="px-4 py-3">Min Order & Target</th>
                      <th className="px-4 py-3 text-center">Usage Counter</th>
                      <th className="px-4 py-3">Expiry Date</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredCoupons.map(c => (
                      <tr key={c.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-black text-sm text-[#2874F0] bg-blue-50 dark:bg-blue-950/40 px-2.5 py-1 rounded-lg border border-blue-200 dark:border-blue-900">
                              {c.code}
                            </span>
                            <button
                              onClick={() => handleCopyCoupon(c.code)}
                              className="text-muted-foreground hover:text-foreground p-1 rounded hover:bg-muted cursor-pointer"
                              title="Copy promo code"
                            >
                              <Copy size={13} />
                            </button>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 font-bold text-foreground">{c.title}</td>
                        <td className="px-4 py-3.5">
                          <span className="font-black text-emerald-600 text-sm">
                            {c.discountType === 'percentage' ? `${c.discountValue}% OFF` : `${formatPrice(c.discountValue)} OFF`}
                          </span>
                          {c.discountType === 'percentage' && c.maxDiscount && (
                            <span className="block text-[10px] text-muted-foreground">Up to {formatPrice(c.maxDiscount)}</span>
                          )}
                        </td>
                        <td className="px-4 py-3.5">
                          <p className="font-semibold text-foreground">Min Order: {formatPrice(c.minOrderValue)}</p>
                          <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full inline-block mt-0.5">
                            Target: {c.category}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <span className="font-bold text-foreground">{c.usedCount}</span>
                          <span className="text-muted-foreground text-[10px]"> / {c.usageLimit} max</span>
                        </td>
                        <td className="px-4 py-3.5 font-mono text-muted-foreground">{c.expiryDate}</td>
                        <td className="px-4 py-3.5">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            c.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                          }`}>
                            ● {c.status}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <div className="inline-flex items-center gap-2">
                            <button
                              onClick={() => handleToggleCouponStatus(c.id)}
                              className="text-muted-foreground hover:text-foreground font-semibold underline text-[11px] cursor-pointer"
                            >
                              {c.status === 'Active' ? 'Deactivate' : 'Activate'}
                            </button>
                            <button
                              onClick={() => handleDeleteCoupon(c.id, c.code)}
                              className="text-rose-600 hover:text-rose-700 p-1 cursor-pointer"
                              title="Delete Coupon"
                            >
                              <Trash2 size={14} />
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

          {/* Customer Reports */}
          {activeSection === 'reports' && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-xl font-bold text-foreground">Customer Complaints & Quality Audit</h1>
                  <p className="text-xs text-muted-foreground">Inspect customer defect reports, issue seller warnings, or unlist non-compliant listings</p>
                </div>

                <div className="flex items-center gap-1 bg-card p-1.5 rounded-xl border border-border text-xs">
                  {['All', 'High', 'Medium', 'Low'].map(p => (
                    <button
                      key={p}
                      onClick={() => setReportPriorityFilter(p)}
                      className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                        reportPriorityFilter === p ? 'bg-[#2874F0] text-white shadow-xs' : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {p} Priority
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-muted text-muted-foreground uppercase font-semibold text-[10px]">
                    <tr>
                      <th className="px-4 py-3">Report ID</th>
                      <th className="px-4 py-3">Customer</th>
                      <th className="px-4 py-3">Product Name</th>
                      <th className="px-4 py-3">Seller Store</th>
                      <th className="px-4 py-3">Priority</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Audit Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredReports.map(r => (
                      <tr key={r.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3.5 font-mono font-bold text-[#2874F0]">{r.id}</td>
                        <td className="px-4 py-3.5">
                          <p className="font-bold text-foreground">{r.customer}</p>
                          <p className="text-[10px] text-muted-foreground">{r.email}</p>
                        </td>
                        <td className="px-4 py-3.5 font-semibold text-foreground">{r.product}</td>
                        <td className="px-4 py-3.5 text-muted-foreground">{r.seller}</td>
                        <td className="px-4 py-3.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            r.priority === 'High' ? 'bg-rose-100 text-rose-700' : r.priority === 'Medium' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-700'
                          }`}>
                            {r.priority}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="font-bold text-foreground">{r.status}</span>
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <button
                            onClick={() => setActiveReportModal(r)}
                            className="px-3 py-1.5 bg-[#2874F0] hover:bg-blue-600 text-white font-bold rounded-xl text-[11px] flex items-center gap-1 ml-auto cursor-pointer shadow-xs"
                          >
                            <Eye size={12} /> Inspect Ticket
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Revenue & Payouts */}
          {activeSection === 'revenue' && (
            <div className="space-y-5">
              <h1 className="text-xl font-bold text-foreground">Platform Commission Revenue & Withdrawals</h1>
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="bg-card p-4 rounded-xl border border-border">
                  <p className="text-xs text-muted-foreground">Total Commission Earned</p>
                  <p className="text-xl font-bold text-foreground">{formatPrice(totalEarned)}</p>
                </div>
                <div className="bg-card p-4 rounded-xl border border-border">
                  <p className="text-xs text-muted-foreground">Available Payout Balance</p>
                  <p className="text-xl font-bold text-emerald-600">{formatPrice(availableBalance)}</p>
                </div>
                <div className="bg-card p-4 rounded-xl border border-border">
                  <p className="text-xs text-muted-foreground">Total Withdrawn</p>
                  <p className="text-xl font-bold text-foreground">{formatPrice(totalWithdrawn)}</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-5">
                <div className="bg-card p-5 rounded-2xl border border-border space-y-4">
                  <h3 className="font-bold text-sm text-foreground">Withdraw Admin Revenue</h3>
                  <form onSubmit={handleWithdrawRevenue} className="space-y-3 text-xs">
                    <div>
                      <label className="block text-muted-foreground mb-1 font-semibold">Enter Amount (₹)</label>
                      <input
                        type="number"
                        required
                        max={availableBalance}
                        value={withdrawAmount}
                        onChange={e => setWithdrawAmount(e.target.value)}
                        placeholder="e.g. 100000"
                        className="w-full bg-background border border-border rounded-xl p-3 font-bold text-foreground outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-muted-foreground mb-1 font-semibold">Destination Bank Account</label>
                      <select
                        value={payoutMethod}
                        onChange={e => setPayoutMethod(e.target.value)}
                        className="w-full bg-background border border-border rounded-xl p-3 font-medium text-foreground outline-none"
                      >
                        <option value="HDFC Bank (A/C ...8812)">HDFC Bank Ltd. (A/C ...8812)</option>
                        <option value="ICICI Bank (A/C ...4019)">ICICI Bank Ltd. (A/C ...4019)</option>
                        <option value="UPI (admin@hdfcbank)">UPI (admin@hdfcbank)</option>
                      </select>
                    </div>
                    <button
                      type="submit"
                      disabled={withdrawing}
                      className="w-full bg-[#2874F0] hover:bg-blue-600 text-white font-bold py-3 rounded-xl transition-colors cursor-pointer shadow-md"
                    >
                      {withdrawing ? 'Processing Payout...' : 'Transfer Admin Funds'}
                    </button>
                  </form>
                </div>

                <div className="bg-card p-5 rounded-2xl border border-border space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-sm text-foreground">Payout History</h3>
                    <button onClick={exportRevenueReport} className="text-xs bg-muted hover:bg-muted/80 text-foreground px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 cursor-pointer">
                      <Download size={13} /> Export CSV
                    </button>
                  </div>

                  <div className="divide-y divide-border text-xs">
                    {withdrawals.map(w => (
                      <div key={w.id} className="py-2.5 flex justify-between items-center">
                        <div>
                          <p className="font-bold text-foreground">{w.id} · {w.method}</p>
                          <p className="text-[10px] text-muted-foreground">{w.date}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-black text-foreground">{formatPrice(w.amount)}</p>
                          <span className="text-[9px] text-emerald-600 font-bold uppercase">{w.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Reports & Export Portal */}
          {activeSection === 'exports' && (
            <div className="space-y-5">
              <div>
                <h1 className="text-xl font-bold text-foreground">Master System Data Export Portal</h1>
                <p className="text-xs text-muted-foreground">Export complete platform datasets for users, revenue, seller audits, coupons, and quality reports in CSV format</p>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                <div className="bg-card p-5 rounded-2xl border border-border shadow-sm space-y-3">
                  <FileText className="text-[#2874F0]" size={24} />
                  <div>
                    <h3 className="font-bold text-foreground text-sm">Users Master Data</h3>
                    <p className="text-muted-foreground text-[11px]">All customer, seller, and admin accounts.</p>
                  </div>
                  <button onClick={exportUsersReport} className="w-full bg-[#2874F0] hover:bg-blue-600 text-white font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1 cursor-pointer">
                    <Download size={14} /> Download Users CSV
                  </button>
                </div>

                <div className="bg-card p-5 rounded-2xl border border-border shadow-sm space-y-3">
                  <FileSpreadsheet className="text-emerald-600" size={24} />
                  <div>
                    <h3 className="font-bold text-foreground text-sm">Commission & Withdrawals</h3>
                    <p className="text-muted-foreground text-[11px]">Payout ledger and platform fees.</p>
                  </div>
                  <button onClick={exportRevenueReport} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1 cursor-pointer">
                    <Download size={14} /> Download Revenue CSV
                  </button>
                </div>

                <div className="bg-card p-5 rounded-2xl border border-border shadow-sm space-y-3">
                  <Users className="text-orange-600" size={24} />
                  <div>
                    <h3 className="font-bold text-foreground text-sm">Sellers Verification Ledger</h3>
                    <p className="text-muted-foreground text-[11px]">Vendor status and listing counts.</p>
                  </div>
                  <button onClick={exportSellersReport} className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1 cursor-pointer">
                    <Download size={14} /> Download Sellers CSV
                  </button>
                </div>

                <div className="bg-card p-5 rounded-2xl border border-border shadow-sm space-y-3">
                  <Tag className="text-indigo-600" size={24} />
                  <div>
                    <h3 className="font-bold text-foreground text-sm">Coupons & Promos Report</h3>
                    <p className="text-muted-foreground text-[11px]">Promo codes and redemption usage.</p>
                  </div>
                  <button onClick={exportCouponsReportCSV} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1 cursor-pointer">
                    <Download size={14} /> Download Coupons CSV
                  </button>
                </div>
              </div>

              <div className="bg-card p-6 rounded-2xl border border-border shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="font-extrabold text-foreground text-base">Export Full Platform Database Package</h3>
                  <p className="text-xs text-muted-foreground">Download all CSV reports in one automated download trigger</p>
                </div>
                <button
                  onClick={exportMasterSystemPackage}
                  className="bg-[#2874F0] hover:bg-blue-600 text-white font-black px-6 py-3 rounded-xl text-xs flex items-center gap-2 cursor-pointer shadow-md shrink-0"
                >
                  <Download size={16} /> Export Complete Package
                </button>
              </div>
            </div>
          )}

          {/* Settings */}
          {activeSection === 'settings' && (
            <div className="space-y-5">
              <div>
                <h1 className="text-xl font-bold text-foreground">Super Admin System Settings</h1>
                <p className="text-xs text-muted-foreground">Manage admin account info, security credentials, commission rules, and consumer policies</p>
              </div>

              <div className="flex gap-2 bg-card p-1.5 rounded-xl border border-border overflow-x-auto">
                {[
                  { id: 'profile', label: 'Admin Profile', icon: User },
                  { id: 'security', label: 'Security & Password', icon: KeyRound },
                  { id: 'commission', label: 'Commission Rules', icon: DollarSign },
                ].map(tab => {
                  const Icon = tab.icon;
                  const isActive = activeSettingsTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveSettingsTab(tab.id as any)}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                        isActive ? 'bg-[#2874F0] text-white shadow-sm' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                      }`}
                    >
                      <Icon size={15} /> {tab.label}
                    </button>
                  );
                })}
              </div>

              {activeSettingsTab === 'profile' && (
                <div className="bg-card rounded-2xl p-6 border border-border shadow-sm space-y-4 max-w-lg text-xs">
                  <h2 className="text-sm font-bold text-foreground flex items-center gap-2 border-b border-border pb-3">
                    <User className="text-[#2874F0]" size={18} /> Super Admin Profile Details
                  </h2>
                  <form onSubmit={handleSaveProfile} className="space-y-4">
                    <div>
                      <label className="block font-semibold text-foreground mb-1">Admin Full Name</label>
                      <input
                        type="text"
                        value={profileForm.name}
                        onChange={e => setProfileForm({ ...profileForm, name: e.target.value })}
                        className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-foreground outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-foreground mb-1">Official Email Address</label>
                      <input
                        type="email"
                        value={profileForm.email}
                        onChange={e => setProfileForm({ ...profileForm, email: e.target.value })}
                        className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-foreground outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-foreground mb-1">Phone Number</label>
                      <input
                        type="text"
                        value={profileForm.phone}
                        onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })}
                        className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-foreground outline-none"
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

              {activeSettingsTab === 'security' && (
                <div className="bg-card rounded-2xl p-6 border border-border shadow-sm space-y-4 max-w-lg text-xs">
                  <h2 className="text-sm font-bold text-foreground flex items-center gap-2 border-b border-border pb-3">
                    <KeyRound className="text-[#2874F0]" size={18} /> Change Admin Password
                  </h2>
                  <form onSubmit={handleSavePassword} className="space-y-4">
                    <div>
                      <label className="block font-semibold text-foreground mb-1">Current Password</label>
                      <input
                        type="password"
                        placeholder="Enter current password"
                        value={passwordForm.current}
                        onChange={e => setPasswordForm({ ...passwordForm, current: e.target.value })}
                        required
                        className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-foreground outline-none"
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
                        className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-foreground outline-none"
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
                        className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-foreground outline-none"
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

              {activeSettingsTab === 'commission' && (
                <div className="bg-card rounded-2xl p-6 border border-border shadow-sm space-y-4 max-w-xl text-xs">
                  <h2 className="text-sm font-bold text-foreground flex items-center gap-2 border-b border-border pb-3">
                    <DollarSign className="text-[#2874F0]" size={18} /> Platform Commission Rules
                  </h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 bg-muted/30 rounded-xl border border-border space-y-1">
                      <p className="font-bold text-foreground">Standard Commission Rate</p>
                      <p className="text-2xl font-black text-[#2874F0]">10.0%</p>
                      <p className="text-[10px] text-muted-foreground">Applied to all seller completed orders</p>
                    </div>
                    <div className="p-4 bg-muted/30 rounded-xl border border-border space-y-1">
                      <p className="font-bold text-foreground">Return Commission Reversal</p>
                      <p className="text-2xl font-black text-rose-600">100%</p>
                      <p className="text-[10px] text-muted-foreground">Deducted from admin on approved customer return</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* CREATE NEW HERO SLIDE MODAL (NEW FEATURE) */}
      {showAddSlideModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-extrabold text-base text-foreground flex items-center gap-2">
                <ImageIcon className="text-[#2874F0]" size={20} /> Add New Storefront Hero Banner
              </h3>
              <button onClick={() => setShowAddSlideModal(false)} className="text-muted-foreground hover:text-foreground cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddSlideSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-foreground mb-1">Banner Headline Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Handcrafted Solid Teak Dining Collection"
                  value={newSlide.title}
                  onChange={e => setNewSlide({ ...newSlide, title: e.target.value })}
                  className="w-full bg-background border border-border rounded-xl p-2.5 font-extrabold text-foreground outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-foreground mb-1">Subheading / Offer Description</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kiln-dried timber wood, 10-year warranty & free door delivery."
                  value={newSlide.subtitle}
                  onChange={e => setNewSlide({ ...newSlide, subtitle: e.target.value })}
                  className="w-full bg-background border border-border rounded-xl p-2.5 text-foreground font-medium outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-foreground mb-1">Badge Tag</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. FLAT 50% OFF"
                    value={newSlide.badgeText}
                    onChange={e => setNewSlide({ ...newSlide, badgeText: e.target.value })}
                    className="w-full bg-background border border-border rounded-xl p-2.5 font-bold uppercase text-foreground outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-foreground mb-1">Button CTA Text</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Shop Teak Sets Now"
                    value={newSlide.cta}
                    onChange={e => setNewSlide({ ...newSlide, cta: e.target.value })}
                    className="w-full bg-background border border-border rounded-xl p-2.5 font-bold text-foreground outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-foreground mb-1 flex items-center justify-between">
                  <span>Banner Image (Device Upload or Image URL)</span>
                </label>

                <label className="border-2 border-dashed border-border hover:border-[#2874F0] rounded-xl p-3 flex flex-col items-center justify-center cursor-pointer transition-colors bg-muted/20 hover:bg-muted/40 text-center mb-2">
                  <Upload size={18} className="text-muted-foreground mb-1" />
                  <span className="font-bold text-xs text-foreground">Click to upload banner photo from device</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleDeviceSlideImageUpload}
                    className="hidden"
                  />
                </label>

                <input
                  type="url"
                  placeholder="Or enter Image URL: https://images.unsplash.com/..."
                  value={newSlide.image}
                  onChange={e => setNewSlide({ ...newSlide, image: e.target.value })}
                  className="w-full bg-background border border-border rounded-xl p-2.5 text-foreground font-mono text-[11px] outline-none"
                />

                {newSlide.image && (
                  <div className="mt-2 h-24 rounded-xl overflow-hidden border border-border">
                    <img src={newSlide.image} alt="" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddSlideModal(false)}
                  className="flex-1 bg-muted text-foreground font-semibold py-2.5 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#2874F0] hover:bg-blue-600 text-white font-bold py-2.5 rounded-xl transition-colors shadow-md cursor-pointer"
                >
                  Add Banner Slide
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE NEW COUPON MODAL */}
      {showAddCouponModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-extrabold text-base text-foreground flex items-center gap-2">
                <Tag className="text-[#2874F0]" size={20} /> Create New Promo Coupon
              </h3>
              <button onClick={() => setShowAddCouponModal(false)} className="text-muted-foreground hover:text-foreground cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddCouponSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-foreground mb-1">Coupon Code (Promo Key)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. FESTIVE30"
                    value={newCoupon.code}
                    onChange={e => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                    className="w-full bg-background border border-border rounded-xl p-2.5 font-mono uppercase font-black text-foreground outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-foreground mb-1">Target Category</label>
                  <select
                    value={newCoupon.category}
                    onChange={e => setNewCoupon({ ...newCoupon, category: e.target.value })}
                    className="w-full bg-background border border-border rounded-xl p-2.5 text-foreground font-medium outline-none"
                  >
                    <option value="All Categories">All Categories</option>
                    <option value="Living Room">Living Room</option>
                    <option value="Bedroom">Bedroom</option>
                    <option value="Dining">Dining</option>
                    <option value="Study">Study</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-foreground mb-1">Offer Title / Description</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Festival Special 30% Flat Discount"
                  value={newCoupon.title}
                  onChange={e => setNewCoupon({ ...newCoupon, title: e.target.value })}
                  className="w-full bg-background border border-border rounded-xl p-2.5 text-foreground font-medium outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-foreground mb-1">Discount Type</label>
                  <select
                    value={newCoupon.discountType}
                    onChange={e => setNewCoupon({ ...newCoupon, discountType: e.target.value })}
                    className="w-full bg-background border border-border rounded-xl p-2.5 text-foreground font-medium outline-none"
                  >
                    <option value="percentage">Percentage Discount (%)</option>
                    <option value="fixed">Fixed Flat Discount (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-foreground mb-1">Discount Value</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 20"
                    value={newCoupon.discountValue}
                    onChange={e => setNewCoupon({ ...newCoupon, discountValue: e.target.value })}
                    className="w-full bg-background border border-border rounded-xl p-2.5 font-bold text-foreground outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-foreground mb-1">Min Order Requirement (₹)</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 1999"
                    value={newCoupon.minOrderValue}
                    onChange={e => setNewCoupon({ ...newCoupon, minOrderValue: e.target.value })}
                    className="w-full bg-background border border-border rounded-xl p-2.5 font-bold text-foreground outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-foreground mb-1">Max Discount Cap (₹)</label>
                  <input
                    type="number"
                    placeholder="e.g. 1000"
                    value={newCoupon.maxDiscount}
                    onChange={e => setNewCoupon({ ...newCoupon, maxDiscount: e.target.value })}
                    className="w-full bg-background border border-border rounded-xl p-2.5 font-bold text-foreground outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-foreground mb-1">Expiry Date</label>
                  <input
                    type="date"
                    required
                    value={newCoupon.expiryDate}
                    onChange={e => setNewCoupon({ ...newCoupon, expiryDate: e.target.value })}
                    className="w-full bg-background border border-border rounded-xl p-2.5 font-mono text-foreground outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-foreground mb-1">Usage Limit (Redemptions)</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 500"
                    value={newCoupon.usageLimit}
                    onChange={e => setNewCoupon({ ...newCoupon, usageLimit: e.target.value })}
                    className="w-full bg-background border border-border rounded-xl p-2.5 font-bold text-foreground outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddCouponModal(false)}
                  className="flex-1 bg-muted text-foreground font-semibold py-2.5 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#2874F0] hover:bg-blue-600 text-white font-bold py-2.5 rounded-xl transition-colors shadow-md cursor-pointer"
                >
                  Publish Coupon Code
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* INSPECT REPORT MODAL */}
      {activeReportModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                <ShieldAlert className="text-rose-600" size={18} /> Audit Report Ticket #{activeReportModal.id}
              </h3>
              <button onClick={() => setActiveReportModal(null)} className="text-muted-foreground hover:text-foreground">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-muted/40 p-3 rounded-xl border border-border space-y-1">
                <p className="font-bold text-foreground text-sm">{activeReportModal.product}</p>
                <p className="text-muted-foreground">Product ID: <strong className="font-mono text-foreground">{activeReportModal.productId}</strong></p>
                <p className="text-muted-foreground">Seller: <strong className="text-foreground">{activeReportModal.seller}</strong></p>
              </div>

              <div className="bg-rose-50 dark:bg-rose-950/20 p-3 rounded-xl border border-rose-200 dark:border-rose-900/40 space-y-1">
                <p className="font-bold text-rose-800 dark:text-rose-300">Customer Complaint:</p>
                <p className="text-foreground">"{activeReportModal.reason}"</p>
                <p className="text-[10px] text-muted-foreground mt-1">Reported by: {activeReportModal.customer} ({activeReportModal.email}) on {activeReportModal.date}</p>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <span className="font-semibold text-muted-foreground">Warning Sent:</span>
                <span className={`font-bold ${activeReportModal.warningSent ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {activeReportModal.warningSent ? '✓ Warning Issued' : '✕ No Warning Sent Yet'}
                </span>
              </div>

              <div className="space-y-2 pt-2 border-t border-border">
                <p className="font-bold text-foreground">Admin Enforcement Actions:</p>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => handleSendSellerWarning(activeReportModal.id, activeReportModal.seller)}
                    className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-2 rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Send size={14} /> Send Warning Notice to Seller
                  </button>

                  <button
                    onClick={() => {
                      initiateProductRemoval(activeReportModal.productId, activeReportModal.product, activeReportModal.id);
                      setActiveReportModal(null);
                    }}
                    className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-2 rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Trash2 size={14} /> Unlist & Remove Product from Catalog
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MANDATORY PRODUCT REMOVAL REASON MODAL */}
      {pendingRemoval && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                <AlertTriangle className="text-rose-600" size={18} /> Confirm Product Removal
              </h3>
              <button onClick={() => setPendingRemoval(null)} className="text-muted-foreground hover:text-foreground">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={confirmProductRemoval} className="space-y-3.5 text-xs">
              <p className="text-muted-foreground">
                You are about to remove <strong className="text-foreground">"{pendingRemoval.name}"</strong> from the public WoodNest store. Please state the mandatory reason for unlisting this item:
              </p>

              <div>
                <label className="block font-semibold text-foreground mb-1">Reason for Removal (Mandatory)</label>
                <textarea
                  required
                  rows={3}
                  placeholder="e.g. Failed quality assurance audit - reported by multiple customers for damaged timber."
                  value={removalReasonInput}
                  onChange={e => setRemovalReasonInput(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl p-3 text-foreground outline-none"
                />
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setPendingRemoval(null)}
                  className="flex-1 bg-muted text-foreground font-semibold py-2.5 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold py-2.5 rounded-xl transition-colors cursor-pointer shadow-md"
                >
                  Confirm & Unlist Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
