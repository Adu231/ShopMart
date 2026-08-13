import { createContext, useContext, useState, ReactNode } from 'react';
import type { User, Address } from '@/types';
import { api } from '@/services/api';

interface AuthContextType {
  user: User | null;
  addresses: Address[];
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string, role?: 'customer' | 'seller' | 'admin') => Promise<void>;
  logout: () => void;
  addAddress: (address: Omit<Address, 'id'>) => void;
  removeAddress: (id: string) => void;
  setDefaultAddress: (id: string) => void;
  updateUser: (updates: Partial<User>) => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_USERS: (User & { password: string })[] = [
  { id: 'u1', name: 'Priya Customer', email: 'customer@demo.com', role: 'customer', phone: '9876543210', password: 'password123', status: 'Active', isApproved: true },
  { id: 'u2', name: 'Rahul Seller', email: 'seller@demo.com', role: 'seller', phone: '9876543211', password: 'password123', status: 'Active', isApproved: true },
  { id: 'u3', name: 'Admin User', email: 'admin@demo.com', role: 'admin', phone: '9876543212', password: 'password123', status: 'Active', isApproved: true },
];

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    try { return JSON.parse(localStorage.getItem('shopmart_user') || 'null'); } catch { return null; }
  });

  // Helper to build a user-scoped addresses key so different users never share addresses
  const getAddressKey = (userId?: string) => `shopmart_addresses_${userId || 'guest'}`;

  const [addresses, setAddresses] = useState<Address[]>(() => {
    try {
      const storedUser = JSON.parse(localStorage.getItem('shopmart_user') || 'null');
      const key = `shopmart_addresses_${storedUser?.id || 'guest'}`;
      const stored = JSON.parse(localStorage.getItem(key) || '[]');
      return Array.isArray(stored) ? stored.filter((a: Address) => a.id !== 'a1') : [];
    } catch { return []; }
  });

  const persistAddresses = (list: Address[], userId?: string) => {
    setAddresses(list);
    const key = getAddressKey(userId);
    localStorage.setItem(key, JSON.stringify(list));
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    // Try backend REST API login first — returns a real signed JWT
    const apiRes = await api.auth.login({ email, password });
    if (apiRes && apiRes.success && apiRes.user) {
      const loggedInUser = apiRes.user;
      setUser(loggedInUser);
      localStorage.setItem('shopmart_user', JSON.stringify(loggedInUser));
      if (apiRes.token) {
        localStorage.setItem('shopmart_token', apiRes.token);
      }
      // Load this user's addresses
      const addrKey = getAddressKey(loggedInUser.id);
      try {
        const stored = JSON.parse(localStorage.getItem(addrKey) || '[]');
        setAddresses(Array.isArray(stored) ? stored : []);
      } catch { setAddresses([]); }
      window.dispatchEvent(new Event('storage'));
      return true;
    }

    // Offline demo fallback — these tokens won't validate on the backend
    const demo = DEMO_USERS.find(u => u.email === email && u.password === password);
    if (demo) {
      const { password: _, ...u } = demo;
      setUser(u);
      localStorage.setItem('shopmart_user', JSON.stringify(u));
      localStorage.setItem('shopmart_token', `demo_token_${u.id}`);
      const addrKey = getAddressKey(u.id);
      try {
        const stored = JSON.parse(localStorage.getItem(addrKey) || '[]');
        setAddresses(Array.isArray(stored) ? stored : []);
      } catch { setAddresses([]); }
      window.dispatchEvent(new Event('storage'));
      return true;
    }
    const registered: (User & { password: string })[] = JSON.parse(localStorage.getItem('shopmart_reg_users') || '[]');
    const found = registered.find(u => u.email === email && u.password === password);
    if (found) {
      const { password: _, ...u } = found;
      try {
        const sellerApprovals = JSON.parse(localStorage.getItem('shopmart_seller_approvals') || '[]');
        const approval = sellerApprovals.find((s: any) => s.email === email || s.userAccountId === u.id);
        if (approval && approval.status === 'Active') {
          u.status = 'Active';
          u.isApproved = true;
        }
      } catch (e) {}
      setUser(u);
      localStorage.setItem('shopmart_user', JSON.stringify(u));
      localStorage.setItem('shopmart_token', `reg_token_${u.id}`);
      const addrKey = getAddressKey(u.id);
      try {
        const stored = JSON.parse(localStorage.getItem(addrKey) || '[]');
        setAddresses(Array.isArray(stored) ? stored : []);
      } catch { setAddresses([]); }
      window.dispatchEvent(new Event('storage'));
      return true;
    }
    return false;
  };

  const signup = async (name: string, email: string, password: string, role: 'customer' | 'seller' | 'admin' = 'customer'): Promise<void> => {
    const isSeller = role === 'seller';
    const businessInfo = isSeller ? JSON.parse(localStorage.getItem('shopmart_seller_business_profile') || '{}') : {};

    // Call REST API backend signup endpoint
    const signupRes = await api.auth.signup({
      name,
      email,
      password,
      role,
      ...businessInfo,
    });

    const newUser: User = (signupRes && signupRes.user) ? signupRes.user : {
      id: `u_${Date.now()}`,
      name,
      email,
      role,
      status: isSeller ? 'Pending' : 'Active',
      isApproved: !isSeller,
    };
    const existing: (User & { password: string })[] = JSON.parse(localStorage.getItem('shopmart_reg_users') || '[]');
    localStorage.setItem('shopmart_reg_users', JSON.stringify([...existing, { ...newUser, password }]));

    if (isSeller) {
      try {
        const businessInfo = JSON.parse(localStorage.getItem('shopmart_seller_business_profile') || '{}');
        const pendingSeller = {
          id: `SEL-${Date.now()}`,
          name: businessInfo.storeName || name,
          email,
          date: new Date().toISOString().split('T')[0],
          products: 0,
          status: 'Pending',
          userAccountId: newUser.id,
          gstin: businessInfo.gstin || '',
          panNumber: businessInfo.panNumber || '',
          accountNumber: businessInfo.accountNumber || '',
          ifscCode: businessInfo.ifscCode || '',
          pickupPincode: businessInfo.pickupPincode || '',
        };
        const existingApprovals = JSON.parse(localStorage.getItem('shopmart_seller_approvals') || '[]');
        localStorage.setItem('shopmart_seller_approvals', JSON.stringify([pendingSeller, ...existingApprovals]));
        window.dispatchEvent(new Event('storage'));
      } catch (e) {
        console.error(e);
      }
    }

    setUser(newUser);
    localStorage.setItem('shopmart_user', JSON.stringify(newUser));
    // Store the real JWT if backend returned one, otherwise fall back
    if (signupRes && signupRes.token) {
      localStorage.setItem('shopmart_token', signupRes.token);
    } else {
      localStorage.setItem('shopmart_token', `reg_token_${newUser.id}`);
    }
    window.dispatchEvent(new Event('storage'));
  };

  const logout = () => {
    // Read userId before clearing user so we can clean up their scoped address key
    const storedUser = JSON.parse(localStorage.getItem('shopmart_user') || 'null');
    if (storedUser?.id) {
      localStorage.removeItem(`shopmart_addresses_${storedUser.id}`);
    }
    setUser(null);
    setAddresses([]);
    localStorage.removeItem('shopmart_user');
    localStorage.removeItem('shopmart_token');
    localStorage.removeItem('shopmart_cart');
    localStorage.removeItem('shopmart_orders');
    localStorage.removeItem('shopmart_addresses');
    localStorage.removeItem('shopmart_admin_warnings');
    localStorage.removeItem('shopmart_removed_products');
    localStorage.removeItem('shopmart_seller_business_profile');
    localStorage.removeItem('shopmart_seller_approvals');
    window.dispatchEvent(new Event('storage'));
  };

  const addAddress = (addr: Omit<Address, 'id'>) => {
    const newAddr: Address = { ...addr, id: `a_${Date.now()}` };
    // If this is default, clear other defaults
    const updated = addr.isDefault
      ? [...addresses.map(a => ({ ...a, isDefault: false })), newAddr]
      : [...addresses, newAddr];
    const storedUser = JSON.parse(localStorage.getItem('shopmart_user') || 'null');
    persistAddresses(updated, storedUser?.id);
  };

  const removeAddress = (id: string) => {
    const storedUser = JSON.parse(localStorage.getItem('shopmart_user') || 'null');
    persistAddresses(addresses.filter(a => a.id !== id), storedUser?.id);
  };

  const setDefaultAddress = (id: string) => {
    const storedUser = JSON.parse(localStorage.getItem('shopmart_user') || 'null');
    persistAddresses(addresses.map(a => ({ ...a, isDefault: a.id === id })), storedUser?.id);
  };

  const updateUser = (updates: Partial<User>) => {
    if (!user) return;
    const updated = { ...user, ...updates };
    setUser(updated);
    localStorage.setItem('shopmart_user', JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider value={{
      user, addresses, login, signup, logout,
      addAddress, removeAddress, setDefaultAddress, updateUser,
      isAuthenticated: !!user,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
};
