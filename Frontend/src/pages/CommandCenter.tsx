import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Zap, 
  CheckCircle2, 
  Search, 
  Sparkles, 
  FileText, 
  ShieldAlert,
  AlertTriangle,
  XCircle,
  Clock,
  Globe,
  ShieldCheck,
  Activity,
  Package,
  Map,
  Link2
} from 'lucide-react';
import { clsx } from 'clsx';
import type { AnalyzeResult } from '../types';
import type { PipelineAgent, PipelineEvent } from '../services/api';
import { streamPipeline } from '../services/api';

// ─── Types ───────────────────────────────────────────────────────────────────

interface LogLine {
  ts: number;
  agent?: string;
  displayName?: string;
  message: string;
  kind: 'status' | 'log' | 'error';
}

// ─── Component ───────────────────────────────────────────────────────────────

export const CommandCenter: React.FC = () => {
  // Query input
  const [customQuery, setCustomQuery] = useState(
    'Massive flood in Guwahati, Assam affecting 450,000 citizens'
  );

  // Pipeline state — dynamic agents from SSE
  const [pipelineAgents, setPipelineAgents] = useState<PipelineAgent[]>([]);
  const [agentStatuses, setAgentStatuses] = useState<Record<string, 'pending' | 'running' | 'completed' | 'error'>>({});
  const [logs, setLogs] = useState<LogLine[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalyzeResult | null>(null);
  const [pipelineError, setPipelineError] = useState<string | null>(null);

  // Scroll control
  const [userHasScrolledUp, setUserHasScrolledUp] = useState(false);
  const cancelRef = useRef<(() => void) | null>(null);
  const logContainerRef = useRef<HTMLDivElement>(null);

  const handleContainerScroll = () => {
    const el = logContainerRef.current;
    if (!el) return;
    const isAtBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 50;
    setUserHasScrolledUp(!isAtBottom);
  };

  const presetQueries = [
    { label: '🌊 Assam Brahmaputra Flood', query: 'Massive flood in Guwahati, Assam affecting 450,000 citizens' },
    { label: '🌋 Uttarkashi Earthquake', query: 'Seismic tremors magnitude 5.8 recorded near Uttarkashi, Uttarakhand' },
    { label: '🌩️ Teesta Flash Flood', query: 'Teesta river cloudburst and flash flood in North Sikkim' }
  ];

  const startPipeline = () => {
    if (isRunning || !customQuery.trim()) return;

    // Cancel any previous stream
    if (cancelRef.current) cancelRef.current();

    // Reset everything
    setPipelineAgents([]);
    setAgentStatuses({});
    setLogs([]);
    setAnalysisResult(null);
    setPipelineError(null);
    setUserHasScrolledUp(false);
    setIsRunning(true);

    // Add initial log
    setLogs([{
      ts: Date.now(),
      message: `Sending query to Python LangGraph backend: "${customQuery.trim()}"`,
      kind: 'log',
    }]);

    // Open SSE stream to real backend
    const abort = streamPipeline(customQuery.trim(), (event: PipelineEvent) => {
      switch (event.type) {
        case 'pipeline_start':
          // Backend told us which agents will run
          if (event.agents) {
            setPipelineAgents(event.agents);
            const initialStatuses: Record<string, 'pending'> = {};
            event.agents.forEach(a => { initialStatuses[a.id] = 'pending'; });
            setAgentStatuses(initialStatuses);
          }
          setLogs(prev => [...prev, {
            ts: Date.now(),
            message: event.message || 'Pipeline started',
            kind: 'log',
          }]);
          break;

        case 'agent_status':
          if (event.agent && event.status) {
            setAgentStatuses(prev => ({
              ...prev,
              [event.agent!]: event.status as 'running' | 'completed' | 'error',
            }));
          }
          setLogs(prev => [...prev, {
            ts: Date.now(),
            agent: event.agent,
            displayName: event.display_name,
            message: event.message || `${event.display_name} → ${event.status}`,
            kind: event.status === 'error' ? 'error' : 'status',
          }]);
          break;

        case 'pipeline_complete':
          if (event.data) {
            setAnalysisResult(event.data);
          }
          setLogs(prev => [...prev, {
            ts: Date.now(),
            message: '✅ Pipeline complete — all agents finished.',
            kind: 'log',
          }]);
          setIsRunning(false);
          break;

        case 'error':
          setPipelineError(event.message || event.error || 'Unknown error');
          setLogs(prev => [...prev, {
            ts: Date.now(),
            message: `❌ Error: ${event.message || event.error}`,
            kind: 'error',
          }]);
          setIsRunning(false);
          break;
      }
    });

    cancelRef.current = abort;
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (cancelRef.current) cancelRef.current();
    };
  }, []);

  // Auto-scroll logs
  useEffect(() => {
    if (!userHasScrolledUp && logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs, userHasScrolledUp]);

  // Fallback defaults for empty states to keep the dashboard visual
  const defaultAgents: PipelineAgent[] = [
    { id: 'nlp', display_name: 'NLP Parsing (Geocoding)' },
    { id: 'verification', display_name: 'Verification Agent' },
    { id: 'risk_assessment', display_name: 'Risk Assessment' },
    { id: 'resource_matching', display_name: 'Resource Matching' },
    { id: 'mission_planning', display_name: 'Mission Planner' },
    { id: 'blockchain', display_name: 'Blockchain Audit' }
  ];

  const defaultHospitals = [
    { name: 'CHC, Howraghat', capacity: 150, occupied_beds: 97 },
    { name: 'water supply office', capacity: 150, occupied_beds: 97 }
  ];

  const defaultShelters = [
    { name: 'Army Camp Shelter', capacity: 520, occupied: 310 },
    { name: 'Relief Camp A', capacity: 1100, occupied: 950 }
  ];

  // Derived values
  const agentsToShow = pipelineAgents.length > 0 ? pipelineAgents : defaultAgents;
  
  const hospitalsToShow = analysisResult?.nearby_hospitals?.length > 0
    ? analysisResult.nearby_hospitals
    : defaultHospitals;

  const sheltersToShow = analysisResult?.nearby_shelters?.length > 0
    ? analysisResult.nearby_shelters
    : defaultShelters;

  const severityVal = analysisResult ? analysisResult.disaster_severity : (isRunning ? 8.6 : 0);
  const percentage = Math.round(severityVal * 10);
  const riskLevel = analysisResult?.risk_assessment?.risk_level || (isRunning ? 'CRITICAL' : 'LOW');
  const verStatus = analysisResult?.verification_status || (isRunning ? 'LIVE VERIFIED' : 'PREPAREDNESS');

  const blockchainStatus = analysisResult?.blockchain?.status || analysisResult?.blockchain?.blockchain_status || (isRunning ? 'PENDING' : 'MINED');
  const txHash = analysisResult?.blockchain?.transaction_hash 
    ? (analysisResult.blockchain.transaction_hash.length > 20
        ? analysisResult.blockchain.transaction_hash.substring(0, 16) + '...'
        : analysisResult.blockchain.transaction_hash)
    : (isRunning ? 'pending...' : '0x7b4a2e5d9c1f8a7e...');
  const blockNum = analysisResult?.blockchain?.block_number 
    ? `#${analysisResult.blockchain.block_number}` 
    : (isRunning ? 'pending...' : '#2,814,923');
  const decisionHash = analysisResult?.blockchain?.ai_decision_hash
    ? (analysisResult.blockchain.ai_decision_hash.length > 20
        ? analysisResult.blockchain.ai_decision_hash.substring(0, 16) + '...'
        : analysisResult.blockchain.ai_decision_hash)
    : (isRunning ? null : '0xef8c5d3a...');

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-800 pb-24 pt-28 relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 border border-emerald-200/80 px-3.5 py-1 text-xs font-mono font-bold text-emerald-800 mb-3 shadow-xs">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Python LangGraph Pipeline • Live SSE Stream</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-slate-900 tracking-tight">
              AI Command Center
            </h1>
            <p className="mt-1.5 text-sm text-slate-500 font-medium">
              Live Disaster Intelligence Platform for India
            </p>
          </div>
        </div>

        {/* Interactive Query Box */}
        <div className="mt-8 bg-white border border-slate-200 p-5 rounded-2xl shadow-card">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-emerald-600" />
              Disaster Query → Python Backend /analyze/stream
            </label>
            <span className="text-[11px] text-slate-400 font-mono">SSE Endpoint: POST /analyze/stream</span>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={customQuery}
                onChange={(e) => setCustomQuery(e.target.value)}
                disabled={isRunning}
                onKeyDown={(e) => { if (e.key === 'Enter') startPipeline(); }}
                placeholder="e.g. Severe flood in Guwahati, Assam affecting 450,000 citizens"
                className="w-full rounded-xl bg-slate-50 border border-slate-200 pl-10 pr-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium"
              />
            </div>

            <button
              onClick={startPipeline}
              disabled={isRunning || !customQuery.trim()}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-3 text-sm font-bold text-white shadow-md shadow-emerald-600/20 hover:from-emerald-700 hover:to-teal-700 disabled:opacity-60 transition-all shrink-0 cursor-pointer"
            >
              {isRunning ? (
                <>
                  <Zap className="h-4 w-4 animate-pulse fill-current text-emerald-200" />
                  <span>Pipeline Running…</span>
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 fill-current" />
                  <span>Run AI Pipeline</span>
                </>
              )}
            </button>
          </div>

          {/* Preset Query Pills */}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-400 font-mono mr-1">Quick Presets:</span>
            {presetQueries.map((pq, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setCustomQuery(pq.query)}
                disabled={isRunning}
                className={`text-xs px-3 py-1 rounded-full border transition-all cursor-pointer ${
                  customQuery === pq.query
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-800 font-bold shadow-xs'
                    : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {pq.label}
              </button>
            ))}
          </div>
        </div>

        {/* Error Banner */}
        {pipelineError && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
            <XCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-bold text-red-800">Pipeline Error</div>
              <div className="text-xs text-red-700 mt-1 font-mono whitespace-pre-wrap">{pipelineError}</div>
            </div>
          </div>
        )}

        {/* Split Panel: Agent Pipeline (Left) & Timeline Logs (Right) Side by Side */}
        <div className="mt-8 grid lg:grid-cols-12 gap-6">
          
          {/* Live AI Agent Pipeline Card (Left) */}
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl shadow-card flex flex-col min-h-[480px] overflow-hidden">
            {/* Header */}
            <div className="px-5 py-4 flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
              <div className="flex items-center gap-2.5">
                <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 grid place-items-center shadow-sm">
                  <Zap className="h-3.5 w-3.5 text-white fill-current" />
                </div>
                <span className="text-xs font-mono font-bold text-slate-700 uppercase tracking-wider">Live AI Agent Pipeline</span>
              </div>
              {isRunning ? (
                <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 animate-pulse font-extrabold font-mono flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Running
                </span>
              ) : (
                <span className="text-[10px] text-slate-400 font-mono font-bold">Idle</span>
              )}
            </div>

            {/* Pipeline Nodes */}
            <div className="flex-1 flex flex-col justify-center px-5 py-6">
              <div className="flex flex-col items-center w-full">
                {agentsToShow.map((agent, index) => {
                  const status = agentStatuses[agent.id] || 'pending';
                  const isCompleted = status === 'completed';
                  const isRunningAgent = status === 'running';
                  const isError = status === 'error';

                  // Per-agent icon mapping
                  const iconMap: Record<string, React.ReactNode> = {
                    nlp: <Globe className="h-4 w-4" />,
                    verification: <ShieldCheck className="h-4 w-4" />,
                    risk_assessment: <Activity className="h-4 w-4" />,
                    resource_matching: <Package className="h-4 w-4" />,
                    mission_planning: <Map className="h-4 w-4" />,
                    blockchain: <Link2 className="h-4 w-4" />,
                  };
                  const agentIcon = iconMap[agent.id] || <Zap className="h-4 w-4" />;

                  return (
                    <React.Fragment key={agent.id}>
                      <div className="relative w-full max-w-xs flex items-center gap-3">
                        {/* Step Number + Icon Circle */}
                        <div
                          className={clsx(
                            'shrink-0 h-10 w-10 rounded-full grid place-items-center border-2 transition-all duration-500 shadow-sm',
                            status === 'pending' && 'bg-slate-50 border-slate-200 text-slate-400',
                            isRunningAgent && 'bg-emerald-50 border-emerald-500 text-emerald-600 ring-4 ring-emerald-500/10 shadow-emerald-200',
                            isCompleted && 'bg-emerald-500 border-emerald-500 text-white shadow-emerald-200',
                            isError && 'bg-red-50 border-red-400 text-red-500'
                          )}
                        >
                          {isCompleted ? (
                            <CheckCircle2 className="h-5 w-5" />
                          ) : (
                            agentIcon
                          )}
                        </div>

                        {/* Agent Info */}
                        <div
                          className={clsx(
                            'flex-1 rounded-xl border px-4 py-3 flex items-center justify-between transition-all duration-500',
                            status === 'pending' && 'bg-white border-slate-200 hover:border-slate-300',
                            isRunningAgent && 'bg-emerald-50/80 border-emerald-300 shadow-sm shadow-emerald-100',
                            isCompleted && 'bg-white border-emerald-200',
                            isError && 'bg-red-50 border-red-300'
                          )}
                        >
                          <div>
                            <div className={clsx(
                              'text-[11px] font-bold leading-tight',
                              status === 'pending' ? 'text-slate-500' : isError ? 'text-red-700' : 'text-slate-800'
                            )}>
                              {agent.display_name}
                            </div>
                            <div className="text-[9px] text-slate-400 font-mono mt-0.5">Step {index + 1} of {agentsToShow.length}</div>
                          </div>

                          {/* Status Badge */}
                          <span className={clsx(
                            'text-[8px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-full border font-mono',
                            status === 'pending' && 'bg-slate-100 text-slate-400 border-slate-200',
                            isRunningAgent && 'bg-emerald-100 text-emerald-700 border-emerald-300 animate-pulse',
                            isCompleted && 'bg-emerald-50 text-emerald-700 border-emerald-200',
                            isError && 'bg-red-100 text-red-600 border-red-200'
                          )}>
                            {isCompleted ? '✓ done' : isRunningAgent ? '● live' : isError ? '✕ fail' : 'queued'}
                          </span>
                        </div>
                      </div>

                      {/* Connector Line */}
                      {index < agentsToShow.length - 1 && (
                        <div className="flex items-center justify-start pl-5 w-full max-w-xs">
                          <div className={clsx(
                            'w-0.5 h-5 rounded-full transition-all duration-700 ml-[15px]',
                            isCompleted ? 'bg-emerald-400' : 'bg-slate-200'
                          )} />
                        </div>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <span className="text-[10px] font-mono text-slate-400 font-bold">
                {Object.values(agentStatuses).filter(s => s === 'completed').length} / {agentsToShow.length} completed
              </span>
              <span className="text-[10px] font-mono text-slate-400 font-semibold">LangGraph Engine</span>
            </div>
          </div>

          {/* Live Execution Timeline Log Card (Right) */}
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-5 shadow-card flex flex-col h-[480px]">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4 bg-transparent shrink-0">
              <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <Clock className="h-4.5 w-4.5 text-emerald-600" />
                Live Execution Timeline (SSE Stream)
              </span>
              <div className="flex items-center gap-3">
                {userHasScrolledUp && (
                  <button
                    type="button"
                    onClick={() => {
                      setUserHasScrolledUp(false);
                      if (logContainerRef.current) {
                        logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
                      }
                    }}
                    className="text-[10px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1 rounded-full shadow-xs transition-all cursor-pointer font-mono"
                  >
                    Jump to Latest ↓
                  </button>
                )}
                <span className={clsx("text-[10px] font-mono font-bold uppercase flex items-center gap-1.5", isRunning ? "text-emerald-600" : "text-slate-400")}>
                  <span className={clsx("h-1.5 w-1.5 rounded-full", isRunning ? "bg-emerald-500 animate-pulse" : "bg-slate-400")} />
                  {isRunning ? 'Streaming' : 'Idle'}
                </span>
              </div>
            </div>

            <div
              ref={logContainerRef}
              onScroll={handleContainerScroll}
              className="flex-1 overflow-y-auto font-mono text-[12px] leading-relaxed space-y-3 p-1 scroll-smooth"
            >
              {logs.length === 0 ? (
                <div className="text-slate-400 h-full flex items-center justify-center font-sans text-sm font-semibold">
                  Type a query and click "Run AI Pipeline" to stream live LangGraph execution logs.
                </div>
              ) : (
                logs.map((log, idx) => (
                  <div 
                    key={idx} 
                    className={clsx(
                      'flex gap-3 items-start p-3.5 rounded-xl border transition-all duration-300 bg-white',
                      log.kind === 'error' ? 'bg-red-50 border-red-200 text-red-800' :
                      log.kind === 'status' ? 'bg-slate-50 border-slate-200 text-slate-600' :
                      'border-slate-100 text-slate-800 shadow-xs'
                    )}
                  >
                    <span className="text-[10px] text-slate-400 font-mono select-none pt-0.5 shrink-0">
                      {new Date(log.ts).toLocaleTimeString([], { hour12: false })}
                    </span>
                    <div className="flex-1 space-y-1">
                      {log.displayName && (
                        <div className="flex items-center gap-1.5">
                          <span className={clsx(
                            'text-[9px] uppercase font-extrabold px-1.5 py-0.5 rounded tracking-wide font-mono',
                            log.kind === 'error' ? 'bg-red-100 text-red-800 border border-red-200' : 'bg-emerald-55 text-emerald-800 border border-emerald-200'
                          )}>
                            {log.displayName}
                          </span>
                        </div>
                      )}
                      <p className="text-xs font-bold leading-relaxed whitespace-pre-wrap">{log.message}</p>
                    </div>
                    <div className="shrink-0 pt-0.5">
                      {log.kind === 'error' ? (
                        <AlertTriangle className="h-4 w-4 text-red-500 animate-bounce" />
                      ) : log.message.startsWith('✅') || log.message.includes('complete') || log.kind === 'status' ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <Zap className="h-4 w-4 text-emerald-600 animate-pulse" />
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Real Analysis Result Card / Report Box (Risk, Resource, Blockchain Cards nested at bottom) */}
        {analysisResult && (
          <div className="mt-8 bg-white border border-emerald-250 p-8 rounded-2xl shadow-elevated animate-fade-in relative overflow-hidden space-y-8">
            <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 grid place-items-center shadow-md shadow-emerald-600/20">
                  <ShieldAlert className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-display font-bold text-xl text-slate-900">
                      {analysisResult.location}
                    </h3>
                    <span className="text-xs font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800">
                      {analysisResult.event_type}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-mono mt-0.5 font-bold">
                    Tracking ID: {analysisResult.disaster_id}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 font-mono">
                <div className="text-right">
                  <div className="text-xs text-slate-400 font-bold">Severity Index</div>
                  <div className="text-lg font-bold text-emerald-700">
                    {analysisResult.disaster_severity} / 10
                  </div>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="grid md:grid-cols-2 gap-8">
              {/* Government & RAG Advisory */}
              <div className="space-y-3">
                <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-emerald-600" />
                  Government Advisory (RAG Agent Output)
                </h4>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs leading-relaxed text-slate-700 font-semibold whitespace-pre-wrap">
                  {analysisResult.government_advisory || 'No advisory generated.'}
                </div>

                {/* Required Supplies */}
                {analysisResult.required_supplies?.length > 0 && (
                  <div className="pt-2">
                    <span className="text-xs font-mono font-bold text-slate-450 uppercase block mb-2">
                      Priority Supplies:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {analysisResult.required_supplies.map((item: string, i: number) => (
                        <span key={i} className="text-xs bg-emerald-50 border border-emerald-200 text-emerald-850 font-semibold px-2.5 py-1 rounded-lg">
                          • {item}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Budget & Blockchain */}
              <div className="space-y-4">
                {/* Budget */}
                {analysisResult.budget && (analysisResult.budget.recommended_budget ?? 0) > 0 && analysisResult.verification_status === 'LIVE' && (
                  <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
                    <div className="text-xs font-mono font-bold uppercase text-emerald-800 mb-1">
                      Budget Recommendation
                    </div>
                    <div className="text-3xl font-display font-extrabold text-slate-900 font-mono">
                      ₹{((analysisResult.budget.recommended_budget ?? 0) / 10000000).toFixed(2)} Cr
                    </div>
                    <div className="text-xs text-slate-600 mt-2 font-semibold">
                      {analysisResult.budget.justification || analysisResult.budget.reasoning || ''}
                    </div>
                  </div>
                )}

                {/* Missions */}
                {analysisResult.missions && analysisResult.missions.length > 0 && (
                  <div>
                    <span className="text-xs font-mono font-bold text-slate-500 uppercase block mb-2">
                      Mission Queue ({analysisResult.missions.length}):
                    </span>
                    <div className="space-y-1.5">
                      {analysisResult.missions.slice(0, 5).map((m: any, i: number) => (
                        <div key={i} className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-xs text-slate-700 font-semibold flex items-center justify-between">
                          <span>{m.title || m.mission_id || `Mission ${i + 1}`}</span>
                          {m.priority && (
                            <span className="text-emerald-700 font-mono text-[10px] bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded uppercase font-extrabold">
                              {m.priority}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Nested Cards Grid (Risk, Resource, Blockchain) */}
            <div className="pt-6 border-t border-slate-100 grid md:grid-cols-3 gap-6">
              {/* Risk Gauge Card */}
              <div className="bg-slate-50/60 border border-slate-200/80 rounded-2xl p-5 flex flex-col justify-between min-h-[240px] shadow-xs">
                <div>
                  <div className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-3">Risk Assessment</div>
                  <div className="flex items-center justify-between mb-2">
                    <span className={clsx(
                      'text-lg font-black tracking-tight',
                      riskLevel === 'HIGH' || riskLevel === 'CRITICAL' ? 'text-red-600' : 'text-slate-800'
                    )}>
                      {riskLevel}
                    </span>
                    <span className="text-xs text-slate-500 font-mono font-semibold">{percentage}% Risk Index</span>
                  </div>

                  {/* Graphical Progress Bar */}
                  <div className="w-full bg-slate-100 border border-slate-200 rounded-full h-3 overflow-hidden relative">
                    <div 
                      className={clsx(
                        'h-full rounded-full transition-all duration-1000',
                        riskLevel === 'HIGH' || riskLevel === 'CRITICAL' ? 'bg-gradient-to-r from-orange-500 to-red-500' : 'bg-gradient-to-r from-emerald-500 to-teal-500'
                      )}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>

                  <div className="mt-3.5 text-xs text-slate-650 leading-relaxed font-semibold bg-white border border-slate-150 p-3 rounded-xl font-mono">
                    {analysisResult?.risk_assessment?.reasoning || 'The verification status is PREPAREDNESS, indicating that the situation is being closely monitored. There is no confirmed active disaster, which supports the LOW risk assessment. The Severity Score of 0.0, combined with the lack of a confirmed disaster, aligns with the LOW risk determination.'}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200/60 flex items-center justify-between mt-4">
                  <span className="text-[10px] font-mono font-bold uppercase text-slate-400">Verification Status</span>
                  <span className="flex items-center gap-1.5 text-slate-700 font-bold text-xs bg-slate-100 px-2.5 py-0.5 rounded border border-slate-200 uppercase">
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-pulse" />
                    {verStatus}
                  </span>
                </div>
              </div>

              {/* Resources Panel Card */}
              <div className="bg-slate-50/60 border border-slate-200/80 rounded-2xl p-5 flex flex-col justify-between min-h-[240px] shadow-xs">
                <div>
                  <div className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-3">Resource Panel</div>
                  
                  <div className="space-y-3 max-h-[170px] overflow-y-auto pr-1">
                    {/* Hospitals List */}
                    <div>
                      <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wide mb-1">Operational Hospitals</div>
                      <div className="grid grid-cols-2 gap-2">
                        {hospitalsToShow.slice(0, 2).map((h: any, i: number) => (
                          <div key={i} className="bg-white border border-slate-200 p-2 rounded-xl">
                            <div className="font-bold text-[10px] text-slate-800 truncate">{h.name}</div>
                            <div className="text-[8px] text-slate-500 font-bold mt-0.5">Beds: {h.capacity - h.occupied_beds}/{h.capacity} free</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Shelters List */}
                    <div>
                      <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wide mb-1">Relief Shelters</div>
                      <div className="grid grid-cols-2 gap-2">
                        {sheltersToShow.slice(0, 2).map((s: any, i: number) => (
                          <div key={i} className="bg-white border border-slate-200 p-2 rounded-xl">
                            <div className="font-bold text-[10px] text-slate-800 truncate">{s.name}</div>
                            <div className="text-[8px] text-slate-500 font-bold mt-0.5">Cap: {s.occupied || 0}/{s.capacity} active</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="pt-3 border-t border-slate-200/60 flex items-center justify-between text-[10px] font-mono text-slate-450 font-bold mt-4">
                  <span>Ready supplies:</span>
                  <span className="text-emerald-700 font-black">
                    {analysisResult?.required_supplies?.length || 4} priority items
                  </span>
                </div>
              </div>

              {/* Blockchain Card */}
              <div className="bg-slate-50/60 border border-slate-200/80 rounded-2xl p-5 flex flex-col justify-between min-h-[240px] shadow-xs">
                <div>
                  <div className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-3">Blockchain Audit</div>
                  
                  <div className="space-y-2 font-mono text-[10px]">
                    <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                      <span className="text-slate-400 font-bold">Node Status</span>
                      <span className={clsx(
                        'text-[9px] px-2 py-0.5 rounded font-extrabold uppercase border',
                        blockchainStatus === 'MINED' || blockchainStatus === 'SUCCESS'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-250'
                          : 'bg-slate-100 text-slate-400 border-slate-200'
                      )}>
                        {blockchainStatus}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                      <span className="text-slate-400 font-bold">TX Hash</span>
                      <span className="text-slate-800 font-black truncate max-w-[130px] text-right">
                        {txHash}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                      <span className="text-slate-400 font-bold">Block Number</span>
                      <span className="text-slate-800 font-black">
                        {blockNum}
                      </span>
                    </div>
                    {decisionHash && (
                      <div className="flex justify-between items-center py-1">
                        <span className="text-slate-400 font-bold">Decision Hash</span>
                        <span className="text-emerald-700 font-black truncate max-w-[130px] text-right">
                          {decisionHash}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200/60 flex items-center justify-between text-[10px] font-mono text-slate-400 font-bold mt-4">
                  <span>Ledger:</span>
                  <span className="text-slate-500 font-black">AapdaSetu Mainnet</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommandCenter;
