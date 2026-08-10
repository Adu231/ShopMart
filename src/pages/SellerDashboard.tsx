import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BarChart2, Package, ShoppingBag, TrendingUp, DollarSign, Star, Plus, LogOut, Home, AlertCircle, Settings, Wallet, CheckCircle2, ArrowDownRight, Layers, Boxes, Trash2, Edit, Save, RefreshCw, User, KeyRound, Building, Building2, ShieldCheck, ShieldAlert, AlertTriangle, ChevronRight, Download, FileSpreadsheet, Calendar, X, FileText, Upload, Image as ImageIcon, MessageSquare, ThumbsUp, RotateCcw, Check, Eye, Lock, ExternalLink, ArrowRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { PRODUCTS } from '@/constants/data';
import { formatPrice } from '@/lib/utils';
import { toast } from 'sonner';
import { api } from '@/services/api';

const SELLER_PRODUCTS_INITIAL: any[] = [];
const INITIAL_SELLER_ORDERS: any[] = [];
const DEFAULT_REMOVED_PRODUCTS: any[] = [];

const INITIAL_ADMIN_WARNINGS: any[] = [];
const INITIAL_SELLER_WITHDRAWALS: any[] = [];
const INITIAL_CUSTOMER_REVIEWS: any[] = [];
const INITIAL_RETURN_REQUESTS: any[] = [];
const INITIAL_RETURNED_STOCK: any[] = [];

const STATUS_COLORS: Record<string, string> = {
  placed: 'bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400',
  packed: 'bg-orange-100 dark:bg-orange-950/40 text-orange-700 dark:text-orange-400',
  shipped: 'bg-yellow-100 dark:bg-yellow-950/40 text-yellow-800 dark:text-yellow-300',
  delivered: 'bg-green-100 dark:bg-green-950/40 text-green-700 dark:text-green-400',
  cancelled: 'bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400',
};

