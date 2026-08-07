import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, UserPlus, CheckCircle2, ShieldCheck, ArrowRight, Chrome, Apple, AlertCircle, Sparkles, User, Store, Sun, Moon, Building2, Landmark, CreditCard, MapPin } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { toast } from 'sonner';

export default function Signup() {
  const [params] = useSearchParams();
  const initialRole = params.get('role') === 'seller' ? 'seller' : 'customer';

  const [role, setRole] = useState<'customer' | 'seller'>(initialRole);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirm: '',
    // Seller Business Fields
    storeName: '',
    gstin: '',
    panNumber: '',
    accountNumber: '',
    ifscCode: '',
    businessAddress: '',
    pickupPincode: '',
  });
  const [showPw, setShowPw] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { signup } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  // Password strength calculation
  const getPasswordStrength = (pw: string) => {
    let score = 0;
    if (pw.length >= 6) score += 1;
    if (pw.length >= 8) score += 1;
    if (/[A-Z]/.test(pw)) score += 1;
    if (/[0-9]/.test(pw)) score += 1;
    if (/[^A-Za-z0-9]/.test(pw)) score += 1;
    return score;
  };

  const pwStrength = getPasswordStrength(form.password);

  const getStrengthLabel = (score: number) => {
    if (score <= 1) return { label: 'Weak', color: 'bg-rose-500', text: 'text-rose-500 dark:text-rose-400', width: 'w-1/4' };
    if (score <= 3) return { label: 'Medium', color: 'bg-amber-500', text: 'text-amber-500 dark:text-amber-400', width: 'w-2/4' };
    if (score === 4) return { label: 'Good', color: 'bg-blue-500', text: 'text-blue-500 dark:text-blue-400', width: 'w-3/4' };
    return { label: 'Strong', color: 'bg-emerald-500', text: 'text-emerald-600 dark:text-emerald-400', width: 'w-full' };
  };

  const strengthInfo = getStrengthLabel(pwStrength);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Full name is required';
    if (!form.email.includes('@')) e.email = 'Valid email address required';
    if (form.password.length < 6) e.password = 'Password must be at least 6 characters';
    if (form.password !== form.confirm) e.confirm = 'Passwords do not match';

    if (role === 'seller') {
      if (!form.storeName.trim()) e.storeName = 'Store/Business Name is required';
      if (!form.gstin.trim() || form.gstin.length < 15) e.gstin = 'Valid 15-digit GSTIN required';
      if (!form.panNumber.trim() || form.panNumber.length < 10) e.panNumber = 'Valid 10-character PAN required';
      if (!form.accountNumber.trim()) e.accountNumber = 'Bank Account Number required';
      if (!form.ifscCode.trim()) e.ifscCode = 'Bank IFSC Code required';
      if (!form.pickupPincode.trim() || form.pickupPincode.length < 6) e.pickupPincode = 'Valid 6-digit Pincode required';
    }

    if (!agreeTerms) e.terms = 'You must accept the terms and conditions';
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setLoading(true);
    await signup(form.name, form.email, form.password, role);

    if (role === 'seller') {
      const sellerProfile = {
        storeName: form.storeName.trim(),
        gstin: form.gstin.trim(),
        panNumber: form.panNumber.trim(),
        accountNumber: form.accountNumber.trim(),
        ifscCode: form.ifscCode.trim(),
        businessAddress: form.businessAddress.trim(),
        pickupPincode: form.pickupPincode.trim(),
        registeredAt: new Date().toISOString(),
      };
      try {
        localStorage.setItem('shopmart_seller_business_profile', JSON.stringify(sellerProfile));
      } catch (err) {}
    }

    setLoading(false);

    toast.success(`Account created successfully!`, {
      description: `Welcome to WoodNest as a registered ${role}.`,
    });

    if (role === 'seller') {
      navigate('/seller');
    } else {
      navigate('/');
    }
  };

  const setField = (key: string, val: string) => {
    setForm(f => ({ ...f, [key]: val }));
    setErrors(e => ({ ...e, [key]: '' }));
  };

  const handleSocialSignup = (provider: string) => {
    toast.info(`Initializing account with ${provider}...`);
    setTimeout(async () => {
      await signup('Demo User', 'user@demo.com', 'password123');
      toast.success(`Account created with ${provider}!`);
      navigate('/');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-between p-4 md:p-8 text-slate-800 dark:text-slate-100 transition-colors duration-200">
      {/* Top Header Bar with Clickable Website Logo & Theme Toggle */}
      <header className="max-w-6xl w-full mx-auto flex items-center justify-between py-2 mb-6">
        <Link
          to="/"
          className="flex items-center gap-3 group cursor-pointer transition-transform hover:scale-105"
          title="Return to WoodNest Home Page"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#2874F0] to-blue-500 flex items-center justify-center text-white font-black text-xl shadow-lg ring-2 ring-blue-500/20 group-hover:ring-[#2874F0] transition-all">
            W
          </div>
          <div>
            <div className="text-slate-900 dark:text-white font-extrabold text-2xl leading-none tracking-tight flex items-center gap-1.5">
              WoodNest
              <span className="text-[10px] bg-blue-100 dark:bg-blue-900/40 text-[#2874F0] dark:text-blue-300 px-2 py-0.5 rounded-full font-semibold border border-blue-200 dark:border-blue-700/50">
                Official
              </span>
            </div>
            <div className="text-xs text-slate-500 dark:text-blue-200/80 leading-none mt-1">Design Your Space</div>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          >
            {theme === 'dark' ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} className="text-slate-700" />}
          </button>

          <Link
            to="/login"
            className="text-xs font-semibold text-slate-700 dark:text-blue-300 hover:text-[#2874F0] dark:hover:text-white bg-white dark:bg-white/10 hover:bg-slate-100 dark:hover:bg-white/20 px-3.5 py-2 rounded-full border border-slate-200 dark:border-white/10 transition-all flex items-center gap-1.5 shadow-sm"
          >
            Already registered? Sign In <ArrowRight size={13} />
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-5xl w-full mx-auto grid md:grid-cols-12 gap-0 bg-white dark:bg-slate-900/90 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-auto">
        {/* Left Side: Member Perks & Trust */}
        <div className="md:col-span-5 bg-gradient-to-br from-[#2874F0] via-blue-700 to-indigo-900 p-8 md:p-10 flex flex-col justify-between relative overflow-hidden text-white">
          <div className="absolute -right-16 -top-16 w-56 h-56 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -left-16 -bottom-16 w-56 h-56 bg-blue-400/20 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10">
            <span className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-md text-blue-100 text-xs font-semibold px-3 py-1 rounded-full border border-white/20 mb-6">
              <Sparkles size={13} className="text-amber-300" /> Exclusive Membership Benefits
            </span>
            <h2 className="text-3xl font-extrabold leading-tight tracking-tight mb-4">
              Join India's Most Loved Woodcraft Store.
            </h2>
            <p className="text-blue-100/90 text-sm leading-relaxed mb-6">
              Create your account in seconds to unlock personalized furniture recommendations and express checkout.
            </p>

            <div className="space-y-4">
              {[
                { title: 'Free Assembly Service', desc: 'Doorstep assembly by certified technicians on all orders.' },
                { title: 'Exclusive Member Discounts', desc: 'Get up to 25% off on seasonal living & dining sets.' },
                { title: 'Easy 7-Day Returns', desc: 'Hassle-free reverse pickup with 100% money-back guarantee.' },
                { title: 'Real-Time Order Tracking', desc: 'Live WhatsApp & SMS updates from workshop to doorstep.' },
              ].map((perk, i) => (
                <div key={i} className="flex items-start gap-3 bg-white/10 backdrop-blur-md p-3.5 rounded-xl border border-white/10">
                  <CheckCircle2 size={18} className="text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-white">{perk.title}</div>
                    <div className="text-[11px] text-blue-200/80 leading-snug">{perk.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative z-10 pt-6 border-t border-white/15 mt-8 flex items-center justify-between text-xs text-blue-100">
            <div className="flex items-center gap-2">
              <ShieldCheck size={18} className="text-emerald-400" /> 100% Safe & Secure Signup
            </div>
          </div>
        </div>

        {/* Right Side: Interactive Signup Form */}
        <div className="md:col-span-7 p-6 md:p-10 flex flex-col justify-center bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">
          <div className="mb-5">
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-1.5">Create Your Account</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">Select account type and complete your registration.</p>
          </div>

          {/* Account Type Selector */}
          <div className="grid grid-cols-2 gap-3 p-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-xl mb-5 border border-slate-200 dark:border-slate-700/60">
            <button
              type="button"
              onClick={() => setRole('customer')}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-semibold transition-all ${
                role === 'customer'
                  ? 'bg-[#2874F0] text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-700/50'
              }`}
            >
              <User size={15} /> Customer Account
            </button>
            <button
              type="button"
              onClick={() => setRole('seller')}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-semibold transition-all ${
                role === 'seller'
                  ? 'bg-[#2874F0] text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-700/50'
              }`}
            >
              <Store size={15} /> Seller Account
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Full Name & Email Grid */}
            <div className="grid md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setField('name', e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full bg-slate-50 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-[#2874F0] focus:ring-2 focus:ring-[#2874F0]/30 transition-all"
                />
                {errors.name && <p className="text-rose-500 dark:text-rose-400 text-[11px] mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setField('email', e.target.value)}
                  placeholder="rahul@example.com"
                  className="w-full bg-slate-50 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-[#2874F0] focus:ring-2 focus:ring-[#2874F0]/30 transition-all"
                />
                {errors.email && <p className="text-rose-500 dark:text-rose-400 text-[11px] mt-1">{errors.email}</p>}
              </div>
            </div>

            {/* Password & Confirm */}
            <div className="grid md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Password</label>
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={form.password}
                    onChange={e => setField('password', e.target.value)}
                    placeholder="Min 6 chars"
                    className="w-full bg-slate-50 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-[#2874F0] focus:ring-2 focus:ring-[#2874F0]/30 pr-10 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                  >
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && <p className="text-rose-500 dark:text-rose-400 text-[11px] mt-1">{errors.password}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Confirm Password</label>
                <input
                  type={showPw ? 'text' : 'password'}
                  value={form.confirm}
                  onChange={e => setField('confirm', e.target.value)}
                  placeholder="Repeat password"
                  className="w-full bg-slate-50 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-[#2874F0] focus:ring-2 focus:ring-[#2874F0]/30 transition-all"
                />
                {errors.confirm && <p className="text-rose-500 dark:text-rose-400 text-[11px] mt-1">{errors.confirm}</p>}
              </div>
            </div>

            {/* Interactive Password Strength Indicator */}
            {form.password && (
              <div className="bg-slate-100 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700/50 text-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-slate-500 dark:text-slate-400 text-[11px]">Password Strength:</span>
                  <span className={`font-bold text-[11px] ${strengthInfo.text}`}>{strengthInfo.label}</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                  <div className={`h-full ${strengthInfo.color} ${strengthInfo.width} transition-all duration-300`} />
                </div>
              </div>
            )}

            {/* SELLER BUSINESS DETAILS FIELDS */}
            {role === 'seller' && (
              <div className="space-y-3 pt-3 pb-2 border-t border-slate-200 dark:border-slate-800 animate-in fade-in duration-200">
                <div className="flex items-center gap-2 text-xs font-bold text-[#2874F0] dark:text-blue-400 uppercase tracking-wider">
                  <Building2 size={15} /> Verified Seller Business Profile
                </div>

                <div className="grid md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Store / Business Name *</label>
                    <input
                      type="text"
                      value={form.storeName}
                      onChange={e => setField('storeName', e.target.value)}
                      placeholder="e.g. Woodcraft Hub Store"
                      className="w-full bg-slate-50 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-[#2874F0]"
                    />
                    {errors.storeName && <p className="text-rose-500 text-[11px] mt-1">{errors.storeName}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">GSTIN Number *</label>
                    <input
                      type="text"
                      value={form.gstin}
                      onChange={e => setField('gstin', e.target.value.toUpperCase())}
                      placeholder="e.g. 27AAACB1234C1Z5"
                      maxLength={15}
                      className="w-full bg-slate-50 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 text-sm font-mono text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-[#2874F0]"
                    />
                    {errors.gstin && <p className="text-rose-500 text-[11px] mt-1">{errors.gstin}</p>}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Business PAN Number *</label>
                    <input
                      type="text"
                      value={form.panNumber}
                      onChange={e => setField('panNumber', e.target.value.toUpperCase())}
                      placeholder="e.g. AAACB1234C"
                      maxLength={10}
                      className="w-full bg-slate-50 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 text-sm font-mono text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-[#2874F0]"
                    />
                    {errors.panNumber && <p className="text-rose-500 text-[11px] mt-1">{errors.panNumber}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Pickup Warehouse Pincode *</label>
                    <input
                      type="text"
                      value={form.pickupPincode}
                      onChange={e => setField('pickupPincode', e.target.value)}
                      placeholder="e.g. 560001"
                      maxLength={6}
                      className="w-full bg-slate-50 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 text-sm font-mono text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-[#2874F0]"
                    />
                    {errors.pickupPincode && <p className="text-rose-500 text-[11px] mt-1">{errors.pickupPincode}</p>}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Bank Account Number *</label>
                    <input
                      type="text"
                      value={form.accountNumber}
                      onChange={e => setField('accountNumber', e.target.value)}
                      placeholder="e.g. 50100234819201"
                      className="w-full bg-slate-50 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 text-sm font-mono text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-[#2874F0]"
                    />
                    {errors.accountNumber && <p className="text-rose-500 text-[11px] mt-1">{errors.accountNumber}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Bank IFSC Code *</label>
                    <input
                      type="text"
                      value={form.ifscCode}
                      onChange={e => setField('ifscCode', e.target.value.toUpperCase())}
                      placeholder="e.g. HDFC0000240"
                      maxLength={11}
                      className="w-full bg-slate-50 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 text-sm font-mono text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-[#2874F0]"
                    />
                    {errors.ifscCode && <p className="text-rose-500 text-[11px] mt-1">{errors.ifscCode}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Registered Business Address</label>
                  <input
                    type="text"
                    value={form.businessAddress}
                    onChange={e => setField('businessAddress', e.target.value)}
                    placeholder="e.g. Plot 12, Industrial Woodcraft Zone, Bangalore, KA"
                    className="w-full bg-slate-50 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-[#2874F0]"
                  />
                </div>
              </div>
            )}

            {/* Terms Agreement Checkbox */}
            <div>
              <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-700 dark:text-slate-300 pt-1">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={e => {
                    setAgreeTerms(e.target.checked);
                    setErrors(prev => ({ ...prev, terms: '' }));
                  }}
                  className="rounded border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-[#2874F0] focus:ring-0 w-4 h-4 mt-0.5 cursor-pointer"
                />
                <span>
                  I agree to the{' '}
                  <Link to="/policy/terms-of-use" target="_blank" className="text-[#2874F0] hover:underline font-semibold">
                    Terms of Use
                  </Link>{' '}
                  and{' '}
                  <Link to="/policy/privacy-policy" target="_blank" className="text-[#2874F0] hover:underline font-semibold">
                    Privacy Policy
                  </Link>
                </span>
              </label>
              {errors.terms && <p className="text-rose-500 dark:text-rose-400 text-[11px] mt-1">{errors.terms}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#FB641B] hover:bg-[#e55a18] active:scale-[0.99] disabled:opacity-60 text-white font-bold py-3.5 rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer text-sm"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <UserPlus size={18} /> Create Free Account
                </>
              )}
            </button>
          </form>

          {/* Social Sign up */}
          <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleSocialSignup('Google')}
                className="flex items-center justify-center gap-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-xs font-semibold py-2.5 rounded-xl transition-all text-slate-700 dark:text-slate-200 cursor-pointer"
              >
                <Chrome size={16} className="text-rose-500" /> Google
              </button>
              <button
                type="button"
                onClick={() => handleSocialSignup('Apple')}
                className="flex items-center justify-center gap-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-xs font-semibold py-2.5 rounded-xl transition-all text-slate-700 dark:text-slate-200 cursor-pointer"
              >
                <Apple size={16} className="text-slate-900 dark:text-white" /> Apple ID
              </button>
            </div>
          </div>

          <p className="text-center text-xs text-slate-600 dark:text-slate-400 mt-5">
            Already have an account?{' '}
            <Link to="/login" className="text-[#2874F0] dark:text-blue-400 font-bold hover:underline">
              Sign In Now
            </Link>
          </p>
        </div>
      </div>

      {/* Footer copyright */}
      <footer className="text-center text-xs text-slate-500 dark:text-slate-400 py-4">
        © 2026 WoodNest Pvt. Ltd. All rights reserved. Encrypted & Certified Registration.
      </footer>
    </div>
  );
}
