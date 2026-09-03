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
import { generateTxHash } from '../utils';

// Session-persistent mock database
let mockDisasters: DisasterReport[] = [
  {
    id: 'd-101',
    title: 'Teesta River Flash Flood',
    description: 'Sudden cloudburst triggers severe flash flooding in the Teesta River basin, washing away local road linkages and cutting off community shelters.',
    type: 'flood',
    severity: 'critical',
    status: 'assigned',
    locationName: 'North Sikkim, Sikkim',
    coordinates: { lat: 27.67, lng: 88.62 },
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(), // 2 hrs ago
    citizenSubmitted: false,
  },
  {
    id: 'd-102',
    title: 'Bhuj Seismic Activity',
    description: 'Seismic tremors measuring 5.4 on the Richter scale recorded near the Bhuj region. Mild damage reported on older masonry infrastructure.',
    type: 'earthquake',
    severity: 'high',
    status: 'verified',
    locationName: 'Kutch District, Gujarat',
    coordinates: { lat: 23.25, lng: 69.66 },
    timestamp: new Date(Date.now() - 3600000 * 6).toISOString(), // 6 hrs ago
    citizenSubmitted: true,
    reporterName: 'Amit Patel',
  }
];

let mockSystemHealth: SystemComponent[] = [
  { id: 'sc-1', name: 'Coordinator Agent', status: 'healthy', latency: '42ms', type: 'agent', version: 'v2.4.1' },
  { id: 'sc-2', name: 'Flood Agent', status: 'healthy', latency: '110ms', type: 'agent', version: 'v1.8.0' },
  { id: 'sc-3', name: 'Earthquake Agent', status: 'healthy', latency: '95ms', type: 'agent', version: 'v1.8.0' },
  { id: 'sc-4', name: 'Risk Agent', status: 'healthy', latency: '180ms', type: 'agent', version: 'v2.0.2' },
  { id: 'sc-5', name: 'Mission Planner Agent', status: 'healthy', latency: '220ms', type: 'agent', version: 'v2.1.0' },
  { id: 'sc-6', name: 'Weather API (IMD)', status: 'healthy', latency: '18ms', type: 'external' },
  { id: 'sc-7', name: 'USGS API Feed', status: 'healthy', latency: '24ms', type: 'external' },
  { id: 'sc-8', name: 'ReliefWeb Portal API', status: 'warning', latency: '420ms', type: 'external' },
  { id: 'sc-9', name: 'OpenStreetMap Tiles', status: 'healthy', latency: '12ms', type: 'external' },
  { id: 'sc-10', name: 'WorldPop Registry API', status: 'healthy', latency: '85ms', type: 'external' }
];

let mockBudgets: BudgetProposal[] = [
  { id: 'b-1', disaster: 'Teesta River Flash Flood', requested: 45000000, recommended: 38000000, approved: 38000000, status: 'approved', timestamp: new Date(Date.now() - 3600000 * 1).toISOString() },
  { id: 'b-2', disaster: 'Bhuj Seismic Activity', requested: 12000000, recommended: 9500000, approved: 0, status: 'pending', timestamp: new Date(Date.now() - 3600000 * 5).toISOString() }
];

let mockBlockchainTxs: BlockchainTx[] = [
  {
    hash: '0x3f6e12a890db7c5f891b2c45def789a9c8b824150df789a9cfb824150df7812e',
    block: 4928172,
    timestamp: new Date(Date.now() - 3600000 * 1).toISOString(),
    transactionType: 'BUDGET_APPROVAL',
    payload: { disasterId: 'd-101', severity: 'critical', allocatedFunds: 38000000, decisionReasoning: 'Government verified and signed allocation code.' }
  },
  {
    hash: '0xa415fb8241d7890def789a9c8b824150df789a9cfb824150df7812e3f6e12a89',
    block: 4928165,
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    transactionType: 'DISASTER_DETECTION',
    payload: { disasterId: 'd-101', disasterType: 'flood', severity: 'critical', decisionReasoning: 'Telemetry validated through GloFAS and regional water gauge sensors.' }
  },
  {
    hash: '0x9c8b824150df789a9cfb824150df7812e3f6e12a890db7c5f891b2c45def789a',
    block: 4928120,
    timestamp: new Date(Date.now() - 3600000 * 6).toISOString(),
    transactionType: 'DISASTER_DETECTION',
    payload: { disasterId: 'd-102', disasterType: 'earthquake', severity: 'high', decisionReasoning: 'USGS triggers 5.4 magnitude sensor reading. Citizen photo verified.' }
  }
];

