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
  Link as LinkIcon,
  Sparkles,
  Radio
} from 'lucide-react';
import { motion } from 'framer-motion';

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
    <div className="space-y-8 font-sans max-w-5xl mx-auto select-none">
      
      {/* Title Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-xs font-mono font-black uppercase tracking-wider text-emerald-800">
              Autonomous Intelligence
            </span>
          </div>
          <h1 className="text-3xl font-display font-black text-slate-900 tracking-tight">AI Multi-Agent Simulation Engine</h1>
          <p className="text-slate-600 text-sm font-medium mt-1">Simulate multi-agent reasoning, automated risk scoring, and zero-knowledge ledger releases.</p>
        </div>
      </div>

      {/* Input Form Panel */}
      <div 
        className="rounded-3xl p-6 sm:p-8 space-y-4"
        style={{
          backgroundColor: '#E4E9F2',
          boxShadow: '10px 10px 24px #b8c4d9, -10px -10px 24px #ffffff',
          border: '1.5px solid rgba(255, 255, 255, 0.8)',
        }}
      >
        <div className="flex justify-between items-center pb-2 border-b border-slate-300/60">
          <label className="block text-xs font-mono font-black uppercase tracking-wider text-slate-700">
            Disaster Description / Raw Satellite Alert Stream:
          </label>
          <span 
            className="text-[10px] font-mono font-black text-emerald-800 px-3 py-0.5 rounded-full"
            style={{
              backgroundColor: '#E4E9F2',
              boxShadow: 'inset 2px 2px 4px #b8c4d9, inset -2px -2px 4px #ffffff',
            }}
          >
            Multi-Source Sensor Input
          </span>
        </div>

        <textarea
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={isAnalyzing}
          placeholder="e.g. Flash flood warning along Brahmaputra river basin affecting 450,000 citizens in Barpeta with washed out embankments..."
          className="w-full rounded-2xl p-4 text-sm text-slate-900 font-medium placeholder-slate-400 outline-none"
          style={{
            backgroundColor: '#FFFFFF',
            boxShadow: 'inset 2px 2px 5px #b8c4d9, inset -2px -2px 5px #ffffff',
            border: '1px solid rgba(255, 255, 255, 0.7)',
          }}
        />
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-2">
          <span className="text-xs text-slate-500 font-medium">
            💡 Keyword tips: Include <span className="font-mono bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-bold">preparedness</span> to simulate low-risk containment.
          </span>

          <motion.button
            whileHover={{ scale: 1.03, y: -1 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleStartAnalysis}
            disabled={isAnalyzing || !description.trim()}
            className="inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-xs font-black text-white shadow-lg cursor-pointer disabled:opacity-50"
            style={{
              background: 'linear-gradient(135deg, #065F46 0%, #10B981 100%)',
              boxShadow: '0 8px 24px -4px rgba(16, 185, 129, 0.4)',
            }}
          >
            {isAnalyzing ? (
              <>
                <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Executing Agents ({analysisProgress}%)</span>
              </>
            ) : (
              <>
                <Cpu className="h-4 w-4" />
                <span>Run Autonomous AI Pipeline</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </>
            )}
          </motion.button>
        </div>
      </div>

      {/* Side-by-Side Panel: Agents vs Terminal Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left Side: Pipeline Workflow Panel */}
        <div 
          className="lg:col-span-5 rounded-3xl p-6 flex flex-col justify-between min-h-[500px]"
          style={{
            backgroundColor: '#E4E9F2',
            boxShadow: '8px 8px 20px #b8c4d9, -8px -8px 20px #ffffff',
            border: '1px solid rgba(255, 255, 255, 0.7)',
          }}
        >
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-slate-300/60 pb-3">
              <div className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${isAnalyzing ? 'bg-emerald-500 animate-ping' : 'bg-slate-400'}`} />
                <h3 className="text-xs font-mono font-black uppercase tracking-wider text-slate-700">LIVE AGENT TOPOLOGY</h3>
              </div>
              <span className="text-[10px] font-mono font-bold text-emerald-800 uppercase">
                {isAnalyzing ? '• Active' : (analysisProgress === 100 ? '• Completed' : '• Ready')}
              </span>
            </div>

            {/* Vertical Timeline */}
            <div className="relative pl-6 space-y-3">
              <div className="absolute left-[13px] top-2 bottom-2 w-0.5 border-l border-dashed border-slate-300" />
              
              {pipelineNodes.map((node, index) => {
                const activeIndex = pipelineNodes.findIndex(n => n.name === analysisActiveNode);
                const isCompleted = index < activeIndex || (analysisProgress === 100);
                const isActive = index === activeIndex && isAnalyzing;
                const IconComponent = node.icon;
                
                let badgeText = 'QUEUED';
                let badgeStyle = 'bg-slate-100 text-slate-500 border-slate-200';
                if (isCompleted) {
                  badgeText = 'VERIFIED';
                  badgeStyle = 'bg-emerald-100 text-emerald-800 border-emerald-300';
                } else if (isActive) {
                  badgeText = 'RUNNING';
                  badgeStyle = 'bg-blue-100 text-blue-800 border-blue-300 animate-pulse';
                }

                return (
                  <div key={node.id} className="relative flex items-center gap-3">
                    <div 
                      className={`absolute -left-6 z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-all ${
                        isCompleted
                          ? 'bg-emerald-500 border-emerald-600 text-white shadow-sm'
                          : isActive
                            ? 'bg-blue-600 border-blue-700 text-white shadow-md animate-pulse'
                            : 'bg-white border-slate-300 text-slate-400'
                      }`}
                    >
                      <IconComponent className="h-3.5 w-3.5" />
                    </div>

                    <div 
                      className="flex-1 flex justify-between items-center p-3 rounded-2xl transition-all"
                      style={{
                        backgroundColor: '#FFFFFF',
                        boxShadow: isActive 
                          ? 'inset 2px 2px 4px #b8c4d9, inset -2px -2px 4px #ffffff'
                          : '2px 2px 6px #b8c4d9, -2px -2px 6px #ffffff',
                      }}
                    >
                      <div>
                        <h4 className={`text-xs font-bold ${isCompleted || isActive ? 'text-slate-900' : 'text-slate-400'}`}>
                          {node.name}
                        </h4>
                        <p className="text-[9px] text-slate-400 font-mono mt-0.5">
                          Step {index + 1} of 6
                        </p>
                      </div>
                      <span className={`inline-flex px-2 py-0.5 rounded text-[8px] font-mono font-black uppercase border ${badgeStyle}`}>
                        {badgeText}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex justify-between items-center border-t border-slate-300/60 pt-3 mt-4 text-[10px] font-bold text-slate-500 font-mono">
            <span>{completedCount} / 6 agents completed</span>
            <span>LangGraph Multi-Agent Runtime</span>
          </div>
        </div>

        {/* Right Side: SSE Execution Terminal Output */}
        <div 
          className="lg:col-span-7 rounded-3xl p-6 flex flex-col justify-between min-h-[500px] border border-slate-800 shadow-2xl"
          style={{
            background: 'linear-gradient(145deg, #09131C 0%, #0F172A 100%)',
          }}
        >
          <div className="flex flex-col h-full">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-4 shrink-0">
              <div className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${isAnalyzing ? 'bg-emerald-400 animate-ping' : 'bg-slate-600'}`} />
                <h3 className="text-xs font-mono font-black uppercase tracking-wider text-emerald-400">
                  REAL-TIME TELEMETRY CONSOLE
                </h3>
              </div>
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">
                {isAnalyzing ? '• STREAMING DATA' : '• READY'}
              </span>
            </div>

            {/* Scrollable Terminal Output */}
            <div className="flex-1 overflow-y-auto max-h-[380px] font-mono text-xs text-slate-300 space-y-2 pr-2 select-text">
              {analysisLogs.length > 0 ? (
                analysisLogs.map((log, idx) => (
                  <div key={idx} className="leading-relaxed flex gap-2">
                    <span className="text-slate-600 select-none">{idx + 1}.</span>
                    <span className={
                      log.startsWith('❌') ? 'text-rose-400' :
                      log.startsWith('✔') ? 'text-emerald-400 font-bold' :
                      log.startsWith('[Executing]') ? 'text-cyan-400 font-bold' : 'text-slate-300'
                    }>
                      {log}
                    </span>
                  </div>
                ))
              ) : (
                <div className="h-full flex flex-col justify-center items-center text-center text-slate-500 p-8 space-y-2">
                  <Cpu className="h-8 w-8 text-emerald-600/50 mb-2" />
                  <p className="font-semibold text-sm text-slate-300">Click "Run Autonomous AI Pipeline" to stream live LangGraph execution logs.</p>
                  <p className="text-[11px] text-slate-500 font-mono">The platform orchestrates agent logic and updates state on the blockchain.</p>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Platform Outcome */}
      {!isAnalyzing && analysisOutcome && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-3xl p-6 sm:p-8 space-y-4"
          style={{
            backgroundColor: '#E4E9F2',
            boxShadow: '10px 10px 24px #b8c4d9, -10px -10px 24px #ffffff',
            border: '1.5px solid rgba(255, 255, 255, 0.8)',
          }}
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-black uppercase tracking-wider text-slate-500">Pipeline Outcome:</span>
                <StatusBadge type="report" value={analysisOutcome === 'LIVE' ? 'live' : 'preparedness'} />
              </div>
              {analysisOutcome === 'PREPAREDNESS' ? (
                <p className="text-xs text-slate-600 font-medium leading-relaxed">
                  Incident categorized under <span className="font-bold text-amber-700 font-mono">Preparedness (Low Risk)</span>. Blockchain smart contract skipped, government telemetry active. No NGO notification will be triggered.
                </p>
              ) : (
                <p className="text-xs text-slate-600 font-medium leading-relaxed">
                  Incident categorized under <span className="font-bold text-emerald-800 font-mono">Live Disaster Status</span>. Urgent coordination is enabled. Click below to publish to regional NGOs.
                </p>
              )}
            </div>

            <div className="flex gap-3 shrink-0">
              {analysisOutcome === 'PREPAREDNESS' ? (
                <button
                  onClick={() => navigate('/gov/dashboard')}
                  className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold text-slate-700 cursor-pointer"
                  style={{
                    backgroundColor: '#FFFFFF',
                    boxShadow: '3px 3px 8px #b8c4d9, -3px -3px 8px #ffffff',
                  }}
                >
                  <Eye className="h-4 w-4" />
                  Monitor incident
                </button>
              ) : (
                <>
                  {isPublished ? (
                    <button
                      onClick={() => navigate('/gov/active')}
                      className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold text-emerald-800 cursor-pointer"
                      style={{
                        backgroundColor: '#FFFFFF',
                        boxShadow: '3px 3px 8px #b8c4d9, -3px -3px 8px #ffffff',
                      }}
                    >
                      <FileCheck className="h-4 w-4 text-emerald-600" />
                      View Incident Details
                    </button>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.03, y: -1 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={handlePublish}
                      className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-xs font-black text-white shadow-lg cursor-pointer"
                      style={{
                        background: 'linear-gradient(135deg, #065F46 0%, #10B981 100%)',
                        boxShadow: '0 8px 20px -4px rgba(16, 185, 129, 0.4)',
                      }}
                    >
                      <span>Publish to Field NGOs</span>
                      <ArrowRight className="h-4 w-4" />
                    </motion.button>
                  )}
                </>
              )}
            </div>
          </div>
        </motion.div>
      )}

    </div>
  );
};

export default AnalyzeIncident;
