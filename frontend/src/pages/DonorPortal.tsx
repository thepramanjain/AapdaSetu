import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, 
  ShieldCheck, 
  Wallet, 
  CheckCircle2, 
  ArrowRight, 
  Zap, 
  Lock, 
  Award, 
  FileText, 
  Globe, 
  Users, 
  Sparkles,
  ChevronRight,
  TrendingUp,
  Building
} from 'lucide-react';
import { useStore } from '../hooks/useStore';

export const DonorPortal: React.FC = () => {
  const disasters = useStore((state) => state.disasters);
  const blockchainTxs = useStore((state) => state.blockchainTxs);

  const [selectedDisaster, setSelectedDisaster] = useState<string>('all');
  const [amount, setAmount] = useState<number>(2500);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [donorName, setDonorName] = useState<string>('');
  const [donorEmail, setDonorEmail] = useState<string>('');
  const [panNumber, setPanNumber] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'crypto'>('upi');
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [txHash, setTxHash] = useState('');

  const liveDisasters = disasters.filter(d => d.status === 'published');

  const presetAmounts = [500, 1000, 2500, 5000, 10000];

  const handleDonate = (e: React.FormEvent) => {
    e.preventDefault();
    const finalAmount = customAmount ? parseFloat(customAmount) : amount;
    if (!finalAmount || finalAmount <= 0) {
      alert('Please enter a valid donation amount.');
      return;
    }

    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      const generatedHash = '0x' + Array.from({length: 40}, () => Math.floor(Math.random()*16).toString(16)).join('');
      setTxHash(generatedHash);
      setIsSuccess(true);
    }, 1800);
  };

  const [donorTab, setDonorTab] = useState<'donate' | 'ledger' | 'impact' | 'receipts'>('donate');

  return (
    <div
      className="min-h-screen py-24 px-4 sm:px-6 relative overflow-hidden select-none"
      style={{
        background: `
          radial-gradient(ellipse at 20% 20%, rgba(251,217,138,0.22) 0%, transparent 60%),
          radial-gradient(ellipse at 80% 80%, rgba(16,185,129,0.15) 0%, transparent 60%),
          linear-gradient(180deg, #FFFDF8 0%, #FFF8ED 50%, #F0FDF4 100%)
        `,
      }}
    >
      {/* ─── CLEAN AMBIENT SOFT HAZE (No 3D Meshes) ─── */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none z-0"
        style={{
          background: 'radial-gradient(ellipse at 50% 0%, rgba(251,217,138,0.3) 0%, transparent 60%)',
        }}
      />

      {/* Hero Banner */}
      <section className="mx-auto max-w-7xl mb-8">
        <motion.div
          className="relative rounded-3xl p-8 md:p-14 overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #0B3321 0%, #1A7151 50%, #065F46 100%)',
            border: '1px solid rgba(16,185,129,0.3)',
            boxShadow: `
              inset 0 1px 0 rgba(255,255,255,0.2),
              0 8px 32px rgba(11,51,33,0.3),
              0 24px 80px rgba(0,0,0,0.15)
            `,
          }}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          {/* Subtle Ambient Sheen */}
          <div
            className="absolute inset-0 opacity-15 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse at 70% 30%, rgba(255,255,255,0.25) 0%, transparent 60%)',
            }}
          />

          <div className="relative z-10 grid lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-8 space-y-5 text-left">
              <div
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono font-bold uppercase tracking-wider"
                style={{
                  background: 'rgba(255,255,255,0.15)',
                  border: '1px solid rgba(255,255,255,0.25)',
                  color: '#FBD98A',
                  backdropFilter: 'blur(8px)',
                }}
              >
                <Heart className="h-3.5 w-3.5 fill-current text-amber-300 animate-pulse" />
                AapdaSetu Direct Relief Fund
              </div>

              <h1 className="font-display font-black text-3xl sm:text-4xl md:text-5xl text-white leading-tight">
                Transparent & Direct Relief Giving
              </h1>

              <p className="text-base sm:text-lg font-medium text-emerald-100/90 max-w-2xl leading-relaxed">
                Donate directly to on-ground disaster relief efforts. Every single contribution is tokenized on blockchain for 100% auditable transparency.
              </p>

              <div className="flex flex-wrap items-center gap-6 pt-2 text-xs font-mono font-bold text-emerald-200">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  80G Tax Exempt
                </div>
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-amber-300" />
                  On-Chain Audited
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-emerald-400" />
                  Zero Platform Fees
                </div>
              </div>
            </div>

            {/* Quick Stat Pill */}
            <div className="lg:col-span-4 flex flex-col gap-3">
              <div
                className="p-5 rounded-2xl space-y-2"
                style={{
                  background: 'rgba(255,255,255,0.12)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  backdropFilter: 'blur(12px)',
                }}
              >
                <div className="text-xs font-mono font-bold text-emerald-200 uppercase">Total Donor Funds Released</div>
                <div className="text-3xl font-display font-black text-amber-300">₹4.82 Cr+</div>
                <div className="text-xs text-emerald-100/70">Across 14 active relief missions</div>
              </div>

              <div
                className="p-4 rounded-2xl flex items-center justify-between"
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.15)',
                }}
              >
                <div className="text-xs font-semibold text-white">Verified Beneficiaries</div>
                <div className="text-sm font-bold text-emerald-300">128,450+ Lives</div>
              </div>
            </div>

          </div>
        </motion.div>
      </section>

      {/* ─── MIDDLE MODERN SEGMENTED NAVBAR STRIP ─── */}
      <div className="mx-auto max-w-7xl mb-12 flex items-center justify-center">
        <div
          className="inline-flex p-1.5 rounded-2xl gap-1.5 max-w-full overflow-x-auto select-none bg-white border border-slate-200/90 shadow-xs"
        >
          {[
            { id: 'donate', label: 'Contribute Relief Funds', icon: Heart },
            { id: 'ledger', label: 'Live On-Chain Ledger', icon: Wallet },
            { id: 'impact', label: 'Verified NGO Allocations', icon: Building },
            { id: 'receipts', label: 'Tax 80G Receipts', icon: Award },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = donorTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setDonorTab(tab.id as any)}
                className={`flex items-center gap-2 px-4.5 py-2.5 rounded-xl text-xs sm:text-[13px] font-bold transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'text-white bg-gradient-to-r from-amber-500 to-amber-600 shadow-sm font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Donation Grid */}
      <div className="mx-auto max-w-7xl grid lg:grid-cols-12 gap-8 items-start">

        {/* ── LEFT: Donation Form (7 cols) ── */}
        <motion.div
          className="lg:col-span-7 p-6 sm:p-8 rounded-3xl relative overflow-hidden"
          style={{
            background: 'linear-gradient(145deg, #FFFDF7 0%, #FFF8ED 50%, #FFF0D6 100%)',
            border: '1px solid rgba(223,189,115,0.4)',
            boxShadow: `
              inset 0 1px 0 rgba(255,255,255,0.95),
              0 8px 32px rgba(0,0,0,0.08),
              0 24px 80px rgba(0,0,0,0.06)
            `,
          }}
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-amber-200/50">
            <h2 className="font-display font-black text-2xl" style={{ color: '#0B3321' }}>
              Make a Relief Contribution
            </h2>
            <span className="text-xs font-mono font-bold text-amber-700 bg-amber-100 px-3 py-1 rounded-full border border-amber-300">
              Instant 80G Receipt
            </span>
          </div>

          {!isSuccess ? (
            <form onSubmit={handleDonate} className="space-y-6">
              
              {/* Select Target Crisis */}
              <div>
                <label className="block text-xs font-mono font-bold uppercase mb-2" style={{ color: '#0B3321' }}>
                  1. Select Target Relief Cause
                </label>
                <select
                  value={selectedDisaster}
                  onChange={(e) => setSelectedDisaster(e.target.value)}
                  className="input-skeu text-sm font-semibold cursor-pointer"
                >
                  <option value="all">General Crisis Pool (Highest Need Allocation)</option>
                  {liveDisasters.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.state})
                    </option>
                  ))}
                </select>
              </div>

              {/* Amount Selection */}
              <div>
                <label className="block text-xs font-mono font-bold uppercase mb-2" style={{ color: '#0B3321' }}>
                  2. Select Donation Amount (INR)
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5 mb-3">
                  {presetAmounts.map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => { setAmount(amt); setCustomAmount(''); }}
                      className="py-2.5 rounded-xl font-display font-bold text-sm transition-all cursor-pointer"
                      style={{
                        background: (amount === amt && !customAmount)
                          ? 'linear-gradient(135deg, #FBD98A, #DFBD73, #C9A04A)'
                          : 'linear-gradient(145deg, #FFFDF7, #FFF8ED)',
                        color: (amount === amt && !customAmount) ? '#3D2006' : '#1A7151',
                        border: (amount === amt && !customAmount)
                          ? '1px solid rgba(166,118,60,0.4)'
                          : '1px solid rgba(223,189,115,0.3)',
                        boxShadow: (amount === amt && !customAmount)
                          ? 'var(--shadow-button)'
                          : 'inset 0 1px 0 rgba(255,255,255,0.8), 0 2px 4px rgba(0,0,0,0.05)',
                      }}
                    >
                      ₹{amt.toLocaleString('en-IN')}
                    </button>
                  ))}
                </div>

                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-500">₹</span>
                  <input
                    type="number"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    placeholder="Or enter custom amount in ₹"
                    className="input-skeu pl-8"
                  />
                </div>
              </div>

              {/* Donor Info for Tax Exemption */}
              <div className="space-y-4 pt-2">
                <label className="block text-xs font-mono font-bold uppercase" style={{ color: '#0B3321' }}>
                  3. Donor Information (Optional for 80G Certificate)
                </label>

                <div className="grid sm:grid-cols-2 gap-4">
                  <input
                    type="text"
                    value={donorName}
                    onChange={(e) => setDonorName(e.target.value)}
                    placeholder="Full Name / Organization"
                    className="input-skeu"
                  />
                  <input
                    type="email"
                    value={donorEmail}
                    onChange={(e) => setDonorEmail(e.target.value)}
                    placeholder="Email for tax receipt"
                    className="input-skeu"
                  />
                </div>

                <input
                  type="text"
                  value={panNumber}
                  onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
                  placeholder="PAN Card Number (Required for 80G tax exemption)"
                  className="input-skeu uppercase font-mono"
                  maxLength={10}
                />
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-xs font-mono font-bold uppercase mb-2" style={{ color: '#0B3321' }}>
                  4. Payment Channel
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'upi', label: 'UPI / QR', icon: Zap },
                    { id: 'card', label: 'Card / NetBank', icon: Wallet },
                    { id: 'crypto', label: 'ETH / Web3', icon: Lock },
                  ].map((m) => {
                    const Icon = m.icon;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setPaymentMethod(m.id as any)}
                        className="py-3 rounded-xl font-bold text-xs flex flex-col items-center gap-1.5 transition-all cursor-pointer"
                        style={{
                          background: paymentMethod === m.id
                            ? 'linear-gradient(135deg, #ECFDF5, #D1FAE5)'
                            : 'linear-gradient(145deg, #FFFDF7, #FFF8ED)',
                          color: paymentMethod === m.id ? '#065F46' : '#4B6858',
                          border: paymentMethod === m.id
                            ? '1px solid rgba(16,185,129,0.4)'
                            : '1px solid rgba(223,189,115,0.3)',
                          boxShadow: paymentMethod === m.id
                            ? 'var(--shadow-card-hover)'
                            : 'inset 0 1px 0 rgba(255,255,255,0.8)',
                        }}
                      >
                        <Icon className="h-4 w-4" />
                        {m.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Submit Button */}
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isProcessing}
                className="w-full btn-skeu-gold py-4 text-base font-black"
              >
                {isProcessing ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="h-4 w-4 border-2 border-amber-900 border-t-transparent rounded-full animate-spin" />
                    Recording on Smart Contract...
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <Heart className="h-5 w-5 fill-current" />
                    <span>Proceed to Donate ₹{(customAmount ? parseFloat(customAmount) : amount).toLocaleString('en-IN')}</span>
                    <ArrowRight className="h-4 w-4" />
                  </div>
                )}
              </motion.button>

            </form>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8 space-y-6"
            >
              <div
                className="h-20 w-20 rounded-3xl mx-auto flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, #ECFDF5, #D1FAE5)',
                  border: '1px solid rgba(16,185,129,0.4)',
                  boxShadow: 'var(--shadow-card)',
                }}
              >
                <CheckCircle2 className="h-10 w-10 text-emerald-600" />
              </div>

              <div className="space-y-2">
                <h3 className="font-display font-black text-2xl" style={{ color: '#0B3321' }}>
                  Thank You for Your Generosity!
                </h3>
                <p className="text-xs font-medium max-w-md mx-auto" style={{ color: '#4B6858' }}>
                  Your donation of <span className="font-bold text-emerald-900">₹{(customAmount ? parseFloat(customAmount) : amount).toLocaleString('en-IN')}</span> has been securely routed & recorded on-chain.
                </p>
              </div>

              <div
                className="p-4 rounded-2xl text-left space-y-2 max-w-md mx-auto"
                style={{
                  background: 'linear-gradient(145deg, rgba(255,248,237,0.9), rgba(255,244,224,0.9))',
                  border: '1px solid rgba(223,189,115,0.3)',
                  boxShadow: 'var(--shadow-deboss)',
                }}
              >
                <div className="flex items-center justify-between text-[10px] font-mono font-black uppercase text-amber-800">
                  <span>Blockchain Audit Hash</span>
                  <span>Verified</span>
                </div>
                <div className="font-mono text-xs text-slate-700 break-all bg-white/80 p-2.5 rounded-xl border border-amber-200/50">
                  {txHash}
                </div>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row justify-center gap-3">
                <button
                  onClick={() => alert('80G Certificate Receipt downloaded successfully!')}
                  className="btn-skeu-outline px-6 py-2.5 text-xs font-bold"
                >
                  <FileText className="h-4 w-4" />
                  Download 80G Receipt
                </button>
                <button
                  onClick={() => { setIsSuccess(false); setCustomAmount(''); }}
                  className="btn-skeu-primary px-6 py-2.5 text-xs font-bold"
                >
                  Make Another Donation
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* ── RIGHT: Transparency & Live Ledger (5 cols) ── */}
        <motion.div
          className="lg:col-span-5 space-y-6"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Trust Guarantees */}
          <div
            className="p-6 rounded-3xl space-y-4"
            style={{
              background: 'linear-gradient(145deg, #FFFDF7 0%, #FFF8ED 100%)',
              border: '1px solid rgba(223,189,115,0.3)',
              boxShadow: 'var(--shadow-card)',
            }}
          >
            <h3 className="font-display font-black text-lg" style={{ color: '#0B3321' }}>
              Why Donate via AapdaSetu?
            </h3>

            {[
              {
                title: 'Direct Multi-Agent Allocation',
                desc: 'AI assigns funds directly to verified ground NGOs based on priority needs.',
                icon: Zap,
                color: '#10B981',
              },
              {
                title: 'Immutable Blockchain Trail',
                desc: 'Every rupee leaves a public transaction hash on the Ethereum ledger.',
                icon: Lock,
                color: '#DFBD73',
              },
              {
                title: '80G Tax Exemption',
                desc: 'Receive immediate tax receipts for 50% tax deduction under Section 80G.',
                icon: Award,
                color: '#3B82F6',
              },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className="flex gap-3.5 items-start">
                  <div
                    className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                    style={{
                      background: 'linear-gradient(145deg, #FFFDF7, #FFF0D6)',
                      border: '1px solid rgba(223,189,115,0.3)',
                      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.9), 0 2px 4px rgba(0,0,0,0.06)',
                    }}
                  >
                    <Icon className="h-4 w-4" style={{ color: item.color }} />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm" style={{ color: '#0B3321' }}>
                      {item.title}
                    </h4>
                    <p className="text-xs font-semibold mt-0.5 leading-relaxed" style={{ color: '#4B6858' }}>
                      {item.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Recent Donor Log */}
          <div
            className="p-6 rounded-3xl space-y-4"
            style={{
              background: 'linear-gradient(145deg, #FFFDF7 0%, #FFF8ED 100%)',
              border: '1px solid rgba(223,189,115,0.3)',
              boxShadow: 'var(--shadow-card)',
            }}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-display font-black text-sm uppercase tracking-wider" style={{ color: '#065F46' }}>
                Recent Public Donations
              </h3>
              <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Live Ledger
              </span>
            </div>

            <div className="space-y-3">
              {[
                { name: 'Anonymous Donor', amount: '₹50,000', cause: 'Assam Floods', time: '12m ago' },
                { name: 'Rohan Sharma', amount: '₹10,000', cause: 'Odisha Cyclone', time: '45m ago' },
                { name: 'Tech Relief India', amount: '₹2,50,000', cause: 'General Fund', time: '2h ago' },
                { name: 'Ananya Roy', amount: '₹5,000', cause: 'Himachal Relief', time: '3h ago' },
              ].map((tx, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 rounded-xl"
                  style={{
                    background: 'linear-gradient(145deg, rgba(255,253,247,0.9), rgba(255,248,237,0.7))',
                    border: '1px solid rgba(223,189,115,0.2)',
                  }}
                >
                  <div>
                    <div className="font-bold text-xs" style={{ color: '#0B3321' }}>{tx.name}</div>
                    <div className="text-[10px] font-semibold text-amber-700">{tx.cause}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-display font-black text-sm text-emerald-800">{tx.amount}</div>
                    <div className="text-[9px] font-mono text-slate-400">{tx.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </motion.div>

      </div>
    </div>
  );
};

export default DonorPortal;
