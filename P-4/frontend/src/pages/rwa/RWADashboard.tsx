import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Users, CheckCircle, Package, ArrowRight, ShieldAlert, Phone } from 'lucide-react';
import { KPICard } from '../../components/KPICard';

// Mock Data
const MOCK_SOCIETIES = [
  { id: 'soc-1', name: 'Green Valley Apartments', risk: 'HIGH', pop: 1200, evac: 450, volunteers: 12 },
  { id: 'soc-2', name: 'Sunrise Enclave', risk: 'MEDIUM', pop: 800, evac: 0, volunteers: 8 },
  { id: 'soc-3', name: 'Lakeview Towers', risk: 'CRITICAL', pop: 2500, evac: 2100, volunteers: 45 },
];

export const RWADashboard: React.FC = () => {
  const { data: societies, isLoading } = useQuery({
    queryKey: ['rwa-societies'],
    queryFn: () => Promise.resolve(MOCK_SOCIETIES)
  });

  return (
    <div className="space-y-8 font-sans">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">RWA Command Center</h1>
          <p className="text-slate-500 text-sm font-medium mt-1">Community-led disaster response and evacuation coordination.</p>
        </div>
        <div className="flex gap-3">
          <button className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 px-4 py-2.5 text-sm font-bold text-white shadow-xs transition-all duration-150 hover:scale-[1.02] cursor-pointer">
            <ShieldAlert className="h-4.5 w-4.5" />
            Trigger Evacuation
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard 
          title="Total Registered Societies" 
          value={societies?.length || 0} 
          icon={Users}
          accentColor="text-blue-600 bg-blue-50 border-blue-100"
        />
        <KPICard 
          title="Total Population Covered" 
          value={4500} 
          icon={Users}
          accentColor="text-indigo-600 bg-indigo-50 border-indigo-100"
        />
        <KPICard 
          title="Active Volunteers" 
          value={65} 
          icon={CheckCircle}
          accentColor="text-emerald-600 bg-emerald-50 border-emerald-100"
        />
        <KPICard 
          title="Evacuated Safely" 
          value={2550} 
          icon={ArrowRight}
          accentColor="text-green-600 bg-green-50 border-green-100"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Evacuation Priority List */}
        <div className="bg-white border border-slate-200/80 rounded-xl shadow-xs overflow-hidden lg:col-span-2 flex flex-col">
          <div className="px-6 py-4 border-b border-slate-200/80 flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-600">Evacuation Priority Queue</h3>
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-xs font-bold uppercase tracking-wider text-slate-400">
                  <th className="px-6 py-4">Society Name</th>
                  <th className="px-6 py-4">Risk Level</th>
                  <th className="px-6 py-4">Evacuation Progress</th>
                  <th className="px-6 py-4">Volunteers</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                {societies?.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900">{s.name}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        s.risk === 'CRITICAL' ? 'bg-red-100 text-red-700' : 
                        s.risk === 'HIGH' ? 'bg-orange-100 text-orange-700' : 
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {s.risk}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${s.evac / s.pop > 0.8 ? 'bg-green-500' : 'bg-blue-500'}`} 
                            style={{ width: `${(s.evac / s.pop) * 100}%` }} 
                          />
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono">{Math.round((s.evac/s.pop)*100)}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono">{s.volunteers} active</td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-blue-600 hover:underline font-semibold text-xs">View Details</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Resource Inventory */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs flex flex-col space-y-4">
          <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">Resource Inventory</h3>
            <Package className="h-4 w-4 text-slate-400" />
          </div>
          
          <div className="flex-1 space-y-3">
             <div className="p-3 bg-green-50 rounded-lg border border-green-100 flex justify-between items-center">
               <div>
                 <p className="text-xs font-bold text-green-900">Food Packets</p>
                 <p className="text-[10px] text-green-700">Healthy supply</p>
               </div>
               <span className="font-mono font-bold text-green-700">4,500</span>
             </div>
             
             <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-100 flex justify-between items-center">
               <div>
                 <p className="text-xs font-bold text-yellow-900">Medical Kits</p>
                 <p className="text-[10px] text-yellow-700">Low running</p>
               </div>
               <span className="font-mono font-bold text-yellow-700">120</span>
             </div>
             
             <div className="p-3 bg-red-50 rounded-lg border border-red-100 flex justify-between items-center">
               <div>
                 <p className="text-xs font-bold text-red-900">Life Jackets</p>
                 <p className="text-[10px] text-red-700">CRITICAL SHORTAGE</p>
               </div>
               <span className="font-mono font-bold text-red-700">15</span>
             </div>
          </div>
          
          <button className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-2">
            <Phone className="h-4 w-4" /> Request Supplies
          </button>
        </div>

      </div>
    </div>
  );
};

export default RWADashboard;
