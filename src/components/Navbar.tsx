import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, LogOut } from 'lucide-react';
import { useAuth } from '../features/auth';
import logo from '../assets/logo.png';

const navLinks = [
  { label: 'Explore', path: '/explore' },
  { label: 'Competitions', path: '/competitions' },
  { label: 'For Startups', path: '/for-startups' },
  { label: 'For Investors', path: '/for-investors' },
  { label: 'About', path: '/about' },
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
          ? 'bg-[#06060f]/90 backdrop-blur-md border-b border-[#1c1c3a]/60'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="Vulture X" className="w-7 h-7 rounded-md object-cover" />
            <span className="text-[15px] font-semibold tracking-tight text-white">
              Vulture X
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-0.5">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3 py-1.5 rounded-md text-[13px] transition-colors ${
                    isActive
                      ? 'text-white bg-white/[0.06]'
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
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
                  className="px-3 py-1.5 text-[13px] text-gray-300 hover:text-white transition-colors"
                >
                  Dashboard
                </Link>
                <button
                  onClick={signOut}
                  className="flex items-center gap-1 px-3 py-1.5 text-[13px] text-gray-500 hover:text-gray-300 transition-colors"
                >
                  <LogOut size={13} /> Sign out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-3 py-1.5 text-[13px] text-gray-400 hover:text-white transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  to="/signup"
                  className="px-3.5 py-1.5 text-[13px] font-medium bg-white text-[#06060f] rounded-md hover:bg-gray-200 transition-colors"
                >
                  Get started
                </Link>
              </>
            )}
          </div>

          <button
            className="md:hidden p-1.5 text-gray-400 hover:text-white"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-[#09091a]/98 backdrop-blur-md border-t border-[#1c1c3a]/60">
          <div className="px-4 py-3 space-y-0.5">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`block px-3 py-2 rounded-md text-sm transition-colors ${
                  location.pathname === link.path
                    ? 'text-white bg-white/[0.06]'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-3 border-t border-[#1c1c3a] mt-2 flex flex-col gap-1.5">
              {isAuthenticated ? (
                <>
                  <Link
                    to="/dashboard"
                    className="w-full px-3 py-2 text-sm font-medium bg-white text-[#06060f] rounded-md text-center"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={signOut}
                    className="w-full px-3 py-2 text-sm text-gray-400 border border-[#1c1c3a] rounded-md text-center"
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="w-full px-3 py-2 text-sm text-gray-400 border border-[#1c1c3a] rounded-md text-center"
                  >
                    Sign in
                  </Link>
                  <Link
                    to="/signup"
                    className="w-full px-3 py-2 text-sm font-medium bg-white text-[#06060f] rounded-md text-center"
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
