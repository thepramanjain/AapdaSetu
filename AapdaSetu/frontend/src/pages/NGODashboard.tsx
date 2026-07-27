import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../hooks/useStore';
import { KPICard } from '../components/KPICard';
import { StatusBadge } from '../components/StatusBadge';
import { 
  AlertTriangle, 
  ClipboardList, 
  DollarSign, 
  CheckSquare, 
  MapPin, 
  ArrowRight,
  TrendingUp
} from 'lucide-react';

export const NGODashboard: React.FC = () => {
  const disasters = useStore((state) => state.disasters);
  const fundRequests = useStore((state) => state.fundRequests);
  const setActiveIncidentId = useStore((state) => state.setActiveIncidentId);
  const navigate = useNavigate();

  const ngoName = 'SEEDS Relief Organization';

  // Metrics
  const assignedIncidents = disasters.filter(d => d.status === 'published').length;
  const pendingRequests = fundRequests.filter(r => r.ngo === ngoName && r.status === 'submitted').length;
  const approvedFunds = fundRequests
    .filter(r => r.ngo === ngoName && r.status === 'blockchain_completed')
    .reduce((sum, r) => sum + r.amount, 0);

  // Formatting currency
  const formatRupee = (value: number) => {
    if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)} Cr`;
    if (value >= 100000) return `₹${(value / 100000).toFixed(2)} L`;
    return `₹${value.toLocaleString('en-IN')}`;
  };

  const handleRowClick = (id: string) => {
    setActiveIncidentId(id);
    navigate('/ngo/assigned');
  };

  return (
    <div className="space-y-8 font-sans">
      
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">NGO Command Dashboard</h1>
        <p className="text-slate-500 text-sm font-medium mt-1">Humanitarian response workflow, assigned disaster tasks, and smart-contract funding status.</p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard 
          title="Assigned Incidents" 
          value={assignedIncidents} 
          icon={AlertTriangle}
          accentColor="text-blue-600 bg-blue-50 border-blue-100"
        />
        <KPICard 
          title="Pending Requests" 
          value={pendingRequests} 
          icon={ClipboardList}
          accentColor="text-amber-600 bg-amber-50 border-amber-100"
        />
        <KPICard 
          title="Approved Funds" 
          value={formatRupee(approvedFunds)} 
          icon={DollarSign}
          accentColor="text-green-600 bg-green-50 border-green-100"
        />
        <KPICard 
          title="Mission Completion" 
          value="82%" 
          icon={CheckSquare}
          accentColor="text-purple-600 bg-purple-50 border-purple-100"
        />
      </div>

      {/* Assigned Incidents feed */}
      <div className="bg-white border border-slate-200/80 rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200/80 bg-slate-50/50 flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-600">Assigned Disaster Areas</h3>
          <span className="text-xs text-slate-400 font-mono font-medium">{assignedIncidents} Incidents</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/30 text-xs font-bold uppercase tracking-wider text-slate-400">
                <th className="px-6 py-4">Incident Name</th>
                <th className="px-6 py-4">State</th>
                <th className="px-6 py-4">Severity</th>
                <th className="px-6 py-4">Exposed Pop.</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
              {disasters
                .filter((d) => d.status === 'published')
                .map((d) => (
                  <tr 
                    key={d.id} 
                    onClick={() => handleRowClick(d.id)}
                    className="hover:bg-slate-50/50 transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-4">
                      <span className="font-bold text-slate-900">{d.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono block mt-0.5">#{d.id}</span>
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-slate-400" /> {d.state}</span>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge type="severity" value={d.severity} />
                    </td>
                    <td className="px-6 py-4 font-mono text-slate-500">
                      {d.population.toLocaleString('en-IN')}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="inline-flex items-center justify-center gap-1.5 bg-green-50 hover:bg-green-100 text-green-700 px-3.5 py-1.5 rounded-lg border border-green-200/50 transition-all font-bold cursor-pointer">
                        Coordinate
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default NGODashboard;