let mockResourceCamps: ResourceCamp[] = [
  {
    id: 'rc-1',
    name: 'NDRF Base Camp Hospital',
    type: 'hospital',
    locationName: 'North Sikkim Foothills',
    distance: '12.4 km',
    eta: '25 mins',
    availability: '18 beds, 4 surgeons',
    capacity: '80%',
    coordinates: { lat: 27.52, lng: 88.59 }
  },
  {
    id: 'rc-2',
    name: 'Sikkim Relief Shelter Point',
    type: 'shelter',
    locationName: 'Mangan Town Hall',
    distance: '18.2 km',
    eta: '42 mins',
    availability: '120 slots open',
    capacity: '60%',
    coordinates: { lat: 27.50, lng: 88.52 }
  },
  {
    id: 'rc-3',
    name: 'Central Food Distribution Point 3',
    type: 'food',
    locationName: 'Gangtok Logistics Hub',
    distance: '29.5 km',
    eta: '55 mins',
    availability: '8,000 dry rations kits',
    capacity: '45%',
    coordinates: { lat: 27.33, lng: 88.61 }
  },
  {
    id: 'rc-4',
    name: 'SDRF Medical Camp Alpha',
    type: 'medical',
    locationName: 'Chungthang Junction',
    distance: '6.1 km',
    eta: '12 mins',
    availability: '3 pediatricians, trauma kits',
    capacity: '92%',
    coordinates: { lat: 27.60, lng: 88.64 }
  }
];

let systemLogs: LogMessage[] = [
  { timestamp: new Date(Date.now() - 600000).toISOString(), level: 'info', agent: 'System', message: 'AapdaSetu Core Engine successfully bootstrapped.' },
  { timestamp: new Date(Date.now() - 550000).toISOString(), level: 'info', agent: 'Coordinator', message: 'Scanning data streams: IMD satellite imagery, USGS feed, and RSS news feeds.' },
  { timestamp: new Date(Date.now() - 480000).toISOString(), level: 'success', agent: 'Coordinator', message: 'No new anomaly detected in past 10 minutes scan cycle.' },
  { timestamp: new Date(Date.now() - 300000).toISOString(), level: 'warn', agent: 'System', message: 'ReliefWeb Portal API experiencing elevated response latency (420ms).' }
];


// API functions wrapping operations
export const api = {
  // Disasters
  getDisasters: async (): Promise<DisasterReport[]> => {
    return [...mockDisasters];
  },
  
  addDisaster: async (report: Omit<DisasterReport, 'id' | 'timestamp' | 'status'>): Promise<DisasterReport> => {
    const newReport: DisasterReport = {
      ...report,
      id: `d-${Date.now()}`,
      status: 'submitted',
      timestamp: new Date().toISOString()
    };
    mockDisasters = [newReport, ...mockDisasters];
    
    // Add to logs
    systemLogs = [
      {
        timestamp: new Date().toISOString(),
        level: 'info',
        agent: 'Citizen Portal',
        message: `New incident reported: "${report.title}" at ${report.locationName}. Queued for coordinator inspection.`
      },
      ...systemLogs
    ];
    return newReport;
  },

  updateDisasterStatus: async (id: string, status: 'submitted' | 'verified' | 'assigned' | 'dispatched' | 'completed'): Promise<DisasterReport> => {
    const disasterIndex = mockDisasters.findIndex(d => d.id === id);
    if (disasterIndex === -1) throw new Error('Disaster report not found');
    
    const updated = { ...mockDisasters[disasterIndex], status };
    mockDisasters[disasterIndex] = updated;

    // Trigger log update
    systemLogs = [
      {
        timestamp: new Date().toISOString(),
        level: status === 'verified' ? 'success' : 'info',
        agent: 'System',
        message: `Disaster ${id} status transition to [${status.toUpperCase()}].`
      },
      ...systemLogs
    ];
    return updated;
  },

  // Dashboard KPI Metrics
  getDashboardMetrics: async (): Promise<DashboardMetrics> => {
    const active = mockDisasters.filter(d => d.status !== 'completed').length;
    const totalAllocated = mockBudgets.reduce((acc, curr) => acc + curr.approved, 0);
    const totalRequested = mockBudgets.reduce((acc, curr) => acc + curr.requested, 0);
    
    return {
      activeMissions: active,
      riskScore: 78.4,
      hospitalsCount: mockResourceCamps.filter(r => r.type === 'hospital').length,
      sheltersCount: mockResourceCamps.filter(r => r.type === 'shelter').length,
      medicalTeams: 12,
      budgetTotal: totalRequested,
      budgetSpent: totalAllocated
    };
  },

  // Resources
  getResourceCamps: async (): Promise<ResourceCamp[]> => {
    return [...mockResourceCamps];
  },

  // Budgets
  getBudgetProposals: async (): Promise<BudgetProposal[]> => {
    return [...mockBudgets];
  },

  approveBudget: async (id: string): Promise<BudgetProposal> => {
    const budgetIndex = mockBudgets.findIndex(b => b.id === id);
    if (budgetIndex === -1) throw new Error('Budget proposal not found');

    const updated: BudgetProposal = { ...mockBudgets[budgetIndex], approved: mockBudgets[budgetIndex].recommended, status: 'approved' };
    mockBudgets[budgetIndex] = updated;

    // Create blockchain record for approval
    const txHash = generateTxHash();
    const newBlock = mockBlockchainTxs.length > 0 ? mockBlockchainTxs[0].block + 1 : 100000;
    
    const blockchainTx: BlockchainTx = {
      hash: txHash,
      block: newBlock,
      timestamp: new Date().toISOString(),
      transactionType: 'BUDGET_APPROVAL',
      payload: {
        disasterId: `d-${Date.now()}`,
        severity: 'high',
        allocatedFunds: updated.approved,
        decisionReasoning: `Approved budget allocation of ${updated.approved} INR for relief operations.`
      }
    };
    mockBlockchainTxs = [blockchainTx, ...mockBlockchainTxs];

    // Find and update disaster status
    const disasterIndex = mockDisasters.findIndex(d => d.title === updated.disaster);
    if (disasterIndex !== -1) {
      mockDisasters[disasterIndex].status = 'dispatched';
    }

    // Add to logs
    systemLogs = [
      {
        timestamp: new Date().toISOString(),
        level: 'success',
        agent: 'Blockchain Oracle',
        message: `Budget approval recorded on-chain. TX: ${txHash.substring(0, 10)}... | Block: #${newBlock}`
      },
      {
        timestamp: new Date().toISOString(),
        level: 'info',
        agent: 'Coordinator',
        message: `Budget approved for ${updated.disaster}. Dispatching emergency packages.`
      },
      ...systemLogs
    ];

    return updated;
  },

  // System Components
  getSystemHealth: async (): Promise<SystemComponent[]> => {
    return [...mockSystemHealth];
  },

  // Reports
  getReports: async () => {
    return [
      { id: 'rep-01', title: 'Teesta Valley Flash Flood Impact Study', author: 'National Disaster Management Authority (NDMA)', date: '2026-07-10', category: 'Government', size: '2.4 MB' },
      { id: 'rep-02', title: 'Sundarbans River Inundation & Hydrology Model', author: 'India Meteorological Department (IMD)', date: '2026-07-12', category: 'Government', size: '4.1 MB' },
      { id: 'rep-03', title: 'Kutch Region Relief Requirements Analysis', author: 'SDRF Gujarat Command', date: '2026-07-15', category: 'Government', size: '1.8 MB' },
      { id: 'rep-04', title: 'Humanitarian Assistance Gap Assessment: West Bengal', author: 'UN OCHA Joint Assessment Group', date: '2026-07-16', category: 'NGO', size: '3.2 MB' },
      { id: 'rep-05', title: 'Post-Flood Sanitation & Disease Vector Report', author: 'Red Cross India', date: '2026-07-17', category: 'NGO', size: '1.5 MB' },
      { id: 'rep-06', title: 'Citizen Crowdsourced Road Closure Maps - Sikkim', author: 'AapdaSetu Public Node', date: '2026-07-18', category: 'Public', size: '920 KB' }
    ];
  },

  // Blockchain Transactions
  getBlockchainTransactions: async (): Promise<BlockchainTx[]> => {
    return [...mockBlockchainTxs];
  },

  // System Logs
  getLogs: async (): Promise<LogMessage[]> => {
    return [...systemLogs];
  },
};

