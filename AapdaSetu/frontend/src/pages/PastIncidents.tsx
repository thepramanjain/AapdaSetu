import React from 'react';
import { useStore } from '../hooks/useStore';
import { StatusBadge } from '../components/StatusBadge';
import { Archive, MapPin, Calendar, Users } from 'lucide-react';

const mockPastDisasters = [
  {
    id: 'd-99',
    name: 'Sikkim Inundation Preparedness Run',
    type: 'flood',
    state: 'Sikkim',
    severity: 'low',
    population: 45000,
    resolvedAt: '2026-06-12',
    status: 'completed'
  },
  {
    id: 'd-98',
    name: 'Gujarat Bhuj Tremor Simulation',
    type: 'earthquake',
    state: 'Gujarat',
    severity: 'medium',
    population: 18000,
    resolvedAt: '2026-05-30',
    status: 'completed'
  }
];

export const PastIncidents: React.FC = () => {
  return (
    <div className="space-y-8 font-sans">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Past Incidents</h1>
        <p className="text-slate-500 text-sm font-medium mt-1">Access past resolutions, telemetry records, and archived coordination files.</p>
      </div>

      <div className="bg-white border border-slate-200/80 rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200/80 bg-slate-50/50 flex items-center gap-2">
          <Archive className="h-4.5 w-4.5 text-slate-400" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-600">Archived Records Ledger</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/30 text-xs font-bold uppercase tracking-wider text-slate-400">
                <th className="px-6 py-4">Incident Name</th>
                <th className="px-6 py-4">State</th>
                <th className="px-6 py-4">Severity</th>
                <th className="px-6 py-4">Exposed Pop.</th>
                <th className="px-6 py-4">Resolution Date</th>
                <th className="px-6 py-4">Ledger Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
              {mockPastDisasters.map((d) => (
                <tr key={d.id} className="hover:bg-slate-50/50 transition-colors">
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
                  <td className="px-6 py-4 text-slate-500 font-mono">
                    <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5 text-slate-400" /> {d.resolvedAt}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-[10px] font-bold uppercase">
                      ARCHIVED
                    </span>
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

export default PastIncidents;
