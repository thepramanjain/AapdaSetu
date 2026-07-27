import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useStore } from '../hooks/useStore';
import { StatusBadge } from '../components/StatusBadge';
import { MapWidget } from '../components/MapWidget';
import { 
  AlertTriangle, 
  MapPin, 
  ShieldCheck, 
  Activity, 
  Coins, 
  ArrowRight,
  ClipboardList
} from 'lucide-react';

export const NGOIncidents: React.FC = () => {
  const disasters = useStore((state) => state.disasters);
  const activeIncidentId = useStore((state) => state.activeIncidentId);
  const setActiveIncidentId = useStore((state) => state.setActiveIncidentId);
  const navigate = useNavigate();
  const location = useLocation();

  const isTasksRoute = location.pathname.endsWith('/tasks');

  const assignedDisasters = disasters.filter(d => d.status === 'published');
  const selectedIncident = disasters.find(d => d.id === activeIncidentId) || assignedDisasters[0] || disasters[0];

  const [activeTab, setActiveTab] = useState<'report' | 'mission' | 'resources' | 'map'>(() => {
    return isTasksRoute ? 'mission' : 'report';
  });

  // Sync tab selection on route change
  useEffect(() => {
    setActiveTab(isTasksRoute ? 'mission' : 'report');
  }, [isTasksRoute]);

  const handleRequestFunds = () => {
    if (selectedIncident) {
      navigate(`/ngo/requests?disasterId=${selectedIncident.id}`);
    }
  };

  return (
    <div className="space-y-8 font-sans">
      
      {/* Title */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {isTasksRoute ? 'Mission Tasks' : 'Assigned Incidents'}
          </h1>
          <p className="text-slate-500 text-sm font-medium mt-1">
            {isTasksRoute 
              ? 'Formulate tactical response checklists, check off rescue phases, and track SDRF deployment ETAs.'
              : 'Review active platforms, formulate relief plans, and request emergency funding allocations.'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Incidents List */}
        <div className="lg:col-span-4 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Assigned Incidents</h3>
          <div className="space-y-3">
            {assignedDisasters.map((d) => {
              const isSelected = selectedIncident?.id === d.id;
              return (
                <div
                  key={d.id}
                  onClick={() => {
                    setActiveIncidentId(d.id);
                    setActiveTab('report');
                  }}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-white border-green-600 shadow-md ring-2 ring-green-600/5'
                      : 'bg-white border-slate-200/80 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{d.name}</h4>
                      <p className="text-[10px] text-slate-400 font-medium font-mono uppercase mt-1">{d.state}</p>
                    </div>
                    <StatusBadge type="severity" value={d.severity} />
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 font-medium">Confidence: {d.confidence}%</span>
                    <StatusBadge type="report" value={d.status} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: details Panel */}
        <div className="lg:col-span-8">
          {selectedIncident ? (
            <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden p-6 space-y-6">
              
              {/* Header Info */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-5">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">{selectedIncident.name}</h2>
                  <p className="text-xs text-slate-500 font-medium mt-1">Disaster Type: <span className="capitalize">{selectedIncident.type}</span> | Exposed Pop: {selectedIncident.population.toLocaleString('en-IN')}</p>
                </div>
                
                <button
                  onClick={handleRequestFunds}
                  className="inline-flex items-center gap-2 rounded-xl bg-green-600 hover:bg-green-700 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition-all duration-150 hover:scale-[1.02] cursor-pointer"
                >
                  <Coins className="h-4 w-4" />
                  Request Relief Funds
                </button>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-slate-200 overflow-x-auto text-xs font-bold text-slate-500 select-none">
                <button
                  onClick={() => setActiveTab('report')}
                  className={`pb-3 px-4 border-b-2 transition-all cursor-pointer ${
                    activeTab === 'report' ? 'border-green-600 text-green-700 font-bold' : 'border-transparent hover:text-slate-800'
                  }`}
                >
                  GOVERNMENT AI REPORT
                </button>
                <button
                  onClick={() => setActiveTab('mission')}
                  className={`pb-3 px-4 border-b-2 transition-all cursor-pointer ${
                    activeTab === 'mission' ? 'border-green-600 text-green-700 font-bold' : 'border-transparent hover:text-slate-800'
                  }`}
                >
                  MISSION PLAN
                </button>
                <button
                  onClick={() => setActiveTab('resources')}
                  className={`pb-3 px-4 border-b-2 transition-all cursor-pointer ${
                    activeTab === 'resources' ? 'border-green-600 text-green-700 font-bold' : 'border-transparent hover:text-slate-800'
                  }`}
                >
                  HOSPITALS & SHELTERS
                </button>
                <button
                  onClick={() => setActiveTab('map')}
                  className={`pb-3 px-4 border-b-2 transition-all cursor-pointer ${
                    activeTab === 'map' ? 'border-green-600 text-green-700 font-bold' : 'border-transparent hover:text-slate-800'
                  }`}
                >
                  MAP VIEW
                </button>
              </div>

              {/* Tab Contents */}
              <div className="pt-2">
                
                {/* 1. Report Tab */}
                {activeTab === 'report' && (
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Official Platform Briefing</h4>
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-slate-300 font-mono text-xs leading-relaxed max-h-[300px] overflow-y-auto shadow-inner whitespace-pre-line">
                      {selectedIncident.reportMarkdown.government || 'No report generated.'}
                    </div>
                  </div>
                )}

                {/* 2. Mission Plan Tab */}
                {activeTab === 'mission' && (
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">AI Logistics Checklist</h4>
                    <div className="space-y-3">
                      {selectedIncident.missionPlan.map((mission) => (
                        <div key={mission.id} className="bg-slate-50 p-4 border border-slate-200/60 rounded-xl flex justify-between items-center text-xs">
                          <div>
                            <p className="font-bold text-slate-800">{mission.name}</p>
                            <p className="text-[10px] text-slate-400 mt-1">Priority: {mission.priority} | ETA: {mission.eta}</p>
                          </div>
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                            mission.status === 'Completed' ? 'bg-green-100 text-green-700 border border-green-200' :
                            mission.status === 'Deployed' ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                            'bg-slate-100 text-slate-500 border border-slate-200'
                          }`}>
                            {mission.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. Resources Tab */}
                {activeTab === 'resources' && (
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-4 space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 border-b pb-1.5">🏥 Hospitals</h4>
                      {selectedIncident.hospitals.map((h, i) => (
                        <div key={i} className="bg-white p-2.5 rounded-lg border border-slate-200/40 flex justify-between text-xs font-semibold">
                          <span className="text-slate-800">{h.name}</span>
                          <span className="text-slate-400 font-mono">{h.distance}</span>
                        </div>
                      ))}
                    </div>
                    <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-4 space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 border-b pb-1.5">🏠 Shelters</h4>
                      {selectedIncident.shelters.map((s, i) => (
                        <div key={i} className="bg-white p-2.5 rounded-lg border border-slate-200/40 flex justify-between text-xs font-semibold">
                          <span className="text-slate-800">{s.name}</span>
                          <span className="text-slate-400 font-mono">{s.distance}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4. Map Tab */}
                {activeTab === 'map' && (
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Threat Zone & Evacuation routing</h4>
                    <MapWidget 
                      center={[selectedIncident.lat, selectedIncident.lng]} 
                      hospitals={selectedIncident.hospitals}
                      shelters={selectedIncident.shelters}
                    />
                  </div>
                )}

              </div>

            </div>
          ) : (
            <div className="bg-white border border-slate-200/80 p-8 rounded-2xl text-center text-sm text-slate-400 italic">
              No assigned incidents to display.
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default NGOIncidents;
