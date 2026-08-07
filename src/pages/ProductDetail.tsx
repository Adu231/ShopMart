import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingCart, Zap, Star, Truck, RefreshCcw, Shield, ChevronRight, Minus, Plus, Store, CheckCircle2, ThumbsUp, PenSquare, MessageSquare, User, X } from 'lucide-react';
import { PRODUCTS } from '@/constants/data';
import { formatPrice } from '@/lib/utils';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useAuth } from '@/context/AuthContext';
import ProductCard from '@/components/features/ProductCard';
import { toast } from 'sonner';
import LoginRequiredModal from '@/components/modals/LoginRequiredModal';
import { api } from '@/services/api';

const INITIAL_PRODUCT_REVIEWS = [
  {
    id: 'rev-p1',
    author: 'Priya Sharma',
    date: '15 Jul 2026',
    rating: 5,
    verified: true,
    title: 'Exquisite Teak Wood Finish & Superior Build!',
    comment: 'The solid teak wood sectional dining furniture piece is absolutely stunning! The timber quality is premium, rich polish finish, and the doorstep installation team was professional. Highly recommended!',
    helpfulCount: 18,
    voted: false,
  },
  {
    id: 'rev-p2',
    author: 'Rahul Verma',
    date: '08 Jul 2026',
    rating: 4,
    verified: true,
    title: 'Sturdy Build Quality & Smooth Polish',
    comment: 'Bought this handcrafted teak wood piece for our living room. Build quality is top-notch, sturdy, and heavy-duty timber. Provides great aesthetic value. Highly recommend WoodNest!',
    helpfulCount: 9,
    voted: false,
  },
  {
    id: 'rev-p3',
    author: 'Anjali Patel',
    date: '20 Jul 2026',
    rating: 5,
    verified: true,
    title: 'Masterpiece Furniture - Natural Timber Grain',
    comment: 'The wood grain patterns on this product are breathtaking. Each piece feels truly handcrafted with passion. Sturdy, beautiful, and every guest compliments it when visiting!',
    helpfulCount: 24,
    voted: false,
  },
  {
    id: 'rev-p4',
    author: 'Vikram Singh',
    date: '25 Jul 2026',
    rating: 5,
    verified: true,
    title: 'Top Notch Premium Wood - Worth Every Rupee',
    comment: 'Ordered this item for our home setup - incredible build stability and protective polish coating. Best furniture investment of the year!',
    helpfulCount: 9,
    voted: false,
  },
];

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { user, isAuthenticated } = useAuth();
  const [selectedImg, setSelectedImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Amazon-Style Customer Reviews State
  const [reviews, setReviews] = useState(INITIAL_PRODUCT_REVIEWS);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [newReview, setNewReview] = useState({
    author: '',
    rating: 5,
    title: '',
    comment: '',
  });

  const [backendProduct, setBackendProduct] = useState<any>(null);

  useEffect(() => {
    if (id) {
      api.products.getById(id).then(res => {
        if (res && res.success && res.product) {
          setBackendProduct(res.product);
        }
      });
    }
  }, [id]);

  // Dynamic Product Resolution (Searches static PRODUCTS, localStorage, or constructs dynamic fallback)
  const getProduct = () => {
    if (backendProduct) return backendProduct;
    if (!id) return PRODUCTS[0];
    const staticFound = PRODUCTS.find(p => p.id === id);
    if (staticFound) return staticFound;

    try {
      const customProds = JSON.parse(localStorage.getItem('shopmart_custom_products') || '[]');
      const customFound = customProds.find((p: any) => p.id === id);
      if (customFound) return customFound;
    } catch (e) {
      console.error(e);
    }

    // Dynamic Fallback Product for custom/seller items
    return {
      id: id,
      name: 'Handcrafted Solid Teak Furniture Listing',
      category: 'Living Room',
      price: 24999,
      originalPrice: 29999,
      rating: 4.9,
      reviewsCount: 24,
      discount: 16,
      images: [
        'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=800&q=80',
      ],
      description: 'Exquisite handcrafted solid wood furniture piece crafted with kiln-dried teak timber and protective polish coating.',
      seller: 'Samsung Electronics / WoodNest Official Store',
      stock: 15,
      specs: {
        Material: 'Solid Teak Wood',
        Finish: 'High Gloss Protective Polish',
        Assembly: 'Pre-assembled / Free Assembly Included',
        Warranty: '3 Years WoodNest Timber Warranty',
      }
    };
  };

  const product = getProduct();

  if (!product) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <p className="text-lg text-muted-foreground font-bold">Product not found</p>
        <Link to="/products" className="text-[#2874F0] hover:underline font-bold text-xs">Back to All Products</Link>
      </div>
    );
  }

  const inWishlist = isInWishlist(product.id);
  const related = PRODUCTS.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4);

  const handleAddToCart = () => {
    if (user?.role === 'admin' || user?.role === 'seller') {
      toast.info(`Purchasing is disabled for ${user.role} accounts. Ordering is only available for Customer accounts.`);
      return;
    }
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }
    addToCart(product as any, qty);
    toast.success(`Added ${qty} item(s) to cart!`);
  };

  const handleBuyNow = () => {
    if (user?.role === 'admin' || user?.role === 'seller') {
      toast.info(`Purchasing is disabled for ${user.role} accounts. Ordering is only available for Customer accounts.`);
      return;
    }
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }
    addToCart(product as any, qty);
    navigate('/cart');
  };

  const handleToggleHelpful = (reviewId: string) => {
    setReviews(prev => prev.map(r => {
      if (r.id === reviewId) {
        const nextVoted = !r.voted;
        return {
          ...r,
          voted: nextVoted,
          helpfulCount: nextVoted ? r.helpfulCount + 1 : r.helpfulCount - 1,
        };
      }
      return r;
    }));
  };

  const handleAddReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReview.author.trim() || !newReview.comment.trim()) {
      toast.error('Please enter your name and review comments.');
      return;
    }

    const createdReview = {
      id: `rev-${Date.now()}`,
      author: newReview.author.trim(),
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      rating: Number(newReview.rating) || 5,
      verified: true,
      title: newReview.title.trim() || 'Verified Customer Review',
      comment: newReview.comment.trim(),
      helpfulCount: 0,
      voted: false,
    };

    setReviews(prev => [createdReview, ...prev]);
    toast.success('Thank you! Your customer review has been posted successfully.');
    setShowReviewModal(false);
    setNewReview({ author: '', rating: 5, title: '', comment: '' });
  };

  return (
    <div className="bg-background min-h-screen py-4">
      <div className="max-w-7xl mx-auto px-3 md:px-4">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-4 flex-wrap">
          <Link to="/" className="hover:text-[#2874F0]">Home</Link>
          <ChevronRight size={12} />
          <Link to={`/products?category=${encodeURIComponent(product.category)}`} className="hover:text-[#2874F0]">{product.category}</Link>
          <ChevronRight size={12} />
          <span className="text-foreground line-clamp-1 font-bold">{product.name}</span>
        </div>

        {/* Product Purchase Hero Card */}
        <div className="bg-card rounded-2xl border border-border shadow-sm p-4 md:p-6 mb-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6 md:gap-8">
            {/* Images */}
            <div className="lg:col-span-2 space-y-3">
              <div className="bg-muted rounded-2xl overflow-hidden aspect-square border border-border relative">
                <img src={product.images[selectedImg] || product.images[0]} alt={product.name} className="w-full h-full object-cover p-2" />
                {product.discount && (
                  <span className="absolute top-3 left-3 bg-rose-500 text-white font-black text-xs px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
                    {product.discount}% OFF
                  </span>
                )}
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImg(i)}
                    className={`w-16 h-16 rounded-xl border-2 overflow-hidden flex-shrink-0 cursor-pointer transition-all ${i === selectedImg ? 'border-[#2874F0] ring-2 ring-[#2874F0]/30' : 'border-border opacity-70 hover:opacity-100'}`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Details */}
            <div className="lg:col-span-3 space-y-4 text-xs">
              <div>
                <span className="text-[10px] bg-blue-100 dark:bg-blue-950/40 text-[#2874F0] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  {product.category}
                </span>
                <h1 className="text-xl md:text-2xl font-black text-foreground mt-2 leading-tight">{product.name}</h1>
                <p className="text-muted-foreground text-xs mt-1 flex items-center gap-1.5">
                  <Store size={14} className="text-[#2874F0]" /> Seller: <strong className="text-foreground">{product.seller || 'WoodNest Hub'}</strong>
                </p>
              </div>

              {/* Rating Header */}
              <div className="flex items-center gap-2">
                <a href="#customer-reviews" className="flex items-center gap-1.5 hover:underline">
                  <span className="bg-emerald-600 text-white font-bold text-xs px-2 py-0.5 rounded flex items-center gap-1">
                    {product.rating} <Star size={11} className="fill-white" />
                  </span>
                  <span className="text-muted-foreground font-semibold">({reviews.length} customer ratings)</span>
                </a>
              </div>

              {/* Price Card */}
              <div className="bg-muted/40 p-4 rounded-xl border border-border space-y-1">
                <div className="flex items-baseline gap-3">
                  <span className="text-2xl font-black text-foreground">{formatPrice(product.price)}</span>
                  {product.originalPrice && (
                    <span className="text-sm text-muted-foreground line-through">{formatPrice(product.originalPrice)}</span>
                  )}
                  {product.discount && (
                    <span className="text-xs font-bold text-emerald-600">Save {product.discount}%</span>
                  )}
                </div>
                <p className="text-[10px] text-muted-foreground">Inclusive of all taxes · Free Doorstep Freight Delivery</p>
              </div>

              {/* Quantity & Buy Buttons */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-foreground">Quantity:</span>
                  <div className="inline-flex items-center border border-border rounded-xl bg-background">
                    <button onClick={() => setQty(Math.max(1, qty - 1))} className="p-2 hover:bg-muted font-bold cursor-pointer">
                      <Minus size={14} />
                    </button>
                    <span className="px-4 font-bold text-sm text-foreground">{qty}</span>
                    <button onClick={() => setQty(qty + 1)} className="p-2 hover:bg-muted font-bold cursor-pointer">
                      <Plus size={14} />
                    </button>
                  </div>
                </div>

                {user?.role === 'admin' || user?.role === 'seller' ? (
                  <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 p-4 rounded-xl space-y-1">
                    <p className="font-bold text-blue-900 dark:text-blue-200 text-xs flex items-center gap-1.5">
                      <Shield size={16} className="text-[#2874F0]" /> Storefront View Mode ({user.role === 'admin' ? 'Super Admin' : 'Seller'})
                    </p>
                    <p className="text-[11px] text-blue-700 dark:text-blue-300">
                      Product ordering features (Add to Cart & Buy Now) and Customer Order History are restricted to Customer accounts only.
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-3 pt-1">
                    <button
                      onClick={handleAddToCart}
                      className="flex-1 bg-[#2874F0] hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md text-sm"
                    >
                      <ShoppingCart size={16} /> Add to Cart
                    </button>
                    <button
                      onClick={handleBuyNow}
                      className="flex-1 bg-[#FB641B] hover:bg-[#e55a18] text-white font-extrabold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md text-sm"
                    >
                      <Zap size={16} /> Buy Now
                    </button>
                    <button
                      onClick={() => { toggleWishlist(product as any); toast.success(inWishlist ? 'Removed from Wishlist' : 'Saved to Wishlist!'); }}
                      className={`p-3 border border-border rounded-xl transition-colors cursor-pointer ${inWishlist ? 'bg-rose-50 text-rose-600 border-rose-200' : 'bg-background hover:bg-muted text-muted-foreground'}`}
                      title="Toggle Wishlist"
                    >
                      <Heart size={20} className={inWishlist ? 'fill-rose-600 text-rose-600' : ''} />
                    </button>
                  </div>
                )}
              </div>

              {/* Guarantees */}
              <div className="grid grid-cols-3 gap-2 pt-3 border-t border-border text-[11px]">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Truck size={16} className="text-[#2874F0] shrink-0" />
                  <span>Free Express Delivery</span>
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <RefreshCcw size={16} className="text-[#2874F0] shrink-0" />
                  <span>7 Days Replacement</span>
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Shield size={16} className="text-[#2874F0] shrink-0" />
                  <span>WoodNest Quality Certified</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Specifications & Description */}
        <div className="bg-card rounded-2xl border border-border shadow-sm p-6 mb-8 text-xs space-y-4">
          <h3 className="font-extrabold text-sm text-foreground uppercase tracking-wider border-b border-border pb-2">
            Product Specifications & Material Details
          </h3>
          <p className="text-muted-foreground leading-relaxed">{product.description}</p>

          <div className="grid sm:grid-cols-2 gap-3 pt-2">
            {Object.entries(product.specs || {}).map(([k, v]) => (
              <div key={k} className="flex justify-between p-2.5 bg-muted/30 rounded-xl border border-border">
                <span className="text-muted-foreground font-semibold">{k}</span>
                <span className="font-bold text-foreground">{v as string}</span>
              </div>
            ))}
          </div>
        </div>

        {/* AMAZON-STYLE CUSTOMER REVIEWS & RATINGS SECTION */}
        <div id="customer-reviews" className="bg-card rounded-2xl border border-border shadow-sm p-6 mb-8 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4">
            <div>
              <h2 className="text-lg font-black text-foreground flex items-center gap-2">
                <MessageSquare className="text-[#2874F0]" size={20} /> Customer Reviews & Ratings
              </h2>
              <p className="text-xs text-muted-foreground">Verified purchaser ratings, customer reviews, and feedback for this product</p>
            </div>

            <button
              onClick={() => setShowReviewModal(true)}
              className="bg-[#2874F0] hover:bg-blue-600 text-white font-extrabold px-5 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-md cursor-pointer transition-all shrink-0"
            >
              <PenSquare size={15} /> Write a Customer Review
            </button>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column: Amazon-Style Ratings Summary */}
            <div className="space-y-4 text-xs bg-muted/30 p-5 rounded-2xl border border-border h-fit">
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-foreground">4.8</span>
                  <span className="text-sm font-bold text-muted-foreground">out of 5</span>
                </div>
                <div className="flex items-center gap-1 text-amber-500 mt-1">
                  {[1, 2, 3, 4, 5].map(star => (
                    <Star key={star} size={16} className="fill-amber-500" />
                  ))}
                </div>
                <p className="text-[11px] text-muted-foreground mt-1 font-semibold">{reviews.length} verified global customer ratings</p>
              </div>

              {/* Rating Bars Breakdown */}
              <div className="space-y-2 pt-2 border-t border-border">
                {[
                  { star: 5, percent: 78 },
                  { star: 4, percent: 15 },
                  { star: 3, percent: 5 },
                  { star: 2, percent: 1 },
                  { star: 1, percent: 1 },
                ].map(({ star, percent }) => (
                  <div key={star} className="flex items-center gap-3">
                    <span className="w-12 font-bold text-foreground hover:underline cursor-pointer">{star} star</span>
                    <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden border border-border">
                      <div style={{ width: `${percent}%` }} className="h-full bg-amber-500 rounded-full" />
                    </div>
                    <span className="w-10 text-right font-bold text-muted-foreground">{percent}%</span>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-border space-y-2">
                <p className="font-extrabold text-foreground text-xs">Review this product</p>
                <p className="text-muted-foreground text-[11px]">Share your experience with other customers</p>
                <button
                  onClick={() => setShowReviewModal(true)}
                  className="w-full bg-background hover:bg-muted text-foreground font-bold py-2 rounded-xl border border-border transition-colors cursor-pointer"
                >
                  Write a Product Review
                </button>
              </div>
            </div>

            {/* Right Column: Customer Reviews Feed */}
            <div className="lg:col-span-2 space-y-4 divide-y divide-border">
              {reviews.map(rev => (
                <div key={rev.id} className="pt-4 first:pt-0 space-y-2.5 text-xs">
                  {/* Reviewer Header */}
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-[#2874F0] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                      {rev.author.charAt(0)}
                    </div>
                    <div>
                      <p className="font-extrabold text-foreground text-sm">{rev.author}</p>
                      <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                        <CheckCircle2 size={11} /> Verified Purchase
                      </span>
                    </div>
                  </div>

                  {/* Rating & Date */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center text-amber-500">
                      {[1, 2, 3, 4, 5].map(s => (
                        <Star key={s} size={13} className={s <= rev.rating ? 'fill-amber-500' : 'text-muted-foreground'} />
                      ))}
                    </div>
                    <span className="font-extrabold text-foreground text-xs">{rev.title}</span>
                    <span className="text-[10px] text-muted-foreground ml-auto">{rev.date}</span>
                  </div>

                  {/* Review Comment */}
                  <p className="text-muted-foreground leading-relaxed text-xs">{rev.comment}</p>

                  {/* Helpful Button */}
                  <div className="flex items-center gap-3 pt-1">
                    <button
                      onClick={() => handleToggleHelpful(rev.id)}
                      className={`px-3 py-1 rounded-lg border font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                        rev.voted ? 'bg-blue-50 dark:bg-blue-950/40 border-[#2874F0] text-[#2874F0]' : 'bg-background hover:bg-muted border-border text-muted-foreground'
                      }`}
                    >
                      <ThumbsUp size={13} /> Helpful ({rev.helpfulCount})
                    </button>
                    <span className="text-[10px] text-muted-foreground">Report review</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Related Products Carousel */}
        {related.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-black text-foreground">Customers Also Viewed</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {related.map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* WRITE A CUSTOMER REVIEW MODAL */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-extrabold text-base text-foreground flex items-center gap-2">
                <PenSquare className="text-[#2874F0]" size={18} /> Write a Verified Product Review
              </h3>
              <button onClick={() => setShowReviewModal(false)} className="text-muted-foreground hover:text-foreground cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddReviewSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-foreground mb-1">Overall Rating</label>
                <div className="flex items-center gap-1 text-amber-500 cursor-pointer">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewReview({ ...newReview, rating: star })}
                      className="p-1 hover:scale-125 transition-transform"
                    >
                      <Star size={24} className={star <= newReview.rating ? 'fill-amber-500' : 'text-muted-foreground'} />
                    </button>
                  ))}
                  <span className="font-extrabold text-foreground ml-2 text-sm">{newReview.rating} Stars</span>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-foreground mb-1">Your Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Priya Sharma"
                  value={newReview.author}
                  onChange={e => setNewReview({ ...newReview, author: e.target.value })}
                  className="w-full bg-background border border-border rounded-xl p-2.5 font-medium text-foreground outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-foreground mb-1">Review Headline Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Magnificent Teak Wood Finish & Sturdy Build"
                  value={newReview.title}
                  onChange={e => setNewReview({ ...newReview, title: e.target.value })}
                  className="w-full bg-background border border-border rounded-xl p-2.5 font-bold text-foreground outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-foreground mb-1">Written Review Comments</label>
                <textarea
                  required
                  rows={4}
                  placeholder="What did you like or dislike? How is the wood polish quality and doorstep installation?"
                  value={newReview.comment}
                  onChange={e => setNewReview({ ...newReview, comment: e.target.value })}
                  className="w-full bg-background border border-border rounded-xl p-3 text-foreground outline-none leading-relaxed"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  className="flex-1 bg-muted text-foreground font-semibold py-2.5 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#2874F0] hover:bg-blue-600 text-white font-extrabold py-2.5 rounded-xl transition-colors shadow-md cursor-pointer"
                >
                  Submit Customer Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <LoginRequiredModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        actionText="buy products"
        redirectUrl={`/products/${product.id}`}
      />
    </div>
  );
}
