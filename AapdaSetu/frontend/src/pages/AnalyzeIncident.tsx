import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../hooks/useStore';
import { StatusBadge } from '../components/StatusBadge';
import { 
  Activity, 
  Cpu, 
  ArrowRight,
  Eye,
  FileCheck,
  Globe,
  Shield,
  Package,
  Map,
  Link as LinkIcon
} from 'lucide-react';

const pipelineNodes = [
  { id: 'node-1', name: 'NLP Parsing (Geocoding)', desc: 'Entity extraction and location mapping', icon: Globe },
  { id: 'node-2', name: 'Verification Agent', desc: 'Cross-reference satellite telemetry & feeds', icon: Shield },
  { id: 'node-3', name: 'Risk Assessment', desc: 'Exposed population and impact analysis', icon: Activity },
  { id: 'node-4', name: 'Resource Matching', desc: 'Hospitals & shelter capacity matching', icon: Package },
  { id: 'node-5', name: 'Mission Planner', desc: 'Evacuation SOP and route planning', icon: Map },
  { id: 'node-6', name: 'Blockchain Audit', desc: 'Solidity smart contract initialization', icon: LinkIcon }
];

export const AnalyzeIncident: React.FC = () => {
  const navigate = useNavigate();
  const runAnalysis = useStore((state) => state.runAnalysis);
  const isAnalyzing = useStore((state) => state.isAnalyzing);
  const analysisProgress = useStore((state) => state.analysisProgress);
  const analysisLogs = useStore((state) => state.analysisLogs);
  const analysisActiveNode = useStore((state) => state.analysisActiveNode);
  const analysisOutcome = useStore((state) => state.analysisOutcome);
  const activeIncidentId = useStore((state) => state.activeIncidentId);
  const publishIncident = useStore((state) => state.publishIncident);
  const resetAnalysisState = useStore((state) => state.resetAnalysisState);

  const [description, setDescription] = useState('');

  const [isPublished, setIsPublished] = useState(false);

  const activeNodeIndex = pipelineNodes.findIndex(n => n.name === analysisActiveNode);
  const completedCount = analysisProgress === 100 
    ? 6 
    : (activeNodeIndex === -1 ? 0 : activeNodeIndex);

  const handleStartAnalysis = async () => {
    setIsPublished(false);
    resetAnalysisState();
    await runAnalysis(description);
  };

  const handlePublish = () => {
    if (activeIncidentId) {
      publishIncident(activeIncidentId);
      setIsPublished(true);
    }
  };

  return (
    <div className="space-y-8 font-sans max-w-5xl mx-auto">
      
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">AI Pipeline Analyzer</h1>
        <p className="text-slate-500 text-sm font-medium mt-1">Initiate multi-agent models to assess regional reports and compile mission SOPs.</p>
      </div>

      {/* Input Form Panel */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-sm space-y-4">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
          Describe disaster scenario or telemetry alert:
        </label>
        <textarea
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={isAnalyzing}
          placeholder="Describe coordinates, severity indicators, weather conditions..."
          className="w-full rounded-xl bg-slate-50/50 border border-slate-200 px-4 py-3 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 disabled:opacity-50"
        />
        
        <div className="flex justify-between items-center pt-2">
          <span className="text-xs text-slate-400 font-medium">
            Include keywords like <span className="font-mono bg-slate-100 text-slate-600 px-1 py-0.5 rounded">preparedness</span> to test low-risk status.
          </span>
          <button
            onClick={handleStartAnalysis}
            disabled={isAnalyzing || !description.trim()}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 hover:bg-green-700 px-5 py-3 text-sm font-bold text-white shadow-md shadow-green-600/10 transition-all duration-150 hover:scale-[1.02] cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
          >
            {isAnalyzing ? (
              <>
                <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Processing Pipeline ({analysisProgress}%)
              </>
            ) : (
              <>
                <Cpu className="h-4.5 w-4.5" />
                Run AI Pipeline
              </>
            )}
          </button>
        </div>
      </div>

      {/* Side-by-Side Panel: Agents vs Terminal Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left Side: Pipeline Workflow Panel */}
        <div className="lg:col-span-5 bg-white border border-slate-200/80 rounded-xl p-5 shadow-sm flex flex-col justify-between min-h-[500px]">
          <div className="space-y-5">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${isAnalyzing ? 'bg-blue-500 animate-pulse' : 'bg-slate-400'}`} />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">LIVE AI AGENT PIPELINE</h3>
              </div>
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">
                {isAnalyzing ? 'Running' : (analysisProgress === 100 ? 'Completed' : 'Idle')}
              </span>
            </div>

            {/* Vertical Timeline */}
            <div className="relative pl-6 space-y-4">
              <div className="absolute left-[13px] top-2 bottom-2 w-0.5 border-l border-dashed border-slate-200" />
              
              {pipelineNodes.map((node, index) => {
                const activeIndex = pipelineNodes.findIndex(n => n.name === analysisActiveNode);
                const isCompleted = index < activeIndex || (analysisProgress === 100);
                const isActive = index === activeIndex && isAnalyzing;
                const IconComponent = node.icon;
                
                let badgeText = 'QUEUED';
                let badgeStyle = 'bg-slate-50 text-slate-400 border-slate-200/60';
                if (isCompleted) {
                  badgeText = 'COMPLETED';
                  badgeStyle = 'bg-green-50 text-green-700 border-green-200';
                } else if (isActive) {
                  badgeText = 'RUNNING';
                  badgeStyle = 'bg-blue-50 text-blue-700 border-blue-200 animate-pulse';
                }

                return (
                  <div key={node.id} className="relative flex items-center gap-4">
                    <div 
                      className={`absolute -left-6 z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-all ${
                        isCompleted
                          ? 'bg-green-50 border-green-500 text-green-600'
                          : isActive
                            ? 'bg-blue-50 border-blue-600 text-blue-600 ring-2 ring-blue-50'
                            : 'bg-white border-slate-200 text-slate-400'
                      }`}
                    >
                      <IconComponent className="h-3.5 w-3.5" />
                    </div>

                    <div className={`flex-1 flex justify-between items-center p-2.5 rounded-lg border transition-all ${
                      isCompleted 
                        ? 'bg-white border-slate-100 text-slate-800' 
                        : isActive
                          ? 'bg-blue-50/20 border-blue-100 text-slate-800'
                          : 'bg-white/40 border-slate-100 text-slate-300'
                    }`}>
                      <div>
                        <h4 className={`text-xs font-bold ${isCompleted || isActive ? 'text-slate-800' : 'text-slate-400'}`}>
                          {node.name}
                        </h4>
                        <p className="text-[9px] text-slate-400 font-medium font-mono uppercase mt-0.5">
                          Step {index + 1} of 6
                        </p>
                      </div>
                      <span className={`inline-flex px-1.5 py-0.5 rounded text-[8px] font-bold border ${badgeStyle}`}>
                        {badgeText}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Left Panel Footer Summary */}
          <div className="flex justify-between items-center border-t border-slate-100 pt-3 mt-4 text-[10px] font-bold text-slate-400 font-mono">
            <span>{completedCount} / 6 completed</span>
            <span>LangGraph Engine</span>
          </div>
        </div>

        {/* Right Side: SSE Execution Terminal Output */}
        <div className="lg:col-span-7 bg-[#0f172a] border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col justify-between min-h-[500px]">
          <div className="flex flex-col h-full">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-4 shrink-0">
              <div className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${isAnalyzing ? 'bg-green-500 animate-pulse' : 'bg-slate-600'}`} />
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">LIVE EXECUTION TIMELINE (SSE STREAM)</h3>
              </div>
              <span className="text-[10px] font-mono font-bold text-slate-500 uppercase">
                {isAnalyzing ? '• STREAMING' : '• IDLE'}
              </span>
            </div>

            {/* Scrollable Terminal Output */}
            <div className="flex-1 overflow-y-auto max-h-[380px] font-mono text-xs text-slate-300 space-y-2.5 pr-2 scrollbar-thin select-text">
              {analysisLogs.length > 0 ? (
                analysisLogs.map((log, idx) => (
                  <div key={idx} className="leading-relaxed flex gap-2">
                    <span className="text-slate-600 select-none">{idx + 1}.</span>
                    <span className={
                      log.startsWith('❌') ? 'text-red-400' :
                      log.startsWith('✔') ? 'text-emerald-400 font-bold' :
                      log.startsWith('[Executing]') ? 'text-blue-400 font-bold' : 'text-slate-300'
                    }>
                      {log}
                    </span>
                  </div>
                ))
              ) : (
                <div className="h-full flex flex-col justify-center items-center text-center text-slate-500 p-8 space-y-2">
                  <p className="font-semibold text-sm">Type a query and click "Run AI Pipeline" to stream live LangGraph execution logs.</p>
                  <p className="text-[10px] text-slate-600">The platform orchestrates agent logic and updates state on the blockchain.</p>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

          {/* Platform Outcome */}
          {!isAnalyzing && analysisOutcome && (
            <div className="border-t border-slate-100 pt-6 space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Pipeline Outcome:</span>
                    <StatusBadge type="report" value={analysisOutcome === 'LIVE' ? 'live' : 'preparedness'} />
                  </div>
                  {analysisOutcome === 'PREPAREDNESS' ? (
                    <p className="text-xs text-slate-500 font-medium leading-relaxed">
                      Incident categorized under <span className="font-bold text-amber-700">Preparedness (Low Risk)</span>. Blockchain smart contract skipped, government telemetry active. No NGO notification will be triggered.
                    </p>
                  ) : (
                    <p className="text-xs text-slate-500 font-medium leading-relaxed">
                      Incident categorized under <span className="font-bold text-green-700">Live Disaster Status</span>. Urgent coordination is enabled. Click below to publish to regional NGOs.
                    </p>
                  )}
                </div>

                <div className="flex gap-3 shrink-0">
                  {analysisOutcome === 'PREPAREDNESS' ? (
                    <button
                      onClick={() => navigate('/gov/dashboard')}
                      className="inline-flex items-center gap-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 px-4 py-2.5 text-xs font-bold text-slate-700 cursor-pointer"
                    >
                      <Eye className="h-4 w-4" />
                      Monitor incident
                    </button>
                  ) : (
                    <>
                      {isPublished ? (
                        <button
                          onClick={() => navigate('/gov/active')}
                          className="inline-flex items-center gap-2 rounded-xl bg-green-50 border border-green-200 text-green-700 px-4 py-2.5 text-xs font-bold cursor-pointer"
                        >
                          <FileCheck className="h-4 w-4" />
                          View Incident Details
                        </button>
                      ) : (
                        <button
                          onClick={handlePublish}
                          className="inline-flex items-center gap-2 rounded-xl bg-green-600 hover:bg-green-700 px-5 py-2.5 text-xs font-bold text-white shadow-sm cursor-pointer"
                        >
                          Publish Incident
                          <ArrowRight className="h-4 w-4" />
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
      </div>
  );
};

export default AnalyzeIncident;
