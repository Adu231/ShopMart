import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { CartItem, Product, Order } from '@/types';
import { api } from '@/services/api';

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  orders: Order[];
  placeOrder: (order: Omit<Order, 'id' | 'createdAt'>) => string;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try { return JSON.parse(localStorage.getItem('shopmart_cart') || '[]'); } catch { return []; }
  });
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const stored = localStorage.getItem('shopmart_orders');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          return parsed.filter((o: any) => o.id && !o.id.startsWith('ORD-WOOD-') && !o.id.startsWith('ORD00'));
        }
      }
      return [];
    } catch {
      return [];
    }
  });

  // Fetch live user-scoped orders from backend
  useEffect(() => {
    const fetchUserOrders = () => {
      const token = localStorage.getItem('shopmart_token');
      if (!token) {
        setOrders([]);
        return;
      }

      api.orders.getAll().then(res => {
        if (res && res.success && Array.isArray(res.orders)) {
          const formattedOrders: Order[] = res.orders.map((o: any) => ({
            id: o.id,
            createdAt: o.createdAt || new Date().toISOString(),
            status: o.status || 'placed',
            totalAmount: Number(o.amount) || Number(o.totalAmount) || 0,
            items: o.items || [],
            shippingAddress: typeof o.address === 'object' ? o.address : {
              fullName: o.customerName || 'Customer',
              phone: o.phone || '',
              street: typeof o.address === 'string' ? o.address : '',
              city: o.city || '',
              state: o.state || '',
              pincode: o.pincode || '',
            },
            paymentMethod: o.paymentMethod || 'Online Payment',
          }));
          setOrders(formattedOrders);
        } else {
          setOrders([]);
        }
      });
    };

    fetchUserOrders();
    window.addEventListener('storage', fetchUserOrders);
    return () => window.removeEventListener('storage', fetchUserOrders);
  }, []);

  useEffect(() => { localStorage.setItem('shopmart_cart', JSON.stringify(items)); }, [items]);

  const addToCart = (product: Product, quantity = 1) => {
    setItems(prev => {
      const existing = prev.find(i => i.product.id === product.id);
      if (existing) return prev.map(i => i.product.id === product.id ? { ...i, quantity: i.quantity + quantity } : i);
      return [...prev, { product, quantity }];
    });
  };

  const removeFromCart = (productId: string) => setItems(prev => prev.filter(i => i.product.id !== productId));

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) { removeFromCart(productId); return; }
    setItems(prev => prev.map(i => i.product.id === productId ? { ...i, quantity } : i));
  };

  const clearCart = () => setItems([]);

  const placeOrder = (orderData: Omit<Order, 'id' | 'createdAt'>): string => {
    const orderId = `ORD-WOOD-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrder: Order = { ...orderData, id: orderId, createdAt: new Date().toISOString() };

    // Read authenticated customer identity from localStorage
    let customerName = 'Customer';
    let customerEmail = '';
    try {
      const storedUser = JSON.parse(localStorage.getItem('shopmart_user') || 'null');
      if (storedUser) {
        customerName = storedUser.name || 'Customer';
        customerEmail = storedUser.email || '';
      }
    } catch (e) {}

    // Call backend orders endpoint — identity is enforced server-side from the JWT
    api.orders.create({
      customerName,
      customerEmail,
      productName: orderData.items[0]?.product.name || 'Woodcraft Furniture Item',
      productId: orderData.items[0]?.product.id || 'p1',
      totalAmount: orderData.totalAmount,
      address: orderData.address
        ? `${orderData.address.street}, ${orderData.address.city}, ${orderData.address.state} - ${orderData.address.pincode}`
        : '',
      paymentMethod: orderData.paymentMethod,
    }).then(res => {
      if (res && res.success && res.order && res.order.id) {
        // Update the order ID in state to match the backend-assigned ID
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, id: res.order.id } : o));
      }
    });

    setOrders(prev => [newOrder, ...prev]);
    clearCart();
    return orderId;
  };

  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    api.orders.updateStatus(orderId, status);
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
  };

  const totalItems = items.reduce((s, i) => s + i.quantity, 0);
  const subtotal = items.reduce((s, i) => s + i.product.price * i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, totalItems, subtotal, orders, placeOrder, updateOrderStatus }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be inside CartProvider');
  return ctx;
};
