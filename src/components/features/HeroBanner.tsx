import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { BANNERS } from '@/constants/data';

export default function HeroBanner() {
  const [slides, setSlides] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('shopmart_landing_settings') || '{}');
      return saved.heroSlides?.length > 0 ? saved.heroSlides : BANNERS;
    } catch {
      return BANNERS;
    }
  });

  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const saved = JSON.parse(localStorage.getItem('shopmart_landing_settings') || '{}');
        if (saved.heroSlides?.length > 0) {
          setSlides(saved.heroSlides);
        }
      } catch {
        setSlides(BANNERS);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('shopmart_settings_changed', handleStorageChange);
    handleStorageChange();
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('shopmart_settings_changed', handleStorageChange);
    };
  }, []);

  useEffect(() => {
    if (slides.length <= 1) return;
    const t = setInterval(() => setCurrent(c => (c + 1) % slides.length), 4500);
    return () => clearInterval(t);
  }, [slides.length]);

  if (!slides || slides.length === 0) return null;

  return (
    <div className="relative w-full overflow-hidden rounded-2xl shadow-sm border border-border" style={{ height: '340px' }}>
      {slides.map((b: any, i: number) => (
        <div
          key={b.id || i}
          className="absolute inset-0 transition-all duration-700 ease-in-out"
          style={{ opacity: i === current ? 1 : 0, transform: `translateX(${(i - current) * 100}%)` }}
        >
          <div className={`w-full h-full bg-gradient-to-r ${b.bgColor || 'from-[#172337] to-[#2874F0]'} flex items-center`}>
            <img src={b.image} alt={b.title} className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-50" />
            <div className="relative z-10 max-w-7xl mx-auto px-8 md:px-16 text-white space-y-2">
              <span className="text-xs md:text-sm uppercase tracking-widest bg-white/20 text-white font-extrabold px-3 py-1 rounded-full inline-block backdrop-blur-sm shadow-xs">
                {b.badgeText || 'Special Offer Announcement'}
              </span>
              <h2 className="text-2xl md:text-4xl font-black drop-shadow-md leading-tight max-w-2xl">{b.title}</h2>
              <p className="text-sm md:text-base text-white/90 font-medium max-w-xl">{b.subtitle}</p>
              <div className="pt-2">
                <Link
                  to={b.link || '/products'}
                  className="inline-block bg-[#FB641B] hover:bg-[#e55a18] text-white px-7 py-3 rounded-xl font-extrabold text-sm transition-all hover:scale-105 shadow-lg cursor-pointer"
                >
                  {b.cta || 'Shop Now'} →
                </Link>
              </div>
            </div>
          </div>
        </div>
      ))}

      {slides.length > 1 && (
        <>
          <button
            onClick={() => setCurrent(c => (c - 1 + slides.length) % slides.length)}
            className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white dark:bg-gray-800/80 p-2 rounded-full shadow-md z-20 transition-all cursor-pointer"
          >
            <ChevronLeft size={20} className="text-gray-800 dark:text-white" />
          </button>
          <button
            onClick={() => setCurrent(c => (c + 1) % slides.length)}
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white dark:bg-gray-800/80 p-2 rounded-full shadow-md z-20 transition-all cursor-pointer"
          >
            <ChevronRight size={20} className="text-gray-800 dark:text-white" />
          </button>
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 z-20">
            {slides.map((_: any, i: number) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`rounded-full transition-all duration-300 cursor-pointer ${i === current ? 'bg-white w-6 h-2' : 'bg-white/50 w-2 h-2'}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
