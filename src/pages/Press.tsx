import { Newspaper, Download, Mail, ExternalLink, Calendar, Tag } from 'lucide-react';
import { toast } from 'sonner';

const PRESS_RELEASES = [
  {
    id: 1,
    date: 'August 01, 2026',
    category: 'Expansion',
    title: 'WoodNest Announces Expansion of 100% FSC-Certified Teak Collection Across South Asia',
    summary: 'Pioneering eco-friendly timber sourcing, WoodNest commits to zero-deforestation manufacturing across all flagship living room ranges.',
  },
  {
    id: 2,
    date: 'June 15, 2026',
    category: 'Funding & Growth',
    title: 'WoodNest Crosses ₹500 Cr ARR Milestone Driven by Custom Modular Wardrobes & Dining Sets',
    summary: 'Strong direct-to-consumer growth and nationwide assembly support propel record quarterly revenue.',
  },
  {
    id: 3,
    date: 'March 22, 2026',
    category: 'Innovation',
    title: 'WoodNest Launches AR Room Visualizer for Instant 3D Furniture Placement',
    summary: 'Customers can now preview solid wood dining tables and sofas inside their actual living rooms using smart web AR technology.',
  },
  {
    id: 4,
    date: 'January 10, 2026',
    category: 'Award',
    title: 'WoodNest Named "Sustainable Design Brand of the Year" at India Furniture Conclave',
    summary: 'Recognized for zero-plastic packaging, renewable timber partnerships, and community artisan empowerment.',
  },
];

export default function Press() {
  const handleDownload = (kitName: string) => {
    toast.success(`Downloading ${kitName}...`);
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-950 min-h-screen text-gray-800 dark:text-gray-200">
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#172337] via-[#1a2b47] to-[#2874F0] text-white py-16 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <span className="bg-blue-500/20 text-blue-300 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-3 inline-block">
            Newsroom & Media
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">WoodNest Press & Media Center</h1>
          <p className="text-gray-300 max-w-2xl mx-auto text-base">
            Stay updated with our latest company news, design releases, sustainability milestones, and media resources.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-12 grid md:grid-cols-3 gap-8">
        {/* Left: Press Releases */}
        <div className="md:col-span-2 space-y-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Newspaper className="text-[#2874F0]" size={24} /> Recent Press Releases
          </h2>

          {PRESS_RELEASES.map(item => (
            <div key={item.id} className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm hover:border-[#2874F0] transition-colors">
              <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
                <span className="bg-blue-50 dark:bg-blue-900/30 text-[#2874F0] font-semibold px-2.5 py-0.5 rounded">
                  {item.category}
                </span>
                <span className="flex items-center gap-1"><Calendar size={12} />{item.date}</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 leading-snug hover:text-[#2874F0] transition-colors cursor-pointer">
                {item.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{item.summary}</p>
              <button
                onClick={() => toast.info(`Opening press release: ${item.title}`)}
                className="text-xs font-semibold text-[#2874F0] hover:underline flex items-center gap-1"
              >
                Read Full Release <ExternalLink size={12} />
              </button>
            </div>
          ))}
        </div>

        {/* Right: Media Kit & PR Contact */}
        <div className="space-y-6">
          {/* Media Resources Card */}
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Brand Assets & Kits</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
              Download high-res brand logos, product lookbooks, and executive headshots for media publication.
            </p>

            <div className="space-y-2.5">
              {[
                'WoodNest Brand Logos & Guidelines (ZIP, 12MB)',
                '2026 Furniture Lookbook & Product Shots (PDF, 45MB)',
                'Leadership Team Bios & Photos (ZIP, 18MB)',
              ].map((asset, i) => (
                <button
                  key={i}
                  onClick={() => handleDownload(asset)}
                  className="w-full text-left bg-gray-50 dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-xs font-medium text-gray-700 dark:text-gray-300 hover:text-[#2874F0] p-3 rounded-lg flex items-center justify-between transition-colors border border-gray-100 dark:border-gray-700"
                >
                  <span className="truncate pr-2">{asset}</span>
                  <Download size={14} className="shrink-0 text-[#2874F0]" />
                </button>
              ))}
            </div>
          </div>

          {/* Media Contact Card */}
          <div className="bg-gradient-to-br from-[#172337] to-[#2874F0] text-white rounded-xl p-6 shadow-md">
            <h3 className="text-lg font-bold mb-2">Media & Press Inquiries</h3>
            <p className="text-xs text-blue-100 mb-4 leading-relaxed">
              Are you a journalist, editor, or media representative seeking interviews or product samples for review?
            </p>
            <div className="text-xs space-y-2">
              <div className="flex items-center gap-2 text-blue-200">
                <Mail size={14} /> press@woodnest.in
              </div>
              <div className="text-blue-200">PR Hotline: +91 80 4920 1199</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
