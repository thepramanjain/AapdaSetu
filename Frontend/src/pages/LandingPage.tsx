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
  ArrowRight,
  CheckCircle,
  Star,
  Globe,
  Camera,
  Sparkles,
} from 'lucide-react';
import { HeroGeometric } from '../components/ui/shape-landing-hero';
import DepthCarousel from '../components/ui/DepthCarousel';
import ThreeInteractiveWave from '../components/ThreeInteractiveWave';

// ─── Animated Counter ──────────────────────────────────────────────
function AnimatedCounter({ value, duration = 1.5 }: { value: number; duration?: number }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    if (value === 0) return;
    let start = 0;
    const steps = 40;
    const increment = value / steps;
    const stepDuration = (duration * 1000) / steps;
    const timer = setInterval(() => {
      start += increment;
      if (start >= value) { setDisplay(value); clearInterval(timer); }
      else setDisplay(Math.floor(start));
    }, stepDuration);
    return () => clearInterval(timer);
  }, [value, duration]);
  return <>{display}</>;
}

export const LandingPage: React.FC = () => {
  // EXACT ORIGINAL PRELOADER STATE
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

  useEffect(() => { fetchInitialData(); }, [fetchInitialData]);

  useEffect(() => {
    if (window.location.hash === '#how-it-works') {
      const timer = setTimeout(() => {
        const el = document.getElementById('how-it-works');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [disasters]);

  const handleIntroComplete = React.useCallback(() => {
    setVideoEnded(true);
    sessionStorage.setItem('has-seen-preloader', 'true');
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 200);
    return () => clearTimeout(timer);
  }, []);

  // Safety fallback: if preloader is stuck for any reason, dismiss it automatically
  useEffect(() => {
    if (showSplash && !videoEnded) {
      const fallbackTimer = setTimeout(() => {
        handleIntroComplete();
      }, 1500);
      return () => clearTimeout(fallbackTimer);
    }
  }, [showSplash, videoEnded, handleIntroComplete]);

  const liveDisastersCount = disasters.filter(d => d.status === 'published').length;
  const totalFunds = blockchainTxs.reduce((sum, tx) => sum + tx.amount, 0);
  let formattedFunds = '₹0';
  if (totalFunds >= 10000000) formattedFunds = `₹${(totalFunds / 10000000).toFixed(1)}Cr+`;
  else if (totalFunds >= 100000) formattedFunds = `₹${(totalFunds / 100000).toFixed(1)}L+`;
  else if (totalFunds > 0) formattedFunds = `₹${totalFunds.toLocaleString('en-IN')}`;

  const totalPeopleHelped = disasters.filter(d => d.status === 'published').reduce((sum, d) => sum + (d.population || 0), 0);
  const formattedPeopleHelped = totalPeopleHelped > 0 ? `${totalPeopleHelped.toLocaleString('en-IN')}+` : '0';

  const uniqueNGOs = new Set([
    ...fundRequests.map(r => r.ngo),
    ...blockchainTxs.map(t => t.ngo),
  ].filter(Boolean));
  const activeNGOsCount = uniqueNGOs.size;

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
      return `${Math.floor(diffHours / 24)}d ago`;
    } catch { return '4h ago'; }
  };

  const liveAlerts = disasters.filter(d => d.status === 'published');

  const carouselItems = [
    {
      image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=1000&auto=format&fit=crop',
      alt: 'Flood Rescue Mission Assam',
      title: 'Flood Rescue Mission',
      category: 'Assam • Active',
      description: 'Multi-team emergency water rescue with NDRF deployment along Brahmaputra river valley.',
      badge: 'LIVE FEED',
    },
    {
      image: 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?q=80&w=1000&auto=format&fit=crop',
      alt: 'Food Relief Ration Distribution',
      title: 'Food Relief Operations',
      category: 'Bihar • Relief',
      description: 'AI-coordinated ration distribution to 4,200+ flood-displaced families in relief camps.',
      badge: '4.2K Families',
    },
    {
      image: 'https://images.unsplash.com/photo-1509099836639-18ba1795216d?q=80&w=1000&auto=format&fit=crop',
      alt: 'Medical Rescue Operations',
      title: 'Medical Response Unit',
      category: 'Odisha • Medical',
      description: 'Advanced trauma teams with mobile ICUs and AI triage deployed to cyclone-hit coastal zones.',
      badge: '2,800 Treated',
    },
    {
      image: 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb0?q=80&w=1000&auto=format&fit=crop',
      alt: 'On-Chain Relief Disbursement',
      title: 'Blockchain Fund Release',
      category: 'DeFi • Verified',
      description: 'Zero-knowledge verified on-chain relief treasury disbursement to 42 accredited ground NGOs.',
      badge: '₹57L Released',
    },
    {
      image: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?q=80&w=1000&auto=format&fit=crop',
      alt: 'Emergency Command Center',
      title: 'Command Node',
      category: 'NDMA • Control',
      description: 'Unified state and central emergency operations room with live multi-layer heatmaps.',
      badge: '24/7 Active',
    },
  ];

  const workflowSteps = [
    { title: 'Detect', desc: 'AI monitors satellite & sensor data streams', color: '#10B981', icon: Activity },
    { title: 'Assess', desc: 'Risk scoring & multi-source verification', color: '#06B6D4', icon: Compass },
    { title: 'Plan', desc: 'Mission strategy & resource mapping', color: '#6366F1', icon: Layers },
    { title: 'Allocate', desc: 'Optimize deployments and ground teams', color: '#F59E0B', icon: Zap },
    { title: 'Fund', desc: 'On-chain treasury release & lock-up', color: '#14B8A6', icon: Lock },
    { title: 'Deliver', desc: 'Relief dispatched and tracked live', color: '#F43F5E', icon: HeartHandshake },
  ];

  const statCards = [
    {
      label: 'Live Disasters', value: liveDisastersCount, sub: 'Across India', icon: ShieldAlert,
      iconColor: '#EA580C', link: '/command-center', linkLabel: 'View all',
    },
    {
      label: 'Funds Raised', value: formattedFunds, sub: 'Blockchain Verified', icon: Wallet,
      iconColor: '#10B981', link: '/blockchain', linkLabel: 'View details',
    },
    {
      label: 'People Helped', value: formattedPeopleHelped, sub: 'Lives Impacted', icon: Users,
      iconColor: '#8B5CF6', link: null, linkLabel: 'View impact',
    },
    {
      label: 'NGOs Active', value: activeNGOsCount, sub: 'On Ground', icon: Heart,
      iconColor: '#F59E0B', link: '/login', linkLabel: 'View NGOs',
    },
  ];

  return (
    <div className="min-h-screen relative bg-transparent">
      
      {/* EXACT ORIGINAL PRELOADER VIDEO RESTORATION */}
      <AnimatePresence>
        {showSplash && (
          <motion.div
            key="splash-screen"
            exit={{ opacity: 0, transition: { duration: 0.3, ease: 'easeInOut' } }}
            className={`fixed inset-0 z-[99999] flex flex-col items-center justify-center select-none overflow-hidden transition-colors duration-200 ${videoEnded ? 'bg-transparent' : 'bg-black'}`}
          >
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

      {/* Hero Section */}
      <HeroGeometric
        badge="Autonomous AI & Blockchain Suite"
      />

      {/* ─── Lower Sections with Interactive 3D WebGL Three.js Wave Background ─── */}
      <div className="relative">
        <ThreeInteractiveWave className="opacity-70" />

        {/* ─── STAT CARDS (Enlarged & Rich 3D Hover Effects Matching Screenshot 2) ─── */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 pt-16 pb-12 relative z-20">
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 items-end"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
            variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}
          >
            {statCards.map((card, i) => {
              const Icon = card.icon;
              // Pastel background shades for top badges
              const pastelBgs = ['#FEE2E2', '#D1FAE5', '#EDE9FE', '#FEF3C7'];
              const pastelBg = pastelBgs[i % pastelBgs.length];

              return (
                <motion.div
                  key={i}
                  variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } }}
                  whileHover={{ y: -10, scale: 1.02 }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                  className="flex flex-col items-center group cursor-pointer select-none"
                >
                  {/* Top Pastel Badge Shape - Enlarged with Floating Glow */}
                  <div className="relative w-32 h-32 flex items-center justify-center -mb-9 z-10">
                    <div
                      className="absolute inset-0 rounded-[2.2rem] transform group-hover:scale-110 group-hover:-translate-y-1 transition-all duration-400 shadow-md"
                      style={{
                        backgroundColor: pastelBg,
                        boxShadow: `0 10px 25px -5px ${pastelBg}90`,
                      }}
                    />
                    {/* Floating Icon Chip */}
                    <div
                      className="relative z-10 w-14 h-14 bg-white rounded-2xl shadow-lg flex items-center justify-center border border-slate-100/90 group-hover:-translate-y-2 group-hover:scale-105 transition-all duration-300"
                      style={{
                        boxShadow: `0 8px 20px -4px ${card.iconColor}35`,
                      }}
                    >
                      <Icon className="h-7 w-7 transition-transform duration-300 group-hover:scale-110" style={{ color: card.iconColor }} />
                    </div>
                  </div>

                  {/* Card Container - Bigger Size & Luxury Shadow */}
                  <div className="w-full bg-white rounded-3xl p-7 pt-12 text-left border border-slate-200/80 shadow-[0_10px_35px_rgba(0,0,0,0.06)] group-hover:shadow-[0_22px_50px_rgba(0,0,0,0.12)] group-hover:border-slate-300 transition-all duration-400 flex flex-col justify-between min-h-[210px]">
                    <div>
                      <span className="text-[11px] font-mono font-black uppercase tracking-widest text-slate-500 block mb-1">
                        {card.label}
                      </span>
                      <div className="text-4xl sm:text-5xl font-display font-black text-slate-900 leading-none tracking-tight my-2">
                        {typeof card.value === 'number' ? (
                          <AnimatedCounter value={card.value} />
                        ) : (
                          card.value
                        )}
                      </div>
                      <div className="text-xs sm:text-sm font-semibold text-slate-500 mt-1">
                        {card.sub}
                      </div>
                    </div>

                    <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between">
                      {card.link ? (
                        <Link
                          to={card.link}
                          className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider transition-all duration-200 group-hover:gap-2.5"
                          style={{ color: card.iconColor }}
                        >
                          <span>{card.linkLabel}</span>
                          <span className="transition-transform duration-200 group-hover:translate-x-1 inline-block">→</span>
                        </Link>
                      ) : (
                        <span
                          className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider cursor-pointer group-hover:gap-2.5 transition-all duration-200"
                          style={{ color: card.iconColor }}
                        >
                          <span>{card.linkLabel}</span>
                          <span className="transition-transform duration-200 group-hover:translate-x-1 inline-block">→</span>
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </section>

        {/* ─── 3D GSAP DEPTH CAROUSEL SHOWCASE SECTION (Matching Screenshot 1) ─── */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 py-8 relative z-20">
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="w-full"
          >
            <DepthCarousel />
          </motion.div>
        </section>

      {/* HOW AAPDASETU WORKS - Horizontal Marquee */}
      <section
        id="how-it-works"
        className="mx-auto max-w-7xl px-4 sm:px-6 pt-16 pb-4 scroll-mt-24 relative z-20"
      >
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-4 text-xs font-mono font-black uppercase tracking-wider text-emerald-900"
            style={{
              backgroundColor: '#E4E9F2',
              boxShadow: '4px 4px 10px #b8c4d9, -4px -4px 10px #ffffff',
            }}
          >
            <Globe className="h-3.5 w-3.5 text-emerald-600" />
            HOW AAPDASETU WORKS
          </div>
          <h2 className="font-display font-black text-3xl md:text-4xl text-slate-900">
            Six-Stage Autonomous Pipeline
          </h2>
          <p className="text-base font-medium mt-3 max-w-xl mx-auto text-slate-600">
            End-to-end multi-agent orchestration for instant disaster detection and relief dispatch
          </p>
        </motion.div>
      </section>

      {/* ─── MARQUEE STRIP (6-Stage Pipeline with Curved Borders & Pastel Shapes) ─── */}
      <div className="overflow-hidden w-full relative pt-4 pb-16 group z-20">
        <div className="flex w-max animate-marquee group-hover:[animation-play-state:paused]">
          {[...workflowSteps, ...workflowSteps].map((step, idx) => {
            const Icon = step.icon;
            const num = (idx % workflowSteps.length) + 1;
            return (
              <div
                key={idx}
                className="flex flex-col items-center mx-4 w-80 sm:w-84 flex-shrink-0 cursor-pointer group/card select-none transition-transform duration-400"
              >
                {/* Top Pastel Badge Shape - Enlarged with Floating Glow */}
                <div className="relative w-28 h-28 flex items-center justify-center -mb-8 z-10">
                  <div
                    className="absolute inset-0 rounded-[2rem] transform group-hover/card:scale-110 group-hover/card:-translate-y-1 transition-all duration-400 shadow-md"
                    style={{ backgroundColor: step.color + '22' }}
                  />
                  <div
                    className="relative z-10 w-14 h-14 bg-white rounded-2xl shadow-lg flex items-center justify-center border border-slate-100/90 group-hover/card:-translate-y-2 group-hover/card:rotate-6 group-hover/card:scale-105 transition-all duration-300"
                    style={{
                      boxShadow: `0 8px 20px -4px ${step.color}40`,
                    }}
                  >
                    <Icon className="h-7 w-7 transition-transform duration-300 group-hover/card:scale-110" style={{ color: step.color }} />
                  </div>
                  <span
                    className="absolute top-2.5 right-2.5 text-[11px] font-mono font-black px-2 py-0.5 rounded-md bg-white/95 text-slate-800 shadow-sm border border-slate-100"
                  >
                    0{num}
                  </span>
                </div>

                {/* Card Container - Bigger Size & Luxury Shadow */}
                <div
                  className="w-full bg-white rounded-3xl p-7 pt-12 text-left border border-slate-200/80 shadow-[0_8px_30px_rgba(0,0,0,0.06)] group-hover/card:shadow-[0_22px_50px_rgba(0,0,0,0.14)] group-hover/card:-translate-y-2.5 group-hover/card:scale-[1.02] group-hover/card:border-slate-300 transition-all duration-400 min-h-[190px] flex flex-col justify-between"
                  style={{
                    boxShadow: `0 8px 30px rgba(0,0,0,0.05)`,
                  }}
                >
                  <div>
                    <h4 className="font-display font-black text-xl text-slate-900 mb-2">
                      {step.title}
                    </h4>
                    <p className="text-xs sm:text-sm font-normal leading-relaxed text-slate-600">
                      {step.desc}
                    </p>
                  </div>

                  {/* Bottom Colored Accent Line with Glow on Hover */}
                  <div
                    className="h-1.5 w-full rounded-full mt-4 opacity-80 group-hover/card:opacity-100 group-hover/card:h-2 transition-all duration-300"
                    style={{
                      backgroundColor: step.color,
                      boxShadow: `0 2px 10px ${step.color}60`,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── FEATURE CARDS (AapdaSetu Disaster Intelligence Relevant) ─── */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-20 relative z-20">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-3 text-xs font-mono font-black uppercase tracking-wider text-emerald-900"
            style={{
              backgroundColor: '#E4E9F2',
              boxShadow: '4px 4px 10px #b8c4d9, -4px -4px 10px #ffffff',
            }}
          >
            <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
            CORE CAPABILITIES
          </div>
          <h2 className="font-display font-black text-3xl md:text-4xl text-slate-900">
            Why AapdaSetu?
          </h2>
          <p className="text-base font-medium mt-2 max-w-xl mx-auto text-slate-600">
            Built for scale, speed, and verifiable impact across India's disaster relief ecosystem
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 items-end">
          
          {/* Card 1: Airdrop Dispatch (Sage Green Oval + Airdrop/Box Tile) */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            whileHover={{ y: -10, scale: 1.02 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center group cursor-pointer select-none"
          >
            {/* Top Organic Pastel Badge Shape */}
            <div className="relative w-36 h-36 flex items-center justify-center -mb-9 z-10">
              {/* Sage Green Organic Oval */}
              <div className="absolute inset-0 rounded-[2.5rem] bg-[#C8D7BE] transform group-hover:scale-110 group-hover:-translate-y-1 transition-all duration-400 shadow-md" />
              {/* Floating White Icon Tile */}
              <div className="relative z-10 w-16 h-16 bg-white rounded-2xl shadow-lg flex items-center justify-center border border-slate-100 group-hover:-translate-y-2 group-hover:scale-105 transition-all duration-300">
                <svg className="w-7 h-7 text-emerald-700 transition-transform duration-300 group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 21h14" />
                </svg>
              </div>
            </div>

            {/* White Card Body with Curved Corners */}
            <div className="w-full bg-white rounded-3xl p-8 pt-14 text-left border border-slate-200/80 shadow-[0_10px_35px_rgba(0,0,0,0.06)] group-hover:shadow-[0_22px_50px_rgba(0,0,0,0.12)] group-hover:border-slate-300 transition-all duration-400 min-h-[240px] flex flex-col justify-start">
              <h4 className="font-display font-black text-xl text-slate-900 mb-2">
                Airdrop Dispatch
              </h4>
              <p className="text-slate-600 text-sm leading-relaxed font-normal">
                Autonomous drone payload tracking and verified emergency ration kit airdrops delivered straight to cut-off flood zones.
              </p>
            </div>
          </motion.div>

          {/* Card 2: Live Incident Grid (Sand Tan Circle + 4-Square Mockup) */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            whileHover={{ y: -10, scale: 1.02 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.08 }}
            className="flex flex-col items-center group cursor-pointer select-none"
          >
            {/* Top Organic Pastel Badge Shape */}
            <div className="relative w-36 h-36 flex items-center justify-center -mb-9 z-10">
              {/* Tan Circle */}
              <div className="absolute inset-0 rounded-full bg-[#E5DDD0] transform group-hover:scale-110 group-hover:-translate-y-1 transition-all duration-400 shadow-md" />
              {/* Floating 4-Square Grid Mockup */}
              <div className="relative z-10 grid grid-cols-2 gap-1.5 p-2.5 bg-white/95 rounded-2xl shadow-lg border border-white/80 group-hover:-translate-y-2 group-hover:scale-105 transition-all duration-300">
                <div className="w-5 h-5 rounded-md bg-[#3B82F6]" />
                <div className="w-5 h-5 rounded-md bg-white border border-slate-200" />
                <div className="w-5 h-5 rounded-md bg-white border border-slate-200" />
                <div className="w-5 h-5 rounded-md bg-[#10B981]" />
              </div>
            </div>

            {/* White Card Body with Curved Corners */}
            <div className="w-full bg-white rounded-3xl p-8 pt-14 text-left border border-slate-200/80 shadow-[0_10px_35px_rgba(0,0,0,0.06)] group-hover:shadow-[0_22px_50px_rgba(0,0,0,0.12)] group-hover:border-slate-300 transition-all duration-400 min-h-[240px] flex flex-col justify-start">
              <h4 className="font-display font-black text-xl text-slate-900 mb-2">
                Live Incident Grid
              </h4>
              <p className="text-slate-600 text-sm leading-relaxed font-normal">
                Unified command matrix syncing district collectors, NDRF units, and 200+ accredited NGOs in real time.
              </p>
            </div>
          </motion.div>

          {/* Card 3: AI Disaster Triage (Clay/Beige Circle + Search Bar Mockup) */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            whileHover={{ y: -10, scale: 1.02 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.16 }}
            className="flex flex-col items-center group cursor-pointer select-none"
          >
            {/* Top Organic Pastel Badge Shape */}
            <div className="relative w-36 h-36 flex items-center justify-center -mb-9 z-10">
              {/* Clay Circle */}
              <div className="absolute inset-0 rounded-full bg-[#E2DCDA] transform group-hover:scale-110 group-hover:-translate-y-1 transition-all duration-400 shadow-md" />
              {/* Watermark text */}
              <span className="absolute top-5 text-xs font-mono font-bold tracking-widest text-slate-600 select-none">
                AAPDA-AI
              </span>
              {/* Floating Search Pill Mockup */}
              <div className="relative z-10 mt-3 px-3 py-2 bg-white rounded-xl shadow-lg flex items-center gap-2 border border-slate-100 group-hover:-translate-y-2 group-hover:scale-105 transition-all duration-300">
                <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span className="text-[11px] font-mono font-bold text-slate-700">Scan Basin...</span>
              </div>
            </div>

            {/* White Card Body with Curved Corners */}
            <div className="w-full bg-white rounded-3xl p-8 pt-14 text-left border border-slate-200/80 shadow-[0_10px_35px_rgba(0,0,0,0.06)] group-hover:shadow-[0_22px_50px_rgba(0,0,0,0.12)] group-hover:border-slate-300 transition-all duration-400 min-h-[240px] flex flex-col justify-start">
              <h4 className="font-display font-black text-xl text-slate-900 mb-2">
                AI Disaster Triage
              </h4>
              <p className="text-slate-600 text-sm leading-relaxed font-normal">
                Multi-source sensor & satellite fusion detecting landslides, flood breaches, and cyclone paths under 90 seconds.
              </p>
            </div>
          </motion.div>

          {/* Card 4: Instant Release (Golden Mustard Circle + Play Button) */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            whileHover={{ y: -10, scale: 1.02 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.24 }}
            className="flex flex-col items-center group cursor-pointer select-none"
          >
            {/* Top Organic Pastel Badge Shape */}
            <div className="relative w-36 h-36 flex items-center justify-center -mb-9 z-10">
              {/* Yellow Mustard Circle */}
              <div className="absolute inset-0 rounded-full bg-[#ECC751] transform group-hover:scale-110 group-hover:-translate-y-1 transition-all duration-400 shadow-md" />
              {/* Floating White Circular Play Button */}
              <div className="relative z-10 w-15 h-15 p-3.5 bg-white rounded-full shadow-lg flex items-center justify-center border border-slate-100 group-hover:-translate-y-2 group-hover:scale-105 transition-all duration-300">
                <svg className="w-6 h-6 text-slate-900 fill-current translate-x-0.5" viewBox="0 0 24 24">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
              </div>
            </div>

            {/* White Card Body with Curved Corners */}
            <div className="w-full bg-white rounded-3xl p-8 pt-14 text-left border border-slate-200/80 shadow-[0_10px_35px_rgba(0,0,0,0.06)] group-hover:shadow-[0_22px_50px_rgba(0,0,0,0.12)] group-hover:border-slate-300 transition-all duration-400 min-h-[240px] flex flex-col justify-start">
              <h4 className="font-display font-black text-xl text-slate-900 mb-2">
                Instant On-Chain Release
              </h4>
              <p className="text-slate-600 text-sm leading-relaxed font-normal">
                Zero-knowledge cryptographic smart contracts disbursing emergency relief funds with complete on-chain auditability.
              </p>
            </div>
          </motion.div>

        </div>

        {/* ─── Center CTA Button ─── */}
        <div className="mt-14 flex justify-center">
          <Link
            to="/command-center"
            className="inline-flex items-center justify-center px-8 py-3.5 rounded-xl bg-[#111827] text-white text-sm font-semibold shadow-lg hover:bg-black hover:scale-105 active:scale-95 transition-all duration-200"
          >
            Explore Live Command Center →
          </Link>
        </div>
      </section>

      {/* SPLIT: ENLARGED MAP + ALERTS */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-6 grid lg:grid-cols-12 gap-6 relative z-20">

        {/* Left: Map (Enlarged & Sharp) */}
        <motion.div
          className="lg:col-span-7 p-6 neu-card space-y-4 rounded-3xl"
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          style={{
            boxShadow: '10px 10px 25px #b8c4d9, -10px -10px 25px #ffffff',
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 glow-pulse" />
              </span>
              <h3 className="text-sm font-mono font-black uppercase tracking-wider text-emerald-900">
                LIVE DISASTER MAP (LEAFLET TELEMETRY)
              </h3>
            </div>
            <button
              className="flex items-center gap-1.5 text-xs font-mono font-bold px-3.5 py-1.5 rounded-xl text-slate-700 hover:text-emerald-800 transition-colors cursor-pointer"
              style={{
                backgroundColor: '#E4E9F2',
                boxShadow: '3px 3px 6px #b8c4d9, -3px -3px 6px #ffffff',
              }}
            >
              <Maximize2 className="h-3.5 w-3.5" />
              Fullscreen
            </button>
          </div>

          <div
            className="relative rounded-2xl overflow-hidden h-[520px]"
            style={{
              boxShadow: '0 0 0 2px rgba(15,23,42,0.25), 0 8px 32px rgba(0,0,0,0.2)',
              border: '1.5px solid rgba(15,23,42,0.15)',
            }}
          >
            <DisasterMap />
          </div>
        </motion.div>

        {/* Right: Recent Alerts */}
        <motion.div
          className="lg:col-span-5 p-6 neu-card space-y-4 rounded-3xl flex flex-col justify-between"
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          style={{
            boxShadow: '10px 10px 25px #b8c4d9, -10px -10px 25px #ffffff',
          }}
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-mono font-black uppercase tracking-wider text-emerald-900">
                RECENT ALERTS FEED
              </h3>
              <Link
                to="/command-center"
                className="text-xs font-mono font-bold px-3 py-1.5 rounded-xl text-slate-700 hover:text-emerald-800 transition-colors"
                style={{
                  backgroundColor: '#E4E9F2',
                  boxShadow: '3px 3px 6px #b8c4d9, -3px -3px 6px #ffffff',
                }}
              >
                View all →
              </Link>
            </div>

            <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
              {liveAlerts.length === 0 ? (
                <div className="text-center py-12 text-xs font-medium text-slate-400">
                  No active alerts recorded.
                </div>
              ) : (
                liveAlerts.map((alert) => {
                  const severityColor: Record<string, string> = {
                    low: '#22c55e', medium: '#eab308', high: '#f97316', critical: '#ef4444'
                  };
                  const sc = severityColor[alert.severity] || '#6366f1';
                  return (
                    <div
                      key={alert.id}
                      className="flex items-center justify-between p-4 rounded-2xl shimmer-hover transition-all duration-300 hover:scale-[1.02] cursor-pointer"
                      style={{
                        backgroundColor: '#E4E9F2',
                        boxShadow: 'inset 3px 3px 6px #b8c4d9, inset -3px -3px 6px #ffffff',
                        borderLeft: `4px solid ${sc}`,
                      }}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span
                            className="h-2.5 w-2.5 rounded-full flex-shrink-0 animate-ping"
                            style={{ background: sc }}
                          />
                          <span className="font-bold text-sm text-slate-900">{alert.name}</span>
                          <span
                            className="text-[9px] font-mono font-black uppercase px-2 py-0.5 rounded-md"
                            style={{ background: `${sc}22`, color: sc, border: `1px solid ${sc}50` }}
                          >
                            {alert.severity}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-600 font-semibold pl-4">
                          {alert.state} • {(alert.population || 0).toLocaleString('en-IN')} affected
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-[11px] font-mono font-bold text-slate-500 ml-2 flex-shrink-0">
                        <Clock className="h-3.5 w-3.5" />
                        {formatTimeAgo(alert.reportedAt)}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </motion.div>

      </section>

      {/* DONOR & VOLUNTEER CTA SECTION - 3D Perspective Card */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-16 relative z-20">
        <motion.div
          className="neu-card-lg p-8 md:p-12 relative overflow-hidden transition-all duration-500 hover:shadow-[0_30px_60px_-15px_rgba(16,185,129,0.3)] hover:-translate-y-2 rounded-[2.5rem]"
          initial={{ opacity: 0, y: 40, rotateX: 8 }}
          whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, type: 'spring', bounce: 0.3 }}
          style={{
            transformStyle: 'preserve-3d',
            perspective: '1000px',
            boxShadow: '16px 16px 36px #b8c4d9, -16px -16px 36px #ffffff',
          }}
        >
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 transform translate-z-12">
            <div className="space-y-4 text-center md:text-left">
              <div
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono font-black uppercase tracking-wider text-amber-950"
                style={{
                  backgroundColor: '#E4E9F2',
                  boxShadow: '3px 3px 6px #b8c4d9, -3px -3px 6px #ffffff',
                }}
              >
                <Heart className="h-3.5 w-3.5 fill-current text-amber-600" />
                Donor & Volunteer Portal
              </div>
              <h2 className="font-display font-black text-3xl md:text-4xl text-slate-900">
                Support Relief or Join as a Volunteer
              </h2>
              <p className="text-base font-medium max-w-lg text-slate-600">
                Support verified relief operations on the ground with 100% on-chain transparency, 80G tax receipts, or enroll directly as an emergency field volunteer.
              </p>
            </div>

            <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0">
              <Link
                to="/donor"
                className="btn-neu-gold px-7 py-4 text-sm sm:text-base font-black flex items-center gap-2 rounded-2xl shadow-xl hover:scale-105 transition-transform"
              >
                <Heart className="h-5 w-5 fill-current text-amber-900" />
                Donate Now
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/donor"
                className="px-6 py-4 text-sm sm:text-base font-black rounded-2xl border-2 border-emerald-600/60 bg-emerald-50 text-emerald-900 hover:bg-emerald-100 flex items-center gap-2 shadow-md hover:scale-105 transition-all"
              >
                Volunteer On-Ground →
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

      </div>

    </div>
  );
};

export default LandingPage;
