import { useState, useEffect } from 'react';
import { MapPin, Plus, Trash2, Home, CheckCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import CustomerLayout from '@/components/layout/CustomerLayout';
import { toast } from 'sonner';

const EMPTY_FORM = { name: '', phone: '', street: '', city: '', state: '', pincode: '', isDefault: false };

const FIELDS = [
  { label: 'Full Name', key: 'name', placeholder: 'John Doe', col: 1 },
  { label: 'Phone Number', key: 'phone', placeholder: '10-digit mobile', col: 1 },
  { label: 'Street / Area', key: 'street', placeholder: 'House no., Building, Street, Locality', col: 2 },
  { label: 'City', key: 'city', placeholder: 'City', col: 1 },
  { label: 'State', key: 'state', placeholder: 'State', col: 1 },
  { label: 'Pincode', key: 'pincode', placeholder: '6-digit pincode', col: 1 },
] as const;

export default function Addresses() {
  const { addresses, addAddress, removeAddress, setDefaultAddress, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => {
    if (!isAuthenticated) navigate('/login?redirect=/addresses');
  }, [isAuthenticated]);

  if (!isAuthenticated) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addAddress(form);
    setForm(EMPTY_FORM);
    setShowForm(false);
    toast.success('Address added successfully!');
  };

  return (
    <CustomerLayout title="Address Book" showBackToDashboard>
      {/* Saved addresses */}
      <div className="space-y-3 mb-4">
        {addresses.length === 0 && !showForm ? (
          <div className="bg-card rounded-xl p-12 flex flex-col items-center border border-dashed border-border">
            <MapPin size={52} className="text-muted-foreground mb-3" strokeWidth={1} />
            <p className="font-semibold text-foreground mb-1">No saved addresses</p>
            <p className="text-sm text-muted-foreground">Add an address for faster checkout</p>
          </div>
        ) : (
          addresses.map(addr => (
            <div
              key={addr.id}
              className={`bg-card rounded-xl p-4 border-2 transition-all shadow-sm ${addr.isDefault ? 'border-[#2874F0]' : 'border-border'}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="bg-blue-50 dark:bg-blue-950/30 p-2.5 rounded-lg flex-shrink-0 mt-0.5">
                    <Home size={16} className="text-[#2874F0]" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <p className="font-semibold text-foreground text-sm">{addr.name}</p>
                      <span className="text-xs text-muted-foreground">{addr.phone}</span>
                      {addr.isDefault && (
                        <span className="bg-[#2874F0] text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{addr.street}</p>
                    <p className="text-sm text-muted-foreground">{addr.city}, {addr.state} — {addr.pincode}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {!addr.isDefault && (
                    <button
                      onClick={() => { setDefaultAddress(addr.id); toast.success('Default address updated!'); }}
                      className="text-xs text-[#2874F0] border border-[#2874F0]/60 px-2.5 py-1.5 rounded-lg hover:bg-[#2874F0]/5 transition-colors flex items-center gap-1 font-medium whitespace-nowrap"
                    >
                      <CheckCircle size={12} /> Set Default
                    </button>
                  )}
                  <button
                    onClick={() => { removeAddress(addr.id); toast.success('Address removed'); }}
                    className="p-2 text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add form / Add button */}
      {showForm ? (
        <div className="bg-card rounded-xl p-5 border-2 border-dashed border-[#2874F0]/40 shadow-sm">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Plus size={16} className="text-[#2874F0]" />
            Add New Address
          </h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-3">
            {FIELDS.map(({ label, key, placeholder, col }) => (
              <div key={key} className={col === 2 ? 'col-span-2' : ''}>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">{label}</label>
                <input
                  value={form[key as keyof typeof form] as string}
                  onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                  required
                  placeholder={placeholder}
                  className="w-full border border-border rounded-lg px-3 py-2.5 text-sm bg-background text-foreground outline-none focus:ring-2 focus:ring-[#2874F0]/30 focus:border-[#2874F0] transition-all"
                />
              </div>
            ))}
            <div className="col-span-2 flex items-center gap-2">
              <input
                type="checkbox"
                id="isDefault"
                checked={form.isDefault}
                onChange={e => setForm(f => ({ ...f, isDefault: e.target.checked }))}
                className="w-4 h-4 accent-[#2874F0] rounded cursor-pointer"
              />
              <label htmlFor="isDefault" className="text-sm text-foreground cursor-pointer select-none">
                Set as default address
              </label>
            </div>
            <div className="col-span-2 flex gap-3 mt-1">
              <button
                type="submit"
                className="flex-1 bg-[#2874F0] hover:bg-[#1D5FD1] text-white py-2.5 rounded-lg font-semibold text-sm transition-colors"
              >
                Save Address
              </button>
              <button
                type="button"
                onClick={() => { setShowForm(false); setForm(EMPTY_FORM); }}
                className="flex-1 border border-border py-2.5 rounded-lg font-medium text-sm text-foreground hover:bg-muted transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-[#2874F0]/30 text-[#2874F0] py-4 rounded-xl hover:border-[#2874F0] hover:bg-[#2874F0]/5 transition-all font-medium text-sm"
        >
          <Plus size={18} /> Add New Address
        </button>
      )}
    </CustomerLayout>
  );
}
