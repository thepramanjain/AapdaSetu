import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Radio, AlertTriangle, ShieldCheck, MapPin } from 'lucide-react';
import indiaStates from './indiaStatesData.json';

// Helper to format ID to clean State Name
export function formatStateName(id: string): string {
  if (id === 'Jammu_and_Kashmir_disp') return 'Jammu & Kashmir';
  if (id === 'Ladakh_disp') return 'Ladakh';
  if (id === 'Andaman_and_Nicobar_Islands') return 'Andaman & Nicobar';
  if (id === 'Dadra_and_Nagar_Haveli_and_Daman_and_Diu') return 'Dadra & Nagar Haveli';
  return id.replace(/_/g, ' ');
}

// Preset incident & telemetry metadata for Indian states
export interface StateMetadata {
  risk: 'Critical' | 'High' | 'Medium' | 'Stable';
  color: string;
  incident?: string;
  affected?: string;
  status: string;
  sensors: number;
}

export const stateMetaDict: Record<string, StateMetadata> = {
  Assam: {
    risk: 'Critical',
    color: '#EF4444',
    incident: 'Brahmaputra Flood Wave 3',
    affected: '4,50,000 affected',
    status: '12 NDRF Rescue Teams Deployed',
    sensors: 142
  },
  Bihar: {
    risk: 'Critical',
    color: '#EF4444',
    incident: 'Kosi River Inundation',
    affected: '3,10,000 affected',
    status: 'Ration Kits & Boat Dispatch Active',
    sensors: 118
  },
  Odisha: {
    risk: 'High',
    color: '#F97316',
    incident: 'Bay of Bengal Cyclone Watch',
    affected: '2,80,000 on alert',
    status: 'Coastal Early Warning Nodes Active',
    sensors: 96
  },
  Kerala: {
    risk: 'High',
    color: '#F97316',
    incident: 'Heavy Coastal Surge & Inflow',
    affected: '1,20,000 citizens protected',
    status: 'Automated Treasury Relief Disbursed',
    sensors: 84
  },
  'Himachal Pradesh': {
    risk: 'Medium',
    color: '#EAB308',
    incident: 'Monsoon Landslide Warning',
    affected: '65,000 monitoring',
    status: 'Slope Vibration Sensors Active',
    sensors: 72
  },
  Uttarakhand: {
    risk: 'Medium',
    color: '#EAB308',
    incident: 'River Basin Flash Inflow',
    affected: '42,000 standby',
    status: 'Glacial Outflow Monitored',
    sensors: 68
  },
  Maharashtra: {
    risk: 'Stable',
    color: '#10B981',
    incident: 'Reservoir Telemetry Normal',
    affected: 'Normal Operations',
    status: 'AI River Basin Grid Synchronized',
    sensors: 210
  },
  Gujarat: {
    risk: 'Stable',
    color: '#10B981',
    incident: 'Coastal Radar 100% Operational',
    affected: 'All Safe',
    status: '24/7 Satellite Telemetry Active',
    sensors: 165
  },
  'West Bengal': {
    risk: 'High',
    color: '#F97316',
    incident: 'Ganges Delta Water Surge',
    affected: '1,90,000 on watch',
    status: 'Flood Gate Automation Active',
    sensors: 130
  },
  Rajasthan: {
    risk: 'Stable',
    color: '#10B981',
    incident: 'Dry Zone Satellite Telemetry',
    affected: 'Normal Conditions',
    status: 'Ground Water Sensors Stable',
    sensors: 154
  },
  'Tamil Nadu': {
    risk: 'Medium',
    color: '#EAB308',
    incident: 'Northeast Monsoon Watch',
    affected: '80,000 standby',
    status: 'Urban Drainage Grid Monitored',
    sensors: 140
  },
  Karnataka: {
    risk: 'Stable',
    color: '#10B981',
    incident: 'Western Ghats Inflow Steady',
    affected: 'All Safe',
    status: 'Dam Level Sensors Connected',
    sensors: 125
  },
  'Andhra Pradesh': {
    risk: 'Medium',
    color: '#EAB308',
    incident: 'Godavari Basin Inflow',
    affected: '50,000 monitoring',
    status: 'Telemetry Stream Active',
    sensors: 110
  },
  Telangana: {
    risk: 'Stable',
    color: '#10B981',
    incident: 'Krishna River Basin Grid',
    affected: 'Normal Operations',
    status: 'Real-time AI Assessment',
    sensors: 98
  },
  'Madhya Pradesh': {
    risk: 'Stable',
    color: '#10B981',
    incident: 'Central River Network Safe',
    affected: 'All Safe',
    status: 'Narmada Valley Telemetry Active',
    sensors: 145
  },
  'Uttar Pradesh': {
    risk: 'Medium',
    color: '#EAB308',
    incident: 'Yamuna River Level Watch',
    affected: '75,000 monitoring',
    status: 'Embankment Sensors Deployed',
    sensors: 180
  },
  Punjab: {
    risk: 'Stable',
    color: '#10B981',
    incident: 'Canal Network Regulated',
    affected: 'Normal Operations',
    status: 'Agricultural Sensors Stable',
    sensors: 92
  },
  Haryana: {
    risk: 'Stable',
    color: '#10B981',
    incident: 'Drainage Corridor Normal',
    affected: 'All Safe',
    status: 'Satellite Telemetry Active',
    sensors: 88
  },
  Delhi: {
    risk: 'Medium',
    color: '#EAB308',
    incident: 'Yamuna High Water Level',
    affected: '30,000 on watch',
    status: 'Flood Barrier Sensors Active',
    sensors: 64
  }
};

