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
  ArrowRight
} from 'lucide-react';

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
    <div className="space-y-8 font-sans">
      
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Funding Requests</h1>
        <p className="text-slate-500 text-sm font-medium mt-1">Review, adjust, and approve humanitarian relief budget requests on the ledger.</p>
      </div>

      {/* Main Table Panel */}
      <div className="bg-white border border-slate-200/80 rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200/80 flex items-center justify-between bg-slate-50/50">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-600 flex items-center gap-2">
            <ClipboardList className="h-4.5 w-4.5 text-slate-400" />
            Active Funding Queue
          </h3>
          <span className="text-xs font-mono font-bold text-green-700">
            {fundRequests.filter(r => r.status === 'submitted').length} Pending
          </span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/30 text-xs font-bold uppercase tracking-wider text-slate-400">
                <th className="px-6 py-4">NGO / Agency</th>
                <th className="px-6 py-4">Disaster Incident</th>
                <th className="px-6 py-4">Purpose</th>
                <th className="px-6 py-4">Requested Funds</th>
                <th className="px-6 py-4">Priority</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
              {fundRequests.map((req) => (
                <tr key={req.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="font-bold text-slate-900">{req.ngo}</span>
                  </td>
                  <td className="px-6 py-4 text-slate-500 max-w-[120px] truncate" title={req.disasterName}>
                    {req.disasterName}
                  </td>
                  <td className="px-6 py-4 text-slate-500 max-w-[200px] truncate" title={req.purpose}>
                    {req.purpose}
                  </td>
                  <td className="px-6 py-4 font-mono font-bold text-slate-900">
                    {formatRupee(req.amount)}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                      req.priority === 'High' ? 'bg-red-50 text-red-700 border border-red-200/60' :
                      req.priority === 'Medium' ? 'bg-amber-50 text-amber-700 border border-amber-200/60' :
                      'bg-slate-50 text-slate-600 border border-slate-200/60'
                    }`}>
                      {req.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <StatusBadge type="budget" value={req.status === 'blockchain_completed' ? 'approved' : req.status} />
                  </td>
                  <td className="px-6 py-4 text-right">
                    {req.status === 'submitted' ? (
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => handleOpenApproveModal(req)}
                          className="inline-flex items-center gap-1 bg-green-50 hover:bg-green-100 text-green-700 px-3 py-1.5 rounded-lg border border-green-200/50 transition-all font-bold cursor-pointer"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(req.id)}
                          className="inline-flex items-center gap-1 bg-rose-50 hover:bg-rose-100 text-rose-700 px-3 py-1.5 rounded-lg border border-rose-200/50 transition-all font-bold cursor-pointer"
                        >
                          Reject
                        </button>
                      </div>
                    ) : req.status === 'blockchain_completed' ? (
                      <span className="text-[10px] text-slate-400 font-mono font-bold select-none cursor-help" title={`TxHash: ${req.txHash}`}>
                        Ledger Confirmed
                      </span>
                    ) : (
                      <span className="text-[10px] text-rose-500 font-bold uppercase select-none">
                        Rejected
                      </span>
                    )}
                  </td>
                </tr>
              ))}
              {fundRequests.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-400 italic">No funding proposals recorded in this queue</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Approval Modal */}
      {isApproveModalOpen && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={() => setIsApproveModalOpen(false)} />
          
          <div className="relative bg-white border border-slate-200 shadow-xl rounded-2xl max-w-lg w-full p-6 space-y-6 animate-scale-in">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-lg">Approve Funding Proposal</h3>
                <p className="text-xs text-slate-400 mt-1">Review request and sign to trigger Solidity contract disbursement.</p>
              </div>
              <button 
                onClick={() => setIsApproveModalOpen(false)} 
                className="p-1 text-slate-400 hover:bg-slate-100 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs font-semibold text-slate-700">
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200/40">
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase">NGO Requester</span>
                  <p className="text-slate-900 font-bold mt-0.5">{selectedRequest.ngo}</p>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase">Target Incident</span>
                  <p className="text-slate-900 font-bold mt-0.5">{selectedRequest.disasterName}</p>
                </div>
                <div className="col-span-2">
                  <span className="text-[9px] font-bold text-slate-400 uppercase font-sans">Purpose details</span>
                  <p className="text-slate-600 font-medium leading-relaxed mt-0.5">{selectedRequest.purpose}</p>
                </div>
              </div>

              {/* Adjust Budget Input */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Approvable Relief Fund (INR):
                </label>
                <input
                  type="number"
                  value={approvedAmount}
                  onChange={(e) => setApprovedAmount(Number(e.target.value))}
                  className="w-full rounded-xl bg-white border border-slate-200 px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 font-mono"
                />
                <span className="text-[10px] text-slate-400 font-medium">Original Request: {formatRupee(selectedRequest.amount)}</span>
              </div>

              {/* Remarks Area */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Approver Remarks / SOP Compliance Notes:
                </label>
                <textarea
                  rows={2}
                  value={approverNotes}
                  onChange={(e) => setApproverNotes(e.target.value)}
                  className="w-full rounded-xl bg-white border border-slate-200 px-4 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                />
              </div>

              {/* Safety notice */}
              <div className="flex gap-2.5 p-3 rounded-lg bg-green-50 border border-green-200/50 text-green-800 text-[10px] leading-relaxed font-medium">
                <Coins className="h-4.5 w-4.5 shrink-0 text-green-600" />
                <span>Confirming this action will sign a smart contract on-chain, creating a block transaction release and disbursing funds immediately.</span>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                onClick={() => setIsApproveModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmApproval}
                className="px-5 py-2 rounded-xl bg-green-600 hover:bg-green-700 text-white text-xs font-bold shadow-sm cursor-pointer"
              >
                Sign & Transact
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default PendingRequests;
