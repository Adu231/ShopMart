import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { CartItem, Product, Order } from '@/types';
import { PRODUCTS } from '@/constants/data';
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
        if (Array.isArray(parsed)) return parsed;
      }
      return [];
    } catch {
      return [];
    }
  });

  // Fetch live orders from Render backend
  useEffect(() => {
    api.orders.getAll().then(res => {
      if (res && res.success && Array.isArray(res.orders) && res.orders.length > 0) {
        const formattedOrders: Order[] = res.orders.map((o: any) => ({
          id: o.id,
          createdAt: o.createdAt || new Date().toISOString(),
          status: o.status || 'placed',
          totalAmount: Number(o.amount) || Number(o.totalAmount) || 19999,
          items: o.items || [
            {
              product: {
                id: o.productId || 'p1',
                name: o.productName || 'Handcrafted Furniture Item',
                category: 'Living Room',
                price: Number(o.amount) || 19999,
                originalPrice: Number(o.amount) ? Number(o.amount) + 5000 : 24999,
                discount: 20,
                rating: 4.8,
                reviewCount: 12,
                images: ['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80'],
                description: 'Premium Solid Teak Wood Furniture',
                inStock: true,
                stockCount: 10,
                seller: 'Woodcraft Seller',
                isNew: true,
              },
              quantity: 1,
            }
          ],
          shippingAddress: typeof o.address === 'object' ? o.address : {
            fullName: o.customerName || 'Priya Customer',
            phone: '9876543210',
            street: o.address || '102, WoodNest Heights, Indiranagar',
            city: 'Bengaluru',
            state: 'Karnataka',
            pincode: '560038',
          },
          paymentMethod: o.paymentMethod || 'UPI (Google Pay)',
        }));
        setOrders(prev => {
          const merged = [...formattedOrders];
          prev.forEach(p => {
            if (!merged.some(m => m.id === p.id)) merged.push(p);
          });
          return merged;
        });
      }
    });
  }, []);

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
    
    // Call backend orders endpoint
    api.orders.create({
      customerName: orderData.shippingAddress.fullName,
      customerEmail: 'customer@demo.com',
      productName: orderData.items[0]?.product.name || 'Woodcraft Furniture Item',
      productId: orderData.items[0]?.product.id || 'p1',
      totalAmount: orderData.totalAmount,
      address: `${orderData.shippingAddress.street}, ${orderData.shippingAddress.city}, ${orderData.shippingAddress.state} - ${orderData.shippingAddress.pincode}`,
      paymentMethod: orderData.paymentMethod,
    }).then(res => {
      if (res && res.success && res.order && res.order.id) {
        newOrder.id = res.order.id;
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
