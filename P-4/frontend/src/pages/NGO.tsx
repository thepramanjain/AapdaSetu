import React, { useState, useMemo } from 'react';
import { RoleGuard } from '../components/RoleGuard';
import { clsx } from 'clsx';
import {
  CheckCircle2,
  FileText,
  Users,
  ShieldCheck,
  Truck,
  UserCheck,
  Heart,
  UploadCloud,
  MessageSquare,
  Sparkles,
  FileSpreadsheet,
  Eye,
  AlertCircle
} from 'lucide-react';

// ─── Interfaces ──────────────────────────────────────────────────────────────

interface FundRequest {
  id: string;
  purpose: string;
  disaster: string;
  location: string;
  people: number;
  requested: number;
  sanctioned: number | null;
  status: 'pending' | 'verified' | 'approved' | 'disbursed' | 'rejected';
  submittedAt: string;
  aiScore: number;
  // Real File Movement additions
  fileMovement?: {
    currentDepartment: string;
    currentOfficer: string;
    receivedTime: string;
    estimatedApproval: string;
    timeline: { step: string; status: 'completed' | 'current' | 'pending'; officer?: string; date?: string }[];
  };
}

interface AIRecommendation {
  id: string;
  disaster: string;
  district: string;
  state: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  population: number;
  requiredResources: {
    boats: number;
    doctors: number;
    volunteers: number;
    foodKits: number;
    waterBottles: number;
    medicalKits: number;
  };
  budget: number;
  confidence: number;
}

interface InventoryItem {
  name: string;
  available: number;
  reserved: number;
  inTransit: number;
  criticalLevel: number;
  unit: string;
}

interface VolunteerTeam {
  role: string;
  available: number;
  deployed: number;
  icon: any;
}

// ─── Component ───────────────────────────────────────────────────────────────

