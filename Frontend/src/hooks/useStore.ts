import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface MissionTask {
  id: string;
  name: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'In Progress' | 'Deployed' | 'Completed' | 'Pending';
  eta: string;
}

export interface ResourceCamp {
  name: string;
  availability: string;
  distance: string;
  coordinates: [number, number];
}

export interface Disaster {
  id: string;
  name: string;
  type: 'flood' | 'earthquake';
  lat: number;
  lng: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  population: number;
  state: string;
  status: 'reported' | 'analyzing' | 'preparedness' | 'published';
  verificationStatus: 'Pending' | 'Verified';
  confidence: number;
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  description: string;
  reportMarkdown: {
    government: string;
    ngo: string;
    public: string;
  };
  missionPlan: MissionTask[];
  hospitals: ResourceCamp[];
  shelters: ResourceCamp[];
  reportedAt?: string;
}

export interface FundRequest {
  id: string;
  ngo: string;
  amount: number;
  purpose: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'submitted' | 'review' | 'approved' | 'blockchain_completed' | 'rejected';
  reason?: string;
  requiredResources?: string;
  supportingNotes?: string;
  disasterId: string;
  disasterName: string;
  timestamp: string;
  txHash?: string;
}

export interface BlockchainTx {
  hash: string;
  block: number;
  timestamp: string;
  amount: number;
  ngo: string;
  purpose: string;
  status: 'confirmed' | 'pending';
}

export interface RegisteredUser {
  fullName: string;
  email: string;
  role: 'government' | 'ngo';
  agencyName: string;
  state: string;
  walletAddress: string;
}

export interface StoreState {
  role: 'government' | 'ngo' | null;
  setRole: (role: 'government' | 'ngo' | null) => void;
  logout: () => void;
  disasters: Disaster[];
  fundRequests: FundRequest[];
  blockchainTxs: BlockchainTx[];
  activeIncidentId: string | null;
  setActiveIncidentId: (id: string | null) => void;
  
  registeredUser: RegisteredUser | null;
  registerUser: (user: RegisteredUser) => void;
  
  // Incident analysis state
  analysisProgress: number; // 0 to 100
  analysisLogs: string[];
  analysisActiveNode: string | null;
  isAnalyzing: boolean;
  analysisOutcome: 'PREPAREDNESS' | 'LIVE' | null;
  
  // Actions
  addDisaster: (disaster: Omit<Disaster, 'id' | 'lat' | 'lng' | 'status' | 'verificationStatus' | 'reportMarkdown' | 'missionPlan' | 'hospitals' | 'shelters'>) => void;
  runAnalysis: (description: string) => Promise<Disaster>;
  publishIncident: (id: string) => void;
  createFundRequest: (req: Omit<FundRequest, 'id' | 'timestamp' | 'status' | 'txHash'>) => void;
  approveFundRequest: (id: string, customAmount?: number) => void;
  rejectFundRequest: (id: string) => void;
  resetAnalysisState: () => void;
  fetchInitialData: () => Promise<void>;
}

