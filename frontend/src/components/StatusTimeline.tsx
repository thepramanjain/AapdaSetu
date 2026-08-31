import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import type { ReportStatus } from '../types';

interface TimelineStage {
  status: ReportStatus;
  label: string;
  desc: string;
}

interface StatusTimelineProps {
  stages: TimelineStage[];
  currentStageIndex: number;
  activeStatus?: ReportStatus;
}

export const StatusTimeline: React.FC<StatusTimelineProps> = ({ 
  stages, 
  currentStageIndex,
}) => {
  return (
    <div className="flex flex-col gap-6 relative pl-8">
      {/* Vertical bar */}
      <div className="absolute left-[11px] top-3 bottom-3 w-0.5 bg-slate-200" />
      {/* Active bar overlay */}
      <div 
        className="absolute left-[11px] top-3 w-0.5 bg-emerald-500 transition-all duration-500" 
        style={{ height: `${(currentStageIndex / (stages.length - 1)) * 92}%` }}
      />

      {stages.map((stage, idx) => {
        const isCompleted = idx < currentStageIndex;
        const isActive = idx === currentStageIndex;

        return (
          <div key={idx} className="relative flex flex-col gap-1 select-none">
            {/* Circle dot indicators */}
            <div 
              className={`absolute -left-[27px] top-1.5 w-6 h-6 rounded-full border bg-white flex items-center justify-center transition-all ${
                isCompleted ? 'border-emerald-500 text-emerald-600 bg-emerald-50' : 
                isActive ? 'border-emerald-500 text-emerald-600 scale-110 font-bold shadow-sm' : 
                'border-slate-300 text-slate-400'
              }`}
            >
              {isCompleted ? (
                <CheckCircle2 className="w-3.5 h-3.5" />
              ) : (
                <span className="text-[9px] font-mono">{idx + 1}</span>
              )}
            </div>

            <span className={`text-xs font-heading font-bold transition-colors ${
              isActive ? 'text-slate-900' : 
              isCompleted ? 'text-slate-700' : 
              'text-slate-400'
            }`}>
              {stage.label}
            </span>
            
            <p className={`text-[10px] leading-relaxed transition-colors ${
              isActive ? 'text-slate-600' :
              isCompleted ? 'text-slate-500 font-medium' :
              'text-slate-400'
            }`}>
              {stage.desc}
            </p>
          </div>
        );
      })}
    </div>
  );
};
export default StatusTimeline;
