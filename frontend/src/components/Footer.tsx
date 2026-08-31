import React from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../hooks/useStore';
import { ShieldCheck, Database, Radio, Sparkles, ArrowUpRight, PhoneCall, ArrowRight } from 'lucide-react';
import InteractiveCommunityCard from './InteractiveCommunityCard';

export const Footer: React.FC = () => {
  const role = useStore(state => state.role);

  const getPortalLink = (portalType: 'ngo' | 'government') => {
    if (role === portalType) return `/${portalType}/dashboard`;
    return `/login?role=${portalType}`;
  };

  return (
    <footer className="relative w-full overflow-hidden select-none bg-[#12162B] border-t border-slate-800/80">
      
      {/* ─── STREAMLINED ESSENTIALS & SOCIAL CONNECT BANNER ─── */}
      <div className="relative z-20 border-b border-white/10 bg-gradient-to-b from-[#181D3D]/95 to-[#12162B]/98 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-6 sm:px-10 py-10 lg:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center justify-between">
            
            {/* Left: Project Mission & Live Helplines (5 cols) */}
            <div className="lg:col-span-5 text-center lg:text-left space-y-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                NATIONAL EMERGENCY INTELLIGENCE GRID • ACTIVE
              </div>
              
              <div className="flex items-center justify-center lg:justify-start gap-3">
                <img src="/favicon.png" alt="AapdaSetu" className="h-9 w-9 object-contain" />
                <h3 className="font-display font-black text-2xl text-white tracking-tight">
                  AapdaSetu
                </h3>
              </div>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal max-w-md">
                India's decentralized disaster intelligence and on-chain emergency relief network. Bridging AI early warnings and transparent funding across 36 States & UTs.
              </p>

              {/* Helplines Pill */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-1">
                <a
                  href="tel:1078"
                  className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-xs font-mono font-bold text-emerald-300 transition-colors"
                >
                  <PhoneCall className="h-3.5 w-3.5" />
                  NDMA: 1078
                </a>
                <a
                  href="tel:112"
                  className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-xs font-mono font-bold text-rose-300 transition-colors"
                >
                  <PhoneCall className="h-3.5 w-3.5" />
                  Emergency: 112
                </a>
              </div>
            </div>

            {/* Center: Essential Curated Quick Links (3 cols) */}
            <div className="lg:col-span-3 text-center lg:text-left space-y-3">
              <h4 className="font-display font-black text-xs uppercase tracking-widest text-slate-400">
                Essential Portals
              </h4>
              <ul className="space-y-2 text-xs sm:text-sm font-medium text-[#C5CCE6]">
                <li>
                  <Link to="/command-center" className="hover:text-emerald-400 transition-colors flex items-center justify-center lg:justify-start gap-1.5">
                    <ArrowRight className="h-3 w-3 text-emerald-400" /> AI Command Center
                  </Link>
                </li>
                <li>
                  <Link to="/blockchain" className="hover:text-emerald-400 transition-colors flex items-center justify-center lg:justify-start gap-1.5">
                    <ArrowRight className="h-3 w-3 text-emerald-400" /> On-Chain Ledger
                  </Link>
                </li>
                <li>
                  <Link to="/donor" className="hover:text-emerald-400 transition-colors flex items-center justify-center lg:justify-start gap-1.5">
                    <ArrowRight className="h-3 w-3 text-emerald-400" /> 80G Relief Donations
                  </Link>
                </li>
                <li>
                  <Link to={getPortalLink('government')} className="hover:text-emerald-400 transition-colors flex items-center justify-center lg:justify-start gap-1.5">
                    <ArrowRight className="h-3 w-3 text-emerald-400" /> Government & NGO Node
                  </Link>
                </li>
              </ul>
            </div>

            {/* Right: Interactive Social Hub Showcase (4 cols) */}
            <div className="lg:col-span-4 flex flex-col sm:flex-row items-center gap-5 p-5 rounded-3xl bg-white/[0.04] border border-white/10 shadow-2xl backdrop-blur-xl shrink-0">
              <div className="text-center sm:text-left max-w-[190px]">
                <div className="inline-flex items-center gap-1 text-[11px] font-mono font-black uppercase text-pink-400 tracking-wider mb-1">
                  <Sparkles className="h-3 w-3" /> Official Socials
                </div>
                <h4 className="font-display font-black text-base text-white leading-snug">
                  Social Channels
                </h4>
                <p className="text-xs text-slate-400 mt-1 leading-normal">
                  Hover to expand Instagram, Twitter/X alerts, and Discord mesh.
                </p>
                <div className="mt-2.5 flex items-center justify-center sm:justify-start gap-1 text-[11px] font-bold text-emerald-400">
                  <span>Social Hub</span>
                  <ArrowUpRight className="h-3 w-3" />
                </div>
              </div>

              {/* The Folding Interactive Card */}
              <div className="shrink-0 flex items-center justify-center">
                <InteractiveCommunityCard />
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ─── STREAMLINED BOTTOM MOUNTAIN LANDSCAPE & LEGAL BAR ─── */}
      <div className="relative w-full min-h-[300px] sm:min-h-[260px] flex flex-col justify-between">
        
        {/* Background SVG Horizon Canvas */}
        <div className="absolute inset-0 w-full h-full pointer-events-none">
          <svg
            viewBox="0 0 1440 280"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full object-cover"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="skyGradMin" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#151933" />
                <stop offset="100%" stopColor="#0E1224" />
              </linearGradient>
              <linearGradient id="mntGradMin" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2A3154" />
                <stop offset="100%" stopColor="#151A30" />
              </linearGradient>
            </defs>

            <rect width="1440" height="280" fill="url(#skyGradMin)" />

            {/* Mountains */}
            <polygon
              points="0,180 180,80 340,140 500,60 680,130 840,70 1020,150 1200,80 1360,130 1440,100 1440,280 0,280"
              fill="url(#mntGradMin)"
              opacity="0.8"
            />
            <polyline
              points="0,170 180,80 340,140 500,60 680,130 840,70 1020,150 1200,80 1360,130 1440,100"
              fill="none"
              stroke="#E0B69B"
              strokeWidth="2"
              opacity="0.85"
            />

            {/* Hills */}
            <path d="M0,200 Q320,175 680,195 T1440,185 L1440,280 L0,280 Z" fill="#2D3B2C" opacity="0.9" />
            <path d="M0,235 Q380,215 820,240 T1440,225 L1440,280 L0,280 Z" fill="#1C261B" />
          </svg>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* ─── BOTTOM LEGAL BAR ─── */}
        <div className="relative z-10 w-full px-6 sm:px-10 py-4 flex flex-wrap items-center justify-between gap-4 text-xs font-normal text-[#A3B89F] bg-black/40 border-t border-white/5">
          <div className="flex flex-wrap items-center gap-6">
            <span className="text-[#C2D6BE] font-medium">© AapdaSetu 2026 • Disaster Intelligence Grid</span>
            <Link to="/privacy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-white transition-colors">
              Terms & Safety Protocols
            </Link>
            <span className="text-slate-400">Polygon Mainnet Verified</span>
          </div>
          
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-black/40 border border-emerald-500/30">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[#C2D6BE] text-xs font-mono font-semibold">NDMA Live Feed Connected</span>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
