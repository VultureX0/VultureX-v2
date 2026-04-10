import { Link } from 'react-router-dom';
import { Linkedin, Mail } from 'lucide-react';
import logo from '../assets/logo.png';

const links = {
  Product: [
    { label: 'Explore', path: '/explore' },
    { label: 'Competitions', path: '/competitions' },
    { label: 'Trending', path: '/trending' },
  ],
  Company: [
    { label: 'About', path: '/about' },
    { label: 'For Startups', path: '/for-startups' },
    { label: 'For Investors', path: '/for-investors' },
    { label: 'Impact', path: '/impact' },
  ],
  Legal: [
    { label: 'Terms', path: '/about' },
    { label: 'Privacy', path: '/about' },
  ],
};

export default function Footer() {
  return (
    <footer className="border-t border-[#e8e8e2] bg-[#f6f6f2]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="flex flex-col md:flex-row items-start justify-between gap-12">
          <div className="max-w-xs">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <img src={logo} alt="Vulture X" className="w-6 h-6 rounded-md object-cover" />
              <span className="text-[17px] font-semibold tracking-tight text-[#111111]">
                vulturex<span className="text-[#d14343]">.</span>
              </span>
            </Link>
            <p className="text-sm text-gray-600 leading-relaxed mb-5">
              The modern platform connecting startups with verified investors.
            </p>
            <div className="flex items-center gap-2">
              <a
                href="https://www.linkedin.com/company/vulturex/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-7 h-7 rounded-md border border-[#d9d9d1] flex items-center justify-center text-gray-600 hover:text-[#111111] hover:border-[#bdbdb5] transition-colors"
              >
                <Linkedin size={13} />
              </a>
              <a
                href="mailto:hello@vulturex.com"
                className="w-7 h-7 rounded-md border border-[#d9d9d1] flex items-center justify-center text-gray-600 hover:text-[#111111] hover:border-[#bdbdb5] transition-colors"
              >
                <Mail size={13} />
              </a>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-10">
            {Object.entries(links).map(([category, items]) => (
              <div key={category}>
                <h4 className="text-sm font-medium text-gray-700 mb-4">{category}</h4>
                <ul className="space-y-2.5">
                  {items.map((link) => (
                    <li key={link.label}>
                      <Link to={link.path} className="text-sm text-gray-600 hover:text-[#111111] transition-colors">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-[#e8e8e2] flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-600">&copy; {new Date().getFullYear()} Vulture X. All rights reserved.</p>
          <p className="text-xs text-gray-600">Built for founders. Trusted by investors.</p>
        </div>
      </div>
    </footer>
  );
}
