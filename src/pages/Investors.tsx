import { TrendingUp, FileText, Download, PieChart, ShieldCheck, Mail } from 'lucide-react';
import { toast } from 'sonner';

export default function Investors() {
  const handleDownload = (doc: string) => {
    toast.success(`Downloading ${doc}...`);
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-950 min-h-screen text-gray-800 dark:text-gray-200">
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#172337] via-[#1a2b47] to-[#2874F0] text-white py-16 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <span className="bg-emerald-500/20 text-emerald-300 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-3 inline-block">
            Investor Relations
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Financial Growth & Capital Allocation</h1>
          <p className="text-gray-300 max-w-2xl mx-auto text-base">
            Quarterly earnings releases, annual reports, ESG disclosures, and governance policies for WoodNest investors.
          </p>
        </div>
      </section>

      {/* Financial Metrics */}
      <section className="max-w-6xl mx-auto px-4 -mt-8 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-gray-800 text-center">
          {[
            { label: 'FY26 ARR', value: '₹540 Cr', change: '+38% YoY' },
            { label: 'Gross Margin', value: '54.2%', change: '+240 bps' },
            { label: 'EBITDA Margin', value: '16.8%', change: 'Profitable' },
            { label: 'FSC Wood Certified', value: '100%', change: 'Zero Waste' },
          ].map((stat, i) => (
            <div key={i} className="p-3">
              <div className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white">{stat.value}</div>
              <div className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">{stat.change}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-1 uppercase tracking-wide">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Reports & Downloads */}
      <div className="max-w-6xl mx-auto px-4 py-12 grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <FileText className="text-[#2874F0]" size={24} /> Financial Disclosures & Filings
          </h2>

          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
            {[
              { title: 'Q1 FY27 Financial Results & Investor Deck', date: 'July 28, 2026', size: '4.2 MB' },
              { title: 'FY26 Audited Annual Financial Report & Notes', date: 'May 12, 2026', size: '14.8 MB' },
              { title: 'Q4 FY26 Earnings Call Transcript & Audio Webcast', date: 'May 14, 2026', size: '2.1 MB' },
              { title: '2026 Sustainability & ESG Impact Report', date: 'April 05, 2026', size: '8.5 MB' },
            ].map((report, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-700">
                <div>
                  <h3 className="font-bold text-sm text-gray-900 dark:text-white mb-0.5">{report.title}</h3>
                  <div className="text-xs text-gray-500">{report.date} · {report.size}</div>
                </div>
                <button
                  onClick={() => handleDownload(report.title)}
                  className="bg-[#2874F0] hover:bg-blue-600 text-white text-xs font-semibold px-3 py-1.5 rounded flex items-center gap-1 transition-colors shrink-0"
                >
                  <Download size={13} /> PDF
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Info */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Investor Contact</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 leading-relaxed">
              For analyst queries, institutional investor meetings, or shareholder secretarial assistance:
            </p>
            <div className="text-xs space-y-2 text-gray-700 dark:text-gray-300 font-medium">
              <div className="flex items-center gap-2"><Mail size={14} className="text-[#2874F0]" /> investors@woodnest.in</div>
              <div>Share Registrar: Link Intime India Pvt. Ltd.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
