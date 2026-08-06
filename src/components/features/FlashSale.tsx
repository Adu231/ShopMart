import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Zap, ChevronLeft, ChevronRight } from 'lucide-react';
import { PRODUCTS, FLASH_SALE_IDS } from '@/constants/data';
import ProductCard from './ProductCard';

function useCountdown(targetHour: number) {
  const getTime = () => {
    const now = new Date();
    const target = new Date();
    target.setHours(targetHour, 0, 0, 0);
    if (now >= target) target.setDate(target.getDate() + 1);
    const diff = Math.max(0, target.getTime() - now.getTime());
    return { h: Math.floor(diff / 3600000), m: Math.floor((diff % 3600000) / 60000), s: Math.floor((diff % 60000) / 1000) };
  };
  const [time, setTime] = useState(getTime);
  useEffect(() => {
    const t = setInterval(() => setTime(getTime()), 1000);
    return () => clearInterval(t);
  }, []);
  return time;
}

export default function FlashSale() {
  const products = PRODUCTS.filter(p => FLASH_SALE_IDS.includes(p.id));
  const { h, m, s } = useCountdown(12);
  const scrollRef = useRef<HTMLDivElement>(null);
  const pad = (n: number) => String(n).padStart(2, '0');
  const scroll = (dir: number) => { if (scrollRef.current) scrollRef.current.scrollLeft += dir * 260; };

  return (
    <section className="bg-card rounded shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-[#FB641B] to-orange-500">
        <div className="flex items-center gap-3">
          <Zap size={20} className="text-white" fill="white" />
          <h2 className="text-white font-bold text-lg">Flash Sale</h2>
          <div className="flex items-center gap-1 text-white">
            <span className="text-xs opacity-80">Ends in</span>
            {[pad(h), pad(m), pad(s)].map((v, i) => (
              <span key={i} className="flex items-center">
                <span className="bg-black/30 rounded px-1.5 py-0.5 font-mono text-sm font-bold min-w-[26px] text-center">{v}</span>
                {i < 2 && <span className="mx-0.5 font-bold">:</span>}
              </span>
            ))}
          </div>
        </div>
        <Link to="/products" className="text-white/90 hover:text-white text-sm font-medium underline">View All →</Link>
      </div>
      <div className="relative px-4 py-3">
        <button onClick={() => scroll(-1)} className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white dark:bg-gray-800 shadow-md rounded-full p-1.5 hover:bg-gray-50 transition-colors">
          <ChevronLeft size={16} />
        </button>
        <div ref={scrollRef} className="flex gap-3 overflow-x-auto scrollbar-hide scroll-smooth pb-2">
          {products.map(p => (
            <div key={p.id} className="flex-shrink-0 w-[200px]">
              <ProductCard product={p} />
            </div>
          ))}
        </div>
        <button onClick={() => scroll(1)} className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white dark:bg-gray-800 shadow-md rounded-full p-1.5 hover:bg-gray-50 transition-colors">
          <ChevronRight size={16} />
        </button>
      </div>
    </section>
  );
}
