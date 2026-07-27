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
  Search
} from 'lucide-react';

export const NGOFundRequest: React.FC = () => {
  const disasters = useStore((state) => state.disasters);
  const fundRequests = useStore((state) => state.fundRequests);
  const createFundRequest = useStore((state) => state.createFundRequest);
  
  const location = useLocation();
  const navigate = useNavigate();

  const ngoName = 'SEEDS Relief Organization';

  // Get disasterId from query params if navigated from details page
  const queryParams = new URLSearchParams(location.search);
  const initialDisasterId = queryParams.get('disasterId') || '';

  // Form states
  const [disasterId, setDisasterId] = useState(initialDisasterId);
  const [amount, setAmount] = useState<number>(1800000);
  const [purpose, setPurpose] = useState('');
  const [requiredResources, setRequiredResources] = useState('');
  const [supportingNotes, setSupportingNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Selected request for timeline view
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
      // Reset form
      setPurpose('');
      setRequiredResources('');
      setSupportingNotes('');
      
      // Auto-select the newly created request
      // (The newest request will be index 0 due to our store adding it to the front)
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

  // Timeline rendering helper
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
    <div className="space-y-8 font-sans">
      
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Funding Proposals</h1>
        <p className="text-slate-500 text-sm font-medium mt-1">Submit relief resource proposals and track real-time blockchain disbursement status.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Form & History List */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Form */}
          <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-sm space-y-5">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-600 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Coins className="h-4.5 w-4.5 text-green-600" />
              New Relief Allocation Request
            </h3>

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs font-semibold text-slate-700">
              
              {/* Disaster Dropdown */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Select Active Disaster</label>
                <select
                  value={disasterId}
                  onChange={(e) => setDisasterId(e.target.value)}
                  required
                  className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                >
                  <option value="" disabled>-- Choose Incident --</option>
                  {activeDisasters.map((d) => (
                    <option key={d.id} value={d.id}>{d.name} ({d.state})</option>
                  ))}
                </select>
              </div>

              {/* Amount */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Requested Amount (INR)</label>
                <input
                  type="number"
                  required
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 font-mono"
                />
              </div>

              {/* Purpose / Reason */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Purpose / Relief Operations</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Deploy boat rescue vectors, construct 2 central food hubs..."
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-2.5 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                />
              </div>

              {/* Required Resources */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Required Resources Breakdown</label>
                <textarea
                  rows={2}
                  required
                  placeholder="e.g. 5x Water purification nodes, 1500x Food packets, 8x Medical camps..."
                  value={requiredResources}
                  onChange={(e) => setRequiredResources(e.target.value)}
                  className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-2 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                />
              </div>

              {/* Supporting Notes */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Supporting Notes / Field Data</label>
                <textarea
                  rows={2}
                  placeholder="On-ground volunteer metrics, local infrastructure status notes..."
                  value={supportingNotes}
                  onChange={(e) => setSupportingNotes(e.target.value)}
                  className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-2 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !disasterId}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 hover:bg-green-700 px-5 py-3 text-sm font-bold text-white shadow-md shadow-green-600/10 transition-all cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
              >
                {isSubmitting ? (
                  <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Submit Funding Request
                  </>
                )}
              </button>

            </form>
          </div>

          {/* Requests History List */}
          <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-600 border-b border-slate-100 pb-2">
              Proposal History List
            </h3>
            <div className="space-y-3">
              {seedsRequests.map((req) => {
                const isSelected = selectedRequest?.id === req.id;
                return (
                  <div
                    key={req.id}
                    onClick={() => setSelectedReqId(req.id)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-green-50/20 border-green-600 shadow-sm'
                        : 'border-slate-200/80 hover:bg-slate-50/60'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-slate-800 text-xs">{req.purpose}</h4>
                        <p className="text-[10px] text-slate-400 font-medium font-mono uppercase mt-0.5">{req.disasterName}</p>
                      </div>
                      <span className="font-mono text-slate-900 font-bold text-xs">{formatRupee(req.amount)}</span>
                    </div>
                    <div className="mt-3 flex justify-between items-center text-[10px]">
                      <span className="text-slate-400">{new Date(req.timestamp).toLocaleDateString()}</span>
                      <StatusBadge type="budget" value={req.status === 'blockchain_completed' ? 'approved' : req.status} />
                    </div>
                  </div>
                );
              })}
              {seedsRequests.length === 0 && (
                <p className="text-slate-400 italic text-center py-4 text-xs">No relief fund proposals logged.</p>
              )}
            </div>
          </div>

        </div>

        {/* Right Column: Status timeline view */}
        <div className="lg:col-span-5">
          {selectedRequest ? (
            <div className="bg-white border border-slate-200/80 rounded-xl p-6 shadow-sm space-y-6">
              
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-600">Disbursement Track</h3>
                <p className="text-[10px] text-slate-400 mt-1 font-mono uppercase">Request ID: {selectedRequest.id}</p>
              </div>

              {/* Status Timeline */}
              <div className="flex flex-col gap-6 relative pl-8 py-2">
                {/* Vertical bar */}
                <div className="absolute left-[11px] top-3 bottom-3 w-0.5 bg-slate-200" />
                {/* Active bar overlay */}
                <div 
                  className="absolute left-[11px] top-3 w-0.5 bg-green-600 transition-all duration-500" 
                  style={{ height: `${(getTimelineStageIndex(selectedRequest.status) / (timelineStages.length - 1)) * 88}%` }}
                />

                {timelineStages.map((stage, idx) => {
                  const currentStageIdx = getTimelineStageIndex(selectedRequest.status);
                  const isCompleted = idx < currentStageIdx;
                  const isActive = idx === currentStageIdx;

                  return (
                    <div key={idx} className="relative flex flex-col gap-1 select-none">
                      {/* Circle dot indicators */}
                      <div 
                        className={`absolute -left-[27px] top-1.5 w-6 h-6 rounded-full border bg-white flex items-center justify-center transition-all ${
                          isCompleted ? 'border-green-600 text-green-700 bg-green-50' : 
                          isActive ? 'border-green-600 text-green-700 scale-110 font-bold shadow-xs' : 
                          'border-slate-300 text-slate-400'
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        ) : (
                          <span className="text-[9px] font-mono">{idx + 1}</span>
                        )}
                      </div>

                      <span className={`text-xs font-bold transition-colors ${
                        isActive ? 'text-slate-900 font-bold' : 
                        isCompleted ? 'text-slate-700' : 
                        'text-slate-400'
                      }`}>
                        {stage.label}
                      </span>
                      
                      <p className={`text-[10px] leading-relaxed transition-colors ${
                        isActive ? 'text-slate-600' :
                        isCompleted ? 'text-slate-500 font-medium' :
                        'text-slate-400 font-medium'
                      }`}>
                        {stage.desc}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Block Details on completion */}
              {selectedRequest.status === 'blockchain_completed' && selectedRequest.txHash && (
                <div className="border-t border-slate-100 pt-5 space-y-3 font-mono text-[10px] leading-relaxed text-slate-500 bg-slate-50/50 p-4 rounded-xl border border-slate-200/40">
                  <div className="flex items-center gap-1.5 text-green-700 font-bold border-b pb-1.5">
                    <Database className="h-4 w-4" />
                    <span>ON-CHAIN TRANSACTION RECORD</span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-400 uppercase">TX Hash</span>
                    <p className="text-green-700 break-all">{selectedRequest.txHash}</p>
                  </div>
                  <div className="flex justify-between border-t border-slate-100 pt-1.5">
                    <span>Block Status: <span className="font-bold text-green-700 uppercase">CONFIRMED</span></span>
                    <span>Direct ledger release</span>
                  </div>
                </div>
              )}

            </div>
          ) : (
            <div className="bg-white border border-slate-200/80 p-8 rounded-xl text-center text-xs text-slate-400 italic">
              Please select a request from your proposal history to view progress tracking.
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default NGOFundRequest;
