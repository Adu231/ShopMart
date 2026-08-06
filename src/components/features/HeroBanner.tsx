import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { BANNERS } from '@/constants/data';

export default function HeroBanner() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setCurrent(c => (c + 1) % BANNERS.length), 4500);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="relative w-full overflow-hidden rounded-none" style={{ height: '320px' }}>
      {BANNERS.map((b, i) => (
        <div
          key={b.id}
          className="absolute inset-0 transition-all duration-700 ease-in-out"
          style={{ opacity: i === current ? 1 : 0, transform: `translateX(${(i - current) * 100}%)` }}
        >
          <div className={`w-full h-full bg-gradient-to-r ${b.bgColor} flex items-center`}>
            <img src={b.image} alt={b.title} className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-40" />
            <div className="relative z-10 max-w-7xl mx-auto px-8 md:px-16 text-white">
              <p className="text-xs md:text-sm uppercase tracking-widest text-white/70 mb-2 font-medium">Limited Time Offer</p>
              <h2 className="text-2xl md:text-4xl font-bold mb-2 drop-shadow-lg">{b.title}</h2>
              <p className="text-sm md:text-lg mb-6 text-white/85">{b.subtitle}</p>
              <Link to={b.link} className="inline-block bg-[#FB641B] hover:bg-[#e55a18] text-white px-7 py-2.5 rounded font-semibold text-sm transition-all hover:scale-105 shadow-lg">
                {b.cta} →
              </Link>
            </div>
          </div>
        </div>
      ))}
      <button onClick={() => setCurrent(c => (c - 1 + BANNERS.length) % BANNERS.length)} className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white dark:bg-gray-800/80 p-1.5 rounded-full shadow z-20 transition-all">
        <ChevronLeft size={18} className="text-gray-800 dark:text-white" />
      </button>
      <button onClick={() => setCurrent(c => (c + 1) % BANNERS.length)} className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white dark:bg-gray-800/80 p-1.5 rounded-full shadow z-20 transition-all">
        <ChevronRight size={18} className="text-gray-800 dark:text-white" />
      </button>
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
        {BANNERS.map((_, i) => (
          <button key={i} onClick={() => setCurrent(i)} className={`rounded-full transition-all duration-300 ${i === current ? 'bg-white w-5 h-2' : 'bg-white/50 w-2 h-2'}`} />
        ))}
      </div>
    </div>
  );
}
