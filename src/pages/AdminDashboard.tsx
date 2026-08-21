import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BarChart2, Users, Package, TrendingUp, DollarSign, Settings, LogOut, Home, Bell, CheckCircle, XCircle, AlertCircle, Shield, Search, Save, RefreshCw, Lock, Sliders, AlertTriangle, UserX, UserCheck, Trash2, Send, Eye, ShieldAlert, Flag, Wallet, ArrowDownRight, CheckCircle2, User, KeyRound, Building, ShieldCheck, X, Download, FileSpreadsheet, FileText, Tag, Copy, Percent, Plus, Ticket, Calendar, ArrowRight, Upload, Image as ImageIcon, Sparkles, Zap, Clock, LayoutGrid, Edit2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { PRODUCTS } from '@/constants/data';
import { formatPrice, isPaymentRecognized } from '@/lib/utils';
import { toast } from 'sonner';
import { api } from '@/services/api';

const INITIAL_SELLERS: any[] = [];
const RECENT_ACTIVITY: any[] = [];
const INITIAL_USERS: any[] = [];
const INITIAL_REPORTS: any[] = [];
const INITIAL_WITHDRAWALS: any[] = [];
const INITIAL_COUPONS: any[] = [];

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
  const [productList, setProductList] = useState<any[]>([]);

  // Mandatory Product Removal Reason Modal State
  const [pendingRemoval, setPendingRemoval] = useState<{ id: string; name: string; reportId?: string } | null>(null);
  const [removalReasonInput, setRemovalReasonInput] = useState('');

  // Sellers State & Filtering
  const [sellersList, setSellersList] = useState<any[]>(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('shopmart_seller_approvals') || '[]');
      return stored.length ? [...stored, ...INITIAL_SELLERS] : INITIAL_SELLERS;
    } catch {
      return INITIAL_SELLERS;
    }
  });
  const [sellerStatusFilter, setSellerStatusFilter] = useState('All');

  useEffect(() => {
    const handleStorage = () => {
      try {
        const stored = JSON.parse(localStorage.getItem('shopmart_seller_approvals') || '[]');
        if (stored.length) {
          setSellersList(prev => {
            const map = new Map();
            [...stored, ...prev].forEach(item => map.set(item.id, item));
            return Array.from(map.values());
          });
        }
      } catch (e) {}
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // User Management State
  const [userList, setUserList] = useState(INITIAL_USERS);
  const [userRoleFilter, setUserRoleFilter] = useState('All');
  const [userSearch, setUserSearch] = useState('');

  // Report Management State & Action Details
  const [reportList, setReportList] = useState(INITIAL_REPORTS);
  const [reportPriorityFilter, setReportPriorityFilter] = useState('All');
  const [reportSubTab, setReportSubTab] = useState<'active' | 'resolved'>('active');
  const [activeReportModal, setActiveReportModal] = useState<typeof INITIAL_REPORTS[0] | null>(null);

  // Revenue & Withdrawal State
  const [totalWithdrawn, setTotalWithdrawn] = useState(0);
  const [withdrawals, setWithdrawals] = useState(INITIAL_WITHDRAWALS);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [payoutMethod, setPayoutMethod] = useState('HDFC Bank (A/C ...8812)');
  const [withdrawing, setWithdrawing] = useState(false);

  // COUPON MANAGEMENT STATE
  const [couponsList, setCouponsList] = useState<any[]>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('shopmart_coupons') || '[]');
      return Array.isArray(saved) ? saved.filter((c: any) => !['WOODFEST50', 'WOODNIGHT20', 'WELCOME100', 'TEAKSPECIAL', 'coup-1', 'coup-2', 'coup-3', 'coup-4'].includes(c.code) && !['coup-1', 'coup-2', 'coup-3', 'coup-4'].includes(c.id)) : [];
    } catch {
      return [];
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

  // LANDING PAGE & HERO BANNERS MANAGEMENT STATE
  const [landingSettings, setLandingSettings] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('shopmart_landing_settings') || '{}');
      return {
        announcementText: saved.announcementText || "Welcome to ShopMart — Premium Quality Handcrafted Furniture & Home Decor",
        announcementEnabled: saved.announcementEnabled !== undefined ? saved.announcementEnabled : true,
        discountBadgeText: saved.discountBadgeText || "EXCLUSIVE OFFERS",
        flashDealTitle: saved.flashDealTitle || "Flash Sale",
        flashDealEnabled: saved.flashDealEnabled !== undefined ? saved.flashDealEnabled : true,
        flashDealEndTime: saved.flashDealEndTime || "",
        heroSlides: Array.isArray(saved.heroSlides) ? saved.heroSlides.filter((s: any) => !['slide-1', 'slide-2'].includes(s.id)) : [],
      };
    } catch {
      return {
        announcementText: "Welcome to ShopMart — Premium Quality Handcrafted Furniture & Home Decor",
        announcementEnabled: true,
        discountBadgeText: "EXCLUSIVE OFFERS",
        flashDealTitle: "Flash Sale",
        flashDealEnabled: true,
        flashDealEndTime: "",
        heroSlides: [],
      };
    }
  });

  // Auto-persist landing page settings to localStorage whenever modified
  useEffect(() => {
    try {
      localStorage.setItem('shopmart_landing_settings', JSON.stringify(landingSettings));
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('shopmart_settings_changed', { detail: landingSettings }));
    } catch (e) {
      console.error(e);
    }
  }, [landingSettings]);

  const handleSetQuickFlashDuration = (hours: number) => {
    const targetDate = new Date(Date.now() + hours * 60 * 60 * 1000);
    const pad = (n: number) => String(n).padStart(2, '0');
    const formatted = `${targetDate.getFullYear()}-${pad(targetDate.getMonth() + 1)}-${pad(targetDate.getDate())}T${pad(targetDate.getHours())}:${pad(targetDate.getMinutes())}`;
    setLandingSettings(prev => ({ ...prev, flashDealEndTime: formatted }));
    toast.info(`Flash Deal timer updated to +${hours} hour(s) from now!`);
  };

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
  const [commissionRules, setCommissionRules] = useState(() => {
    try {
      const saved = localStorage.getItem('shopmart_commission_rules');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return {
      standardRate: 10.0,
      returnReversalRate: 100,
      minPayoutThreshold: 5000,
      categoryTaxRate: 18.0,
    };
  });

  // Category Management State
  const [categoriesList, setCategoriesList] = useState<any[]>([]);
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any | null>(null);
  const [newCategory, setNewCategory] = useState({ name: '', image_url: '' });
  const [categoryFormError, setCategoryFormError] = useState('');

  // Category Device File Upload States
  const [addCategoryImageFile, setAddCategoryImageFile] = useState<File | null>(null);
  const [addCategoryPreview, setAddCategoryPreview] = useState<string | null>(null);
  const [showAddCategoryUrlInput, setShowAddCategoryUrlInput] = useState(false);

  const [editCategoryFile, setEditCategoryFile] = useState<File | null>(null);
  const [editCategoryPreview, setEditCategoryPreview] = useState<string | null>(null);
  const [showEditCategoryUrlInput, setShowEditCategoryUrlInput] = useState(false);

  const adminBarData = useMemo(() => {
    const months = ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'];
    const monthlyTotals: Record<string, number> = { Mar: 0, Apr: 0, May: 0, Jun: 0, Jul: 0, Aug: 0 };

    if (Array.isArray(productList)) {
      productList.forEach((p: any) => {
        if (p.createdAt) {
          const date = new Date(p.createdAt);
          const m = date.toLocaleString('default', { month: 'short' });
          if (monthlyTotals[m] !== undefined) {
            monthlyTotals[m] += Number(p.price) || 0;
          }
        }
      });
    }

    return months.map(m => ({ month: m, value: monthlyTotals[m] || 0 }));
  }, [productList]);
  const maxAdminVal = Math.max(...adminBarData.map(d => d.value), 1);

  useEffect(() => {
    if (!isAuthenticated) navigate('/login');
    if (user && user.role !== 'admin') navigate('/');
  }, [isAuthenticated, user]);

  useEffect(() => {
    // Fetch live backend data from Render API
    api.admin.getCommissionRules().then(res => {
      if (res && res.success && res.commissionRules) {
        setCommissionRules(prev => ({ ...prev, ...res.commissionRules }));
      }
    });

    api.admin.getSellers().then(res => {
      if (res && res.success && Array.isArray(res.sellers) && res.sellers.length > 0) {
        setSellersList(res.sellers);
      }
    });

    api.reports.getAll().then(res => {
      if (res && res.success && Array.isArray(res.reports) && res.reports.length > 0) {
        setReportList(res.reports);
      }
    });

    api.products.getAll().then(res => {
      if (res && res.success && Array.isArray(res.products)) {
        setProductList(res.products);
      } else {
        setProductList([]);
      }
    });

    api.auth.getUsers().then(res => {
      if (res && res.success && Array.isArray(res.users) && res.users.length > 0) {
        setUserList(res.users);
      }
    });

    // Fetch platform orders for revenue & commission tracking
    api.orders.getAll().then(res => {
      if (res && res.success && Array.isArray(res.orders)) {
        setAdminOrders(res.orders);
      }
    });

    // Fetch categories
    api.admin.getCategories().then(res => {
      if (res && res.success && Array.isArray(res.categories)) {
        setCategoriesList(res.categories);
      }
    });
  }, []);

  const [adminOrders, setAdminOrders] = useState<any[]>([]);

  // Dynamically calculated platform commission & available payout balance based on payment methods
  const { totalEarned, availableBalance } = useMemo(() => {
    let earned = 450000;
    if (Array.isArray(adminOrders)) {
      adminOrders.forEach((o: any) => {
        if (isPaymentRecognized(o)) {
          earned += (Number(o.amount || o.totalAmount) || 0) * 0.1;
        }
      });
    }
    return {
      totalEarned: earned,
      availableBalance: Math.max(0, earned - totalWithdrawn),
    };
  }, [adminOrders, totalWithdrawn]);

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

  // ── Category File Change Handlers ─────────────────────────────────────────
  const handleAddCategoryFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAddCategoryImageFile(file);
      setAddCategoryPreview(URL.createObjectURL(file));
    }
  };

  const handleEditCategoryFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setEditCategoryFile(file);
      setEditCategoryPreview(URL.createObjectURL(file));
    }
  };

  // ── Category CRUD Handlers ──────────────────────────────────────────────
  const handleAddCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.name.trim()) { setCategoryFormError('Category name is required'); return; }
    setCategoryLoading(true);
    setCategoryFormError('');

    let payload: FormData | { name: string; image_url?: string };
    if (addCategoryImageFile) {
      const formData = new FormData();
      formData.append('name', newCategory.name.trim());
      formData.append('image', addCategoryImageFile);
      if (newCategory.image_url.trim()) {
        formData.append('image_url', newCategory.image_url.trim());
      }
      payload = formData;
    } else {
      payload = { name: newCategory.name.trim(), image_url: newCategory.image_url.trim() };
    }

    const res = await api.admin.createCategory(payload);
    setCategoryLoading(false);
    if (res && res.success && res.category) {
      setCategoriesList(prev => [...prev, res.category]);
      setNewCategory({ name: '', image_url: '' });
      setAddCategoryImageFile(null);
      setAddCategoryPreview(null);
      setShowAddCategoryModal(false);
      toast.success(`Category "${res.category.name}" created!`);
    } else {
      setCategoryFormError(res?.message || 'Failed to create category');
    }
  };

  const handleEditCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;
    if (!editingCategory.name.trim()) { setCategoryFormError('Category name is required'); return; }
    setCategoryLoading(true);
    setCategoryFormError('');

    let payload: FormData | { name?: string; image_url?: string };
    if (editCategoryImageFile) {
      const formData = new FormData();
      formData.append('name', editingCategory.name.trim());
      formData.append('image', editCategoryImageFile);
      payload = formData;
    } else {
      payload = { name: editingCategory.name.trim(), image_url: editingCategory.image_url };
    }

    const res = await api.admin.updateCategory(editingCategory.id, payload);
    setCategoryLoading(false);
    if (res && res.success && res.category) {
      setCategoriesList(prev => prev.map(c => c.id === editingCategory.id ? res.category : c));
      setEditingCategory(null);
      setEditCategoryFile(null);
      setEditCategoryPreview(null);
      toast.success(`Category updated successfully!`);
    } else {
      setCategoryFormError(res?.message || 'Failed to update category');
    }
  };

  const handleDeleteCategory = async (cat: any) => {
    if (!window.confirm(`Delete category "${cat.name}"? This cannot be undone.`)) return;
    const res = await api.admin.deleteCategory(cat.id);
    if (res && res.success) {
      setCategoriesList(prev => prev.filter(c => c.id !== cat.id));
      toast.success(`Category "${cat.name}" deleted.`);
    } else {
      toast.error(res?.message || 'Failed to delete category');
    }
  };

  // ────────────────────────────────────────────────────────────────────────

  const navItems = [
    { id: 'overview', icon: BarChart2, label: 'Overview' },
    { id: 'landing', icon: Sliders, label: 'Landing Page & Banners' },
    { id: 'sellers', icon: Users, label: 'Seller Approvals' },
    { id: 'products', icon: Package, label: 'Products' },
    { id: 'categories', icon: LayoutGrid, label: 'Category Management' },
    { id: 'users', icon: Users, label: 'User Management' },
    { id: 'coupons', icon: Tag, label: 'Coupon Management' },
    { id: 'reports', icon: Flag, label: 'Customer Reports' },
    { id: 'revenue', icon: Wallet, label: 'Revenue & Payouts' },
    { id: 'exports', icon: FileText, label: 'Reports & Export Portal' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

  // Seller Action Handlers
  const handleSellerAction = (sellerId: string, status: 'Active' | 'Blocked') => {
    api.admin.approveSeller(sellerId, status);
    setSellersList(prev => prev.map(s => {
      if (s.id === sellerId) {
        const updated = { ...s, status };
        try {
          const approvals = JSON.parse(localStorage.getItem('shopmart_seller_approvals') || '[]');
          const updatedApprovals = approvals.map((a: any) => (a.id === sellerId || a.email === s.email) ? { ...a, status } : a);
          localStorage.setItem('shopmart_seller_approvals', JSON.stringify(updatedApprovals));

          const registered = JSON.parse(localStorage.getItem('shopmart_reg_users') || '[]');
          const updatedRegs = registered.map((u: any) => u.email === s.email ? { ...u, status, isApproved: status === 'Active' } : u);
          localStorage.setItem('shopmart_reg_users', JSON.stringify(updatedRegs));

          const currentUser = JSON.parse(localStorage.getItem('shopmart_user') || 'null');
          if (currentUser && currentUser.email === s.email) {
            currentUser.status = status;
            currentUser.isApproved = status === 'Active';
            localStorage.setItem('shopmart_user', JSON.stringify(currentUser));
          }
          window.dispatchEvent(new Event('storage'));
        } catch (e) {
          console.error(e);
        }
        return updated;
      }
      return s;
    }));
    toast.success(`Seller "${sellerId}" account status updated to "${status}"!`);
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
    api.products.delete(pendingRemoval.id, removalReasonInput.trim());

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
    const report = reportList.find(r => r.id === reportId);

    setReportList(prev => prev.map(r => r.id === reportId ? {
      ...r,
      warningSent: true,
      status: r.status === 'Open' ? 'In Progress' : r.status
    } : r));

    if (activeReportModal?.id === reportId) {
      setActiveReportModal(prev => prev ? { ...prev, warningSent: true, status: prev.status === 'Open' ? 'In Progress' : prev.status } : null);
    }

    if (report) {
      const newWarning = {
        id: `WRN-${Date.now()}`,
        reportId: report.id,
        productName: report.product,
        sellerName: report.seller || sellerName,
        customerName: report.customer,
        reason: report.reason,
        priority: report.priority,
        date: new Date().toISOString().split('T')[0],
        message: `OFFICIAL SUPER ADMIN WARNING: Customer defect complaint received for product "${report.product}". Complaint details: "${report.reason}". Please inspect quality standards and address seller fulfillment.`,
        status: 'Unread',
      };

      try {
        const existing = JSON.parse(localStorage.getItem('shopmart_admin_warnings') || '[]');
        localStorage.setItem('shopmart_admin_warnings', JSON.stringify([newWarning, ...existing]));
        window.dispatchEvent(new Event('storage'));
      } catch (e) {
        console.error(e);
      }
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

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPw.length < 6) {
      toast.error('New password must be at least 6 characters.');
      return;
    }
    if (passwordForm.newPw !== passwordForm.confirmPw) {
      toast.error('New passwords do not match.');
      return;
    }
    const res = await api.auth.updatePassword(passwordForm.current, passwordForm.newPw);
    if (res && res.success) {
      toast.success('Admin password updated successfully!');
      setPasswordForm({ current: '', newPw: '', confirmPw: '' });
    } else {
      toast.error(res?.message || 'Password update failed.');
    }
  };

  const handleSaveCommissionRules = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      localStorage.setItem('shopmart_commission_rules', JSON.stringify(commissionRules));
      api.admin.updateCommissionRules(commissionRules);
      toast.success('Platform commission rules updated and saved successfully!');
    } catch (err) {
      toast.error('Failed to update commission rules.');
    }
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

  const handleMarkReportResolved = (reportId: string) => {
    setReportList(prev => prev.map(r => r.id === reportId ? {
      ...r,
      status: 'Resolved',
    } : r));
    api.reports.solve(reportId);
    toast.success(`Ticket #${reportId} marked as solved & moved to Solved Reports Archive!`);
    setActiveReportModal(null);
  };

  const handleReopenReport = (reportId: string) => {
    setReportList(prev => prev.map(r => r.id === reportId ? {
      ...r,
      status: 'In Progress',
    } : r));
    toast.info(`Ticket #${reportId} reopened and moved to Active Customer Complaints.`);
    setActiveReportModal(null);
  };

  const filteredReports = reportList.filter(r => {
    const matchesPriority = reportPriorityFilter === 'All' || r.priority.toLowerCase() === reportPriorityFilter.toLowerCase();
    const isResolved = r.status === 'Resolved';
    const matchesTab = reportSubTab === 'resolved' ? isResolved : !isResolved;
    return matchesPriority && matchesTab;
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

                {/* 2. Flash Deal Title & Countdown Timer Settings */}
                <div className="bg-card p-6 rounded-2xl border border-border shadow-sm space-y-4 text-xs">
                  <div className="flex items-center justify-between border-b border-border pb-3">
                    <h3 className="font-extrabold text-sm text-foreground flex items-center gap-2">
                      <Zap className="text-orange-500 fill-orange-500" size={18} /> Flash Deal Title & Countdown Timer Management
                    </h3>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <span className="font-bold text-muted-foreground">Status:</span>
                      <input
                        type="checkbox"
                        checked={landingSettings.flashDealEnabled}
                        onChange={e => setLandingSettings({ ...landingSettings, flashDealEnabled: e.target.checked })}
                        className="w-4 h-4 rounded text-[#2874F0] cursor-pointer"
                      />
                      <span className={`font-bold ${landingSettings.flashDealEnabled ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {landingSettings.flashDealEnabled ? 'Active' : 'Disabled'}
                      </span>
                    </label>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold text-foreground mb-1">Flash Deal Section Title</label>
                      <input
                        type="text"
                        placeholder="e.g. Flash Sale, Midnight Super Sale, Festival Deals"
                        value={landingSettings.flashDealTitle}
                        onChange={e => setLandingSettings({ ...landingSettings, flashDealTitle: e.target.value })}
                        className="w-full bg-background border border-border rounded-xl p-3 font-semibold text-foreground outline-none"
                      />
                      <p className="text-[10px] text-muted-foreground mt-1">Section header title displayed on the storefront landing page.</p>
                    </div>

                    <div>
                      <label className="block font-semibold text-foreground mb-1">Flash Deal Expiry Target Date & Time</label>
                      <input
                        type="datetime-local"
                        value={landingSettings.flashDealEndTime}
                        onChange={e => setLandingSettings({ ...landingSettings, flashDealEndTime: e.target.value })}
                        className="w-full bg-background border border-border rounded-xl p-2.5 font-semibold text-foreground outline-none cursor-pointer"
                      />
                      <p className="text-[10px] text-muted-foreground mt-1">Exact expiration date & time for live countdown timer. Leave empty for standard 12h rolling timer.</p>
                    </div>
                  </div>

                  {/* Quick Timer Preset Extensions */}
                  <div>
                    <span className="block font-semibold text-foreground mb-1.5">Quick Timer Extension Presets:</span>
                    <div className="flex flex-wrap items-center gap-2">
                      {[
                        { label: '+2 Hours', hours: 2 },
                        { label: '+6 Hours', hours: 6 },
                        { label: '+12 Hours', hours: 12 },
                        { label: '+24 Hours (1 Day)', hours: 24 },
                        { label: '+48 Hours (2 Days)', hours: 48 },
                        { label: '+72 Hours (3 Days)', hours: 72 },
                      ].map(preset => (
                        <button
                          key={preset.hours}
                          type="button"
                          onClick={() => handleSetQuickFlashDuration(preset.hours)}
                          className="bg-orange-500/10 hover:bg-orange-500/20 text-orange-600 dark:text-orange-400 font-bold px-3 py-1.5 rounded-lg text-[11px] border border-orange-500/20 cursor-pointer transition-colors"
                        >
                          {preset.label}
                        </button>
                      ))}
                      {landingSettings.flashDealEndTime && (
                        <button
                          type="button"
                          onClick={() => setLandingSettings(prev => ({ ...prev, flashDealEndTime: '' }))}
                          className="bg-muted hover:bg-muted/80 text-muted-foreground font-bold px-3 py-1.5 rounded-lg text-[11px] border border-border cursor-pointer"
                        >
                          Clear Custom Expiry
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Live Status Preview */}
                  <div className="bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-transparent p-3.5 rounded-xl border border-orange-500/20 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Clock className="text-orange-500 shrink-0" size={16} />
                      <div>
                        <span className="font-bold text-foreground">Live Timer Status: </span>
                        <span className="font-semibold text-muted-foreground text-[11px]">
                          {landingSettings.flashDealEndTime ? `Targeting ${landingSettings.flashDealEndTime.replace('T', ' ')}` : '12-Hour Rolling Auto Timer'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 bg-gradient-to-r from-[#FB641B] to-orange-500 px-3 py-1.5 rounded-lg text-white font-bold">
                      <span>{landingSettings.flashDealTitle || 'Flash Sale'}</span>
                      <span className="text-[10px] bg-black/30 px-2 py-0.5 rounded font-mono">
                        {landingSettings.flashDealEnabled ? 'STOREFRONT ACTIVE' : 'DISABLED'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 3. Hero Slider Slides List */}
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
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                  <h1 className="text-xl font-bold text-foreground">Customer Complaints & Quality Audit</h1>
                  <p className="text-xs text-muted-foreground">Inspect customer defect reports, issue seller warnings, or mark tickets as solved</p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {/* Sub-Section Tabs: Active vs Solved Archive */}
                  <div className="flex items-center gap-1 bg-card p-1.5 rounded-xl border border-border text-xs">
                    <button
                      onClick={() => setReportSubTab('active')}
                      className={`px-3.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        reportSubTab === 'active' ? 'bg-[#2874F0] text-white shadow-xs' : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <Flag size={13} /> Active Complaints ({reportList.filter(r => r.status !== 'Resolved').length})
                    </button>
                    <button
                      onClick={() => setReportSubTab('resolved')}
                      className={`px-3.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        reportSubTab === 'resolved' ? 'bg-emerald-600 text-white shadow-xs' : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <CheckCircle2 size={13} /> Solved Reports Archive ({reportList.filter(r => r.status === 'Resolved').length})
                    </button>
                  </div>

                  {/* Priority Filter */}
                  <div className="flex items-center gap-1 bg-card p-1.5 rounded-xl border border-border text-xs">
                    {['All', 'High', 'Medium', 'Low'].map(p => (
                      <button
                        key={p}
                        onClick={() => setReportPriorityFilter(p)}
                        className={`px-2.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                          reportPriorityFilter === p ? 'bg-muted text-foreground font-black' : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        {p} Priority
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sub-Section Info Ticker */}
              <div className={`p-3.5 rounded-xl border text-xs flex items-center justify-between ${
                reportSubTab === 'resolved'
                  ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/50 text-emerald-900 dark:text-emerald-200'
                  : 'bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/50 text-blue-900 dark:text-blue-200'
              }`}>
                <div className="flex items-center gap-2 font-medium">
                  {reportSubTab === 'resolved' ? (
                    <>
                      <CheckCircle2 className="text-emerald-600 shrink-0" size={16} />
                      <span><strong>Solved Reports Sub-Section:</strong> Showing all solved customer complaints. Issues marked as resolved are archived here.</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="text-[#2874F0] shrink-0" size={16} />
                      <span><strong>Active Complaints Desk:</strong> Pending customer reports requiring warnings, unlisting, or resolution confirmation.</span>
                    </>
                  )}
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
                    {filteredReports.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground font-semibold">
                          {reportSubTab === 'resolved'
                            ? 'No resolved reports in archive yet. Mark issues as solved to move them here!'
                            : 'No active complaints matching selected filter criteria.'}
                        </td>
                      </tr>
                    ) : (
                      filteredReports.map(r => (
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
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              r.status === 'Resolved' ? 'bg-emerald-100 text-emerald-700' : r.status === 'In Progress' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-700'
                            }`}>
                              ● {r.status}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {r.status !== 'Resolved' ? (
                                <button
                                  onClick={() => handleMarkReportResolved(r.id)}
                                  className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-[11px] flex items-center gap-1 cursor-pointer shadow-xs transition-colors"
                                  title="Solve and move to Solved Reports Sub-Section"
                                >
                                  <CheckCircle2 size={12} /> Mark Solved
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleReopenReport(r.id)}
                                  className="px-2.5 py-1.5 bg-muted hover:bg-muted/80 text-foreground font-bold rounded-xl text-[11px] flex items-center gap-1 cursor-pointer transition-colors border border-border"
                                  title="Reopen ticket"
                                >
                                  <RefreshCw size={12} /> Reopen
                                </button>
                              )}
                              <button
                                onClick={() => setActiveReportModal(r)}
                                className="px-3 py-1.5 bg-[#2874F0] hover:bg-blue-600 text-white font-bold rounded-xl text-[11px] flex items-center gap-1 cursor-pointer shadow-xs"
                              >
                                <Eye size={12} /> Inspect Ticket
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
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

          {/* ── CATEGORY MANAGEMENT ────────────────────────────────────── */}
          {activeSection === 'categories' && (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-xl font-black text-foreground flex items-center gap-2">
                    <LayoutGrid size={22} className="text-[#2874F0]" /> Category Management
                  </h1>
                  <p className="text-xs text-muted-foreground mt-1">
                    Manage platform product categories. Sellers pick from these in the product listing form.
                  </p>
                </div>
                <button
                  onClick={() => { setShowAddCategoryModal(true); setNewCategory({ name: '', image_url: '' }); setAddCategoryImageFile(null); setAddCategoryPreview(null); setCategoryFormError(''); }}
                  className="flex items-center gap-2 bg-[#2874F0] hover:bg-blue-600 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition-colors cursor-pointer shadow-md"
                >
                  <Plus size={15} /> Add New Category
                </button>
              </div>

              {/* Stats strip */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="bg-card border border-border rounded-2xl p-4 flex items-center gap-3">
                  <div className="bg-blue-50 dark:bg-blue-950/40 p-2.5 rounded-xl"><LayoutGrid size={18} className="text-[#2874F0]" /></div>
                  <div><p className="text-[11px] text-muted-foreground">Total Categories</p><p className="text-lg font-black text-foreground">{categoriesList.length}</p></div>
                </div>
                <div className="bg-card border border-border rounded-2xl p-4 flex items-center gap-3">
                  <div className="bg-emerald-50 dark:bg-emerald-950/40 p-2.5 rounded-xl"><Package size={18} className="text-emerald-600" /></div>
                  <div><p className="text-[11px] text-muted-foreground">Total Products</p><p className="text-lg font-black text-foreground">{productList.length}</p></div>
                </div>
                <div className="bg-card border border-border rounded-2xl p-4 flex items-center gap-3 col-span-2 sm:col-span-1">
                  <div className="bg-indigo-50 dark:bg-indigo-950/40 p-2.5 rounded-xl"><Tag size={18} className="text-indigo-600" /></div>
                  <div><p className="text-[11px] text-muted-foreground">Avg Products/Cat</p><p className="text-lg font-black text-foreground">{categoriesList.length > 0 ? Math.round(productList.length / categoriesList.length) : 0}</p></div>
                </div>
              </div>

              {/* Category Cards Grid */}
              {categoriesList.length === 0 ? (
                <div className="bg-card border border-dashed border-border rounded-2xl p-12 text-center text-muted-foreground">
                  <LayoutGrid size={40} className="mx-auto mb-3 opacity-30" />
                  <p className="font-semibold">No categories yet</p>
                  <p className="text-xs mt-1">Click "Add New Category" to create your first product category.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {categoriesList.map((cat) => (
                    <div key={cat.id} className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all group">
                      {/* Category Image */}
                      <div className="relative h-36 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 overflow-hidden">
                        {cat.image_url ? (
                          <img
                            src={cat.image_url}
                            alt={cat.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <LayoutGrid size={36} className="text-slate-400 dark:text-slate-500" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>

                      {/* Category Info */}
                      <div className="p-3.5">
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <div>
                            <h3 className="font-bold text-sm text-foreground leading-tight">{cat.name}</h3>
                            <p className="text-[10px] text-muted-foreground mt-0.5">
                              {productList.filter(p => p.category?.toLowerCase() === cat.name?.toLowerCase()).length} products
                            </p>
                          </div>
                          <span className="bg-blue-50 dark:bg-blue-950/40 text-[#2874F0] text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-800 shrink-0">
                            #{cat.sortOrder}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => { setEditingCategory({ ...cat }); setEditCategoryFile(null); setEditCategoryPreview(null); setCategoryFormError(''); }}
                            className="flex-1 flex items-center justify-center gap-1 bg-slate-100 dark:bg-slate-800 hover:bg-[#2874F0] hover:text-white text-foreground font-semibold py-1.5 rounded-lg text-[11px] transition-all cursor-pointer"
                          >
                            <Edit2 size={12} /> Edit
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(cat)}
                            className="flex-1 flex items-center justify-center gap-1 bg-slate-100 dark:bg-slate-800 hover:bg-rose-600 hover:text-white text-foreground font-semibold py-1.5 rounded-lg text-[11px] transition-all cursor-pointer"
                          >
                            <Trash2 size={12} /> Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
                <div className="bg-card rounded-2xl p-6 border border-border shadow-sm space-y-6 max-w-2xl text-xs">
                  <div className="flex items-center justify-between border-b border-border pb-3">
                    <div>
                      <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                        <DollarSign className="text-[#2874F0]" size={18} /> Platform Commission & Tax Rules
                      </h2>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        Adjust standard rates, return reversal percentages, and minimum payout thresholds.
                      </p>
                    </div>
                    <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold px-2.5 py-1 rounded-full text-[10px] flex items-center gap-1 border border-emerald-500/20">
                      <CheckCircle size={12} /> Live Rules Active
                    </span>
                  </div>

                  {/* Live Rule Cards Preview */}
                  <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="p-3.5 bg-muted/30 rounded-xl border border-border space-y-1">
                      <p className="font-semibold text-muted-foreground text-[11px]">Standard Rate</p>
                      <p className="text-xl font-black text-[#2874F0]">{commissionRules.standardRate}%</p>
                      <p className="text-[10px] text-muted-foreground">On completed orders</p>
                    </div>
                    <div className="p-3.5 bg-muted/30 rounded-xl border border-border space-y-1">
                      <p className="font-semibold text-muted-foreground text-[11px]">Return Reversal</p>
                      <p className="text-xl font-black text-rose-600">{commissionRules.returnReversalRate}%</p>
                      <p className="text-[10px] text-muted-foreground">Deducted on return</p>
                    </div>
                    <div className="p-3.5 bg-muted/30 rounded-xl border border-border space-y-1">
                      <p className="font-semibold text-muted-foreground text-[11px]">Min Withdrawal</p>
                      <p className="text-xl font-black text-amber-600">{formatPrice(commissionRules.minPayoutThreshold || 5000)}</p>
                      <p className="text-[10px] text-muted-foreground">Min seller payout</p>
                    </div>
                    <div className="p-3.5 bg-muted/30 rounded-xl border border-border space-y-1">
                      <p className="font-semibold text-muted-foreground text-[11px]">GST / Tax Rate</p>
                      <p className="text-xl font-black text-purple-600">{commissionRules.categoryTaxRate || 18}%</p>
                      <p className="text-[10px] text-muted-foreground">Applicable tax rate</p>
                    </div>
                  </div>

                  {/* Commission Edit Form */}
                  <form onSubmit={handleSaveCommissionRules} className="space-y-4 pt-2 border-t border-border">
                    <h3 className="font-bold text-foreground text-xs uppercase tracking-wider text-muted-foreground">
                      Adjust Rule Values
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-semibold text-foreground mb-1">
                          Standard Commission Rate (%)
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            step="0.1"
                            min="0"
                            max="100"
                            value={commissionRules.standardRate}
                            onChange={e => setCommissionRules({ ...commissionRules, standardRate: parseFloat(e.target.value) || 0 })}
                            className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-foreground font-bold outline-none focus:ring-2 focus:ring-[#2874F0]"
                            required
                          />
                          <span className="absolute right-3 top-2.5 text-muted-foreground font-bold">%</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-1">Percentage charged on each completed seller sale.</p>
                      </div>

                      <div>
                        <label className="block font-semibold text-foreground mb-1">
                          Return Commission Reversal Rate (%)
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            step="1"
                            min="0"
                            max="100"
                            value={commissionRules.returnReversalRate}
                            onChange={e => setCommissionRules({ ...commissionRules, returnReversalRate: parseFloat(e.target.value) || 0 })}
                            className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-foreground font-bold outline-none focus:ring-2 focus:ring-[#2874F0]"
                            required
                          />
                          <span className="absolute right-3 top-2.5 text-muted-foreground font-bold">%</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-1">Percentage of commission refunded when a customer return is approved.</p>
                      </div>

                      <div>
                        <label className="block font-semibold text-foreground mb-1">
                          Minimum Seller Withdrawal Limit (₹)
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            step="100"
                            min="0"
                            value={commissionRules.minPayoutThreshold}
                            onChange={e => setCommissionRules({ ...commissionRules, minPayoutThreshold: parseFloat(e.target.value) || 0 })}
                            className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-foreground font-bold outline-none focus:ring-2 focus:ring-[#2874F0]"
                            required
                          />
                          <span className="absolute right-3 top-2.5 text-muted-foreground font-bold">₹</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-1">Minimum wallet balance required for sellers to request payouts.</p>
                      </div>

                      <div>
                        <label className="block font-semibold text-foreground mb-1">
                          GST / Platform Service Tax Rate (%)
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            step="0.5"
                            min="0"
                            max="50"
                            value={commissionRules.categoryTaxRate}
                            onChange={e => setCommissionRules({ ...commissionRules, categoryTaxRate: parseFloat(e.target.value) || 0 })}
                            className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-foreground font-bold outline-none focus:ring-2 focus:ring-[#2874F0]"
                            required
                          />
                          <span className="absolute right-3 top-2.5 text-muted-foreground font-bold">%</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-1">Default GST tax applied on marketplace service transactions.</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-border">
                      <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                        <AlertCircle size={13} className="text-amber-500" /> Changes apply immediately across seller payouts and commission calculations.
                      </p>
                      <button
                        type="submit"
                        className="bg-[#2874F0] hover:bg-blue-600 text-white font-bold px-5 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                      >
                        <Save size={14} /> Save Commission Rules
                      </button>
                    </div>
                  </form>
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
                  {activeReportModal.warningSent ? 'Warning Issued' : 'No Warning Sent Yet'}
                </span>
              </div>

              <div className="space-y-2 pt-2 border-t border-border">
                <p className="font-bold text-foreground">Admin Enforcement & Resolution Actions:</p>
                <div className="flex flex-col gap-2">
                  {activeReportModal.status !== 'Resolved' ? (
                    <button
                      onClick={() => handleMarkReportResolved(activeReportModal.id)}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                    >
                      <CheckCircle2 size={14} /> Mark Ticket as Solved & Move to Archive
                    </button>
                  ) : (
                    <button
                      onClick={() => handleReopenReport(activeReportModal.id)}
                      className="w-full bg-muted hover:bg-muted/80 text-foreground font-bold py-2 rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-border"
                    >
                      <RefreshCw size={14} /> Reopen Ticket into Active Complaints
                    </button>
                  )}

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

      {/* ── ADD CATEGORY MODAL ──────────────────────────────────────────── */}
      {showAddCategoryModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-5 border-b border-border pb-3">
              <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                <LayoutGrid size={18} className="text-[#2874F0]" /> Add New Category
              </h3>
              <button onClick={() => { setShowAddCategoryModal(false); setAddCategoryImageFile(null); setAddCategoryImagePreview(null); }} className="text-muted-foreground hover:text-foreground cursor-pointer"><X size={18} /></button>
            </div>
            <form onSubmit={handleAddCategorySubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-foreground mb-1.5">Category Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Outdoor Furniture"
                  value={newCategory.name}
                  onChange={e => setNewCategory(p => ({ ...p, name: e.target.value }))}
                  className="w-full bg-background border border-border rounded-xl p-2.5 text-foreground font-medium outline-none focus:border-[#2874F0] focus:ring-2 focus:ring-[#2874F0]/20 transition-all"
                />
              </div>

              <div>
                <label className="block font-semibold text-foreground mb-1.5">Category Image</label>
                <label htmlFor="add-cat-file-input" className="border-2 border-dashed border-border hover:border-[#2874F0] rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-colors bg-muted/20 hover:bg-muted/40 text-center group">
                  <Upload size={22} className="text-muted-foreground group-hover:text-[#2874F0] mb-1.5 transition-colors" />
                  <span className="font-bold text-xs text-foreground">Click to select image file from device</span>
                  <span className="text-[10px] text-muted-foreground mt-0.5">Supports PNG, JPG, WEBP (Max 10MB)</span>
                  <input
                    id="add-cat-file-input"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAddCategoryFileChange}
                  />
                </label>

                {(addCategoryPreview || newCategory.image_url) && (
                  <div className="mt-2.5 relative rounded-xl overflow-hidden h-28 bg-muted border border-border group">
                    <img
                      src={addCategoryPreview || newCategory.image_url}
                      alt="Category Preview"
                      className="w-full h-full object-cover"
                      onError={e => (e.target as HTMLImageElement).style.display = 'none'}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setAddCategoryImageFile(null);
                        setAddCategoryImagePreview(null);
                        setNewCategory(p => ({ ...p, image_url: '' }));
                      }}
                      className="absolute top-2 right-2 bg-black/70 hover:bg-rose-600 text-white p-1 rounded-lg transition-colors cursor-pointer"
                      title="Remove image"
                    >
                      <X size={14} />
                    </button>
                    {addCategoryImageFile && (
                      <span className="absolute bottom-2 left-2 bg-[#2874F0] text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs">
                        Device File: {addCategoryImageFile.name}
                      </span>
                    )}
                  </div>
                )}

                <div className="mt-2 pt-2 border-t border-border/50">
                  <button
                    type="button"
                    onClick={() => setShowAddCategoryUrlInput(!showAddCategoryUrlInput)}
                    className="text-[11px] text-[#2874F0] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    {showAddCategoryUrlInput ? '─ Hide Web Image URL option' : '+ Or paste image web URL directly'}
                  </button>
                  {showAddCategoryUrlInput && (
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/..."
                      value={newCategory.image_url}
                      onChange={e => setNewCategory(p => ({ ...p, image_url: e.target.value }))}
                      className="w-full mt-1.5 bg-background border border-border rounded-xl p-2.5 text-foreground font-medium outline-none focus:border-[#2874F0] focus:ring-2 focus:ring-[#2874F0]/20 transition-all text-xs"
                    />
                  )}
                </div>
              </div>

              {categoryFormError && (
                <p className="text-rose-500 text-xs font-semibold flex items-center gap-1"><AlertCircle size={13} /> {categoryFormError}</p>
              )}
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => { setShowAddCategoryModal(false); setAddCategoryImageFile(null); setAddCategoryImagePreview(null); }} className="flex-1 bg-muted text-foreground font-semibold py-2.5 rounded-xl cursor-pointer hover:bg-muted/80 transition-colors">Cancel</button>
                <button type="submit" disabled={categoryLoading} className="flex-1 bg-[#2874F0] hover:bg-blue-600 disabled:opacity-60 text-white font-bold py-2.5 rounded-xl transition-colors shadow-md cursor-pointer">
                  {categoryLoading ? 'Uploading & Creating...' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── EDIT CATEGORY MODAL ─────────────────────────────────────────── */}
      {editingCategory && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-5 border-b border-border pb-3">
              <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                <Edit2 size={18} className="text-[#2874F0]" /> Edit Category
              </h3>
              <button onClick={() => { setEditingCategory(null); setEditCategoryFile(null); setEditCategoryPreview(null); }} className="text-muted-foreground hover:text-foreground cursor-pointer"><X size={18} /></button>
            </div>
            <form onSubmit={handleEditCategorySubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-foreground mb-1.5">Category Name *</label>
                <input
                  type="text"
                  required
                  value={editingCategory.name}
                  onChange={e => setEditingCategory((p: any) => ({ ...p, name: e.target.value }))}
                  className="w-full bg-background border border-border rounded-xl p-2.5 text-foreground font-medium outline-none focus:border-[#2874F0] focus:ring-2 focus:ring-[#2874F0]/20 transition-all"
                />
              </div>

              <div>
                <label className="block font-semibold text-foreground mb-1.5">Category Image</label>
                <label htmlFor="edit-cat-file-input" className="border-2 border-dashed border-border hover:border-[#2874F0] rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-colors bg-muted/20 hover:bg-muted/40 text-center group">
                  <Upload size={22} className="text-muted-foreground group-hover:text-[#2874F0] mb-1.5 transition-colors" />
                  <span className="font-bold text-xs text-foreground">Click to select new image file from device</span>
                  <span className="text-[10px] text-muted-foreground mt-0.5">Supports PNG, JPG, WEBP (Max 10MB)</span>
                  <input
                    id="edit-cat-file-input"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleEditCategoryFileChange}
                  />
                </label>

                {(editCategoryImagePreview || editingCategory.image_url) && (
                  <div className="mt-2.5 relative rounded-xl overflow-hidden h-28 bg-muted border border-border group">
                    <img
                      src={editCategoryImagePreview || editingCategory.image_url}
                      alt="Category Preview"
                      className="w-full h-full object-cover"
                      onError={e => (e.target as HTMLImageElement).style.display = 'none'}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setEditCategoryFile(null);
                        setEditCategoryPreview(null);
                        setEditingCategory((p: any) => ({ ...p, image_url: '' }));
                      }}
                      className="absolute top-2 right-2 bg-black/70 hover:bg-rose-600 text-white p-1 rounded-lg transition-colors cursor-pointer"
                      title="Remove image"
                    >
                      <X size={14} />
                    </button>
                    {editCategoryImageFile && (
                      <span className="absolute bottom-2 left-2 bg-[#2874F0] text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs">
                        New Device File: {editCategoryImageFile.name}
                      </span>
                    )}
                  </div>
                )}

                <div className="mt-2 pt-2 border-t border-border/50">
                  <button
                    type="button"
                    onClick={() => setShowEditCategoryUrlInput(!showEditCategoryUrlInput)}
                    className="text-[11px] text-[#2874F0] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    {showEditCategoryUrlInput ? '─ Hide Web Image URL option' : '+ Or paste image web URL directly'}
                  </button>
                  {showEditCategoryUrlInput && (
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/..."
                      value={editingCategory.image_url || ''}
                      onChange={e => setEditingCategory((p: any) => ({ ...p, image_url: e.target.value }))}
                      className="w-full mt-1.5 bg-background border border-border rounded-xl p-2.5 text-foreground font-medium outline-none focus:border-[#2874F0] focus:ring-2 focus:ring-[#2874F0]/20 transition-all text-xs"
                    />
                  )}
                </div>
              </div>

              {categoryFormError && (
                <p className="text-rose-500 text-xs font-semibold flex items-center gap-1"><AlertCircle size={13} /> {categoryFormError}</p>
              )}
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => { setEditingCategory(null); setEditCategoryFile(null); setEditCategoryPreview(null); }} className="flex-1 bg-muted text-foreground font-semibold py-2.5 rounded-xl cursor-pointer hover:bg-muted/80 transition-colors">Cancel</button>
                <button type="submit" disabled={categoryLoading} className="flex-1 bg-[#2874F0] hover:bg-blue-600 disabled:opacity-60 text-white font-bold py-2.5 rounded-xl transition-colors shadow-md cursor-pointer">
                  {categoryLoading ? 'Uploading & Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
