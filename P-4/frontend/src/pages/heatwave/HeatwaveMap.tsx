import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ThermometerSun, AlertTriangle, Info, MapPin } from 'lucide-react';

// Mock data to simulate API response before we wire it fully
const MOCK_DISTRICTS = [
  { id: 'dl', name: 'New Delhi', temp: 45.2, risk: 'EXTREME', probability: 92, status: 'RED' },
  { id: 'rj-j', name: 'Jaipur', temp: 44.1, risk: 'EXTREME', probability: 88, status: 'RED' },
  { id: 'up-l', name: 'Lucknow', temp: 42.5, risk: 'HIGH', probability: 75, status: 'ORANGE' },
  { id: 'mh-p', name: 'Pune', temp: 38.0, risk: 'MEDIUM', probability: 45, status: 'YELLOW' },
  { id: 'ka-b', name: 'Bengaluru', temp: 34.2, risk: 'LOW', probability: 12, status: 'GREEN' }
];

export const HeatwaveMap: React.FC = () => {
  const [selectedDay, setSelectedDay] = useState(0);

  // In a real scenario, this fetches from /api/heatwave/map
  const { data: districts, isLoading } = useQuery({
    queryKey: ['heatwave-map', selectedDay],
    queryFn: () => Promise.resolve(MOCK_DISTRICTS) // mock
  });

  const getRiskColor = (status: string) => {
    switch (status) {
      case 'RED': return 'bg-rose-500 text-white';
      case 'ORANGE': return 'bg-orange-500 text-white';
      case 'YELLOW': return 'bg-amber-400 text-amber-900';
      case 'GREEN': return 'bg-emerald-500 text-white';
      default: return 'bg-slate-200 text-slate-700';
    }
  };

  return (
    <div className="space-y-8 font-sans">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Heatwave Forecast</h1>
          <p className="text-slate-500 text-sm font-medium mt-1">Live prediction models powered by Open-Meteo & NOAA Heat Index.</p>
        </div>
      </div>

      {/* Day Toggles */}
      <div className="flex gap-2">
        {['Today', 'Tomorrow', 'Day 3', 'Day 4'].map((day, idx) => (
          <button
            key={day}
            onClick={() => setSelectedDay(idx)}
            className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
              selectedDay === idx 
                ? 'bg-orange-600 text-white shadow-md' 
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {day}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Mock Map View */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs lg:col-span-2 flex flex-col min-h-[500px]">
          <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">Risk Map (India)</h3>
            <span className="text-xs text-orange-600 font-bold flex items-center gap-1"><ThermometerSun className="h-3 w-3" /> Live Data</span>
          </div>
          
          <div className="flex-1 bg-slate-50 mt-4 rounded-xl border border-slate-100 flex items-center justify-center relative overflow-hidden">
            {/* Very simple mock representation of a map with scattered points */}
            <div className="absolute inset-0 grid-lines opacity-50" />
            
            {districts?.map((d, i) => (
              <div 
                key={d.id}
                className={`absolute p-3 rounded-xl shadow-lg cursor-pointer transition-transform hover:scale-110 border border-white/20 backdrop-blur-sm ${getRiskColor(d.status)}`}
                style={{
                  top: `${20 + (i * 15)}%`,
                  left: `${30 + (i * 10) + (i%2 ? -15 : 15)}%`,
                }}
              >
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <div>
                    <p className="text-xs font-bold">{d.name}</p>
                    <p className="text-[10px] font-mono opacity-90">{d.temp}°C</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Prediction Details Panel */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs flex flex-col space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">District Analysis</h3>
          </div>
          
          {districts && districts[0] && (
            <div className="flex-1 flex flex-col items-center pt-4">
              <h2 className="text-2xl font-bold text-slate-800">{districts[0].name}</h2>
              <div className="text-sm text-slate-500 uppercase tracking-widest font-semibold mt-1">Severity: {districts[0].risk}</div>
              
              <div className="my-8 relative flex justify-center items-center">
                <svg className="w-48 h-48 transform -rotate-90">
                  <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-100" />
                  <circle 
                    cx="96" cy="96" r="88" 
                    stroke="currentColor" 
                    strokeWidth="12" 
                    fill="transparent" 
                    strokeDasharray="552.9"
                    strokeDashoffset={552.9 - (552.9 * districts[0].probability) / 100}
                    className="text-rose-500 transition-all duration-1000 ease-out" 
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-4xl font-extrabold text-slate-800">{districts[0].probability}%</span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Probability</span>
                </div>
              </div>

              <div className="w-full space-y-3">
                <div className="bg-rose-50 p-4 rounded-xl border border-rose-100 flex gap-3">
                  <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0" />
                  <div>
                    <h4 className="text-xs font-bold text-rose-800 uppercase">Govt Recommendation</h4>
                    <p className="text-xs text-rose-700 mt-1">Activate cooling centers immediately. Dispatch emergency water supplies to vulnerable zones.</p>
                  </div>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex gap-3">
                  <Info className="h-5 w-5 text-blue-600 shrink-0" />
                  <div>
                    <h4 className="text-xs font-bold text-blue-800 uppercase">Public Advisory</h4>
                    <p className="text-xs text-blue-700 mt-1">Avoid outdoor activities between 11 AM - 4 PM. Stay hydrated.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default HeatwaveMap;
