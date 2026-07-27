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
  SearchCode
} from 'lucide-react';

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
    <div className="space-y-8 font-sans">
      
      {/* Title */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Solidity Ledger Explorer</h1>
          <p className="text-slate-500 text-sm font-medium mt-1">Audit on-chain smart contract disbursements, verification events, and block records.</p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-lg bg-green-50 px-3.5 py-1.5 text-xs font-bold text-green-800 border border-green-200/50 shadow-xs">
          <Database className="h-4 w-4 text-green-600 animate-pulse" />
          <span>Solidity v0.8.20 Active</span>
        </div>
      </div>

      {/* Network Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Latest Block</span>
            <h3 className="text-xl font-extrabold text-slate-900 mt-1 font-mono">#{latestBlock}</h3>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <Layers className="h-5 w-5" />
          </div>
        </div>
        <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Relief Ledger Volume</span>
            <h3 className="text-xl font-extrabold text-slate-900 mt-1 font-mono">{formatRupee(totalVolume)}</h3>
          </div>
          <div className="p-3 bg-green-50 text-green-600 rounded-lg">
            <Coins className="h-5 w-5" />
          </div>
        </div>
        <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Txs Recorded</span>
            <h3 className="text-xl font-extrabold text-slate-900 mt-1 font-mono">{blockchainTxs.length} Confirmed</h3>
          </div>
          <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
            <Activity className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Search bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
          <Search className="h-4.5 w-4.5" />
        </div>
        <input
          type="text"
          placeholder="Search by TxHash, block number, purpose, or NGO partner..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-xl bg-white border border-slate-200 pl-10 pr-4 py-3 text-sm text-slate-700 placeholder-slate-400 shadow-xs focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
        />
      </div>

      {/* Transactions Feed */}
      <div className="bg-white border border-slate-200/80 rounded-xl shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200/80 bg-slate-50/50">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-600">On-Chain Transaction Log</h3>
        </div>
        
        <div className="space-y-0.5 divide-y divide-slate-100">
          {filteredTxs.map((tx) => (
            <div key={tx.hash} className="p-6 hover:bg-slate-50/50 transition-colors space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-green-700 break-all">{tx.hash}</span>
                  </div>
                  <div className="flex gap-3 text-[10px] font-medium text-slate-400 font-sans">
                    <span className="flex items-center gap-1"><Layers className="h-3.5 w-3.5" /> Block #{tx.block}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {new Date(tx.timestamp).toLocaleString()}</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-mono text-sm font-bold text-slate-900 block">{formatRupee(tx.amount)}</span>
                  <span className="text-[9px] uppercase tracking-wider font-bold text-green-600">CONFIRMED</span>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200/40 rounded-lg p-3 text-xs">
                <p className="text-slate-500"><span className="font-bold text-slate-700">Contract release payload:</span> Direct relief allocation to <span className="font-bold text-slate-700">{tx.ngo}</span> for purpose: "{tx.purpose}"</p>
              </div>
            </div>
          ))}
          {filteredTxs.length === 0 && (
            <div className="p-8 text-center text-xs text-slate-400 italic">
              No transactions match your search query.
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default Blockchain;