export const NGO: React.FC = () => {

  // AI Recommendations list
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([
    {
      id: 'REC-091',
      disaster: 'Assam Brahmaputra Flood',
      district: 'Barpeta',
      state: 'Assam',
      severity: 'CRITICAL',
      population: 450000,
      requiredResources: {
        boats: 25,
        doctors: 12,
        volunteers: 180,
        foodKits: 5000,
        waterBottles: 15000,
        medicalKits: 2000
      },
      budget: 52000000,
      confidence: 94
    },
    {
      id: 'REC-092',
      disaster: 'Uttarkashi Seismic Event',
      district: 'Uttarkashi',
      state: 'Uttarakhand',
      severity: 'HIGH',
      population: 78000,
      requiredResources: {
        boats: 0,
        doctors: 8,
        volunteers: 95,
        foodKits: 1500,
        waterBottles: 4000,
        medicalKits: 1200
      },
      budget: 18000000,
      confidence: 89
    }
  ]);

  // Fund requests state
  const [requests, setRequests] = useState<FundRequest[]>([
    {
      id: 'FR-2041',
      purpose: 'Emergency Drinking Water and Chlorination Tablets',
      disaster: 'Assam Brahmaputra Flood',
      location: 'Barpeta, Assam',
      people: 8500,
      requested: 450000,
      sanctioned: 450000,
      status: 'disbursed',
      submittedAt: '2026-07-18 10:30',
      aiScore: 94,
      fileMovement: {
        currentDepartment: 'Disbursal & Accounts Office',
        currentOfficer: 'Shri A. K. Roy (Joint Sec. Finance)',
        receivedTime: '2026-07-19 12:00',
        estimatedApproval: 'Approved',
        timeline: [
          { step: 'District Collector Review', status: 'completed', officer: 'Smt. P. Sharma (DC Barpeta)', date: '2026-07-18 11:30' },
          { step: 'State Authority Clearance', status: 'completed', officer: 'Shri T. Gogoi (SDMA Director)', date: '2026-07-18 15:45' },
          { step: 'Finance Department Clearance', status: 'completed', officer: 'Shri A. K. Roy (Joint Sec. Finance)', date: '2026-07-19 09:10' },
          { step: 'Relief Commissioner Sanction', status: 'completed', officer: 'Dr. H. Barua (Relief Commissioner)', date: '2026-07-19 11:30' }
        ]
      }
    },
    {
      id: 'FR-2040',
      purpose: 'Mobile Medical Camps & First Aid Stations',
      disaster: 'Uttarkashi Seismic Event',
      location: 'Dunda, Uttarakhand',
      people: 3200,
      requested: 800000,
      sanctioned: 800000,
      status: 'approved',
      submittedAt: '2026-07-17 14:15',
      aiScore: 89,
      fileMovement: {
        currentDepartment: 'Relief Commissioner Sanction',
        currentOfficer: 'Dr. H. Barua (Relief Commissioner)',
        receivedTime: '2026-07-19 15:00',
        estimatedApproval: 'Completed',
        timeline: [
          { step: 'District Collector Review', status: 'completed', officer: 'Shri M. Rawat (DC Uttarkashi)', date: '2026-07-17 16:30' },
          { step: 'State Authority Clearance', status: 'completed', officer: 'Shri R. Semwal (Director USDMA)', date: '2026-07-18 10:15' },
          { step: 'Finance Department Clearance', status: 'completed', officer: 'Shri V. Negi (Finance Secretary)', date: '2026-07-18 16:45' },
          { step: 'Relief Commissioner Sanction', status: 'completed', officer: 'Dr. H. Barua (Relief Commissioner)', date: '2026-07-19 15:00' }
        ]
      }
    },
    {
      id: 'FR-2039',
      purpose: 'Dry Rations and Community Kitchen Supply Kits',
      disaster: 'Assam Brahmaputra Flood',
      location: 'Dhubri, Assam',
      people: 12000,
      requested: 650000,
      sanctioned: null,
      status: 'verified',
      submittedAt: '2026-07-19 09:00',
      aiScore: 91,
      fileMovement: {
        currentDepartment: 'State Authority Clearance',
        currentOfficer: 'Shri T. Gogoi (SDMA Director)',
        receivedTime: '2026-07-19 10:00',
        estimatedApproval: '24h remaining',
        timeline: [
          { step: 'District Collector Review', status: 'completed', officer: 'Shri R. K. Das (DC Dhubri)', date: '2026-07-19 09:45' },
          { step: 'State Authority Clearance', status: 'current', officer: 'Shri T. Gogoi (SDMA Director)', date: '2026-07-19 10:00' },
          { step: 'Finance Department Clearance', status: 'pending' },
          { step: 'Relief Commissioner Sanction', status: 'pending' }
        ]
      }
    }
  ]);

  // Live Inventory
  const inventory: InventoryItem[] = [
    { name: 'Food Packets', available: 12500, reserved: 4500, inTransit: 2500, criticalLevel: 5000, unit: 'kits' },
    { name: 'Water Bottles (1L)', available: 22000, reserved: 8000, inTransit: 6000, criticalLevel: 8000, unit: 'bottles' },
    { name: 'Blankets', available: 4200, reserved: 2100, inTransit: 1200, criticalLevel: 3000, unit: 'pcs' },
    { name: 'Emergency Tents', available: 850, reserved: 650, inTransit: 150, criticalLevel: 500, unit: 'tents' },
    { name: 'Medical Kits', available: 1800, reserved: 900, inTransit: 400, criticalLevel: 1000, unit: 'kits' },
    { name: 'Boats (Rescue)', available: 18, reserved: 12, inTransit: 4, criticalLevel: 8, unit: 'units' },
    { name: 'Rescue Vehicles', available: 32, reserved: 24, inTransit: 6, criticalLevel: 15, unit: 'vehicles' },
    { name: 'Satellite Phones', available: 45, reserved: 30, inTransit: 5, criticalLevel: 20, unit: 'devices' },
    { name: 'Inspection Drones', available: 14, reserved: 8, inTransit: 2, criticalLevel: 5, unit: 'units' }
  ];



  // Live Impact Stats
  const impactStats = useMemo(() => ({
    familiesSupported: '18,420',
    livesReached: '84,910',
    mealsDistributed: '1,42,000',
    medicalTreatments: '12,850',
    childrenAssisted: '8,410',
    reliefCamps: '42',
    villagesCovered: '118',
    rescueMissions: '1,280'
  }), []);

  // Multi-step fund wizard state
  const [wizardStep, setWizardStep] = useState(1);
  const [wizardMission, setWizardMission] = useState('Assam Brahmaputra Flood');
  const [wizardDistrict, setWizardDistrict] = useState('Guwahati, Assam');
  const [wizardBudget, setWizardBudget] = useState(650000);
  const [wizardPurpose, setWizardPurpose] = useState('');
  const [wizardBeneficiaries, setWizardBeneficiaries] = useState(8000);
  const [uploadedEvidence, setUploadedEvidence] = useState<{ name: string; size: string; status: 'verified' | 'failed' | 'scanning' }[]>([]);

  // Selected details for modal or timeline lookup
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);

  // Handlers
  const handleAcceptRecommendation = (rec: AIRecommendation) => {
    // Convert recommendation to a pending request
    const newRequest: FundRequest = {
      id: `FR-${2042 + requests.length}`,
      purpose: `AI Recommended Mission: Complete Relief Operations in ${rec.district}, ${rec.state}`,
      disaster: rec.disaster,
      location: `${rec.district}, ${rec.state}`,
      people: rec.population,
      requested: rec.budget,
      sanctioned: null,
      status: 'verified',
      submittedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
      aiScore: rec.confidence,
      fileMovement: {
        currentDepartment: 'District Collector Review',
        currentOfficer: `Collector of ${rec.district}`,
        receivedTime: new Date().toISOString().slice(0, 16).replace('T', ' '),
        estimatedApproval: '48h remaining',
        timeline: [
          { step: 'District Collector Review', status: 'current', officer: `Collector of ${rec.district}` },
          { step: 'State Authority Clearance', status: 'pending' },
          { step: 'Finance Department Clearance', status: 'pending' },
          { step: 'Relief Commissioner Sanction', status: 'pending' }
        ]
      }
    };

    setRequests(prev => [newRequest, ...prev]);
    setRecommendations(prev => prev.filter(r => r.id !== rec.id));
  };

  const handleEvidenceUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const newFile = {
      name: file.name,
      size: `${(file.size / 1024).toFixed(1)} KB`,
      status: 'scanning' as const
    };
    setUploadedEvidence(prev => [...prev, newFile]);

    // Simulate AI audit checks
    setTimeout(() => {
      setUploadedEvidence(prev =>
        prev.map(f =>
          f.name === file.name
            ? { ...f, status: Math.random() > 0.15 ? 'verified' : 'failed' }
            : f
        )
      );
    }, 1500);
  };

  const submitWizardRequest = () => {
    const id = `FR-${2042 + requests.length}`;
    const newRequest: FundRequest = {
      id,
      purpose: wizardPurpose || 'Emergency Supply Logistics & Health Camp Support',
      disaster: wizardMission,
      location: wizardDistrict,
      people: wizardBeneficiaries,
      requested: wizardBudget,
      sanctioned: null,
      status: 'pending',
      submittedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
      aiScore: 88,
      fileMovement: {
        currentDepartment: 'District Collector Review',
        currentOfficer: 'DC Dispatch Office',
        receivedTime: new Date().toISOString().slice(0, 16).replace('T', ' '),
        estimatedApproval: '72h remaining',
        timeline: [
          { step: 'District Collector Review', status: 'current', officer: 'District Collector' },
          { step: 'State Authority Clearance', status: 'pending' },
          { step: 'Finance Department Clearance', status: 'pending' },
          { step: 'Relief Commissioner Sanction', status: 'pending' }
        ]
      }
    };

    setRequests(prev => [newRequest, ...prev]);
    // Reset wizard
    setWizardStep(1);
    setWizardPurpose('');
    setUploadedEvidence([]);
  };

  return (
    <div className="min-h-screen pb-24 pt-28 relative bg-slate-50/50 text-slate-800">
      
      <div className="mx-auto max-w-7xl px-4 sm:px-6 space-y-8">
        
        {/* Top Header Row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6 border-slate-200/80">
          <div>
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-widest text-emerald-600 bg-emerald-50 border border-emerald-250 px-2 py-0.5 rounded-full font-bold font-mono">
                <CheckCircle2 className="h-3 w-3" />
                FCRA Verified
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-widest text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full font-bold font-mono">
                <ShieldCheck className="h-3 w-3" />
                CSR Eligible
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-widest text-purple-700 bg-purple-50 border border-purple-250 px-2 py-0.5 rounded-full font-bold font-mono">
                <StarIcon className="h-3 w-3" />
                Government Trusted Partner
              </span>
            </div>
            
            <h1 className="mt-2.5 text-3xl md:text-4xl font-display font-black tracking-tight text-slate-900">
              Relief Rescue Foundation
            </h1>
            <p className="mt-1.5 text-sm text-slate-500 font-semibold font-mono">
              National Disaster Management (Govt-NGO) Operations Command
            </p>
          </div>

          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1.5 text-xs px-3.5 py-2 rounded-xl border border-emerald-500/40 text-emerald-600 bg-emerald-500/5 font-bold font-mono shadow-xs">
              <ShieldCheck className="h-4 w-4" />
              Trust Score: 98.4 / 100
            </span>
          </div>
        </div>

        {/* ─── NEW HERO SECTION ─── */}
        <div className="grid md:grid-cols-3 gap-5">
          {/* Mission Readiness Card */}
          <div className="border rounded-2xl p-5 shadow-card relative overflow-hidden flex flex-col justify-between min-h-[160px] bg-white border-slate-200">
            <div>
              <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Mission Readiness</div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-4xl font-display font-black text-slate-900 font-mono">92%</span>
                <span className="text-xs text-emerald-600 font-bold font-mono">✓ High Capability</span>
              </div>
            </div>
            {/* Bar progress */}
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-250/20">
              <div className="bg-emerald-500 h-full rounded-full" style={{ width: '92%' }} />
            </div>
            <div className="text-[11px] text-slate-400 font-medium font-mono flex items-center justify-between pt-1">
              <span>Compliance Rate: 99.1%</span>
              <span>FCRA Renewal: Valid</span>
            </div>
          </div>

          {/* Wallet Balance Card */}
          <div className="border rounded-2xl p-5 shadow-card relative overflow-hidden flex flex-col justify-between min-h-[160px] bg-white border-slate-200">
            <div>
              <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Operational Funds</div>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-3xl font-display font-black text-slate-900 font-mono">₹85,00,000</span>
                <span className="text-xs text-slate-500 font-bold font-sans">available</span>
              </div>
            </div>
            <div className="text-[11px] text-slate-400 font-mono flex flex-col gap-1">
              <div className="flex justify-between">
                <span>Govt Disbursements: ₹52.4L</span>
                <span className="text-emerald-500 font-bold">In Ledger</span>
              </div>
              <div className="flex justify-between">
                <span>Public Donations: ₹32.6L</span>
                <span>Unallocated</span>
              </div>
            </div>
          </div>

          {/* Latest Government Assignment */}
          <div className="border rounded-2xl p-5 shadow-card relative overflow-hidden flex flex-col justify-between min-h-[160px] bg-white border-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Active Assignment</span>
              <span className="inline-flex items-center gap-1 rounded bg-red-50 border border-red-200 px-2 py-0.5 text-[9px] font-extrabold uppercase text-red-600 font-mono">
                Priority Red
              </span>
            </div>
            <div className="mt-2.5">
              <div className="text-xs font-bold text-slate-800 truncate">
                Guwahati Sector 4 Relief Camp setup
              </div>
              <div className="text-[10px] text-slate-500 mt-1 font-mono">
                Assam Flood | Kamrup Metro District
              </div>
            </div>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono font-semibold">
              <span className="text-orange-500">Status: Deployment Phase</span>
              <span className="text-slate-400">Assignment ID: ASM-412</span>
            </div>
          </div>
        </div>


        {/* ─── AI RECOMMENDATIONS & WIZARD ─── */}
        <div className="grid lg:grid-cols-5 gap-6">
          {/* AI Recommendations Column */}
          <div className="lg:col-span-3 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-bold flex items-center gap-2">
                <Sparkles className="h-4.5 w-4.5 text-emerald-600" />
                AI Mission Recommendations (Auto-Analyzed)
              </h2>
              <span className="text-xs text-slate-400 font-mono font-bold">Pre-verified tranches</span>
            </div>

            <div className="space-y-4">
              {recommendations.length === 0 ? (
                <div className="border rounded-2xl p-6 text-center text-slate-400 font-mono text-xs flex flex-col justify-center items-center h-[280px] bg-white border-slate-200">
                  <CheckCircle2 className="h-8 w-8 text-emerald-500 mb-2" />
                  No outstanding AI recommended missions at this moment.
                </div>
              ) : (
                recommendations.map((rec) => (
                  <div
                    key={rec.id}
                    className="border rounded-2xl p-5 shadow-card flex flex-col justify-between space-y-4 relative overflow-hidden transition-all bg-white border-slate-200"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono tracking-widest text-slate-400 font-bold">{rec.id}</span>
                          <span className="text-[9px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200">
                            {rec.severity} Severity
                          </span>
                        </div>
                        <h3 className="mt-2 text-base font-bold text-slate-800">
                          Relief Setup at {rec.district}, {rec.state}
                        </h3>
                        <p className="text-xs text-slate-400 font-mono mt-0.5">
                          Disaster context: {rec.disaster} | Pop: {rec.population.toLocaleString('en-IN')}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] font-mono font-bold text-slate-400 uppercase">Est. Budget</div>
                        <div className="text-lg font-black font-mono text-emerald-600">₹{(rec.budget / 10000000).toFixed(2)} Cr</div>
                      </div>
                    </div>

                    {/* Resources list grid */}
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 bg-slate-50 border border-slate-100 rounded-xl p-3 text-center">
                      <div>
                        <div className="text-[8px] uppercase text-slate-400 font-bold font-mono">Boats</div>
                        <div className="text-xs font-bold text-slate-700 font-mono mt-0.5">{rec.requiredResources.boats}</div>
                      </div>
                      <div>
                        <div className="text-[8px] uppercase text-slate-400 font-bold font-mono">Doctors</div>
                        <div className="text-xs font-bold text-slate-700 font-mono mt-0.5">{rec.requiredResources.doctors}</div>
                      </div>
                      <div>
                        <div className="text-[8px] uppercase text-slate-400 font-bold font-mono">Volunteers</div>
                        <div className="text-xs font-bold text-slate-700 font-mono mt-0.5">{rec.requiredResources.volunteers}</div>
                      </div>
                      <div>
                        <div className="text-[8px] uppercase text-slate-400 font-bold font-mono">Food Kits</div>
                        <div className="text-xs font-bold text-slate-700 font-mono mt-0.5">{rec.requiredResources.foodKits}</div>
                      </div>
                      <div>
                        <div className="text-[8px] uppercase text-slate-400 font-bold font-mono">Water</div>
                        <div className="text-xs font-bold text-slate-700 font-mono mt-0.5">{rec.requiredResources.waterBottles}</div>
                      </div>
                      <div>
                        <div className="text-[8px] uppercase text-slate-400 font-bold font-mono">Med Kits</div>
                        <div className="text-xs font-bold text-slate-700 font-mono mt-0.5">{rec.requiredResources.medicalKits}</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t pt-4 border-slate-100">
                      <span className="text-[10px] text-slate-400 font-mono font-bold">
                        AI Confidence Match: {rec.confidence}%
                      </span>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleAcceptRecommendation(rec)}
                          className="text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl shadow-sm transition cursor-pointer"
                        >
                          Accept Mission
                        </button>
                        <button
                          type="button"
                          onClick={() => setRecommendations(prev => prev.filter(r => r.id !== rec.id))}
                          className="text-xs font-bold border border-slate-200 text-slate-500 hover:bg-slate-100 px-3 py-2 rounded-xl transition cursor-pointer"
                        >
                          Dismiss
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* New Fund Request multi-step wizard (Right) */}
          <div className="lg:col-span-2">
            <div className="border rounded-2xl p-5 shadow-card h-full flex flex-col justify-between space-y-4 bg-white border-slate-200">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 grid place-items-center shadow-xs">
                  <FileSpreadsheet className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-[14px]">Mission Dispatch Wizard</h3>
                  <p className="text-[9px] text-slate-400 font-mono">Create, verify, and submit proposal</p>
                </div>
              </div>

              {/* Wizard Steps indicator */}
              <div className="grid grid-cols-3 gap-1 text-center font-mono text-[8px] font-bold">
                <span className={clsx('pb-1 border-b-2', wizardStep === 1 ? 'border-indigo-500 text-slate-800' : 'border-slate-100 text-slate-400')}>1. Info</span>
                <span className={clsx('pb-1 border-b-2', wizardStep === 2 ? 'border-indigo-500 text-slate-800' : 'border-slate-100 text-slate-400')}>2. Items</span>
                <span className={clsx('pb-1 border-b-2', wizardStep === 3 ? 'border-indigo-500 text-slate-800' : 'border-slate-100 text-slate-400')}>3. Audit</span>
              </div>

              {/* Step 1: Info */}
              {wizardStep === 1 && (
                <div className="space-y-3 flex-1">
                  <div>
                    <label className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-400">Purpose / Brief</label>
                    <input
                      type="text"
                      value={wizardPurpose}
                      onChange={(e) => setWizardPurpose(e.target.value)}
                      placeholder="e.g. Setting up 12 dry kitchens in Hub"
                      className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs bg-slate-50 text-slate-800 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-400">Target Disaster</label>
                    <select
                      value={wizardMission}
                      onChange={(e) => setWizardMission(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs bg-slate-50 text-slate-800 focus:outline-none focus:border-indigo-500 font-bold"
                    >
                      <option>Assam Brahmaputra Flood</option>
                      <option>Uttarkashi Seismic Event</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-400">District, State</label>
                    <input
                      type="text"
                      value={wizardDistrict}
                      onChange={(e) => setWizardDistrict(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs bg-slate-50 text-slate-800 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              )}

              {/* Step 2: Items & Budget */}
              {wizardStep === 2 && (
                <div className="space-y-3 flex-1">
                  <div>
                    <label className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-400">Estimated Budget (₹)</label>
                    <input
                      type="number"
                      value={wizardBudget}
                      onChange={(e) => setWizardBudget(Number(e.target.value))}
                      className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs bg-slate-50 text-slate-850 font-mono font-bold focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-400">Target Beneficiaries</label>
                    <input
                      type="number"
                      value={wizardBeneficiaries}
                      onChange={(e) => setWizardBeneficiaries(Number(e.target.value))}
                      className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs bg-slate-50 text-slate-850 font-mono font-bold focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-[10px] space-y-1.5">
                    <span className="font-bold text-slate-450 uppercase block font-mono">AI Verification Estimate</span>
                    <div className="text-slate-600 font-medium">The amount aligns within 4% of historical tranches for {wizardMission}.</div>
                  </div>
                </div>
              )}

              {/* Step 3: Evidence Audit */}
              {wizardStep === 3 && (
                <div className="space-y-3 flex-1">
                  <div>
                    <label className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-400">Upload Evidence / Proposal</label>
                    <div className="mt-1 flex items-center justify-center border-2 border-dashed border-slate-200 hover:border-slate-350 rounded-xl p-4 transition-all duration-300">
                      <label className="flex flex-col items-center gap-1.5 cursor-pointer text-center">
                        <UploadCloud className="h-6 w-6 text-slate-400" />
                        <span className="text-[10px] font-bold text-slate-600">Click to upload file</span>
                        <span className="text-[8px] text-slate-400">PDF, JPG, PNG (up to 4MB)</span>
                        <input
                          type="file"
                          onChange={handleEvidenceUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>

                  {uploadedEvidence.length > 0 && (
                    <div className="space-y-1.5">
                      {uploadedEvidence.map((f, i) => (
                        <div key={i} className="bg-slate-50 p-2 rounded-lg border border-slate-200 flex items-center justify-between text-[10px]">
                          <span className="font-bold truncate max-w-[100px]">{f.name}</span>
                          <span className="text-slate-400 font-mono">{f.size}</span>
                          <span className={clsx(
                            'text-[9px] font-mono uppercase font-extrabold',
                            f.status === 'verified' && 'text-emerald-600',
                            f.status === 'failed' && 'text-red-600 animate-pulse',
                            f.status === 'scanning' && 'text-slate-400 animate-pulse'
                          )}>
                            {f.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Navigation button */}
              <div className="flex gap-2">
                {wizardStep > 1 && (
                  <button
                    type="button"
                    onClick={() => setWizardStep(prev => prev - 1)}
                    className="text-xs font-bold border border-slate-200 text-slate-650 hover:bg-slate-50 px-3.5 py-2.5 rounded-xl transition cursor-pointer"
                  >
                    Back
                  </button>
                )}
                {wizardStep < 3 ? (
                  <button
                    type="button"
                    onClick={() => setWizardStep(prev => prev + 1)}
                    className="flex-1 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl transition cursor-pointer"
                  >
                    Next Step
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={submitWizardRequest}
                    disabled={uploadedEvidence.some(f => f.status === 'scanning')}
                    className="flex-1 text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-2.5 rounded-xl transition shadow-sm cursor-pointer"
                  >
                    Submit Proposal
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ─── GOVERNMENT FILE MOVEMENT TIMELINE ─── */}
        <div className="grid lg:grid-cols-5 gap-6">
          {/* Active Fund Requests Table */}
          <div className="lg:col-span-3 space-y-4">
            <h2 className="font-display text-lg font-bold flex items-center gap-2">
              <FileText className="h-4.5 w-4.5 text-indigo-600" />
              Active Operations File Movement
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {requests
                .filter(r => r.status !== 'rejected')
                .slice(0, 4)
                .map((r) => {
                  const isSelected = selectedRequestId === r.id;

                  return (
                    <div
                      key={r.id}
                      onClick={() => setSelectedRequestId(isSelected ? null : r.id)}
                      className={clsx(
                        'border rounded-2xl p-5 shadow-card hover:shadow-md cursor-pointer transition-all bg-white border-slate-200',
                        isSelected && 'border-indigo-500 ring-2 ring-indigo-500/10'
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold text-slate-400">{r.id}</span>
                        <span className={clsx(
                          'text-[9px] uppercase font-mono tracking-wider px-2 py-0.5 rounded-full border font-bold',
                          r.status === 'disbursed' && 'bg-teal-50 text-teal-800 border-teal-200',
                          r.status === 'approved' && 'bg-emerald-50 text-emerald-800 border-emerald-200',
                          r.status === 'verified' && 'bg-indigo-50 text-indigo-800 border-indigo-200',
                          r.status === 'pending' && 'bg-amber-50 text-amber-800 border-amber-200'
                        )}>
                          {r.status === 'disbursed' ? 'Funds Released' : r.status === 'approved' ? 'Govt Approved' : r.status === 'verified' ? 'AI Verified' : 'Pending Review'}
                        </span>
                      </div>

                      <h4 className="mt-3 font-semibold text-sm leading-snug truncate text-slate-800">
                        {r.purpose}
                      </h4>
                      <p className="text-[10px] text-slate-400 mt-1 font-mono">{r.location}</p>

                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono">
                        <div className="text-slate-400">Dept: <span className="font-bold text-slate-700 truncate max-w-[100px] inline-block align-middle">{r.fileMovement?.currentDepartment || 'DC Office'}</span></div>
                        <div className="text-indigo-600 font-bold">₹{(r.requested / 100000).toFixed(1)}L</div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Real-time Approval Timeline detail of the selected file */}
          <div className="lg:col-span-2">
            {selectedRequestId ? (
              (() => {
                const req = requests.find(r => r.id === selectedRequestId);
                if (!req) return null;
                return (
                  <div className="border rounded-2xl p-5 shadow-card h-full flex flex-col justify-between space-y-4 bg-white border-slate-200">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold text-slate-400">{req.id} Track</span>
                        <span className="text-[10px] text-indigo-600 font-mono font-bold">Est Approval: {req.fileMovement?.estimatedApproval}</span>
                      </div>
                      <h4 className="mt-2.5 font-bold text-sm text-slate-800 leading-snug">{req.purpose}</h4>
                      
                      {/* Timeline steps */}
                      <div className="mt-5 relative pl-4 border-l border-slate-200 space-y-4 text-xs">
                        {req.fileMovement?.timeline.map((step, idx) => (
                          <div key={idx} className="relative">
                            {/* Dot indicator */}
                            <span className={clsx(
                              'absolute -left-[20.5px] top-0.5 h-3.5 w-3.5 rounded-full border-2 grid place-items-center',
                              step.status === 'completed' && 'bg-emerald-500 border-emerald-500 text-white',
                              step.status === 'current' && 'bg-indigo-600 border-indigo-600 animate-pulse',
                              step.status === 'pending' && 'bg-slate-250 border-slate-200 bg-white'
                            )}>
                              {step.status === 'completed' && <CheckCircle2 className="h-2 w-2" />}
                            </span>
                            
                            <div className="font-bold text-slate-750">{step.step}</div>
                            {step.officer && <div className="text-[10px] text-slate-400 mt-0.5">{step.officer}</div>}
                            {step.date && <div className="text-[9px] text-slate-400 font-mono mt-0.5">{step.date}</div>}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })()
            ) : (
              <div className="border rounded-2xl p-6 shadow-card h-full flex flex-col justify-center items-center text-center text-slate-450 font-mono text-xs bg-white border-slate-200">
                <Eye className="h-6 w-6 text-slate-450 mb-2" />
                Select any operational file on the left to track its real-time government file movement details.
              </div>
            )}
          </div>
        </div>

        {/* ─── LIVE RESOURCE INVENTORY ─── */}
        <div className="w-full">
          {/* Resource Inventory */}
          <div className="border rounded-2xl p-5 shadow-card w-full space-y-4 bg-white border-slate-200">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Truck className="h-4.5 w-4.5 text-brand" />
                Live Supply & Resource Inventory
              </h3>
              <span className="text-[10px] text-slate-450 font-mono font-bold">State Storage Hubs</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {inventory.map((item, i) => {
                const isCritical = item.available < item.criticalLevel;
                return (
                  <div key={i} className="bg-slate-50/50 border border-slate-100 rounded-xl p-3 flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs truncate max-w-[100px] text-slate-800">{item.name}</span>
                      {isCritical && (
                        <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-ping" title="Critical Level Warning" />
                      )}
                    </div>

                    <div className="mt-3 flex items-baseline gap-1">
                      <span className={clsx('text-xl font-black font-mono', isCritical ? 'text-red-650' : 'text-slate-900')}>{item.available.toLocaleString()}</span>
                      <span className="text-[10px] text-slate-455 font-mono">{item.unit}</span>
                    </div>

                    <div className="mt-2 text-[9px] text-slate-400 font-mono flex justify-between border-t pt-1 border-slate-100">
                      <span>Res: {item.reserved}</span>
                      <span>Transit: {item.inTransit}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>


        {/* ─── LIVE IMPACT DASHBOARD ─── */}
        <div className="border rounded-2xl p-6 shadow-card space-y-4 bg-white border-slate-200">
          <div>
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-450">Verified Humanitarian Cumulative Impact</h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Real-time statistics verified by government sensors and district relief databases.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
            <div className="p-3 bg-slate-50/50 border border-slate-200/50 rounded-xl text-center">
              <div className="text-[10px] text-slate-400 font-bold uppercase font-mono">Families Supported</div>
              <div className="text-2xl font-black font-mono text-slate-900 mt-1">{impactStats.familiesSupported}</div>
            </div>
            <div className="p-3 bg-slate-50/50 border border-slate-200/50 rounded-xl text-center">
              <div className="text-[10px] text-slate-400 font-bold uppercase font-mono">Meals Distributed</div>
              <div className="text-2xl font-black font-mono text-slate-900 mt-1">{impactStats.mealsDistributed}</div>
            </div>
            <div className="p-3 bg-slate-50/50 border border-slate-200/50 rounded-xl text-center">
              <div className="text-[10px] text-slate-400 font-bold uppercase font-mono">Medical Treatments</div>
              <div className="text-2xl font-black font-mono text-slate-900 mt-1">{impactStats.medicalTreatments}</div>
            </div>
            <div className="p-3 bg-slate-50/50 border border-slate-200/50 rounded-xl text-center">
              <div className="text-[10px] text-slate-400 font-bold uppercase font-mono">Lives Rescued</div>
              <div className="text-2xl font-black font-mono text-slate-900 mt-1">{impactStats.rescueMissions}</div>
            </div>
          </div>
        </div>

        {/* ─── GOVERNMENT COMMUNICATION & LIVE FEED ─── */}
        <div className="grid lg:grid-cols-5 gap-6">
          {/* DC Notifications / Orders */}
          <div className="border rounded-2xl p-5 shadow-card lg:col-span-3 space-y-4 bg-white border-slate-200">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4.5 w-4.5 text-brand" />
              <h3 className="font-bold text-[14px]">Emergency Orders & Collector Feed</h3>
            </div>

            <div className="space-y-3 text-xs leading-normal">
              <div className="bg-red-50/60 border border-red-200 rounded-xl p-3.5 relative">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-red-800">Urgent: District Collector Barpeta</span>
                  <span className="text-[9px] font-mono text-slate-400 font-bold">10 min ago</span>
                </div>
                <p className="mt-1 text-slate-650 font-medium">
                  State disaster relief teams require immediate medical tents setup at Howraghat CHC hub coordinates. Dispatch squad 2.
                </p>
              </div>

              <div className="bg-slate-50/70 border border-slate-200/60 p-3 rounded-xl">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700">Relief Commissioner General circular</span>
                  <span className="text-[9px] font-mono text-slate-400 font-bold">2 hours ago</span>
                </div>
                <p className="mt-1 text-slate-600 font-medium">
                  Ensure all medical disbursement evidence bills are cryptographically tagged with GPS timestamps for immediate blockchain auditing.
                </p>
              </div>
            </div>
          </div>

          {/* Pending Compliance alerts */}
          <div className="lg:col-span-2">
            <div className="border rounded-2xl p-5 shadow-card h-full flex flex-col justify-between space-y-4 bg-white border-slate-200">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4.5 w-4.5 text-amber-500" />
                <h3 className="font-bold text-[14px]">Operational Compliance Actions</h3>
              </div>

              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-lg border border-amber-250 bg-amber-50/40 text-amber-800 font-medium">
                  Warning: Mission FR-2039 is missing PDF receipts scan. Upload receipt to release remaining tranches.
                </div>
                <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50/50 text-slate-500 font-medium">
                  CSR Compliance report for Q1 has been auto-submitted to Ministry of Corporate Affairs.
                </div>
              </div>

              <span className="text-[10px] text-slate-400 font-mono text-center block pt-2 border-t border-slate-100">
                Next Auditing Cycle: 3 days remaining
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

// SVG components to avoid lucide import issues
const StarIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

export const NGOWithGuard: React.FC = () => {
  return (
    <RoleGuard allow={['ngo', 'government']}>
      <NGO />
    </RoleGuard>
  );
};

export default NGOWithGuard;
