import type { 
  DisasterReport, 
  SystemComponent, 
  LogMessage, 
  BudgetProposal, 
  BlockchainTx, 
  DashboardMetrics,
  ResourceCamp,
  AnalyzeResult
} from '../types';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL !== undefined ? import.meta.env.VITE_BACKEND_URL : 'http://127.0.0.1:8000';

export const api = {
  getDisasters: async (): Promise<DisasterReport[]> => {
    const res = await fetch(`${BACKEND_URL}/api/disasters`);
    if (!res.ok) throw new Error('Failed to fetch disasters');
    const data = await res.json();
    return data.map((d: any) => ({
      id: d.id,
      title: d.name,
      description: d.description,
      type: d.type,
      severity: d.severity,
      status: d.status,
      locationName: d.state,
      coordinates: { lat: d.lat, lng: d.lng },
      timestamp: d.reportedAt || new Date().toISOString(),
      citizenSubmitted: d.confidence === 0
    }));
  },
  
  addDisaster: async (report: Omit<DisasterReport, 'id' | 'timestamp' | 'status'>): Promise<DisasterReport> => {
    const res = await fetch(`${BACKEND_URL}/api/disasters/citizen`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: report.title,
        type: report.type,
        severity: report.severity,
        population: 0,
        state: report.locationName,
        description: report.description
      })
    });
    if (!res.ok) throw new Error('Failed to submit citizen report');
    const data = await res.json();
    return {
      ...report,
      id: data.id,
      status: data.status,
      timestamp: new Date().toISOString()
    };
  },

  updateDisasterStatus: async (id: string, status: 'submitted' | 'verified' | 'assigned' | 'dispatched' | 'completed'): Promise<DisasterReport> => {
    if (status === 'verified' || status === 'assigned') {
        const res = await fetch(`${BACKEND_URL}/api/disasters/${id}/publish`, { method: 'POST' });
        if (!res.ok) throw new Error('Failed to update disaster status');
    }
    return { id, status } as any;
  },

  getDashboardMetrics: async (): Promise<DashboardMetrics> => {
    const [disastersRes, budgetsRes] = await Promise.all([
        fetch(`${BACKEND_URL}/api/disasters`),
        fetch(`${BACKEND_URL}/api/fund-requests`)
    ]);
    
    let active = 0;
    let totalRequested = 0;
    let totalAllocated = 0;

    if (disastersRes.ok) {
        const disasters = await disastersRes.json();
        active = disasters.filter((d: any) => d.status !== 'completed').length;
    }
    if (budgetsRes.ok) {
        const budgets = await budgetsRes.json();
        totalRequested = budgets.reduce((acc: number, curr: any) => acc + curr.amount, 0);
        totalAllocated = budgets.filter((b: any) => b.status === 'blockchain_completed' || b.status === 'approved')
                                .reduce((acc: number, curr: any) => acc + curr.amount, 0);
    }

    return {
      activeMissions: active,
      riskScore: 78.4,
      hospitalsCount: 4,
      sheltersCount: 2,
      medicalTeams: 12,
      budgetTotal: totalRequested,
      budgetSpent: totalAllocated
    };
  },

  getResourceCamps: async (): Promise<ResourceCamp[]> => {
    return [
      { id: 'rc-1', name: 'NDRF Base Camp Hospital', type: 'hospital', locationName: 'North Sikkim Foothills', distance: '12.4 km', eta: '25 mins', availability: '18 beds, 4 surgeons', capacity: '80%', coordinates: { lat: 27.52, lng: 88.59 } },
      { id: 'rc-2', name: 'Sikkim Relief Shelter Point', type: 'shelter', locationName: 'Mangan Town Hall', distance: '18.2 km', eta: '42 mins', availability: '120 slots open', capacity: '60%', coordinates: { lat: 27.50, lng: 88.52 } }
    ];
  },

  getBudgetProposals: async (): Promise<BudgetProposal[]> => {
    const res = await fetch(`${BACKEND_URL}/api/fund-requests`);
    if (!res.ok) throw new Error('Failed to fetch budgets');
    const data = await res.json();
    return data.map((d: any) => ({
        id: d.id,
        disaster: d.disasterName,
        requested: d.amount,
        recommended: d.amount,
        approved: d.status === 'blockchain_completed' ? d.amount : 0,
        status: d.status === 'blockchain_completed' ? 'approved' : d.status,
        timestamp: d.timestamp
    }));
  },

  approveBudget: async (id: string): Promise<BudgetProposal> => {
    const res = await fetch(`${BACKEND_URL}/api/fund-requests/${id}/approve`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to approve budget');
    return { id, status: 'approved' } as any;
  },

  getSystemHealth: async (): Promise<SystemComponent[]> => {
    const res = await fetch(`${BACKEND_URL}/api/system-health`);
    if (!res.ok) throw new Error('Failed to fetch system health');
    return res.json();
  },

  getReports: async () => {
    return [
      { id: 'rep-01', title: 'Teesta Valley Flash Flood Impact Study', author: 'NDMA', date: '2026-07-10', category: 'Government', size: '2.4 MB' }
    ];
  },

  getBlockchainTransactions: async (): Promise<BlockchainTx[]> => {
    const res = await fetch(`${BACKEND_URL}/api/blockchain-transactions`);
    if (!res.ok) throw new Error('Failed to fetch blockchain transactions');
    const data = await res.json();
    return data.map((d: any) => ({
        hash: d.hash,
        block: d.block,
        timestamp: d.timestamp,
        transactionType: 'BUDGET_APPROVAL',
        payload: { disasterId: d.id, decisionReasoning: d.purpose }
    }));
  },

  getLogs: async (): Promise<LogMessage[]> => {
    const res = await fetch(`${BACKEND_URL}/api/logs`);
    if (!res.ok) throw new Error('Failed to fetch system logs');
    return res.json();
  },
};

