import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useStore } from '../hooks/useStore';
import type { FundRequest } from '../hooks/useStore';
import { StatusBadge } from '../components/StatusBadge';
import { 
  Coins, 
  ClipboardList, 
  Send, 
  CheckCircle2, 
  ArrowRight,
  Database,
  Search,
  Sparkles,
  Lock
} from 'lucide-react';
import { motion } from 'framer-motion';

export const NGOFundRequest: React.FC = () => {
  const disasters = useStore((state) => state.disasters);
  const fundRequests = useStore((state) => state.fundRequests);
  const createFundRequest = useStore((state) => state.createFundRequest);
  
  const location = useLocation();
  const navigate = useNavigate();

  const ngoName = 'SEEDS Relief Organization';

  const queryParams = new URLSearchParams(location.search);
  const initialDisasterId = queryParams.get('disasterId') || '';

  const [disasterId, setDisasterId] = useState(initialDisasterId);
  const [amount, setAmount] = useState<number>(1800000);
  const [purpose, setPurpose] = useState('');
  const [requiredResources, setRequiredResources] = useState('');
  const [supportingNotes, setSupportingNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [selectedReqId, setSelectedReqId] = useState<string | null>(null);

  const activeDisasters = disasters.filter(d => d.status === 'published');
  const seedsRequests = fundRequests.filter(r => r.ngo === ngoName);
  const selectedRequest = seedsRequests.find(r => r.id === selectedReqId) || seedsRequests[0];

  useEffect(() => {
    if (initialDisasterId) {
      setDisasterId(initialDisasterId);
    }
  }, [initialDisasterId]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const targetDisaster = disasters.find(d => d.id === disasterId);
    if (!targetDisaster) {
      alert("Invalid disaster selected.");
      setIsSubmitting(false);
      return;
    }

    setTimeout(() => {
      createFundRequest({
        ngo: ngoName,
        amount,
        purpose,
        priority: 'High',
        requiredResources,
        supportingNotes,
        disasterId,
        disasterName: targetDisaster.name
      });

      setIsSubmitting(false);
      setPurpose('');
      setRequiredResources('');
      setSupportingNotes('');
      
      setTimeout(() => {
        const latest = fundRequests.find(r => r.ngo === ngoName);
        if (latest) setSelectedReqId(latest.id);
      }, 50);
    }, 800);
  };

  const formatRupee = (value: number) => {
    if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)} Cr`;
    if (value >= 100000) return `₹${(value / 100000).toFixed(2)} L`;
    return `₹${value.toLocaleString('en-IN')}`;
  };

  const getTimelineStageIndex = (status: FundRequest['status']) => {
    switch (status) {
      case 'submitted': return 0;
      case 'review': return 1;
      case 'approved': return 2;
      case 'blockchain_completed': return 3;
      default: return 0;
    }
  };

  const timelineStages = [
    { label: 'Submitted', desc: 'Disbursement request registered in government command hub.' },
    { label: 'Government Review', desc: 'NDMA finance cell validating target resource metrics.' },
    { label: 'Approved', desc: 'Authorized. Signing contract on-chain ledger.' },
    { label: 'Blockchain Completed', desc: 'Solidity block transaction confirmed. Payout disbursed.' }
  ];

  return (
    <div className="space-y-8 font-sans select-none">
      
      {/* Title Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-xs font-mono font-black uppercase tracking-wider text-emerald-800">
              Smart Treasury
            </span>
          </div>
          <h1 className="text-3xl font-display font-black text-slate-900 tracking-tight">Funding Proposals & Tranches</h1>
          <p className="text-slate-600 text-sm font-medium mt-1">Submit relief resource proposals and track real-time blockchain disbursement status.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Form & History List */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Form */}
          <div 
            className="rounded-3xl p-6 sm:p-8 space-y-5"
            style={{
              backgroundColor: '#E4E9F2',
              boxShadow: '10px 10px 24px #b8c4d9, -10px -10px 24px #ffffff',
              border: '1.5px solid rgba(255, 255, 255, 0.8)',
            }}
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-300/60">
              <h3 className="font-display font-black text-lg text-slate-900 flex items-center gap-2">
                <Coins className="h-5 w-5 text-emerald-700" />
                New Relief Allocation Request
              </h3>
              <span 
                className="text-[10px] font-mono font-black uppercase text-emerald-800 px-3 py-1 rounded-full"
                style={{
                  backgroundColor: '#E4E9F2',
                  boxShadow: 'inset 2px 2px 4px #b8c4d9, inset -2px -2px 4px #ffffff',
                }}
              >
                Instant Smart Ledger
              </span>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs font-semibold text-slate-700">
              
              {/* Disaster Dropdown */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-mono font-black uppercase tracking-wider text-slate-500">Select Active Disaster</label>
                <select
                  value={disasterId}
                  onChange={(e) => setDisasterId(e.target.value)}
                  required
                  className="w-full rounded-xl px-4 py-3 text-sm text-slate-900 font-bold outline-none"
                  style={{
                    backgroundColor: '#FFFFFF',
                    boxShadow: 'inset 2px 2px 5px #b8c4d9, inset -2px -2px 5px #ffffff',
                    border: '1px solid rgba(255, 255, 255, 0.7)',
                  }}
                >
                  <option value="" disabled>-- Choose Incident --</option>
                  {activeDisasters.map((d) => (
                    <option key={d.id} value={d.id}>{d.name} ({d.state})</option>
                  ))}
                </select>
              </div>

              {/* Amount */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-mono font-black uppercase tracking-wider text-slate-500">Requested Amount (INR)</label>
                <input
                  type="number"
                  required
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full rounded-xl px-4 py-3 text-sm text-slate-900 font-mono font-black outline-none"
                  style={{
                    backgroundColor: '#FFFFFF',
                    boxShadow: 'inset 2px 2px 5px #b8c4d9, inset -2px -2px 5px #ffffff',
                    border: '1px solid rgba(255, 255, 255, 0.7)',
                  }}
                />
              </div>

              {/* Purpose / Reason */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-mono font-black uppercase tracking-wider text-slate-500">Purpose / Relief Operations</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Deploy boat rescue vectors, construct 2 central food hubs..."
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  className="w-full rounded-xl px-4 py-3 text-sm text-slate-900 font-medium outline-none placeholder-slate-400"
                  style={{
                    backgroundColor: '#FFFFFF',
                    boxShadow: 'inset 2px 2px 5px #b8c4d9, inset -2px -2px 5px #ffffff',
                    border: '1px solid rgba(255, 255, 255, 0.7)',
                  }}
                />
              </div>

              {/* Required Resources */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-mono font-black uppercase tracking-wider text-slate-500">Required Resources Breakdown</label>
                <textarea
                  rows={2}
                  required
                  placeholder="e.g. 5x Water purification nodes, 1500x Food packets, 8x Medical camps..."
                  value={requiredResources}
                  onChange={(e) => setRequiredResources(e.target.value)}
                  className="w-full rounded-xl px-4 py-2.5 text-sm text-slate-900 font-medium outline-none placeholder-slate-400"
                  style={{
                    backgroundColor: '#FFFFFF',
                    boxShadow: 'inset 2px 2px 5px #b8c4d9, inset -2px -2px 5px #ffffff',
                    border: '1px solid rgba(255, 255, 255, 0.7)',
                  }}
                />
              </div>

              {/* Supporting Notes */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-mono font-black uppercase tracking-wider text-slate-500">Supporting Notes / Field Data</label>
                <textarea
                  rows={2}
                  placeholder="On-ground volunteer metrics, local infrastructure status notes..."
                  value={supportingNotes}
                  onChange={(e) => setSupportingNotes(e.target.value)}
                  className="w-full rounded-xl px-4 py-2.5 text-sm text-slate-900 font-medium outline-none placeholder-slate-400"
                  style={{
                    backgroundColor: '#FFFFFF',
                    boxShadow: 'inset 2px 2px 5px #b8c4d9, inset -2px -2px 5px #ffffff',
                    border: '1px solid rgba(255, 255, 255, 0.7)',
                  }}
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isSubmitting || !disasterId}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-black text-white shadow-lg transition-all cursor-pointer disabled:opacity-50"
                style={{
                  background: 'linear-gradient(135deg, #065F46 0%, #047857 50%, #10B981 100%)',
                  boxShadow: '0 8px 24px -4px rgba(16, 185, 129, 0.4)',
                }}
              >
                {isSubmitting ? (
                  <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    <span>Submit Funding Proposal</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </motion.button>

            </form>
          </div>

          {/* Requests History List */}
          <div 
            className="rounded-3xl p-6 space-y-4"
            style={{
              backgroundColor: '#E4E9F2',
              boxShadow: '8px 8px 20px #b8c4d9, -8px -8px 20px #ffffff',
              border: '1px solid rgba(255, 255, 255, 0.7)',
            }}
          >
            <h3 className="text-xs font-mono font-black uppercase tracking-wider text-slate-700 pb-3 border-b border-slate-300/60">
              Proposal History List
            </h3>
            <div className="space-y-3">
              {seedsRequests.map((req) => {
                const isSelected = selectedRequest?.id === req.id;
                return (
                  <motion.div
                    key={req.id}
                    whileHover={{ y: -2, scale: 1.01 }}
                    onClick={() => setSelectedReqId(req.id)}
                    className="p-4 rounded-2xl transition-all cursor-pointer"
                    style={{
                      backgroundColor: '#FFFFFF',
                      boxShadow: isSelected
                        ? 'inset 2px 2px 5px #b8c4d9, inset -2px -2px 5px #ffffff'
                        : '3px 3px 8px #b8c4d9, -3px -3px 8px #ffffff',
                      border: isSelected ? '1.5px solid #059669' : '1px solid rgba(255, 255, 255, 0.7)',
                    }}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-display font-black text-slate-900 text-xs">{req.purpose}</h4>
                        <p className="text-[10px] text-slate-500 font-bold font-mono uppercase mt-0.5">{req.disasterName}</p>
                      </div>
                      <span className="font-mono text-emerald-800 font-black text-xs">{formatRupee(req.amount)}</span>
                    </div>
                    <div className="mt-3 flex justify-between items-center text-[10px] font-mono">
                      <span className="text-slate-400">{new Date(req.timestamp).toLocaleDateString()}</span>
                      <StatusBadge type="budget" value={req.status === 'blockchain_completed' ? 'approved' : req.status} />
                    </div>
                  </motion.div>
                );
              })}
              {seedsRequests.length === 0 && (
                <p className="text-slate-400 italic text-center py-4 text-xs font-mono">No relief fund proposals logged.</p>
              )}
            </div>
          </div>

        </div>

        {/* Right Column: Status timeline view */}
        <div className="lg:col-span-5">
          {selectedRequest ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-3xl p-6 sm:p-8 space-y-6"
              style={{
                backgroundColor: '#E4E9F2',
                boxShadow: '10px 10px 24px #b8c4d9, -10px -10px 24px #ffffff',
                border: '1.5px solid rgba(255, 255, 255, 0.8)',
              }}
            >
              
              <div className="border-b border-slate-300/60 pb-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-black text-base text-slate-900">Disbursement Track</h3>
                  <span className="text-[10px] text-emerald-800 font-mono font-black uppercase bg-emerald-100/70 px-2.5 py-0.5 rounded-full border border-emerald-300">
                    Live Status
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 mt-1 font-mono uppercase font-bold">Request ID: {selectedRequest.id}</p>
              </div>

              {/* Status Timeline */}
              <div className="flex flex-col gap-6 relative pl-8 py-2">
                <div className="absolute left-[11px] top-3 bottom-3 w-0.5 bg-slate-300" />
                <div 
                  className="absolute left-[11px] top-3 w-0.5 bg-emerald-600 transition-all duration-500" 
                  style={{ height: `${(getTimelineStageIndex(selectedRequest.status) / (timelineStages.length - 1)) * 88}%` }}
                />

                {timelineStages.map((stage, idx) => {
                  const currentStageIdx = getTimelineStageIndex(selectedRequest.status);
                  const isCompleted = idx < currentStageIdx;
                  const isActive = idx === currentStageIdx;

                  return (
                    <div key={idx} className="relative flex flex-col gap-1 select-none">
                      <div 
                        className={`absolute -left-[27px] top-1.5 w-6 h-6 rounded-full border flex items-center justify-center transition-all ${
                          isCompleted ? 'border-emerald-600 text-emerald-700 bg-emerald-50 shadow-sm' : 
                          isActive ? 'border-emerald-600 text-emerald-800 bg-white scale-110 font-black shadow-md' : 
                          'border-slate-300 text-slate-400 bg-white'
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        ) : (
                          <span className="text-[9px] font-mono font-bold">{idx + 1}</span>
                        )}
                      </div>

                      <span className={`text-xs font-black transition-colors ${
                        isActive ? 'text-slate-900' : 
                        isCompleted ? 'text-slate-700' : 
                        'text-slate-400'
                      }`}>
                        {stage.label}
                      </span>
                      
                      <p className={`text-[11px] leading-relaxed transition-colors ${
                        isActive ? 'text-slate-600 font-medium' :
                        isCompleted ? 'text-slate-500 font-medium' :
                        'text-slate-400'
                      }`}>
                        {stage.desc}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Block Details on completion */}
              {selectedRequest.status === 'blockchain_completed' && selectedRequest.txHash && (
                <div 
                  className="pt-4 space-y-2 font-mono text-[10px] leading-relaxed p-4 rounded-2xl border"
                  style={{
                    backgroundColor: '#FFFFFF',
                    boxShadow: 'inset 2px 2px 4px #b8c4d9, inset -2px -2px 4px #ffffff',
                    borderColor: 'rgba(16, 185, 129, 0.3)',
                  }}
                >
                  <div className="flex items-center gap-1.5 text-emerald-800 font-black pb-1 border-b border-slate-200">
                    <Database className="h-4 w-4 text-emerald-600" />
                    <span>ON-CHAIN TRANSACTION RECORD</span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-400 uppercase">TX Hash</span>
                    <p className="text-emerald-700 font-bold break-all mt-0.5">{selectedRequest.txHash}</p>
                  </div>
                  <div className="flex justify-between border-t border-slate-100 pt-1.5 font-bold">
                    <span className="text-slate-600">Block Status: <strong className="text-emerald-700 uppercase">CONFIRMED</strong></span>
                    <span className="text-emerald-800">Direct ledger release</span>
                  </div>
                </div>
              )}

            </motion.div>
          ) : (
            <div 
              className="p-12 rounded-3xl text-center text-xs font-mono text-slate-400"
              style={{
                backgroundColor: '#E4E9F2',
                boxShadow: 'inset 4px 4px 8px #b8c4d9, inset -4px -4px 8px #ffffff',
              }}
            >
              Please select a request from your proposal history to view progress tracking.
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default NGOFundRequest;
