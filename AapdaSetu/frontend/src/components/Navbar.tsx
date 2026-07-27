import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useStore } from '../hooks/useStore';
import { LogOut, LogIn } from 'lucide-react';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';

export const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  
  const role = useStore(state => state.role);
  const logout = useStore(state => state.logout);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 8);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const getPortalLink = (portalType: 'ngo' | 'government') => {
    if (role === portalType) {
      return `/${portalType}/dashboard`;
    }
    return `/login?role=${portalType}`;
  };

  // Middle links matching the navigation items
  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '#how-it-works', label: 'How It Works' },
    { to: getPortalLink('ngo'), label: 'NGO Portal' },
    { to: getPortalLink('government'), label: 'Gov Portal' }
  ];

  return (
    <header
      className={clsx(
        'fixed top-0 inset-x-0 z-50 transition-all duration-500 border-b',
        isScrolled 
          ? 'py-3 bg-white/80 backdrop-blur-md border-slate-200/50 shadow-xs' 
          : 'py-4 bg-white/30 backdrop-blur-xs border-transparent'
      )}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 flex items-center justify-between">
        
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <motion.img
            layoutId="logo-box"
            src="/favicon.png"
            alt="AapdaSetu Logo"
            className="h-9 w-9 object-contain select-none"
            transition={{ type: 'spring', stiffness: 140, damping: 18 }}
          />
          <motion.span
            layoutId="logo-text"
            className="font-display text-lg font-bold tracking-tight text-slate-900"
            transition={{ type: 'spring', stiffness: 140, damping: 18 }}
          >
            AapdaSetu
          </motion.span>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => {
            const isHash = link.to.startsWith('#');
            const isActive = isHash ? false : location.pathname === link.to;

            const handleClick = (e: React.MouseEvent) => {
              if (isHash) {
                e.preventDefault();
                if (location.pathname !== '/') {
                  navigate('/' + link.to);
                } else {
                  const element = document.getElementById(link.to.substring(1));
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                  }
                }
              }
            };

            return (
              <Link
                key={link.label}
                to={link.to}
                onClick={handleClick}
                className={clsx(
                  'relative py-2 text-sm font-semibold transition-all duration-300',
                  isActive
                    ? 'text-slate-900'
                    : 'text-slate-500 hover:text-slate-900'
                )}
              >
                <span>{link.label}</span>
                {isActive && (
                  <span className="absolute bottom-0 inset-x-0 h-0.5 bg-emerald-500 rounded-full animate-fade-in" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Sign In / Sign Up or Logged role */}
        <div className="flex items-center gap-3">
          {role ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col items-end text-right">
                <span className="text-[9px] uppercase tracking-widest text-slate-400 font-mono font-bold">Role</span>
                <span className="text-xs font-bold text-slate-700 capitalize">{role}</span>
              </div>
              <button
                onClick={() => {
                  logout();
                  navigate('/');
                }}
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 hover:border-red-200 hover:bg-red-50 hover:text-red-600 text-slate-600 px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="inline-flex items-center gap-2 rounded-full bg-[#059669] px-5 py-2 text-sm font-bold text-white shadow-sm hover:bg-[#047857] transition-all cursor-pointer"
            >
              <LogIn className="h-4 w-4" />
              <span>Sign In / Sign Up</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
