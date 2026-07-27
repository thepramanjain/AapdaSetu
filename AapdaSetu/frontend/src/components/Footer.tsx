import React from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../hooks/useStore';

export const Footer: React.FC = () => {
  const role = useStore(state => state.role);

  const getPortalLink = (portalType: 'ngo' | 'government') => {
    if (role === portalType) {
      return `/${portalType}/dashboard`;
    }
    return `/login?role=${portalType}`;
  };

  return (
    <footer className="border-t border-slate-200 bg-[#0f172a] text-slate-400 pt-16 pb-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        
        {/* Main Footer Row */}
        <div className="flex flex-col md:flex-row md:justify-between gap-12 pb-12 border-b border-slate-800">
          
          {/* Logo & Description */}
          <div className="max-w-md space-y-4">
            <Link to="/" className="inline-flex items-center gap-2">
              <img src="/favicon.png" alt="AapdaSetu Logo" className="h-9 w-9 object-contain select-none" />
              <span className="font-display text-xl font-bold text-white tracking-tight">
                AapdaSetu
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-slate-400 font-medium">
              An autonomous AI & Blockchain platform for smarter disaster response, rapid resource deployment, and transparent relief coordination across India.
            </p>
          </div>

          {/* Platform Portal Column */}
          <div className="min-w-[150px]">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200 mb-4">
              Platform Links
            </h4>
            <ul className="space-y-3 text-sm font-semibold">
              <li>
                <Link to="/" className="text-slate-400 hover:text-emerald-400 transition-colors flex items-center gap-1.5 group">
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-700 group-hover:bg-emerald-400 transition-colors" />
                  Home
                </Link>
              </li>
              <li>
                <Link to={getPortalLink('ngo')} className="text-slate-400 hover:text-emerald-400 transition-colors flex items-center gap-1.5 group">
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-700 group-hover:bg-emerald-400 transition-colors" />
                  NGO Portal
                </Link>
              </li>
              <li>
                <Link to={getPortalLink('government')} className="text-slate-400 hover:text-emerald-400 transition-colors flex items-center gap-1.5 group">
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-700 group-hover:bg-emerald-400 transition-colors" />
                  Gov Portal
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Row */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-slate-500">
          <div className="font-semibold">
            &copy; 2026 AapdaSetu. All rights reserved.
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-bold uppercase tracking-wider text-[10px] text-slate-400">All Systems Operational</span>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
