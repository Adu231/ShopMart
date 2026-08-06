import { Link, useLocation } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin } from 'lucide-react';

const ABOUT_LINKS = [
  { label: 'About Us', to: '/about' },
  { label: 'Careers', to: '/careers' },
  { label: 'Press', to: '/press' },
  { label: 'WoodNest Stories', to: '/stories' },
  { label: 'Corporate Info', to: '/corporate-info' },
  { label: 'Investors', to: '/investors' },
];

const HELP_LINKS = [
  { label: 'Payments', to: '/help/payments' },
  { label: 'Shipping', to: '/help/shipping' },
  { label: 'Free Assembly', to: '/help/assembly' },
  { label: 'Care Instructions', to: '/help/care-instructions' },
  { label: 'Cancellation & Returns', to: '/help/cancellation-returns' },
  { label: 'FAQ', to: '/help/faq' },
];

const POLICY_LINKS = [
  { label: 'Return Policy', to: '/policy/return-policy' },
  { label: 'Terms of Use', to: '/policy/terms-of-use' },
  { label: 'Security', to: '/policy/security' },
  { label: 'Privacy Policy', to: '/policy/privacy-policy' },
  { label: 'Grievance Redressal', to: '/policy/grievance-redressal' },
  { label: 'EPR Compliance', to: '/policy/epr-compliance' },
];

const BOTTOM_LINKS = [
  { label: 'Privacy Policy', to: '/policy/privacy-policy' },
  { label: 'Terms of Use', to: '/policy/terms-of-use' },
  { label: 'Accessibility', to: '/policy/accessibility' },
];

export default function Footer() {
  const location = useLocation();

  const handleLinkClick = (to: string) => {
    if (location.pathname === to) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-[#172337] text-gray-400 mt-8">
      <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div>
          <div className="mb-4">
            <Link to="/" onClick={() => handleLinkClick('/')} className="inline-block">
              <div className="text-white font-bold text-lg leading-none">WoodNest</div>
              <div className="text-xs text-gray-400 mt-0.5">Design Your Space</div>
            </Link>
          </div>
          <h3 className="text-white font-semibold text-xs uppercase tracking-widest mb-3">About</h3>
          <ul className="space-y-2">
            {ABOUT_LINKS.map(item => (
              <li key={item.label}>
                <Link
                  to={item.to}
                  onClick={() => handleLinkClick(item.to)}
                  className="text-sm hover:text-white transition-colors"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-white font-semibold text-xs uppercase tracking-widest mb-4">Help</h3>
          <ul className="space-y-2">
            {HELP_LINKS.map(item => (
              <li key={item.label}>
                <Link
                  to={item.to}
                  onClick={() => handleLinkClick(item.to)}
                  className="text-sm hover:text-white transition-colors"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-white font-semibold text-xs uppercase tracking-widest mb-4">Consumer Policy</h3>
          <ul className="space-y-2">
            {POLICY_LINKS.map(item => (
              <li key={item.label}>
                <Link
                  to={item.to}
                  onClick={() => handleLinkClick(item.to)}
                  className="text-sm hover:text-white transition-colors"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-white font-semibold text-xs uppercase tracking-widest mb-4">Connect</h3>
          <div className="flex gap-3 mb-5">
            {[Facebook, Twitter, Instagram, Youtube].map((Icon, i) => (
              <a
                key={i}
                href="https://social.woodnest.in"
                target="_blank"
                rel="noreferrer"
                className="bg-gray-700 hover:bg-[#2874F0] p-2 rounded-full transition-all duration-200 hover:scale-110"
              >
                <Icon size={15} className="text-white" />
              </a>
            ))}
          </div>
          <div className="space-y-2.5 text-sm">
            <div className="flex items-center gap-2"><Mail size={13} />support@woodnest.in</div>
            <div className="flex items-center gap-2"><Phone size={13} />1800-202-9898 (Toll Free)</div>
            <div className="flex items-center gap-2"><MapPin size={13} />Bengaluru, Karnataka, India</div>
          </div>
          <div className="mt-4">
            <div className="text-xs text-gray-500 mb-1">Demo Accounts:</div>
            <div className="text-xs space-y-0.5 text-gray-400">
              <div>customer@demo.com / password123</div>
              <div>seller@demo.com / password123</div>
              <div>admin@demo.com / password123</div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-700 py-4 text-xs text-gray-600">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-2">
          <p>© 2026 WoodNest Pvt. Ltd. All rights reserved. Crafted with ❤️ in India</p>
          <div className="flex gap-4">
            {BOTTOM_LINKS.map(item => (
              <Link
                key={item.label}
                to={item.to}
                onClick={() => handleLinkClick(item.to)}
                className="hover:text-white transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
