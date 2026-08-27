import React from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../hooks/useStore';
import { ShieldCheck, Radio, Database, HeartHandshake, PhoneCall, Sparkles, ArrowUpRight } from 'lucide-react';
import InteractiveCommunityCard from './InteractiveCommunityCard';

export const Footer: React.FC = () => {
  const role = useStore(state => state.role);

  const getPortalLink = (portalType: 'ngo' | 'government') => {
    if (role === portalType) return `/${portalType}/dashboard`;
    return `/login?role=${portalType}`;
  };

  const columns = [
    {
      title: 'Platform Suite',
      links: [
        { label: 'AI Threat Triage', href: '/command-center' },
        { label: 'On-Chain Ledger', href: '/blockchain' },
        { label: 'Damage Assessment', href: '/analyze' },
        { label: 'Resource Simulator', href: '/#how-it-works' },
        { label: 'District Analytics', href: '/analytics' },
      ],
    },
    {
      title: 'Response Portals',
      links: [
        { label: 'Government Node', href: getPortalLink('government') },
        { label: 'NGO Relief Network', href: getPortalLink('ngo') },
        { label: 'Donor / Volunteer Hub', href: '/donor' },
        { label: 'Incident Operations', href: '/incidents' },
        { label: 'Treasury Requests', href: '/funds' },
      ],
    },
    {
      title: 'Active Operations',
      links: [
        { label: 'Assam Flood Grid', href: '/incidents' },
        { label: 'Cyclone Watch', href: '/command-center' },
        { label: 'Landslide Early Alert', href: '/analyze' },
        { label: 'NDRF Telemetry Hub', href: '/command-center' },
        { label: 'Ration Dispatch Units', href: '/donor' },
      ],
    },
    {
      title: 'Ecosystem & Trust',
      links: [
        { label: 'About AapdaSetu', href: '/about' },
        { label: 'Verified NGO Index', href: getPortalLink('ngo') },
        { label: 'Smart Contract Audits', href: '/blockchain' },
        { label: 'Press & Telemetry', href: '/press' },
        { label: 'Open Data API Docs', href: '/docs' },
      ],
    },
    {
      title: 'Emergency Helplines',
      links: [
        { label: 'NDMA Control: 1078', href: 'tel:1078', badge: '24/7' },
        { label: 'State Emergency: 1070', href: 'tel:1070', badge: 'Toll-Free' },
        { label: 'National Disaster: 112', href: 'tel:112', badge: 'Priority' },
        { label: 'Medical Ambulance: 108', href: 'tel:108' },
        { label: 'Police Emergency: 100', href: 'tel:100' },
      ],
    },
  ];

  return (
    <footer className="relative w-full overflow-hidden select-none bg-[#151933] border-t border-slate-800/80">
      
      {/* ─── TOP DISASTER MESH & COMMUNITY CONNECT BANNER ─── */}
      <div className="relative z-20 border-b border-white/10 bg-gradient-to-b from-[#1C2140]/90 to-[#151933]/95 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-6 sm:px-10 py-10 lg:py-12">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12">
            
            {/* Left: Project Mission & Live Metrics */}
            <div className="flex-1 text-center lg:text-left space-y-4 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                NATIONAL EMERGENCY INTELLIGENCE GRID • ACTIVE
              </div>
              
              <div className="flex items-center justify-center lg:justify-start gap-3">
                <img src="/favicon.png" alt="AapdaSetu" className="h-10 w-10 object-contain" />
                <h3 className="font-display font-black text-2xl sm:text-3xl text-white tracking-tight">
                  AapdaSetu
                </h3>
              </div>

              <p className="text-sm text-slate-300 leading-relaxed font-normal">
                India's decentralized disaster intelligence and on-chain emergency relief network. 
                Bridging multispectral satellite early warnings, automated damage triage, and cryptographic treasury disbursement across 36 States & UTs.
              </p>

              {/* Badges / Quick Highlights */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-xs text-slate-300 font-mono">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                  NDMA & NDRF Aligned
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-xs text-slate-300 font-mono">
                  <Database className="h-3.5 w-3.5 text-cyan-400" />
                  Polygon Ledger Verified
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-xs text-slate-300 font-mono">
                  <Radio className="h-3.5 w-3.5 text-amber-400" />
                  24/7 Satellite Telemetry
                </div>
              </div>
            </div>

            {/* Right: Interactive Social & Community Card Showcase */}
            <div className="flex flex-col sm:flex-row items-center gap-6 p-6 rounded-3xl bg-white/[0.04] border border-white/10 shadow-2xl backdrop-blur-xl shrink-0">
              <div className="text-center sm:text-left max-w-[210px]">
                <div className="inline-flex items-center gap-1 text-[11px] font-mono font-black uppercase text-pink-400 tracking-wider mb-1">
                  <Sparkles className="h-3 w-3" /> Official Socials
                </div>
                <h4 className="font-display font-black text-base text-white leading-snug">
                  Social Channels
                </h4>
                <p className="text-xs text-slate-400 mt-1.5 leading-normal">
                  Hover card to expand official Instagram updates, Twitter/X alerts, and Discord mesh.
                </p>
                <div className="mt-3 flex items-center justify-center sm:justify-start gap-1 text-[11px] font-bold text-emerald-400">
                  <span>Social Hub</span>
                  <ArrowUpRight className="h-3 w-3" />
                </div>
              </div>

              {/* The User-Provided Folding Interactive Card */}
              <div className="shrink-0 flex items-center justify-center">
                <InteractiveCommunityCard />
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ─── FULL LANDSCAPE SVG MOUNTAIN & DISASTER TELEMETRY LAYER ─── */}
      <div className="relative w-full min-h-[580px] sm:min-h-[520px] flex flex-col justify-between">
        
        {/* Background SVG Canvas */}
        <div className="absolute inset-0 w-full h-full pointer-events-none">
          <svg
            viewBox="0 0 1440 560"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full object-cover"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="skyGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#181D3D" />
                <stop offset="60%" stopColor="#21264A" />
                <stop offset="100%" stopColor="#1B203E" />
              </linearGradient>

              <linearGradient id="farMountainGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#353E68" />
                <stop offset="100%" stopColor="#242A4D" />
              </linearGradient>

              <linearGradient id="midMountainGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2A3154" />
                <stop offset="100%" stopColor="#1E2340" />
              </linearGradient>

              <linearGradient id="nearMountainGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#1F2542" />
                <stop offset="100%" stopColor="#161A33" />
              </linearGradient>
            </defs>

            {/* Sky Background */}
            <rect width="1440" height="560" fill="url(#skyGradient)" />

            {/* ─── MOUNTAIN LAYER 1 (Far Background) ─── */}
            <polygon
              points="0,320 180,180 340,240 500,140 680,230 840,150 1020,240 1200,160 1360,220 1440,190 1440,560 0,560"
              fill="url(#farMountainGrad)"
              opacity="0.9"
            />

            {/* ─── PEAK CONNECTION LINE (Warm peach/gold ridge line across peaks) ─── */}
            <polyline
              points="0,290 180,180 340,240 500,140 680,230 840,150 1020,240 1200,160 1360,220 1440,190"
              fill="none"
              stroke="#E0B69B"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.9"
            />

            {/* ─── MOUNTAIN LAYER 2 (Mid-range Mountains) ─── */}
            <polygon
              points="0,360 120,260 260,310 440,210 600,290 760,200 920,290 1100,220 1280,300 1440,240 1440,560 0,560"
              fill="url(#midMountainGrad)"
            />

            {/* ─── MOUNTAIN LAYER 3 (Foreground Dark Mountains) ─── */}
            <polygon
              points="0,400 200,320 400,370 580,300 780,360 980,290 1180,360 1380,310 1440,330 1440,560 0,560"
              fill="url(#nearMountainGrad)"
            />

            {/* ─── ROLLING HILLS 1 (Upper Green Grass Layer) ─── */}
            <path
              d="M0,370 Q320,335 680,360 T1440,345 L1440,560 L0,560 Z"
              fill="#4E6847"
            />

            {/* ─── ROLLING HILLS 2 (Mid Green Grass Layer) ─── */}
            <path
              d="M0,425 Q380,385 820,430 T1440,400 L1440,560 L0,560 Z"
              fill="#334330"
            />

            {/* ─── BOTTOM DARK STRIP (For copyright/legal line) ─── */}
            <rect x="0" y="490" width="1440" height="70" fill="#151E16" />

            {/* ─── STYLIZED TREES & SCENE DETAILS ─── */}
            <ellipse cx="290" cy="442" rx="45" ry="14" fill="#202A1F" />
            <rect x="294" y="325" width="12" height="105" fill="#151E16" rx="2" />
            <circle cx="280" cy="300" r="62" fill="#344830" />
            <circle cx="325" cy="305" r="54" fill="#344830" />
            <circle cx="298" cy="265" r="58" fill="#344830" />
            <circle cx="285" cy="275" r="48" fill="#4C6C44" />

            <ellipse cx="440" cy="445" rx="35" ry="12" fill="#202A1F" />
            <path d="M900,345 L925,345 L925,362 L920,362 L920,352 L905,352 L905,362 L900,362 Z" fill="#151E16" />
            <ellipse cx="1070" cy="455" rx="55" ry="16" fill="#202A1F" />

            <ellipse cx="1280" cy="435" rx="42" ry="14" fill="#202A1F" />
            <rect x="1290" y="335" width="10" height="95" fill="#151E16" rx="2" />
            <circle cx="1295" cy="305" r="55" fill="#344830" />
            <circle cx="1315" cy="315" r="46" fill="#344830" />
            <circle cx="1285" cy="290" r="48" fill="#4C6C44" />
          </svg>
        </div>

        {/* ─── FOREGROUND CONTENT: 5 DISASTER RELIEF COLUMNS ─── */}
        <div className="relative z-10 mx-auto max-w-7xl px-6 sm:px-10 pt-14 sm:pt-16 pb-16 w-full">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-8 lg:gap-10">
            {columns.map((col, idx) => (
              <div key={idx} className="space-y-4">
                <h4 className="font-display font-black text-sm sm:text-base text-white tracking-wide uppercase">
                  {col.title}
                </h4>
                <ul className="space-y-2.5">
                  {col.links.map((link, lIdx) => (
                    <li key={lIdx} className="flex items-center gap-2">
                      <Link
                        to={link.href}
                        className="text-xs sm:text-sm font-normal text-[#C5CCE6] hover:text-white hover:translate-x-0.5 transition-all duration-150 inline-block"
                      >
                        {link.label}
                      </Link>
                      {(link as any).badge && (
                        <span className="text-[10px] font-mono font-black uppercase px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          {(link as any).badge}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* ─── BOTTOM LEGAL BAR ─── */}
        <div className="relative z-10 w-full px-6 sm:px-10 py-4 flex flex-wrap items-center justify-between gap-4 text-xs font-normal text-[#A3B89F] border-t border-black/20">
          <div className="flex flex-wrap items-center gap-6">
            <span className="text-[#C2D6BE] font-medium">© AapdaSetu 2026 • National Disaster Response & Intelligence Grid</span>
            <Link to="/privacy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-white transition-colors">
              Terms & Safety Protocols
            </Link>
            <span className="text-slate-400">Polygon Mainnet Verified</span>
          </div>
          
          <div className="flex items-center gap-2.5 px-3 py-1 rounded-full bg-black/30 border border-emerald-500/30">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[#C2D6BE] text-xs font-mono font-semibold">NDMA Live Feed Connected (0.12s latency)</span>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
