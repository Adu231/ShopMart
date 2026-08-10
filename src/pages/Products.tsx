import { useState, useMemo, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { SlidersHorizontal, X, ChevronDown, ChevronUp, Grid } from 'lucide-react';
import { PRODUCTS, CATEGORIES, BRAND_NAMES } from '@/constants/data';
import ProductCard from '@/components/features/ProductCard';
import { api } from '@/services/api';

const SORT_OPTIONS = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'price_low', label: 'Price: Low to High' },
  { value: 'price_high', label: 'Price: High to Low' },
  { value: 'rating', label: 'Highest Rating' },
  { value: 'newest', label: 'Newest First' },
  { value: 'discount', label: 'Best Discount' },
];

export default function Products() {
  const [params, setParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const [sort, setSort] = useState('relevance');
  const [expandedFilter, setExpandedFilter] = useState<string | null>('category');

  const q = params.get('q') || '';
  const selectedCategory = params.get('category') || '';
  const selectedBrand = params.get('brand') || '';
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(500000);
  const [minRating, setMinRating] = useState(0);
  const [selectedBrands, setSelectedBrands] = useState<string[]>(selectedBrand ? [selectedBrand] : []);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(selectedCategory ? [selectedCategory] : []);

  // Synchronize category state when URL search param changes (e.g. clicking category in navbar)
  useEffect(() => {
    if (selectedCategory) {
      setSelectedCategories([selectedCategory]);
    } else {
      setSelectedCategories([]);
    }
  }, [selectedCategory]);

  // Synchronize brand state when URL search param changes
  useEffect(() => {
    if (selectedBrand) {
      setSelectedBrands([selectedBrand]);
    } else {
      setSelectedBrands([]);
    }
  }, [selectedBrand]);

  const [productList, setProductList] = useState<any[]>([]);

  useEffect(() => {
    const paramsToPass: Record<string, string> = {};
    if (q) paramsToPass.q = q;
    if (selectedCategories.length === 1) paramsToPass.category = selectedCategories[0];
    if (selectedBrands.length === 1) paramsToPass.brand = selectedBrands[0];
    if (minPrice > 0) paramsToPass.minPrice = String(minPrice);
    if (maxPrice < 500000) paramsToPass.maxPrice = String(maxPrice);

    api.products.getAll(paramsToPass).then(res => {
      if (res && res.success && Array.isArray(res.products)) {
        setProductList(res.products);
      } else {
        setProductList([]);
      }
    });
  }, [q, selectedCategories, selectedBrands, minPrice, maxPrice]);

  const filtered = useMemo(() => {
    let list = [...productList];
    if (q) list = list.filter(p => p.name.toLowerCase().includes(q.toLowerCase()) || p.brand.toLowerCase().includes(q.toLowerCase()) || p.tags.some(t => t.includes(q.toLowerCase())));
    if (selectedCategories.length) list = list.filter(p => selectedCategories.includes(p.category));
    if (selectedBrands.length) list = list.filter(p => selectedBrands.includes(p.brand));
    list = list.filter(p => p.price >= minPrice && p.price <= maxPrice);
    if (minRating > 0) list = list.filter(p => p.rating >= minRating);
    switch (sort) {
      case 'price_low': return list.sort((a, b) => a.price - b.price);
      case 'price_high': return list.sort((a, b) => b.price - a.price);
      case 'rating': return list.sort((a, b) => b.rating - a.rating);
      case 'discount': return list.sort((a, b) => b.discount - a.discount);
      case 'newest': return list.filter(p => p.isNew).concat(list.filter(p => !p.isNew));
      default: return list;
    }
  }, [q, selectedCategories, selectedBrands, minPrice, maxPrice, minRating, sort]);

  const toggleCategory = (cat: string) => {
    const next = selectedCategories.includes(cat)
      ? selectedCategories.filter(c => c !== cat)
      : [...selectedCategories, cat];
    setSelectedCategories(next);
    const newParams = new URLSearchParams(params);
    if (next.length === 1) {
      newParams.set('category', next[0]);
    } else {
      newParams.delete('category');
    }
    setParams(newParams);
  };

  const toggleBrand = (brand: string) => {
    const next = selectedBrands.includes(brand)
      ? selectedBrands.filter(b => b !== brand)
      : [...selectedBrands, brand];
    setSelectedBrands(next);
    const newParams = new URLSearchParams(params);
    if (next.length === 1) {
      newParams.set('brand', next[0]);
    } else {
      newParams.delete('brand');
    }
    setParams(newParams);
  };

  const clearAll = () => {
    setSelectedCategories([]);
    setSelectedBrands([]);
    setMinPrice(0);
    setMaxPrice(500000);
    setMinRating(0);
    setParams({});
  };

  const FilterSection = ({ title, id, children }: { title: string; id: string; children: React.ReactNode }) => (
    <div className="border-b border-border pb-3 mb-3">
      <button onClick={() => setExpandedFilter(expandedFilter === id ? null : id)} className="flex items-center justify-between w-full text-sm font-semibold text-foreground mb-2">
        {title} {expandedFilter === id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>
      {expandedFilter === id && <div>{children}</div>}
    </div>
  );

  const sidebar = (
    <div className="bg-card rounded shadow-sm p-4 w-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-foreground">Filters</h3>
        <button onClick={clearAll} className="text-xs text-[#2874F0] hover:underline">Clear All</button>
      </div>
      <FilterSection title="Category" id="category">
        <div className="space-y-2">
          {CATEGORIES.map(c => (
            <label key={c.id} className="flex items-center gap-2 cursor-pointer group">
              <input type="checkbox" checked={selectedCategories.includes(c.name)} onChange={() => toggleCategory(c.name)} className="rounded" />
              <span className="text-sm text-foreground group-hover:text-[#2874F0]">{c.name}</span>
            </label>
          ))}
        </div>
      </FilterSection>
      <FilterSection title="Brand" id="brand">
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {BRAND_NAMES.map(b => (
            <label key={b} className="flex items-center gap-2 cursor-pointer group">
              <input type="checkbox" checked={selectedBrands.includes(b)} onChange={() => toggleBrand(b)} className="rounded" />
              <span className="text-sm text-foreground group-hover:text-[#2874F0]">{b}</span>
            </label>
          ))}
        </div>
      </FilterSection>
      <FilterSection title="Price Range" id="price">
        <div className="space-y-2">
          <input type="range" min={0} max={500000} step={5000} value={maxPrice} onChange={e => setMaxPrice(Number(e.target.value))} className="w-full accent-[#2874F0]" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>₹0</span><span>Up to ₹{maxPrice.toLocaleString('en-IN')}</span>
          <div className="text-xs text-muted-foreground mt-1">Range: ₹0 — ₹5,00,000</div>
          </div>
        </div>
      </FilterSection>
      <FilterSection title="Min Rating" id="rating">
        <div className="space-y-1.5">
          {[4, 3, 2].map(r => (
            <label key={r} className="flex items-center gap-2 cursor-pointer group">
              <input type="radio" name="rating" checked={minRating === r} onChange={() => setMinRating(r)} className="rounded-full" />
              <span className="text-sm text-foreground group-hover:text-[#2874F0]">{r}★ & above</span>
            </label>
          ))}
        </div>
      </FilterSection>
    </div>
  );

  return (
    <div className="bg-background min-h-screen">
      <div className="max-w-7xl mx-auto px-3 md:px-4 py-4">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
          <Link to="/" className="hover:text-[#2874F0]">Home</Link>
          <span>/</span>
          <span className="text-foreground">{selectedCategory || (q ? `Search: "${q}"` : 'All Products')}</span>
        </div>

        {/* Active filters */}
        {(selectedCategories.length > 0 || selectedBrands.length > 0) && (
          <div className="flex flex-wrap gap-2 mb-3">
            {selectedCategories.map(c => (
              <span key={c} className="flex items-center gap-1 bg-blue-100 dark:bg-blue-900/30 text-[#2874F0] text-xs px-2 py-1 rounded-full">
                {c} <button onClick={() => toggleCategory(c)}><X size={11} /></button>
              </span>
            ))}
            {selectedBrands.map(b => (
              <span key={b} className="flex items-center gap-1 bg-orange-100 dark:bg-orange-900/30 text-[#FB641B] text-xs px-2 py-1 rounded-full">
                {b} <button onClick={() => toggleBrand(b)}><X size={11} /></button>
              </span>
            ))}
          </div>
        )}

        {/* Sort + results bar */}
        <div className="flex items-center justify-between bg-card rounded shadow-sm px-4 py-3 mb-4">
          <div className="flex items-center gap-3">
            <button onClick={() => setShowFilters(!showFilters)} className="md:hidden flex items-center gap-1.5 text-sm font-medium text-[#2874F0]">
              <SlidersHorizontal size={15} /> Filters
            </button>
            <span className="text-sm text-muted-foreground">{filtered.length} results {q && `for "${q}"`}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground hidden md:inline">Sort by:</span>
            <select value={sort} onChange={e => setSort(e.target.value)} className="text-sm border border-border rounded px-2 py-1.5 bg-background text-foreground outline-none focus:border-[#2874F0]">
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>

        <div className="flex gap-4">
          {/* Desktop sidebar */}
          <div className="hidden md:block w-56 flex-shrink-0">{sidebar}</div>

          {/* Mobile filter drawer */}
          {showFilters && (
            <div className="fixed inset-0 z-50 md:hidden">
              <div className="absolute inset-0 bg-black/50" onClick={() => setShowFilters(false)} />
              <div className="absolute left-0 top-0 bottom-0 w-72 bg-background overflow-y-auto p-4">
                <div className="flex justify-between mb-3">
                  <h3 className="font-bold">Filters</h3>
                  <button onClick={() => setShowFilters(false)}><X size={20} /></button>
                </div>
                {sidebar}
              </div>
            </div>
          )}

          {/* Products Grid */}
          <div className="flex-1">
            {filtered.length === 0 ? (
              <div className="bg-card rounded shadow-sm p-12 text-center">
                <Grid size={48} className="mx-auto text-muted-foreground mb-3" />
                <p className="text-lg font-medium text-foreground mb-2">No products found</p>
                <p className="text-sm text-muted-foreground mb-4">Try adjusting your filters or search query</p>
                <button onClick={clearAll} className="text-[#2874F0] hover:underline text-sm">Clear all filters</button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {filtered.map(p => <ProductCard key={p.id} product={p} />)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
