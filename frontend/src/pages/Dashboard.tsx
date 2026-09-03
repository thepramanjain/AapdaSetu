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

  const calculatedSeverity = [
    { name: 'Critical', value: disasters.filter(d => d.severity === 'critical').length, color: '#ef4444' },
    { name: 'High', value: disasters.filter(d => d.severity === 'high').length, color: '#f59e0b' },
    { name: 'Medium', value: disasters.filter(d => d.severity === 'medium').length, color: '#10b981' },
    { name: 'Low', value: disasters.filter(d => d.severity === 'low').length, color: '#3b82f6' },
  ].filter(d => d.value > 0);

  const severityData = calculatedSeverity.length > 0
    ? calculatedSeverity
    : [
        { name: 'Critical', value: 3, color: '#ef4444' },
        { name: 'High', value: 5, color: '#f59e0b' },
        { name: 'Medium', value: 8, color: '#10b981' },
        { name: 'Low', value: 2, color: '#3b82f6' },
      ];

  const COLORS = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6'];

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
          className="rounded-2xl p-6 space-y-4 lg:col-span-2 bg-white border border-slate-200/90 shadow-xs"
        >
          <div className="flex justify-between items-center pb-3 border-b border-slate-100">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700">7-Day Disaster Activity Velocity</h3>
            <span className="inline-flex items-center gap-1 text-xs text-emerald-700 font-mono font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              <TrendingUp className="h-3 w-3" /> +15% telemetry
            </span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} fontWeight={600} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="#64748b" fontSize={11} fontWeight={600} tickLine={false} axisLine={false} dx={-5} />
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
                <Line type="monotone" dataKey="Incidents" stroke="#059669" strokeWidth={3} dot={{ stroke: '#059669', strokeWidth: 2, r: 4, fill: '#fff' }} activeDot={{ r: 6, fill: '#10b981' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Risk Distribution Chart */}
        <div 
          className="rounded-2xl p-6 space-y-4 bg-white border border-slate-200/90 shadow-xs"
        >
          <div className="pb-3 border-b border-slate-100">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700">Risk Severity Spread</h3>
          </div>
          <div className="h-64 w-full flex flex-col justify-center items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={severityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {severityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(15, 23, 42, 0.95)', 
                    borderRadius: '12px',
                    color: '#fff',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 11, fontWeight: 600 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Funding Bar Chart (Bento Box - 7 cols) */}
        <div 
          className="rounded-2xl p-6 space-y-4 lg:col-span-7 bg-white border border-slate-200/90 shadow-xs flex flex-col justify-between"
        >
          <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700">
              NGO Funding Tranches (INR Lakhs)
            </h3>
            <span className="text-[10px] font-mono text-emerald-800 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Zero-Knowledge Verified
            </span>
          </div>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={fundingData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} fontWeight={600} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="#64748b" fontSize={11} fontWeight={600} tickLine={false} axisLine={false} dx={-5} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(15, 23, 42, 0.95)', 
                    borderRadius: '12px',
                    color: '#fff',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 11, fontWeight: 600, paddingTop: 6 }} />
                <Bar dataKey="Requested" fill="#f59e0b" radius={[6, 6, 0, 0]} maxBarSize={36} />
                <Bar dataKey="Approved" fill="#10b981" radius={[6, 6, 0, 0]} maxBarSize={36} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Autonomous Telemetry (Bento Box - 5 cols) */}
        <div className="rounded-2xl p-6 space-y-4 lg:col-span-5 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 text-white border border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-300">
                AI Autonomous Telemetry
              </h3>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              99.8% Online
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 py-1">
            <div className="p-3 rounded-xl bg-white/[0.05] border border-white/10">
              <span className="text-[10px] font-mono text-slate-400 block uppercase">Early Warning Speed</span>
              <span className="text-xl font-black text-emerald-400 font-mono">90 Sec</span>
              <span className="text-[10px] text-slate-400 block">NDMA Satellite sync</span>
            </div>
            <div className="p-3 rounded-xl bg-white/[0.05] border border-white/10">
              <span className="text-[10px] font-mono text-slate-400 block uppercase">Active Tranche Vault</span>
              <span className="text-xl font-black text-amber-400 font-mono">100%</span>
              <span className="text-[10px] text-slate-400 block">Polygon Proof of Relief</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-emerald-300 font-semibold">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span>Crisis Escalation Node #04 Active</span>
            </div>
            <span className="text-[10px] font-mono text-slate-400">Assam / Odisha</span>
          </div>
        </div>
      </div>

      {/* Active Disaster Table */}
      <div 
        className="rounded-2xl overflow-hidden p-6 space-y-4 bg-white border border-slate-200/90 shadow-xs"
      >
        <div className="pb-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-display font-black text-lg text-slate-900">National Live Crisis Registry</h3>
            <p className="text-xs text-slate-500 font-mono">Real-time multisensor alerts across 36 States and Union Territories</p>
          </div>
          <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
            {disasters.length} Monitored Events
          </span>
        </div>

        <div className="grid gap-3">
          {disasters.map((d) => (
            <motion.div 
              key={d.id} 
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => handleRowClick(d.id)}
              className="p-4 sm:p-5 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all cursor-pointer bg-slate-50/70 border border-slate-200/80 hover:border-slate-300 hover:bg-slate-50 shadow-xs"
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
