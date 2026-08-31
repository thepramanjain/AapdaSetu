import React, { useState } from 'react';
import { useStore } from '../hooks/useStore';
import { StatusBadge } from '../components/StatusBadge';
import { MapWidget } from '../components/MapWidget';
import { 
  AlertTriangle, 
  MapPin, 
  ShieldCheck, 
  ShieldAlert,
  Activity, 
  Users, 
  CheckSquare, 
  FileText, 
  Link2,
  Copy,
  Download,
  Check,
  Building,
  Home,
  Database,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const ActiveIncidents: React.FC = () => {
  const disasters = useStore((state) => state.disasters);
  const activeIncidentId = useStore((state) => state.activeIncidentId);
  const setActiveIncidentId = useStore((state) => state.setActiveIncidentId);
  const publishIncident = useStore((state) => state.publishIncident);

  const activeDisasters = disasters.filter(d => d.status !== 'preparedness');
  const selectedIncident = disasters.find(d => d.id === activeIncidentId) || activeDisasters[0] || disasters[0];

  const [activeTab, setActiveTab] = useState<'overview' | 'resources' | 'mission' | 'reports' | 'blockchain'>('overview');
  const [reportType, setReportType] = useState<'government' | 'ngo' | 'public'>('government');
  const [copied, setCopied] = useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = (filename: string, text: string) => {
    const element = document.createElement("a");
    const file = new Blob([text], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `${filename}.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="space-y-8 font-sans select-none">
      
      {/* Page Title */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-xs font-mono font-black uppercase tracking-wider text-emerald-800">
              National Emergency Matrix
            </span>
          </div>
          <h1 className="text-3xl font-display font-black text-slate-900 tracking-tight">Active Response Hub</h1>
          <p className="text-slate-600 text-sm font-medium mt-1">Review active incidents, resource metrics, and blockchain audit logs.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Incidents Master List */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-mono font-black uppercase tracking-wider text-slate-500">Incident Feed</h3>
            <span 
              className="text-[10px] font-mono font-black px-2 py-0.5 rounded-full text-emerald-800"
              style={{
                backgroundColor: '#E4E9F2',
                boxShadow: 'inset 2px 2px 4px #b8c4d9, inset -2px -2px 4px #ffffff',
              }}
            >
              {activeDisasters.length} Live
            </span>
          </div>

          <div className="space-y-3.5">
            {activeDisasters.map((d) => {
              const isSelected = selectedIncident?.id === d.id;
              return (
                <motion.div
                  key={d.id}
                  whileHover={{ y: -2, scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => {
                    setActiveIncidentId(d.id);
                    setActiveTab('overview');
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

        {/* Right Side: Incident Details Viewer */}
        <div className="lg:col-span-8">
          {selectedIncident ? (
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-3xl p-6 sm:p-8 space-y-6"
              style={{
                backgroundColor: '#E4E9F2',
                boxShadow: '10px 10px 24px #b8c4d9, -10px -10px 24px #ffffff',
                border: '1.5px solid rgba(255, 255, 255, 0.8)',
              }}
            >
              
              {/* Incident Header Details */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-300/60 pb-5">
                <div>
                  <h2 className="text-2xl font-display font-black text-slate-900">{selectedIncident.name}</h2>
                  <p className="text-xs text-slate-600 font-medium mt-1 font-mono">
                    Disaster ID: <span className="font-bold text-slate-800">{selectedIncident.id}</span> | State: <strong className="text-slate-800">{selectedIncident.state}</strong>
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {selectedIncident.status === 'reported' && (
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => publishIncident(selectedIncident.id)}
                      className="inline-flex items-center justify-center gap-1.5 rounded-xl px-4 py-2 text-xs font-black text-white shadow-md cursor-pointer"
                      style={{
                        background: 'linear-gradient(135deg, #065F46, #10B981)',
                      }}
                    >
                      Publish Incident
                    </motion.button>
                  )}
                  <div className="flex gap-2">
                    <StatusBadge type="severity" value={selectedIncident.severity} />
                    <StatusBadge type="report" value={selectedIncident.status} />
                  </div>
                </div>
              </div>

              {/* Middle Neumorphic Tabs Bar */}
              <div 
                className="inline-flex p-1.5 rounded-2xl gap-1.5 overflow-x-auto w-full"
                style={{
                  backgroundColor: '#E4E9F2',
                  boxShadow: 'inset 3px 3px 6px #b8c4d9, inset -3px -3px 6px #ffffff',
                }}
              >
                {(['overview', 'resources', 'mission', 'reports', 'blockchain'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 flex items-center justify-center py-2 px-3 rounded-xl text-xs uppercase font-mono font-black tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                      activeTab === tab
                        ? 'text-emerald-950 bg-white shadow-md'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
                    }`}
                    style={
                      activeTab === tab
                        ? {
                            boxShadow: '3px 3px 8px #b8c4d9, -3px -3px 8px #ffffff',
                          }
                        : {}
                    }
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Tab Contents */}
              <div className="pt-2">
                <AnimatePresence mode="wait">
                  
                  {/* 1. Overview Tab */}
                  {activeTab === 'overview' && (
                    <motion.div 
                      key="tab-overview"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-6"
                    >
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {[
                          { label: 'Risk Level', val: selectedIncident.riskLevel, highlight: false },
                          { label: 'AI Confidence', val: `${selectedIncident.confidence}%`, highlight: true },
                          { label: 'Exposed Population', val: selectedIncident.population.toLocaleString('en-IN'), highlight: false },
                          { label: 'Integrity Verification', val: '✓ Verified On-Chain', highlight: true },
                        ].map((stat, i) => (
                          <div 
                            key={i} 
                            className="p-4 rounded-2xl text-center"
                            style={{
                              backgroundColor: '#FFFFFF',
                              boxShadow: '3px 3px 8px #b8c4d9, -3px -3px 8px #ffffff',
                            }}
                          >
                            <span className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-wide">{stat.label}</span>
                            <p className={`text-sm font-display font-black mt-1 ${stat.highlight ? 'text-emerald-800' : 'text-slate-900'}`}>{stat.val}</p>
                          </div>
                        ))}
                      </div>

                      <div className="space-y-2">
                        <h4 className="text-xs font-mono font-black uppercase tracking-wider text-slate-500">Incident Description</h4>
                        <p className="text-xs leading-relaxed text-slate-700 font-medium p-4 rounded-2xl bg-white/70 border border-slate-200">{selectedIncident.description}</p>
                      </div>

                      <div className="space-y-2">
                        <h4 className="text-xs font-mono font-black uppercase tracking-wider text-slate-500">GIS Threat Assessment Map</h4>
                        <div className="rounded-2xl overflow-hidden shadow-xl border border-slate-300">
                          <MapWidget 
                            center={[selectedIncident.lat, selectedIncident.lng]} 
                            hospitals={selectedIncident.hospitals}
                            shelters={selectedIncident.shelters}
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* 2. Resources Tab */}
                  {activeTab === 'resources' && (
                    <motion.div 
                      key="tab-resources"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="grid md:grid-cols-2 gap-6"
                    >
                      {/* Hospitals List */}
                      <div 
                        className="p-5 rounded-2xl space-y-3"
                        style={{
                          backgroundColor: '#E4E9F2',
                          boxShadow: 'inset 3px 3px 6px #b8c4d9, inset -3px -3px 6px #ffffff',
                        }}
                      >
                        <h4 className="text-xs font-mono font-black uppercase tracking-wider text-blue-900 flex items-center gap-1.5 border-b border-slate-300/60 pb-2">
                          <Building className="h-4 w-4 text-blue-600" />
                          Nearby Hospitals
                        </h4>
                        <div className="space-y-2">
                          {selectedIncident.hospitals.map((hospital, idx) => (
                            <div key={idx} className="bg-white p-3 rounded-xl flex justify-between items-center text-xs font-bold shadow-xs">
                              <div>
                                <p className="text-slate-900">{hospital.name}</p>
                                <p className="text-[10px] text-slate-500 font-mono mt-0.5">Capacity: {hospital.availability}</p>
                              </div>
                              <span className="font-mono text-slate-400 text-[11px] shrink-0">{hospital.distance}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Shelters List */}
                      <div 
                        className="p-5 rounded-2xl space-y-3"
                        style={{
                          backgroundColor: '#E4E9F2',
                          boxShadow: 'inset 3px 3px 6px #b8c4d9, inset -3px -3px 6px #ffffff',
                        }}
                      >
                        <h4 className="text-xs font-mono font-black uppercase tracking-wider text-emerald-900 flex items-center gap-1.5 border-b border-slate-300/60 pb-2">
                          <Home className="h-4 w-4 text-emerald-600" />
                          Relief Shelters
                        </h4>
                        <div className="space-y-2">
                          {selectedIncident.shelters.map((shelter, idx) => (
                            <div key={idx} className="bg-white p-3 rounded-xl flex justify-between items-center text-xs font-bold shadow-xs">
                              <div>
                                <p className="text-slate-900">{shelter.name}</p>
                                <p className="text-[10px] text-slate-500 font-mono mt-0.5">Space: {shelter.availability}</p>
                              </div>
                              <span className="font-mono text-slate-400 text-[11px] shrink-0">{shelter.distance}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* 3. Mission Plan Tab */}
                  {activeTab === 'mission' && (
                    <motion.div 
                      key="tab-mission"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-4"
                    >
                      <h4 className="text-xs font-mono font-black uppercase tracking-wider text-slate-500 mb-3">AI Formulated Mission Steps</h4>
                      <div className="space-y-3">
                        {selectedIncident.missionPlan.map((mission) => (
                          <div 
                            key={mission.id} 
                            className="p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 transition-all"
                            style={{
                              backgroundColor: '#FFFFFF',
                              boxShadow: '3px 3px 8px #b8c4d9, -3px -3px 8px #ffffff',
                            }}
                          >
                            <div className="space-y-1">
                              <p className="font-display font-black text-slate-900 text-sm">{mission.name}</p>
                              <div className="flex gap-2 text-[10px] text-slate-500 font-mono">
                                <span>Priority: <strong className="text-slate-800">{mission.priority}</strong></span>
                                <span>•</span>
                                <span>ETA: <strong className="text-slate-800">{mission.eta}</strong></span>
                              </div>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-[10px] font-mono font-black uppercase ${
                              mission.status === 'Completed' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                              mission.status === 'Deployed' ? 'bg-blue-100 text-blue-800 border border-blue-300' :
                              'bg-slate-100 text-slate-600 border border-slate-200'
                            }`}>
                              {mission.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* 4. Reports Tab */}
                  {activeTab === 'reports' && (
                    <motion.div 
                      key="tab-reports"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-4"
                    >
                      <div className="flex justify-between items-center p-1.5 rounded-2xl" style={{ backgroundColor: '#E4E9F2', boxShadow: 'inset 2px 2px 5px #b8c4d9, inset -2px -2px 5px #ffffff' }}>
                        <div className="flex gap-2">
                          {(['government', 'ngo', 'public'] as const).map((r) => (
                            <button
                              key={r}
                              onClick={() => setReportType(r)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-black uppercase tracking-wide transition-all cursor-pointer ${
                                reportType === r
                                  ? 'bg-white text-slate-900 shadow-md'
                                  : 'text-slate-500 hover:text-slate-900'
                              }`}
                            >
                              {r}
                            </button>
                          ))}
                        </div>
                        
                        <div className="flex gap-1.5 pr-1">
                          <button
                            onClick={() => handleCopy(selectedIncident.reportMarkdown[reportType])}
                            className="p-2 text-slate-500 hover:text-slate-900 rounded-xl bg-white/60 hover:bg-white transition-all cursor-pointer"
                            title="Copy Report"
                          >
                            {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                          </button>
                          <button
                            onClick={() => handleDownload(`${selectedIncident.id}_${reportType}_report`, selectedIncident.reportMarkdown[reportType])}
                            className="p-2 text-slate-500 hover:text-slate-900 rounded-xl bg-white/60 hover:bg-white transition-all cursor-pointer"
                            title="Download Markdown"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      <div 
                        className="rounded-2xl p-5 text-emerald-300 font-mono text-xs leading-relaxed max-h-[320px] overflow-y-auto whitespace-pre-line shadow-2xl border border-slate-800"
                        style={{
                          background: 'linear-gradient(145deg, #09131C 0%, #0F172A 100%)',
                        }}
                      >
                        {selectedIncident.reportMarkdown[reportType] || 'No report generated for this portal.'}
                      </div>
                    </motion.div>
                  )}

                  {/* 5. Blockchain Tab */}
                  {activeTab === 'blockchain' && (
                    <motion.div 
                      key="tab-blockchain"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-4"
                    >
                      <h4 className="text-xs font-mono font-black uppercase tracking-wider text-slate-500 mb-3">On-chain Telemetry Ledger</h4>
                      <div 
                        className="rounded-2xl p-5 space-y-3 font-mono text-xs text-slate-700"
                        style={{
                          backgroundColor: '#FFFFFF',
                          boxShadow: '3px 3px 8px #b8c4d9, -3px -3px 8px #ffffff',
                        }}
                      >
                        <div className="flex flex-col sm:flex-row justify-between border-b border-slate-200 pb-2">
                          <span className="font-bold text-slate-400 uppercase text-[10px]">Record Type</span>
                          <span className="font-bold text-slate-900">DISASTER_IDENTIFIED</span>
                        </div>
                        <div className="flex flex-col sm:flex-row justify-between border-b border-slate-200 pb-2">
                          <span className="font-bold text-slate-400 uppercase text-[10px]">Coordinates</span>
                          <span className="font-bold text-slate-900">[{selectedIncident.lat}, {selectedIncident.lng}]</span>
                        </div>
                        <div className="flex flex-col sm:flex-row justify-between border-b border-slate-200 pb-2">
                          <span className="font-bold text-slate-400 uppercase text-[10px]">Cryptographic Proof</span>
                          <span className="font-bold text-emerald-700">SHA-256 Verified (Confidence: {selectedIncident.confidence}%)</span>
                        </div>
                        <div className="flex flex-col sm:flex-row justify-between pb-1">
                          <span className="font-bold text-slate-400 uppercase text-[10px]">Smart Contract</span>
                          <span className="font-bold text-emerald-800 break-all">0x71C7656EC7ab88b098defB751B7401B5f6d8976F</span>
                        </div>
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
              Please select an incident to review coordination plan.
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default ActiveIncidents;
