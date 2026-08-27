import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useStore } from '../hooks/useStore';
import { LogOut, LogIn, HeartHandshake, Menu, X, Sparkles, Compass, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  const role = useStore(state => state.role);
  const logout = useStore(state => state.logout);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const getPortalLink = (portalType: 'ngo' | 'government') => {
    if (role === portalType) return `/${portalType === 'government' ? 'gov' : 'ngo'}/dashboard`;
    return `/login?role=${portalType}`;
  };

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '#how-it-works', label: 'How It Works' },
    { to: getPortalLink('ngo'), label: 'NGO Portal' },
    { to: getPortalLink('government'), label: 'Gov Portal' },
    { to: '/donor', label: 'Donor / Volunteer', special: true },
  ];

  return (
    <>
      {/* Floating Neumorphic Big Curved Navbar */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-6 inset-x-0 z-50 flex justify-center px-4 md:px-8 pointer-events-none"
      >
        <div
          className={`pointer-events-auto w-full max-w-7xl rounded-[2.2rem] px-7 py-4 transition-all duration-500 flex items-center justify-between gap-6 ${isScrolled ? 'scale-[0.98]' : 'scale-100'
            }`}
          style={{
            backgroundColor: '#e0e5ec',
            boxShadow: isScrolled
              ? '14px 14px 28px #b8bec6, -14px -14px 28px #ffffff'
              : '10px 10px 22px #bebebe, -10px -10px 22px #ffffff',
            border: '1.5px solid rgba(255, 255, 255, 0.8)',
          }}
        >
          {/* Logo with Soft Dynamic Hover */}
          <Link to="/" className="flex items-center gap-3.5 shrink-0 group">
            <motion.div
              whileHover={{ scale: 1.12, rotate: -6 }}
              whileTap={{ scale: 0.92 }}
              transition={{ type: 'spring', stiffness: 350, damping: 15 }}
              className="relative p-2.5 rounded-2xl flex items-center justify-center cursor-pointer"
              style={{
                backgroundColor: '#e0e5ec',
                boxShadow: '5px 5px 10px #bebebe, -5px -5px 10px #ffffff',
              }}
            >
              <img
                src="/favicon.png"
                alt="AapdaSetu Logo"
                className="h-8 w-8 object-contain select-none filter drop-shadow-md"
              />
            </motion.div>

            <div className="flex flex-col">
              <motion.span
                whileHover={{ scale: 1.02 }}
                className="font-display text-xl font-black tracking-tight hidden sm:inline-block cursor-pointer"
                style={{
                  background: 'linear-gradient(135deg, #064e3b 0%, #059669 50%, #d97706 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                AapdaSetu
              </motion.span>
              <span className="text-[10px] font-extrabold text-slate-500 tracking-widest uppercase hidden sm:block -mt-0.5">
                Resilience Platform
              </span>
            </div>
          </Link>

          {/* Center Nav Links Container */}
          <nav
            className="hidden md:flex items-center justify-center gap-2.5 px-4 py-2 rounded-2xl"
            style={{
              backgroundColor: '#e0e5ec',
              boxShadow: 'inset 4px 4px 8px #bebebe, inset -4px -4px 8px #ffffff',
            }}
          >
            {navLinks.map((link) => {
              const isHash = link.to.startsWith('#');
              const isActive = isHash ? false : location.pathname === link.to;
              const isHovered = hoveredLink === link.label;

              const handleClick = (e: React.MouseEvent) => {
                if (isHash) {
                  e.preventDefault();
                  if (location.pathname !== '/') {
                    navigate('/' + link.to);
                  } else {
                    const el = document.getElementById(link.to.substring(1));
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }
                }
              };

              if (link.special) {
                return (
                  <motion.div
                    key={link.label}
                    whileHover={{ scale: 1.06, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                  >
                    <Link
                      to={link.to}
                      className="relative flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black transition-all duration-300"
                      style={{
                        background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                        color: '#FFFFFF',
                        boxShadow: '5px 5px 12px rgba(217, 119, 6, 0.35), inset 1px 1px 2px rgba(255, 255, 255, 0.4)',
                      }}
                      onMouseEnter={() => setHoveredLink(link.label)}
                      onMouseLeave={() => setHoveredLink(null)}
                    >
                      <motion.div
                        animate={{ rotate: [0, 15, -15, 0] }}
                        transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                      >
                        <HeartHandshake className="h-4 w-4 text-amber-100" />
                      </motion.div>
                      <span>{link.label}</span>
                    </Link>
                  </motion.div>
                );
              }

              return (
                <Link
                  key={link.label}
                  to={link.to}
                  onClick={handleClick}
                  className="relative px-5 py-2.5 rounded-xl text-xs font-black transition-colors duration-200"
                  style={{
                    color: isActive ? '#059669' : '#475569',
                  }}
                  onMouseEnter={() => setHoveredLink(link.label)}
                  onMouseLeave={() => setHoveredLink(null)}
                >
                  <AnimatePresence>
                    {(isHovered || isActive) && (
                      <motion.div
                        layoutId="nav-pill"
                        className="absolute inset-0 rounded-xl"
                        style={{
                          backgroundColor: '#e0e5ec',
                          boxShadow: isActive
                            ? 'inset 3px 3px 6px #bebebe, inset -3px -3px 6px #ffffff'
                            : '4px 4px 8px #bebebe, -4px -4px 8px #ffffff',
                        }}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ type: 'spring', stiffness: 380, damping: 25 }}
                      />
                    )}
                  </AnimatePresence>

                  <span className="relative z-10 flex items-center gap-1.5">
                    {isActive && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 500 }}
                      >
                        <Sparkles className="h-3.5 w-3.5 text-emerald-600 inline" />
                      </motion.span>
                    )}
                    {link.label}
                  </span>
                </Link>
              );
            })}
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-3.5 shrink-0">
            {role ? (
              <div className="flex items-center gap-3">
                <div
                  className="hidden sm:flex flex-col items-end text-right px-3.5 py-1.5 rounded-xl text-xs font-bold"
                  style={{
                    backgroundColor: '#e0e5ec',
                    boxShadow: 'inset 2px 2px 5px #bebebe, inset -2px -2px 5px #ffffff',
                  }}
                >
                  <span className="text-[8px] uppercase tracking-widest font-mono text-emerald-600 flex items-center gap-1">
                    <ShieldCheck className="h-2.5 w-2.5" /> Active
                  </span>
                  <span className="text-[11px] font-black capitalize text-slate-700">{role}</span>
                </div>

                <motion.button
                  whileHover={{ scale: 1.06, y: -1 }}
                  whileTap={{ scale: 0.94 }}
                  onClick={() => {
                    logout();
                    navigate('/');
                  }}
                  className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-black text-rose-600 cursor-pointer transition-all"
                  style={{
                    backgroundColor: '#e0e5ec',
                    boxShadow: '4px 4px 8px #bebebe, -4px -4px 8px #ffffff',
                  }}
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Logout</span>
                </motion.button>
              </div>
            ) : (
              <motion.div
                whileHover={{ scale: 1.06, y: -1 }}
                whileTap={{ scale: 0.94 }}
                transition={{ type: 'spring', stiffness: 400, damping: 17 }}
              >
                <Link
                  to="/login"
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black text-emerald-700 transition-all"
                  style={{
                    backgroundColor: '#e0e5ec',
                    boxShadow: '5px 5px 10px #bebebe, -5px -5px 10px #ffffff',
                  }}
                >
                  <LogIn className="h-4 w-4 text-emerald-600" />
                  <span>Sign In</span>
                </Link>
              </motion.div>
            )}

            {/* Mobile Toggle Button */}
            <motion.button
              whileTap={{ scale: 0.88 }}
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden rounded-2xl p-3 cursor-pointer text-slate-700"
              style={{
                backgroundColor: '#e0e5ec',
                boxShadow: mobileOpen
                  ? 'inset 3px 3px 6px #bebebe, inset -3px -3px 6px #ffffff'
                  : '4px 4px 8px #bebebe, -4px -4px 8px #ffffff',
              }}
            >
              <AnimatePresence mode="wait">
                {mobileOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <X className="h-5 w-5 text-rose-500" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <Menu className="h-5 w-5 text-slate-700" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>
      </motion.header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="fixed top-28 inset-x-4 z-40 rounded-[2rem] p-6 pointer-events-auto"
            style={{
              backgroundColor: '#e0e5ec',
              boxShadow: '12px 12px 28px #bebebe, -12px -12px 28px #ffffff',
              border: '1.5px solid rgba(255, 255, 255, 0.8)',
            }}
          >
            <nav className="flex flex-col gap-3.5">
              {navLinks.map((link) => {
                const isHash = link.to.startsWith('#');
                const isActive = isHash ? false : location.pathname === link.to;

                const handleClick = (e: React.MouseEvent) => {
                  setMobileOpen(false);
                  if (isHash) {
                    e.preventDefault();
                    if (location.pathname !== '/') {
                      navigate('/' + link.to);
                    } else {
                      const el = document.getElementById(link.to.substring(1));
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }
                  }
                };

                return (
                  <motion.div key={link.label} whileTap={{ scale: 0.97 }}>
                    <Link
                      to={link.to}
                      onClick={handleClick}
                      className="flex items-center gap-3 px-5 py-3.5 rounded-2xl font-black text-sm transition-all"
                      style={{
                        backgroundColor: '#e0e5ec',
                        color: isActive ? '#059669' : '#334155',
                        boxShadow: isActive
                          ? 'inset 4px 4px 8px #bebebe, inset -4px -4px 8px #ffffff'
                          : '4px 4px 8px #bebebe, -4px -4px 8px #ffffff',
                      }}
                    >
                      {link.special ? (
                        <HeartHandshake className="h-4 w-4 text-amber-500" />
                      ) : (
                        <Compass className="h-4 w-4 text-emerald-500" />
                      )}
                      {link.label}
                    </Link>
                  </motion.div>
                );
              })}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;