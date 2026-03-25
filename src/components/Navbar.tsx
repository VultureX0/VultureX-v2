import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown, LogOut } from 'lucide-react';
import { useAuth } from '../features/auth';
import logo from '../assets/logo.png';

const navLinks = [
  { label: 'Home', path: '/' },
  { label: 'Explore', path: '/explore' },
  { label: 'Competitions', path: '/competitions' },
  { label: 'Trending', path: '/trending' },
  {
    label: 'For You',
    children: [
      { label: 'For Startups', path: '/for-startups' },
      { label: 'For Investors', path: '/for-investors' },
    ],
  },
  { label: 'Knowledge Hub', path: '/knowledge-hub' },
  { label: 'Impact', path: '/impact' },
  { label: 'About', path: '/about' },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const location = useLocation();
  const { isAuthenticated, signOut } = useAuth();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setDropdownOpen(false);
  }, [location]);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-[#06060f]/95 backdrop-blur-xl border-b border-[#1c1c3a]'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <img src={logo} alt="Vulture X" className="w-9 h-9 rounded-lg object-cover pulse-glow" />
            <span className="text-xl font-bold tracking-tight">
              <span className="text-white">Vulture</span>
              <span className="text-[#8b5cf6]"> X</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              if (link.children) {
                return (
                  <div key={link.label} className="relative">
                    <button
                      className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-all"
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                      onBlur={() => setTimeout(() => setDropdownOpen(false), 150)}
                    >
                      {link.label}
                      <ChevronDown size={14} className={`transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {dropdownOpen && (
                      <div className="absolute top-full left-0 mt-1 w-48 bg-[#0f0f1e] border border-[#1c1c3a] rounded-xl overflow-hidden shadow-2xl">
                        {link.children.map((child) => (
                          <Link
                            key={child.path}
                            to={child.path}
                            className="block px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-all"
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path!}
                  className={`px-3 py-2 rounded-lg text-sm transition-all ${
                    isActive
                      ? 'text-[#8b5cf6] bg-[#8b5cf6]/10'
                      : 'text-gray-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* CTA Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className="px-4 py-2 text-sm text-gray-300 hover:text-white transition-colors"
                >
                  Dashboard
                </Link>
                <button
                  onClick={signOut}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
                >
                  <LogOut size={14} /> Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm text-gray-300 hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 text-sm font-semibold bg-gradient-to-r from-[#8b5cf6] to-[#7c3aed] text-black rounded-lg hover:opacity-90 transition-opacity"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu toggle */}
          <button
            className="lg:hidden p-2 text-gray-400 hover:text-white"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="lg:hidden bg-[#0b0b18]/98 backdrop-blur-xl border-t border-[#1c1c3a]">
          <div className="px-4 py-4 space-y-1">
            {navLinks.map((link) => {
              if (link.children) {
                return (
                  <div key={link.label}>
                    {link.children.map((child) => (
                      <Link
                        key={child.path}
                        to={child.path}
                        className="block px-3 py-2.5 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-all"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                );
              }
              return (
                <Link
                  key={link.path}
                  to={link.path!}
                  className={`block px-3 py-2.5 rounded-lg text-sm transition-all ${
                    location.pathname === link.path
                      ? 'text-[#8b5cf6] bg-[#8b5cf6]/10'
                      : 'text-gray-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            <div className="pt-3 flex flex-col gap-2">
              {isAuthenticated ? (
                <>
                  <Link
                    to="/dashboard"
                    className="w-full px-4 py-2.5 text-sm font-semibold bg-gradient-to-r from-[#8b5cf6] to-[#7c3aed] text-black rounded-lg text-center"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={signOut}
                    className="w-full px-4 py-2.5 text-sm border border-[#1c1c3a] rounded-lg text-gray-300 hover:text-white hover:border-[#8b5cf6]/30 transition-all text-center"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="w-full px-4 py-2.5 text-sm border border-[#1c1c3a] rounded-lg text-gray-300 hover:text-white hover:border-[#8b5cf6]/30 transition-all text-center"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/signup"
                    className="w-full px-4 py-2.5 text-sm font-semibold bg-gradient-to-r from-[#8b5cf6] to-[#7c3aed] text-black rounded-lg text-center"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