// ─── Real Pipeline Streaming via SSE ─────────────────────────────────────────

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL !== undefined ? import.meta.env.VITE_BACKEND_URL : 'http://127.0.0.1:8000';

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
  // pipeline_complete carries the full result
  data?: AnalyzeResult;
  // error carries details
  error?: string;
}

/**
 * Opens an SSE stream to the Python backend's /analyze/stream endpoint.
 * Calls onEvent for each server-sent event (agent starting, completing, etc.)
 * Returns a cleanup function to abort the stream.
 */
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
        onEvent({
          type: 'error',
          error: `Backend error (${res.status})`,
          message: errText,
        });
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

        // Parse SSE frames from the buffer
        const frames = buffer.split('\n\n');
        buffer = frames.pop() || ''; // keep incomplete frame in buffer

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
              onEvent({
                type: 'pipeline_start',
                agents: parsed.agents,
                message: `Pipeline started for ${parsed.disaster_type} in ${parsed.location}`,
              });
            } else if (eventType === 'agent_status') {
              onEvent({
                type: 'agent_status',
                agent: parsed.agent,
                display_name: parsed.display_name,
                status: parsed.status,
                message: parsed.message,
                elapsed_seconds: parsed.elapsed_seconds,
              });
            } else if (eventType === 'pipeline_complete') {
              onEvent({
                type: 'pipeline_complete',
                data: parsed as AnalyzeResult,
              });
            } else if (eventType === 'error') {
              onEvent({
                type: 'error',
                error: parsed.error,
                message: parsed.message,
              });
            }
          } catch {
            // Skip unparseable frames
          }
        }
      }
    } catch (err: any) {
      if (err.name === 'AbortError') return; // intentional cancel
      onEvent({
        type: 'error',
        error: 'Connection Failed',
        message: `Could not connect to Python backend at ${BACKEND_URL}. Make sure the server is running: python -m uvicorn backend.main:app --port 8000`,
      });
    }
  })();

  return () => controller.abort();
};

