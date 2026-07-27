import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../hooks/useStore';
import { KPICard } from '../components/KPICard';
import { StatusBadge } from '../components/StatusBadge';
import { 
  AlertTriangle, 
  Activity, 
  Users, 
  ThermometerSun, 
  ArrowRight,
  TrendingUp,
  MapPin,
  Link2
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

export const HomeOverview: React.FC = () => {
  const disasters = useStore((state) => state.disasters);
  const setActiveIncidentId = useStore((state) => state.setActiveIncidentId);
  const navigate = useNavigate();

  // Metrics calculations
  const liveIncidents = disasters.filter(d => d.status === 'published').length;
  
  // Mock Data for RWA and Heatwave summaries
  const totalRWASocieties = 24;
  const highRiskDistricts = 3;

  // Trend Data for overall system activity
  const trendData = [
    { name: 'Mon', Activity: 12 },
    { name: 'Tue', Activity: 19 },
    { name: 'Wed', Activity: 15 },
    { name: 'Thu', Activity: 25 },
    { name: 'Fri', Activity: 22 },
    { name: 'Sat', Activity: 30 },
    { name: 'Sun', Activity: 28 },
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
          <p className="text-slate-500 text-sm font-medium mt-1">Unified view: AI Agents, Blockchain, and IoT integrations.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => alert("Simulation Triggered: Data flowing through RWA, Heatwave, and Blockchain modules.")}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-800 hover:bg-slate-900 px-4 py-2.5 text-sm font-bold text-white shadow-xs transition-all duration-150 hover:scale-[1.02] cursor-pointer"
          >
            <AlertTriangle className="h-4.5 w-4.5 text-amber-500" />
            Simulate Disaster
          </button>
          <button 
            onClick={() => navigate('/gov/analyze')}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-4 py-2.5 text-sm font-bold text-white shadow-xs transition-all duration-150 hover:scale-[1.02] cursor-pointer"
          >
            <Activity className="h-4.5 w-4.5" />
            Analyze Anomaly
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div onClick={() => navigate('/gov/active')} className="cursor-pointer transition-transform hover:scale-105">
          <KPICard 
            title="Live Incidents" 
            value={liveIncidents} 
            icon={Activity}
            accentColor="text-rose-600 bg-rose-50 border-rose-100"
          />
        </div>
        <div onClick={() => navigate('/gov/heatwave')} className="cursor-pointer transition-transform hover:scale-105">
          <KPICard 
            title="High Risk Districts (Heat)" 
            value={highRiskDistricts} 
            icon={ThermometerSun}
            accentColor="text-orange-600 bg-orange-50 border-orange-100"
          />
        </div>
        <div onClick={() => navigate('/gov/rwa')} className="cursor-pointer transition-transform hover:scale-105">
          <KPICard 
            title="RWA Societies Connected" 
            value={totalRWASocieties} 
            icon={Users}
            accentColor="text-blue-600 bg-blue-50 border-blue-100"
          />
        </div>
        <div onClick={() => navigate('/gov/blockchain')} className="cursor-pointer transition-transform hover:scale-105">
          <KPICard 
            title="Verified Records" 
            value={disasters.length * 2 + 5} 
            icon={Link2}
            accentColor="text-emerald-600 bg-emerald-50 border-emerald-100"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Chart */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs space-y-4 lg:col-span-2">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">System Activity Trend</h3>
            <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-semibold">
              <TrendingUp className="h-3 w-3" /> +15% weekly
            </span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                <defs>
                  <linearGradient id="lineColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#059669" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#059669" stopOpacity={0}/>
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
                <Line type="monotone" dataKey="Activity" stroke="#059669" strokeWidth={4} dot={{ stroke: '#059669', strokeWidth: 2, r: 4, fill: '#fff' }} activeDot={{ r: 6, strokeWidth: 0, fill: '#047857' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Blockchain Ticker Placeholder */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs space-y-4 flex flex-col">
          <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">Live Ledger Feed</h3>
            <Link2 className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="flex-1 overflow-y-auto space-y-3">
             <div className="p-3 bg-emerald-50/50 rounded-lg border border-emerald-100/50">
               <div className="flex justify-between items-center">
                 <span className="text-xs font-bold text-slate-800">Tx: 0x8f...4c2</span>
                 <span className="text-[10px] text-slate-400">2 min ago</span>
               </div>
               <p className="text-xs text-slate-600 mt-1">Disaster Event Published</p>
             </div>
             <div className="p-3 bg-emerald-50/50 rounded-lg border border-emerald-100/50">
               <div className="flex justify-between items-center">
                 <span className="text-xs font-bold text-slate-800">Tx: 0x3a...9b1</span>
                 <span className="text-[10px] text-slate-400">15 min ago</span>
               </div>
               <p className="text-xs text-slate-600 mt-1">Funds Released (₹10L)</p>
             </div>
             <div className="p-3 bg-emerald-50/50 rounded-lg border border-emerald-100/50">
               <div className="flex justify-between items-center">
                 <span className="text-xs font-bold text-slate-800">Tx: 0xc2...1f8</span>
                 <span className="text-[10px] text-slate-400">1 hr ago</span>
               </div>
               <p className="text-xs text-slate-600 mt-1">Shipment Status: IN_TRANSIT</p>
             </div>
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
                    <button className="p-1 rounded-lg text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 transition-all">
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

export default HomeOverview;
