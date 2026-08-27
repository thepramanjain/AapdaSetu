import React, { useState } from 'react';
import { useStore } from '../hooks/useStore';
import type { FundRequest } from '../hooks/useStore';
import { StatusBadge } from '../components/StatusBadge';
import { 
  ClipboardList, 
  CheckCircle2, 
  XCircle, 
  Coins, 
  HelpCircle,
  FileCheck,
  ShieldAlert,
  ArrowRight,
  Sparkles,
  Lock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const PendingRequests: React.FC = () => {
  const fundRequests = useStore((state) => state.fundRequests);
  const approveFundRequest = useStore((state) => state.approveFundRequest);
  const rejectFundRequest = useStore((state) => state.rejectFundRequest);

  const [selectedRequest, setSelectedRequest] = useState<FundRequest | null>(null);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [approvedAmount, setApprovedAmount] = useState<number>(0);
  const [approverNotes, setApproverNotes] = useState('');

  const formatRupee = (value: number) => {
    if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)} Cr`;
    if (value >= 100000) return `₹${(value / 100000).toFixed(2)} L`;
    return `₹${value.toLocaleString('en-IN')}`;
  };

  const handleOpenApproveModal = (req: FundRequest) => {
    setSelectedRequest(req);
    setApprovedAmount(req.amount);
    setApproverNotes(`Authorized release for ${req.ngo} - verified supply scope.`);
    setIsApproveModalOpen(true);
  };

  const handleConfirmApproval = () => {
    if (selectedRequest) {
      approveFundRequest(selectedRequest.id, approvedAmount);
      setIsApproveModalOpen(false);
      setSelectedRequest(null);
    }
  };

  const handleReject = (id: string) => {
    if (window.confirm("Are you sure you want to reject this funding proposal?")) {
      rejectFundRequest(id);
    }
  };

  return (
    <div className="space-y-8 font-sans select-none">
      
      {/* Title Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-xs font-mono font-black uppercase tracking-wider text-emerald-800">
              National Treasury Queue
            </span>
          </div>
          <h1 className="text-3xl font-display font-black text-slate-900 tracking-tight">NGO Fund Request Clearances</h1>
          <p className="text-slate-600 text-sm font-medium mt-1">Review, adjust, and approve humanitarian relief budget requests on the ledger.</p>
        </div>
      </div>

      {/* Main Table Panel Container */}
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
            <h3 className="font-display font-black text-lg text-slate-900">Active Funding Queue</h3>
            <p className="text-xs text-slate-500 font-mono">Real-time NGO grant proposals pending authorization</p>
          </div>
          <span 
            className="text-xs font-mono font-black text-emerald-800 px-3 py-1 rounded-full"
            style={{
              backgroundColor: '#E4E9F2',
              boxShadow: 'inset 2px 2px 4px #b8c4d9, inset -2px -2px 4px #ffffff',
            }}
          >
            {fundRequests.filter(r => r.status === 'submitted').length} Pending Requests
          </span>
        </div>
        
        <div className="grid gap-3.5">
          {fundRequests.map((req) => (
            <motion.div 
              key={req.id} 
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
                  <span className="font-display font-black text-slate-900 text-base">{req.ngo}</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-mono font-black uppercase ${
                    req.priority === 'High' ? 'bg-rose-100 text-rose-800 border border-rose-200' :
                    'bg-amber-100 text-amber-800 border border-amber-200'
                  }`}>
                    {req.priority} Priority
                  </span>
                </div>
                <p className="text-xs text-slate-700 font-medium">
                  {req.purpose}
                </p>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 font-mono pt-1">
                  <span>Incident: <strong className="text-slate-800">{req.disasterName}</strong></span>
                  <span>•</span>
                  <span>Requested: <strong className="text-emerald-800 font-bold">{formatRupee(req.amount)}</strong></span>
                </div>
              </div>

              <div className="flex items-center gap-3 self-end md:self-center shrink-0">
                <StatusBadge type="budget" value={req.status === 'blockchain_completed' ? 'approved' : req.status} />

                {req.status === 'submitted' ? (
                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => handleOpenApproveModal(req)}
                      className="px-4 py-2 rounded-xl text-xs font-black text-white shadow-md cursor-pointer"
                      style={{
                        background: 'linear-gradient(135deg, #065F46, #10B981)',
                      }}
                    >
                      Authorize & Sign
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => handleReject(req.id)}
                      className="px-3.5 py-2 rounded-xl text-xs font-bold text-rose-700 hover:bg-rose-50 border border-rose-200 cursor-pointer"
                    >
                      Reject
                    </motion.button>
                  </div>
                ) : req.status === 'blockchain_completed' ? (
                  <span className="text-[10px] text-emerald-800 font-mono font-black bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                    ✓ Ledger Confirmed
                  </span>
                ) : (
                  <span className="text-[10px] text-rose-500 font-bold uppercase">
                    Rejected
                  </span>
                )}
              </div>
            </motion.div>
          ))}
          {fundRequests.length === 0 && (
            <p className="text-slate-400 italic text-center py-8 text-xs font-mono">No funding proposals recorded in this queue</p>
          )}
        </div>
      </div>

      {/* Approval Modal */}
      {isApproveModalOpen && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setIsApproveModalOpen(false)} />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative rounded-3xl max-w-lg w-full p-7 space-y-6 shadow-2xl border border-white"
            style={{
              backgroundColor: '#E4E9F2',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
            }}
          >
            <div className="flex justify-between items-start border-b border-slate-300/60 pb-3">
              <div>
                <h3 className="font-display font-black text-slate-900 text-xl">Approve Funding Proposal</h3>
                <p className="text-xs text-slate-500 mt-0.5">Authorize request and sign to trigger Solidity contract disbursement.</p>
              </div>
              <button 
                onClick={() => setIsApproveModalOpen(false)} 
                className="p-1.5 text-slate-400 hover:text-slate-800 rounded-xl hover:bg-white/60 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs font-semibold text-slate-700">
              <div 
                className="p-4 rounded-2xl space-y-2"
                style={{
                  backgroundColor: '#FFFFFF',
                  boxShadow: 'inset 2px 2px 5px #b8c4d9, inset -2px -2px 5px #ffffff',
                }}
              >
                <div className="flex justify-between">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">NGO Requester</span>
                  <p className="text-slate-900 font-bold">{selectedRequest.ngo}</p>
                </div>
                <div className="flex justify-between">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Target Incident</span>
                  <p className="text-slate-900 font-bold">{selectedRequest.disasterName}</p>
                </div>
                <div className="pt-1 border-t border-slate-100">
                  <p className="text-slate-600 font-medium leading-relaxed">{selectedRequest.purpose}</p>
                </div>
              </div>

              {/* Adjust Budget Input */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-mono font-black uppercase tracking-wider text-slate-500">
                  Approvable Relief Fund (INR):
                </label>
                <input
                  type="number"
                  value={approvedAmount}
                  onChange={(e) => setApprovedAmount(Number(e.target.value))}
                  className="w-full rounded-xl p-3 text-sm text-slate-900 font-mono font-black outline-none"
                  style={{
                    backgroundColor: '#FFFFFF',
                    boxShadow: 'inset 2px 2px 5px #b8c4d9, inset -2px -2px 5px #ffffff',
                  }}
                />
              </div>

              {/* Remarks Area */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-mono font-black uppercase tracking-wider text-slate-500">
                  Approver Remarks / SOP Compliance Notes:
                </label>
                <textarea
                  rows={2}
                  value={approverNotes}
                  onChange={(e) => setApproverNotes(e.target.value)}
                  className="w-full rounded-xl p-3 text-xs text-slate-900 font-medium outline-none"
                  style={{
                    backgroundColor: '#FFFFFF',
                    boxShadow: 'inset 2px 2px 5px #b8c4d9, inset -2px -2px 5px #ffffff',
                  }}
                />
              </div>

              {/* Safety notice */}
              <div className="flex gap-2.5 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-[10px] leading-relaxed font-medium">
                <Lock className="h-4 w-4 shrink-0 text-emerald-700" />
                <span>Confirming this action will sign a smart contract on-chain, creating a block transaction release and disbursing funds immediately.</span>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-300/60">
              <button
                onClick={() => setIsApproveModalOpen(false)}
                className="px-4 py-2.5 rounded-xl bg-white/60 hover:bg-white text-slate-700 text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleConfirmApproval}
                className="px-6 py-2.5 rounded-xl text-white text-xs font-black shadow-lg cursor-pointer"
                style={{
                  background: 'linear-gradient(135deg, #065F46, #10B981)',
                }}
              >
                Sign & Transact On-Chain
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}

    </div>
  );
};

export default PendingRequests;
