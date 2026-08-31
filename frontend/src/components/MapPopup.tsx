import React from 'react';
import { MapPin } from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import type { DisasterReport } from '../types';

interface MapPopupProps {
  disaster: DisasterReport;
  onInspect?: () => void;
}

export const MapPopup: React.FC<MapPopupProps> = ({ disaster, onInspect }) => {
  return (
    <div className="p-1.5 font-sans min-w-[200px] select-none text-left">
      <div className="flex items-center justify-between gap-4 mb-2">
        <span className="font-heading font-extrabold text-sm text-white truncate max-w-[120px]">
          {disaster.title}
        </span>
        <StatusBadge type="severity" value={disaster.severity} />
      </div>
      <p className="text-[11px] text-gray-300 mb-2 leading-relaxed">
        {disaster.description}
      </p>
      <div className="flex flex-col gap-1 border-t border-white/5 pt-2 text-[10px] text-gray-400 font-mono">
        <div className="flex items-center justify-between">
          <span>COORDINATES:</span>
          <span className="text-white font-bold">
            {disaster.coordinates.lat.toFixed(2)}, {disaster.coordinates.lng.toFixed(2)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span>STATUS PROTOCOL:</span>
          <StatusBadge type="report" value={disaster.status} className="scale-90 transform origin-right" />
        </div>
        {disaster.citizenSubmitted && (
          <div className="text-primary-light block text-[9px] mt-1 italic">
            Reporter: {disaster.reporterName || 'Citizen Node'}
          </div>
        )}
      </div>
      {onInspect && (
        <button
          onClick={onInspect}
          className="w-full mt-3 py-1 bg-primary/20 hover:bg-primary text-white border border-primary/30 rounded text-[10px] font-mono font-bold transition-all uppercase tracking-wider"
        >
          Orchestrate Logs
        </button>
      )}
    </div>
  );
};
export default MapPopup;