const initialDisasters: Disaster[] = [
  {
    id: 'd-101',
    name: 'Brahmaputra River Flash Flood',
    type: 'flood',
    lat: 26.14,
    lng: 91.73,
    severity: 'critical',
    population: 480000,
    state: 'Assam',
    status: 'published',
    verificationStatus: 'Verified',
    confidence: 94,
    riskLevel: 'Critical',
    description: 'Sudden high discharge of water from the Upper Brahmaputra basin triggered severe inundations across Dibrugarh and Barpeta. Multiple road connectivity networks collapsed.',
    reportMarkdown: {
      government: `# AapdaSetu Govt Incident Report — Brahmaputra Flood
- **Severity Level:** CRITICAL
- **Confidence Rating:** 94%
- **Total Population Exposed:** ~480,000 citizens
- **Infrastructure Impact:** Dibrugarh-Guwahati road cutoff. 3 bridges washed out.
- **Priority Recommendation:** Deploy SDRF teams and request air support.`,
      ngo: `# NGO Coordination Brief — Brahmaputra Flood
- **Immediate Supplies Needed:** 12,000 dry ration packets, 40,000 water chlorine tablets.
- **Sanitation Risk:** High risk of waterborne diseases. Mobilize Red Cross and regional NGO volunteers.
- **Access Route:** Via Mangan bypass road.`,
      public: `# Public Safety Advisory — Brahmaputra Flood
- **Action Required:** Evacuate to higher areas immediately. Do not cross flooded paths.
- **Emergency Helpline:** 1070 / 1078
- **Safe Shelters:** Barpeta High School & Mangan Community Center.`
    },
    missionPlan: [
      { id: 'm-1', name: 'Evacuate Dibrugarh Sector-4', priority: 'High', status: 'Completed', eta: '0 mins' },
      { id: 'm-2', name: 'Deploy 15 Rescue Boats to Barpeta', priority: 'High', status: 'Deployed', eta: '12 mins' },
      { id: 'm-3', name: 'Setup Dry Food Distribution point', priority: 'Medium', status: 'In Progress', eta: '45 mins' }
    ],
    hospitals: [
      { name: 'NDRF Base Hospital Alpha', availability: '14 Beds, 3 Trauma Surgeons', distance: '8.4 km', coordinates: [26.18, 91.76] },
      { name: 'Guwahati Medical College', availability: '42 Beds, 12 Emergency Staff', distance: '14.2 km', coordinates: [26.12, 91.70] }
    ],
    shelters: [
      { name: 'Barpeta Town Hall Shelter', availability: '120 Slots Open', distance: '4.1 km', coordinates: [26.15, 91.71] },
      { name: 'Mangan Sports Complex', availability: '250 Slots Open', distance: '7.8 km', coordinates: [26.13, 91.75] }
    ]
  },
  {
    id: 'd-102',
    name: 'Teesta River Preparedness Action',
    type: 'flood',
    lat: 27.67,
    lng: 88.62,
    severity: 'medium',
    population: 32000,
    state: 'Sikkim',
    status: 'preparedness',
    verificationStatus: 'Verified',
    confidence: 88,
    riskLevel: 'Medium',
    description: 'Elevated water discharge detected upstream in North Sikkim. AI recommends early alert status. Water level within control but rising.',
    reportMarkdown: {
      government: `# Preparedness Alert Briefing — Teesta River
- **Risk Level:** MEDIUM (PREPAREDNESS ONLY)
- **Confidence Rating:** 88%
- **Status:** Blockchain release skipped. Government-only monitoring activated.
- **Action Plan:** Regular hourly monitoring of telemetry from GloFAS gauge nodes.`,
      ngo: ``,
      public: `# Preparedness Safety Alert — Teesta River
- **Situation:** Water level rising due to rains.
- **Advice:** Avoid low-lying river banks.`
    },
    missionPlan: [
      { id: 'm-4', name: 'Telemetry Calibration Check', priority: 'Medium', status: 'Completed', eta: '0 mins' },
      { id: 'm-5', name: 'SDRF Patrol Alert System', priority: 'Low', status: 'Completed', eta: '0 mins' }
    ],
    hospitals: [
      { name: 'Sikkim District Clinic', availability: '5 Beds, 1 Doctor', distance: '12 km', coordinates: [27.69, 88.63] }
    ],
    shelters: [
      { name: 'Chungthang School shelter', availability: '400 Slots Open', distance: '2.5 km', coordinates: [27.66, 88.61] }
    ]
  },
  {
    id: 'd-103',
    name: '2024 Assam Flood Simulation',
    type: 'flood',
    lat: 26.14,
    lng: 91.73,
    severity: 'critical',
    population: 650000,
    state: 'Assam',
    status: 'reported', // Confirmed but NOT published yet!
    verificationStatus: 'Verified',
    confidence: 98,
    riskLevel: 'Critical',
    description: 'Historical telemetry logs verify the high-risk river levels. Ready for NGO relief task forces.',
    reportMarkdown: {
      government: `# 2024 Assam Flood AI Intel Report
- **Severity Level:** CRITICAL
- **Confidence Rating:** 98%
- **Total Population Exposed:** ~650,000 citizens
- **Status:** Confirmed by AI Multi-Agent. Waiting to be published to responder network.`,
      ngo: `# NGO Directives — 2024 Assam Flood
- **Immediate Supplies Needed:** 20,000 food packets, medical kits, temporary shelters.
- **Sanitation Risk:** Elevated risk of waterborne vector diseases. Mobilize field teams.`,
      public: `# Public Safety Alert — 2024 Assam Flood
- **Advice:** Evacuate immediately to higher regions and avoid flooded paths.`
    },
    missionPlan: [
      { id: 'm-x-1', name: 'Establish 4 regional food distribution points', priority: 'High', status: 'Pending', eta: '10 mins' },
      { id: 'm-x-2', name: 'Mobilize medical kits relief trucks', priority: 'High', status: 'Pending', eta: '15 mins' }
    ],
    hospitals: [
      { name: 'Assam State Emergency Wing', availability: '24 Beds', distance: '5 km', coordinates: [26.15, 91.74] }
    ],
    shelters: [
      { name: 'Disaster Relief Camp Beta', availability: '500 slots', distance: '3.2 km', coordinates: [26.13, 91.72] }
    ]
  }
];

