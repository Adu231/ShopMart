import { Bell, Package, Tag, Info, CheckCheck, Trash2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import CustomerLayout from '@/components/layout/CustomerLayout';

const INITIAL_NOTIFS = [
  {
    id: 'n1',
    type: 'order',
    title: 'Order Shipped',
    message: 'Your order has been shipped and will arrive in 2-3 business days. Track your order for live updates.',
    time: '2 hours ago',
    read: false,
  },
  {
    id: 'n2',
    type: 'offer',
    title: '⚡ Flash Sale Alert!',
    message: "Up to 50% off on Electronics today only! Don't miss these amazing deals. Limited time offer.",
    time: '5 hours ago',
    read: false,
  },
  {
    id: 'n3',
    type: 'order',
    title: 'Order Delivered',
    message: 'Your order has been delivered successfully. We hope you enjoy your purchase! Please rate your experience.',
    time: '1 day ago',
    read: true,
  },
  {
    id: 'n4',
    type: 'system',
    title: 'Account Updated',
    message: "Your profile information has been updated successfully. If this wasn't you, please contact support immediately.",
    time: '2 days ago',
    read: true,
  },
  {
    id: 'n5',
    type: 'offer',
    title: 'Exclusive Member Offer',
    message: 'As a valued ShopMart member, enjoy an extra 10% off your next purchase with code MEMBER10.',
    time: '3 days ago',
    read: true,
  },
  {
    id: 'n6',
    type: 'order',
    title: 'Payment Confirmed',
    message: 'Payment received for your recent order. Your items are being packed and will be shipped soon.',
    time: '4 days ago',
    read: true,
  },
  {
    id: 'n7',
    type: 'system',
    title: 'Welcome to ShopMart! 🎉',
    message: 'Enjoy free delivery on your first order. Explore thousands of products across all categories. Happy Shopping!',
    time: '1 week ago',
    read: true,
  },
];

const TYPE_CONFIG = {
  order: { icon: Package, styles: 'text-[#2874F0] bg-blue-50 dark:bg-blue-950/30', label: 'Orders' },
  offer: { icon: Tag, styles: 'text-orange-500 bg-orange-50 dark:bg-orange-950/30', label: 'Offers' },
  system: { icon: Info, styles: 'text-gray-500 bg-gray-100 dark:bg-gray-800', label: 'System' },
};

export default function Notifications() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [notifs, setNotifs] = useState(INITIAL_NOTIFS);
  const [activeType, setActiveType] = useState<string>('all');

  useEffect(() => {
    if (!isAuthenticated) navigate('/login?redirect=/notifications');
  }, [isAuthenticated]);

  if (!isAuthenticated) return null;

  const unreadCount = notifs.filter(n => !n.read).length;
  const markAllRead = () => setNotifs(prev => prev.map(n => ({ ...n, read: true })));
  const markRead = (id: string) => setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  const deleteNotif = (id: string) => setNotifs(prev => prev.filter(n => n.id !== id));

  const filtered = activeType === 'all' ? notifs : notifs.filter(n => n.type === activeType);

  return (
    <CustomerLayout title="Notifications" showBackToDashboard>
      {/* Tabs & actions */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div className="flex gap-2 overflow-x-auto">
          {(['all', 'order', 'offer', 'system'] as const).map(type => (
            <button
              key={type}
              onClick={() => setActiveType(type)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors flex-shrink-0 ${
                activeType === type
                  ? 'bg-[#2874F0] text-white'
                  : 'bg-card text-muted-foreground border border-border hover:bg-muted'
              }`}
            >
              {type === 'all' ? `All (${notifs.length})` : TYPE_CONFIG[type].label}
            </button>
          ))}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="text-xs text-[#2874F0] hover:underline flex items-center gap-1 font-medium flex-shrink-0"
          >
            <CheckCheck size={13} /> Mark all read ({unreadCount})
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-card rounded-xl p-12 flex flex-col items-center border border-border">
          <Bell size={52} className="text-muted-foreground mb-3" strokeWidth={1} />
          <p className="font-semibold text-foreground">No notifications</p>
          <p className="text-sm text-muted-foreground mt-1">You are all caught up!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(n => {
            const config = TYPE_CONFIG[n.type as keyof typeof TYPE_CONFIG] || TYPE_CONFIG.system;
            const Icon = config.icon;
            return (
              <div
                key={n.id}
                className={`bg-card rounded-xl p-4 flex gap-3 group border transition-all hover:shadow-sm ${
                  n.read ? 'border-border' : 'border-[#2874F0]/30 bg-[#2874F0]/[0.02] dark:bg-[#2874F0]/5'
                }`}
              >
                <div className={`${config.styles} p-2.5 rounded-lg flex-shrink-0 h-fit mt-0.5`}>
                  <Icon size={15} />
                </div>
                <div
                  className="flex-1 min-w-0 cursor-pointer"
                  onClick={() => markRead(n.id)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold text-foreground">{n.title}</p>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <span className="text-xs text-muted-foreground whitespace-nowrap">{n.time}</span>
                      {!n.read && <span className="w-2 h-2 rounded-full bg-[#2874F0] flex-shrink-0" />}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{n.message}</p>
                </div>
                <button
                  onClick={() => deleteNotif(n.id)}
                  className="flex-shrink-0 p-1.5 text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all opacity-0 group-hover:opacity-100 h-fit"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </CustomerLayout>
  );
}
