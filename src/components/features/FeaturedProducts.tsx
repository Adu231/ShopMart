import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PRODUCTS, TRENDING_IDS, BEST_SELLER_IDS, NEW_ARRIVAL_IDS } from '@/constants/data';
import ProductCard from './ProductCard';
import { api } from '@/services/api';

const TABS = [
  { key: 'trending', label: 'Trending Now', ids: TRENDING_IDS },
  { key: 'bestsellers', label: 'Best Sellers', ids: BEST_SELLER_IDS },
  { key: 'new', label: 'New Arrivals', ids: NEW_ARRIVAL_IDS },
];

export default function FeaturedProducts() {
  const [activeTab, setActiveTab] = useState('trending');
  const [apiProducts, setApiProducts] = useState<any[]>([]);

  useEffect(() => {
    api.products.getAll().then(res => {
      if (res && res.success && Array.isArray(res.products)) {
        setApiProducts(res.products);
      } else {
        setApiProducts([]);
      }
    });
  }, []);

  const tab = TABS.find(t => t.key === activeTab)!;
  const filteredFromApi = apiProducts.filter(p => tab.ids.includes(p.id));
  const products = filteredFromApi.length > 0 ? filteredFromApi : apiProducts.slice(0, 5);

  return (
    <section className="bg-card rounded shadow-sm p-4 md:p-5">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          {TABS.map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)} className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${activeTab === t.key ? 'bg-[#2874F0] text-white shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:text-foreground'}`}>
              {t.label}
            </button>
          ))}
        </div>
        <Link to="/products" className="text-sm text-[#2874F0] hover:underline font-medium">View All →</Link>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        {products.map(p => <ProductCard key={p.id} product={p} />)}
      </div>
    </section>
  );
}

