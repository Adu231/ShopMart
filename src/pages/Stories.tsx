import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Sparkles, User, ArrowRight, Bookmark } from 'lucide-react';
import { toast } from 'sonner';

const STORIES = [
  {
    id: 1,
    title: 'Transforming a Compact Mumbai Apartment into a Warm Teak Haven',
    author: 'Priya & Rohan Sharma',
    city: 'Mumbai',
    category: 'Home Makeover',
    readTime: '4 min read',
    image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80',
    excerpt: 'How we used sleek multi-functional storage beds and a 4-seater foldable solid wood dining table to double living space in 650 sq ft.',
    likes: 342,
  },
  {
    id: 2,
    title: 'Designing a Nordic Minimalist Living Room in Bengaluru',
    author: 'Ananya Roy',
    city: 'Bengaluru',
    category: 'Interior Guide',
    readTime: '5 min read',
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80',
    excerpt: 'Neutral tones, textured upholstery, and warm Sheesham accent tables created the peaceful minimalist vibe I always dreamed of.',
    likes: 512,
  },
  {
    id: 3,
    title: 'Why Solid Wood Workstations Are Worth the Investment',
    author: 'Vikram Mehta (Remote Architect)',
    city: 'Pune',
    category: 'Workspace',
    readTime: '3 min read',
    image: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=800&q=80',
    excerpt: 'Swapping particle-board office desks for WoodNest ergonomic solid oak study tables transformed my posture and productivity.',
    likes: 219,
  },
  {
    id: 4,
    title: 'A Festive Dining Room Refresh for Big Family Gatherings',
    author: 'The Iyer Family',
    city: 'Chennai',
    category: 'Festive Special',
    readTime: '6 min read',
    image: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=800&q=80',
    excerpt: 'Accommodating 8 guests effortlessly with WoodNest extendable dining sets and plush cushioned chairs during Deepavali.',
    likes: 428,
  },
];

export default function Stories() {
  const [likedMap, setLikedMap] = useState<Record<number, boolean>>({});

  const toggleLike = (id: number) => {
    setLikedMap(prev => {
      const current = prev[id];
      if (!current) toast.success('Added to your favorite stories!');
      return { ...prev, [id]: !current };
    });
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-950 min-h-screen text-gray-800 dark:text-gray-200">
      {/* Hero */}
      <section className="bg-gradient-to-r from-[#172337] via-[#2874F0] to-[#172337] text-white py-16 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <span className="bg-amber-400/20 text-amber-300 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-3 inline-block">
            WoodNest Journal & Inspiration
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Real Homes, Real Stories</h1>
          <p className="text-blue-100 max-w-2xl mx-auto text-base">
            Explore how real families across India style, customize, and live with WoodNest handcrafted furniture.
          </p>
        </div>
      </section>

      {/* Featured Story */}
      <section className="max-w-6xl mx-auto px-4 -mt-8 relative z-10">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden grid md:grid-cols-2">
          <img
            src={STORIES[0].image}
            alt={STORIES[0].title}
            className="h-[320px] md:h-full w-full object-cover"
          />
          <div className="p-6 md:p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                <span className="bg-[#2874F0]/10 text-[#2874F0] font-semibold px-2.5 py-0.5 rounded">Featured Spotlight</span>
                <span>{STORIES[0].readTime}</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">{STORIES[0].title}</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{STORIES[0].excerpt}</p>
            </div>
            <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-800 pt-4">
              <div className="text-xs text-gray-500">
                <span className="font-semibold text-gray-800 dark:text-gray-200">{STORIES[0].author}</span> · {STORIES[0].city}
              </div>
              <button
                onClick={() => toggleLike(STORIES[0].id)}
                className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors ${
                  likedMap[STORIES[0].id]
                    ? 'bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-950/30'
                    : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300'
                }`}
              >
                <Heart size={14} className={likedMap[STORIES[0].id] ? 'fill-rose-600' : ''} />
                {STORIES[0].likes + (likedMap[STORIES[0].id] ? 1 : 0)}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Grid of Stories */}
      <section className="max-w-6xl mx-auto px-4 py-14">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">More Home Inspiration</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {STORIES.slice(1).map(story => (
            <div key={story.id} className="bg-white dark:bg-gray-900 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
              <div>
                <div className="relative">
                  <img src={story.image} alt={story.title} className="h-48 w-full object-cover" />
                  <span className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-white text-[11px] font-semibold px-2.5 py-0.5 rounded">
                    {story.category}
                  </span>
                </div>
                <div className="p-5">
                  <div className="text-xs text-gray-400 mb-1">{story.readTime}</div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2 leading-snug">{story.title}</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-3 mb-3">{story.excerpt}</p>
                </div>
              </div>
              <div className="px-5 pb-5 pt-0 flex items-center justify-between text-xs border-t border-gray-50 dark:border-gray-800/50 mt-auto pt-3">
                <span className="text-gray-500 font-medium">{story.author} ({story.city})</span>
                <button
                  onClick={() => toggleLike(story.id)}
                  className="text-gray-500 hover:text-rose-500 transition-colors flex items-center gap-1"
                >
                  <Heart size={14} className={likedMap[story.id] ? 'fill-rose-500 text-rose-500' : ''} />
                  {story.likes + (likedMap[story.id] ? 1 : 0)}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