const initialFundRequests: FundRequest[] = [
  {
    id: 'req-201',
    ngo: 'SEEDS Relief Organization',
    amount: 1500000,
    purpose: 'Deploy 5 water purification systems & supply 2,000 family relief kits',
    priority: 'High',
    status: 'submitted',
    requiredResources: '5 x Water Filtration Units, 2000 x Food/Med Packages',
    supportingNotes: 'We have teams on-ground in Dibrugarh. This funding will cover logistics and kit procurement.',
    disasterId: 'd-101',
    disasterName: 'Brahmaputra River Flash Flood',
    timestamp: new Date(Date.now() - 3600000 * 3).toISOString()
  },
  {
    id: 'req-202',
    ngo: 'Red Cross India Council',
    amount: 4500000,
    purpose: 'Establish fully functional medical camp and diagnostic unit',
    priority: 'High',
    status: 'blockchain_completed',
    reason: 'Immediate medical support recommended for high risk areas.',
    requiredResources: '3 x Trauma Ambulances, Medical supplies, 8 x Nurses',
    supportingNotes: 'Approved and confirmed via on-chain smart contract release.',
    disasterId: 'd-101',
    disasterName: 'Brahmaputra River Flash Flood',
    timestamp: new Date(Date.now() - 3600000 * 12).toISOString(),
    txHash: '0x3f6e12a890db7c5f891b2c45def789a9c8b824150df789a9cfb824150df7812e'
  }
];

