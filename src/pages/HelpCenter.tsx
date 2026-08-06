import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { CreditCard, Truck, Wrench, ShieldAlert, RotateCcw, HelpCircle, ChevronDown, ChevronUp, Search, CheckCircle2, PhoneCall } from 'lucide-react';

const HELP_TABS = [
  { id: 'payments', label: 'Payments', icon: CreditCard },
  { id: 'shipping', label: 'Shipping & Delivery', icon: Truck },
  { id: 'assembly', label: 'Free Assembly', icon: Wrench },
  { id: 'care-instructions', label: 'Care Instructions', icon: ShieldAlert },
  { id: 'cancellation-returns', label: 'Cancellation & Returns', icon: RotateCcw },
  { id: 'faq', label: 'FAQ', icon: HelpCircle },
];

const FAQS = [
  { q: 'How long does delivery take for solid wood furniture?', a: 'Standard delivery takes 3 to 7 business days depending on your pincode. Custom woodwork orders may require up to 10-14 days for crafting and quality testing.' },
  { q: 'Is assembly really free?', a: 'Yes! All WoodNest solid wood furniture comes with doorstep free assembly by our certified technicians at no extra charge.' },
  { q: 'What payment options do you support?', a: 'We accept Credit/Debit Cards, UPI (GPay, PhonePe, Paytm), Netbanking, Cash on Delivery (up to ₹50,000), and No-Cost EMI up to 12 months.' },
  { q: 'What is the return window for damaged items?', a: 'If your item arrives with manufacturing defects or transit damage, report it within 7 days of delivery for a free doorstep replacement or 100% refund.' },
  { q: 'How do I care for solid Sheesham timber?', a: 'Avoid direct exposure to extreme sunlight or standing water. Wipe with a dry microfibre cloth and apply natural beeswax polish twice a year.' },
];

