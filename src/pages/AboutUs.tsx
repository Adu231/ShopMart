import { Link } from 'react-router-dom';
import { ShieldCheck, Award, Heart, Leaf, Users, Sparkles, ArrowRight } from 'lucide-react';

export default function AboutUs() {
  return (
    <div className="bg-gray-50 dark:bg-gray-950 min-h-screen text-gray-800 dark:text-gray-200">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#172337] via-[#1a2b47] to-[#2874F0] text-white py-20 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <span className="bg-blue-500/20 text-blue-300 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider inline-block mb-4">
            Crafting Homes Since 2018
          </span>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
            Designing Spaces That Feel Like Home
          </h1>
          <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            At WoodNest, we believe every home tells a unique story. We blend sustainable timber, modern design aesthetics, and master craftsmanship to turn everyday living spaces into extraordinary sanctuaries.
          </p>
        </div>
      </section>

      {/* Stats Counter */}
      <section className="max-w-6xl mx-auto px-4 -mt-10 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-gray-800 text-center">
          {[
            { label: 'Happy Customers', value: '250,000+' },
            { label: 'Furniture Designs', value: '5,000+' },
            { label: 'Cities Delivered', value: '350+' },
            { label: 'Design Awards', value: '42' },
          ].map((stat, i) => (
            <div key={i} className="p-3">
              <div className="text-3xl font-extrabold text-[#2874F0] dark:text-blue-400">{stat.value}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-1 uppercase tracking-wide">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Our Mission & Values */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Our Core Philosophy</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Built on ethics, innovation, and timeless beauty</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: Leaf,
              title: '100% Sustainable Wood',
              desc: 'We source only ethically harvested, FSC-certified solid teak, Sheesham, and engineered wood with zero compromise on environmental health.',
            },
            {
              icon: Award,
              title: 'Master Craftsmanship',
              desc: 'Every joint, finish, and upholstery weave is meticulously crafted by seasoned artisans with decades of furniture-making heritage.',
            },
            {
              icon: Heart,
              title: 'Customer First Warranty',
              desc: 'With up to 10 years of structural warranty and doorstep free assembly, we ensure peace of mind with every purchase.',
            },
          ].map((v, i) => (
            <div key={i} className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-[#2874F0] flex items-center justify-center mb-4">
                <v.icon size={24} />
              </div>
              <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">{v.title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Journey Section */}
      <section className="bg-white dark:bg-gray-900 py-16 border-y border-gray-200 dark:border-gray-800">
        <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-[#2874F0] text-sm font-semibold uppercase tracking-wider">Our Journey</span>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mt-2 mb-4">From a Small Studio to India's Premier Woodcraft Store</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
              WoodNest started in 2018 in Bengaluru with a simple vision: why should high-quality, beautifully designed solid wood furniture be exorbitantly priced or hard to assemble?
            </p>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
              Today, our state-of-the-art manufacturing hubs and nationwide logistics network enable us to bring direct-from-craftsman furniture to homes across the country, saving costs and ensuring top-notch quality control.
            </p>
            <Link to="/products" className="inline-flex items-center gap-2 bg-[#2874F0] hover:bg-blue-600 text-white font-medium px-6 py-3 rounded-lg transition-colors">
              Explore Our Collection <ArrowRight size={18} />
            </Link>
          </div>
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80"
              alt="WoodNest Furniture Studio"
              className="rounded-2xl shadow-2xl object-cover h-[380px] w-full"
            />
            <div className="absolute -bottom-6 -left-6 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 flex items-center gap-3">
              <Sparkles className="text-amber-500" size={28} />
              <div>
                <div className="font-bold text-gray-900 dark:text-white text-sm">Direct Manufacturer</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">No middlemen, fair price guarantees</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 text-center max-w-4xl mx-auto px-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Ready to transform your home?</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">Browse our wide selection of living room, bedroom, dining, and workspace furniture.</p>
        <Link to="/products" className="bg-[#FB641B] hover:bg-[#e55a18] text-white font-semibold px-8 py-3.5 rounded-lg shadow-md transition-all inline-block">
          Shop All Products
        </Link>
      </section>
    </div>
  );
}
