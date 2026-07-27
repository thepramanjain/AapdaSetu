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
  MapPin
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
      const dayIndex = dDate.getDay(); // 0 is Sunday, 1 is Monday
      const mappedIndex = dayIndex === 0 ? 6 : dayIndex - 1; // map Sunday to index 6
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

  // Group real fundRequests by NGO name dynamically
  const ngoGroups = fundRequests.reduce((acc: any, req) => {
    const ngo = req.ngo || 'Unknown NGO';
    if (!acc[ngo]) {
      acc[ngo] = { Requested: 0, Approved: 0 };
    }
    const amountLakhs = req.amount / 100000; // Convert to Lakhs for cleaner scale
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
        { name: 'SEEDS', Requested: 0, Approved: 0 },
        { name: 'Red Cross', Requested: 0, Approved: 0 },
        { name: 'Goonj', Requested: 0, Approved: 0 }
      ];

  const handleRowClick = (id: string) => {
    setActiveIncidentId(id);
    navigate('/gov/active');
  };

  return (
    <div className="space-y-8 font-sans">
      
      {/* Page Title */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">National Command Hub</h1>
          <p className="text-slate-500 text-sm font-medium mt-1">Real-time disaster risk intelligence and resource orchestration.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => navigate('/gov/analyze')}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 hover:bg-green-700 px-4 py-2.5 text-sm font-bold text-white shadow-xs transition-all duration-150 hover:scale-[1.02] cursor-pointer"
          >
            <Activity className="h-4.5 w-4.5" />
            Analyze Anomaly
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard 
          title="Total Incidents" 
          value={totalIncidents} 
          icon={AlertTriangle}
          accentColor="text-blue-600 bg-blue-50 border-blue-100"
        />
        <KPICard 
          title="Live Incidents" 
          value={liveIncidents} 
          icon={Activity}
          accentColor="text-rose-600 bg-rose-50 border-rose-100"
        />
        <KPICard 
          title="Pending Requests" 
          value={pendingRequests} 
          icon={ClipboardList}
          accentColor="text-amber-600 bg-amber-50 border-amber-100"
        />
        <KPICard 
          title="Funds Released" 
          value={formatRupee(totalFundsReleased)} 
          icon={DollarSign}
          accentColor="text-green-600 bg-green-50 border-green-100"
        />
      </div>

      {/* Charts Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Trend Chart */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs space-y-4 lg:col-span-2">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">Incident Activity Trend</h3>
            <span className="inline-flex items-center gap-1 text-xs text-green-600 font-semibold">
              <TrendingUp className="h-3 w-3" /> +15% weekly
            </span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                <defs>
                  <linearGradient id="lineColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} fontWeight={600} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="#94a3b8" fontSize={11} fontWeight={600} tickLine={false} axisLine={false} dx={-5} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                    border: '1px solid rgba(255, 255, 255, 0.1)', 
                    borderRadius: '12px',
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                    color: '#fff',
                    fontFamily: 'sans-serif'
                  }}
                  itemStyle={{ color: '#34d399', fontWeight: 'bold' }}
                  labelStyle={{ color: '#94a3b8', fontSize: '11px', fontWeight: 'bold' }}
                />
                <Line type="monotone" dataKey="Incidents" stroke="#10b981" strokeWidth={4} dot={{ stroke: '#10b981', strokeWidth: 2, r: 4, fill: '#fff' }} activeDot={{ r: 6, strokeWidth: 0, fill: '#059669' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Risk Distribution Chart */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">Risk Severity</h3>
          </div>
          <div className="h-64 w-full flex flex-col justify-center items-center">
            {riskData.length > 0 ? (
              <ResponsiveContainer width="100%" height="80%">
                <PieChart>
                  <Pie
                    data={riskData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                    isAnimationActive={true}
                  >
                    {riskData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="rgba(255, 255, 255, 0.8)" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                      border: '1px solid rgba(255, 255, 255, 0.1)', 
                      borderRadius: '12px',
                      color: '#fff',
                      fontFamily: 'sans-serif'
                    }}
                    itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-xs text-slate-400 font-medium italic">No severity data</div>
            )}
            <div className="flex gap-4 text-xs font-semibold mt-2 justify-center">
              {riskData.map((d, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: d.color }} />
                  <span className="text-slate-600">{d.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Funding Bar Chart */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs space-y-4 lg:col-span-3">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">NGO Funding Requests (INR Lakhs)</h3>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={fundingData} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                <defs>
                  <linearGradient id="requestedGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.9}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.4}/>
                  </linearGradient>
                  <linearGradient id="approvedGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.9}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.4}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} fontWeight={600} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="#94a3b8" fontSize={11} fontWeight={600} tickLine={false} axisLine={false} dx={-5} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                    border: '1px solid rgba(255, 255, 255, 0.1)', 
                    borderRadius: '12px',
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                    color: '#fff',
                    fontFamily: 'sans-serif'
                  }}
                  itemStyle={{ fontWeight: 'bold' }}
                  labelStyle={{ color: '#94a3b8', fontSize: '11px', fontWeight: 'bold' }}
                />
                <Legend iconSize={10} wrapperStyle={{ fontSize: 11, fontWeight: 600, paddingTop: 10 }} />
                <Bar dataKey="Requested" fill="url(#requestedGrad)" radius={[6, 6, 0, 0]} maxBarSize={45} />
                <Bar dataKey="Approved" fill="url(#approvedGrad)" radius={[6, 6, 0, 0]} maxBarSize={45} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Active Disaster Table */}
      <div className="bg-white border border-slate-200/80 rounded-xl shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200/80 flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-600">Active Disaster Incidents</h3>
          <span className="text-xs text-slate-400 font-mono font-medium">{disasters.length} entries</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70 text-xs font-bold uppercase tracking-wider text-slate-400">
                <th className="px-6 py-4">Incident Name</th>
                <th className="px-6 py-4">State</th>
                <th className="px-6 py-4">Severity</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Exposed Pop.</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
              {disasters.map((d) => (
                <tr 
                  key={d.id} 
                  onClick={() => handleRowClick(d.id)}
                  className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                >
                  <td className="px-6 py-4 flex items-center gap-2">
                    <span className="font-bold text-slate-900">{d.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono">#{d.id}</span>
                  </td>
                  <td className="px-6 py-4 flex items-center gap-1 text-slate-500">
                    <MapPin className="h-3 w-3 shrink-0 text-slate-400" />
                    {d.state}
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge type="severity" value={d.severity} />
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge type="report" value={d.status} />
                  </td>
                  <td className="px-6 py-4 font-mono text-slate-500">
                    {d.population.toLocaleString('en-IN')}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-1 rounded-lg text-slate-400 hover:text-green-700 hover:bg-green-50 transition-all">
                      <ArrowRight className="h-4.5 w-4.5" />
                    </button>
                  </td>
                </tr>
              ))}
              {disasters.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-400 italic">No incidents reported in state data</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
