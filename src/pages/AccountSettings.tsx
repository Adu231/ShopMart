import { useState, useEffect } from 'react';
import { User, Moon, Sun, LogOut, Shield, Lock, Bell } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import CustomerLayout from '@/components/layout/CustomerLayout';
import { useTheme } from '@/context/ThemeContext';
import { toast } from 'sonner';

export default function AccountSettings() {
  const { user, isAuthenticated, logout, updateUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) navigate('/login?redirect=/settings');
  }, [isAuthenticated]);

  if (!isAuthenticated) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      updateUser({ name, phone });
      setSaving(false);
      toast.success('Profile updated successfully!');
    }, 700);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    toast.success('Logged out successfully');
  };

  const sections = [
    {
      icon: User,
      title: 'Personal Information',
      content: (
        <form onSubmit={handleSave} className="p-5">
          <div className="grid sm:grid-cols-2 gap-4 mb-5">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Full Name</label>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                required
                placeholder="Your full name"
                className="w-full border border-border rounded-lg px-3 py-2.5 text-sm bg-background text-foreground outline-none focus:ring-2 focus:ring-[#2874F0]/30 focus:border-[#2874F0] transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Phone Number</label>
              <input
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="10-digit mobile number"
                className="w-full border border-border rounded-lg px-3 py-2.5 text-sm bg-background text-foreground outline-none focus:ring-2 focus:ring-[#2874F0]/30 focus:border-[#2874F0] transition-all"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                Email Address{' '}
                <span className="font-normal text-muted-foreground/60">(cannot be changed)</span>
              </label>
              <input
                value={user?.email || ''}
                disabled
                readOnly
                className="w-full border border-border rounded-lg px-3 py-2.5 text-sm bg-muted text-muted-foreground cursor-not-allowed"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-[#2874F0] hover:bg-[#1D5FD1] disabled:opacity-60 text-white px-6 py-2.5 rounded-lg font-semibold text-sm transition-colors"
          >
            {saving && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      ),
    },
  ];

  return (
    <CustomerLayout title="Account Settings" showBackToDashboard>
      <div className="space-y-4">
        {/* Personal Info */}
        <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
          <div className="flex items-center gap-2.5 px-5 py-4 border-b border-border bg-muted/30">
            <User size={16} className="text-[#2874F0]" />
            <h3 className="font-semibold text-foreground text-sm">Personal Information</h3>
          </div>
          <form onSubmit={handleSave} className="p-5">
            <div className="grid sm:grid-cols-2 gap-4 mb-5">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Full Name</label>
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  placeholder="Your full name"
                  className="w-full border border-border rounded-lg px-3 py-2.5 text-sm bg-background text-foreground outline-none focus:ring-2 focus:ring-[#2874F0]/30 focus:border-[#2874F0] transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Phone Number</label>
                <input
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="10-digit mobile"
                  className="w-full border border-border rounded-lg px-3 py-2.5 text-sm bg-background text-foreground outline-none focus:ring-2 focus:ring-[#2874F0]/30 focus:border-[#2874F0] transition-all"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                  Email Address{' '}
                  <span className="font-normal text-muted-foreground/60">(cannot be changed)</span>
                </label>
                <input
                  value={user?.email || ''}
                  disabled
                  readOnly
                  className="w-full border border-border rounded-lg px-3 py-2.5 text-sm bg-muted text-muted-foreground cursor-not-allowed"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 bg-[#2874F0] hover:bg-[#1D5FD1] disabled:opacity-60 text-white px-6 py-2.5 rounded-lg font-semibold text-sm transition-colors"
            >
              {saving && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>

        {/* Appearance */}
        <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
          <div className="flex items-center gap-2.5 px-5 py-4 border-b border-border bg-muted/30">
            {theme === 'dark' ? <Moon size={16} className="text-[#2874F0]" /> : <Sun size={16} className="text-[#2874F0]" />}
            <h3 className="font-semibold text-foreground text-sm">Appearance</h3>
          </div>
          <div className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Dark Mode</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Currently: {theme === 'dark' ? 'Dark theme active' : 'Light theme active'}
                </p>
              </div>
              <button
                onClick={toggleTheme}
                className={`relative w-12 h-6 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-[#2874F0]/30 ${
                  theme === 'dark' ? 'bg-[#2874F0]' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <span
                  className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-md transition-transform duration-300 ${
                    theme === 'dark' ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Notifications preferences */}
        <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
          <div className="flex items-center gap-2.5 px-5 py-4 border-b border-border bg-muted/30">
            <Bell size={16} className="text-[#2874F0]" />
            <h3 className="font-semibold text-foreground text-sm">Notification Preferences</h3>
          </div>
          <div className="p-5 space-y-4">
            {[
              { label: 'Order Updates', desc: 'Shipment, delivery, and order status notifications' },
              { label: 'Offers & Deals', desc: 'Flash sales, coupons, and exclusive member offers' },
              { label: 'Product Alerts', desc: 'Back in stock and price drop notifications' },
            ].map(({ label, desc }) => (
              <div key={label} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">{label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
                </div>
                <button
                  onClick={() => toast.info('Notification settings saved!')}
                  className="relative w-10 h-5 bg-[#2874F0] rounded-full transition-colors focus:outline-none"
                >
                  <span className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Security */}
        <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
          <div className="flex items-center gap-2.5 px-5 py-4 border-b border-border bg-muted/30">
            <Shield size={16} className="text-[#2874F0]" />
            <h3 className="font-semibold text-foreground text-sm">Security</h3>
          </div>
          <div className="p-5 space-y-3 divide-y divide-border">
            <div className="flex items-center justify-between py-1">
              <div>
                <p className="text-sm font-medium text-foreground">Password</p>
                <p className="text-xs text-muted-foreground">Last changed: Never</p>
              </div>
              <button
                onClick={() => toast.info('Password reset link sent to your email!')}
                className="flex items-center gap-1.5 text-sm text-[#2874F0] border border-[#2874F0]/50 px-4 py-2 rounded-lg hover:bg-[#2874F0]/5 transition-colors font-medium"
              >
                <Lock size={13} /> Change
              </button>
            </div>
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm font-medium text-foreground">Account Role</p>
                <p className="text-xs text-muted-foreground capitalize">{user?.role} account</p>
              </div>
              <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-3 py-1 rounded-full font-semibold">
                Active
              </span>
            </div>
          </div>
        </div>

        {/* Logout / Danger zone */}
        <div className="bg-card rounded-xl shadow-sm border border-red-200 dark:border-red-900/30 overflow-hidden">
          <div className="flex items-center gap-2.5 px-5 py-4 border-b border-red-100 dark:border-red-900/20 bg-red-50/50 dark:bg-red-900/10">
            <LogOut size={16} className="text-red-500" />
            <h3 className="font-semibold text-red-700 dark:text-red-400 text-sm">Sign Out</h3>
          </div>
          <div className="p-5">
            <p className="text-sm text-muted-foreground mb-4">
              You will be signed out from this device and redirected to the home page. Your cart and wishlist will be saved.
            </p>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-5 py-2.5 rounded-lg transition-colors font-semibold text-sm"
            >
              <LogOut size={15} /> Logout from Account
            </button>
          </div>
        </div>
      </div>
    </CustomerLayout>
  );
}
