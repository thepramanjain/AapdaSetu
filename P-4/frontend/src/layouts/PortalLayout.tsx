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
  Menu,
  X,
  Bell,
  Activity
} from 'lucide-react';
import { cn } from '../utils';

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

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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

  const isGov = role === 'government';

  // Define sidebar items based on role
  const govItems = [
    { label: 'Home / Overview', path: '/gov/overview', icon: LayoutDashboard },
    { label: 'Live Disaster Map', path: '/gov/active', icon: Activity },
    { label: 'RWA Societies', path: '/gov/rwa', icon: User },
    { label: 'Heatwave Forecast', path: '/gov/heatwave', icon: AlertTriangle },
    { label: 'Analyze Incident', path: '/gov/analyze', icon: Cpu },
    { label: 'Pending Requests', path: '/gov/requests', icon: ClipboardList },
    { label: 'Blockchain Transparency', path: '/gov/blockchain', icon: Link2 },
    { label: 'Settings', path: '/gov/settings', icon: Settings },
  ];

  const ngoItems = [
    { label: 'Dashboard', path: '/ngo/dashboard', icon: LayoutDashboard },
    { label: 'Assigned Incidents', path: '/ngo/assigned', icon: AlertTriangle },
    { label: 'Mission Tasks', path: '/ngo/tasks', icon: CheckSquare },
    { label: 'Funding Requests', path: '/ngo/requests', icon: DollarSign },
    { label: 'Profile', path: '/ngo/profile', icon: User },
  ];

  const items = isGov ? govItems : ngoItems;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="h-screen bg-slate-50 flex flex-col font-sans overflow-hidden">
      {/* Top Navbar */}
      <header className="bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs h-16 flex items-center justify-between px-4 sm:px-6 shrink-0 z-40">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          
          <Link to="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="AapdaSetu Logo" className="h-8 w-auto object-contain select-none" />
            <span className="font-logo font-extrabold text-lg text-slate-900 tracking-tight">AapdaSetu</span>
          </Link>
          <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-200/50">
            {role === 'government' ? 'Gov Portal' : 'NGO Portal'}
          </span>
        </div>

        <div className="flex items-center gap-4">
          {/* Notification Bell */}
          <div className="relative">
            <button 
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowProfileMenu(false);
                setUnreadCount(0);
              }}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50 relative cursor-pointer flex items-center justify-center focus:outline-none"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white animate-pulse" />
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setShowNotifications(false)}
                />
                <div className="absolute right-[-80px] sm:right-0 mt-2 w-80 bg-white border border-slate-100 rounded-xl shadow-xl z-50 overflow-hidden text-left transform origin-top-right transition-all">
                  <div className="p-3.5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <span className="font-logo font-bold text-xs text-slate-800">Alert Notifications</span>
                    <button 
                      onClick={() => setUnreadCount(0)}
                      className="text-[10px] text-[#1A7151] hover:underline font-bold"
                    >
                      Clear All
                    </button>
                  </div>
                  
                  <div className="max-h-[280px] overflow-y-auto divide-y divide-slate-50">
                    {notifications.map((n) => (
                      <div 
                        key={n.id} 
                        className={cn(
                          "p-3 hover:bg-slate-50/80 transition-colors flex gap-2.5 cursor-pointer",
                          n.unread && "bg-[#1A7151]/[0.02]"
                        )}
                      >
                        <div className="mt-0.5 shrink-0">
                          {n.type === 'incident' && (
                            <div className="h-6 w-6 rounded-full bg-red-50 flex items-center justify-center text-red-600 border border-red-100">
                              <AlertTriangle className="h-3.5 w-3.5" />
                            </div>
                          )}
                          {n.type === 'fund' && (
                            <div className="h-6 w-6 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 border border-amber-100">
                              <DollarSign className="h-3.5 w-3.5" />
                            </div>
                          )}
                          {n.type === 'blockchain' && (
                            <div className="h-6 w-6 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100">
                              <Link2 className="h-3.5 w-3.5" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-800 truncate">{n.title}</p>
                          <p className="text-[10px] text-slate-500 mt-0.5 leading-normal">{n.message}</p>
                          <p className="text-[9px] text-slate-400 mt-1 font-semibold font-mono">{n.time}</p>
                        </div>
                        {n.unread && (
                          <div className="h-1.5 w-1.5 rounded-full bg-emerald-600 mt-2 self-start shrink-0" />
                        )}
                      </div>
                    ))}
                  </div>
                  
                  <div className="p-2 border-t border-slate-50 text-center bg-slate-50/30">
                    <span className="text-[10px] text-slate-400 font-bold">
                      End of notifications list
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
          
          <div className="h-8 w-px bg-slate-200" />
          
          {/* User Profile Menu */}
          <div className="relative">
            <button 
              onClick={() => {
                setShowProfileMenu(!showProfileMenu);
                setShowNotifications(false);
              }}
              className="flex items-center gap-3 hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer text-left focus:outline-none"
            >
              <div className="hidden md:flex flex-col text-right">
                <span className="text-xs font-bold text-slate-800 leading-tight">
                  {isGov ? 'NDMA Command Center' : 'SEEDS Team Lead'}
                </span>
                <span className="text-[10px] text-slate-400 font-bold font-mono uppercase">
                  {isGov ? 'govt_admin_1' : 'ngo_manager_1'}
                </span>
              </div>
              
              <div className="h-9 w-9 rounded-full bg-gradient-to-br from-[#1A7151] to-[#0B3321] text-white flex items-center justify-center font-bold text-sm shadow-md shadow-[#1A7151]/10 border border-[#1A7151]/20 select-none">
                {isGov ? 'G' : 'N'}
              </div>
            </button>

            {/* Profile Dropdown Menu */}
            {showProfileMenu && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setShowProfileMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-100 rounded-xl shadow-xl z-50 overflow-hidden text-left transform origin-top-right transition-all">
                  <div className="p-3.5 border-b border-slate-100 bg-slate-50/50">
                    <p className="text-xs font-extrabold text-slate-800 truncate">
                      {isGov ? 'National Disaster Management' : 'SEEDS India Relief'}
                    </p>
                    <p className="text-[10px] text-slate-400 font-bold mt-0.5 truncate">
                      {isGov ? 'govt_admin_1@ndma.gov.in' : 'seeds_lead@seedsindia.org'}
                    </p>
                  </div>
                  
                  <div className="p-1">
                    <button 
                      onClick={() => {
                        setShowProfileMenu(false);
                        navigate(isGov ? '/gov/profile' : '/ngo/profile');
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer text-left"
                    >
                      <User className="h-4 w-4 text-slate-400" />
                      View Profile
                    </button>
                    
                    <button 
                      onClick={() => {
                        setShowProfileMenu(false);
                        navigate(isGov ? '/gov/settings' : '/ngo/settings');
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer text-left"
                    >
                      <Settings className="h-4 w-4 text-slate-400" />
                      Settings
                    </button>
                  </div>
                  
                  <div className="p-1 border-t border-slate-100">
                    <button 
                      onClick={() => {
                        setShowProfileMenu(false);
                        logout();
                        navigate('/');
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold text-red-600 hover:bg-red-50 transition-colors cursor-pointer text-left"
                    >
                      <LogOut className="h-4 w-4 text-red-400" />
                      Log Out
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Left Sidebar - Desktop */}
        <aside className="hidden md:block w-64 border-r border-slate-200/80 bg-white h-full shrink-0 overflow-y-auto">
          <div className="flex flex-col justify-between h-full p-4">
            <nav className="space-y-1">
              {items.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 group hover:translate-x-1",
                      isActive 
                        ? "bg-emerald-50 text-emerald-700 border-l-4 border-emerald-600 shadow-xs" 
                        : "text-slate-600 hover:bg-slate-50/70 hover:text-slate-900"
                    )}
                  >
                    <Icon className={cn(
                      "h-4 w-4 shrink-0 transition-colors",
                      isActive ? "text-emerald-700" : "text-slate-400 group-hover:text-slate-600"
                    )} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="border-t border-slate-100 pt-4 mt-6">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-rose-600 hover:bg-rose-50/60 hover:text-rose-700 transition-all cursor-pointer"
              >
                <LogOut className="h-4 w-4 text-rose-500" />
                Logout
              </button>
            </div>
          </div>
        </aside>

        {/* Left Sidebar - Mobile Overlay */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-40 md:hidden flex">
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs" 
              onClick={() => setMobileMenuOpen(false)}
            />
            {/* Sidebar content */}
            <div className="relative w-64 max-w-xs bg-white h-full flex flex-col p-4 shadow-xl animate-slide-in">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                <span className="font-bold text-slate-800">AapdaSetu Navigation</span>
                <button 
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 rounded-lg text-slate-500 hover:bg-slate-100"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <nav className="space-y-1 flex-1">
                {items.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all",
                        isActive 
                          ? "bg-green-50 text-green-700 border-l-4 border-green-600" 
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      )}
                    >
                      <Icon className={cn("h-4 w-4", isActive ? "text-green-700" : "text-slate-400")} />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>

              <div className="border-t border-slate-100 pt-4 mt-6">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-all cursor-pointer"
                >
                  <LogOut className="h-4 w-4 text-rose-500" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Pane */}
        <main className="flex-1 overflow-y-auto p-6 sm:p-8 w-full bg-slate-50/40 relative grid-lines">
          {/* Decorative Glowing Spheres for Premium Command Hub Feel */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/[0.03] rounded-full blur-3xl pointer-events-none -translate-y-12 translate-x-12" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/[0.02] rounded-full blur-3xl pointer-events-none translate-y-24 -translate-x-24" />
          
          <div className="max-w-7xl mx-auto relative z-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default PortalLayout;
