import { useState, useEffect } from 'react';
import { User, Moon, Sun, LogOut, Shield, Lock, Bell, Landmark, Plus, Trash2, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import CustomerLayout from '@/components/layout/CustomerLayout';
import { useTheme } from '@/context/ThemeContext';
import { toast } from 'sonner';
import { api } from '@/services/api';

export interface BankAccount {
  id: string;
  bankName: string;
  accountHolder: string;
  accountNumber: string;
  ifscCode: string;
  isDefault: boolean;
}

const DEFAULT_BANK_ACCOUNTS: BankAccount[] = [];

export default function AccountSettings() {
  const { user, isAuthenticated, logout, updateUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [saving, setSaving] = useState(false);

  // Change Password Modal State
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [pwForm, setPwForm] = useState({ current: '', newPw: '', confirmPw: '' });
  const [pwLoading, setPwLoading] = useState(false);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwForm.newPw.length < 6) {
      toast.error('New password must be at least 6 characters long.');
      return;
    }
    if (pwForm.newPw !== pwForm.confirmPw) {
      toast.error('Passwords do not match.');
      return;
    }
    setPwLoading(true);
    const res = await api.auth.updatePassword(pwForm.current, pwForm.newPw);
    setPwLoading(false);
    if (res && res.success) {
      toast.success('Password updated successfully!');
      setShowPasswordModal(false);
      setPwForm({ current: '', newPw: '', confirmPw: '' });
    } else {
      toast.error(res?.message || 'Failed to update password.');
    }
  };

  // Bank Accounts State
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>(() => {
    try {
      const stored = localStorage.getItem('shopmart_user_bank_accounts');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed.filter((b: any) => !['bank-1', 'bank-2'].includes(b.id));
      }
      return [];
    } catch {
      return [];
    }
  });

  const [showAddBankForm, setShowAddBankForm] = useState(false);
  const [newBankName, setNewBankName] = useState('HDFC Bank');
  const [newHolderName, setNewHolderName] = useState(user?.name || '');
  const [newAccNumber, setNewAccNumber] = useState('');
  const [newIfscCode, setNewIfscCode] = useState('');

  useEffect(() => {
    if (!isAuthenticated) navigate('/login?redirect=/settings');
  }, [isAuthenticated]);

  useEffect(() => {
    localStorage.setItem('shopmart_user_bank_accounts', JSON.stringify(bankAccounts));
  }, [bankAccounts]);

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

  // Add Bank Account Handler
  const handleAddBankAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAccNumber || !newIfscCode) {
      toast.error('Please enter account number and IFSC code.');
      return;
    }

    const newAccount: BankAccount = {
      id: `bank-${Date.now()}`,
      bankName: newBankName,
      accountHolder: newHolderName,
      accountNumber: newAccNumber,
      ifscCode: newIfscCode.toUpperCase(),
      isDefault: bankAccounts.length === 0,
    };

    setBankAccounts(prev => [...prev, newAccount]);
    toast.success(`${newBankName} account added successfully!`);
    setShowAddBankForm(false);
    setNewAccNumber('');
    setNewIfscCode('');
  };

  // Delete Bank Account
  const handleDeleteBankAccount = (id: string) => {
    setBankAccounts(prev => prev.filter(b => b.id !== id));
    toast.success('Bank account removed from your profile.');
  };

  // Set Default Bank Account
  const handleSetDefaultBank = (id: string) => {
    setBankAccounts(prev => prev.map(b => ({ ...b, isDefault: b.id === id })));
    toast.success('Primary withdrawal bank account updated!');
  };

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
              className="flex items-center gap-2 bg-[#2874F0] hover:bg-[#1D5FD1] disabled:opacity-60 text-white px-6 py-2.5 rounded-lg font-semibold text-sm transition-colors cursor-pointer"
            >
              {saving && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>

        {/* BANK ACCOUNTS & WITHDRAWAL DETAILS SECTION (NEW FEATURE) */}
        <div id="bank-section" className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-muted/30">
            <div className="flex items-center gap-2.5">
              <Landmark size={16} className="text-purple-600" />
              <h3 className="font-semibold text-foreground text-sm">Bank Accounts & Withdrawal Details</h3>
            </div>
            <button
              onClick={() => setShowAddBankForm(!showAddBankForm)}
              className="text-xs bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1 cursor-pointer"
            >
              <Plus size={14} /> Add Bank Account
            </button>
          </div>

          <div className="p-5 space-y-4">
            {/* Bank Accounts List */}
            {bankAccounts.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground bg-muted/30 rounded-xl border border-dashed border-border">
                <Landmark size={36} className="mx-auto mb-2 opacity-40 text-purple-600" />
                <p className="text-xs font-bold text-foreground mb-1">No Saved Bank Accounts</p>
                <p className="text-[11px] text-muted-foreground mb-3">Add a bank account to receive instant wallet withdrawals & refund credits.</p>
                <button
                  onClick={() => setShowAddBankForm(true)}
                  className="text-xs bg-purple-600 text-white px-4 py-2 rounded-lg font-bold"
                >
                  + Add Your First Bank Account
                </button>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-3">
                {bankAccounts.map(acc => (
                  <div key={acc.id} className={`p-4 rounded-xl border transition-all ${acc.isDefault ? 'border-purple-500 bg-purple-50/50 dark:bg-purple-950/20 shadow-xs' : 'border-border bg-card'}`}>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <span className="font-extrabold text-foreground text-sm flex items-center gap-1.5">
                          <Landmark size={15} className="text-purple-600" /> {acc.bankName}
                        </span>
                        <p className="text-xs font-mono font-bold text-purple-900 dark:text-purple-300 mt-0.5">
                          A/C: **** {acc.accountNumber.slice(-4)}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        {acc.isDefault ? (
                          <span className="text-[9px] bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded-full font-bold">
                            Primary
                          </span>
                        ) : (
                          <button
                            onClick={() => handleSetDefaultBank(acc.id)}
                            className="text-[9px] bg-muted hover:bg-muted/80 text-muted-foreground px-2 py-0.5 rounded-full font-bold cursor-pointer"
                          >
                            Set Primary
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteBankAccount(acc.id)}
                          className="text-rose-500 hover:text-rose-700 p-1 cursor-pointer"
                          title="Remove bank account"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                    <div className="text-[11px] text-muted-foreground space-y-0.5 border-t border-border/50 pt-2">
                      <p>Holder: <strong className="text-foreground font-medium">{acc.accountHolder}</strong></p>
                      <p>IFSC Code: <strong className="font-mono text-foreground font-medium">{acc.ifscCode}</strong></p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add Bank Account Form */}
            {showAddBankForm && (
              <form onSubmit={handleAddBankAccount} className="bg-muted p-4 rounded-xl border border-border space-y-3.5 text-xs mt-3">
                <h4 className="font-bold text-foreground flex items-center gap-1.5 text-xs">
                  <Plus size={14} className="text-purple-600" /> Add New Bank Account Details
                </h4>

                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-muted-foreground mb-1">Select Bank Name</label>
                    <select
                      value={newBankName}
                      onChange={e => setNewBankName(e.target.value)}
                      className="w-full bg-background border border-border rounded-lg p-2.5 text-foreground font-medium outline-none"
                    >
                      <option value="HDFC Bank">HDFC Bank</option>
                      <option value="ICICI Bank">ICICI Bank</option>
                      <option value="State Bank of India">State Bank of India (SBI)</option>
                      <option value="Axis Bank">Axis Bank</option>
                      <option value="Kotak Mahindra Bank">Kotak Mahindra Bank</option>
                      <option value="Punjab National Bank">Punjab National Bank (PNB)</option>
                      <option value="Bank of Baroda">Bank of Baroda</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-muted-foreground mb-1">Account Holder Name</label>
                    <input
                      type="text"
                      required
                      value={newHolderName}
                      onChange={e => setNewHolderName(e.target.value)}
                      className="w-full bg-background border border-border rounded-lg p-2.5 text-foreground outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-muted-foreground mb-1">Bank Account Number</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 982401928410"
                      value={newAccNumber}
                      onChange={e => setNewAccNumber(e.target.value.replace(/\D/g, ''))}
                      className="w-full bg-background border border-border rounded-lg p-2.5 font-mono text-foreground outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-muted-foreground mb-1">IFSC Code</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. HDFC0000240"
                      value={newIfscCode}
                      onChange={e => setNewIfscCode(e.target.value.toUpperCase())}
                      className="w-full bg-background border border-border rounded-lg p-2.5 font-mono uppercase text-foreground outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowAddBankForm(false)}
                    className="px-4 py-2 bg-background border border-border rounded-lg font-semibold text-muted-foreground cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold shadow-xs cursor-pointer"
                  >
                    Save Bank Account
                  </button>
                </div>
              </form>
            )}
          </div>
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
                <p className="text-xs text-muted-foreground">Secure your account password</p>
              </div>
              <button
                onClick={() => { setShowPasswordModal(true); setPwForm({ current: '', newPw: '', confirmPw: '' }); }}
                className="flex items-center gap-1.5 text-sm text-[#2874F0] border border-[#2874F0]/50 px-4 py-2 rounded-lg hover:bg-[#2874F0]/5 transition-colors font-medium cursor-pointer"
              >
                <Lock size={13} /> Change Password
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

        {/* Change Password Modal */}
        {showPasswordModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-card border border-border rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                  <Lock size={18} className="text-[#2874F0]" /> Update Account Password
                </h3>
                <button onClick={() => setShowPasswordModal(false)} className="text-muted-foreground hover:text-foreground cursor-pointer"><X size={18} /></button>
              </div>
              <form onSubmit={handleUpdatePassword} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-foreground mb-1">Current Password *</label>
                  <input
                    type="password"
                    required
                    placeholder="Enter current password"
                    value={pwForm.current}
                    onChange={e => setPwForm(p => ({ ...p, current: e.target.value }))}
                    className="w-full bg-background border border-border rounded-xl p-2.5 text-foreground font-medium outline-none focus:border-[#2874F0] focus:ring-2 focus:ring-[#2874F0]/20 transition-all text-sm"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-foreground mb-1">New Password *</label>
                  <input
                    type="password"
                    required
                    placeholder="Min 6 characters"
                    value={pwForm.newPw}
                    onChange={e => setPwForm(p => ({ ...p, newPw: e.target.value }))}
                    className="w-full bg-background border border-border rounded-xl p-2.5 text-foreground font-medium outline-none focus:border-[#2874F0] focus:ring-2 focus:ring-[#2874F0]/20 transition-all text-sm"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-foreground mb-1">Confirm New Password *</label>
                  <input
                    type="password"
                    required
                    placeholder="Repeat new password"
                    value={pwForm.confirmPw}
                    onChange={e => setPwForm(p => ({ ...p, confirmPw: e.target.value }))}
                    className="w-full bg-background border border-border rounded-xl p-2.5 text-foreground font-medium outline-none focus:border-[#2874F0] focus:ring-2 focus:ring-[#2874F0]/20 transition-all text-sm"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowPasswordModal(false)} className="flex-1 bg-muted text-foreground font-semibold py-2.5 rounded-xl cursor-pointer hover:bg-muted/80 transition-colors">Cancel</button>
                  <button type="submit" disabled={pwLoading} className="flex-1 bg-[#2874F0] hover:bg-blue-600 disabled:opacity-60 text-white font-bold py-2.5 rounded-xl transition-colors shadow-md cursor-pointer">
                    {pwLoading ? 'Updating...' : 'Update Password'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

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
              className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-5 py-2.5 rounded-lg transition-colors font-semibold text-sm cursor-pointer"
            >
              <LogOut size={15} /> Logout from Account
            </button>
          </div>
        </div>
      </div>
    </CustomerLayout>
  );
}
