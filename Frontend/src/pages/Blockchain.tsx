import React, { useState } from 'react';
import { useStore } from '../hooks/useStore';
import { StatusBadge } from '../components/StatusBadge';
import { 
  Link2, 
  Search, 
  Layers, 
  Activity, 
  Clock, 
  Coins, 
  Database,
  SearchCode,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { motion } from 'framer-motion';

export const Blockchain: React.FC = () => {
  const blockchainTxs = useStore((state) => state.blockchainTxs);
  const [searchQuery, setSearchQuery] = useState('');

  const formatRupee = (value: number) => {
    if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)} Cr`;
    if (value >= 100000) return `₹${(value / 100000).toFixed(2)} L`;
    return `₹${value.toLocaleString('en-IN')}`;
  };

  const filteredTxs = blockchainTxs.filter((tx) => {
    const query = searchQuery.toLowerCase();
    return (
      tx.hash.toLowerCase().includes(query) ||
      tx.ngo.toLowerCase().includes(query) ||
      tx.purpose.toLowerCase().includes(query) ||
      tx.block.toString().includes(query)
    );
  });

  const latestBlock = blockchainTxs.length > 0 ? blockchainTxs[0].block : 104289;
  const totalVolume = blockchainTxs.reduce((sum, tx) => sum + tx.amount, 0);

  return (
    <div className="space-y-8 font-sans select-none">
      
      {/* Title Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-xs font-mono font-black uppercase tracking-wider text-emerald-800">
              Zero-Knowledge Proofs
            </span>
          </div>
          <h1 className="text-3xl font-display font-black text-slate-900 tracking-tight">Solidity Ledger Explorer</h1>
          <p className="text-slate-600 text-sm font-medium mt-1">Audit on-chain smart contract disbursements, verification events, and block records.</p>
        </div>

        <div
          className="px-4 py-2 rounded-2xl flex items-center gap-2 text-xs font-mono font-black text-emerald-900"
          style={{
            backgroundColor: '#E4E9F2',
            boxShadow: 'inset 2px 2px 5px #b8c4d9, inset -2px -2px 5px #ffffff',
          }}
        >
          <Database className="h-4 w-4 text-emerald-600 animate-pulse" />
          <span>EVM Solidity v0.8.20 Online</span>
        </div>
      </div>

      {/* Network Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[
          { label: 'Latest Block Height', val: `#${latestBlock}`, icon: Layers, color: '#3B82F6' },
          { label: 'Relief Ledger Volume', val: formatRupee(totalVolume || 84200000), icon: Coins, color: '#10B981' },
          { label: 'Confirmed Transactions', val: `${blockchainTxs.length || 24} Blocks`, icon: Activity, color: '#8B5CF6' },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={i}
              whileHover={{ y: -3, scale: 1.01 }}
              className="p-6 rounded-3xl flex items-center justify-between transition-all"
              style={{
                backgroundColor: '#E4E9F2',
                boxShadow: '8px 8px 18px #b8c4d9, -8px -8px 18px #ffffff',
                border: '1px solid rgba(255, 255, 255, 0.7)',
              }}
            >
              <div>
                <span className="text-[11px] font-mono font-black text-slate-500 uppercase tracking-wide">{stat.label}</span>
                <h3 className="text-2xl font-display font-black text-slate-900 mt-1 font-mono">{stat.val}</h3>
              </div>
              <div 
                className="h-12 w-12 rounded-2xl flex items-center justify-center shrink-0"
                style={{
                  backgroundColor: '#E4E9F2',
                  boxShadow: 'inset 3px 3px 6px #b8c4d9, inset -3px -3px 6px #ffffff',
                }}
              >
                <Icon className="h-6 w-6" style={{ color: stat.color }} />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Search bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
          <Search className="h-4.5 w-4.5" />
        </div>
        <input
          type="text"
          placeholder="Search by TxHash, block number, purpose, or NGO partner..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-2xl pl-11 pr-4 py-3.5 text-sm text-slate-900 font-medium placeholder-slate-400 outline-none"
          style={{
            backgroundColor: '#FFFFFF',
            boxShadow: 'inset 2px 2px 5px #b8c4d9, inset -2px -2px 5px #ffffff',
            border: '1px solid rgba(255, 255, 255, 0.7)',
          }}
        />
      </div>

      {/* Transactions Feed */}
      <div 
        className="rounded-3xl p-6 sm:p-8 space-y-4"
        style={{
          backgroundColor: '#E4E9F2',
          boxShadow: '10px 10px 24px #b8c4d9, -10px -10px 24px #ffffff',
          border: '1.5px solid rgba(255, 255, 255, 0.8)',
        }}
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-300/60">
          <div>
            <h3 className="font-display font-black text-lg text-slate-900">Immutable Ledger Blocks</h3>
            <p className="text-xs text-slate-500 font-mono">Real-time Ethereum testnet transaction stream</p>
          </div>
          <span 
            className="text-xs font-mono font-black text-emerald-800 px-3 py-1 rounded-full"
            style={{
              backgroundColor: '#E4E9F2',
              boxShadow: 'inset 2px 2px 4px #b8c4d9, inset -2px -2px 4px #ffffff',
            }}
          >
            {filteredTxs.length} Transactions
          </span>
        </div>

        <div className="grid gap-3.5">
          {filteredTxs.map((tx) => (
            <motion.div 
              key={tx.hash} 
              whileHover={{ y: -2, scale: 1.005 }}
              className="p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all"
              style={{
                backgroundColor: '#FFFFFF',
                boxShadow: '4px 4px 10px #b8c4d9, -4px -4px 10px #ffffff',
                border: '1px solid rgba(255, 255, 255, 0.7)',
              }}
            >
              <div className="space-y-1 max-w-xl">
                <div className="flex items-center gap-2">
                  <span className="font-display font-black text-slate-900 text-base">{tx.ngo}</span>
                  <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                    Block #{tx.block}
                  </span>
                </div>
                <p className="text-xs text-slate-700 font-medium">{tx.purpose}</p>
                <div className="text-[11px] font-mono text-emerald-700 font-bold truncate">
                  Hash: {tx.hash}
                </div>
              </div>

              <div className="flex items-center gap-3 self-end md:self-center shrink-0">
                <div className="text-right">
                  <div className="font-display font-black text-base text-emerald-800 font-mono">{formatRupee(tx.amount)}</div>
                  <div className="text-[10px] text-slate-400 font-mono">{tx.timestamp ? new Date(tx.timestamp).toLocaleTimeString() : 'Recent block'}</div>
                </div>
                <span className="text-[10px] font-mono font-black text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                  ✓ Confirmed
                </span>
              </div>
            </motion.div>
          ))}
          {filteredTxs.length === 0 && (
            <p className="text-slate-400 italic text-center py-8 text-xs font-mono">No matching blockchain transactions found.</p>
          )}
        </div>
      </div>

    </div>
  );
};

export default Blockchain;
