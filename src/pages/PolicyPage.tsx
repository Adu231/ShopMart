import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShieldCheck, FileText, Lock, Eye, Mail, Leaf, Accessibility, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

const POLICY_TABS = [
  { id: 'return-policy', label: 'Return Policy', icon: ShieldCheck },
  { id: 'terms-of-use', label: 'Terms of Use', icon: FileText },
  { id: 'security', label: 'Security', icon: Lock },
  { id: 'privacy-policy', label: 'Privacy Policy', icon: Eye },
  { id: 'grievance-redressal', label: 'Grievance Redressal', icon: Mail },
  { id: 'epr-compliance', label: 'EPR Compliance', icon: Leaf },
  { id: 'accessibility', label: 'Accessibility', icon: Accessibility },
];

export default function PolicyPage() {
  const { section } = useParams<{ section?: string }>();
  const navigate = useNavigate();
  const activeTab = section && POLICY_TABS.some(t => t.id === section) ? section : 'privacy-policy';

  const [complaintText, setComplaintText] = useState('');
  const [complaintEmail, setComplaintEmail] = useState('');

  const handleTabChange = (tabId: string) => {
    navigate(`/policy/${tabId}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGrievanceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaintText.trim() || !complaintEmail.trim()) {
      toast.error('Please fill in your email and grievance details.');
      return;
    }
    toast.success('Grievance ticket registered! Ticket ID: #GRV-2026-881. Grievance Officer will contact you within 24 hours.');
    setComplaintText('');
    setComplaintEmail('');
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-950 min-h-screen text-gray-800 dark:text-gray-200">
      {/* Header */}
      <section className="bg-gradient-to-r from-[#172337] via-[#1a2b47] to-[#172337] text-white py-14 px-4 text-center border-b border-gray-800">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-5xl font-extrabold mb-3">Consumer Policy & Legal Framework</h1>
          <p className="text-gray-300 text-sm md:text-base max-w-xl mx-auto">
            Transparent policies, data protection commitments, and consumer protection governance.
          </p>
        </div>
      </section>

      {/* Tabs */}
      <div className="max-w-6xl mx-auto px-4 -mt-6 relative z-10">
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-100 dark:border-gray-800 p-2 flex overflow-x-auto gap-2 scrollbar-hide">
          {POLICY_TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-3 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex-1 justify-center ${
                  isActive
                    ? 'bg-[#2874F0] text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <Icon size={15} /> {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Policy Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Return Policy */}
        {activeTab === 'return-policy' && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 md:p-8 border border-gray-200 dark:border-gray-800 shadow-sm space-y-4 text-xs md:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-2">
              <ShieldCheck className="text-[#2874F0]" size={24} /> Consumer Return & Replacement Policy
            </h2>
            <p>At WoodNest, customer satisfaction is our highest priority. All products sold on woodnest.in are covered under our 7-Day Doorstep Replacement Guarantee.</p>
            <h3 className="font-bold text-gray-900 dark:text-white text-base pt-2">Eligibility for Return:</h3>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Item received in a physically damaged or transit-defective condition.</li>
              <li>Item received missing parts or hardware components.</li>
              <li>Product delivered does not match specifications or dimensions ordered.</li>
            </ul>
            <p className="pt-2">Refunds are processed to original payment methods within 3 to 5 business days post-inspection pickup.</p>
          </div>
        )}

        {/* Terms of Use */}
        {activeTab === 'terms-of-use' && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 md:p-8 border border-gray-200 dark:border-gray-800 shadow-sm space-y-4 text-xs md:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-2">
              <FileText className="text-[#2874F0]" size={24} /> Terms of Use
            </h2>
            <p>Welcome to WoodNest. By accessing or purchasing from our platform, you agree to comply with and be bound by the following terms and conditions.</p>
            <h3 className="font-bold text-gray-900 dark:text-white text-base pt-2">User Conduct & Intellectual Property</h3>
            <p>All content, trademark logos, product 3D models, photography, and text displayed on WoodNest are the exclusive intellectual property of WoodNest Pvt. Ltd. Unauthorized copying or redistribution is strictly prohibited.</p>
          </div>
        )}

        {/* Security */}
        {activeTab === 'security' && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 md:p-8 border border-gray-200 dark:border-gray-800 shadow-sm space-y-4 text-xs md:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-2">
              <Lock className="text-[#2874F0]" size={24} /> Security & Data Protection
            </h2>
            <p>Your online security is paramount. We employ military-grade AES 256-bit encryption for all data transactions and checkout flows.</p>
            <div className="p-4 bg-blue-50 dark:bg-blue-950/40 rounded-xl border border-blue-100 dark:border-blue-900">
              <h4 className="font-bold text-blue-800 dark:text-blue-300 mb-1">PCI-DSS Compliant Payment Gateways</h4>
              <p className="text-xs text-gray-700 dark:text-gray-300">We never store your credit card numbers, CVVs, or bank login passwords on our servers.</p>
            </div>
          </div>
        )}

        {/* Privacy Policy */}
        {activeTab === 'privacy-policy' && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 md:p-8 border border-gray-200 dark:border-gray-800 shadow-sm space-y-4 text-xs md:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-2">
              <Eye className="text-[#2874F0]" size={24} /> Privacy Policy
            </h2>
            <p>WoodNest respects your personal privacy. We collect personal information (name, address, phone number, email) solely to process orders, fulfill shipments, and deliver customer support.</p>
            <p>We do not sell, rent, or lease customer personal data to third-party marketing companies.</p>
          </div>
        )}

        {/* Grievance Redressal */}
        {activeTab === 'grievance-redressal' && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 md:p-8 border border-gray-200 dark:border-gray-800 shadow-sm space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-1">
                <Mail className="text-[#2874F0]" size={24} /> Consumer Grievance Redressal Mechanism
              </h2>
              <p className="text-xs text-gray-500">In accordance with Information Technology Act 2000 & Consumer Protection E-Commerce Rules 2020.</p>
            </div>

            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl text-xs space-y-1 border border-gray-200 dark:border-gray-700">
              <div className="font-bold text-gray-900 dark:text-white">Nodal Grievance Officer: Mr. Suresh Nair</div>
              <div>WoodNest Furniture Pvt. Ltd., Outer Ring Road, Bellandur, Bengaluru - 560103</div>
              <div>Email: <span className="text-[#2874F0] font-semibold">grievance@woodnest.in</span></div>
              <div>Response Time: Acknowledged within 24 hours; resolution within 15 days.</div>
            </div>

            <form onSubmit={handleGrievanceSubmit} className="space-y-4 pt-2">
              <h3 className="font-bold text-sm text-gray-900 dark:text-white">Submit a Formal Grievance</h3>
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Your Email Address</label>
                <input
                  type="email"
                  value={complaintEmail}
                  onChange={e => setComplaintEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-[#2874F0]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Grievance Description / Order ID</label>
                <textarea
                  rows={4}
                  value={complaintText}
                  onChange={e => setComplaintText(e.target.value)}
                  placeholder="Describe your issue or concern in detail..."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-[#2874F0]"
                />
              </div>
              <button type="submit" className="bg-[#2874F0] hover:bg-blue-600 text-white font-semibold px-5 py-2.5 rounded-lg text-xs transition-colors">
                Submit Grievance Ticket
              </button>
            </form>
          </div>
        )}

        {/* EPR Compliance */}
        {activeTab === 'epr-compliance' && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 md:p-8 border border-gray-200 dark:border-gray-800 shadow-sm space-y-4 text-xs md:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-2">
              <Leaf className="text-emerald-600" size={24} /> EPR (Extended Producer Responsibility) Compliance
            </h2>
            <p>WoodNest strictly complies with the E-Waste Management Rules 2016 and Plastic Waste Management Rules established by the Central Pollution Control Board (CPCB), Ministry of Environment, Forest & Climate Change, Govt. of India.</p>
            <p>We ensure that 100% of our cardboard packaging, protective film, and timber off-cuts are channelized to authorized recyclers.</p>
          </div>
        )}

        {/* Accessibility */}
        {activeTab === 'accessibility' && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 md:p-8 border border-gray-200 dark:border-gray-800 shadow-sm space-y-4 text-xs md:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-2">
              <Accessibility className="text-[#2874F0]" size={24} /> Digital Web Accessibility Statement
            </h2>
            <p>WoodNest is committed to ensuring digital accessibility for people with visual or physical disabilities. We continually refine the user interface according to WCAG 2.1 Level AA guidelines.</p>
          </div>
        )}
      </div>
    </div>
  );
}
