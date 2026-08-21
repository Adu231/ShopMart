import { useState } from 'react';
import { Mail, ArrowRight, Check } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';

export default function Newsletter() {
  const { user } = useAuth();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  // Hide Newsletter banner when Admin is logged in
  if (user?.role === 'admin') {
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@')) {
      toast.error('Please enter a valid email');
      return;
    }
    setSubscribed(true);
    toast.success('Successfully subscribed!', { description: 'Get exclusive deals in your inbox.' });
    setEmail('');
  };

  return (
    <section className="bg-gradient-to-r from-[#2874F0] to-blue-700 rounded-2xl shadow-sm p-6 md:p-8 text-white">
      <div className="max-w-2xl mx-auto text-center">
        <Mail size={36} className="mx-auto mb-3 opacity-90" />
        <h2 className="text-xl md:text-2xl font-bold mb-2">Get Exclusive Deals in Your Inbox</h2>
        <p className="text-blue-100 text-sm mb-5">Subscribe for flash sale alerts, new arrivals, and member-only discounts.</p>
        {subscribed ? (
          <div className="flex items-center justify-center gap-2 bg-white/20 rounded-full px-6 py-3">
            <Check size={18} className="text-green-300" />
            <span className="font-medium">You're subscribed!</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="flex-1 px-4 py-2.5 rounded-lg text-gray-800 text-sm outline-none focus:ring-2 focus:ring-white/50"
              required
            />
            <button type="submit" className="flex items-center justify-center gap-2 bg-[#FB641B] hover:bg-[#e55a18] px-5 py-2.5 rounded-lg font-semibold text-sm transition-all hover:scale-105 whitespace-nowrap cursor-pointer">
              Subscribe <ArrowRight size={15} />
            </button>
          </form>
        )}
        <p className="text-xs text-blue-200 mt-3 opacity-80">No spam. Unsubscribe at any time.</p>
      </div>
    </section>
  );
}
