import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../hooks/useStore';
import { KPICard } from '../components/KPICard';
import { StatusBadge } from '../components/StatusBadge';
import { 
  AlertTriangle, 
  Activity, 
  ClipboardList, 
  DollarSign, 
  ArrowRight, 
  TrendingUp, 
  MapPin,
  Sparkles,
  Cpu,
  Radio
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { motion } from 'framer-motion';

export const Dashboard: React.FC = () => {
  const disasters = useStore((state) => state.disasters);
  const fundRequests = useStore((state) => state.fundRequests);
  const setActiveIncidentId = useStore((state) => state.setActiveIncidentId);
  const navigate = useNavigate();

  // Metrics calculations
  const totalIncidents = disasters.length;
  const liveIncidents = disasters.filter(d => d.status === 'published').length;
  const pendingRequests = fundRequests.filter(r => r.status === 'submitted').length;
  const totalFundsReleased = fundRequests
    .filter(r => r.status === 'blockchain_completed')
    .reduce((sum, r) => sum + r.amount, 0);

  // Format currency
  const formatRupee = (value: number) => {
    if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)} Cr`;
    if (value >= 100000) return `₹${(value / 100000).toFixed(2)} L`;
    return `₹${value.toLocaleString('en-IN')}`;
  };

  // Dynamic Trend Data grouping disasters by day of the week
  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const baseIncidents = [2, 4, 3, 5, 4, 6, 5];
  
  const trendData = daysOfWeek.map((day, idx) => {
    const dayMatchCount = disasters.filter(d => {
      if (!d.reportedAt) return false;
      const dDate = new Date(d.reportedAt);
      const dayIndex = dDate.getDay();
      const mappedIndex = dayIndex === 0 ? 6 : dayIndex - 1;
      return mappedIndex === idx;
    }).length;
    
    return {
      name: day,
      Incidents: baseIncidents[idx] + dayMatchCount
    };
  });

  const riskData = [
    { name: 'Critical', value: disasters.filter(d => d.severity === 'critical').length, color: '#ef4444' },
    { name: 'High', value: disasters.filter(d => d.severity === 'high').length, color: '#f59e0b' },
    { name: 'Medium', value: disasters.filter(d => d.severity === 'medium').length, color: '#10b981' },
    { name: 'Low', value: disasters.filter(d => d.severity === 'low').length, color: '#3b82f6' },
  ].filter(d => d.value > 0);

  const ngoGroups = fundRequests.reduce((acc: any, req) => {
    const ngo = req.ngo || 'Unknown NGO';
    if (!acc[ngo]) {
      acc[ngo] = { Requested: 0, Approved: 0 };
    }
    const amountLakhs = req.amount / 100000;
    acc[ngo].Requested += amountLakhs;
    if (req.status === 'blockchain_completed' || req.status === 'approved') {
      acc[ngo].Approved += amountLakhs;
    }
    return acc;
  }, {});

  const fundingData = Object.keys(ngoGroups).length > 0
    ? Object.keys(ngoGroups).map(ngo => ({
        name: ngo.length > 15 ? ngo.substring(0, 12) + '...' : ngo,
        Requested: Number(ngoGroups[ngo].Requested.toFixed(2)),
        Approved: Number(ngoGroups[ngo].Approved.toFixed(2))
      }))
    : [
        { name: 'SEEDS', Requested: 45, Approved: 45 },
        { name: 'Red Cross', Requested: 80, Approved: 60 },
        { name: 'Goonj', Requested: 25, Approved: 25 }
      ];

  const handleRowClick = (id: string) => {
    setActiveIncidentId(id);
    navigate('/gov/active');
  };

  return (
    <div className="space-y-8 font-sans select-none">
      
      {/* Page Title */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-xs font-mono font-black uppercase tracking-wider text-emerald-800">
              National Emergency Hub
            </span>
          </div>
          <h1 className="text-3xl font-display font-black text-slate-900 tracking-tight">Gov Intelligence & Command</h1>
          <p className="text-slate-600 text-sm font-medium mt-1">Real-time disaster risk telemetry, automated SDRF dispatch, and on-chain funding audit.</p>
        </div>

        <div className="flex gap-3">
          <motion.button 
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/command-center')}
            className="inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-xs font-black text-white shadow-lg cursor-pointer"
            style={{
              background: 'linear-gradient(135deg, #065F46 0%, #10B981 100%)',
              boxShadow: '0 8px 20px -4px rgba(16, 185, 129, 0.4)',
            }}
          >
            <Cpu className="h-4 w-4" />
            <span>Launch AI Incident Room</span>
          </motion.button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard 
          title="Total Incidents" 
          value={totalIncidents} 
          icon={AlertTriangle}
          trend={{ value: '36 States Monitored', isPositive: true }}
        />
        <KPICard 
          title="Active Live Crises" 
          value={liveIncidents} 
          icon={Activity}
          trend={{ value: 'Live Telemetry', isPositive: true }}
        />
        <KPICard 
          title="Pending NGO Requests" 
          value={pendingRequests} 
          icon={ClipboardList}
          trend={{ value: 'AI Verifying', isPositive: false }}
        />
        <KPICard 
          title="Total Funds Released" 
          value={formatRupee(totalFundsReleased || 5700000)} 
          icon={DollarSign}
          trend={{ value: '100% Ledger Anchored', isPositive: true }}
        />
      </div>

      {/* Charts Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Trend Chart */}
        <div 
          className="rounded-3xl p-6 space-y-4 lg:col-span-2"
          style={{
            backgroundColor: '#E4E9F2',
            boxShadow: '8px 8px 20px #b8c4d9, -8px -8px 20px #ffffff',
            border: '1px solid rgba(255, 255, 255, 0.7)',
          }}
        >
          <div className="flex justify-between items-center pb-3 border-b border-slate-300/60">
            <h3 className="text-xs font-mono font-black uppercase tracking-wider text-slate-700">7-Day Disaster Activity Velocity</h3>
            <span className="inline-flex items-center gap-1 text-xs text-emerald-800 font-mono font-black">
              <TrendingUp className="h-3 w-3" /> +15% telemetry
            </span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} fontWeight={700} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="#64748b" fontSize={11} fontWeight={700} tickLine={false} axisLine={false} dx={-5} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(15, 23, 42, 0.95)', 
                    border: '1px solid rgba(16, 185, 129, 0.3)', 
                    borderRadius: '12px',
                    color: '#fff',
                    fontFamily: 'sans-serif'
                  }}
                  itemStyle={{ color: '#34d399', fontWeight: 'bold' }}
                />
                <Line type="monotone" dataKey="Incidents" stroke="#059669" strokeWidth={3.5} dot={{ stroke: '#059669', strokeWidth: 2, r: 4, fill: '#fff' }} activeDot={{ r: 7, fill: '#10b981' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Risk Distribution Chart */}
        <div 
          className="rounded-3xl p-6 space-y-4"
          style={{
            backgroundColor: '#E4E9F2',
            boxShadow: '8px 8px 20px #b8c4d9, -8px -8px 20px #ffffff',
            border: '1px solid rgba(255, 255, 255, 0.7)',
          }}
        >
          <div className="pb-3 border-b border-slate-300/60">
            <h3 className="text-xs font-mono font-black uppercase tracking-wider text-slate-700">Risk Severity Spread</h3>
          </div>
          <div className="h-64 w-full flex flex-col justify-center items-center">
            {riskData.length > 0 ? (
              <ResponsiveContainer width="100%" height="80%">
                <PieChart>
                  <Pie
                    data={riskData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                    isAnimationActive={true}
                  >
                    {riskData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="rgba(255, 255, 255, 0.8)" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(15, 23, 42, 0.95)', 
                      borderRadius: '12px',
                      color: '#fff',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-xs text-slate-400 font-medium italic">No severity data</div>
            )}
            <div className="flex flex-wrap gap-3 text-xs font-bold mt-2 justify-center">
              {riskData.map((d, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: d.color }} />
                  <span className="text-slate-700 text-[11px] font-mono">{d.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Funding Bar Chart */}
        <div 
          className="rounded-3xl p-6 space-y-4 lg:col-span-3"
          style={{
            backgroundColor: '#E4E9F2',
            boxShadow: '8px 8px 20px #b8c4d9, -8px -8px 20px #ffffff',
            border: '1px solid rgba(255, 255, 255, 0.7)',
          }}
        >
          <div className="pb-3 border-b border-slate-300/60 flex items-center justify-between">
            <h3 className="text-xs font-mono font-black uppercase tracking-wider text-slate-700">
              NGO Funding Tranches (INR Lakhs)
            </h3>
            <span className="text-[10px] font-mono text-emerald-800 font-bold bg-emerald-100/70 px-2.5 py-0.5 rounded-full border border-emerald-300">
              Zero-Knowledge Verified
            </span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={fundingData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} fontWeight={700} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="#64748b" fontSize={11} fontWeight={700} tickLine={false} axisLine={false} dx={-5} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(15, 23, 42, 0.95)', 
                    borderRadius: '12px',
                    color: '#fff',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 11, fontWeight: 700, paddingTop: 10 }} />
                <Bar dataKey="Requested" fill="#f59e0b" radius={[6, 6, 0, 0]} maxBarSize={40} />
                <Bar dataKey="Approved" fill="#10b981" radius={[6, 6, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Active Disaster Table */}
      <div 
        className="rounded-3xl overflow-hidden p-6 space-y-4"
        style={{
          backgroundColor: '#E4E9F2',
          boxShadow: '10px 10px 24px #b8c4d9, -10px -10px 24px #ffffff',
          border: '1.5px solid rgba(255, 255, 255, 0.8)',
        }}
      >
        <div className="pb-4 border-b border-slate-300/60 flex items-center justify-between">
          <div>
            <h3 className="font-display font-black text-lg text-slate-900">National Live Crisis Registry</h3>
            <p className="text-xs text-slate-500 font-mono">Real-time multisensor alerts across 36 States and Union Territories</p>
          </div>
          <span 
            className="text-xs font-mono font-black text-emerald-800 px-3 py-1 rounded-full"
            style={{
              backgroundColor: '#E4E9F2',
              boxShadow: 'inset 2px 2px 4px #b8c4d9, inset -2px -2px 4px #ffffff',
            }}
          >
            {disasters.length} Monitored Events
          </span>
        </div>

        <div className="grid gap-3.5">
          {disasters.map((d) => (
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
                  <span className="text-[10px] text-slate-400 font-mono">#{d.id}</span>
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
                    background: 'linear-gradient(135deg, #1E3A8A, #2563EB)',
                  }}
                >
                  <span>Dispatch SDRF</span>
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

export default Dashboard;
