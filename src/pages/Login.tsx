import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, LogIn, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const redirect = params.get('redirect') || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const ok = await login(email, password);
    setLoading(false);
    if (ok) {
      toast.success('Welcome back!');
      navigate(redirect);
    } else {
      setError('Invalid email or password. Try demo accounts below.');
    }
  };

  const demoLogin = async (role: string) => {
    const creds = { customer: 'customer@demo.com', seller: 'seller@demo.com', admin: 'admin@demo.com' };
    setEmail(creds[role as keyof typeof creds]);
    setPassword('password123');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-md">
        <div className="bg-card rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-[#2874F0] to-blue-600 p-8 text-white">
            <h1 className="text-2xl font-bold mb-1">Welcome Back!</h1>
            <p className="text-blue-100 text-sm">Login to access your ShopMart account</p>
          </div>
          <div className="p-6">
            {error && (
              <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-4 text-sm">
                <AlertCircle size={16} /> {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Email Address</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@example.com"
                  className="w-full border border-border rounded-lg px-3 py-2.5 text-sm bg-background text-foreground outline-none focus:ring-2 focus:ring-[#2874F0]/30 focus:border-[#2874F0]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Password</label>
                <div className="relative">
                  <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required placeholder="Enter your password"
                    className="w-full border border-border rounded-lg px-3 py-2.5 text-sm bg-background text-foreground outline-none focus:ring-2 focus:ring-[#2874F0]/30 focus:border-[#2874F0] pr-10" />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading} className="w-full bg-[#FB641B] hover:bg-[#e55a18] disabled:opacity-60 text-white font-semibold py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors">
                {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <LogIn size={16} />}
                {loading ? 'Signing in...' : 'Login'}
              </button>
            </form>

            <div className="mt-5 p-3 bg-muted rounded-lg">
              <p className="text-xs text-muted-foreground font-medium mb-2">Quick Demo Login:</p>
              <div className="flex gap-2 flex-wrap">
                {['customer', 'seller', 'admin'].map(role => (
                  <button key={role} onClick={() => demoLogin(role)}
                    className="text-xs px-3 py-1.5 rounded border border-[#2874F0] text-[#2874F0] hover:bg-[#2874F0] hover:text-white transition-colors capitalize font-medium">
                    {role}
                  </button>
                ))}
              </div>
            </div>

            <p className="text-center text-sm text-muted-foreground mt-4">
              Don't have an account?{' '}
              <Link to="/signup" className="text-[#2874F0] font-medium hover:underline">Sign up</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
