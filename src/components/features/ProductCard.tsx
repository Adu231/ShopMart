import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingCart, Star, Zap, Eye } from 'lucide-react';
import type { Product } from '@/types';
import { formatPrice } from '@/lib/utils';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import LoginRequiredModal from '@/components/modals/LoginRequiredModal';

interface Props { product: Product; }

export default function ProductCard({ product }: Props) {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const inWishlist = isInWishlist(product.id);

  const handleCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (user?.role === 'admin' || user?.role === 'seller') {
      toast.info(`Purchasing disabled for ${user.role} accounts.`);
      return;
    }
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }
    addToCart(product);
    toast.success('Added to cart!', { description: product.name.slice(0, 40) + '...' });
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (user?.role === 'admin' || user?.role === 'seller') {
      toast.info(`Purchasing disabled for ${user.role} accounts.`);
      return;
    }
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }
    addToCart(product);
    navigate('/cart');
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }
    toggleWishlist(product);
    toast.success(inWishlist ? 'Removed from wishlist' : 'Added to wishlist');
  };

  return (
    <>
      <Link to={`/products/${product.id}`} className="block h-full">
        <div className="bg-card border border-border rounded hover:shadow-lg transition-all duration-300 group flex flex-col h-full overflow-hidden">
          <div className="relative bg-gray-50 dark:bg-gray-800 overflow-hidden">
            <img src={product.images[0]} alt={product.name} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
            {product.discount >= 30 && (
              <span className="absolute top-2 left-2 bg-[#FB641B] text-white text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                <Zap size={9} />{product.discount}% OFF
              </span>
            )}
            {product.isNew && <span className="absolute top-2 right-10 bg-green-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">NEW</span>}
            {(!user || user.role === 'customer') && (
              <button onClick={handleWishlist} className={`absolute top-2 right-2 p-1.5 rounded-full transition-all duration-200 ${inWishlist ? 'bg-red-500 text-white' : 'bg-white/80 dark:bg-gray-700/80 text-gray-500 hover:bg-red-50'}`}>
                <Heart size={14} fill={inWishlist ? 'currentColor' : 'none'} />
              </button>
            )}
            {product.stock <= 5 && product.stock > 0 && (
              <span className="absolute bottom-2 left-2 bg-orange-100 text-orange-700 text-[10px] font-medium px-1.5 py-0.5 rounded">Only {product.stock} left!</span>
            )}
          </div>

          <div className="p-3 flex flex-col flex-1">
            <p className="text-xs text-muted-foreground mb-0.5">{product.brand}</p>
            <h3 className="text-sm font-medium text-foreground line-clamp-2 flex-1 mb-2">{product.name}</h3>
            <div className="flex items-center gap-1.5 mb-2">
              <span className="inline-flex items-center gap-0.5 bg-green-600 text-white text-xs font-bold px-1.5 py-0.5 rounded">
                {product.rating} <Star size={10} fill="currentColor" />
              </span>
              <span className="text-xs text-muted-foreground">({product.reviewCount.toLocaleString()})</span>
            </div>
            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-base font-bold text-foreground">{formatPrice(product.price)}</span>
              <span className="text-xs text-muted-foreground line-through">{formatPrice(product.originalPrice)}</span>
              <span className="text-xs text-green-600 font-medium">{product.discount}% off</span>
            </div>
            {user?.role === 'admin' || user?.role === 'seller' ? (
              <div className="mt-auto">
                <span className="w-full flex items-center justify-center gap-1.5 bg-muted group-hover:bg-[#2874F0] group-hover:text-white text-foreground text-xs font-semibold py-2 rounded transition-colors border border-border">
                  <Eye size={13} /> View Details
                </span>
              </div>
            ) : (
              <div className="flex gap-2 mt-auto">
                <button onClick={handleCart} className="flex-1 flex items-center justify-center gap-1.5 bg-[#FF9F00] hover:bg-[#f09000] text-white text-xs font-semibold py-2 rounded transition-colors">
                  <ShoppingCart size={13} /> Add to Cart
                </button>
                <button onClick={handleBuyNow} className="flex-1 flex items-center justify-center gap-1 bg-[#FB641B] hover:bg-[#e55a18] text-white text-xs font-semibold py-2 rounded transition-colors cursor-pointer">
                  Buy Now
                </button>
              </div>
            )}
          </div>
        </div>
      </Link>

      <LoginRequiredModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        actionText="buy products"
        redirectUrl={`/products/${product.id}`}
      />
    </>
  );
}
