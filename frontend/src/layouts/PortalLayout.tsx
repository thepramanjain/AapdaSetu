import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useStore } from '../hooks/useStore';
import { 
  LayoutDashboard, 
  Cpu, 
  AlertTriangle, 
  History, 
  ClipboardList, 
  Link2, 
  Settings, 
  CheckSquare, 
  DollarSign, 
  User, 
  LogOut,
  Bell,
  ArrowRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CustomCursor from '../components/CustomCursor';
import { Footer } from '../components/Footer';

interface PortalLayoutProps {
  children: React.ReactNode;
}

export const PortalLayout: React.FC<PortalLayoutProps> = ({ children }) => {
  const role = useStore((state) => state.role);
  const logout = useStore((state) => state.logout);
  const fetchInitialData = useStore((state) => state.fetchInitialData);
  const location = useLocation();
  const navigate = useNavigate();

  React.useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(3);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const notifications = [
    {
      id: 'n-1',
      title: 'New Incident Verified',
      message: 'Assam Flood Simulation verified on-chain by AI agents.',
      time: '10m ago',
      unread: true,
      type: 'incident',
    },
    {
      id: 'n-2',
      title: 'Pending Fund Request',
      message: 'SEEDS Relief Organization requested ₹15,00,000.',
      time: '1h ago',
      unread: true,
      type: 'fund',
    },
    {
      id: 'n-3',
      title: 'Disbursement Complete',
      message: 'Red Cross India Council fund transaction confirmed on ledger.',
      time: '3h ago',
      unread: false,
      type: 'blockchain',
    }
  ];

  const isGovPath = location.pathname.startsWith('/gov') || location.pathname.startsWith('/government');
  const isGov = role === 'government' || isGovPath;

  // Features list for NGO vs Government
  const govItems = [
    { label: 'Dashboard', path: '/gov/dashboard', icon: LayoutDashboard },
    { label: 'AI Incident Room', path: '/command-center', icon: Cpu },
    { label: 'Active Incidents', path: '/gov/active', icon: AlertTriangle },
    { label: 'Past Archives', path: '/gov/past', icon: History },
    { label: 'Fund Sanctions', path: '/gov/requests', icon: ClipboardList },
    { label: 'On-Chain Ledger', path: '/gov/blockchain', icon: Link2 },
    { label: 'Settings', path: '/gov/settings', icon: Settings },
  ];

  const ngoItems = [
    { label: 'Dashboard', path: '/ngo/dashboard', icon: LayoutDashboard },
    { label: 'Assigned Incidents', path: '/ngo/assigned', icon: AlertTriangle },
    { label: 'Mission Tasks', path: '/ngo/tasks', icon: CheckSquare },
    { label: 'Funding Requests', path: '/ngo/requests', icon: DollarSign },
    { label: 'NGO Profile', path: '/ngo/profile', icon: User },
  ];

  const items = isGov ? govItems : ngoItems;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col font-sans relative text-slate-800 bg-[#EAF0F6] select-none overflow-x-hidden">
      
      {/* ─── AMBIENT SOFT LIGHTING ─── */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div
          className="absolute -top-40 -left-40 w-[650px] h-[650px] rounded-full opacity-40 blur-3xl"
          style={{
            background: isGov
              ? 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%)'
              : 'radial-gradient(circle, rgba(16, 185, 129, 0.16) 0%, transparent 70%)',
          }}
        />
        <div
          className="absolute -bottom-40 -right-40 w-[650px] h-[650px] rounded-full opacity-40 blur-3xl"
          style={{
            background: isGov
              ? 'radial-gradient(circle, rgba(99, 102, 241, 0.12) 0%, transparent 70%)'
              : 'radial-gradient(circle, rgba(20, 184, 166, 0.14) 0%, transparent 70%)',
          }}
        />
      </div>

      <CustomCursor />

      {/* ─── SINGLE UNIFIED FLOATING NEUMORPHIC PORTAL NAVBAR ─── */}
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-5 inset-x-0 z-50 flex justify-center px-3 sm:px-6 pointer-events-none"
      >
        <div
          className="pointer-events-auto w-full max-w-7xl rounded-[2.2rem] px-4 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-2 sm:gap-4 transition-all duration-300"
          style={{
            backgroundColor: '#e0e5ec',
            boxShadow: '10px 10px 22px #bebebe, -10px -10px 22px #ffffff',
            border: '1.5px solid rgba(255, 255, 255, 0.85)',
          }}
        >
          {/* Left: Brand Identity */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
            <motion.div
              whileHover={{ scale: 1.08, rotate: -4 }}
              whileTap={{ scale: 0.94 }}
              className="p-2 rounded-2xl flex items-center justify-center cursor-pointer"
              style={{
                backgroundColor: '#e0e5ec',
                boxShadow: '4px 4px 8px #bebebe, -4px -4px 8px #ffffff',
              }}
            >
              <img
                src="/favicon.png"
                alt="AapdaSetu Logo"
                className="h-6 w-6 object-contain select-none filter drop-shadow-xs"
              />
            </motion.div>

            <div className="flex items-center gap-2">
              <span
                className="font-display text-base sm:text-lg font-black tracking-tight"
                style={{
                  background: isGov
                    ? 'linear-gradient(135deg, #1E3A8A 0%, #2563EB 60%, #059669 100%)'
                    : 'linear-gradient(135deg, #064e3b 0%, #059669 60%, #d97706 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                AapdaSetu
              </span>
              <span 
                className="text-[9px] font-mono font-black uppercase tracking-wider px-2 py-0.5 rounded-full hidden md:inline-flex"
                style={{
                  backgroundColor: '#e0e5ec',
                  boxShadow: 'inset 2px 2px 4px #bebebe, inset -2px -2px 4px #ffffff',
                  color: isGov ? '#1E3A8A' : '#065F46'
                }}
              >
                {isGov ? 'Gov' : 'NGO'}
              </span>
            </div>
          </Link>

          {/* Center: Inset Neumorphic Channel with Features (NO green scrollbar, fits cleanly) */}
          <nav
            className="flex-1 max-w-[680px] flex items-center justify-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-2xl overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
            style={{
              backgroundColor: '#e0e5ec',
              boxShadow: 'inset 4px 4px 8px #bebebe, inset -4px -4px 8px #ffffff',
            }}
          >
            {items.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path || (item.path !== '/gov/dashboard' && item.path !== '/ngo/dashboard' && location.pathname.startsWith(item.path));

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className="relative shrink-0"
                >
                  <motion.div
                    whileHover={{ scale: isActive ? 1 : 1.04, y: -1 }}
                    whileTap={{ scale: 0.96 }}
                    className={`flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                      isActive
                        ? 'text-white'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
                    }`}
                    style={
                      isActive
                        ? {
                            background: isGov
                              ? 'linear-gradient(135deg, #1E3A8A 0%, #2563EB 100%)'
                              : 'linear-gradient(135deg, #065F46 0%, #059669 50%, #10B981 100%)',
                            boxShadow: isGov
                              ? '4px 4px 12px rgba(37, 99, 235, 0.35), inset 1px 1px 2px rgba(255, 255, 255, 0.4)'
                              : '4px 4px 12px rgba(5, 150, 105, 0.35), inset 1px 1px 2px rgba(255, 255, 255, 0.4)',
                          }
                        : {}
                    }
                  >
                    <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                    <span className="text-[11px] sm:text-xs font-bold">{item.label}</span>
                    {isActive && (
                      <span className="h-1.5 w-1.5 rounded-full bg-white ml-0.5 animate-pulse" />
                    )}
                  </motion.div>
                </Link>
              );
            })}
          </nav>

          {/* Right: Notifications, Active Tag, Neumorphic Logout */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            
            {/* Neumorphic Notification Bell */}
            <div className="relative">
              <motion.button 
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setShowProfileMenu(false);
                  setUnreadCount(0);
                }}
                className="h-8.5 w-8.5 text-slate-700 hover:text-slate-900 rounded-xl relative cursor-pointer flex items-center justify-center transition-all"
                style={{
                  backgroundColor: '#e0e5ec',
                  boxShadow: showNotifications
                    ? 'inset 2px 2px 5px #bebebe, inset -2px -2px 5px #ffffff'
                    : '4px 4px 8px #bebebe, -4px -4px 8px #ffffff',
                }}
              >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white animate-pulse" />
                )}
              </motion.button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setShowNotifications(false)}
                  />
                  <div className="absolute right-0 mt-3 w-80 bg-white/95 backdrop-blur-xl border border-slate-200 rounded-3xl shadow-2xl z-50 overflow-hidden text-left animate-in fade-in zoom-in-95 duration-150">
                    <div className="p-3.5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                      <span className="font-display font-black text-xs uppercase tracking-wider text-slate-900">Alert Notifications</span>
                      <button 
                        onClick={() => setUnreadCount(0)}
                        className="text-xs text-emerald-700 hover:underline font-bold"
                      >
                        Clear
                      </button>
                    </div>
                    
                    <div className="max-h-[260px] overflow-y-auto divide-y divide-slate-100">
                      {notifications.map((n) => (
                        <div 
                          key={n.id} 
                          className="p-3 hover:bg-slate-50 transition-colors flex gap-2.5 cursor-pointer"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-slate-900 truncate">{n.title}</p>
                            <p className="text-[11px] text-slate-600 mt-0.5 leading-tight">{n.message}</p>
                            <p className="text-[9px] text-slate-400 mt-0.5 font-semibold font-mono">{n.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Active Role Tag */}
            <div 
              className="hidden lg:flex flex-col items-center justify-center px-2.5 py-1 rounded-xl text-center"
              style={{
                backgroundColor: '#e0e5ec',
                boxShadow: 'inset 2px 2px 4px #bebebe, inset -2px -2px 4px #ffffff',
              }}
            >
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[8px] font-mono font-black uppercase text-slate-400">ACTIVE</span>
              </div>
              <span className="text-[10px] font-bold text-slate-800 font-mono -mt-0.5">
                {isGov ? 'Gov Admin' : 'SEEDS NGO'}
              </span>
            </div>

            {/* Neumorphic Logout Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black text-rose-600 hover:text-rose-700 transition-all cursor-pointer"
              style={{
                backgroundColor: '#e0e5ec',
                boxShadow: '4px 4px 8px #bebebe, -4px -4px 8px #ffffff',
              }}
            >
              <LogOut className="h-3.5 w-3.5 text-rose-500" />
              <span className="hidden sm:inline">Logout</span>
            </motion.button>

          </div>

        </div>
      </motion.header>

      {/* ─── MAIN CONTENT (Clean Top Spacing Below Floating Navbar) ─── */}
      <main className="flex-1 px-4 sm:px-8 pt-24 sm:pt-28 pb-16 w-full relative z-10 max-w-7xl mx-auto">
        {children}
      </main>

      {/* ─── HOMEPAGE FOOTER (COUNTRYSIDE HORIZON) ─── */}
      <div className="relative z-20">
        <Footer />
      </div>

    </div>
  );
};

export default PortalLayout;
