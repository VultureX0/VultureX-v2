import { Link } from 'react-router-dom';
import { Twitter, Linkedin, Github, Mail, Globe } from 'lucide-react';
import logo from '../assets/logo.png';

const footerLinks = {
  Platform: [
    { label: 'Explore Startups', path: '/explore' },
    { label: 'Trending', path: '/trending' },
    { label: 'Competitions', path: '/competitions' },
    { label: 'Knowledge Hub', path: '/knowledge-hub' },
    { label: 'Impact', path: '/impact' },
  ],
  'For Startups': [
    { label: 'Create Profile', path: '/for-startups' },
    { label: 'AI Pitch Deck', path: '/for-startups' },
    { label: 'Pro Subscription', path: '/for-startups' },
    { label: 'Success Fee Policy', path: '/about' },
  ],
  'For Investors': [
    { label: 'Join as Investor', path: '/for-investors' },
    { label: 'Deal Flow', path: '/for-investors' },
    { label: 'Host Competition', path: '/for-investors' },
    { label: 'Analytics Tools', path: '/for-investors' },
  ],
  Company: [
    { label: 'About', path: '/about' },
    { label: 'Careers', path: '/about' },
    { label: 'Blog', path: '/knowledge-hub' },
    { label: 'Contact', path: '/about' },
  ],
};

const sdgs = ['No Poverty', 'Clean Energy', 'Climate Action', 'Decent Work', 'Reduced Inequalities'];

export default function Footer() {
  return (
    <footer className="bg-[#09091a] border-t border-[#1c1c3a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-10 mb-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <img src={logo} alt="Vulture X" className="w-10 h-10 rounded-lg object-cover" />
              <span className="text-2xl font-bold tracking-tight">
                <span className="text-white">Vulture</span>
                <span className="text-[#8b5cf6]"> X</span>
              </span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed mb-6 max-w-xs">
              The AI-powered three-sided marketplace connecting startups, investors, and competition hosts in a merit-based ecosystem.
            </p>
            <div className="flex items-center gap-3">
              {[
                { Icon: Twitter, href: '#' },
                { Icon: Linkedin, href: 'https://www.linkedin.com/company/vulturex/' },
                { Icon: Github, href: '#' },
                { Icon: Mail, href: '#' },
                { Icon: Globe, href: '#' },
              ].map(({ Icon, href }, i) => (
                <a
                  key={i}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-lg bg-[#0f0f1e] border border-[#1c1c3a] flex items-center justify-center text-gray-400 hover:text-[#8b5cf6] hover:border-[#8b5cf6]/30 transition-all"
                >
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-white font-semibold text-sm mb-4">{category}</h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.path}
                      className="text-gray-400 text-sm hover:text-[#8b5cf6] transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* SDG Banner */}
        <div className="bg-gradient-to-r from-[#0f1a0f] to-[#0f0f1a] border border-[#1c1c3a] rounded-xl p-5 mb-10">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs font-semibold text-[#4ade80] uppercase tracking-wider">🌱 SDG Aligned</span>
            <div className="flex flex-wrap gap-2">
              {sdgs.map((sdg) => (
                <span key={sdg} className="px-2.5 py-1 text-xs bg-[#1a2e1a] text-[#4ade80] border border-[#2d5a2d]/40 rounded-full">
                  {sdg}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-[#1c1c3a]">
          <p className="text-gray-500 text-sm">
            © 2025 Vulture X. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link to="/about" className="text-gray-500 text-sm hover:text-gray-300 transition-colors">
              Terms of Service
            </Link>
            <Link to="/about" className="text-gray-500 text-sm hover:text-gray-300 transition-colors">
              Privacy Policy
            </Link>
            <Link to="/about" className="text-gray-500 text-sm hover:text-gray-300 transition-colors">
              Impact Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
