import { Star, Quote } from 'lucide-react';
import { HOME_REVIEWS } from '@/constants/data';
import { formatDate } from '@/lib/utils';

export default function ReviewsSection() {
  return (
    <section className="bg-card rounded shadow-sm p-4 md:p-6">
      <h2 className="text-lg font-bold text-foreground mb-5">What Our Customers Say</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {HOME_REVIEWS.map(r => (
          <div key={r.id} className="bg-background rounded-lg p-4 border border-border hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <img src={r.avatar} alt={r.userName} className="w-10 h-10 rounded-full object-cover" loading="lazy" />
                <div>
                  <p className="text-sm font-semibold text-foreground">{r.userName}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(r.date)}</p>
                </div>
              </div>
              <Quote size={18} className="text-[#2874F0] opacity-40" />
            </div>
            <div className="flex items-center gap-0.5 mb-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={13} className={i < r.rating ? 'text-yellow-400' : 'text-gray-300'} fill={i < r.rating ? 'currentColor' : 'none'} />
              ))}
              <span className="text-xs text-muted-foreground ml-1">{r.rating}/5</span>
            </div>
            <p className="text-sm text-foreground/80 leading-relaxed">{r.comment}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
