import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Zap, ChevronLeft, ChevronRight } from 'lucide-react';
import { PRODUCTS, FLASH_SALE_IDS } from '@/constants/data';
import ProductCard from './ProductCard';
import { api } from '@/services/api';

function useCountdown(endTime?: string) {
  const getTime = () => {
    let diff = 0;
    let hasTarget = false;

    if (endTime) {
      const targetTime = new Date(endTime).getTime();
      if (!isNaN(targetTime)) {
        diff = targetTime - Date.now();
        hasTarget = true;
      }
    }

    if (!hasTarget) {
      const now = new Date();
      const target = new Date();
      target.setHours(12, 0, 0, 0);
      if (now >= target) target.setDate(target.getDate() + 1);
      diff = Math.max(0, target.getTime() - now.getTime());
    }

    const isExpired = hasTarget && diff <= 0;
    const cleanDiff = Math.max(0, diff);

    const d = Math.floor(cleanDiff / (1000 * 60 * 60 * 24));
    const h = Math.floor((cleanDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const m = Math.floor((cleanDiff % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((cleanDiff % (1000 * 60)) / 1000);

    return { d, h, m, s, isExpired };
  };

  const [time, setTime] = useState(getTime);

  useEffect(() => {
    setTime(getTime());
    const t = setInterval(() => setTime(getTime()), 1000);
    return () => clearInterval(t);
  }, [endTime]);

  return time;
}

export default function FlashSale() {
  const [apiProducts, setApiProducts] = useState<any[]>([]);
  const [flashSettings, setFlashSettings] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('shopmart_landing_settings') || '{}');
      return {
        title: saved.flashDealTitle || 'Flash Sale',
        enabled: saved.flashDealEnabled !== undefined ? saved.flashDealEnabled : true,
        endTime: saved.flashDealEndTime || '',
      };
    } catch {
      return { title: 'Flash Sale', enabled: true, endTime: '' };
    }
  });

  useEffect(() => {
    const handleStorage = () => {
      try {
        const saved = JSON.parse(localStorage.getItem('shopmart_landing_settings') || '{}');
        setFlashSettings({
          title: saved.flashDealTitle || 'Flash Sale',
          enabled: saved.flashDealEnabled !== undefined ? saved.flashDealEnabled : true,
          endTime: saved.flashDealEndTime || '',
        });
      } catch {}
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  useEffect(() => {
    api.products.getAll().then(res => {
      if (res && res.success && Array.isArray(res.products)) {
        setApiProducts(res.products);
      } else {
        setApiProducts([]);
      }
    });
  }, []);

  const { d, h, m, s, isExpired } = useCountdown(flashSettings.endTime);
  const scrollRef = useRef<HTMLDivElement>(null);
  const pad = (n: number) => String(n).padStart(2, '0');
  const scroll = (dir: number) => { if (scrollRef.current) scrollRef.current.scrollLeft += dir * 260; };

  if (!flashSettings.enabled) return null;

  const filteredFromApi = apiProducts.filter(p => FLASH_SALE_IDS.includes(p.id));
  const products = filteredFromApi.length > 0 ? filteredFromApi : apiProducts.slice(0, 6);

  return (
    <section className="bg-card rounded-2xl shadow-xs overflow-hidden border border-border">
      <div className="flex flex-wrap items-center justify-between px-5 py-3.5 bg-gradient-to-r from-[#FB641B] via-orange-500 to-amber-500 text-white gap-3">
        <div className="flex items-center gap-3">
          <Zap size={22} className="text-white fill-white animate-pulse" />
          <h2 className="text-white font-extrabold text-lg md:text-xl tracking-tight">{flashSettings.title}</h2>
          
          <div className="flex items-center gap-1.5 text-white bg-black/20 px-3 py-1 rounded-full backdrop-blur-xs">
            <span className="text-xs font-semibold opacity-90">{isExpired ? 'Status' : 'Ends in'}</span>
            {isExpired ? (
              <span className="bg-rose-600 text-white px-2 py-0.5 text-xs font-extrabold rounded">DEAL EXPIRED</span>
            ) : (
              <div className="flex items-center gap-1">
                {d > 0 && (
                  <>
                    <span className="bg-black/40 rounded px-1.5 py-0.5 font-mono text-sm font-black text-amber-300">{pad(d)}d</span>
                    <span className="font-bold text-xs">:</span>
                  </>
                )}
                {[pad(h), pad(m), pad(s)].map((v, i) => (
                  <span key={i} className="flex items-center">
                    <span className="bg-black/40 rounded px-1.5 py-0.5 font-mono text-sm font-black text-amber-300 min-w-[24px] text-center">{v}</span>
                    {i < 2 && <span className="mx-0.5 font-bold text-xs">:</span>}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
        <Link to="/products" className="text-white hover:text-amber-100 text-xs md:text-sm font-bold underline flex items-center gap-1">
          View All Deals →
        </Link>
      </div>

      <div className="relative px-4 py-4 bg-card">
        <button onClick={() => scroll(-1)} className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-background border border-border shadow-md rounded-full p-2 hover:bg-muted transition-colors cursor-pointer">
          <ChevronLeft size={18} />
        </button>
        <div ref={scrollRef} className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-2 pt-1 px-2">
          {products.map(p => (
            <div key={p.id} className="flex-shrink-0 w-[210px]">
              <ProductCard product={p} />
            </div>
          ))}
        </div>
        <button onClick={() => scroll(1)} className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-background border border-border shadow-md rounded-full p-2 hover:bg-muted transition-colors cursor-pointer">
          <ChevronRight size={18} />
        </button>
      </div>
    </section>
  );
}