const defaultMeta: StateMetadata = {
  risk: 'Stable',
  color: '#10B981',
  incident: 'Satellite Telemetry Live',
  affected: 'Normal Operations',
  status: 'AI Early Warning Node Synchronized',
  sensors: 50
};

// Major key state label coordinates on viewBox 0 0 860 1021.36
const stateLabelPins = [
  { name: 'Ladakh', x: 320, y: 110, short: 'LADAKH' },
  { name: 'Jammu & Kashmir', x: 235, y: 185, short: 'J&K' },
  { name: 'Himachal Pradesh', x: 300, y: 235, short: 'HP' },
  { name: 'Punjab', x: 230, y: 275, short: 'PUNJAB' },
  { name: 'Uttarakhand', x: 350, y: 295, short: 'UK' },
  { name: 'Rajasthan', x: 195, y: 415, short: 'RAJASTHAN' },
  { name: 'Uttar Pradesh', x: 380, y: 415, short: 'UP' },
  { name: 'Bihar', x: 525, y: 440, short: 'BIHAR' },
  { name: 'Assam', x: 700, y: 410, short: 'ASSAM' },
  { name: 'Gujarat', x: 140, y: 520, short: 'GUJARAT' },
  { name: 'Madhya Pradesh', x: 345, y: 510, short: 'MP' },
  { name: 'West Bengal', x: 595, y: 510, short: 'WB' },
  { name: 'Odisha', x: 510, y: 585, short: 'ODISHA' },
  { name: 'Maharashtra', x: 260, y: 620, short: 'MAHARASHTRA' },
  { name: 'Telangana', x: 350, y: 640, short: 'TELANGANA' },
  { name: 'Andhra Pradesh', x: 375, y: 740, short: 'ANDHRA' },
  { name: 'Karnataka', x: 265, y: 760, short: 'KARNATAKA' },
  { name: 'Kerala', x: 265, y: 885, short: 'KERALA' },
  { name: 'Tamil Nadu', x: 340, y: 880, short: 'TAMIL NADU' },
];

export interface IndiaInteractiveMapProps {
  className?: string;
  onSelectState?: (stateName: string) => void;
}

