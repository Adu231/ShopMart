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

  const [addresses, setAddresses] = useState<Address[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('shopmart_addresses') || 'null') || [{
        id: 'a1', name: 'Priya Customer', phone: '9876543210', street: '123, MG Road, Indiranagar',
        city: 'Bengaluru', state: 'Karnataka', pincode: '560038', isDefault: true,
      }];
    } catch { return []; }
  });

  const persistAddresses = (list: Address[]) => {
    setAddresses(list);
    localStorage.setItem('shopmart_addresses', JSON.stringify(list));
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    // Try backend REST API login first
    const apiRes = await api.auth.login({ email, password });
    if (apiRes && apiRes.success && apiRes.user) {
      setUser(apiRes.user);
      localStorage.setItem('shopmart_user', JSON.stringify(apiRes.user));
      if (apiRes.token) {
        localStorage.setItem('shopmart_token', apiRes.token);
      }
      return true;
    }

    const demo = DEMO_USERS.find(u => u.email === email && u.password === password);
    if (demo) {
      const { password: _, ...u } = demo;
      setUser(u);
      localStorage.setItem('shopmart_user', JSON.stringify(u));
      localStorage.setItem('shopmart_token', `demo_token_${u.id}`);
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
    localStorage.setItem('shopmart_token', `signup_token_${newUser.id}`);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('shopmart_user');
    localStorage.removeItem('shopmart_token');
  };

  const addAddress = (addr: Omit<Address, 'id'>) => {
    const newAddr: Address = { ...addr, id: `a_${Date.now()}` };
    // If this is default, clear other defaults
    const updated = addr.isDefault
      ? [...addresses.map(a => ({ ...a, isDefault: false })), newAddr]
      : [...addresses, newAddr];
    persistAddresses(updated);
  };

  const removeAddress = (id: string) => {
    persistAddresses(addresses.filter(a => a.id !== id));
  };

  const setDefaultAddress = (id: string) => {
    persistAddresses(addresses.map(a => ({ ...a, isDefault: a.id === id })));
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