export default function HelpCenter() {
  const { section } = useParams<{ section?: string }>();
  const navigate = useNavigate();
  const activeTab = section && HELP_TABS.some(t => t.id === section) ? section : 'payments';

  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [searchQuery, setSearchQuery] = useState('');

  const handleTabChange = (tabId: string) => {
    navigate(`/help/${tabId}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-950 min-h-screen text-gray-800 dark:text-gray-200">
      {/* Header */}
      <section className="bg-gradient-to-r from-[#172337] via-[#2874F0] to-[#172337] text-white py-14 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-5xl font-extrabold mb-3">WoodNest Help & Customer Support</h1>
          <p className="text-blue-100 text-sm md:text-base max-w-xl mx-auto mb-6">
            Find quick answers for payments, shipping timelines, assembly, returns, and furniture maintenance tips.
          </p>
        </div>
      </section>

      {/* Navigation Tabs */}
      <div className="max-w-6xl mx-auto px-4 -mt-6 relative z-10">
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-100 dark:border-gray-800 p-2 flex overflow-x-auto gap-2 scrollbar-hide">
          {HELP_TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex-1 justify-center ${
                  isActive
                    ? 'bg-[#2874F0] text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <Icon size={16} /> {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* Payments Tab */}
        {activeTab === 'payments' && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 md:p-8 border border-gray-200 dark:border-gray-800 shadow-sm space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <CreditCard className="text-[#2874F0]" size={24} /> Payment Options & Gateway Security
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              We offer multiple convenient and 100% encrypted payment gateways powered by Razorpay and Cashfree.
            </p>

            <div className="grid md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700">
                <h3 className="font-bold text-sm text-gray-900 dark:text-white mb-2">Credit & Debit Cards</h3>
                <p className="text-gray-500 dark:text-gray-400">Visa, MasterCard, RuPay, and American Express with 256-bit SSL encryption.</p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700">
                <h3 className="font-bold text-sm text-gray-900 dark:text-white mb-2">Instant UPI Payments</h3>
                <p className="text-gray-500 dark:text-gray-400">Google Pay, PhonePe, Paytm, BHIM, and Cred UPI with zero extra charges.</p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700">
                <h3 className="font-bold text-sm text-gray-900 dark:text-white mb-2">No-Cost EMI Options</h3>
                <p className="text-gray-500 dark:text-gray-400">Available on major credit cards for 3, 6, 9, and 12-month tenure options.</p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700">
                <h3 className="font-bold text-sm text-gray-900 dark:text-white mb-2">Cash on Delivery (COD)</h3>
                <p className="text-gray-500 dark:text-gray-400">COD is enabled for orders up to ₹50,000 across 19,000+ pincodes in India.</p>
              </div>
            </div>
          </div>
        )}

        {/* Shipping Tab */}
        {activeTab === 'shipping' && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 md:p-8 border border-gray-200 dark:border-gray-800 shadow-sm space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Truck className="text-[#2874F0]" size={24} /> Shipping Policy & Delivery Timelines
            </h2>
            <div className="space-y-4 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              <div className="p-4 bg-blue-50 dark:bg-blue-950/40 rounded-xl border border-blue-100 dark:border-blue-900 text-gray-800 dark:text-gray-200">
                <h3 className="font-bold mb-1 text-sm text-[#2874F0]">Free Shipping Across India</h3>
                <p className="text-xs">We offer 100% free doorstep delivery on all orders above ₹1,999. No hidden freight charges or stair-carry fees!</p>
              </div>

              <h3 className="font-bold text-gray-900 dark:text-white text-base pt-2">Estimated Delivery Timelines</h3>
              <ul className="list-disc pl-5 space-y-2 text-xs">
                <li><strong>Metro Cities (Tier 1):</strong> 3 - 5 Business Days</li>
                <li><strong>Tier 2 & 3 Cities:</strong> 5 - 8 Business Days</li>
                <li><strong>Special Custom Solid Wood Orders:</strong> 10 - 14 Business Days</li>
              </ul>
            </div>
          </div>
        )}

        {/* Assembly Tab */}
        {activeTab === 'assembly' && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 md:p-8 border border-gray-200 dark:border-gray-800 shadow-sm space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Wrench className="text-[#2874F0]" size={24} /> Doorstep Free Assembly Service
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              Unlike flat-pack furniture stores that charge extra fees or leave you with complicated manuals, WoodNest sends trained installation engineers to assemble your furniture right inside your room.
            </p>
            <div className="grid md:grid-cols-3 gap-4 text-center text-xs">
              <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-[#2874F0] font-bold flex items-center justify-center mx-auto mb-2">1</div>
                <h4 className="font-bold text-gray-900 dark:text-white mb-1">Product Delivered</h4>
                <p className="text-gray-500">Unboxed safely at your doorstep by our delivery team.</p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-[#2874F0] font-bold flex items-center justify-center mx-auto mb-2">2</div>
                <h4 className="font-bold text-gray-900 dark:text-white mb-1">Slot Scheduled</h4>
                <p className="text-gray-500">Technician visits within 24-48 hours of delivery.</p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-[#2874F0] font-bold flex items-center justify-center mx-auto mb-2">3</div>
                <h4 className="font-bold text-gray-900 dark:text-white mb-1">Ready to Use</h4>
                <p className="text-gray-500">Full installation check & debris cleanup included.</p>
              </div>
            </div>
          </div>
        )}

        {/* Care Instructions Tab */}
        {activeTab === 'care-instructions' && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 md:p-8 border border-gray-200 dark:border-gray-800 shadow-sm space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <ShieldAlert className="text-[#2874F0]" size={24} /> Wood Care & Maintenance Guidelines
            </h2>
            <div className="grid md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-100 dark:border-emerald-900">
                <h3 className="font-bold text-emerald-800 dark:text-emerald-300 text-sm mb-2">DOs</h3>
                <ul className="space-y-1.5 text-gray-700 dark:text-gray-300 list-disc pl-4">
                  <li>Use coasters under hot mugs and wet glasses.</li>
                  <li>Clean dust regularly using a soft cotton microfibre cloth.</li>
                  <li>Apply natural furniture wax polish twice a year to preserve shine.</li>
                  <li>Use felt pads under table accessories to prevent surface scratches.</li>
                </ul>
              </div>
              <div className="p-4 bg-rose-50 dark:bg-rose-950/30 rounded-xl border border-rose-100 dark:border-rose-900">
                <h3 className="font-bold text-rose-800 dark:text-rose-300 text-sm mb-2">DONTs</h3>
                <ul className="space-y-1.5 text-gray-700 dark:text-gray-300 list-disc pl-4">
                  <li>Do not expose solid wood to direct harsh sunlight for prolonged periods.</li>
                  <li>Do not use harsh chemical cleaners, bleach, or abrasive sponges.</li>
                  <li>Avoid placing furniture directly in front of air conditioners or radiators.</li>
                  <li>Do not drag heavy furniture across floors; always lift cleanly.</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Cancellation & Returns Tab */}
        {activeTab === 'cancellation-returns' && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 md:p-8 border border-gray-200 dark:border-gray-800 shadow-sm space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <RotateCcw className="text-[#2874F0]" size={24} /> Easy Cancellation & 7-Day Return Policy
            </h2>
            <div className="space-y-4 text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              <h3 className="font-bold text-sm text-gray-900 dark:text-white">Order Cancellation</h3>
              <p>You can cancel your order free of cost before it is dispatched from our warehouse via the Customer Dashboard.</p>

              <h3 className="font-bold text-sm text-gray-900 dark:text-white pt-2">7-Day Hassle-Free Returns</h3>
              <p>If your item arrives damaged, defective, or different from described, raise a return request within 7 days of delivery. Our reverse logistics team will pick up the item and initiate a full refund to your original source within 3-5 bank working days.</p>
            </div>
          </div>
        )}

        {/* FAQ Tab */}
        {activeTab === 'faq' && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 md:p-8 border border-gray-200 dark:border-gray-800 shadow-sm space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
              <HelpCircle className="text-[#2874F0]" size={24} /> Frequently Asked Questions
            </h2>

            <div className="space-y-3">
              {FAQS.map((faq, i) => (
                <div key={i} className="border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full text-left p-4 bg-gray-50 dark:bg-gray-800/40 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-between font-semibold text-sm text-gray-900 dark:text-white transition-colors"
                  >
                    <span>{faq.q}</span>
                    {openFaq === i ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </button>
                  {openFaq === i && (
                    <div className="p-4 bg-white dark:bg-gray-900 text-xs text-gray-600 dark:text-gray-400 leading-relaxed border-t border-gray-100 dark:border-gray-800">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
