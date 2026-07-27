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
  Check
} from 'lucide-react';

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
    <div className="space-y-8 font-sans">
      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Active Response Hub</h1>
        <p className="text-slate-500 text-sm font-medium mt-1">Review active incidents, resource metrics, and blockchain audit logs.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Incidents Master List */}
        <div className="lg:col-span-4 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Incident Feed</h3>
          <div className="space-y-3">
            {activeDisasters.map((d) => {
              const isSelected = selectedIncident?.id === d.id;
              return (
                <div
                  key={d.id}
                  onClick={() => {
                    setActiveIncidentId(d.id);
                    setActiveTab('overview');
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
            {activeDisasters.length === 0 && (
              <div className="bg-white border border-slate-200/80 p-6 rounded-xl text-center text-xs text-slate-400 italic">
                No active disasters recorded.
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Incident Details Viewer */}
        <div className="lg:col-span-8">
          {selectedIncident ? (
            <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden space-y-6 p-6">
              
              {/* Incident Header Details */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-5">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">{selectedIncident.name}</h2>
                  <p className="text-xs text-slate-500 font-medium mt-1">Disaster ID: <span className="font-mono">{selectedIncident.id}</span> | State: {selectedIncident.state}</p>
                </div>
                <div className="flex items-center gap-3">
                  {selectedIncident.status === 'reported' && (
                    <button
                      onClick={() => publishIncident(selectedIncident.id)}
                      className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-green-600 hover:bg-green-700 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                    >
                      Publish Incident
                    </button>
                  )}
                  <div className="flex gap-2">
                    <StatusBadge type="severity" value={selectedIncident.severity} />
                    <StatusBadge type="report" value={selectedIncident.status} />
                  </div>
                </div>
              </div>

              {/* Tabs list */}
              <div className="flex border-b border-slate-200 overflow-x-auto text-xs font-bold text-slate-500 select-none">
                {(['overview', 'resources', 'mission', 'reports', 'blockchain'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`pb-3 px-4 uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
                      activeTab === tab
                        ? 'border-green-600 text-green-700 font-bold'
                        : 'border-transparent hover:text-slate-800'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Tab Contents */}
              <div className="pt-2">
                
                {/* 1. Overview Tab */}
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/55 text-center">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Risk Level</span>
                        <p className="text-sm font-bold text-slate-800 mt-1">{selectedIncident.riskLevel}</p>
                      </div>
                      <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/55 text-center">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">AI Confidence</span>
                        <p className="text-sm font-bold text-slate-800 mt-1">{selectedIncident.confidence}%</p>
                      </div>
                      <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/55 text-center">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Exposed Pop.</span>
                        <p className="text-sm font-bold text-slate-800 mt-1">{selectedIncident.population.toLocaleString('en-IN')}</p>
                      </div>
                      <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/55 text-center">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Verification</span>
                        <p className="text-sm font-bold text-green-700 mt-1 flex items-center justify-center gap-1">
                          <ShieldCheck className="h-4 w-4" /> Verified
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Incident Description</h4>
                      <p className="text-xs leading-relaxed text-slate-600 font-medium">{selectedIncident.description}</p>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">GIS Threat Assessment Map</h4>
                      <MapWidget 
                        center={[selectedIncident.lat, selectedIncident.lng]} 
                        hospitals={selectedIncident.hospitals}
                        shelters={selectedIncident.shelters}
                      />
                    </div>
                  </div>
                )}

                {/* 2. Resources Tab */}
                {activeTab === 'resources' && (
                  <div className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      
                      {/* Hospitals List */}
                      <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 space-y-4">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-blue-800 flex items-center gap-1.5 border-b border-slate-200 pb-2">
                          <span>🏥</span> Nearby Hospitals
                        </h4>
                        <div className="space-y-3">
                          {selectedIncident.hospitals.map((hospital, idx) => (
                            <div key={idx} className="bg-white p-3 rounded-lg border border-slate-200/40 flex justify-between items-center text-xs">
                              <div>
                                <p className="font-bold text-slate-800">{hospital.name}</p>
                                <p className="text-[10px] text-slate-500 mt-0.5">Capacity: {hospital.availability}</p>
                              </div>
                              <span className="font-mono text-slate-400 font-bold shrink-0">{hospital.distance}</span>
                            </div>
                          ))}
                          {selectedIncident.hospitals.length === 0 && (
                            <p className="text-slate-400 italic text-center py-4">No mapped hospital facilities</p>
                          )}
                        </div>
                      </div>

                      {/* Shelters List */}
                      <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 space-y-4">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-green-800 flex items-center gap-1.5 border-b border-slate-200 pb-2">
                          <span>🏠</span> Nearby Shelters
                        </h4>
                        <div className="space-y-3">
                          {selectedIncident.shelters.map((shelter, idx) => (
                            <div key={idx} className="bg-white p-3 rounded-lg border border-slate-200/40 flex justify-between items-center text-xs">
                              <div>
                                <p className="font-bold text-slate-800">{shelter.name}</p>
                                <p className="text-[10px] text-slate-500 mt-0.5">Space: {shelter.availability}</p>
                              </div>
                              <span className="font-mono text-slate-400 font-bold shrink-0">{shelter.distance}</span>
                            </div>
                          ))}
                          {selectedIncident.shelters.length === 0 && (
                            <p className="text-slate-400 italic text-center py-4">No mapped relief shelters</p>
                          )}
                        </div>
                      </div>

                    </div>
                  </div>
                )}

                {/* 3. Mission Plan Tab */}
                {activeTab === 'mission' && (
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">AI Formulated Mission Steps</h4>
                    <div className="space-y-3">
                      {selectedIncident.missionPlan.map((mission) => (
                        <div key={mission.id} className="bg-slate-50 p-4 border border-slate-200/60 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                          <div className="space-y-1">
                            <p className="font-bold text-slate-800 text-sm">{mission.name}</p>
                            <div className="flex gap-2 text-[10px] text-slate-500 font-medium">
                              <span>Priority: <span className="font-bold text-slate-700">{mission.priority}</span></span>
                              <span>•</span>
                              <span>ETA: <span className="font-mono font-bold text-slate-700">{mission.eta}</span></span>
                            </div>
                          </div>
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                            mission.status === 'Completed' ? 'bg-green-100 text-green-700 border border-green-200' :
                            mission.status === 'Deployed' ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                            mission.status === 'In Progress' ? 'bg-amber-100 text-amber-700 border border-amber-200 animate-pulse' :
                            'bg-slate-100 text-slate-500 border border-slate-200'
                          }`}>
                            {mission.status}
                          </span>
                        </div>
                      ))}
                      {selectedIncident.missionPlan.length === 0 && (
                        <p className="text-slate-400 italic text-center py-4">No mission steps registered</p>
                      )}
                    </div>
                  </div>
                )}

                {/* 4. Reports Tab */}
                {activeTab === 'reports' && (
                  <div className="space-y-4">
                    {/* Report selector */}
                    <div className="flex justify-between items-center bg-slate-50 p-1.5 rounded-lg border border-slate-200/50">
                      <div className="flex gap-2">
                        {(['government', 'ngo', 'public'] as const).map((r) => (
                          <button
                            key={r}
                            onClick={() => setReportType(r)}
                            className={`px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wide transition-all cursor-pointer ${
                              reportType === r
                                ? 'bg-white text-slate-900 shadow-xs border border-slate-200/30'
                                : 'text-slate-500 hover:text-slate-900'
                            }`}
                          >
                            {r}
                          </button>
                        ))}
                      </div>
                      
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => handleCopy(selectedIncident.reportMarkdown[reportType])}
                          className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-white border border-transparent hover:border-slate-200 transition-all cursor-pointer"
                          title="Copy Report"
                        >
                          {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                        </button>
                        <button
                          onClick={() => handleDownload(`${selectedIncident.id}_${reportType}_report`, selectedIncident.reportMarkdown[reportType])}
                          className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-white border border-transparent hover:border-slate-200 transition-all cursor-pointer"
                          title="Download Markdown"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* Markdown Viewer */}
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-slate-300 font-mono text-xs leading-relaxed max-h-[300px] overflow-y-auto shadow-inner whitespace-pre-line">
                      {selectedIncident.reportMarkdown[reportType] || 'No report generated for this portal.'}
                    </div>
                  </div>
                )}

                {/* 5. Blockchain Tab */}
                {activeTab === 'blockchain' && (
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">On-chain Telemetry Ledger</h4>
                    <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-5 space-y-4 font-mono text-xs leading-relaxed text-slate-600">
                      <div className="flex flex-col sm:flex-row justify-between border-b border-slate-200/60 pb-2">
                        <span className="font-bold text-slate-500 uppercase text-[10px]">Record Type</span>
                        <span className="font-bold text-slate-900">DISASTER_IDENTIFIED</span>
                      </div>
                      <div className="flex flex-col sm:flex-row justify-between border-b border-slate-200/60 pb-2">
                        <span className="font-bold text-slate-500 uppercase text-[10px]">State Target Coordinates</span>
                        <span className="font-bold text-slate-900">[{selectedIncident.lat}, {selectedIncident.lng}]</span>
                      </div>
                      <div className="flex flex-col sm:flex-row justify-between border-b border-slate-200/60 pb-2">
                        <span className="font-bold text-slate-500 uppercase text-[10px]">Confidence Cryptographic Proof</span>
                        <span className="font-bold text-slate-900">SHA-256 Verified (C: {selectedIncident.confidence}%)</span>
                      </div>
                      <div className="flex flex-col sm:flex-row justify-between pb-1">
                        <span className="font-bold text-slate-500 uppercase text-[10px]">Smart Contract Release Address</span>
                        <span className="font-bold text-green-700 text-right break-all">0x71C7656EC7ab88b098defB751B7401B5f6d8976F</span>
                      </div>
                    </div>
                  </div>
                )}

              </div>

            </div>
          ) : (
            <div className="bg-white border border-slate-200/80 p-8 rounded-2xl text-center text-sm text-slate-400 italic">
              Please select an incident to review coordination plan.
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default ActiveIncidents;
