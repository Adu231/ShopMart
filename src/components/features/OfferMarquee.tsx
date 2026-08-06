import { OFFER_TEXTS } from '@/constants/data';

export default function OfferMarquee() {
  const doubled = [...OFFER_TEXTS, ...OFFER_TEXTS];
  return (
    <div className="bg-[#2874F0] text-white py-2 overflow-hidden">
      <div className="flex gap-12 animate-marquee whitespace-nowrap w-max">
        {doubled.map((t, i) => (
          <span key={i} className="text-xs font-medium flex-shrink-0 px-6 border-r border-blue-400 last:border-0">{t}</span>
        ))}
      </div>
    </div>
  );
}
