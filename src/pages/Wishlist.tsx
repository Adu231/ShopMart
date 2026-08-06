import { Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import { useWishlist } from '@/context/WishlistContext';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { formatPrice } from '@/lib/utils';
import { toast } from 'sonner';
import { useEffect } from 'react';
import CustomerLayout from '@/components/layout/CustomerLayout';

export default function Wishlist() {
  const { wishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) navigate('/login?redirect=/wishlist');
  }, [isAuthenticated]);

  if (!isAuthenticated) return null;

  const moveToCart = (product: (typeof wishlist)[0]) => {
    addToCart(product);
    toggleWishlist(product);
    toast.success('Moved to cart!');
  };

  return (
    <CustomerLayout title={`My Wishlist (${wishlist.length})`} showBackToDashboard>
      {wishlist.length === 0 ? (
        <div className="bg-card rounded-xl p-14 flex flex-col items-center border border-border">
          <Heart size={64} className="text-muted-foreground mb-4" strokeWidth={1} />
          <p className="font-bold text-foreground text-lg mb-1">Your Wishlist is Empty</p>
          <p className="text-sm text-muted-foreground mb-5 text-center">Save items you love to your wishlist and shop later</p>
          <Link
            to="/products"
            className="bg-[#2874F0] hover:bg-[#1D5FD1] text-white px-8 py-2.5 rounded-lg font-semibold transition-colors"
          >
            Explore Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {wishlist.map(product => (
            <div key={product.id} className="bg-card rounded-xl border border-border hover:shadow-md transition-all group overflow-hidden flex flex-col">
              <Link to={`/products/${product.id}`} className="block flex-1">
                <div className="relative bg-gray-50 dark:bg-gray-800 overflow-hidden aspect-square">
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {product.discount >= 20 && (
                    <span className="absolute top-2 left-2 bg-[#FB641B] text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                      {product.discount}% OFF
                    </span>
                  )}
                  <button
                    onClick={e => {
                      e.preventDefault();
                      toggleWishlist(product);
                      toast.success('Removed from wishlist');
                    }}
                    className="absolute top-2 right-2 bg-white/80 dark:bg-gray-700/80 p-1.5 rounded-full text-red-400 hover:bg-red-500 hover:text-white transition-all shadow-sm"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
                <div className="p-3">
                  <p className="text-[11px] text-muted-foreground mb-0.5">{product.brand}</p>
                  <p className="text-sm font-medium text-foreground line-clamp-2 mb-2">{product.name}</p>
                  <div className="flex items-baseline gap-1.5 flex-wrap">
                    <span className="font-bold text-sm text-foreground">{formatPrice(product.price)}</span>
                    <span className="text-xs text-muted-foreground line-through">{formatPrice(product.originalPrice)}</span>
                    <span className="text-xs text-green-600 font-medium">{product.discount}% off</span>
                  </div>
                </div>
              </Link>
              <div className="px-3 pb-3 mt-auto">
                <button
                  onClick={() => moveToCart(product)}
                  className="w-full flex items-center justify-center gap-1.5 bg-[#FF9F00] hover:bg-[#f09000] text-white text-xs font-semibold py-2.5 rounded-lg transition-colors"
                >
                  <ShoppingCart size={13} /> Move to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </CustomerLayout>
  );
}
