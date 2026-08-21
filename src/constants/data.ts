import type { Product, Category, Review, Coupon, Banner } from '@/types';

export const BANNERS: Banner[] = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1200&q=80',
    title: 'Grand Living Room Sale',
    subtitle: 'Up to 60% off on Sofas, Sectionals & Accent Chairs',
    cta: 'Shop Sofas',
    link: '/products?category=Sofa%20%26%20Seating',
    bgColor: 'from-stone-900 via-stone-800 to-amber-900',
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=1200&q=80',
    title: 'Bedroom Makeover Collection',
    subtitle: 'Premium Beds, Mattresses & Wardrobes — Starting ₹12,999',
    cta: 'Shop Bedroom',
    link: '/products?category=Bedroom',
    bgColor: 'from-slate-900 via-gray-800 to-slate-700',
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=1200&q=80',
    title: 'Home Office Essentials',
    subtitle: 'Ergonomic Desks, Chairs & Storage for Peak Productivity',
    cta: 'Shop Office',
    link: '/products?category=Home%20Office',
    bgColor: 'from-blue-950 via-blue-900 to-indigo-900',
  },
  {
    id: 4,
    image: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=1200&q=80',
    title: 'Outdoor & Patio Sale',
    subtitle: 'Garden Furniture, Swings & Patio Sets — Up to 45% Off',
    cta: 'Explore Outdoor',
    link: '/products?category=Outdoor',
    bgColor: 'from-green-950 via-emerald-900 to-teal-900',
  },
];

export const CATEGORIES: Category[] = [
  { id: '1', name: 'Sofa & Seating', image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=200&q=80', color: 'bg-amber-50 dark:bg-amber-950' },
  { id: '2', name: 'Bedroom', image: 'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=200&q=80', color: 'bg-blue-50 dark:bg-blue-950' },
  { id: '3', name: 'Dining Room', image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=200&q=80', color: 'bg-orange-50 dark:bg-orange-950' },
  { id: '4', name: 'Home Office', image: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=200&q=80', color: 'bg-slate-50 dark:bg-slate-950' },
  { id: '5', name: 'Outdoor', image: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=200&q=80', color: 'bg-green-50 dark:bg-green-950' },
  { id: '6', name: 'Storage', image: 'https://images.unsplash.com/photo-1558981285-6f0c94958bb6?w=200&q=80', color: 'bg-purple-50 dark:bg-purple-950' },
  { id: '7', name: 'Lighting', image: 'https://images.unsplash.com/photo-1513506003901-1e6a35049745?w=200&q=80', color: 'bg-yellow-50 dark:bg-yellow-950' },
  { id: '8', name: 'Home Decor', image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=200&q=80', color: 'bg-rose-50 dark:bg-rose-950' },
];

export const BRAND_NAMES = [
  'Urban Ladder', 'Pepperfry', 'Nilkamal', 'Godrej Interio',
  'Durian', 'IKEA', 'Wooden Street', 'Wakefit',
  'HomeTown', 'Fabindia', 'Sleepyhead', 'Featherlite',
];

export const PRODUCTS: Product[] = [];

export const HOME_REVIEWS: Review[] = [
  {
    id: 'r1',
    userName: 'Priya Sharma',
    rating: 5,
    comment: 'The L-shape sectional sofa is absolutely stunning! The quality is premium and the delivery + assembly team were professional. My living room now looks like a showroom. Totally worth it!',
    date: '2026-07-15',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&q=80',
  },
  {
    id: 'r2',
    userName: 'Rahul Verma',
    rating: 4,
    comment: 'Bought the King Storage Bed with hydraulic lift. The mechanism is buttery smooth and provides massive storage space. Build quality is top-notch. Highly recommend WoodNest!',
    date: '2026-07-08',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&q=80',
  },
  {
    id: 'r3',
    userName: 'Anjali Patel',
    rating: 5,
    comment: 'The Sheesham dining table set is a masterpiece — each piece has unique natural grain patterns. It feels truly handcrafted. Sturdy, beautiful, and every guest compliments it!',
    date: '2026-07-20',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&q=80',
  },
  {
    id: 'r4',
    userName: 'Vikram Singh',
    rating: 5,
    comment: 'Ordered the ergonomic mesh office chair for my WFH setup — my back pain completely disappeared after 2 weeks. The lumbar support is exceptional. Best investment of the year!',
    date: '2026-07-25',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&q=80',
  },
  {
    id: 'r5',
    userName: 'Meera Krishnan',
    rating: 4,
    comment: 'The Sleepyhead memory foam mattress transformed my sleep overnight! The cooling gel layer actually works — no more sweaty nights. The 100-night trial gave me total confidence to buy.',
    date: '2026-07-30',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&q=80',
  },
  {
    id: 'r6',
    userName: 'Arjun Mehta',
    rating: 5,
    comment: 'Got the outdoor rattan patio set for our terrace — incredible quality for the price! The aluminium frame held up through monsoon rains without any rust. Garden looks beautiful now!',
    date: '2026-08-01',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&q=80',
  },
];

export const COUPONS: Coupon[] = [
  { code: 'FIRST10', discount: 10, type: 'percentage', minOrder: 2000 },
  { code: 'SAVE500', discount: 500, type: 'flat', minOrder: 15000 },
  { code: 'HOME15', discount: 15, type: 'percentage', minOrder: 10000 },
];

export const OFFER_TEXTS = [
  'New Home Offer: 10% off on your first order | Code: FIRST10',
  'Sofa Bonanza: Up to 60% off on premium sectionals & recliners',
  'Free delivery + free assembly on orders above ₹15,000',
  'Flash Sale every day at 12 PM — Save up to 50% on selected furniture',
  'Extra 5% off with HDFC Credit Cards on orders above ₹20,000',
  'Sustainably sourced solid wood furniture — crafted to last generations',
  '100-Night Mattress Trial | No-cost EMI from ₹999/month available',
];

export const FLASH_SALE_IDS: string[] = [];
export const TRENDING_IDS: string[] = [];
export const BEST_SELLER_IDS: string[] = [];
export const NEW_ARRIVAL_IDS: string[] = [];
