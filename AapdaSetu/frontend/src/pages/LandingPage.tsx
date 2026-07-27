import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../hooks/useStore';
import { DisasterMap } from '../components/DisasterMap';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Activity, 
  HeartHandshake,
  Compass,
  Clock,
  Zap,
  Lock,
  Layers,
  Maximize2,
  ShieldAlert,
  Wallet,
  Heart,
  ArrowRight
} from 'lucide-react';
import { HeroGeometric } from '../components/ui/shape-landing-hero';


export const LandingPage: React.FC = () => {
  const [showSplash, setShowSplash] = useState(() => {
    const skip = sessionStorage.getItem('skip-preloader-on-logout');
    const seen = sessionStorage.getItem('has-seen-preloader');
    if (skip === 'true' || seen === 'true') {
      sessionStorage.removeItem('skip-preloader-on-logout');
      return false;
    }
    return true;
  });
  const [videoEnded, setVideoEnded] = useState(() => {
    const skip = sessionStorage.getItem('skip-preloader-on-logout');
    const seen = sessionStorage.getItem('has-seen-preloader');
    return (skip === 'true' || seen === 'true');
  });

  const disasters = useStore((state) => state.disasters);
  const fundRequests = useStore((state) => state.fundRequests);
  const blockchainTxs = useStore((state) => state.blockchainTxs);
  const fetchInitialData = useStore((state) => state.fetchInitialData);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  useEffect(() => {
    if (window.location.hash === '#how-it-works') {
      const timer = setTimeout(() => {
        const element = document.getElementById('how-it-works');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [disasters]);

  // Compute live database metrics
  const liveDisastersCount = disasters.filter(d => d.status === 'published').length;
  
  const totalFunds = blockchainTxs.reduce((sum, tx) => sum + tx.amount, 0);
  let formattedFunds = "₹0";
  if (totalFunds >= 10000000) {
    formattedFunds = `₹${(totalFunds / 10000000).toFixed(2)} Cr+`;
  } else if (totalFunds >= 100000) {
    formattedFunds = `₹${(totalFunds / 100000).toFixed(2)} Lakh+`;
  } else if (totalFunds > 0) {
    formattedFunds = `₹${totalFunds.toLocaleString('en-IN')}`;
  }

  const totalPeopleHelped = disasters.filter(d => d.status === 'published').reduce((sum, d) => sum + (d.population || 0), 0);
  const formattedPeopleHelped = totalPeopleHelped > 0 ? `${totalPeopleHelped.toLocaleString('en-IN')}+` : "0";

  const uniqueNGOs = new Set([
    ...fundRequests.map(r => r.ngo),
    ...blockchainTxs.map(t => t.ngo)
  ].filter(Boolean));
  const activeNGOsCount = uniqueNGOs.size;

  const handleIntroComplete = React.useCallback(() => {
    setVideoEnded(true);
    sessionStorage.setItem('has-seen-preloader', 'true');
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 200);
    return () => clearTimeout(timer);
  }, []);

  // Helper to format date string into "Xh ago"
  const formatTimeAgo = (dateString?: string) => {
    if (!dateString) return '4h ago';
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      if (isNaN(diffMs)) return '4h ago';
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 60) return `${Math.max(1, diffMins)}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays}d ago`;
    } catch {
      return '4h ago';
    }
  };

  // Live alerts from database
  const liveAlerts = disasters.filter(d => d.status === 'published');

  // How it works steps matching the mockup image
  const workflowSteps = [
    { step: '1', title: '1. Detect', desc: 'AI monitors multiple data sources', color: 'bg-emerald-50/70 text-emerald-700 border-emerald-100', icon: Activity },
    { step: '2', title: '2. Assess', desc: 'Risk assessment and verification', color: 'bg-indigo-50/70 text-indigo-700 border-indigo-100', icon: Compass },
    { step: '3', title: '3. Plan', desc: 'Mission planning and resources', color: 'bg-blue-50/70 text-blue-700 border-blue-100', icon: Layers },
    { step: '4', title: '4. Allocate', desc: 'Optimize resources and teams', color: 'bg-amber-50/70 text-amber-700 border-amber-100', icon: Zap },
    { step: '5', title: '5. Fund', desc: 'Blockchain fund release', color: 'bg-teal-50/70 text-teal-700 border-teal-100', icon: Lock },
    { step: '6', title: '6. Deliver', desc: 'Relief delivered and monitored', color: 'bg-rose-50/70 text-rose-700 border-rose-100', icon: HeartHandshake }
  ];



  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Intro Splash Preloader */}
      <AnimatePresence>
        {showSplash && (
          <motion.div
            key="splash-screen"
            exit={{ opacity: 0, transition: { duration: 0.3, ease: 'easeInOut' } }}
            className={`fixed inset-0 z-[99999] flex flex-col items-center justify-center select-none overflow-hidden transition-colors duration-200 ${videoEnded ? 'bg-transparent' : 'bg-black'}`}
          >
            {/* Skip button */}
            {!videoEnded && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.6 }}
                whileHover={{ opacity: 1, scale: 1.05 }}
                onClick={handleIntroComplete}
                className="absolute top-6 right-6 px-4 py-2 text-xs font-semibold text-slate-300 bg-white/5 hover:bg-white/10 border border-slate-700/50 rounded-full transition-all cursor-pointer z-[100000] flex items-center gap-1 backdrop-blur-md"
              >
                Skip <ArrowRight className="h-3 w-3" />
              </motion.button>
            )}

            {!videoEnded ? (
              <video
                autoPlay
                muted
                playsInline
                preload="auto"
                controls={false}
                className="absolute inset-0 w-full h-full object-cover"
                onEnded={handleIntroComplete}
              >
                <source src="/Preloader.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            ) : (
              <div className="flex flex-col items-center justify-center relative z-10">
                <motion.img
                  layoutId="logo-box"
                  src="/favicon.png"
                  alt="AapdaSetu Logo"
                  className="h-32 w-32 object-contain select-none"
                  transition={{ type: 'spring', stiffness: 140, damping: 18 }}
                />
                <motion.span
                  layoutId="logo-text"
                  className="font-display text-4xl font-extrabold text-[#0f172a] tracking-tight mt-4"
                  transition={{ type: 'spring', stiffness: 140, damping: 18 }}
                >
                  AapdaSetu
                </motion.span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Hero Geometric Section */}
      <HeroGeometric 
        badge="AI-Powered Crisis Intelligence Suite"
        title2="Disaster Intelligence & Relief Ecosystem"
      />

      {/* ─── METRICS ROW ─── */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 -mt-8 relative z-20">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card 1: Live Disasters */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <ShieldAlert className="h-4.5 w-4.5 text-orange-500 shrink-0" />
                <span className="text-[10px] font-mono font-extrabold uppercase tracking-wider text-slate-500">Live Disasters</span>
              </div>
              <div className="text-3xl font-display font-black text-slate-900 mt-1">{liveDisastersCount}</div>
              <div className="text-xs text-slate-500 font-medium mt-1">Across India</div>
            </div>
            <Link to="/command-center" className="text-[11px] text-slate-700 font-bold mt-4 flex items-center gap-0.5 hover:text-slate-900 transition-colors group">
              View all <span className="group-hover:translate-x-0.5 transition-transform">&rarr;</span>
            </Link>
          </div>

          {/* Card 2: Funds Raised */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Wallet className="h-4.5 w-4.5 text-emerald-500 shrink-0" />
                <span className="text-[10px] font-mono font-extrabold uppercase tracking-wider text-slate-500">Funds Raised</span>
              </div>
              <div className="text-3xl font-display font-black text-slate-900 mt-1">{formattedFunds}</div>
              <div className="text-xs text-slate-500 font-medium mt-1">Blockchain Verified</div>
            </div>
            <Link to="/blockchain" className="text-[11px] text-slate-700 font-bold mt-4 flex items-center gap-0.5 hover:text-slate-900 transition-colors group">
              View details <span className="group-hover:translate-x-0.5 transition-transform">&rarr;</span>
            </Link>
          </div>

          {/* Card 3: People Helped */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4.5 w-4.5 text-purple-500 shrink-0" />
                <span className="text-[10px] font-mono font-extrabold uppercase tracking-wider text-slate-500">People Helped</span>
              </div>
              <div className="text-3xl font-display font-black text-slate-900 mt-1">{formattedPeopleHelped}</div>
              <div className="text-xs text-slate-500 font-medium mt-1">Lives Impacted</div>
            </div>
            <span className="text-[11px] text-slate-700 font-bold mt-4 flex items-center gap-0.5 hover:text-slate-900 transition-colors group cursor-pointer">
              View impact <span className="group-hover:translate-x-0.5 transition-transform">&rarr;</span>
            </span>
          </div>

          {/* Card 4: NGOs Active */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Heart className="h-4.5 w-4.5 text-amber-500 shrink-0" />
                <span className="text-[10px] font-mono font-extrabold uppercase tracking-wider text-slate-500">NGOs Active</span>
              </div>
              <div className="text-3xl font-display font-black text-slate-900 mt-1">{activeNGOsCount}</div>
              <div className="text-xs text-slate-500 font-medium mt-1">On Ground</div>
            </div>
            <Link to="/login" className="text-[11px] text-slate-700 font-bold mt-4 flex items-center gap-0.5 hover:text-slate-900 transition-colors group">
              View NGOs <span className="group-hover:translate-x-0.5 transition-transform">&rarr;</span>
            </Link>
          </div>

        </div>
      </section>

      {/* ─── HOW AAPDASETU WORKS ─── */}
      <section id="how-it-works" className="mx-auto max-w-7xl px-4 sm:px-6 py-16 scroll-mt-20">
        <div className="text-center mb-10">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#059669] bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
            HOW AAPDASETU WORKS
          </span>
        </div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 relative"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.1 } }
          }}
        >
          {workflowSteps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={idx}
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 15 } }
                }}
                whileHover={{ y: -6, scale: 1.02 }}
                className="relative bg-white rounded-2xl border border-slate-200 p-6 flex flex-col items-center text-center shadow-card hover:shadow-card-hover hover:border-emerald-500/30 transition-all duration-300 group overflow-hidden"
              >
                {/* Accent Background Glow on Hover */}
                <div className="absolute inset-0 bg-gradient-to-b from-slate-50/50 to-white -z-10 group-hover:from-emerald-50/20 group-hover:to-white transition-all duration-300" />
                
                {/* Step Number Badge */}
                <span className="absolute top-4 right-4 text-[10px] font-mono font-extrabold text-slate-300 group-hover:text-emerald-600/40 transition-colors">
                  0{idx + 1}
                </span>

                {/* Animated Icon Container */}
                <div className={`h-12 w-12 rounded-2xl ${step.color} flex items-center justify-center border shadow-xs group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 mb-4`}>
                  <Icon className="h-5.5 w-5.5" />
                </div>

                {/* Title & Desc */}
                <h4 className="font-display font-bold text-slate-800 text-sm leading-tight group-hover:text-emerald-700 transition-colors">
                  {step.title.split('. ')[1]}
                </h4>
                <p className="text-[11px] text-slate-400 mt-2 font-semibold leading-relaxed">
                  {step.desc}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      {/* ─── SPLIT SECTION: MAP & RECENT ALERTS ─── */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-4 grid lg:grid-cols-12 gap-8">
        
        {/* Live Disaster Map Card (Left) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-5 shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-md font-mono font-bold text-[#059669] uppercase tracking-wider">
              LIVE DISASTER MAP
            </h3>
            <button className="text-xs font-mono font-bold text-slate-500 hover:text-slate-900 flex items-center gap-1 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 cursor-pointer">
              <Maximize2 className="h-3.5 w-3.5" />
              View Fullscreen Map
            </button>
          </div>
          <div className="relative rounded-xl overflow-hidden h-[380px] border border-slate-100">
            <DisasterMap />
            {/* Custom Mockup Legend Overlaid on Map */}
            <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-md rounded-xl p-3 border border-slate-200/80 shadow-md font-mono text-[10px] space-y-1.5 z-[1000]">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-red-500" />
                <span className="font-bold text-slate-700">Critical</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-orange-500" />
                <span className="font-bold text-slate-700">High</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-yellow-500" />
                <span className="font-bold text-slate-700">Medium</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span className="font-bold text-slate-700">Low</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Alerts Column (Right) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-5 shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-md font-mono font-bold text-[#059669] uppercase tracking-wider">
              RECENT ALERTS
            </h3>
            <Link to="/command-center" className="text-xs font-mono font-bold text-slate-500 hover:text-slate-900 flex items-center gap-0.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
              View all &rarr;
            </Link>
          </div>

          <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
            {liveAlerts.length === 0 ? (
              <div className="text-center py-12 text-slate-400 font-medium text-xs">
                No active alerts recorded at the moment.
              </div>
            ) : (
              liveAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-100 rounded-xl hover:shadow-xs hover:border-slate-200 transition-all"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[14px] text-slate-900">{alert.name}</span>
                      <span className={`text-[9px] font-mono font-extrabold uppercase px-2 py-0.5 rounded-md border ${
                        alert.severity === 'critical'
                          ? 'text-red-700 bg-red-50 border-red-200'
                          : alert.severity === 'high'
                          ? 'text-orange-700 bg-orange-50 border-orange-200'
                          : 'text-yellow-700 bg-yellow-50 border-yellow-200'
                      }`}>
                        {alert.severity}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 font-semibold">
                      {alert.state} • {(alert.population || 0).toLocaleString('en-IN')} affected
                    </div>
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono font-bold flex items-center gap-1 shrink-0">
                    <Clock className="h-3 w-3" />
                    {formatTimeAgo(alert.reportedAt)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </section>





    </div>
  );
};

export default LandingPage;
