import { Link } from 'react-router-dom';
import { Linkedin, Mail } from 'lucide-react';
import logo from '../assets/logo.png';

const links = {
  Platform: [
    { label: 'Explore', path: '/explore' },
    { label: 'Competitions', path: '/competitions' },
    { label: 'Trending', path: '/trending' },
    { label: 'Impact', path: '/impact' },
  ],
  Company: [
    { label: 'About', path: '/about' },
    { label: 'For Startups', path: '/for-startups' },
    { label: 'For Investors', path: '/for-investors' },
    { label: 'Knowledge Hub', path: '/knowledge-hub' },
  ],
};

export default function Footer() {
  return (
    <footer className="border-t border-[#1c1c3a]/40 bg-[#06060f]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-10">
          <div className="col-span-2 sm:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-3">
              <img src={logo} alt="Vulture X" className="w-6 h-6 rounded-md object-cover" />
              <span className="text-sm font-semibold text-white">Vulture X</span>
            </Link>
            <p className="text-xs text-gray-500 leading-relaxed max-w-xs mb-4">
              Where founders meet investors. Merit-based discovery, structured profiles, real conversations.
            </p>
            <div className="flex items-center gap-2">
              <a
                href="https://www.linkedin.com/company/vulturex/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-7 h-7 rounded-md border border-[#1c1c3a]/60 flex items-center justify-center text-gray-500 hover:text-white hover:border-[#2a2a4a] transition-colors"
              >
                <Linkedin size={13} />
              </a>
              <a
                href="mailto:hello@vulturex.com"
                className="w-7 h-7 rounded-md border border-[#1c1c3a]/60 flex items-center justify-center text-gray-500 hover:text-white hover:border-[#2a2a4a] transition-colors"
              >
                <Mail size={13} />
              </a>
            </div>
          </div>

          {Object.entries(links).map(([category, items]) => (
            <div key={category}>
              <h4 className="text-xs font-medium text-gray-400 mb-3">{category}</h4>
              <ul className="space-y-2">
                {items.map((link) => (
                  <li key={link.label}>
                    <Link to={link.path} className="text-xs text-gray-500 hover:text-gray-300 transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 border-t border-[#1c1c3a]/30">
          <p className="text-[11px] text-gray-600">
            &copy; {new Date().getFullYear()} Vulture X
          </p>
          <div className="flex items-center gap-4">
            <Link to="/about" className="text-[11px] text-gray-600 hover:text-gray-400 transition-colors">Terms</Link>
            <Link to="/about" className="text-[11px] text-gray-600 hover:text-gray-400 transition-colors">Privacy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
