import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#172337] text-gray-400 mt-8">
      <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div>
          <div className="mb-4">
            <div className="text-white font-bold text-lg leading-none">WoodNest</div>
            <div className="text-xs text-gray-400 mt-0.5">Design Your Space</div>
          </div>
          <h3 className="text-white font-semibold text-xs uppercase tracking-widest mb-3">About</h3>
          <ul className="space-y-2">
            {['About Us', 'Careers', 'Press', 'WoodNest Stories', 'Corporate Info', 'Investors'].map(t => (
              <li key={t}><Link to="#" className="text-sm hover:text-white transition-colors">{t}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-white font-semibold text-xs uppercase tracking-widest mb-4">Help</h3>
          <ul className="space-y-2">
            {['Payments', 'Shipping', 'Free Assembly', 'Care Instructions', 'Cancellation & Returns', 'FAQ'].map(t => (
              <li key={t}><Link to="#" className="text-sm hover:text-white transition-colors">{t}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-white font-semibold text-xs uppercase tracking-widest mb-4">Consumer Policy</h3>
          <ul className="space-y-2">
            {['Return Policy', 'Terms of Use', 'Security', 'Privacy Policy', 'Grievance Redressal', 'EPR Compliance'].map(t => (
              <li key={t}><Link to="#" className="text-sm hover:text-white transition-colors">{t}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-white font-semibold text-xs uppercase tracking-widest mb-4">Connect</h3>
          <div className="flex gap-3 mb-5">
            {[Facebook, Twitter, Instagram, Youtube].map((Icon, i) => (
              <Link key={i} to="#" className="bg-gray-700 hover:bg-[#2874F0] p-2 rounded-full transition-all duration-200 hover:scale-110">
                <Icon size={15} className="text-white" />
              </Link>
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
            {['Privacy Policy', 'Terms of Use', 'Accessibility'].map(t => (
              <Link key={t} to="#" className="hover:text-white transition-colors">{t}</Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
