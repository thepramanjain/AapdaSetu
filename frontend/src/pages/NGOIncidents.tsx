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
  Sparkles,
  Radio,
  Clock
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
    <div className="space-y-6 sm:space-y-8 font-sans select-none">
      
      {/* ─── BENTO HEADER STATS ROW ─── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/80 backdrop-blur-md p-6 rounded-3xl border border-slate-200/90 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-500" />
        
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600" />
            </span>
            <span className="text-xs font-mono font-black uppercase tracking-wider text-emerald-800">
              Live Field Command Node
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-black text-slate-900 tracking-tight">
            {isTasksRoute ? 'Mission Tasks & Logistics Matrix' : 'Assigned Disaster Incidents'}
          </h1>
          <p className="text-slate-600 text-xs sm:text-sm font-medium mt-1">
            {isTasksRoute 
              ? 'Tactical ground response checklists, resource staging phases, and SDRF field dispatch telemetry.'
              : 'Official government briefings, tactical resource deployments, and multi-signature tranche releases.'}
          </p>
        </div>

        {/* Quick telemetry badge */}
        <div className="flex items-center gap-3">
          <div className="px-3.5 py-2 rounded-2xl bg-emerald-50 border border-emerald-200/80 text-emerald-900 flex items-center gap-2 shadow-xs">
            <Activity className="h-4 w-4 text-emerald-600 animate-pulse" />
            <div className="text-left">
              <span className="text-[9px] font-mono uppercase text-emerald-700 block font-bold">TELEMETRY SYNC</span>
              <span className="text-xs font-black font-mono">100% On-Chain</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── BENTO GRID LAYOUT ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        
        {/* Left Column: Incidents List (Bento Box - 4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-mono font-black uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
              <Radio className="h-3.5 w-3.5 text-emerald-600" />
              Assigned Active Crises
            </h3>
            <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full text-emerald-800 bg-emerald-50 border border-emerald-200">
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
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setActiveIncidentId(d.id);
                    setActiveTab('report');
                  }}
                  className={`p-5 rounded-2xl transition-all duration-300 cursor-pointer relative overflow-hidden bg-white border ${
                    isSelected 
                      ? 'border-emerald-500 shadow-lg shadow-emerald-500/10 bg-gradient-to-br from-emerald-50/40 via-white to-white ring-2 ring-emerald-500/20'
                      : 'border-slate-200/90 shadow-xs hover:border-slate-300 hover:shadow-md'
                  }`}
                >
                  {/* Top Glowing Accent on Selection */}
                  {isSelected && (
                    <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-400" />
                  )}

                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <h4 className="font-display font-black text-slate-900 text-sm leading-snug">{d.name}</h4>
                      <p className="text-[11px] text-slate-500 font-bold mt-1 flex items-center gap-1 font-mono">
                        <MapPin className="h-3.5 w-3.5 text-slate-400" />
                        {d.state}
                      </p>
                    </div>
                    <StatusBadge type="severity" value={d.severity} />
                  </div>

                  {/* Confidence Meter Bar */}
                  <div className="mt-3.5 pt-3 border-t border-slate-100 flex flex-col gap-1.5">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-[11px] text-slate-500 font-semibold">AI Confidence:</span>
                      <span className="text-emerald-700 font-black">{d.confidence}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500"
                        style={{ width: `${d.confidence}%` }}
                      />
                    </div>
                  </div>

                  <div className="mt-2.5 flex items-center justify-between text-xs font-mono">
                    <span className="text-[10px] text-slate-400 font-medium">Auto-Triage verified</span>
                    <StatusBadge type="report" value={d.status} />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Main Bento Workspace (8 cols) */}
        <div className="lg:col-span-8">
          {selectedIncident ? (
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 sm:p-8 rounded-3xl space-y-6 relative overflow-hidden bg-white border border-slate-200/90 shadow-sm"
            >
              {/* Top Accent Gradient Bar */}
              <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-emerald-600 via-teal-500 to-blue-600" />
              
              {/* Header Info */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-5">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-mono font-black uppercase text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      ID: {selectedIncident.id}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 font-bold flex items-center gap-1">
                      <Clock className="h-3 w-3" /> Updated Live
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-display font-black text-slate-900">{selectedIncident.name}</h2>
                  <p className="text-xs text-slate-600 font-medium mt-1">
                    Disaster Type: <span className="capitalize font-bold text-slate-800">{selectedIncident.type}</span> | Exposed Population: <span className="font-bold text-slate-800">{selectedIncident.population.toLocaleString('en-IN')} Citizens</span>
                  </p>
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.04, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleRequestFunds}
                  className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-black text-white shadow-md shadow-emerald-600/25 transition-all cursor-pointer bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-800 hover:from-emerald-700 hover:to-teal-900 shrink-0"
                >
                  <Coins className="h-4 w-4" />
                  <span>Request Relief Funds</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </motion.button>
              </div>

              {/* Middle Modern Segmented Tabs Bar */}
              <div className="inline-flex p-1.5 rounded-2xl gap-1.5 overflow-x-auto w-full bg-slate-100/90 border border-slate-200/80 shadow-inner">
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
                      className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                        isActive
                          ? 'text-slate-900 bg-white shadow-xs font-black border border-slate-200/80 scale-[1.02]'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                      }`}
                    >
                      <Icon className={`h-4 w-4 ${isActive ? 'text-emerald-600' : 'text-slate-500'}`} />
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
                        <span className="text-[10px] font-mono text-emerald-700 font-black bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                          Verified Autonomous Telemetry
                        </span>
                      </div>

                      <div 
                        className="rounded-2xl p-6 text-emerald-400 font-mono text-xs leading-relaxed max-h-[340px] overflow-y-auto whitespace-pre-line border border-slate-800 bg-slate-950 shadow-inner"
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
                          <motion.div 
                            key={mission.id} 
                            whileHover={{ x: 4 }}
                            className="p-4 rounded-2xl flex justify-between items-center text-xs transition-all bg-gradient-to-r from-slate-50 to-white border border-slate-200/80 hover:border-emerald-300 hover:shadow-sm"
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
                              mission.status === 'Completed' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
                              mission.status === 'Deployed' ? 'bg-blue-50 text-blue-800 border border-blue-200 animate-pulse' :
                              'bg-slate-100 text-slate-700 border border-slate-200'
                            }`}>
                              {mission.status}
                            </span>
                          </motion.div>
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
                      className="grid md:grid-cols-2 gap-5"
                    >
                      {/* Hospitals Container */}
                      <div className="p-5 rounded-2xl space-y-3 bg-slate-50/80 border border-slate-200/80">
                        <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
                          <h4 className="text-xs font-mono font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                            <Building className="h-4 w-4 text-rose-600" />
                            Emergency Hospitals
                          </h4>
                          <span className="text-[10px] font-mono font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                            {selectedIncident.hospitals.length} Units
                          </span>
                        </div>

                        <div className="space-y-2.5">
                          {selectedIncident.hospitals.map((h, i) => (
                            <motion.div 
                              key={i} 
                              whileHover={{ y: -1.5 }}
                              className="p-3.5 rounded-xl flex justify-between items-center text-xs font-medium bg-white border border-slate-200/70 shadow-xs hover:border-slate-300"
                            >
                              <span className="text-slate-900 font-bold">{h.name}</span>
                              <span className="text-slate-500 font-mono text-[11px]">{h.distance}</span>
                            </motion.div>
                          ))}
                        </div>
                      </div>

                      {/* Shelters Container */}
                      <div className="p-5 rounded-2xl space-y-3 bg-slate-50/80 border border-slate-200/80">
                        <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
                          <h4 className="text-xs font-mono font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                            <Home className="h-4 w-4 text-blue-600" />
                            Relief Camps & Shelters
                          </h4>
                          <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                            {selectedIncident.shelters.length} Hubs
                          </span>
                        </div>

                        <div className="space-y-2.5">
                          {selectedIncident.shelters.map((s, i) => (
                            <motion.div 
                              key={i} 
                              whileHover={{ y: -1.5 }}
                              className="p-3.5 rounded-xl flex justify-between items-center text-xs font-medium bg-white border border-slate-200/70 shadow-xs hover:border-slate-300"
                            >
                              <span className="text-slate-900 font-bold">{s.name}</span>
                              <span className="text-slate-500 font-mono text-[11px]">{s.distance}</span>
                            </motion.div>
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
                      <div className="rounded-2xl overflow-hidden shadow-md border border-slate-200">
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
            <div className="p-12 rounded-3xl text-center text-sm font-mono text-slate-400 bg-white border border-slate-200">
              No assigned incidents to display.
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default NGOIncidents;
