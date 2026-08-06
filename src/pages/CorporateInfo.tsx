import { Building2, MapPin, ShieldCheck, FileText, Globe, Award } from 'lucide-react';

export default function CorporateInfo() {
  return (
    <div className="bg-gray-50 dark:bg-gray-950 min-h-screen text-gray-800 dark:text-gray-200">
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#172337] via-[#1a2b47] to-[#2874F0] text-white py-16 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <span className="bg-blue-500/20 text-blue-300 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-3 inline-block">
            WoodNest Private Limited
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Corporate Information</h1>
          <p className="text-gray-300 max-w-2xl mx-auto text-base">
            Official business profile, corporate governance details, board of directors, and manufacturing infrastructure.
          </p>
        </div>
      </section>

      {/* Corporate Overview Grid */}
      <div className="max-w-6xl mx-auto px-4 py-12 space-y-10">
        {/* Key Entities */}
        <div className="bg-white dark:bg-gray-900 rounded-xl p-6 md:p-8 border border-gray-200 dark:border-gray-800 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <Building2 className="text-[#2874F0]" size={24} /> Entity Details
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 text-sm">
            {[
              { label: 'Legal Name', value: 'WoodNest Furniture & Living Pvt. Ltd.' },
              { label: 'Corporate Identification Number (CIN)', value: 'U36999KA2018PTC114920' },
              { label: 'Date of Incorporation', value: '14th February 2018' },
              { label: 'Registered Head Office', value: 'Outer Ring Road, Bellandur, Bengaluru, KA - 560103' },
              { label: 'Manufacturing Hubs', value: 'Jodhpur (Rajasthan) & Channapatna (Karnataka)' },
              { label: 'Statutory Auditor', value: 'Deloitte Haskins & Sells LLP' },
            ].map((item, i) => (
              <div key={i} className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg border border-gray-100 dark:border-gray-700">
                <span className="text-xs text-gray-500 dark:text-gray-400 block mb-1 font-medium">{item.label}</span>
                <span className="font-bold text-gray-900 dark:text-white">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Board of Directors */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Board of Directors & Executive Leadership</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: 'Aditya V. Sharma', title: 'Co-Founder & Chief Executive Officer', bg: 'Ex-IIM Ahmedabad, 12+ years in retail tech & timber manufacturing.' },
              { name: 'Meera Deshmukh', title: 'Co-Founder & Chief Design Officer', bg: 'Alumna National Institute of Design (NID), award-winning furniture architect.' },
              { name: 'Siddharth Kapur', title: 'Chief Financial Officer', bg: 'Chartered Accountant, former VP Finance at leading Indian unicorn.' },
            ].map((director, i) => (
              <div key={i} className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
                <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/40 text-[#2874F0] font-bold flex items-center justify-center text-lg mb-3">
                  {director.name.charAt(0)}
                </div>
                <h3 className="font-bold text-lg text-gray-900 dark:text-white">{director.name}</h3>
                <div className="text-xs font-semibold text-[#2874F0] mb-2">{director.title}</div>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{director.bg}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Office Locations */}
        <div className="bg-white dark:bg-gray-900 rounded-xl p-6 md:p-8 border border-gray-200 dark:border-gray-800 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <MapPin className="text-[#2874F0]" size={24} /> Key Office Locations
          </h2>
          <div className="grid md:grid-cols-3 gap-6 text-xs">
            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <h4 className="font-bold text-sm text-gray-900 dark:text-white mb-1">Corporate HQ (Bengaluru)</h4>
              <p className="text-gray-500 dark:text-gray-400">Greenwood Tech Park, Tower B, 4th Floor, ORR, Bellandur, Bengaluru - 560103</p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <h4 className="font-bold text-sm text-gray-900 dark:text-white mb-1">Woodcraft Hub (Jodhpur)</h4>
              <p className="text-gray-500 dark:text-gray-400">Industrial Park Phase II, Boranada, Jodhpur, Rajasthan - 342012</p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <h4 className="font-bold text-sm text-gray-900 dark:text-white mb-1">Regional Office (Gurugram)</h4>
              <p className="text-gray-500 dark:text-gray-400">Cyber City, Building 10, DLF Phase 2, Gurugram, Haryana - 122002</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
