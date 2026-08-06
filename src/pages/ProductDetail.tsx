import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingCart, Zap, Star, Truck, RefreshCcw, Shield, ChevronRight, Minus, Plus } from 'lucide-react';
import { PRODUCTS } from '@/constants/data';
import { formatPrice } from '@/lib/utils';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import ProductCard from '@/components/features/ProductCard';
import { toast } from 'sonner';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const product = PRODUCTS.find(p => p.id === id);
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [selectedImg, setSelectedImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState('specs');

  if (!product) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
      <p className="text-lg text-muted-foreground">Product not found</p>
      <Link to="/products" className="text-[#2874F0] hover:underline">Back to Products</Link>
    </div>
  );

  const inWishlist = isInWishlist(product.id);
  const related = PRODUCTS.filter(p => p.category === product.category && p.id !== product.id).slice(0, 5);

  const handleAddToCart = () => { addToCart(product, qty); toast.success(`Added ${qty} item(s) to cart!`); };
  const handleBuyNow = () => { addToCart(product, qty); navigate('/cart'); };

  return (
    <div className="bg-background min-h-screen">
      <div className="max-w-7xl mx-auto px-3 md:px-4 py-4">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-4 flex-wrap">
          <Link to="/" className="hover:text-[#2874F0]">Home</Link>
          <ChevronRight size={12} />
          <Link to={`/products?category=${encodeURIComponent(product.category)}`} className="hover:text-[#2874F0]">{product.category}</Link>
          <ChevronRight size={12} />
          <span className="text-foreground line-clamp-1">{product.name}</span>
        </div>

        <div className="bg-card rounded shadow-sm p-4 md:p-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6 md:gap-8">
            {/* Images */}
            <div className="lg:col-span-2">
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg overflow-hidden mb-3 aspect-square">
                <img src={product.images[selectedImg]} alt={product.name} className="w-full h-full object-contain p-4" />
              </div>
              <div className="flex gap-2">
                {product.images.map((img, i) => (
                  <button key={i} onClick={() => setSelectedImg(i)} className={`w-16 h-16 rounded border-2 overflow-hidden flex-shrink-0 ${i === selectedImg ? 'border-[#2874F0]' : 'border-border'}`}>
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Info */}
            <div className="lg:col-span-3">
              <p className="text-sm text-[#2874F0] font-medium mb-1">{product.brand}</p>
              <h1 className="text-xl md:text-2xl font-bold text-foreground mb-3">{product.name}</h1>
              <div className="flex items-center gap-3 mb-4">
                <span className="inline-flex items-center gap-1 bg-green-600 text-white text-sm font-bold px-2 py-0.5 rounded">
                  {product.rating} <Star size={12} fill="currentColor" />
                </span>
                <span className="text-sm text-muted-foreground">{product.reviewCount.toLocaleString()} ratings</span>
                {product.isBestSeller && <span className="bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 text-xs px-2 py-0.5 rounded font-medium">Best Seller</span>}
              </div>

              <div className="border-t border-border pt-4 mb-4">
                <div className="flex items-baseline gap-3 mb-1">
                  <span className="text-3xl font-bold text-foreground">{formatPrice(product.price)}</span>
                  <span className="text-base text-muted-foreground line-through">{formatPrice(product.originalPrice)}</span>
                  <span className="text-base font-semibold text-green-600">{product.discount}% off</span>
                </div>
                <p className="text-sm text-green-600 font-medium">You save {formatPrice(product.originalPrice - product.price)}</p>
              </div>

              {/* Qty */}
              <div className="flex items-center gap-4 mb-5">
                <span className="text-sm font-medium text-foreground">Quantity:</span>
                <div className="flex items-center border border-border rounded-lg overflow-hidden">
                  <button onClick={() => setQty(q => Math.max(1, q - 1))} className="px-3 py-2 hover:bg-muted transition-colors"><Minus size={14} /></button>
                  <span className="px-4 py-2 text-sm font-semibold border-x border-border">{qty}</span>
                  <button onClick={() => setQty(q => Math.min(product.stock, q + 1))} className="px-3 py-2 hover:bg-muted transition-colors"><Plus size={14} /></button>
                </div>
                {product.stock <= 10 && <span className="text-xs text-orange-600 font-medium">Only {product.stock} left!</span>}
              </div>

              {/* Actions */}
              <div className="flex gap-3 mb-5">
                <button onClick={handleAddToCart} className="flex-1 flex items-center justify-center gap-2 bg-[#FF9F00] hover:bg-[#f09000] text-white font-bold py-3 rounded-lg transition-colors">
                  <ShoppingCart size={18} /> Add to Cart
                </button>
                <button onClick={handleBuyNow} className="flex-1 flex items-center justify-center gap-2 bg-[#FB641B] hover:bg-[#e55a18] text-white font-bold py-3 rounded-lg transition-colors">
                  <Zap size={18} /> Buy Now
                </button>
                <button onClick={() => toggleWishlist(product)} className={`border-2 p-3 rounded-lg transition-all ${inWishlist ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-500' : 'border-border hover:border-red-300 text-muted-foreground'}`}>
                  <Heart size={18} fill={inWishlist ? 'currentColor' : 'none'} />
                </button>
              </div>

              {/* Delivery info */}
              <div className="bg-muted rounded-lg p-4 space-y-3">
                {[
                  { icon: Truck, title: 'Free Delivery', sub: 'On orders above ₹499 · Arrives in 2-4 days' },
                  { icon: RefreshCcw, title: '7-Day Returns', sub: 'Easy hassle-free returns & exchanges' },
                  { icon: Shield, title: 'Genuine Product', sub: '100% authentic, verified by ShopMart' },
                ].map(({ icon: Icon, title, sub }) => (
                  <div key={title} className="flex items-center gap-3">
                    <Icon size={18} className="text-[#2874F0] flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-foreground">{title}</p>
                      <p className="text-xs text-muted-foreground">{sub}</p>
                    </div>
                  </div>
                ))}
              </div>

              <p className="text-xs text-muted-foreground mt-3">Sold by: <span className="text-foreground font-medium">{product.seller}</span></p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-card rounded shadow-sm mt-4 overflow-hidden">
          <div className="flex border-b border-border">
            {['specs', 'desc'].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`px-6 py-3.5 text-sm font-semibold transition-colors border-b-2 ${activeTab === tab ? 'text-[#2874F0] border-[#2874F0]' : 'text-muted-foreground border-transparent hover:text-foreground'}`}>
                {tab === 'specs' ? 'Specifications' : 'Description'}
              </button>
            ))}
          </div>
          <div className="p-5">
            {activeTab === 'specs' ? (
              <table className="w-full text-sm">
                <tbody className="divide-y divide-border">
                  {Object.entries(product.specifications).map(([k, v]) => (
                    <tr key={k}>
                      <td className="py-2.5 pr-4 text-muted-foreground w-36 font-medium">{k}</td>
                      <td className="py-2.5 text-foreground">{v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-sm text-foreground/80 leading-relaxed">{product.description}</p>
            )}
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div className="bg-card rounded shadow-sm mt-4 p-4 md:p-5">
            <h2 className="text-lg font-bold text-foreground mb-4">Similar Products</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {related.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
