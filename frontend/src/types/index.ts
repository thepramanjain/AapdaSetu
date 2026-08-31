export type DisasterType = 'flood' | 'earthquake';

export type SeverityLevel = 'critical' | 'high' | 'medium' | 'low';

export type ReportStatus = 'submitted' | 'verified' | 'assigned' | 'dispatched' | 'completed';

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface DisasterReport {
  id: string;
  title: string;
  description: string;
  type: DisasterType;
  severity: SeverityLevel;
  status: ReportStatus;
  locationName: string;
  coordinates: Coordinates;
  timestamp: string;
  citizenSubmitted: boolean;
  reporterName?: string;
  imageUrl?: string;
}

export interface SystemComponent {
  id: string;
  name: string;
  status: 'healthy' | 'warning' | 'offline';
  latency: string;
  type: 'agent' | 'external';
  version?: string;
}

export interface LogMessage {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'success';
  agent: string;
  message: string;
}

export interface NodeStatus {
  id: string;
  name: string;
  status: 'waiting' | 'running' | 'completed';
  type: string;
}

export interface ResourceCamp {
  id: string;
  name: string;
  type: 'hospital' | 'shelter' | 'food' | 'medical';
  locationName: string;
  distance: string;
  eta: string;
  availability: string;
  capacity: string;
  coordinates: Coordinates;
}

export interface BudgetProposal {
  id: string;
  disaster: string;
  requested: number;
  recommended: number;
  approved: number;
  status: 'pending' | 'approved' | 'rejected';
  timestamp: string;
}

export interface BlockchainTx {
  hash: string;
  block: number;
  timestamp: string;
  transactionType: string;
  payload: {
    disasterId?: string;
    disasterType?: string;
    severity?: string;
    decisionReasoning?: string;
    allocatedFunds?: number;
  };
}

export interface DashboardMetrics {
  activeMissions: number;
  riskScore: number;
  hospitalsCount: number;
  sheltersCount: number;
  medicalTeams: number;
  budgetTotal: number;
  budgetSpent: number;
}

export interface AnalyzeResult {
  disaster_id: string;
  event_type: string;
  location: string;
  coordinates: { latitude: number; longitude: number };
  disaster_severity: number;
  government_advisory: string;
  nearby_shelters: any[];
  nearby_hospitals: any[];
  safe_route: any;
  required_supplies: string[];
  emergency_contacts: Record<string, string>;
  risk_assessment?: any;
  missions?: any[];
  budget?: any;
  blockchain?: {
    transaction_hash: string;
    status: string;
    block_number: number;
    explorer_url: string;
    timestamp: string;
    blockchain_status?: string;
    ai_decision_hash?: string;
  };
  verification_status?: string;
}
