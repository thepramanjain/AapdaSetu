import React from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../hooks/useStore';
import { ArrowRight } from 'lucide-react';

export const Footer: React.FC = () => {
  const role = useStore(state => state.role);

  const getPortalLink = (portalType: 'ngo' | 'government') => {
    if (role === portalType) return `/${portalType}/dashboard`;
    return `/login?role=${portalType}`;
  };

  return (
    <footer className="relative w-full overflow-hidden select-none bg-[#F7F8F4] text-slate-800 border-t border-slate-200/80">
      
      {/* ─── Subtle Top Dot Grid Texture (Light, Professional) ─── */}
      <div 
        className="absolute inset-0 z-0 pointer-events-none opacity-[0.035]"
        style={{
          backgroundImage: 'radial-gradient(circle, #334155 0.6px, transparent 0.6px)',
          backgroundSize: '18px 18px',
        }}
      />
      
      {/* ─── Soft Gradient Glow Accents ─── */}
      <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-gradient-radial from-emerald-200/20 to-transparent rounded-full blur-3xl opacity-50 pointer-events-none z-0" />
      <div className="absolute top-0 right-0 w-[350px] h-[350px] bg-gradient-radial from-amber-200/15 to-transparent rounded-full blur-3xl opacity-40 pointer-events-none z-0" />

      {/* ─── CONTENT SECTION ─── */}
      <div className="relative z-20 mx-auto max-w-7xl px-5 sm:px-10 lg:px-14 pt-16 sm:pt-20 pb-12 sm:pb-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          
          {/* Left: Brand + Description + Socials (5 cols) */}
          <div className="lg:col-span-5 space-y-5 sm:space-y-6 text-center lg:text-left">
            
            {/* Brand */}
            <div className="flex items-center justify-center lg:justify-start gap-3">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-emerald-400 via-emerald-500 to-teal-600 flex items-center justify-center text-white text-sm font-black shadow-lg shadow-emerald-500/25 shrink-0">
                ✦
              </div>
              <h3 className="font-display font-black text-3xl sm:text-4xl tracking-tight">
                <span className="bg-gradient-to-r from-slate-950 via-slate-800 to-slate-700 bg-clip-text text-transparent">Aapda</span>
                <span className="bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-500 bg-clip-text text-transparent">Setu</span>
              </h3>
            </div>

            {/* Description */}
            <p className="text-sm sm:text-[15px] text-slate-600 leading-relaxed font-medium max-w-md mx-auto lg:mx-0">
              India's decentralized disaster intelligence and on-chain emergency relief network, bridging AI telemetry with transparent funding across 36 States & UTs.
            </p>

            {/* Social Icons */}
            <div className="flex items-center justify-center lg:justify-start gap-5 pt-1">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Twitter"
                className="text-slate-400 hover:text-emerald-600 hover:scale-110 hover:drop-shadow-[0_0_6px_rgba(16,185,129,0.3)] transition-all duration-250"
              >
                <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn"
                className="text-slate-400 hover:text-blue-600 hover:scale-110 hover:drop-shadow-[0_0_6px_rgba(37,99,235,0.3)] transition-all duration-250"
              >
                <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
                </svg>
              </a>
              <a
                href="https://discord.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Discord"
                className="text-slate-400 hover:text-indigo-600 hover:scale-110 hover:drop-shadow-[0_0_6px_rgba(99,102,241,0.3)] transition-all duration-250"
              >
                <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                </svg>
              </a>
            </div>

            {/* Status Badge */}
            <div className="flex items-center justify-center lg:justify-start gap-2.5 pt-1">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
              </span>
              <span className="text-sm font-bold text-slate-800">All services are online</span>
            </div>

            {/* Copyright */}
            <p className="text-sm font-semibold text-slate-500">© 2026 AapdaSetu. Built for National Resilience.</p>

          </div>

          {/* Right: 3 nav columns (7 cols) */}
          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8 sm:gap-10 lg:gap-12 pt-0 lg:pt-2">

            {/* PRODUCT */}
            <div className="space-y-4 text-center sm:text-left">
              <h4 className="footer-heading text-xs sm:text-[13px] font-mono font-black uppercase tracking-widest text-slate-500 cursor-default">
                PRODUCT
              </h4>
              <ul className="space-y-3 text-sm sm:text-[15px] font-semibold text-slate-700">
                <li>
                  <a href="#how-it-works" className="footer-link">
                    How it works
                  </a>
                </li>
                <li>
                  <Link to="/command-center" className="footer-link">
                    Command Center
                  </Link>
                </li>
                <li>
                  <Link to="/blockchain" className="footer-link">
                    On-Chain Ledger
                  </Link>
                </li>
                <li>
                  <Link to="/donor" className="footer-link">
                    80G Relief Giving
                  </Link>
                </li>
                <li>
                  <Link to="/command-center" className="footer-link">
                    AI Telemetry
                  </Link>
                </li>
              </ul>
            </div>

            {/* COMPANY */}
            <div className="space-y-4 text-center sm:text-left">
              <h4 className="footer-heading text-xs sm:text-[13px] font-mono font-black uppercase tracking-widest text-slate-500 cursor-default">
                COMPANY
              </h4>
              <ul className="space-y-3 text-sm sm:text-[15px] font-semibold text-slate-700">
                <li>
                  <Link to={getPortalLink('government')} className="footer-link footer-link-blue">
                    Gov Portal
                  </Link>
                </li>
                <li>
                  <Link to={getPortalLink('ngo')} className="footer-link text-emerald-700 font-bold">
                    NGO Portal
                  </Link>
                </li>
                <li>
                  <Link to="/donor" className="footer-link text-amber-700 font-bold">
                    Donor Portal
                  </Link>
                </li>
                <li>
                  <a href="tel:1078" className="footer-link">
                    NDMA Hotline (1078)
                  </a>
                </li>
                <li>
                  <a href="tel:112" className="footer-link footer-link-red font-bold text-rose-600">
                    Emergency (112)
                  </a>
                </li>
              </ul>
            </div>

            {/* LEGAL */}
            <div className="space-y-4 text-center sm:text-left col-span-2 sm:col-span-1">
              <h4 className="footer-heading text-xs sm:text-[13px] font-mono font-black uppercase tracking-widest text-slate-500 cursor-default">
                LEGAL
              </h4>
              <ul className="space-y-3 text-sm sm:text-[15px] font-semibold text-slate-700">
                <li>
                  <Link to="/command-center" className="footer-link">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to="/command-center" className="footer-link">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link to="/blockchain" className="footer-link">
                    Security Protocols
                  </Link>
                </li>
              </ul>

              {/* CTA */}
              <div className="pt-6 flex items-center justify-center sm:justify-start gap-5 text-sm sm:text-[15px] font-bold">
                <Link to="/login" className="footer-link text-slate-600 hover:text-emerald-700">
                  Log in
                </Link>
                <Link
                  to="/login"
                  className="group inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-950 text-white font-black text-sm hover:shadow-xl hover:shadow-slate-900/25 hover:scale-[1.03] transition-all duration-250 border border-slate-700/60"
                >
                  <span>Deploy portal</span>
                  <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform duration-200" />
                </Link>
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* ─── BOTTOM COUNTRYSIDE MEADOW PAINTING ─── */}
      <div className="relative w-full h-[240px] sm:h-[320px] lg:h-[400px] overflow-hidden select-none pointer-events-none">
        {/* Gradient Fade Top */}
        <div
          className="absolute inset-0 z-10"
          style={{
            background: 'linear-gradient(to bottom, #F7F8F4 0%, rgba(247,248,244,0.75) 16%, rgba(247,248,244,0.35) 42%, rgba(247,248,244,0.08) 100%)',
          }}
        />
        {/* Landscape Image */}
        <img
          src="/footer-landscape.jpg"
          alt="Countryside Landscape"
          className="w-full h-full object-cover object-bottom"
          style={{ filter: 'brightness(1.18) contrast(0.92) saturate(0.88)' }}
        />
      </div>

    </footer>
  );
};

export default Footer;
