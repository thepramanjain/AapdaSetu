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
  ClipboardList,
  CheckCircle2,
  Building,
  Home,
  FileText,
  Map as MapIcon,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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

  useEffect(() => {
    setActiveTab(isTasksRoute ? 'mission' : 'report');
  }, [isTasksRoute]);

  const handleRequestFunds = () => {
    if (selectedIncident) {
      navigate(`/ngo/requests?disasterId=${selectedIncident.id}`);
    }
  };

  return (
    <div className="space-y-8 font-sans select-none">
      
      {/* Title Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-xs font-mono font-black uppercase tracking-wider text-emerald-800">
              Live Field Command
            </span>
          </div>
          <h1 className="text-3xl font-display font-black text-slate-900 tracking-tight">
            {isTasksRoute ? 'Mission Tasks & Logistics' : 'Assigned Disaster Incidents'}
          </h1>
          <p className="text-slate-600 text-sm font-medium mt-1">
            {isTasksRoute 
              ? 'Tactical response checklists, ground mission phases, and SDRF deployment coordination.'
              : 'Review active government incident briefings, formulate relief plans, and sanction on-chain tranches.'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Incidents List */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-mono font-black uppercase tracking-wider text-slate-500">
              Assigned Active Crises
            </h3>
            <span 
              className="text-[10px] font-mono font-black px-2 py-0.5 rounded-full text-emerald-800"
              style={{
                backgroundColor: '#E4E9F2',
                boxShadow: 'inset 2px 2px 4px #b8c4d9, inset -2px -2px 4px #ffffff',
              }}
            >
              {assignedDisasters.length} Live
            </span>
          </div>

          <div className="space-y-3.5">
            {assignedDisasters.map((d) => {
              const isSelected = selectedIncident?.id === d.id;
              return (
                <motion.div
                  key={d.id}
                  whileHover={{ y: -3, scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => {
                    setActiveIncidentId(d.id);
                    setActiveTab('report');
                  }}
                  className="p-5 rounded-2xl transition-all cursor-pointer relative overflow-hidden"
                  style={{
                    backgroundColor: '#E4E9F2',
                    boxShadow: isSelected 
                      ? 'inset 3px 3px 7px #b8c4d9, inset -3px -3px 7px #ffffff'
                      : '6px 6px 14px #b8c4d9, -6px -6px 14px #ffffff',
                    border: isSelected ? '1.5px solid #059669' : '1px solid rgba(255, 255, 255, 0.7)',
                  }}
                >
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <h4 className="font-display font-black text-slate-900 text-sm leading-snug">{d.name}</h4>
                      <p className="text-[10px] text-slate-500 font-bold font-mono uppercase mt-1 flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-slate-400" />
                        {d.state}
                      </p>
                    </div>
                    <StatusBadge type="severity" value={d.severity} />
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-300/50 flex items-center justify-between text-xs font-mono">
                    <span className="text-[10px] text-slate-500 font-bold">
                      Confidence: <span className="text-emerald-700 font-black">{d.confidence}%</span>
                    </span>
                    <StatusBadge type="report" value={d.status} />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Details Panel */}
        <div className="lg:col-span-8">
          {selectedIncident ? (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 sm:p-8 rounded-3xl space-y-6 relative overflow-hidden"
              style={{
                backgroundColor: '#E4E9F2',
                boxShadow: '10px 10px 24px #b8c4d9, -10px -10px 24px #ffffff',
                border: '1.5px solid rgba(255, 255, 255, 0.8)',
              }}
            >
              
              {/* Header Info */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-300/60 pb-5">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-mono font-black uppercase text-emerald-800 bg-emerald-100/60 px-2 py-0.5 rounded-full border border-emerald-300">
                      ID: {selectedIncident.id}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500 font-bold">
                      • Updated Live
                    </span>
                  </div>
                  <h2 className="text-2xl font-display font-black text-slate-900">{selectedIncident.name}</h2>
                  <p className="text-xs text-slate-600 font-medium mt-1">
                    Disaster Type: <span className="capitalize font-bold text-slate-800">{selectedIncident.type}</span> | Exposed Population: <span className="font-bold text-slate-800">{selectedIncident.population.toLocaleString('en-IN')} Citizens</span>
                  </p>
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleRequestFunds}
                  className="inline-flex items-center gap-2 rounded-xl px-5 py-3 text-xs font-black text-white shadow-lg transition-all cursor-pointer"
                  style={{
                    background: 'linear-gradient(135deg, #065F46 0%, #047857 50%, #10B981 100%)',
                    boxShadow: '0 8px 20px -4px rgba(16, 185, 129, 0.4)',
                  }}
                >
                  <Coins className="h-4 w-4" />
                  <span>Request Relief Funds</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </motion.button>
              </div>

              {/* Middle Neumorphic Tabs Bar */}
              <div 
                className="inline-flex p-1.5 rounded-2xl gap-1.5 overflow-x-auto w-full"
                style={{
                  backgroundColor: '#E4E9F2',
                  boxShadow: 'inset 3px 3px 6px #b8c4d9, inset -3px -3px 6px #ffffff',
                }}
              >
                {[
                  { id: 'report', label: 'Government AI Report', icon: FileText },
                  { id: 'mission', label: 'Tactical Mission Plan', icon: ClipboardList },
                  { id: 'resources', label: 'Hospitals & Shelters', icon: Building },
                  { id: 'map', label: 'Live GIS Threat Map', icon: MapIcon },
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                        isActive
                          ? 'text-emerald-950 bg-white shadow-md font-extrabold'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
                      }`}
                      style={
                        isActive
                          ? {
                              boxShadow: '3px 3px 8px #b8c4d9, -3px -3px 8px #ffffff',
                            }
                          : {}
                      }
                    >
                      <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-emerald-600' : 'text-slate-500'}`} />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Tab Contents */}
              <div className="pt-2">
                <AnimatePresence mode="wait">
                  
                  {/* 1. Report Tab */}
                  {activeTab === 'report' && (
                    <motion.div 
                      key="tab-report"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-4"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-mono font-black uppercase tracking-wider text-slate-500">
                          Official Platform AI Incident Dossier
                        </h4>
                        <span className="text-[10px] font-mono text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          Verified Autonomous Telemetry
                        </span>
                      </div>

                      <div 
                        className="rounded-2xl p-5 text-emerald-300 font-mono text-xs leading-relaxed max-h-[340px] overflow-y-auto whitespace-pre-line shadow-2xl border border-slate-800"
                        style={{
                          background: 'linear-gradient(145deg, #09131C 0%, #0F172A 100%)',
                        }}
                      >
                        {selectedIncident.reportMarkdown.government || 'No report generated.'}
                      </div>
                    </motion.div>
                  )}

                  {/* 2. Mission Plan Tab */}
                  {activeTab === 'mission' && (
                    <motion.div 
                      key="tab-mission"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-4"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-xs font-mono font-black uppercase tracking-wider text-slate-500">
                          AI Logistics Response Phases
                        </h4>
                        <span className="text-[10px] font-mono text-slate-500 font-bold">
                          {selectedIncident.missionPlan.length} Deployment Nodes
                        </span>
                      </div>

                      <div className="space-y-3">
                        {selectedIncident.missionPlan.map((mission) => (
                          <div 
                            key={mission.id} 
                            className="p-4 rounded-2xl flex justify-between items-center text-xs transition-all"
                            style={{
                              backgroundColor: '#E4E9F2',
                              boxShadow: '4px 4px 10px #b8c4d9, -4px -4px 10px #ffffff',
                              border: '1px solid rgba(255, 255, 255, 0.7)',
                            }}
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                                <p className="font-display font-black text-slate-900 text-sm">{mission.name}</p>
                              </div>
                              <p className="text-[11px] text-slate-500 font-mono pl-6">
                                Priority: <span className="font-bold text-slate-700">{mission.priority}</span> • Target ETA: <span className="font-bold text-slate-700">{mission.eta}</span>
                              </p>
                            </div>

                            <span className={`px-3 py-1 rounded-full text-[10px] font-mono font-black uppercase tracking-wider ${
                              mission.status === 'Completed' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                              mission.status === 'Deployed' ? 'bg-blue-100 text-blue-800 border border-blue-300 animate-pulse' :
                              'bg-slate-200 text-slate-700 border border-slate-300'
                            }`}>
                              {mission.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* 3. Resources Tab */}
                  {activeTab === 'resources' && (
                    <motion.div 
                      key="tab-resources"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="grid md:grid-cols-2 gap-6"
                    >
                      {/* Hospitals Container */}
                      <div 
                        className="p-5 rounded-2xl space-y-3"
                        style={{
                          backgroundColor: '#E4E9F2',
                          boxShadow: 'inset 3px 3px 6px #b8c4d9, inset -3px -3px 6px #ffffff',
                        }}
                      >
                        <div className="flex items-center justify-between pb-2 border-b border-slate-300/60">
                          <h4 className="text-xs font-mono font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                            <Building className="h-4 w-4 text-rose-600" />
                            Emergency Hospitals
                          </h4>
                          <span className="text-[10px] font-mono font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                            {selectedIncident.hospitals.length} Units
                          </span>
                        </div>

                        <div className="space-y-2">
                          {selectedIncident.hospitals.map((h, i) => (
                            <div 
                              key={i} 
                              className="p-3 rounded-xl flex justify-between items-center text-xs font-bold"
                              style={{
                                backgroundColor: '#FFFFFF',
                                boxShadow: '2px 2px 5px #b8c4d9, -2px -2px 5px #ffffff',
                              }}
                            >
                              <span className="text-slate-900">{h.name}</span>
                              <span className="text-slate-500 font-mono text-[11px]">{h.distance}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Shelters Container */}
                      <div 
                        className="p-5 rounded-2xl space-y-3"
                        style={{
                          backgroundColor: '#E4E9F2',
                          boxShadow: 'inset 3px 3px 6px #b8c4d9, inset -3px -3px 6px #ffffff',
                        }}
                      >
                        <div className="flex items-center justify-between pb-2 border-b border-slate-300/60">
                          <h4 className="text-xs font-mono font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                            <Home className="h-4 w-4 text-blue-600" />
                            Relief Camps & Shelters
                          </h4>
                          <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                            {selectedIncident.shelters.length} Hubs
                          </span>
                        </div>

                        <div className="space-y-2">
                          {selectedIncident.shelters.map((s, i) => (
                            <div 
                              key={i} 
                              className="p-3 rounded-xl flex justify-between items-center text-xs font-bold"
                              style={{
                                backgroundColor: '#FFFFFF',
                                boxShadow: '2px 2px 5px #b8c4d9, -2px -2px 5px #ffffff',
                              }}
                            >
                              <span className="text-slate-900">{s.name}</span>
                              <span className="text-slate-500 font-mono text-[11px]">{s.distance}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* 4. Map Tab */}
                  {activeTab === 'map' && (
                    <motion.div 
                      key="tab-map"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-4"
                    >
                      <h4 className="text-xs font-mono font-black uppercase tracking-wider text-slate-500">
                        Threat Zone & Evacuation Routing
                      </h4>
                      <div className="rounded-2xl overflow-hidden shadow-xl border border-slate-300">
                        <MapWidget 
                          center={[selectedIncident.lat, selectedIncident.lng]} 
                          hospitals={selectedIncident.hospitals}
                          shelters={selectedIncident.shelters}
                        />
                      </div>
                    </motion.div>
                  )}

                </AnimatePresence>
              </div>

            </motion.div>
          ) : (
            <div 
              className="p-12 rounded-3xl text-center text-sm font-mono text-slate-400"
              style={{
                backgroundColor: '#E4E9F2',
                boxShadow: 'inset 4px 4px 8px #b8c4d9, inset -4px -4px 8px #ffffff',
              }}
            >
              No assigned incidents to display.
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default NGOIncidents;
