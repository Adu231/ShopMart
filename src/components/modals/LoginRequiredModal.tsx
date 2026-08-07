import { useNavigate } from 'react-router-dom';
import { LogIn, UserPlus, X, ShoppingBag } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  redirectUrl?: string;
  actionText?: string;
}

export default function LoginRequiredModal({ isOpen, onClose, redirectUrl = '/login', actionText = 'purchase products' }: Props) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2 text-foreground font-extrabold text-base">
            <div className="w-8 h-8 rounded-full bg-[#2874F0]/10 text-[#2874F0] flex items-center justify-center">
              <ShoppingBag size={18} />
            </div>
            Sign In Required
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground cursor-pointer p-1">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-3 text-center py-2">
          <div className="w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-950/40 text-[#2874F0] mx-auto flex items-center justify-center border border-blue-200 dark:border-blue-800 shadow-sm">
            <LogIn size={28} />
          </div>
          <h3 className="font-extrabold text-lg text-foreground">Please Sign In First</h3>
          <p className="text-xs text-muted-foreground leading-relaxed max-w-xs mx-auto">
            You need to be logged in to your customer account to {actionText}, add items to your cart, or place orders.
          </p>
        </div>

        <div className="space-y-2.5 pt-2">
          <button
            onClick={() => {
              onClose();
              navigate(`/login?redirect=${encodeURIComponent(redirectUrl)}`);
            }}
            className="w-full bg-[#2874F0] hover:bg-blue-600 text-white font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
          >
            <LogIn size={15} /> Log In to Customer Account
          </button>

          <button
            onClick={() => {
              onClose();
              navigate('/signup');
            }}
            className="w-full bg-muted hover:bg-muted/80 text-foreground font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer border border-border"
          >
            <UserPlus size={15} /> Create New Account
          </button>

          <button
            onClick={onClose}
            className="w-full text-xs font-semibold text-muted-foreground hover:text-foreground py-1 transition-colors cursor-pointer text-center"
          >
            Continue Browsing Store
          </button>
        </div>
      </div>
    </div>
  );
}
