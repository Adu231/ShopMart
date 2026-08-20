import HeroBanner from '@/components/features/HeroBanner';
import OfferMarquee from '@/components/features/OfferMarquee';
import CategorySection from '@/components/features/CategorySection';
import FlashSale from '@/components/features/FlashSale';
import FeaturedProducts from '@/components/features/FeaturedProducts';
import Newsletter from '@/components/features/Newsletter';

export default function Index() {
  return (
    <div className="bg-background min-h-screen">
      <OfferMarquee />
      <div className="max-w-7xl mx-auto px-3 md:px-4 py-3 space-y-4">
        <HeroBanner />
        <CategorySection />
        <FlashSale />
        <FeaturedProducts />
        <Newsletter />
      </div>
    </div>
  );
}