const initialBlockchainTxs: BlockchainTx[] = [
  {
    hash: '0x3f6e12a890db7c5f891b2c45def789a9c8b824150df789a9cfb824150df7812e',
    block: 104289,
    timestamp: new Date(Date.now() - 3600000 * 12).toISOString(),
    amount: 4500000,
    ngo: 'Red Cross India Council',
    purpose: 'Establish fully functional medical camp and diagnostic unit',
    status: 'confirmed'
  },
  {
    hash: '0xa415fb8241d7890def789a9c8b824150df789a9cfb824150df7812e3f6e12a89',
    block: 104281,
    timestamp: new Date(Date.now() - 3600000 * 20).toISOString(),
    amount: 1200000,
    ngo: 'Goonj Relief Force',
    purpose: 'Procure and distribute woolen clothes and bedsheets for displaced families',
    status: 'confirmed'
  }
];

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL !== undefined ? import.meta.env.VITE_BACKEND_URL : 'http://127.0.0.1:8000';

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      role: null,
      setRole: (role) => set({ role }),
      logout: () => {
        sessionStorage.setItem('skip-preloader-on-logout', 'true');
        set({ role: null });
      },
      disasters: initialDisasters,
      fundRequests: initialFundRequests,
      blockchainTxs: initialBlockchainTxs,
      activeIncidentId: 'd-101',
      setActiveIncidentId: (id) => set({ activeIncidentId: id }),
      
      registeredUser: null,
      registerUser: (user) => set({ registeredUser: user }),
      
      analysisProgress: 0,
      analysisLogs: [],
      analysisActiveNode: null,
      isAnalyzing: false,
      analysisOutcome: null,

      resetAnalysisState: () => set({
        analysisProgress: 0,
        analysisLogs: [],
        analysisActiveNode: null,
        isAnalyzing: false,
        analysisOutcome: null
      }),

      fetchInitialData: async () => {
        try {
          const disRes = await fetch(`${BACKEND_URL}/api/disasters`);
          if (disRes.ok) {
            const disasters = await disRes.json();
            set({ disasters });
          }

          const fundRes = await fetch(`${BACKEND_URL}/api/fund-requests`);
          if (fundRes.ok) {
            const fundRequests = await fundRes.json();
            set({ fundRequests });
          }

          const txRes = await fetch(`${BACKEND_URL}/api/blockchain-transactions`);
          if (txRes.ok) {
            const blockchainTxs = await txRes.json();
            set({ blockchainTxs });
          }
        } catch (err) {
          console.error("Failed to load initial data from live DB:", err);
        }
      },

      addDisaster: async (disaster) => {
        try {
          const res = await fetch(`${BACKEND_URL}/api/disasters/citizen`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: disaster.name,
              type: disaster.type,
              severity: disaster.severity,
              population: disaster.population,
              state: disaster.state,
              description: disaster.description
            })
          });
          if (res.ok) {
            const newDisaster = await res.json();
            set((state) => ({
              disasters: [newDisaster, ...state.disasters]
            }));
          }
        } catch (err) {
          console.error("Failed to add citizen disaster report:", err);
        }
      },

      runAnalysis: async (description: string) => {
        const id = `d-${Date.now()}`;
        const type = description.toLowerCase().includes('earthquake') || description.toLowerCase().includes('tremor') ? 'earthquake' : 'flood';

        const initialDisaster: Disaster = {
          id,
          name: 'Analyzing incident...',
          type,
          lat: 20.0,
          lng: 78.0,
          severity: 'medium',
          population: 0,
          state: 'Detecting...',
          status: 'analyzing',
          verificationStatus: 'Pending',
          confidence: 0,
          riskLevel: 'Medium',
          description,
          reportMarkdown: { government: '', ngo: '', public: '' },
          missionPlan: [],
          hospitals: [],
          shelters: []
        };

        set((state) => ({
          isAnalyzing: true,
          analysisProgress: 0,
          analysisLogs: ['[System] Connecting to LangGraph multi-agent backend...'],
          analysisActiveNode: 'NLP Parsing (Geocoding)',
          disasters: [initialDisaster, ...state.disasters],
          activeIncidentId: id
        }));

        return new Promise<Disaster>((resolve, reject) => {
          let completedAgentsCount = 0;
          let totalAgentsCount = 6;

          const controller = new AbortController();
          fetch(`${BACKEND_URL}/analyze/stream`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: description }),
            signal: controller.signal
          }).then(async (res) => {
            if (!res.ok) {
              throw new Error(`Failed to start streaming: ${res.status}`);
            }
            const reader = res.body?.getReader();
            if (!reader) throw new Error("No response reader");

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
                    totalAgentsCount = parsed.agents?.length || 6;
                    set((state) => ({
                      analysisLogs: [...state.analysisLogs, `[Orchestrator] Registered agents: ${parsed.agents?.map((a: any) => a.display_name).join(', ')}`]
                    }));
                  } else if (eventType === 'agent_status') {
                    if (parsed.status === 'running') {
                      set((state) => ({
                        analysisActiveNode: parsed.display_name,
                        analysisLogs: [...state.analysisLogs, `[Executing] ${parsed.display_name}...`]
                      }));
                    } else if (parsed.status === 'completed') {
                      completedAgentsCount++;
                      const progress = Math.round((completedAgentsCount / totalAgentsCount) * 100);
                      set((state) => ({
                        analysisProgress: progress,
                        analysisLogs: [...state.analysisLogs, `✔ ${parsed.message}`]
                      }));
                    } else if (parsed.status === 'error') {
                      set((state) => ({
                        analysisLogs: [...state.analysisLogs, `❌ Error in ${parsed.display_name}: ${parsed.message}`]
                      }));
                    }
                  } else if (eventType === 'pipeline_complete') {
                    const data = parsed;
                    const mappedDisaster: Disaster = {
                      id: data.disaster_id,
                      name: data.location ? `${data.location} Incident` : 'Verified Incident',
                      type: data.event_type as 'flood' | 'earthquake',
                      lat: data.coordinates?.latitude || 22.0,
                      lng: data.coordinates?.longitude || 78.0,
                      severity: data.disaster_severity >= 9.0 ? 'critical' : data.disaster_severity >= 7.0 ? 'high' : data.disaster_severity >= 4.0 ? 'medium' : 'low',
                      population: data.risk_assessment?.exposed_population || 120000,
                      state: data.location?.split(',').pop()?.trim() || 'Assam',
                      status: (data.verification_status === 'LIVE' || data.verification_status === 'VERIFIED') ? 'reported' : 'preparedness',
                      verificationStatus: 'Verified',
                      confidence: Math.round((data.risk_assessment?.confidence || 0.9) * 100),
                      riskLevel: data.risk_assessment?.risk_level || 'Medium',
                      description: data.government_advisory || description,
                      reportMarkdown: {
                        government: data.government_advisory ? `# Government Incident Brief\n${data.government_advisory}` : '# Government Incident Brief\nNo advisory generated.',
                        ngo: data.required_supplies ? `# NGO Relief Instructions\n- **Required supplies:** ${data.required_supplies.join(', ')}\n- **Risk assessment priority:** ${data.risk_assessment?.priority || 'High'}` : '# NGO Instructions\nNo instructions.',
                        public: data.safe_route ? `# Public Safety Notice\n- **Safe Routes:** ${data.safe_route}\n- **Emergency Contacts:** ${Object.entries(data.emergency_contacts || {}).map(([k,v]) => `${k}: ${v}`).join(', ')}` : '# Public Notice\nStay alert.'
                      },
                      missionPlan: (data.missions || []).map((m: any) => ({
                        id: m.mission_id || `m-${Date.now()}`,
                        name: m.title || 'Rescue Operation',
                        priority: m.priority || 'Medium',
                        status: m.status || 'Pending',
                        eta: m.estimated_duration || 'N/A'
                      })),
                      hospitals: (data.nearby_hospitals || []).map((h: any) => ({
                        name: h.name || 'Medical Clinic',
                        availability: `Capacity: ${h.capacity - h.occupied_beds} beds`,
                        distance: 'Nearby',
                        coordinates: [h.latitude, h.longitude]
                      })),
                      shelters: (data.nearby_shelters || []).map((s: any) => ({
                        name: s.name || 'Emergency Shelter',
                        availability: `Slots open: ${s.capacity - s.occupied}`,
                        distance: 'Nearby',
                        coordinates: [s.latitude, s.longitude]
                      }))
                    };

                    set((state) => ({
                      isAnalyzing: false,
                      analysisOutcome: mappedDisaster.status === 'preparedness' ? 'PREPAREDNESS' : 'LIVE',
                      activeIncidentId: mappedDisaster.id,
                      disasters: state.disasters.map((d) => d.id === id ? mappedDisaster : d)
                    }));

                    get().fetchInitialData();
                    resolve(mappedDisaster);
                  }
                } catch (e) {
                  console.error("SSE parse error", e);
                }
              }
            }
          }).catch((err) => {
            console.error("SSE pipeline fetch failed:", err);
            set((state) => ({
              isAnalyzing: false,
              analysisLogs: [...state.analysisLogs, `❌ Connection error to Python backend: ${err.message}`]
            }));
            reject(err);
          });
        });
      },

      publishIncident: async (id) => {
        try {
          const res = await fetch(`${BACKEND_URL}/api/disasters/${id}/publish`, {
            method: 'POST'
          });
          if (res.ok) {
            set((state) => ({
              disasters: state.disasters.map((d) =>
                d.id === id ? { ...d, status: 'published' } : d
              )
            }));
          }
        } catch (err) {
          console.error("Failed to publish incident:", err);
        }
      },

      createFundRequest: async (req) => {
        try {
          const res = await fetch(`${BACKEND_URL}/api/fund-requests`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ngo: req.ngo,
              amount: req.amount,
              purpose: req.purpose,
              priority: req.priority,
              requiredResources: req.requiredResources,
              supportingNotes: req.supportingNotes,
              disasterId: req.disasterId,
              disasterName: req.disasterName
            })
          });
          if (res.ok) {
            const newReq = await res.json();
            set((state) => ({
              fundRequests: [newReq, ...state.fundRequests]
            }));
          }
        } catch (err) {
          console.error("Failed to create fund request:", err);
        }
      },

      approveFundRequest: async (id, customAmount) => {
        try {
          const res = await fetch(`${BACKEND_URL}/api/fund-requests/${id}/approve`, {
            method: 'POST'
          });
          if (res.ok) {
            const data = await res.json();
            set((state) => {
              const updatedRequests = state.fundRequests.map((req) => {
                if (req.id === id) {
                  return {
                    ...req,
                    status: data.status,
                    txHash: data.txHash,
                    amount: customAmount || req.amount
                  };
                }
                return req;
              });

              const reqObj = state.fundRequests.find(r => r.id === id);
              const newTx = reqObj ? {
                hash: data.txHash,
                block: data.block,
                timestamp: new Date().toISOString(),
                amount: customAmount || reqObj.amount,
                ngo: reqObj.ngo,
                purpose: reqObj.purpose,
                status: 'confirmed' as const
              } : null;

              return {
                fundRequests: updatedRequests,
                blockchainTxs: newTx ? [newTx, ...state.blockchainTxs] : state.blockchainTxs,
                disasters: state.disasters.map((d) =>
                  reqObj && d.id === reqObj.disasterId && d.status === 'reported' ? { ...d, status: 'published' } : d
                )
              };
            });
          }
        } catch (err) {
          console.error("Failed to approve fund request:", err);
        }
      },

      rejectFundRequest: async (id) => {
        try {
          const res = await fetch(`${BACKEND_URL}/api/fund-requests/${id}/reject`, {
            method: 'POST'
          });
          if (res.ok) {
            set((state) => ({
              fundRequests: state.fundRequests.map((req) =>
                req.id === id ? { ...req, status: 'rejected' as const } : req
              )
            }));
          }
        } catch (err) {
          console.error("Failed to reject fund request:", err);
        }
      }
    }),
    {
      name: 'aapdasetu-store-v2'
    }
  )
);
