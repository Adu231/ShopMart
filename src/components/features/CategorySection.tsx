import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '@/services/api';

export default function CategorySection() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.admin.getCategories().then(res => {
      setLoading(false);
      if (res && res.success && Array.isArray(res.categories)) {
        setCategories(res.categories);
      }
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return null;
  if (!categories || categories.length === 0) return null;

  return (
    <section className="bg-card rounded shadow-sm p-4 md:p-6">
      <h2 className="text-lg font-bold text-foreground mb-4">Shop by Category</h2>
      <div className="grid grid-cols-4 md:grid-cols-8 gap-3 md:gap-4">
        {categories.map(cat => (
          <Link key={cat.id} to={`/products?category=${encodeURIComponent(cat.name)}`} className="flex flex-col items-center gap-2 group">
            <div className="bg-muted rounded-full overflow-hidden w-16 h-16 md:w-20 md:h-20 flex items-center justify-center border-2 border-transparent group-hover:border-[#2874F0] transition-all duration-200 shadow-sm">
              <img src={cat.image_url || cat.image || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=300&q=80'} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" loading="lazy" />
            </div>
            <span className="text-xs font-medium text-foreground text-center leading-tight group-hover:text-[#2874F0] transition-colors">{cat.name}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
