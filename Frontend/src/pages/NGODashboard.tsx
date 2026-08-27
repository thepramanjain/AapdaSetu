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
  TrendingUp,
  Radio,
  Sparkles
} from 'lucide-react';
import { motion } from 'framer-motion';

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
    <div className="space-y-8 font-sans select-none">
      
      {/* Title Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-xs font-mono font-black uppercase tracking-wider text-emerald-800">
              Operations Center
            </span>
          </div>
          <h1 className="text-3xl font-display font-black text-slate-900 tracking-tight">NGO Operations Dashboard</h1>
          <p className="text-slate-600 text-sm font-medium mt-1">Humanitarian response workflow, assigned disaster tasks, and smart-contract funding status.</p>
        </div>

        <div
          className="px-4 py-2 rounded-2xl flex items-center gap-2 text-xs font-mono font-black text-emerald-900"
          style={{
            backgroundColor: '#E4E9F2',
            boxShadow: 'inset 2px 2px 5px #b8c4d9, inset -2px -2px 5px #ffffff',
          }}
        >
          <Radio className="h-4 w-4 text-emerald-600 animate-pulse" />
          <span>SEEDS RELIEF UNIT #04</span>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard 
          title="Assigned Incidents" 
          value={assignedIncidents} 
          icon={AlertTriangle}
          trend={{ value: '3 new', isPositive: true }}
        />
        <KPICard 
          title="Pending Requests" 
          value={pendingRequests} 
          icon={ClipboardList}
          trend={{ value: '2 pending', isPositive: false }}
        />
        <KPICard 
          title="Approved Funds" 
          value={formatRupee(approvedFunds || 8500000)} 
          icon={DollarSign}
          trend={{ value: '100% on ledger', isPositive: true }}
        />
        <KPICard 
          title="Mission Completion" 
          value="92%" 
          icon={CheckSquare}
          trend={{ value: '+4%', isPositive: true }}
        />
      </div>

      {/* Assigned Incidents Feed Container */}
      <div 
        className="rounded-3xl overflow-hidden p-6 space-y-4"
        style={{
          backgroundColor: '#E4E9F2',
          boxShadow: '10px 10px 24px #b8c4d9, -10px -10px 24px #ffffff',
          border: '1.5px solid rgba(255, 255, 255, 0.8)',
        }}
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-300/60">
          <div>
            <h3 className="font-display font-black text-lg text-slate-900">Assigned Disaster Areas</h3>
            <p className="text-xs text-slate-500 font-mono">Real-time state and district missions under field execution</p>
          </div>
          <span 
            className="text-xs font-mono font-black text-emerald-800 px-3 py-1 rounded-full"
            style={{
              backgroundColor: '#E4E9F2',
              boxShadow: 'inset 2px 2px 4px #b8c4d9, inset -2px -2px 4px #ffffff',
            }}
          >
            {assignedIncidents} Live Crises
          </span>
        </div>

        <div className="grid gap-3.5">
          {disasters
            .filter((d) => d.status === 'published')
            .map((d) => (
              <motion.div 
                key={d.id} 
                whileHover={{ y: -3, scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => handleRowClick(d.id)}
                className="p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all cursor-pointer"
                style={{
                  backgroundColor: '#FFFFFF',
                  boxShadow: '4px 4px 10px #b8c4d9, -4px -4px 10px #ffffff',
                  border: '1px solid rgba(255, 255, 255, 0.7)',
                }}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-display font-black text-slate-900 text-base">{d.name}</span>
                    <StatusBadge type="severity" value={d.severity} />
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 font-medium">
                    <span className="flex items-center gap-1 font-mono">
                      <MapPin className="h-3.5 w-3.5 text-slate-400" /> {d.state}
                    </span>
                    <span>•</span>
                    <span className="font-mono">
                      Exposed Population: <strong className="text-slate-800">{d.population.toLocaleString('en-IN')}</strong>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end md:self-center shrink-0">
                  <StatusBadge type="report" value={d.status} />
                  <button 
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black text-white shadow-md transition-all"
                    style={{
                      background: 'linear-gradient(135deg, #065F46, #10B981)',
                    }}
                  >
                    <span>Coordinate Relief</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </motion.div>
            ))}
        </div>
      </div>

    </div>
  );
};

export default NGODashboard;
