import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, LogOut } from 'lucide-react';
import { useAuth } from '../features/auth';
import logo from '../assets/logo.png';

const navLinks = [
  { label: 'Startups', path: '/explore' },
  { label: 'Competitions', path: '/competitions' },
  { label: 'For Startups', path: '/for-startups' },
  { label: 'For Investors', path: '/for-investors' },
  { label: 'Impact', path: '/impact' },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { isAuthenticated, signOut } = useAuth();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
        isScrolled
          ? 'bg-[#f6f6f2]/95 backdrop-blur-md border-b border-[#e8e8e2]'
          : 'bg-[#f6f6f2]/90 border-b border-[#ecece6]'
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2.5">
            <img src={logo} alt="Vulture X" className="w-7 h-7 rounded-md object-cover" />
            <span className="text-[17px] font-semibold tracking-tight text-[#111111]">
              vulturex<span className="text-[#d14343]">.</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-5">
            {navLinks.map((link) => {
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className="text-[13px] text-gray-600 hover:text-[#111111] transition-colors"
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          <div className="hidden md:flex items-center gap-2">
            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className="px-3 py-1.5 text-[13px] text-gray-600 hover:text-[#111111] transition-colors"
                >
                  Dashboard
                </Link>
                <button
                  onClick={signOut}
                  className="flex items-center gap-1 px-3 py-1.5 text-[13px] text-gray-600 hover:text-[#111111] transition-colors"
                >
                  <LogOut size={13} /> Sign out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-3 py-1.5 text-[13px] text-gray-600 hover:text-[#111111] transition-colors"
                >
                  Log in
                </Link>
                <Link
                  to="/signup"
                  className="px-4.5 py-2 text-[13px] font-medium bg-[#111111] text-white rounded-full hover:bg-[#222222] transition-colors"
                >
                  Get started
                </Link>
              </>
            )}
          </div>

          <button
            className="md:hidden p-1.5 text-gray-600 hover:text-[#111111]"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-[#f6f6f2] border-t border-[#e8e8e2]">
          <div className="px-4 py-3 space-y-0.5">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`block px-3 py-2 rounded-md text-sm transition-colors ${
                  location.pathname === link.path
                    ? 'text-[#111111] bg-white'
                    : 'text-gray-600 hover:text-[#111111]'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-3 border-t border-[#e8e8e2] mt-2 flex flex-col gap-1.5">
              {isAuthenticated ? (
                <>
                  <Link
                    to="/dashboard"
                    className="w-full px-3 py-2 text-sm font-medium bg-[#111111] text-white rounded-md text-center"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={signOut}
                    className="w-full px-3 py-2 text-sm text-gray-600 border border-[#d9d9d2] rounded-md text-center"
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="w-full px-3 py-2 text-sm text-gray-600 border border-[#d9d9d2] rounded-md text-center"
                  >
                    Sign in
                  </Link>
                  <Link
                    to="/signup"
                    className="w-full px-3 py-2 text-sm font-medium bg-[#111111] text-white rounded-md text-center"
                  >
                    Get started
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
