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
  Sparkles,
  Radio,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { cn } from '../utils';
import CustomCursor from '../components/CustomCursor';
import ThreeBackground from '../components/ThreeBackground';
import { motion, AnimatePresence } from 'framer-motion';

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

  // Define middle navbar items based on role
  const govItems = [
    { label: 'Dashboard', path: '/gov/dashboard', icon: LayoutDashboard },
    { label: 'AI Incident Room', path: '/command-center', icon: Cpu },
    { label: 'Active Incidents', path: '/gov/active', icon: AlertTriangle },
    { label: 'Past Archives', path: '/gov/past', icon: History },
    { label: 'NGO Fund Sanctions', path: '/gov/requests', icon: ClipboardList },
    { label: 'Blockchain Ledger', path: '/gov/blockchain', icon: Link2 },
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
      
      {/* ─── SUBTLE 3D AMBIENT NODES (Lightweight & Smooth) ─── */}
      <ThreeBackground
        theme={isGov ? 'blue' : 'emerald'}
        particleCount={28}
        opacity={0.42}
        interactive={true}
      />

      {/* ─── MODERN CLEAN AMBIENT BACKGROUND (Light Soft Ambient Haze) ─── */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Soft Radial Ambient Lighting */}
        <div
          className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full opacity-40 blur-3xl"
          style={{
            background: isGov
              ? 'radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%)'
              : 'radial-gradient(circle, rgba(16, 185, 129, 0.12) 0%, transparent 70%)',
          }}
        />
        <div
          className="absolute -bottom-32 -right-32 w-[600px] h-[600px] rounded-full opacity-40 blur-3xl"
          style={{
            background: isGov
              ? 'radial-gradient(circle, rgba(99, 102, 241, 0.09) 0%, transparent 70%)'
              : 'radial-gradient(circle, rgba(20, 184, 166, 0.1) 0%, transparent 70%)',
          }}
        />
        {/* Soft Top Glow Light Haze */}
        <div
          className="absolute inset-0 opacity-25"
          style={{
            background: 'radial-gradient(ellipse at 50% 0%, rgba(255, 255, 255, 0.8) 0%, transparent 60%)',
          }}
        />
      </div>

      <CustomCursor />

      {/* ─── TOP HEADER BAR ─── */}
      <header className="relative z-40 bg-[#EAF0F6]/95 backdrop-blur-xl border-b border-slate-300/70 shadow-xs h-18 flex items-center justify-between px-4 sm:px-8 shrink-0">
        
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-3.5">
          <Link to="/" className="flex items-center gap-3 group">
            <img src="/logo.png" alt="AapdaSetu Logo" className="h-9 w-auto object-contain select-none group-hover:scale-105 transition-transform" />
            <span className="font-display font-black text-2xl text-slate-900 tracking-tight">
              Aapda<span className="text-emerald-700">Setu</span>
            </span>
          </Link>
          
          <span 
            className="hidden sm:inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono font-black uppercase tracking-wider text-emerald-900"
            style={{
              backgroundColor: '#E4E9F2',
              boxShadow: 'inset 2px 2px 5px #b8c4d9, inset -2px -2px 5px #ffffff',
            }}
          >
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping" />
            {isGov ? 'Gov Command Operations' : 'NGO Field Response Portal'}
          </span>
        </div>

        {/* Right: Notification & Profile */}
        <div className="flex items-center gap-3.5 sm:gap-5">
          
          {/* Notification Bell */}
          <div className="relative">
            <button 
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowProfileMenu(false);
                setUnreadCount(0);
              }}
              className="p-3 text-slate-700 hover:text-slate-900 rounded-2xl relative cursor-pointer flex items-center justify-center transition-all"
              style={{
                backgroundColor: '#E4E9F2',
                boxShadow: showNotifications 
                  ? 'inset 3px 3px 6px #b8c4d9, inset -3px -3px 6px #ffffff' 
                  : '4px 4px 8px #b8c4d9, -4px -4px 8px #ffffff',
              }}
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 h-3 w-3 rounded-full bg-rose-500 ring-2 ring-white animate-pulse" />
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setShowNotifications(false)}
                />
                <div className="absolute right-0 mt-3 w-88 bg-white/95 backdrop-blur-xl border border-slate-200/80 rounded-3xl shadow-2xl z-50 overflow-hidden text-left animate-in fade-in zoom-in-95 duration-150">
                  <div className="p-4.5 border-b border-slate-100 flex justify-between items-center bg-slate-50/90">
                    <span className="font-display font-black text-sm text-slate-900 uppercase tracking-wider">Alert Notifications</span>
                    <button 
                      onClick={() => setUnreadCount(0)}
                      className="text-xs text-emerald-700 hover:underline font-bold"
                    >
                      Clear All
                    </button>
                  </div>
                  
                  <div className="max-h-[300px] overflow-y-auto divide-y divide-slate-100">
                    {notifications.map((n) => (
                      <div 
                        key={n.id} 
                        className={cn(
                          "p-4 hover:bg-emerald-50/50 transition-colors flex gap-3.5 cursor-pointer",
                          n.unread && "bg-emerald-50/30"
                        )}
                      >
                        <div className="mt-0.5 shrink-0">
                          {n.type === 'incident' && (
                            <div className="h-8 w-8 rounded-xl bg-rose-100 flex items-center justify-center text-rose-600 border border-rose-200">
                              <AlertTriangle className="h-4.5 w-4.5" />
                            </div>
                          )}
                          {n.type === 'fund' && (
                            <div className="h-8 w-8 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 border border-amber-200">
                              <DollarSign className="h-4.5 w-4.5" />
                            </div>
                          )}
                          {n.type === 'blockchain' && (
                            <div className="h-8 w-8 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 border border-emerald-200">
                              <Link2 className="h-4.5 w-4.5" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs sm:text-sm font-bold text-slate-900 truncate">{n.title}</p>
                          <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{n.message}</p>
                          <p className="text-[10px] text-slate-400 mt-1 font-semibold font-mono">{n.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
          
          {/* User Profile Menu */}
          <div className="relative">
            <button 
              onClick={() => {
                setShowProfileMenu(!showProfileMenu);
                setShowNotifications(false);
              }}
              className="flex items-center gap-3 p-2 pr-4 rounded-2xl transition-all cursor-pointer text-left"
              style={{
                backgroundColor: '#E4E9F2',
                boxShadow: showProfileMenu 
                  ? 'inset 3px 3px 6px #b8c4d9, inset -3px -3px 6px #ffffff' 
                  : '4px 4px 8px #b8c4d9, -4px -4px 8px #ffffff',
              }}
            >
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-emerald-700 to-teal-800 text-white flex items-center justify-center font-black text-sm shadow-sm">
                {isGov ? 'G' : 'N'}
              </div>
              
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-sm font-black text-slate-900 leading-tight">
                  {isGov ? 'NDMA Command' : 'SEEDS Relief Hub'}
                </span>
                <span className="text-[10px] text-emerald-800 font-bold font-mono uppercase">
                  {isGov ? 'govt_admin_1' : 'ngo_manager_1'}
                </span>
              </div>
            </button>

            {/* Profile Dropdown Menu */}
            {showProfileMenu && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setShowProfileMenu(false)}
                />
                <div className="absolute right-0 mt-3 w-64 bg-white/95 backdrop-blur-xl border border-slate-200/80 rounded-3xl shadow-2xl z-50 overflow-hidden text-left animate-in fade-in zoom-in-95 duration-150">
                  <div className="p-4 border-b border-slate-100 bg-slate-50/80">
                    <p className="text-sm font-black text-slate-900">{isGov ? 'NDMA Center Node' : 'SEEDS Relief Team'}</p>
                    <p className="text-xs text-slate-500 font-mono mt-0.5">{isGov ? 'govt@ndma.gov.in' : 'relief@seedsindia.org'}</p>
                  </div>
                  
                  <div className="p-2 space-y-1">
                    <button 
                      onClick={() => {
                        setShowProfileMenu(false);
                        navigate(isGov ? '/gov/dashboard' : '/ngo/profile');
                      }}
                      className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-slate-700 hover:bg-emerald-50 hover:text-emerald-900 transition-colors cursor-pointer text-left"
                    >
                      <User className="h-4.5 w-4.5 text-emerald-600" />
                      View Profile
                    </button>
                    
                    <button 
                      onClick={() => {
                        setShowProfileMenu(false);
                        navigate(isGov ? '/gov/settings' : '/ngo/settings');
                      }}
                      className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-slate-700 hover:bg-emerald-50 hover:text-emerald-900 transition-colors cursor-pointer text-left"
                    >
                      <Settings className="h-4.5 w-4.5 text-emerald-600" />
                      Settings
                    </button>
                  </div>
                  
                  <div className="p-2 border-t border-slate-100">
                    <button 
                      onClick={() => {
                        setShowProfileMenu(false);
                        handleLogout();
                      }}
                      className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer text-left"
                    >
                      <LogOut className="h-4.5 w-4.5 text-rose-500" />
                      Log Out
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ─── MIDDLE DEPTH NEUMORPHIC NAVBAR STRIP (Larger & Crisp) ─── */}
      <div className="relative z-30 w-full py-5 px-4 sm:px-6 flex items-center justify-center">
        <div
          className="inline-flex p-2 rounded-2xl gap-2 sm:gap-2.5 max-w-full overflow-x-auto select-none"
          style={{
            backgroundColor: '#E4E9F2',
            boxShadow: 'inset 4px 4px 10px #b8c4d9, inset -4px -4px 10px #ffffff',
            border: '1px solid rgba(255, 255, 255, 0.7)',
          }}
        >
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || (item.path !== '/gov/dashboard' && item.path !== '/ngo/dashboard' && location.pathname.startsWith(item.path));

            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "relative flex items-center gap-2.5 px-4.5 sm:px-5 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer",
                  isActive
                    ? "text-emerald-950 font-black"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
                )}
                style={
                  isActive
                    ? {
                        backgroundColor: '#FFFFFF',
                        boxShadow: '6px 6px 14px #b8c4d9, -6px -6px 14px #ffffff',
                      }
                    : {}
                }
              >
                <Icon className={cn("h-4.5 w-4.5 shrink-0 transition-transform", isActive ? "text-emerald-600 scale-110" : "text-slate-500")} />
                <span>{item.label}</span>
                {isActive && (
                  <span className="h-2 w-2 rounded-full bg-emerald-500 ml-1 animate-pulse" />
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {/* ─── MAIN FULL-WIDTH PORTAL CONTENT ─── */}
      <main className="flex-1 overflow-y-auto px-4 sm:px-8 pb-16 w-full relative z-10">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>

    </div>
  );
};

export default PortalLayout;