export const IndiaInteractiveMap: React.FC<IndiaInteractiveMapProps> = ({
  className = '',
  onSelectState
}) => {
  const [hoveredState, setHoveredState] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const activeStateName = hoveredState ? formatStateName(hoveredState) : null;
  const activeMeta = activeStateName ? (stateMetaDict[activeStateName] || defaultMeta) : null;

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className={`relative w-full h-full flex flex-col items-center justify-between select-none ${className}`}
    >
      {/* ─── Top Telemetry Header HUD (High Clarity) ─── */}
      <div className="w-full z-30 mb-2">
        <div
          className="flex items-center justify-between px-3.5 py-2.5 rounded-2xl border transition-all duration-300"
          style={{
            background: 'rgba(15, 23, 42, 0.92)',
            borderColor: activeMeta ? activeMeta.color : 'rgba(51, 65, 85, 0.8)',
            boxShadow: activeMeta
              ? `0 8px 24px rgba(0,0,0,0.4), 0 0 16px ${activeMeta.color}40`
              : '0 8px 24px rgba(0,0,0,0.3)',
            backdropFilter: 'blur(12px)',
          }}
        >
          {activeStateName && activeMeta ? (
            <div className="flex items-center justify-between w-full gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <span
                  className="h-3 w-3 rounded-full shrink-0 animate-pulse"
                  style={{
                    backgroundColor: activeMeta.color,
                    boxShadow: `0 0 10px ${activeMeta.color}`,
                  }}
                />
                <div className="truncate">
                  <div className="font-display font-black text-sm text-white tracking-wide flex items-center gap-2">
                    {activeStateName}
                    <span className="text-[10px] font-mono text-emerald-400 font-bold hidden sm:inline">
                      ({activeMeta.sensors} IoT Nodes)
                    </span>
                  </div>
                  <div className="text-[11px] font-medium text-slate-300 truncate">
                    {activeMeta.incident || activeMeta.status}
                  </div>
                </div>
              </div>
              <span
                className="text-[10px] font-mono font-black uppercase px-2.5 py-1 rounded-lg shrink-0 tracking-wider"
                style={{
                  background: `${activeMeta.color}25`,
                  color: activeMeta.color,
                  border: `1.5px solid ${activeMeta.color}80`,
                  boxShadow: `0 0 10px ${activeMeta.color}30`,
                }}
              >
                {activeMeta.risk} RISK
              </span>
            </div>
          ) : (
            <div className="flex items-center justify-between w-full text-slate-300 text-xs font-medium">
              <div className="flex items-center gap-2">
                <Radio className="h-4 w-4 text-emerald-400 animate-pulse" />
                <span className="font-semibold text-white">Live Satellite Radar & State Telemetry</span>
              </div>
              <span className="font-mono text-[10px] font-bold text-emerald-400 uppercase hidden sm:inline bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/40">
                36 States Connected
              </span>
            </div>
          )}
        </div>

        {/* Quick Disaster Region Filter Chips */}
        <div className="flex items-center gap-1.5 mt-2 overflow-x-auto no-scrollbar py-0.5">
          {[
            { id: 'all', label: 'All Regions' },
            { id: 'Assam', label: 'Assam (Flood)', risk: '#EF4444' },
            { id: 'Bihar', label: 'Bihar (Surge)', risk: '#EF4444' },
            { id: 'Odisha', label: 'Odisha (Cyclone)', risk: '#F97316' },
            { id: 'Kerala', label: 'Kerala (Inflow)', risk: '#F97316' },
            { id: 'Himachal_Pradesh', label: 'Himachal (Alert)', risk: '#EAB308' },
          ].map((chip) => {
            const isSelected = hoveredState === chip.id;
            return (
              <button
                key={chip.id}
                onClick={() => {
                  if (chip.id === 'all') {
                    setHoveredState(null);
                  } else {
                    setHoveredState(chip.id);
                    onSelectState?.(formatStateName(chip.id));
                  }
                }}
                className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-full whitespace-nowrap transition-all border ${
                  isSelected
                    ? 'bg-emerald-500 text-slate-950 border-emerald-300 shadow-md font-black scale-105'
                    : 'bg-slate-900/80 text-slate-300 border-slate-700/80 hover:bg-slate-800 hover:text-white'
                }`}
              >
                {chip.risk && (
                  <span
                    className="inline-block h-1.5 w-1.5 rounded-full mr-1.5"
                    style={{ backgroundColor: chip.risk }}
                  />
                )}
                {chip.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── Ultra-Sharp High-Definition SVG Vector Map ─── */}
      <div className="relative w-full h-[380px] sm:h-[420px] flex items-center justify-center">
        <svg
          viewBox="0 0 860 1021.36"
          className="w-full h-full max-h-[420px] transition-all duration-300"
          style={{
            shapeRendering: 'geometricPrecision',
          }}
        >
          {/* Subtle Radar Scanner Glow Gradient */}
          <defs>
            <radialGradient id="mapCenterGlow" cx="45%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(16, 185, 129, 0.08)" />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>
            <filter id="crispGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#10B981" floodOpacity="0.6" />
            </filter>
          </defs>

          <rect width="860" height="1021.36" fill="url(#mapCenterGlow)" />

          {/* Render All Indian States with Sharp High-Contrast Outlines */}
          <g id="map-states">
            {indiaStates.map((state) => {
              const stateName = formatStateName(state.id);
              const isHovered = hoveredState === state.id;
              const meta = stateMetaDict[stateName] || defaultMeta;

              // High-contrast, sharp color schema
              let fill = '#1E293B'; // Crisp deep slate
              let stroke = '#475569'; // Crisp Slate Border
              let strokeWidth = 1.5;

              if (isHovered) {
                fill = meta.risk === 'Critical'
                  ? 'rgba(239, 68, 68, 0.65)'
                  : meta.risk === 'High'
                  ? 'rgba(249, 115, 22, 0.65)'
                  : meta.risk === 'Medium'
                  ? 'rgba(234, 179, 8, 0.65)'
                  : 'rgba(16, 185, 129, 0.65)';
                stroke = meta.color;
                strokeWidth = 3.5;
              } else if (meta.risk === 'Critical') {
                fill = 'rgba(239, 68, 68, 0.38)';
                stroke = '#EF4444';
                strokeWidth = 2.2;
              } else if (meta.risk === 'High') {
                fill = 'rgba(249, 115, 22, 0.32)';
                stroke = '#F97316';
                strokeWidth = 2.0;
              } else if (meta.risk === 'Medium') {
                fill = 'rgba(234, 179, 8, 0.22)';
                stroke = '#EAB308';
                strokeWidth = 1.6;
              } else {
                fill = 'rgba(30, 41, 59, 0.85)';
                stroke = '#64748B';
                strokeWidth = 1.4;
              }

              return (
                <path
                  key={state.id}
                  id={state.id}
                  d={state.d}
                  fill={fill}
                  stroke={stroke}
                  strokeWidth={strokeWidth}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  className="transition-colors duration-150 cursor-pointer"
                  style={{
                    filter: isHovered ? `drop-shadow(0 0 12px ${meta.color})` : undefined,
                  }}
                  onMouseEnter={() => setHoveredState(state.id)}
                  onMouseLeave={() => setHoveredState(null)}
                  onClick={() => {
                    setHoveredState(state.id);
                    onSelectState?.(stateName);
                  }}
                />
              );
            })}
          </g>

          {/* ─── State Names & Telemetry Markers on SVG (Clear & Sharp) ─── */}
          <g id="map-labels" pointerEvents="none">
            {stateLabelPins.map((pin) => {
              const meta = stateMetaDict[pin.name] || defaultMeta;
              const isAlert = meta.risk === 'Critical' || meta.risk === 'High';

              return (
                <g key={pin.name} transform={`translate(${pin.x}, ${pin.y})`}>
                  {/* Pulsing Beacon for Active Disaster Zones */}
                  {isAlert && (
                    <circle
                      r="9"
                      fill="none"
                      stroke={meta.color}
                      strokeWidth="2"
                      className="animate-ping"
                      opacity="0.8"
                    />
                  )}
                  {/* Pin Core Dot */}
                  <circle
                    r={isAlert ? '4.5' : '3'}
                    fill={meta.color}
                    stroke="#0F172A"
                    strokeWidth="1.5"
                  />
                  {/* Crisp State Name Label */}
                  <text
                    x="7"
                    y="4"
                    fill="#FFFFFF"
                    fontSize={isAlert ? "12" : "10"}
                    fontWeight={isAlert ? "900" : "700"}
                    fontFamily="Inter, system-ui, sans-serif"
                    letterSpacing="0.5"
                    stroke="#0F172A"
                    strokeWidth="2.5"
                    paintOrder="stroke"
                    style={{ textShadow: '0 2px 4px rgba(0,0,0,0.9)' }}
                  >
                    {pin.short}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>
      </div>

      {/* ─── Floating Cursor HUD Tooltip (Crisp & Informative) ─── */}
      <AnimatePresence>
        {hoveredState && activeStateName && activeMeta && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.12 }}
            className="absolute z-40 pointer-events-none rounded-2xl shadow-2xl backdrop-blur-xl border"
            style={{
              left: Math.min(Math.max(mousePos.x + 15, 10), (containerRef.current?.clientWidth || 400) - 220),
              top: Math.max(mousePos.y - 65, 45),
              background: 'rgba(10, 18, 36, 0.96)',
              borderColor: activeMeta.color,
              boxShadow: `0 14px 36px rgba(0,0,0,0.6), 0 0 24px ${activeMeta.color}50`,
              padding: '12px 16px',
              minWidth: '190px',
            }}
          >
            <div className="flex items-center gap-2 mb-1.5">
              <span
                className="h-2.5 w-2.5 rounded-full shrink-0 animate-ping"
                style={{ backgroundColor: activeMeta.color }}
              />
              <span className="font-display font-black text-sm text-white whitespace-nowrap">
                {activeStateName}
              </span>
              <span
                className="text-[9px] font-mono font-black uppercase px-2 py-0.5 rounded-md ml-auto shrink-0"
                style={{
                  background: `${activeMeta.color}30`,
                  color: activeMeta.color,
                  border: `1px solid ${activeMeta.color}80`,
                }}
              >
                {activeMeta.risk}
              </span>
            </div>

            <div className="text-[11px] text-slate-200 font-semibold leading-tight mb-1">
              {activeMeta.incident || activeMeta.status}
            </div>

            <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-1 border-t border-slate-700/60">
              <span>{activeMeta.affected || 'Active Sensors'}</span>
              <span className="text-emerald-400 font-bold">{activeMeta.sensors} Nodes Live</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default IndiaInteractiveMap;