const SALES_PERIOD_DATA = {
  weekly: {
    unitsSold: '0 Units',
    revenue: 0,
    aov: 0,
    growth: '0%',
    products: []
  },
  monthly: {
    unitsSold: '0 Units',
    revenue: 0,
    aov: 0,
    growth: '0%',
    products: []
  },
  yearly: {
    unitsSold: '0 Units',
    revenue: 0,
    aov: 0,
    growth: '0%',
    products: []
  }
};

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

  // Product Management Sub-sections: listed, stock, return_stock, removed
  const [productSubTab, setProductSubTab] = useState<'listed' | 'stock' | 'return_stock' | 'removed'>('listed');
  const [sellerProducts, setSellerProducts] = useState(SELLER_PRODUCTS_INITIAL);

  // FULL PRODUCT DETAILS MODAL STATE
  const [selectedProductModal, setSelectedProductModal] = useState<any | null>(null);
  const [selectedModalImageIdx, setSelectedModalImageIdx] = useState<number>(0);

  // Return & Replacement State
  const [returnRequests, setReturnRequests] = useState(INITIAL_RETURN_REQUESTS);
  const [returnedStock, setReturnedStock] = useState(INITIAL_RETURNED_STOCK);
  const [returnFilter, setReturnFilter] = useState<'all' | 'pending' | 'approved' | 'return' | 'replace'>('all');
  const [previewDefectImage, setPreviewDefectImage] = useState<string | null>(null);

  // Image Upload File & Cloudinary State (Multiple Files Support)
  const [deviceImageFiles, setDeviceImageFiles] = useState<string[]>([]);
  const [uploadImageFiles, setUploadImageFiles] = useState<File[]>([]);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [editUploadImageFiles, setEditUploadImageFiles] = useState<File[]>([]);
  const [editImagePreviews, setEditImagePreviews] = useState<string[]>([]);
  const [newProduct, setNewProduct] = useState({
    name: '',
    category: 'Living Room',
    price: '',
    stock: '15',
    imageUrlInput: '',
    description: '',
  });

  // Removed Items from localStorage
  const [removedItems, setRemovedItems] = useState<any[]>([]);

  // Orders State
  const [sellerOrders, setSellerOrders] = useState(INITIAL_SELLER_ORDERS);

  // Customer Reviews State & Filters
  const [reviewsList, setReviewsList] = useState(INITIAL_CUSTOMER_REVIEWS);
  const [reviewStarFilter, setReviewStarFilter] = useState<string>('All');
  const [sellerReplies, setSellerReplies] = useState<Record<string, string>>({});

  // Revenue & Withdrawal State
  const [availableBalance, setAvailableBalance] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalWithdrawn, setTotalWithdrawn] = useState(0);
  const [withdrawals, setWithdrawals] = useState(INITIAL_SELLER_WITHDRAWALS);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [payoutAccount, setPayoutAccount] = useState('HDFC Bank (A/C ...4819)');
  const [withdrawing, setWithdrawing] = useState(false);

  // Sales Reports Period State
  const [reportPeriod, setReportPeriod] = useState<'weekly' | 'monthly' | 'yearly'>('monthly');

  // Settings Sub-Sections Tabs
  const [activeSettingsTab, setActiveSettingsTab] = useState<'account' | 'profile' | 'security'>('account');
  const [accountDetails, setAccountDetails] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('shopmart_seller_business_profile') || '{}');
      return {
        accountHolder: saved.storeName || 'Samsung Electronics India',
        bankName: 'HDFC Bank Ltd.',
        accountNumber: saved.accountNumber || '50100234819201',
        ifscCode: saved.ifscCode || 'HDFC0000240',
        upiId: 'seller@hdfcbank',
        gstin: saved.gstin || '29AAACS1234F1Z5',
      };
    } catch {
      return {
        accountHolder: 'Samsung Electronics India',
        bankName: 'HDFC Bank Ltd.',
        accountNumber: '50100234819201',
        ifscCode: 'HDFC0000240',
        upiId: 'seller@hdfcbank',
        gstin: '29AAACS1234F1Z5',
      };
    }
  });

  const [profileForm, setProfileForm] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('shopmart_seller_business_profile') || '{}');
      return {
        storeName: saved.storeName || 'Samsung Official Store / WoodNest Hub',
        ownerName: user?.name || 'Rahul Seller',
        email: user?.email || 'seller@demo.com',
        phone: '9876543211',
      };
    } catch {
      return {
        storeName: 'Samsung Official Store / WoodNest Hub',
        ownerName: user?.name || 'Rahul Seller',
        email: user?.email || 'seller@demo.com',
        phone: '9876543211',
      };
    }
  });

  const [passwordForm, setPasswordForm] = useState({ current: '', newPw: '', confirmPw: '' });

  // Seller Verification Approval State
  const [isPendingApproval, setIsPendingApproval] = useState(() => {
    if (user?.status === 'Pending' || user?.isApproved === false) return true;
    try {
      const approvals = JSON.parse(localStorage.getItem('shopmart_seller_approvals') || '[]');
      const match = approvals.find((s: any) => s.email === user?.email || s.userAccountId === user?.id);
      return match ? match.status === 'Pending' : false;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const handleStorageApproval = () => {
      try {
        const currentUser = JSON.parse(localStorage.getItem('shopmart_user') || 'null');
        if (currentUser && (currentUser.status === 'Active' || currentUser.isApproved)) {
          setIsPendingApproval(false);
          return;
        }
        const approvals = JSON.parse(localStorage.getItem('shopmart_seller_approvals') || '[]');
        const match = approvals.find((s: any) => s.email === user?.email || s.userAccountId === user?.id);
        if (match && match.status === 'Active') {
          setIsPendingApproval(false);
          updateUser({ status: 'Active', isApproved: true });
        }
      } catch (e) {}
    };

    window.addEventListener('storage', handleStorageApproval);
    return () => window.removeEventListener('storage', handleStorageApproval);
  }, [user]);

  const checkApprovalStatus = () => {
    try {
      const currentUser = JSON.parse(localStorage.getItem('shopmart_user') || 'null');
      const approvals = JSON.parse(localStorage.getItem('shopmart_seller_approvals') || '[]');
      const match = approvals.find((s: any) => s.email === user?.email || s.userAccountId === user?.id);

      if ((currentUser && currentUser.status === 'Active') || (match && match.status === 'Active')) {
        setIsPendingApproval(false);
        updateUser({ status: 'Active', isApproved: true });
        toast.success('Your seller account has been approved by Super Admin!');
      } else {
        toast.info('Your registration & business profile are still under review by Super Admin.');
      }
    } catch (e) {
      toast.info('Verification check in progress.');
    }
  };

  const barData = useMemo(() => {
    const months = ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'];
    const monthlyTotals: Record<string, number> = { Mar: 0, Apr: 0, May: 0, Jun: 0, Jul: 0, Aug: 0 };

    if (Array.isArray(sellerOrders)) {
      sellerOrders.forEach((o: any) => {
        if (o.createdAt) {
          const date = new Date(o.createdAt);
          const m = date.toLocaleString('default', { month: 'short' });
          if (monthlyTotals[m] !== undefined) {
            monthlyTotals[m] += Number(o.amount) || Number(o.totalAmount) || 0;
          }
        }
      });
    }

    return months.map(m => ({ month: m, value: monthlyTotals[m] || 0 }));
  }, [sellerOrders]);
  const maxVal = Math.max(...barData.map(d => d.value), 1);

  useEffect(() => {
    if (!isAuthenticated) navigate('/login');
    if (user && user.role !== 'seller' && user.role !== 'admin') navigate('/');
  }, [isAuthenticated, user]);

  const [adminWarnings, setAdminWarnings] = useState<any[]>(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('shopmart_admin_warnings') || '[]');
      return Array.isArray(stored) ? stored.filter((w: any) => !['WRN-801', 'WRN-800', 'WRN-799', 'REP-101', 'REP-102'].includes(w.id) && !['WRN-801', 'WRN-800', 'WRN-799', 'REP-101', 'REP-102'].includes(w.reportId)) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('shopmart_removed_products') || '[]');
      setRemovedItems(Array.isArray(stored) ? stored.filter((p: any) => p.id !== 'p99') : []);
    } catch {
      setRemovedItems([]);
    }
  }, []);

  useEffect(() => {
    const handleStorage = () => {
      try {
        const storedWarnings = JSON.parse(localStorage.getItem('shopmart_admin_warnings') || '[]');
        if (Array.isArray(storedWarnings)) {
          setAdminWarnings(storedWarnings.filter((w: any) => !['WRN-801', 'WRN-800', 'WRN-799', 'REP-101', 'REP-102'].includes(w.id) && !['WRN-801', 'WRN-800', 'WRN-799', 'REP-101', 'REP-102'].includes(w.reportId)));
        }
        const storedRemoved = JSON.parse(localStorage.getItem('shopmart_removed_products') || '[]');
        if (Array.isArray(storedRemoved)) {
          setRemovedItems(storedRemoved.filter((p: any) => p.id !== 'p99'));
        }
      } catch (e) {}
    };

    api.reports.getSellerWarnings().then(res => {
      if (res && res.success && Array.isArray(res.warnings)) {
        setAdminWarnings(res.warnings);
      }
    });

    api.products.getUnlisted().then(res => {
      if (res && res.success && Array.isArray(res.unlisted)) {
        setRemovedItems(res.unlisted);
      }
    });

    api.products.getAll().then(res => {
      if (res && res.success && Array.isArray(res.products)) {
        setSellerProducts(res.products);
      }
    });

    api.orders.getAll().then(res => {
      if (res && res.success && Array.isArray(res.orders)) {
        setSellerOrders(res.orders);
      }
    });

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const handleAcknowledgeWarning = (warningId: string) => {
    setAdminWarnings(prev => {
      const updated = prev.map(w => w.id === warningId ? { ...w, status: 'Acknowledged' } : w);
      try {
        localStorage.setItem('shopmart_admin_warnings', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
    toast.success('Admin warning notice acknowledged.');
  };

  const stats = [
    { icon: DollarSign, label: 'Total Revenue', value: formatPrice(totalRevenue), change: '+12.5%', bg: 'bg-green-50 dark:bg-green-950/30', color: 'text-green-600' },
    { icon: Wallet, label: 'Available Payout', value: formatPrice(availableBalance), change: 'Ready to withdraw', bg: 'bg-[#2874F0]/10', color: 'text-[#2874F0]' },
    { icon: RotateCcw, label: 'Pending Returns', value: returnRequests.filter(r => r.status === 'pending').length.toString(), change: 'Action Required', bg: 'bg-purple-50 dark:bg-purple-950/30', color: 'text-purple-600' },
    { icon: Package, label: 'Active Products', value: sellerProducts.length.toString(), change: '+2', bg: 'bg-orange-50 dark:bg-orange-950/30', color: 'text-orange-600' },
  ];

  const navItems = [
    { id: 'overview', icon: BarChart2, label: 'Overview' },
    { id: 'products', icon: Package, label: 'Product Management' },
    { id: 'orders', icon: ShoppingBag, label: 'Orders' },
    { id: 'returns', icon: RotateCcw, label: 'Returns & Replacements' },
    { id: 'admin_notices', icon: ShieldAlert, label: 'Admin Messages & Reports' },
    { id: 'revenue', icon: TrendingUp, label: 'Revenue Analytics' },
    { id: 'analytics', icon: FileSpreadsheet, label: 'Sales Reports & Analytics' },
    { id: 'reviews', icon: Star, label: 'Customer Reviews' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

  const handleApproveReturnRequest = (req: typeof INITIAL_RETURN_REQUESTS[0]) => {
    setReturnRequests(prev => prev.map(r => r.id === req.id ? { ...r, status: 'approved' } : r));

    if (req.type === 'return') {
      setAvailableBalance(prev => Math.max(0, prev - req.sellerNet));
      setTotalRevenue(prev => Math.max(0, prev - req.amount));

      try {
        const adminRev = parseFloat(localStorage.getItem('shopmart_admin_commission') || '450000');
        localStorage.setItem('shopmart_admin_commission', Math.max(0, adminRev - req.commissionAmount).toString());
      } catch (e) {
        console.error(e);
      }

      try {
        const userWalletBalance = parseFloat(localStorage.getItem('shopmart_wallet_balance') || '5400');
        const newWalletBalance = userWalletBalance + req.amount;
        localStorage.setItem('shopmart_wallet_balance', newWalletBalance.toString());

        const userWalletTxns = JSON.parse(localStorage.getItem('shopmart_wallet_txns') || '[]');
        const newTxn = {
          id: `TXN-${Math.floor(10000 + Math.random() * 90000)}`,
          type: 'credit',
          title: `Seller Approved Refund (${req.orderId})`,
          category: 'refund',
          amount: req.amount,
          date: new Date().toISOString(),
          status: 'completed',
          referenceId: `REF-${req.id}`,
        };
        localStorage.setItem('shopmart_wallet_txns', JSON.stringify([newTxn, ...userWalletTxns]));
      } catch (e) {
        console.error(e);
      }

      const newReturnedItem = {
        id: `ret-item-${Date.now()}`,
        productName: req.productName,
        productId: req.productId,
        orderId: req.orderId,
        customerName: req.customerName,
        returnDate: new Date().toISOString().split('T')[0],
        condition: 'Inspected Customer Return',
        actionTaken: 'In Return Stock Warehouse',
        image: req.defectImages[0] || 'https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=600&q=80',
        stockQty: 1,
      };
      setReturnedStock(prev => [newReturnedItem, ...prev]);

      toast.success(`Return Request #${req.id} Approved! ${formatPrice(req.amount)} refunded to customer wallet.`);
    } else {
      const newReturnedItem = {
        id: `ret-item-${Date.now()}`,
        productName: req.productName,
        productId: req.productId,
        orderId: req.orderId,
        customerName: req.customerName,
        returnDate: new Date().toISOString().split('T')[0],
        condition: 'Replacement Exchange Return',
        actionTaken: 'Replacement Unit Dispatched',
        image: req.defectImages[0] || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80',
        stockQty: 1,
      };
      setReturnedStock(prev => [newReturnedItem, ...prev]);

      toast.success(`Replacement Request #${req.id} Approved! Replacement unit dispatch initiated.`);
    }
  };

  const handleRejectReturnRequest = (reqId: string) => {
    setReturnRequests(prev => prev.map(r => r.id === reqId ? { ...r, status: 'rejected' } : r));
    toast.error(`Return Request #${reqId} rejected.`);
  };

  const handleRestockReturnedItem = (retItem: typeof INITIAL_RETURNED_STOCK[0]) => {
    setSellerProducts(prev => prev.map(p => p.id === retItem.productId ? { ...p, stock: p.stock + 1 } : p));
    setReturnedStock(prev => prev.filter(r => r.id !== retItem.id));
    toast.success(`"${retItem.productName}" restocked back into active seller inventory!`);
  };

  const handleWriteOffReturnedItem = (retItemId: string) => {
    setReturnedStock(prev => prev.filter(r => r.id !== retItemId));
    toast.error('Item marked as damaged and removed from Return Stock warehouse.');
  };

  const handleDeviceImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newFiles = Array.from(files);
    const combinedFiles = [...uploadImageFiles, ...newFiles];

    if (combinedFiles.length > 5) {
      toast.error('You can upload a maximum of 5 product images.');
      return;
    }

    const invalidSize = newFiles.some(f => f.size > 10 * 1024 * 1024);
    if (invalidSize) {
      toast.error('Each image file size must be under 10MB.');
      return;
    }

    setUploadImageFiles(combinedFiles);

    const newPreviews: string[] = [];
    let loaded = 0;

    newFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        newPreviews.push(base64);
        loaded++;
        if (loaded === newFiles.length) {
          setDeviceImageFiles(prev => [...prev, ...newPreviews]);
          toast.success(`${combinedFiles.length} total image(s) selected!`);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveDeviceImage = (index: number) => {
    setDeviceImageFiles(prev => prev.filter((_, i) => i !== index));
    setUploadImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.name.trim() || !newProduct.price) {
      toast.error('Please enter product name and price.');
      return;
    }

    const formData = new FormData();
    formData.append('name', newProduct.name.trim());
    formData.append('category', newProduct.category);
    formData.append('price', String(newProduct.price));
    formData.append('stock', String(newProduct.stock || 15));
    formData.append('description', newProduct.description || '');
    formData.append('seller', profileForm.storeName || 'Verified Seller');
    formData.append('brand', profileForm.storeName || 'Verified Seller');

    if (uploadImageFiles.length > 0) {
      uploadImageFiles.forEach(file => {
        formData.append('images', file);
      });
    } else if (newProduct.imageUrlInput.trim()) {
      formData.append('image_url', newProduct.imageUrlInput.trim());
    }

    const res = await api.products.create(formData);
    if (res && res.success && res.product) {
      setSellerProducts(prev => [res.product, ...prev]);
      toast.success(`New product "${res.product.name}" published with Cloudinary image(s)!`);
    } else if (res && (res.error || (res.success === false && res.message))) {
      toast.error(`Upload error: ${res.error || res.message}`);
      return;
    } else {
      const createdProd = {
        id: `p_seller_${Date.now()}`,
        name: newProduct.name,
        category: newProduct.category,
        price: Number(newProduct.price),
        stock: Number(newProduct.stock) || 10,
        images: deviceImageFiles.length > 0 ? deviceImageFiles : (newProduct.imageUrlInput ? [newProduct.imageUrlInput] : []),
        description: newProduct.description || '',
        rating: 5.0,
        reviewsCount: 1,
        seller: profileForm.storeName,
        discount: 10,
      };
      setSellerProducts(prev => [createdProd, ...prev]);
      toast.success(`New product "${newProduct.name}" listed successfully!`);
    }

    setShowAddProductModal(false);
    setUploadImageFiles([]);
    setDeviceImageFiles([]);
    setNewProduct({ name: '', category: 'Living Room', price: '', stock: '15', imageUrlInput: '', description: '' });
  };

  const handleEditProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    const formData = new FormData();
    formData.append('name', editingProduct.name);
    formData.append('category', editingProduct.category);
    formData.append('price', String(editingProduct.price));
    formData.append('stock', String(editingProduct.stock));
    formData.append('description', editingProduct.description || '');

    if (editUploadImageFiles.length > 0) {
      editUploadImageFiles.forEach(file => {
        formData.append('images', file);
      });
    } else if (editingProduct.imageUrlInput) {
      formData.append('image_url', editingProduct.imageUrlInput);
    }

    const res = await api.products.update(editingProduct.id, formData);
    if (res && res.success && res.product) {
      setSellerProducts(prev => prev.map(p => p.id === editingProduct.id ? { ...p, ...res.product } : p));
      toast.success(`Product "${res.product.name}" updated on Cloudinary & MySQL database!`);
    } else {
      setSellerProducts(prev => prev.map(p => p.id === editingProduct.id ? { ...p, ...editingProduct } : p));
      toast.success(`Product updated successfully!`);
    }

    setEditingProduct(null);
    setEditUploadImageFiles([]);
    setEditImagePreviews([]);
  };

  const handleUpdateStock = (productId: string, delta: number) => {
    setSellerProducts(prev => prev.map(p => {
      if (p.id === productId) {
        const nextStock = Math.max(0, p.stock + delta);
        toast.success(`Stock for "${p.name}" updated to ${nextStock}`);

        if (selectedProductModal?.id === productId) {
          setSelectedProductModal((modal: any) => modal ? { ...modal, stock: nextStock } : null);
        }
        return { ...p, stock: nextStock };
      }
      return p;
    }));
  };

  const handleUpdateOrderStatus = (orderId: string, newStatus: string) => {
    api.orders.updateStatus(orderId, newStatus);
    setSellerOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    toast.success(`Order #${orderId} status changed to "${newStatus.toUpperCase()}"!`);
  };

  const handlePostSellerReply = (reviewId: string) => {
    const replyText = sellerReplies[reviewId];
    if (!replyText || !replyText.trim()) {
      toast.error('Please enter a public reply before submitting.');
      return;
    }
    setReviewsList(prev => prev.map(r => r.id === reviewId ? { ...r, sellerReply: replyText.trim() } : r));
    toast.success('Public reply posted successfully!');
    setSellerReplies(prev => ({ ...prev, [reviewId]: '' }));
  };

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

  const handleExportAccountStatement = () => {
    let csv = 'Transaction ID,Date,Amount (INR),Payout Method,Status\n';
    withdrawals.forEach(w => {
      csv += `"${w.id}","${w.date}","${w.amount}","${w.method}","${w.status}"\n`;
    });
    downloadCSV(`WoodNest_Seller_Withdrawal_Statement_${Date.now()}.csv`, csv);
    toast.success('Withdrawal account statement downloaded as CSV!');
  };

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

  const handleSaveAccountDetails = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Withdrawal bank account & tax details updated!');
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser({ name: profileForm.ownerName });
    toast.success('Seller store profile updated!');
  };

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
    toast.success('Seller security password updated successfully!');
    setPasswordForm({ current: '', newPw: '', confirmPw: '' });
  };

  const filteredReturnRequests = returnRequests.filter(r => {
    if (returnFilter === 'pending') return r.status === 'pending';
    if (returnFilter === 'approved') return r.status === 'approved';
    if (returnFilter === 'return') return r.type === 'return';
    if (returnFilter === 'replace') return r.type === 'replace';
    return true;
  });

  const filteredReviews = reviewsList.filter(r => {
    if (reviewStarFilter === 'All') return true;
    if (reviewStarFilter === '5 Stars') return r.rating === 5;
    if (reviewStarFilter === '4 Stars') return r.rating === 4;
    if (reviewStarFilter === '3 Stars & Below') return r.rating <= 3;
    return true;
  });

  const currentSalesData = SALES_PERIOD_DATA[reportPeriod];

  if (isPendingApproval) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="bg-card border border-border rounded-2xl max-w-lg w-full p-8 shadow-2xl space-y-6 text-center">
          <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center border border-amber-200 dark:border-amber-900 shadow-sm">
            <Building2 size={32} />
          </div>

          <div className="space-y-2">
            <span className="bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 font-bold px-3.5 py-1 rounded-full text-xs border border-amber-200 dark:border-amber-900 inline-block">
              ⏳ Seller Account Verification Pending
            </span>
            <h1 className="text-2xl font-black text-foreground">Super Admin Approval Required</h1>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-md mx-auto">
              Welcome to WoodNest Seller Portal! Your seller registration & business profile are currently under review by Super Admin.
            </p>
          </div>

          <div className="bg-muted/40 p-4 rounded-xl border border-border text-left text-xs space-y-2">
            <p className="font-bold text-foreground border-b border-border pb-2">Submitted Business Registration Details:</p>
            <p className="text-muted-foreground">Store Name: <strong className="text-foreground">{accountDetails.accountHolder}</strong></p>
            <p className="text-muted-foreground">GSTIN: <strong className="font-mono text-foreground">{accountDetails.gstin}</strong></p>
            <p className="text-muted-foreground">Bank Account: <strong className="font-mono text-foreground">{accountDetails.accountNumber}</strong></p>
            <p className="text-muted-foreground">Registered Email: <strong className="text-foreground">{user?.email}</strong></p>
            <p className="text-muted-foreground">Status: <strong className="text-amber-600 font-bold">Pending Super Admin Verification</strong></p>
          </div>

          <div className="space-y-3 pt-2">
            <button
              onClick={checkApprovalStatus}
              className="w-full bg-[#2874F0] hover:bg-blue-600 text-white font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
            >
              <RefreshCw size={15} /> Check Admin Approval Status
            </button>
            <button
              onClick={() => { logout(); navigate('/login'); }}
              className="w-full text-xs font-semibold text-muted-foreground hover:text-rose-500 py-1 transition-colors cursor-pointer"
            >
              Sign Out / Return to Storefront
            </button>
          </div>
        </div>
      </div>
    );
  }

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
              {id === 'returns' && returnRequests.filter(r => r.status === 'pending').length > 0 && (
                <span className="ml-auto bg-purple-500 text-white text-[10px] rounded-full px-1.5 py-0.2 font-bold">
                  {returnRequests.filter(r => r.status === 'pending').length}
                </span>
              )}
              {id === 'admin_notices' && (adminWarnings.filter(w => w.status === 'Unread').length > 0 || removedItems.length > 0) && (
                <span className="ml-auto bg-rose-500 text-white text-[10px] rounded-full px-1.5 py-0.2 font-bold">
                  {adminWarnings.filter(w => w.status === 'Unread').length + removedItems.length}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-3 space-y-1 border-t border-white/10">
          <Link to="/" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-gray-400 hover:bg-white/10 hover:text-white transition-colors">
            <Home size={16} /> Storefront
          </Link>
          <button onClick={() => { logout(); navigate('/'); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-gray-400 hover:bg-red-500/20 hover:text-red-300 transition-colors cursor-pointer">
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-6">
          {/* 1. OVERVIEW SECTION (ENHANCED FULL PAGE DASHBOARD) */}
          {activeSection === 'overview' && (
            <div className="space-y-6">
              {/* Header & Quick Action Shortcuts */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-xl font-black text-foreground">Seller Performance Dashboard</h1>
                  <p className="text-xs text-muted-foreground">Welcome back, {profileForm.storeName}! Here is your daily store overview.</p>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <button
                    onClick={() => setShowAddProductModal(true)}
                    className="bg-[#2874F0] hover:bg-blue-600 text-white font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                  >
                    <Plus size={14} /> Add Product
                  </button>
                  <button
                    onClick={() => setActiveSection('revenue')}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                  >
                    <Wallet size={14} /> Withdraw Funds
                  </button>
                  <button
                    onClick={() => setActiveSection('analytics')}
                    className="bg-card hover:bg-muted text-foreground border border-border font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <FileSpreadsheet size={14} className="text-[#2874F0]" /> Sales Reports
                  </button>
                </div>
              </div>

              {/* 4 Stat KPI Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map(({ icon: Icon, label, value, change, bg, color }) => (
                  <div key={label} className="bg-card rounded-2xl shadow-xs p-4 border border-border flex items-center gap-3">
                    <div className={`${bg} p-3 rounded-xl shrink-0`}>
                      <Icon size={20} className={color} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground font-medium">{label}</p>
                      <p className="text-lg font-black text-foreground truncate">{value}</p>
                      <span className="text-[10px] text-muted-foreground font-semibold">{change}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pending Returns Banner */}
              {returnRequests.filter(r => r.status === 'pending').length > 0 && (
                <div className="bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-purple-600 text-white rounded-xl">
                      <RotateCcw size={18} />
                    </div>
                    <div>
                      <p className="font-extrabold text-purple-900 dark:text-purple-200">
                        {returnRequests.filter(r => r.status === 'pending').length} Pending Return & Replacement Request(s)
                      </p>
                      <p className="text-muted-foreground text-[11px]">Review customer defect photos & approve refunds to update seller balance and admin commission.</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveSection('returns')}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl font-bold text-xs shrink-0 cursor-pointer shadow-sm"
                  >
                    Manage Returns & Replacements →
                  </button>
                </div>
              )}

              {/* 2-Column Overview Grid: Sales Bar Chart & Recent Orders Table */}
              <div className="grid lg:grid-cols-3 gap-5">
                {/* Left Column: Monthly Revenue Chart */}
                <div className="lg:col-span-2 bg-card rounded-2xl border border-border shadow-sm p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-extrabold text-sm text-foreground flex items-center gap-2">
                        <TrendingUp size={16} className="text-[#2874F0]" /> Monthly Revenue Growth Trend
                      </h3>
                      <p className="text-[11px] text-muted-foreground">Store sales earnings for Mar 2026 - Aug 2026</p>
                    </div>
                    <span className="text-xs bg-emerald-100 text-emerald-700 font-bold px-2.5 py-0.5 rounded-full">
                      +12.5% Growth
                    </span>
                  </div>

                  <div className="h-44 flex items-end gap-3 pt-6 pb-2 px-3 bg-muted/20 rounded-xl border border-border">
                    {barData.map(d => {
                      const heightPercent = Math.max(15, Math.round((d.value / maxVal) * 100));
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

                {/* Right Column: Top Performing Listed Products Preview */}
                <div className="bg-card rounded-2xl border border-border shadow-sm p-5 space-y-3">
                  <div className="flex items-center justify-between border-b border-border pb-2">
                    <h3 className="font-extrabold text-xs text-foreground uppercase tracking-wider">Top Store Listings</h3>
                    <button
                      onClick={() => setActiveSection('products')}
                      className="text-[11px] text-[#2874F0] font-bold hover:underline"
                    >
                      View All ({sellerProducts.length})
                    </button>
                  </div>

                  <div className="space-y-3 divide-y divide-border">
                    {sellerProducts.slice(0, 3).map(p => (
                      <div
                        key={p.id}
                        onClick={() => { setSelectedModalImageIdx(0); setSelectedProductModal(p); }}
                        className="pt-2 flex items-center justify-between gap-3 group cursor-pointer"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <img src={p.images[0]} alt="" className="w-10 h-10 rounded-lg object-cover border border-border shrink-0" />
                          <div className="min-w-0">
                            <p className="font-bold text-xs text-foreground truncate group-hover:text-[#2874F0] transition-colors">{p.name}</p>
                            <p className="text-[10px] text-muted-foreground">{p.category} · Stock: {p.stock}</p>
                          </div>
                        </div>
                        <span className="font-black text-xs text-foreground shrink-0">{formatPrice(p.price)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recent Orders Overview Table */}
              <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-border bg-muted/30 flex items-center justify-between">
                  <h3 className="font-extrabold text-sm text-foreground flex items-center gap-2">
                    <ShoppingBag size={16} className="text-[#2874F0]" /> Recent Customer Orders ({sellerOrders.length})
                  </h3>
                  <button onClick={() => setActiveSection('orders')} className="text-xs text-[#2874F0] font-bold hover:underline">
                    View Full Order Management →
                  </button>
                </div>

                <table className="w-full text-xs text-left">
                  <thead className="bg-muted text-muted-foreground uppercase font-semibold text-[10px] tracking-wider">
                    <tr>
                      <th className="px-4 py-3">Order ID</th>
                      <th className="px-4 py-3">Product Name</th>
                      <th className="px-4 py-3">Customer</th>
                      <th className="px-4 py-3">Total Paid</th>
                      <th className="px-4 py-3">Order Status</th>
                      <th className="px-4 py-3 text-right">Update Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {sellerOrders.map(o => (
                      <tr key={o.id} className="hover:bg-muted/40 transition-colors">
                        <td className="px-4 py-3.5 font-mono font-bold text-[#2874F0]">{o.id}</td>
                        <td className="px-4 py-3.5 font-bold text-foreground">{o.product}</td>
                        <td className="px-4 py-3.5 text-muted-foreground">{o.customer}</td>
                        <td className="px-4 py-3.5 font-black text-foreground">{formatPrice(o.amount)}</td>
                        <td className="px-4 py-3.5">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${STATUS_COLORS[o.status]}`}>
                            ● {o.status}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <select
                            value={o.status}
                            onChange={e => handleUpdateOrderStatus(o.id, e.target.value)}
                            className="bg-background border border-border rounded-lg px-2.5 py-1 text-xs font-semibold outline-none cursor-pointer"
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

          {/* 2. PRODUCT MANAGEMENT SECTION */}
          {activeSection === 'products' && (
            <div className="space-y-5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-xl font-bold text-foreground">Product Management</h1>
                  <p className="text-xs text-muted-foreground">Click any product to view full specifications, edit stock, or preview storefront listing</p>
                </div>
                <button
                  onClick={() => setShowAddProductModal(true)}
                  className="flex items-center gap-2 bg-[#2874F0] hover:bg-[#1D5FD1] text-white text-xs px-4 py-2.5 rounded-xl font-bold transition-all shadow-md shrink-0 cursor-pointer"
                >
                  <Plus size={16} /> Add New Product
                </button>
              </div>

              <div className="flex gap-2 bg-card p-1.5 rounded-xl border border-border overflow-x-auto">
                {[
                  { id: 'listed', label: 'Listed Products', icon: Layers },
                  { id: 'stock', label: 'Stock Management', icon: Boxes },
                  { id: 'return_stock', label: 'Return Stock Warehouse', icon: RotateCcw },
                  { id: 'removed', label: 'Removed Items by Admin', icon: Trash2 },
                ].map(tab => {
                  const Icon = tab.icon;
                  const isActive = productSubTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setProductSubTab(tab.id as any)}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                        isActive ? 'bg-[#2874F0] text-white shadow-sm' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                      }`}
                    >
                      <Icon size={15} /> {tab.label}
                      {tab.id === 'return_stock' && returnedStock.length > 0 && (
                        <span className="bg-purple-600 text-white text-[10px] rounded-full px-1.5 py-0.2 font-bold">
                          {returnedStock.length}
                        </span>
                      )}
                      {tab.id === 'removed' && removedItems.length > 0 && (
                        <span className="bg-rose-500 text-white text-[10px] rounded-full px-1.5 py-0.2 font-bold">
                          {removedItems.length}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {productSubTab === 'listed' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {sellerProducts.map(p => (
                    <div
                      key={p.id}
                      onClick={() => { setSelectedModalImageIdx(0); setSelectedProductModal(p); }}
                      className="bg-card rounded-xl shadow-sm border border-border overflow-hidden hover:border-[#2874F0] hover:shadow-md transition-all cursor-pointer group"
                      title="Click to view full product details"
                    >
                      <div className="relative h-40 overflow-hidden bg-muted">
                        <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        <span className="absolute top-2.5 right-2.5 bg-black/60 backdrop-blur-sm text-white text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                          <Eye size={12} /> View Details
                        </span>
                      </div>

                      <div className="p-4 space-y-2">
                        <div>
                          <p className="text-sm font-bold text-foreground line-clamp-1 group-hover:text-[#2874F0] transition-colors">{p.name}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{p.category}</p>
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t border-border">
                          <span className="text-base font-extrabold text-foreground">{formatPrice(p.price)}</span>
                          <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${p.stock > 0 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300' : 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300'}`}>
                            {p.stock > 0 ? `${p.stock} in stock` : 'Out of stock'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

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
                          <td
                            className="px-4 py-3.5 cursor-pointer"
                            onClick={() => { setSelectedModalImageIdx(0); setSelectedProductModal(p); }}
                          >
                            <div className="flex items-center gap-3 group">
                              <img src={p.images[0]} alt="" className="w-10 h-10 rounded-lg object-cover border border-border shrink-0" />
                              <span className="font-bold text-foreground max-w-[200px] truncate group-hover:text-[#2874F0] transition-colors">{p.name}</span>
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
                                className="w-6 h-6 rounded bg-background hover:bg-muted text-foreground font-bold flex items-center justify-center transition-colors cursor-pointer"
                              >
                                -
                              </button>
                              <span className="w-8 text-center font-bold text-foreground">{p.stock}</span>
                              <button
                                onClick={() => handleUpdateStock(p.id, 1)}
                                className="w-6 h-6 rounded bg-background hover:bg-muted text-foreground font-bold flex items-center justify-center transition-colors cursor-pointer"
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

              {productSubTab === 'return_stock' && (
                <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
                  <div className="p-4 border-b border-border bg-purple-50/50 dark:bg-purple-950/20 flex justify-between items-center text-xs">
                    <div>
                      <h3 className="font-extrabold text-foreground flex items-center gap-2">
                        <RotateCcw size={16} className="text-purple-600" /> Returned Product Inventory ({returnedStock.length})
                      </h3>
                      <p className="text-muted-foreground text-[11px]">Items returned by customers after seller approval</p>
                    </div>
                  </div>

                  {returnedStock.length === 0 ? (
                    <div className="p-12 text-center text-muted-foreground">
                      <RotateCcw size={44} className="mx-auto mb-2 opacity-40 text-purple-600" />
                      <p className="font-bold text-xs text-foreground mb-1">No Returned Products in Stock</p>
                      <p className="text-[11px] text-muted-foreground">Approved return & replacement items will automatically appear here for inspection & restocking.</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-border">
                      {returnedStock.map(item => (
                        <div key={item.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs hover:bg-muted/30 transition-colors">
                          <div className="flex items-center gap-4 min-w-0">
                            <img src={item.image} alt="" className="w-14 h-14 rounded-xl object-cover border border-border shrink-0" />
                            <div className="min-w-0">
                              <p className="font-bold text-foreground text-sm truncate">{item.productName}</p>
                              <p className="text-muted-foreground text-[11px] mt-0.5">
                                Order Ticket: <strong className="text-[#2874F0]">{item.orderId}</strong> · Customer: {item.customerName}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                  Condition: {item.condition}
                                </span>
                                <span className="text-[10px] text-muted-foreground">Returned On: {item.returnDate}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={() => handleRestockReturnedItem(item)}
                              className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1 transition-colors cursor-pointer shadow-xs"
                            >
                              <Plus size={13} /> Restock to Active Inventory
                            </button>
                            <button
                              onClick={() => handleWriteOffReturnedItem(item.id)}
                              className="px-3 py-2 bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-200 font-bold rounded-xl text-xs flex items-center gap-1 transition-colors cursor-pointer"
                            >
                              <Trash2 size={13} /> Write Off
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {productSubTab === 'removed' && (
                <div className="space-y-3">
                  {removedItems.map(item => (
                    <div key={item.id} className="bg-card p-4 rounded-xl border border-rose-200 dark:border-rose-900/40 flex items-start gap-4">
                      <div className="p-2.5 bg-rose-100 text-rose-600 rounded-xl shrink-0">
                        <AlertTriangle size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-bold text-foreground text-sm">{item.name}</p>
                          <span className="text-[10px] bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full font-bold">Unlisted by Admin</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Reason: <strong className="text-foreground">{item.reason}</strong></p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 3. RETURNS & REPLACEMENTS MANAGEMENT */}
          {activeSection === 'returns' && (
            <div className="space-y-5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
                    <RotateCcw className="text-purple-600" size={24} /> Returns & Replacements Management
                  </h1>
                  <p className="text-xs text-muted-foreground">Approve customer returns/exchanges, deduct net seller balance & admin commission, and process wallet refunds</p>
                </div>

                <div className="flex items-center gap-1.5 bg-card p-1.5 rounded-xl border border-border text-xs">
                  <button
                    onClick={() => setReturnFilter('all')}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                      returnFilter === 'all' ? 'bg-[#2874F0] text-white shadow-xs' : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    All ({returnRequests.length})
                  </button>
                  <button
                    onClick={() => setReturnFilter('pending')}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                      returnFilter === 'pending' ? 'bg-purple-600 text-white shadow-xs' : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Pending ({returnRequests.filter(r => r.status === 'pending').length})
                  </button>
                  <button
                    onClick={() => setReturnFilter('approved')}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                      returnFilter === 'approved' ? 'bg-emerald-600 text-white shadow-xs' : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Approved ({returnRequests.filter(r => r.status === 'approved').length})
                  </button>
                </div>
              </div>

              {filteredReturnRequests.length === 0 ? (
                <div className="bg-card rounded-2xl p-12 text-center border border-border shadow-sm">
                  <RotateCcw size={48} className="mx-auto mb-3 text-purple-600 opacity-40" />
                  <p className="font-bold text-foreground text-sm mb-1">No Return/Replacement Requests Found</p>
                  <p className="text-xs text-muted-foreground">Customer return and replacement requests will appear here for seller approval.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredReturnRequests.map(req => {
                    const isPending = req.status === 'pending';
                    const isApproved = req.status === 'approved';
                    const isRejected = req.status === 'rejected';

                    return (
                      <div key={req.id} className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
                        <div className="px-5 py-3 bg-muted/40 border-b border-border flex flex-wrap items-center justify-between gap-3 text-xs">
                          <div className="flex items-center gap-4">
                            <span className={`text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-wider ${
                              req.type === 'return' ? 'bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300' : 'bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300'
                            }`}>
                              ● {req.type.toUpperCase()} REQUEST
                            </span>
                            <span className="font-bold text-foreground">Ticket #{req.id}</span>
                            <span className="text-muted-foreground">Order ID: <strong className="text-[#2874F0]">{req.orderId}</strong></span>
                            <span className="text-muted-foreground">Requested On: {req.requestDate}</span>
                          </div>

                          <span className={`text-[10px] px-3 py-0.5 rounded-full font-bold uppercase ${
                            isApproved ? 'bg-emerald-100 text-emerald-700' : isRejected ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-800'
                          }`}>
                            Status: {req.status}
                          </span>
                        </div>

                        <div className="p-5 space-y-4 text-xs">
                          <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <p className="text-muted-foreground font-semibold text-[11px] uppercase tracking-wider">Product & Financial Breakdown</p>
                              <div className="flex items-center gap-3 bg-muted/30 p-3 rounded-xl border border-border">
                                <img src={req.defectImages[0]} alt="" className="w-12 h-12 rounded-lg object-cover border border-border shrink-0" />
                                <div>
                                  <p className="font-bold text-foreground text-xs">{req.productName}</p>
                                  <p className="text-muted-foreground text-[11px]">Customer: <strong>{req.customerName}</strong> ({req.customerEmail})</p>
                                </div>
                              </div>

                              <div className="bg-purple-50 dark:bg-purple-950/20 p-3 rounded-xl border border-purple-200 dark:border-purple-900 space-y-1 text-[11px]">
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Product Price (Refund Amount):</span>
                                  <span className="font-extrabold text-purple-900 dark:text-purple-200">{formatPrice(req.amount)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">
                                    Admin Commission Reversal (-{(() => {
                                      try {
                                        const rules = JSON.parse(localStorage.getItem('shopmart_commission_rules') || '{}');
                                        if (rules.standardRate !== undefined) return rules.standardRate;
                                      } catch (e) {}
                                      return 10;
                                    })()}%):
                                  </span>
                                  <span className="font-bold text-rose-600">-{formatPrice(req.commissionAmount)}</span>
                                </div>
                                <div className="flex justify-between pt-1 border-t border-purple-200 dark:border-purple-900 font-extrabold">
                                  <span>Net Seller Payout Reversal:</span>
                                  <span className="text-rose-600">-{formatPrice(req.sellerNet)}</span>
                                </div>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <p className="text-muted-foreground font-semibold text-[11px] uppercase tracking-wider">Customer Defect Report & Photos</p>
                              <div className="bg-card p-3 rounded-xl border border-border space-y-1.5">
                                <p className="font-bold text-foreground">Reason: <span className="text-purple-600">{req.reason}</span></p>
                                <p className="text-muted-foreground text-[11px]">Notes: "{req.notes}"</p>
                                <p className="text-[10px] text-muted-foreground">Refund Destination: <strong>{req.refundDestination}</strong></p>
                              </div>

                              {req.defectImages?.length > 0 && (
                                <div>
                                  <p className="text-[10px] font-bold text-muted-foreground mb-1">Uploaded Defect Photos ({req.defectImages.length}):</p>
                                  <div className="flex gap-2">
                                    {req.defectImages.map((img, idx) => (
                                      <button
                                        key={idx}
                                        type="button"
                                        onClick={() => setPreviewDefectImage(img)}
                                        className="relative w-12 h-12 rounded-lg overflow-hidden border border-border hover:ring-2 hover:ring-purple-500 cursor-pointer group"
                                      >
                                        <img src={img} alt="" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                                          <Eye size={12} />
                                        </div>
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-border">
                            <span className="text-muted-foreground text-[11px]">
                              {isApproved ? '✓ Approved! Balance, Admin Commission & User Wallet updated.' : isRejected ? '✕ Request Rejected by Seller.' : '● Action Required: Click approve to execute financial reversals & refund.'}
                            </span>

                            {isPending && (
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleRejectReturnRequest(req.id)}
                                  className="px-4 py-2 bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-200 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                                >
                                  Reject Request
                                </button>
                                <button
                                  onClick={() => handleApproveReturnRequest(req)}
                                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-extrabold rounded-xl text-xs transition-all shadow-md cursor-pointer flex items-center gap-1.5"
                                >
                                  <CheckCircle2 size={14} /> Approve & Process Refund
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* 4. ORDERS SECTION */}
          {activeSection === 'orders' && (
            <div className="space-y-5">
              <h1 className="text-xl font-bold text-foreground">Order Management</h1>
              <div className="bg-card rounded-xl border border-border overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-muted text-muted-foreground uppercase font-semibold">
                    <tr>
                      <th className="px-4 py-3">Order ID</th>
                      <th className="px-4 py-3">Product</th>
                      <th className="px-4 py-3">Customer</th>
                      <th className="px-4 py-3">Amount</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Change Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {sellerOrders.map(o => (
                      <tr key={o.id}>
                        <td className="px-4 py-3 font-mono font-bold text-[#2874F0]">{o.id}</td>
                        <td className="px-4 py-3 font-semibold text-foreground">{o.product}</td>
                        <td className="px-4 py-3 text-muted-foreground">{o.customer}</td>
                        <td className="px-4 py-3 font-bold text-foreground">{formatPrice(o.amount)}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${STATUS_COLORS[o.status]}`}>
                            {o.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <select
                            value={o.status}
                            onChange={e => handleUpdateOrderStatus(o.id, e.target.value)}
                            className="bg-background border border-border rounded px-2 py-1 text-xs font-semibold outline-none"
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

          {/* 5. REVENUE ANALYTICS & WITHDRAWAL */}
          {activeSection === 'revenue' && (
            <div className="space-y-5">
              <h1 className="text-xl font-bold text-foreground">Revenue & Withdrawals</h1>
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="bg-card p-4 rounded-xl border border-border">
                  <p className="text-xs text-muted-foreground">Total Revenue</p>
                  <p className="text-xl font-bold text-foreground">{formatPrice(totalRevenue)}</p>
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
                  <h3 className="font-bold text-sm text-foreground">Withdraw Revenue Funds</h3>
                  <form onSubmit={handleWithdrawRevenue} className="space-y-3 text-xs">
                    <div>
                      <label className="block text-muted-foreground mb-1 font-semibold">Enter Amount (₹)</label>
                      <input
                        type="number"
                        required
                        max={availableBalance}
                        value={withdrawAmount}
                        onChange={e => setWithdrawAmount(e.target.value)}
                        placeholder="e.g. 50000"
                        className="w-full bg-background border border-border rounded-xl p-3 font-bold text-foreground outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-muted-foreground mb-1 font-semibold">Select Destination Payout Account</label>
                      <select
                        value={payoutAccount}
                        onChange={e => setPayoutAccount(e.target.value)}
                        className="w-full bg-background border border-border rounded-xl p-3 font-medium text-foreground outline-none"
                      >
                        <option value="HDFC Bank (A/C ...4819)">{accountDetails.bankName} (A/C ...{accountDetails.accountNumber.slice(-4)})</option>
                        <option value="UPI (samsung@hdfcbank)">UPI ({accountDetails.upiId})</option>
                      </select>
                    </div>
                    <button
                      type="submit"
                      disabled={withdrawing}
                      className="w-full bg-[#2874F0] hover:bg-blue-600 text-white font-bold py-3 rounded-xl transition-colors cursor-pointer shadow-md"
                    >
                      {withdrawing ? 'Processing Payout Request...' : 'Withdraw Funds Now'}
                    </button>
                  </form>
                </div>

                <div className="bg-card p-5 rounded-2xl border border-border space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-sm text-foreground">Withdrawal History Statement</h3>
                    <button
                      onClick={handleExportAccountStatement}
                      className="text-xs bg-muted hover:bg-muted/80 text-foreground px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 cursor-pointer"
                    >
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

          {/* 6. FULL SALES REPORTS & ANALYTICS SECTION */}
          {activeSection === 'analytics' && (
            <div className="space-y-5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
                    <FileSpreadsheet className="text-[#2874F0]" size={24} /> Sales Reports & Performance Analytics
                  </h1>
                  <p className="text-xs text-muted-foreground">Comprehensive sales metrics, product revenue breakdown & CSV export by time period</p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 bg-card p-1.5 rounded-xl border border-border text-xs">
                    {(['weekly', 'monthly', 'yearly'] as const).map(p => (
                      <button
                        key={p}
                        onClick={() => setReportPeriod(p)}
                        className={`px-4 py-2 rounded-lg font-bold capitalize transition-all cursor-pointer ${
                          reportPeriod === p ? 'bg-[#2874F0] text-white shadow-sm' : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        {p} Report
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={handleExportSalesReport}
                    className="text-xs bg-[#2874F0] hover:bg-blue-600 text-white px-4 py-2.5 rounded-xl font-bold flex items-center gap-1.5 cursor-pointer shadow-md transition-colors"
                  >
                    <Download size={14} /> Export CSV Statement
                  </button>
                </div>
              </div>

              <div className="grid sm:grid-cols-4 gap-4">
                <div className="bg-card p-4 rounded-xl border border-border shadow-xs">
                  <p className="text-xs text-muted-foreground font-semibold">Units Sold ({reportPeriod.toUpperCase()})</p>
                  <p className="text-2xl font-black text-foreground mt-1">{currentSalesData.unitsSold}</p>
                  <p className="text-[10px] text-emerald-600 font-bold mt-1">{currentSalesData.growth}</p>
                </div>
                <div className="bg-card p-4 rounded-xl border border-border shadow-xs">
                  <p className="text-xs text-muted-foreground font-semibold">Net Sales Revenue</p>
                  <p className="text-2xl font-black text-emerald-600 mt-1">{formatPrice(currentSalesData.revenue)}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">100% Verified Sales</p>
                </div>
                <div className="bg-card p-4 rounded-xl border border-border shadow-xs">
                  <p className="text-xs text-muted-foreground font-semibold">Average Order Value (AOV)</p>
                  <p className="text-2xl font-black text-[#2874F0] mt-1">{formatPrice(currentSalesData.aov)}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">Per transaction avg</p>
                </div>
                <div className="bg-card p-4 rounded-xl border border-border shadow-xs">
                  <p className="text-xs text-muted-foreground font-semibold">Platform Return Rate</p>
                  <p className="text-2xl font-black text-purple-600 mt-1">1.2%</p>
                  <p className="text-[10px] text-emerald-600 font-bold mt-1">Below platform max 3%</p>
                </div>
              </div>

              <div className="bg-card p-5 rounded-2xl border border-border shadow-sm space-y-3">
                <h3 className="font-extrabold text-sm text-foreground flex items-center gap-2">
                  <BarChart2 size={16} className="text-[#2874F0]" /> Revenue Breakdown Trend ({reportPeriod.toUpperCase()})
                </h3>
                <div className="h-40 flex items-end gap-3 pt-6 pb-2 px-4 bg-muted/20 rounded-xl border border-border">
                  {currentSalesData.products.map(p => {
                    const maxRev = Math.max(...currentSalesData.products.map(x => x.revenue));
                    const heightPercent = Math.max(20, Math.round((p.revenue / maxRev) * 100));

                    return (
                      <div key={p.id} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                        <span className="text-[10px] font-bold text-[#2874F0] opacity-0 group-hover:opacity-100 transition-opacity">
                          {formatPrice(p.revenue)}
                        </span>
                        <div
                          style={{ height: `${heightPercent}%` }}
                          className="w-full bg-gradient-to-t from-[#2874F0] to-blue-400 rounded-t-lg transition-all group-hover:from-blue-600 group-hover:to-blue-500 shadow-sm"
                        />
                        <span className="text-[10px] font-bold text-muted-foreground truncate w-full text-center">{p.category}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-border bg-muted/30 flex items-center justify-between">
                  <h3 className="font-extrabold text-sm text-foreground">Detailed Product Sales Breakdown</h3>
                  <span className="text-xs text-muted-foreground font-medium">Showing {currentSalesData.products.length} key products</span>
                </div>
                <table className="w-full text-xs text-left">
                  <thead className="bg-muted text-muted-foreground uppercase font-semibold text-[10px] tracking-wider">
                    <tr>
                      <th className="px-4 py-3">Product Name</th>
                      <th className="px-4 py-3">Category</th>
                      <th className="px-4 py-3">Unit Price</th>
                      <th className="px-4 py-3 text-center">Units Sold</th>
                      <th className="px-4 py-3">Total Sales Revenue</th>
                      <th className="px-4 py-3 text-right">Stock Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {currentSalesData.products.map(p => (
                      <tr key={p.id} className="hover:bg-muted/40 transition-colors">
                        <td className="px-4 py-3.5 font-bold text-foreground">{p.name}</td>
                        <td className="px-4 py-3.5 text-muted-foreground">{p.category}</td>
                        <td className="px-4 py-3.5 font-semibold text-foreground">{formatPrice(p.price)}</td>
                        <td className="px-4 py-3.5 text-center font-extrabold text-sm text-[#2874F0]">{p.units}</td>
                        <td className="px-4 py-3.5 font-black text-emerald-600">{formatPrice(p.revenue)}</td>
                        <td className="px-4 py-3.5 text-right">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            p.stock > 10 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {p.stock} units remaining
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 7. CUSTOMER REVIEWS SECTION */}
          {activeSection === 'reviews' && (
            <div className="space-y-5">
              <h1 className="text-xl font-bold text-foreground">Customer Reviews & Ratings</h1>
              <div className="bg-card p-5 rounded-2xl border border-border space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
                  <div>
                    <h3 className="font-extrabold text-base text-foreground">4.8 / 5.0 ★ Store Rating</h3>
                    <p className="text-xs text-muted-foreground">Based on {reviewsList.length} verified customer product reviews</p>
                  </div>
                  <div className="flex gap-2">
                    {['All', '5 Stars', '4 Stars', '3 Stars & Below'].map(f => (
                      <button
                        key={f}
                        onClick={() => setReviewStarFilter(f)}
                        className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                          reviewStarFilter === f ? 'bg-[#2874F0] text-white' : 'bg-muted text-muted-foreground hover:bg-muted/80'
                        }`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="divide-y divide-border">
                  {filteredReviews.map(r => (
                    <div key={r.id} className="py-4 space-y-2 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-foreground text-sm">{r.customer}</span>
                        <span className="text-amber-500 font-bold">{r.rating} ★</span>
                      </div>
                      <p className="text-muted-foreground">{r.comment}</p>
                      {r.sellerReply && (
                        <div className="bg-blue-50 dark:bg-blue-950/30 p-2.5 rounded-xl border border-blue-200 dark:border-blue-900 text-blue-900 dark:text-blue-200 text-[11px]">
                          <strong>Seller Official Reply:</strong> {r.sellerReply}
                        </div>
                      )}
                      {!r.sellerReply && (
                        <div className="flex gap-2 pt-1">
                          <input
                            type="text"
                            placeholder="Write official seller reply..."
                            value={sellerReplies[r.id] || ''}
                            onChange={e => setSellerReplies({ ...sellerReplies, [r.id]: e.target.value })}
                            className="flex-1 bg-background border border-border rounded-xl px-3 py-1.5 text-xs outline-none"
                          />
                          <button
                            onClick={() => handlePostSellerReply(r.id)}
                            className="bg-[#2874F0] text-white font-bold px-3 py-1.5 rounded-xl hover:bg-blue-600 cursor-pointer"
                          >
                            Post Reply
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ADMIN MESSAGES & REPORTS SECTION */}
          {activeSection === 'admin_notices' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
                    <ShieldAlert className="text-rose-600" size={22} /> Admin Messages & Audit Reports
                  </h1>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    View official warning messages sent by Super Admin regarding customer reports & unlisted products.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 font-bold px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900 flex items-center gap-1">
                    <AlertTriangle size={14} /> {adminWarnings.filter(w => w.status === 'Unread').length} New Warnings
                  </span>
                  <span className="bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 font-bold px-3 py-1.5 rounded-xl border border-amber-200 dark:border-amber-900 flex items-center gap-1">
                    <Trash2 size={14} /> {removedItems.length} Unlisted Products
                  </span>
                </div>
              </div>

              {/* Sub-tabs for Warnings vs Removed Products */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Left Card Column: Official Admin Warning Messages */}
                <div className="bg-card rounded-2xl border border-border shadow-sm p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-border pb-3">
                    <h2 className="font-bold text-sm text-foreground flex items-center gap-2">
                      <MessageSquare className="text-[#2874F0]" size={18} /> Admin Report Warnings ({adminWarnings.length})
                    </h2>
                    <span className="text-[10px] text-muted-foreground font-medium">Customer Quality Audits</span>
                  </div>

                  {adminWarnings.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground space-y-2">
                      <CheckCircle2 size={36} className="mx-auto text-emerald-500 opacity-60" />
                      <p className="font-bold text-xs">No Warnings Received</p>
                      <p className="text-[11px]">Your seller store has clean audit records!</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                      {adminWarnings.map((w: any) => (
                        <div
                          key={w.id}
                          className={`p-4 rounded-xl border transition-all ${
                            w.status === 'Unread'
                              ? 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/50 shadow-xs'
                              : 'bg-muted/30 border-border'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-xs text-[#2874F0] bg-blue-100 dark:bg-blue-950/50 px-2 py-0.5 rounded">
                                {w.reportId || w.id}
                              </span>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                w.priority === 'High' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-800'
                              }`}>
                                {w.priority} Priority
                              </span>
                            </div>
                            <span className="text-[10px] text-muted-foreground font-mono">{w.date}</span>
                          </div>

                          <p className="font-bold text-foreground text-xs mb-1">{w.productName}</p>
                          <p className="text-[11px] text-rose-600 font-semibold mb-2">
                            Customer Issue: "{w.reason}"
                          </p>

                          <div className="bg-background/80 p-3 rounded-lg border border-border text-xs text-foreground space-y-1 mb-3">
                            <p className="font-semibold text-muted-foreground text-[10px] uppercase tracking-wider">Super Admin Directive:</p>
                            <p className="leading-relaxed">{w.message}</p>
                          </div>

                          <div className="flex items-center justify-between pt-1">
                            <span className={`text-[10px] font-bold flex items-center gap-1 ${
                              w.status === 'Acknowledged' ? 'text-emerald-600' : 'text-amber-600'
                            }`}>
                              {w.status === 'Acknowledged' ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                              Status: {w.status}
                            </span>
                            {w.status !== 'Acknowledged' && (
                              <button
                                onClick={() => handleAcknowledgeWarning(w.id)}
                                className="bg-[#2874F0] hover:bg-blue-600 text-white font-bold px-3 py-1.5 rounded-lg text-[11px] flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
                              >
                                <Check size={12} /> Acknowledge Notice
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Right Card Column: Unlisted & Removed Products by Admin */}
                <div className="bg-card rounded-2xl border border-border shadow-sm p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-border pb-3">
                    <h2 className="font-bold text-sm text-foreground flex items-center gap-2">
                      <Trash2 className="text-rose-600" size={18} /> Admin Unlisted Products ({removedItems.length})
                    </h2>
                    <span className="text-[10px] text-muted-foreground font-medium">Catalog Enforcement</span>
                  </div>

                  {removedItems.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground space-y-2">
                      <Package size={36} className="mx-auto opacity-40" />
                      <p className="font-bold text-xs">No Unlisted Products</p>
                      <p className="text-[11px]">All your active store product listings are compliant.</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                      {removedItems.map((item: any) => (
                        <div key={item.id} className="p-4 rounded-xl border border-rose-200 dark:border-rose-900/40 bg-rose-50/30 dark:bg-rose-950/10 space-y-3">
                          <div className="flex items-center gap-3">
                            {item.images && item.images[0] ? (
                              <img src={item.images[0]} alt="" className="w-12 h-12 rounded-lg object-cover border border-border shrink-0" />
                            ) : (
                              <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center text-muted-foreground shrink-0 font-bold text-xs">
                                IMG
                              </div>
                            )}
                            <div className="min-w-0 flex-1">
                              <p className="font-bold text-foreground text-xs truncate">{item.name}</p>
                              <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                                <span>Category: {item.category}</span>
                                <span>•</span>
                                <span className="font-bold text-foreground">{formatPrice(item.price)}</span>
                              </div>
                            </div>
                            <span className="bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 font-bold px-2 py-0.5 rounded text-[10px] shrink-0 border border-rose-200 dark:border-rose-900">
                              Unlisted
                            </span>
                          </div>

                          <div className="bg-background p-3 rounded-lg border border-border text-xs space-y-1">
                            <p className="font-bold text-rose-600 text-[11px] flex items-center gap-1">
                              <AlertTriangle size={12} /> Official Removal Reason:
                            </p>
                            <p className="text-foreground leading-relaxed text-[11px]">
                              {item.reason || 'Unlisted by Super Admin due to customer quality report.'}
                            </p>
                            <p className="text-[10px] text-muted-foreground pt-1 border-t border-border mt-1">
                              Unlisted Date: <span className="font-mono font-semibold">{item.removedDate || '2026-08-05'}</span>
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 8. SELLER SETTINGS SECTION */}
          {activeSection === 'settings' && (
            <div className="space-y-5">
              <div>
                <h1 className="text-xl font-bold text-foreground">Seller Account Settings</h1>
                <p className="text-xs text-muted-foreground">Manage withdrawal bank accounts, store profile info, and security credentials</p>
              </div>

              <div className="flex gap-2 bg-card p-1.5 rounded-xl border border-border overflow-x-auto">
                {[
                  { id: 'account', label: 'Withdrawal Account & Tax', icon: Building },
                  { id: 'profile', label: 'Store Profile Information', icon: User },
                  { id: 'security', label: 'Security & Password', icon: KeyRound },
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

              {activeSettingsTab === 'account' && (
                <div className="bg-card p-6 rounded-2xl border border-border shadow-sm text-xs space-y-4">
                  <h3 className="font-extrabold text-sm text-foreground flex items-center gap-2">
                    <Building className="text-[#2874F0]" size={18} /> Payout Bank Account & Tax Identifiers
                  </h3>
                  <form onSubmit={handleSaveAccountDetails} className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-muted-foreground mb-1 font-semibold">Account Holder Name</label>
                        <input
                          type="text"
                          required
                          value={accountDetails.accountHolder}
                          onChange={e => setAccountDetails({ ...accountDetails, accountHolder: e.target.value })}
                          className="w-full bg-background border border-border rounded-xl p-3 font-medium outline-none text-foreground"
                        />
                      </div>
                      <div>
                        <label className="block text-muted-foreground mb-1 font-semibold">Bank Name</label>
                        <input
                          type="text"
                          required
                          value={accountDetails.bankName}
                          onChange={e => setAccountDetails({ ...accountDetails, bankName: e.target.value })}
                          className="w-full bg-background border border-border rounded-xl p-3 font-medium outline-none text-foreground"
                        />
                      </div>
                      <div>
                        <label className="block text-muted-foreground mb-1 font-semibold">Account Number</label>
                        <input
                          type="text"
                          required
                          value={accountDetails.accountNumber}
                          onChange={e => setAccountDetails({ ...accountDetails, accountNumber: e.target.value })}
                          className="w-full bg-background border border-border rounded-xl p-3 font-mono font-bold outline-none text-foreground"
                        />
                      </div>
                      <div>
                        <label className="block text-muted-foreground mb-1 font-semibold">IFSC Code</label>
                        <input
                          type="text"
                          required
                          value={accountDetails.ifscCode}
                          onChange={e => setAccountDetails({ ...accountDetails, ifscCode: e.target.value })}
                          className="w-full bg-background border border-border rounded-xl p-3 font-mono uppercase font-bold outline-none text-foreground"
                        />
                      </div>
                      <div>
                        <label className="block text-muted-foreground mb-1 font-semibold">GSTIN Number</label>
                        <input
                          type="text"
                          required
                          value={accountDetails.gstin}
                          onChange={e => setAccountDetails({ ...accountDetails, gstin: e.target.value })}
                          className="w-full bg-background border border-border rounded-xl p-3 font-mono uppercase outline-none text-foreground"
                        />
                      </div>
                      <div>
                        <label className="block text-muted-foreground mb-1 font-semibold">Payout UPI ID</label>
                        <input
                          type="text"
                          value={accountDetails.upiId}
                          onChange={e => setAccountDetails({ ...accountDetails, upiId: e.target.value })}
                          className="w-full bg-background border border-border rounded-xl p-3 font-medium outline-none text-foreground"
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="bg-[#2874F0] hover:bg-blue-600 text-white font-bold px-6 py-3 rounded-xl transition-colors cursor-pointer shadow-md"
                    >
                      Save Account & Tax Details
                    </button>
                  </form>
                </div>
              )}

              {activeSettingsTab === 'profile' && (
                <div className="bg-card p-6 rounded-2xl border border-border shadow-sm text-xs space-y-4">
                  <h3 className="font-extrabold text-sm text-foreground flex items-center gap-2">
                    <User className="text-[#2874F0]" size={18} /> Store Profile & Owner Details
                  </h3>
                  <form onSubmit={handleSaveProfile} className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-muted-foreground mb-1 font-semibold">Store Brand Name</label>
                        <input
                          type="text"
                          required
                          value={profileForm.storeName}
                          onChange={e => setProfileForm({ ...profileForm, storeName: e.target.value })}
                          className="w-full bg-background border border-border rounded-xl p-3 font-bold outline-none text-foreground"
                        />
                      </div>
                      <div>
                        <label className="block text-muted-foreground mb-1 font-semibold">Owner / Manager Name</label>
                        <input
                          type="text"
                          required
                          value={profileForm.ownerName}
                          onChange={e => setProfileForm({ ...profileForm, ownerName: e.target.value })}
                          className="w-full bg-background border border-border rounded-xl p-3 font-medium outline-none text-foreground"
                        />
                      </div>
                      <div>
                        <label className="block text-muted-foreground mb-1 font-semibold">Store Support Email</label>
                        <input
                          type="email"
                          required
                          value={profileForm.email}
                          onChange={e => setProfileForm({ ...profileForm, email: e.target.value })}
                          className="w-full bg-background border border-border rounded-xl p-3 font-medium outline-none text-foreground"
                        />
                      </div>
                      <div>
                        <label className="block text-muted-foreground mb-1 font-semibold">Contact Phone Number</label>
                        <input
                          type="text"
                          required
                          value={profileForm.phone}
                          onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })}
                          className="w-full bg-background border border-border rounded-xl p-3 font-mono outline-none text-foreground"
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="bg-[#2874F0] hover:bg-blue-600 text-white font-bold px-6 py-3 rounded-xl transition-colors cursor-pointer shadow-md"
                    >
                      Save Store Profile
                    </button>
                  </form>
                </div>
              )}

              {activeSettingsTab === 'security' && (
                <div className="bg-card p-6 rounded-2xl border border-border shadow-sm text-xs space-y-4 max-w-md">
                  <h3 className="font-extrabold text-sm text-foreground flex items-center gap-2">
                    <Lock className="text-[#2874F0]" size={18} /> Update Password & Credentials
                  </h3>
                  <form onSubmit={handleSavePassword} className="space-y-3.5">
                    <div>
                      <label className="block text-muted-foreground mb-1 font-semibold">Current Password</label>
                      <input
                        type="password"
                        required
                        value={passwordForm.current}
                        onChange={e => setPasswordForm({ ...passwordForm, current: e.target.value })}
                        className="w-full bg-background border border-border rounded-xl p-3 outline-none text-foreground font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-muted-foreground mb-1 font-semibold">New Password</label>
                      <input
                        type="password"
                        required
                        value={passwordForm.newPw}
                        onChange={e => setPasswordForm({ ...passwordForm, newPw: e.target.value })}
                        className="w-full bg-background border border-border rounded-xl p-3 outline-none text-foreground font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-muted-foreground mb-1 font-semibold">Confirm New Password</label>
                      <input
                        type="password"
                        required
                        value={passwordForm.confirmPw}
                        onChange={e => setPasswordForm({ ...passwordForm, confirmPw: e.target.value })}
                        className="w-full bg-background border border-border rounded-xl p-3 outline-none text-foreground font-medium"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-[#2874F0] hover:bg-blue-600 text-white font-bold py-3 rounded-xl transition-colors cursor-pointer shadow-md"
                    >
                      Update Password
                    </button>
                  </form>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* FULL PRODUCT DETAILS MODAL */}
      {selectedProductModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Package className="text-[#2874F0]" size={20} />
                <h3 className="font-extrabold text-base text-foreground">Full Product Specifications & Listing Details</h3>
              </div>
              <button onClick={() => setSelectedProductModal(null)} className="text-muted-foreground hover:text-foreground cursor-pointer">
                <X size={20} />
              </button>
            </div>

            {/* Grid: Image Gallery & Specifications */}
            <div className="grid md:grid-cols-2 gap-5">
              {/* Left: Image Gallery */}
              <div className="space-y-3">
                <div className="relative h-60 rounded-2xl overflow-hidden border border-border bg-muted">
                  <img
                    src={selectedProductModal.images?.[selectedModalImageIdx] || selectedProductModal.images?.[0] || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc'}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                  {selectedProductModal.discount && (
                    <span className="absolute top-3 left-3 bg-rose-500 text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
                      {selectedProductModal.discount}% OFF
                    </span>
                  )}
                </div>

                {/* Thumbnail Strip */}
                {selectedProductModal.images?.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {selectedProductModal.images.map((img: string, idx: number) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedModalImageIdx(idx)}
                        className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition-all cursor-pointer shrink-0 ${
                          selectedModalImageIdx === idx ? 'border-[#2874F0] ring-2 ring-[#2874F0]/30' : 'border-border opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img src={img} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Right: Product Specifications & Pricing */}
              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-[10px] bg-blue-100 dark:bg-blue-900/40 text-[#2874F0] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    {selectedProductModal.category}
                  </span>
                  <h2 className="text-lg font-black text-foreground mt-1.5 leading-snug">{selectedProductModal.name}</h2>
                  <p className="text-muted-foreground text-[11px] mt-0.5">Product ID: <strong className="font-mono text-foreground">{selectedProductModal.id}</strong></p>
                </div>

                <div className="bg-muted/40 p-3.5 rounded-xl border border-border space-y-1.5">
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-black text-foreground">{formatPrice(selectedProductModal.price)}</span>
                    {selectedProductModal.discount && (
                      <span className="text-xs text-muted-foreground line-through">
                        {formatPrice(Math.round(selectedProductModal.price * 1.12))}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-[11px] pt-1 border-t border-border/50">
                    <span className="text-muted-foreground font-semibold">Inventory Status:</span>
                    <span className={`font-extrabold px-2.5 py-0.5 rounded-full text-[10px] ${
                      selectedProductModal.stock > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                    }`}>
                      ● {selectedProductModal.stock > 0 ? `${selectedProductModal.stock} units available` : 'Out of stock'}
                    </span>
                  </div>
                </div>

                <div className="space-y-0.5 text-[11px]">
                  <p className="font-bold text-foreground">Seller Brand:</p>
                  <p className="text-muted-foreground">{selectedProductModal.seller || profileForm.storeName}</p>
                </div>

                <div className="space-y-0.5 text-[11px]">
                  <p className="font-bold text-foreground">Material & Finish Specs:</p>
                  <p className="text-muted-foreground">Solid Teak Timber Wood · High Gloss Protective Polish</p>
                </div>

                <div className="space-y-0.5 text-[11px]">
                  <p className="font-bold text-foreground">Product Description:</p>
                  <p className="text-muted-foreground leading-relaxed">
                    {selectedProductModal.description || 'Premium solid wood furniture item crafted with kiln-dried teak timber and protective polish coating.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Seller Quick Action Footer */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-border text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-muted-foreground">Adjust Stock:</span>
                <div className="inline-flex items-center gap-1 bg-muted p-1 rounded-xl border border-border">
                  <button
                    onClick={() => handleUpdateStock(selectedProductModal.id, -1)}
                    className="w-7 h-7 rounded-lg bg-background hover:bg-muted font-bold text-foreground flex items-center justify-center cursor-pointer"
                  >
                    -
                  </button>
                  <span className="w-8 text-center font-black text-foreground">{selectedProductModal.stock}</span>
                  <button
                    onClick={() => handleUpdateStock(selectedProductModal.id, 1)}
                    className="w-7 h-7 rounded-lg bg-background hover:bg-muted font-bold text-foreground flex items-center justify-center cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setEditingProduct({
                      ...selectedProductModal,
                      imageUrlInput: '',
                    });
                    setEditImagePreview(selectedProductModal.images?.[0] || selectedProductModal.image_url || '');
                    setEditUploadImageFile(null);
                    setSelectedProductModal(null);
                  }}
                  className="px-4 py-2.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer border border-amber-500/20"
                >
                  <Upload size={14} /> Edit Listing & Replace Image
                </button>
                <button
                  onClick={() => {
                    navigate(`/products/${selectedProductModal.id}`);
                    setSelectedProductModal(null);
                  }}
                  className="px-4 py-2.5 bg-muted hover:bg-muted/80 text-foreground font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <ExternalLink size={14} className="text-[#2874F0]" /> Preview Page
                </button>
                <button
                  onClick={() => setSelectedProductModal(null)}
                  className="px-5 py-2.5 bg-[#2874F0] hover:bg-blue-600 text-white font-bold rounded-xl text-xs shadow-md transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EDIT PRODUCT MODAL (WITH CLOUDINARY IMAGE REPLACEMENT) */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto text-xs">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-extrabold text-base text-foreground flex items-center gap-2">
                <Upload className="text-[#2874F0]" size={18} /> Edit Product Listing & Replace Image
              </h3>
              <button onClick={() => setEditingProduct(null)} className="text-muted-foreground hover:text-foreground">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleEditProductSubmit} className="space-y-3.5">
              <div>
                <label className="block font-semibold text-foreground mb-1">Product Title</label>
                <input
                  type="text"
                  required
                  value={editingProduct.name}
                  onChange={e => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  className="w-full bg-background border border-border rounded-xl p-2.5 text-foreground font-medium outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-foreground mb-1">Category</label>
                  <select
                    value={editingProduct.category}
                    onChange={e => setEditingProduct({ ...editingProduct, category: e.target.value })}
                    className="w-full bg-background border border-border rounded-xl p-2.5 text-foreground font-medium outline-none"
                  >
                    <option value="Living Room">Living Room</option>
                    <option value="Bedroom">Bedroom</option>
                    <option value="Dining">Dining</option>
                    <option value="Study">Study</option>
                    <option value="Storage">Storage</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-foreground mb-1">Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={editingProduct.price}
                    onChange={e => setEditingProduct({ ...editingProduct, price: e.target.value })}
                    className="w-full bg-background border border-border rounded-xl p-2.5 font-bold text-foreground outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-foreground mb-1">Inventory Stock Units</label>
                <input
                  type="number"
                  required
                  value={editingProduct.stock}
                  onChange={e => setEditingProduct({ ...editingProduct, stock: e.target.value })}
                  className="w-full bg-background border border-border rounded-xl p-2.5 font-medium text-foreground outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-foreground mb-1">Replace Image File (Cloudinary Upload)</label>
                <label className="border-2 border-dashed border-border hover:border-[#2874F0] rounded-xl p-3 flex flex-col items-center justify-center cursor-pointer transition-colors bg-muted/20 hover:bg-muted/40 text-center group">
                  <Upload size={20} className="text-muted-foreground group-hover:text-[#2874F0] mb-1 transition-colors" />
                  <span className="font-bold text-xs text-foreground">Click to select new image file for Cloudinary replacement</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e => {
                      const file = e.target.files?.[0];
                      if (file) {
                        if (file.size > 5 * 1024 * 1024) {
                          toast.error('File size exceeds 5MB.');
                          return;
                        }
                        setEditUploadImageFile(file);
                        setEditImagePreview(URL.createObjectURL(file));
                        toast.success(`Selected "${file.name}" for Cloudinary upload!`);
                      }
                    }}
                    className="hidden"
                  />
                </label>

                {editImagePreview && (
                  <div className="mt-2 flex items-center gap-3 bg-muted/30 p-2 rounded-xl border border-border">
                    <img src={editImagePreview} alt="" className="w-14 h-14 rounded-lg object-cover border border-border" />
                    <div>
                      <p className="font-bold text-foreground text-[11px]">
                        {editUploadImageFile ? `New Selected Image: ${editUploadImageFile.name}` : 'Current Active Product Image'}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {editUploadImageFile ? 'Will be uploaded to Cloudinary folder shopmart/products upon saving.' : 'Keep existing image or select a new file to replace.'}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block font-semibold text-foreground mb-1">Description</label>
                <textarea
                  rows={3}
                  value={editingProduct.description || ''}
                  onChange={e => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  className="w-full bg-background border border-border rounded-xl p-2.5 text-foreground font-medium outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="flex-1 bg-muted text-foreground font-semibold py-2.5 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#2874F0] hover:bg-blue-600 text-white font-bold py-2.5 rounded-xl transition-colors shadow-md cursor-pointer"
                >
                  Save & Update Cloudinary Image
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DEFECT PHOTO PREVIEW LIGHTBOX MODAL */}
      {previewDefectImage && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="relative max-w-lg w-full bg-card rounded-2xl p-4 border border-border shadow-2xl">
            <button
              onClick={() => setPreviewDefectImage(null)}
              className="absolute top-3 right-3 bg-black/60 text-white rounded-full p-1.5 hover:bg-black cursor-pointer"
            >
              <X size={18} />
            </button>
            <p className="font-bold text-xs text-foreground mb-3">Customer Defect Photo Full Inspection View</p>
            <img src={previewDefectImage} alt="" className="w-full h-80 object-cover rounded-xl border border-border" />
          </div>
        </div>
      )}

      {/* ADD PRODUCT MODAL */}
      {showAddProductModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                <Plus className="text-[#2874F0]" size={18} /> Add New Product Listing
              </h3>
              <button onClick={() => setShowAddProductModal(false)} className="text-muted-foreground hover:text-foreground">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddProductSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-foreground mb-1">Product Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Handcrafted Solid Teak Coffee Table"
                  value={newProduct.name}
                  onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
                  className="w-full bg-background border border-border rounded-xl p-2.5 text-foreground font-medium outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-foreground mb-1">Category</label>
                  <select
                    value={newProduct.category}
                    onChange={e => setNewProduct({ ...newProduct, category: e.target.value })}
                    className="w-full bg-background border border-border rounded-xl p-2.5 text-foreground font-medium outline-none"
                  >
                    <option value="Living Room">Living Room</option>
                    <option value="Bedroom">Bedroom</option>
                    <option value="Dining">Dining</option>
                    <option value="Study">Study</option>
                    <option value="Storage">Storage</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-foreground mb-1">Price (₹)</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 24999"
                    value={newProduct.price}
                    onChange={e => setNewProduct({ ...newProduct, price: e.target.value })}
                    className="w-full bg-background border border-border rounded-xl p-2.5 font-bold text-foreground outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-foreground mb-1 flex items-center justify-between">
                  <span>Upload Photos from Local Device</span>
                  <span className="text-[10px] text-muted-foreground">Select multiple</span>
                </label>

                <label className="border-2 border-dashed border-border hover:border-[#2874F0] rounded-xl p-3 flex flex-col items-center justify-center cursor-pointer transition-colors bg-muted/20 hover:bg-muted/40 text-center group">
                  <Upload size={20} className="text-muted-foreground group-hover:text-[#2874F0] mb-1 transition-colors" />
                  <span className="font-bold text-xs text-foreground">Click to select files from device</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleDeviceImageUpload}
                    className="hidden"
                  />
                </label>

                {deviceImageFiles.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {deviceImageFiles.map((img, idx) => (
                      <div key={idx} className="relative w-12 h-12 rounded-lg overflow-hidden border border-border group shrink-0">
                        <img src={img} alt="" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemoveDeviceImage(idx)}
                          className="absolute top-0.5 right-0.5 bg-rose-600 text-white rounded-full p-0.5 opacity-90 cursor-pointer"
                        >
                          <X size={10} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block font-semibold text-foreground mb-1">Or Enter Image URL</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={newProduct.imageUrlInput}
                  onChange={e => setNewProduct({ ...newProduct, imageUrlInput: e.target.value })}
                  className="w-full bg-background border border-border rounded-xl p-2.5 text-foreground font-mono text-[11px] outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddProductModal(false)}
                  className="flex-1 bg-muted text-foreground font-semibold py-2.5 rounded-xl cursor-pointer"
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
  );
}
