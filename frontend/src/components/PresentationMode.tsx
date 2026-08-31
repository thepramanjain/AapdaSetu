import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../hooks/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  ChevronRight, 
  ChevronLeft, 
  RotateCcw, 
  Sliders, 
  X, 
  Sparkles
} from 'lucide-react';

interface DemoStep {
  title: string;
  role: 'public' | 'government' | 'ngo';
  path: string;
  guide: string;
  actionLabel: string;
  execute: (actions: any) => void;
}

export const PresentationMode: React.FC = () => {
  const navigate = useNavigate();
  const setRole = useStore((state) => state.setRole);
  const disasters = useStore((state) => state.disasters);
  const fundRequests = useStore((state) => state.fundRequests);
  const runAnalysis = useStore((state) => state.runAnalysis);
  const publishIncident = useStore((state) => state.publishIncident);
  const createFundRequest = useStore((state) => state.createFundRequest);
  const approveFundRequest = useStore((state) => state.approveFundRequest);
  const resetAnalysisState = useStore((state) => state.resetAnalysisState);

  const [isOpen, setIsOpen] = useState(false);
  
  // Persist current step in localStorage to survive reloads
  const [currentStep, setCurrentStep] = useState<number>(() => {
    const saved = localStorage.getItem('aapdasetu-demo-step');
    return saved ? parseInt(saved, 10) : 0;
  });

  const updateStep = (stepIndex: number) => {
    setCurrentStep(stepIndex);
    localStorage.setItem('aapdasetu-demo-step', stepIndex.toString());
  };

  const demoSteps: DemoStep[] = [
    {
      title: "1. Landing & Reset",
      role: 'public',
      path: '/',
      guide: "Start the presentation here. Resetting database to initial demo state.",
      actionLabel: "Initialize Sandbox",
      execute: () => {
        localStorage.removeItem('aapdasetu-store-v2');
        // Set demo step to 1 (Gov Login) to advance automatically after reload
        localStorage.setItem('aapdasetu-demo-step', '1');
        window.location.href = '/';
      }
    },
    {
      title: "2. Gov Login",
      role: 'public',
      path: '/login',
      guide: "Navigate to the Login screen with Government Portal credentials pre-filled.",
      actionLabel: "Go to Login (Gov)",
      execute: () => {
        setRole('government');
        navigate('/login');
        updateStep(2);
      }
    },
    {
      title: "3. Gov Command Center",
      role: 'government',
      path: '/gov/dashboard',
      guide: "Log in as Government Administrator. Point out the active incident grid.",
      actionLabel: "Access Command Hub",
      execute: () => {
        setRole('government');
        navigate('/gov/dashboard');
        updateStep(3);
      }
    },
    {
      title: "4. Run Preparedness Scan",
      role: 'government',
      path: '/gov/analyze',
      guide: "Trigger the multi-agent AI pipeline for a low-risk alert. It will result in PREPAREDNESS status and skip blockchain logs.",
      actionLabel: "Run Low-Risk AI Scan",
      execute: () => {
        navigate('/gov/analyze');
        setTimeout(() => {
          runAnalysis("Sikkim Teesta River telemetry alert, minor water rising, low risk. Preparedness action only.");
        }, 300);
        updateStep(4);
      }
    },
    {
      title: "5. Run Live Anomaly Scan",
      role: 'government',
      path: '/gov/analyze',
      guide: "Trigger the AI pipeline for a critical flood scenario. It will result in LIVE status, ready to be published.",
      actionLabel: "Run Critical AI Scan",
      execute: () => {
        resetAnalysisState();
        navigate('/gov/analyze');
        setTimeout(() => {
          runAnalysis("Heavy regional rains have flooded the Rongjuli area of Goalpara district in Assam. Houses submerged, emergency evacuation requested.");
        }, 300);
        updateStep(5);
      }
    },
    {
      title: "6. Publish Incident",
      role: 'government',
      path: '/gov/active',
      guide: "Publish the verified disaster so regional responders (NGOs) are notified.",
      actionLabel: "Publish to NGO Network",
      execute: () => {
        const target = disasters.find(d => d.status === 'reported' || d.status === 'analyzing');
        if (target) {
          publishIncident(target.id);
        } else {
          const fallback = disasters.find(d => d.id === 'd-103' || d.status === 'reported');
          if (fallback) publishIncident(fallback.id);
        }
        navigate('/gov/active');
        updateStep(6);
      }
    },
    {
      title: "7. Switch to NGO Portal",
      role: 'ngo',
      path: '/ngo/assigned',
      guide: "Log in as the NGO (SEEDS Relief) and check Assigned Incidents. The published disaster is now visible.",
      actionLabel: "Access NGO Portal",
      execute: () => {
        setRole('ngo');
        navigate('/ngo/assigned');
        updateStep(7);
      }
    },
    {
      title: "8. NGO Requests Funding",
      role: 'ngo',
      path: '/ngo/requests',
      guide: "As the NGO, submit a ₹20 Lakhs funding request for medical relief kits and shelters.",
      actionLabel: "Submit Funding Request",
      execute: () => {
        const target = disasters.find(d => d.status === 'published') || disasters[0];
        createFundRequest({
          ngo: 'SEEDS Relief Organization',
          amount: 2000000,
          purpose: 'Provide 1,000 emergency medical kits & food packets in affected sectors',
          priority: 'High',
          requiredResources: '1000 x Food Packets, 1000 x Medical kits',
          supportingNotes: 'Direct field volunteer deployment in Goalpara district.',
          disasterId: target.id,
          disasterName: target.name
        });
        navigate('/ngo/requests');
        updateStep(8);
      }
    },
    {
      title: "9. Gov Pending Approvals",
      role: 'government',
      path: '/gov/requests',
      guide: "Switch back to Government Portal to review the pending proposal in the Funding Queue.",
      actionLabel: "View Pending Queue",
      execute: () => {
        setRole('government');
        navigate('/gov/requests');
        updateStep(9);
      }
    },
    {
      title: "10. Execute Smart Contract",
      role: 'government',
      path: '/gov/blockchain',
      guide: "Approve the request to sign and release funds. Inspect the confirmed transaction hash on the Solidity ledger.",
      actionLabel: "Sign & Transact",
      execute: () => {
        const target = fundRequests.find(r => r.status === 'submitted');
        if (target) {
          approveFundRequest(target.id, target.amount);
        } else {
          const targetDisaster = disasters.find(d => d.status === 'published') || disasters[0];
          createFundRequest({
            ngo: 'SEEDS Relief Organization',
            amount: 2000000,
            purpose: 'Provide 1,000 emergency medical kits & food packets in affected sectors',
            priority: 'High',
            requiredResources: '1000 x Food Packets, 1000 x Medical kits',
            supportingNotes: 'Auto-generated fallback request to preserve demo flow.',
            disasterId: targetDisaster.id,
            disasterName: targetDisaster.name
          });
          setTimeout(() => {
            const currentReqs = useStore.getState().fundRequests;
            const freshTarget = currentReqs.find(r => r.status === 'submitted');
            if (freshTarget) approveFundRequest(freshTarget.id, freshTarget.amount);
          }, 80);
        }
        navigate('/gov/blockchain');
      }
    }
  ];

  const handleNextAction = () => {
    const step = demoSteps[currentStep];
    step.execute({});
  };

  const handleManualNext = () => {
    if (currentStep < demoSteps.length - 1) {
      const nextStep = demoSteps[currentStep + 1];
      if (nextStep.role === 'government') setRole('government');
      else if (nextStep.role === 'ngo') setRole('ngo');
      else setRole(null);
      navigate(nextStep.path);
      updateStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      const prevStep = demoSteps[currentStep - 1];
      if (prevStep.role === 'government') setRole('government');
      else if (prevStep.role === 'ngo') setRole('ngo');
      else setRole(null);
      navigate(prevStep.path);
      updateStep(currentStep - 1);
    }
  };

  const handleReset = () => {
    updateStep(0);
    localStorage.removeItem('aapdasetu-store-v2');
    window.location.href = '/';
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] font-sans">
      <AnimatePresence>
        {!isOpen ? (
          <motion.button
            layoutId="demo-panel"
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-2 bg-slate-900 text-white px-4 py-3 rounded-full shadow-lg hover:bg-slate-800 transition-all cursor-pointer font-bold text-xs"
          >
            <Sliders className="h-4 w-4 text-green-400" />
            Presentation Mode
          </motion.button>
        ) : (
          <motion.div
            layoutId="demo-panel"
            className="bg-slate-900 text-white rounded-2xl p-5 w-80 shadow-2xl border border-slate-800 flex flex-col space-y-4"
          >
            {/* Header */}
            <div className="flex justify-between items-center border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-1.5">
                <Sparkles className="h-4.5 w-4.5 text-green-400 animate-pulse" />
                <span className="font-bold text-xs uppercase tracking-wider text-slate-200">Demo Remote Control</span>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Step indicator */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-slate-500 font-mono">STEP {currentStep + 1} OF {demoSteps.length}</span>
              <h4 className="font-bold text-sm text-white">{demoSteps[currentStep].title}</h4>
              <p className="text-[11px] leading-relaxed text-slate-400 font-medium">
                {demoSteps[currentStep].guide}
              </p>
            </div>

            {/* Actions */}
            <div className="space-y-2">
              <button
                onClick={handleNextAction}
                className="w-full flex items-center justify-center gap-1.5 bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-xl font-bold text-xs shadow-md shadow-green-600/10 transition-all cursor-pointer"
              >
                <Play className="h-3.5 w-3.5 fill-current" />
                {demoSteps[currentStep].actionLabel}
              </button>

              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={handlePrev}
                  disabled={currentStep === 0}
                  className="flex items-center justify-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-2 rounded-xl text-[10px] font-bold transition-all disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                  Prev
                </button>

                <button
                  onClick={handleReset}
                  className="flex items-center justify-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-2 rounded-xl text-[10px] font-bold transition-all cursor-pointer"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Reset
                </button>

                <button
                  onClick={handleManualNext}
                  disabled={currentStep === demoSteps.length - 1}
                  className="flex items-center justify-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-2 rounded-xl text-[10px] font-bold transition-all disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                >
                  Next
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PresentationMode;
