import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, UserPlus, Check } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

export default function Signup() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { signup } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.email.includes('@')) e.email = 'Valid email required';
    if (form.password.length < 6) e.password = 'Password must be at least 6 characters';
    if (form.password !== form.confirm) e.confirm = 'Passwords do not match';
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setLoading(true);
    await signup(form.name, form.email, form.password);
    setLoading(false);
    toast.success('Account created!', { description: 'Welcome to ShopMart!' });
    navigate('/');
  };

  const set = (key: string, val: string) => { setForm(f => ({ ...f, [key]: val })); setErrors(e => ({ ...e, [key]: '' })); };

  const perks = ['Free delivery on orders above ₹499', 'Exclusive member deals', 'Easy returns & refunds', 'Track orders in real-time'];

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-4xl grid md:grid-cols-2 gap-6">
        <div className="hidden md:flex flex-col justify-center bg-gradient-to-br from-[#2874F0] to-blue-700 rounded-xl p-8 text-white">
          <h2 className="text-2xl font-bold mb-2">Join ShopMart</h2>
          <p className="text-blue-100 text-sm mb-6">India's most trusted online shopping platform</p>
          <ul className="space-y-3">
            {perks.map(p => (
              <li key={p} className="flex items-center gap-3 text-sm">
                <div className="bg-white/20 rounded-full p-1"><Check size={12} /></div>{p}
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-card rounded-xl shadow-lg p-6">
          <h1 className="text-xl font-bold text-foreground mb-5">Create Account</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { key: 'name', label: 'Full Name', type: 'text', placeholder: 'Your full name' },
              { key: 'email', label: 'Email Address', type: 'email', placeholder: 'you@example.com' },
            ].map(({ key, label, type, placeholder }) => (
              <div key={key}>
                <label className="block text-sm font-medium text-foreground mb-1.5">{label}</label>
                <input type={type} value={form[key as keyof typeof form]} onChange={e => set(key, e.target.value)} placeholder={placeholder}
                  className="w-full border border-border rounded-lg px-3 py-2.5 text-sm bg-background text-foreground outline-none focus:ring-2 focus:ring-[#2874F0]/30 focus:border-[#2874F0]" />
                {errors[key] && <p className="text-red-500 text-xs mt-1">{errors[key]}</p>}
              </div>
            ))}
            {[
              { key: 'password', label: 'Password', placeholder: 'Min 6 characters' },
              { key: 'confirm', label: 'Confirm Password', placeholder: 'Repeat your password' },
            ].map(({ key, label, placeholder }) => (
              <div key={key}>
                <label className="block text-sm font-medium text-foreground mb-1.5">{label}</label>
                <div className="relative">
                  <input type={showPw ? 'text' : 'password'} value={form[key as keyof typeof form]} onChange={e => set(key, e.target.value)} placeholder={placeholder}
                    className="w-full border border-border rounded-lg px-3 py-2.5 pr-10 text-sm bg-background text-foreground outline-none focus:ring-2 focus:ring-[#2874F0]/30 focus:border-[#2874F0]" />
                  {key === 'password' && (
                    <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  )}
                </div>
                {errors[key] && <p className="text-red-500 text-xs mt-1">{errors[key]}</p>}
              </div>
            ))}
            <button type="submit" disabled={loading} className="w-full bg-[#FB641B] hover:bg-[#e55a18] disabled:opacity-60 text-white font-semibold py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors">
              {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <UserPlus size={16} />}
              {loading ? 'Creating...' : 'Create Account'}
            </button>
          </form>
          <p className="text-center text-sm text-muted-foreground mt-4">
            Already have an account? <Link to="/login" className="text-[#2874F0] font-medium hover:underline">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