export interface PipelineAgent {
  id: string;
  display_name: string;
}

export interface PipelineEvent {
  type: 'pipeline_start' | 'agent_status' | 'pipeline_complete' | 'error';
  agents?: PipelineAgent[];
  agent?: string;
  display_name?: string;
  status?: 'running' | 'completed' | 'error';
  message?: string;
  elapsed_seconds?: number;
  data?: AnalyzeResult;
  error?: string;
}

export const streamPipeline = (
  query: string,
  onEvent: (event: PipelineEvent) => void
): (() => void) => {
  const controller = new AbortController();

  (async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/analyze/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const errText = await res.text();
        onEvent({ type: 'error', error: `Backend error (${res.status})`, message: errText });
        return;
      }

      const reader = res.body?.getReader();
      if (!reader) {
        onEvent({ type: 'error', error: 'No response body', message: 'SSE stream unavailable' });
        return;
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const frames = buffer.split('\n\n');
        buffer = frames.pop() || '';

        for (const frame of frames) {
          if (!frame.trim()) continue;

          let eventType = 'message';
          let dataStr = '';

          for (const line of frame.split('\n')) {
            if (line.startsWith('event: ')) {
              eventType = line.slice(7).trim();
            } else if (line.startsWith('data: ')) {
              dataStr += line.slice(6);
            }
          }

          if (!dataStr) continue;

          try {
            const parsed = JSON.parse(dataStr);
            if (eventType === 'pipeline_start') {
              onEvent({ type: 'pipeline_start', agents: parsed.agents, message: `Pipeline started` });
            } else if (eventType === 'agent_status') {
              onEvent({ type: 'agent_status', agent: parsed.agent, display_name: parsed.display_name, status: parsed.status, message: parsed.message, elapsed_seconds: parsed.elapsed_seconds });
            } else if (eventType === 'pipeline_complete') {
              onEvent({ type: 'pipeline_complete', data: parsed as AnalyzeResult });
            } else if (eventType === 'error') {
              onEvent({ type: 'error', error: parsed.error, message: parsed.message });
            }
          } catch {
            // Skip unparseable frames
          }
        }
      }
    } catch (err: any) {
      if (err.name === 'AbortError') return;
      onEvent({ type: 'error', error: 'Connection Failed', message: `Could not connect to Python backend at ${BACKEND_URL}` });
    }
  })();

  return () => controller.abort();
};
