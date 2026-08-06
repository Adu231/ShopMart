import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { CartItem, Product, Order } from '@/types';
import { PRODUCTS } from '@/constants/data';

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

const DEFAULT_MOCK_ORDERS: Order[] = [
  {
    id: 'ORD-WOOD-9821',
    createdAt: '2026-08-04T10:30:00Z',
    status: 'delivered',
    totalAmount: 44999,
    items: [
      {
        product: PRODUCTS[0],
        quantity: 1,
      }
    ],
    shippingAddress: {
      fullName: 'Priya Customer',
      phone: '9876543210',
      street: '102, WoodNest Heights, Indiranagar',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560038',
    },
    paymentMethod: 'UPI (Google Pay)',
  },
  {
    id: 'ORD-WOOD-9819',
    createdAt: '2026-08-02T14:15:00Z',
    status: 'out_for_delivery',
    totalAmount: 34999,
    items: [
      {
        product: PRODUCTS[1],
        quantity: 1,
      }
    ],
    shippingAddress: {
      fullName: 'Priya Customer',
      phone: '9876543210',
      street: '102, WoodNest Heights, Indiranagar',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560038',
    },
    paymentMethod: 'Credit Card (HDFC)',
  },
  {
    id: 'ORD-WOOD-9810',
    createdAt: '2026-07-28T09:45:00Z',
    status: 'shipped',
    totalAmount: 15400,
    items: [
      {
        product: PRODUCTS[2],
        quantity: 1,
      }
    ],
    shippingAddress: {
      fullName: 'Priya Customer',
      phone: '9876543210',
      street: '102, WoodNest Heights, Indiranagar',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560038',
    },
    paymentMethod: 'Net Banking',
  }
];

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try { return JSON.parse(localStorage.getItem('shopmart_cart') || '[]'); } catch { return []; }
  });
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const stored = localStorage.getItem('shopmart_orders');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      return DEFAULT_MOCK_ORDERS;
    } catch {
      return DEFAULT_MOCK_ORDERS;
    }
  });

  useEffect(() => { localStorage.setItem('shopmart_cart', JSON.stringify(items)); }, [items]);
  useEffect(() => { localStorage.setItem('shopmart_orders', JSON.stringify(orders)); }, [orders]);

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
    setOrders(prev => [newOrder, ...prev]);
    clearCart();
    return orderId;
  };

  const updateOrderStatus = (orderId: string, status: Order['status']) => {
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
