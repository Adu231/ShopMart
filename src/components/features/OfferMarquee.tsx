import { useState, useEffect } from 'react';
import { OFFER_TEXTS } from '@/constants/data';

export default function OfferMarquee() {
  const [tickerText, setTickerText] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('shopmart_landing_settings') || '{}');
      if (saved.announcementEnabled === false) return null;
      return saved.announcementText || OFFER_TEXTS[0];
    } catch {
      return OFFER_TEXTS[0];
    }
  });

  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const saved = JSON.parse(localStorage.getItem('shopmart_landing_settings') || '{}');
        if (saved.announcementEnabled === false) {
          setTickerText(null);
        } else {
          setTickerText(saved.announcementText || OFFER_TEXTS[0]);
        }
      } catch {
        setTickerText(OFFER_TEXTS[0]);
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

  if (!tickerText) return null;

  const items = [tickerText, tickerText, tickerText, tickerText];

  return (
    <div className="bg-[#2874F0] text-white py-2 overflow-hidden shadow-xs">
      <div className="flex gap-12 animate-marquee whitespace-nowrap w-max">
        {items.map((t, i) => (
          <span key={i} className="text-xs font-bold flex-shrink-0 px-6 border-r border-blue-400/40 last:border-0 tracking-wide">
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}
