import { Link } from 'react-router-dom';
import { CATEGORIES } from '@/constants/data';

export default function CategorySection() {
  return (
    <section className="bg-card rounded shadow-sm p-4 md:p-6">
      <h2 className="text-lg font-bold text-foreground mb-4">Shop by Category</h2>
      <div className="grid grid-cols-4 md:grid-cols-8 gap-3 md:gap-4">
        {CATEGORIES.map(cat => (
          <Link key={cat.id} to={`/products?category=${encodeURIComponent(cat.name)}`} className="flex flex-col items-center gap-2 group">
            <div className={`${cat.color} rounded-full overflow-hidden w-16 h-16 md:w-20 md:h-20 flex items-center justify-center border-2 border-transparent group-hover:border-[#2874F0] transition-all duration-200 shadow-sm`}>
              <img src={cat.image} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" loading="lazy" />
            </div>
            <span className="text-xs font-medium text-foreground text-center leading-tight group-hover:text-[#2874F0] transition-colors">{cat.name}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
