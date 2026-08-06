import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, LogIn, AlertCircle, Sparkles, CheckCircle2, ArrowRight, UserCheck, Store, ShieldAlert, Chrome, Apple, Sun, Moon } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { toast } from 'sonner';
import type { User } from '@/types';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [activeRole, setActiveRole] = useState<'customer' | 'seller' | 'admin'>('customer');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const redirect = params.get('redirect') || '/';

  const demoCredentials = {
    customer: { email: 'customer@demo.com', pass: 'password123', label: 'Customer Demo', icon: UserCheck, desc: 'Shop & track orders' },
    seller: { email: 'seller@demo.com', pass: 'password123', label: 'Seller Demo', icon: Store, desc: 'Manage inventory & products' },
    admin: { email: 'admin@demo.com', pass: 'password123', label: 'Admin Demo', icon: ShieldAlert, desc: 'Full store oversight' },
  };

  const handleRoleSelect = (role: 'customer' | 'seller' | 'admin') => {
    setActiveRole(role);
    setEmail(demoCredentials[role].email);
    setPassword(demoCredentials[role].pass);
    setError('');
  };

  const redirectUserByRole = (userObj: User | null, defaultRedirect: string) => {
    if (userObj?.role === 'admin') {
      navigate('/admin');
    } else if (userObj?.role === 'seller') {
      navigate('/seller');
    } else {
      navigate(defaultRedirect);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const ok = await login(email, password);
    setLoading(false);
    if (ok) {
      const loggedUser: User | null = JSON.parse(localStorage.getItem('shopmart_user') || 'null');
      toast.success('Welcome back to WoodNest!', {
        description: `Signed in successfully as ${loggedUser?.name || email}`,
      });
      redirectUserByRole(loggedUser, redirect);
    } else {
      setError('Invalid email or password. Click one of the quick demo buttons above.');
    }
  };

  const handleSocialLogin = (provider: string) => {
    toast.info(`Connecting to ${provider}...`, {
      description: 'Signing in with social account',
    });
    setTimeout(async () => {
      const targetEmail = email || demoCredentials[activeRole].email;
      const targetPass = password || demoCredentials[activeRole].pass;
      await login(targetEmail, targetPass);
      const loggedUser: User | null = JSON.parse(localStorage.getItem('shopmart_user') || 'null');
      toast.success(`Successfully logged in via ${provider}!`);
      redirectUserByRole(loggedUser, redirect);
    }, 1000);
  };

  const handleForgotPassword = () => {
    if (!email) {
      toast.error('Please enter your email address first.');
      return;
    }
    toast.success(`Password reset link sent to ${email}`, {
      description: 'Check your inbox for instructions.',
    });
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
            to="/"
            className="text-xs font-semibold text-slate-700 dark:text-blue-300 hover:text-[#2874F0] dark:hover:text-white bg-white dark:bg-white/10 hover:bg-slate-100 dark:hover:bg-white/20 px-3.5 py-2 rounded-full border border-slate-200 dark:border-white/10 transition-all flex items-center gap-1.5 shadow-sm"
          >
            Back to Shop <ArrowRight size={13} />
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-5xl w-full mx-auto grid md:grid-cols-12 gap-0 bg-white dark:bg-slate-900/90 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-auto">
        {/* Left Side: Brand Showcase Panel */}
        <div className="md:col-span-5 bg-gradient-to-br from-[#2874F0] via-blue-700 to-indigo-900 p-8 md:p-10 flex flex-col justify-between relative overflow-hidden text-white">
          <div className="absolute -right-16 -top-16 w-56 h-56 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -left-16 -bottom-16 w-56 h-56 bg-blue-400/20 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10">
            <span className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-md text-blue-100 text-xs font-semibold px-3 py-1 rounded-full border border-white/20 mb-6">
              <Sparkles size={13} className="text-amber-300" /> Premium Handcrafted Furniture
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold leading-tight tracking-tight mb-4">
              Welcome back to your dream space.
            </h2>
            <p className="text-blue-100/90 text-sm leading-relaxed mb-6">
              Access your saved wishlist, track live order status, and enjoy exclusive member-only discounts.
            </p>

            <div className="space-y-3.5 pt-2">
              {[
                '100% FSC Certified Teak & Sheesham Timber',
                'Doorstep Free Assembly Nationwide',
                '10-Year Structural Warranty Protection',
              ].map((text, i) => (
                <div key={i} className="flex items-center gap-3 text-xs font-medium text-blue-50">
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative z-10 pt-8 border-t border-white/15 mt-8">
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                <img className="w-8 h-8 rounded-full ring-2 ring-white object-cover" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80" alt="User" />
                <img className="w-8 h-8 rounded-full ring-2 ring-white object-cover" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80" alt="User" />
                <img className="w-8 h-8 rounded-full ring-2 ring-white object-cover" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80" alt="User" />
              </div>
              <div className="text-xs">
                <div className="font-bold text-white">Join 250,000+ Happy Homeowners</div>
                <div className="text-blue-200/80 text-[11px]">Rated 4.9/5 stars across India</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="md:col-span-7 p-6 md:p-10 flex flex-col justify-center bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-1.5">Sign In to Your Account</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">Choose your account type or enter your credentials below.</p>
          </div>

          {/* Role Selection Tabs */}
          <div className="grid grid-cols-3 gap-2 p-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-xl mb-6 border border-slate-200 dark:border-slate-700/60">
            {(['customer', 'seller', 'admin'] as const).map(role => {
              const info = demoCredentials[role];
              const Icon = info.icon;
              const isSelected = activeRole === role;
              return (
                <button
                  key={role}
                  type="button"
                  onClick={() => handleRoleSelect(role)}
                  className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-lg text-xs font-semibold transition-all ${
                    isSelected
                      ? 'bg-[#2874F0] text-white shadow-md'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-700/50'
                  }`}
                >
                  <Icon size={16} className="mb-1" />
                  <span className="capitalize">{role}</span>
                </button>
              );
            })}
          </div>

          {error && (
            <div className="flex items-center gap-2.5 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-300 rounded-xl p-3.5 mb-5 text-xs">
              <AlertCircle size={16} className="shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="w-full bg-slate-50 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-[#2874F0] focus:ring-2 focus:ring-[#2874F0]/30 transition-all"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Password</label>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-xs text-[#2874F0] hover:underline font-medium"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  placeholder="Enter password"
                  className="w-full bg-slate-50 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-[#2874F0] focus:ring-2 focus:ring-[#2874F0]/30 pr-11 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1"
                >
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs py-1">
              <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-[#2874F0] focus:ring-0 w-4 h-4 cursor-pointer"
                />
                <span>Remember me on this device</span>
              </label>
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
                  <LogIn size={18} /> Sign In to Account
                </>
              )}
            </button>
          </form>

          {/* Social Logins */}
          <div className="mt-6 pt-5 border-t border-slate-200 dark:border-slate-800">
            <div className="text-center text-xs text-slate-500 dark:text-slate-400 mb-3">Or continue with social account</div>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleSocialLogin('Google')}
                className="flex items-center justify-center gap-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-xs font-semibold py-2.5 rounded-xl transition-all text-slate-700 dark:text-slate-200 cursor-pointer"
              >
                <Chrome size={16} className="text-rose-500" /> Google
              </button>
              <button
                type="button"
                onClick={() => handleSocialLogin('Apple')}
                className="flex items-center justify-center gap-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-xs font-semibold py-2.5 rounded-xl transition-all text-slate-700 dark:text-slate-200 cursor-pointer"
              >
                <Apple size={16} className="text-slate-900 dark:text-white" /> Apple ID
              </button>
            </div>
          </div>

          <p className="text-center text-xs text-slate-600 dark:text-slate-400 mt-6">
            Don't have a WoodNest account?{' '}
            <Link to="/signup" className="text-[#2874F0] dark:text-blue-400 font-bold hover:underline">
              Create Free Account
            </Link>
          </p>
        </div>
      </div>

      {/* Footer copyright */}
      <footer className="text-center text-xs text-slate-500 dark:text-slate-400 py-4">
        © 2026 WoodNest Pvt. Ltd. All rights reserved. Safe & Encrypted Login.
      </footer>
    </div>
  );
}
