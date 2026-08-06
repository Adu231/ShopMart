import { Link } from 'react-router-dom';
import { BRAND_NAMES } from '@/constants/data';

const brandStyles: Record<string, string> = {
  'Urban Ladder': 'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300',
  'Pepperfry': 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300',
  'Nilkamal': 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300',
  'Godrej Interio': 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300',
  'Durian': 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300',
  'IKEA': 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200',
  'Wooden Street': 'bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-300',
  'Wakefit': 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300',
  'HomeTown': 'bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300',
  'Fabindia': 'bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-300',
  'Sleepyhead': 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300',
  'Featherlite': 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300',
};

const brandIcons: Record<string, string> = {
  'Urban Ladder': '🪑',
  'Pepperfry': '🛋️',
  'Nilkamal': '🗄️',
  'Godrej Interio': '🚪',
  'Durian': '♻️',
  'IKEA': '🏠',
  'Wooden Street': '🪵',
  'Wakefit': '🛏️',
  'HomeTown': '🌿',
  'Fabindia': '✨',
  'Sleepyhead': '💤',
  'Featherlite': '💼',
};

export default function BrandSection() {
  return (
    <section className="bg-card rounded shadow-sm p-4 md:p-5">
      <h2 className="text-lg font-bold text-foreground mb-1">Top Furniture Brands</h2>
      <p className="text-sm text-muted-foreground mb-4">Shop from India's most trusted furniture brands</p>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-3">
        {BRAND_NAMES.map(name => (
          <Link
            key={name}
            to={`/products?brand=${encodeURIComponent(name)}`}
            className={`${brandStyles[name] || 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300'} rounded-xl p-3 flex flex-col items-center justify-center gap-1.5 hover:shadow-md transition-all duration-200 hover:scale-105 aspect-square col-span-1 border border-transparent hover:border-current/20`}
          >
            <span className="text-xl">{brandIcons[name] || '🏷️'}</span>
            <span className="font-semibold text-[11px] text-center leading-tight">{name}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
