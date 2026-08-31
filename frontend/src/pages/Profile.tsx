import React from 'react';
import { User, Shield, ShieldCheck, Mail, Phone, MapPin, Wallet } from 'lucide-react';

export const Profile: React.FC = () => {
  return (
    <div className="space-y-8 font-sans max-w-2xl mx-auto">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">NGO Profile</h1>
        <p className="text-slate-500 text-sm font-medium mt-1">Manage agency profiles, credentials, and blockchain wallet keys.</p>
      </div>

      <div className="bg-white border border-slate-200/80 rounded-xl shadow-sm p-6 space-y-6">
        
        {/* Profile Header */}
        <div className="flex items-center gap-4 border-b border-slate-100 pb-5">
          <div className="h-16 w-16 rounded-xl bg-green-100 text-green-700 flex items-center justify-center font-bold text-2xl border border-green-200/80">
            S
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900">SEEDS Relief Organization</h2>
              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-green-50 text-green-700 border border-green-200">
                <ShieldCheck className="h-3 w-3" /> VERIFIED
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">Licensed Humanitarian Relief Operations Agency</p>
          </div>
        </div>

        {/* Agency details */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 border-b border-slate-100 pb-2">
            <User className="h-4 w-4 text-slate-500" />
            General Agency Credentials
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold text-slate-700">
            <div className="space-y-1">
              <label className="text-slate-400 text-[10px] font-bold uppercase">License ID</label>
              <p className="text-slate-900 font-mono">NGO-IND-2026-891</p>
            </div>
            <div className="space-y-1">
              <label className="text-slate-400 text-[10px] font-bold uppercase">Department Hook</label>
              <p className="text-slate-900">Assam & Sikkim Disaster Cells</p>
            </div>
            <div className="space-y-1">
              <label className="text-slate-400 text-[10px] font-bold uppercase">Compliance Score</label>
              <p className="text-slate-900">98.2% (Excellent rating)</p>
            </div>
            <div className="space-y-1">
              <label className="text-slate-400 text-[10px] font-bold uppercase">Focus Area</label>
              <p className="text-slate-900">Flash Flood Evacuations & Food Supply</p>
            </div>
          </div>
        </div>

        {/* Blockchain Wallet */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 border-b border-slate-100 pb-2">
            <Wallet className="h-4 w-4 text-slate-500" />
            Blockchain Smart Contract Wallet
          </h3>
          <div className="space-y-1 text-xs font-semibold text-slate-700">
            <label className="text-slate-400 text-[10px] font-bold uppercase">Wallet public Key (disbursement address)</label>
            <input 
              type="text" 
              readOnly 
              value="0x71C7656EC7ab88b098defB751B7401B5f6d8976F" 
              className="w-full rounded-xl bg-slate-50 border border-slate-200/60 px-4 py-2.5 text-slate-500 font-mono focus:outline-none select-all" 
            />
            <span className="text-[10px] text-slate-400 font-medium">On-chain payouts will be directly routed to this address.</span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Profile;
