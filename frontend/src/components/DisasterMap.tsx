import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, ZoomControl, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useStore } from '../hooks/useStore';
import type { Disaster } from '../hooks/useStore';
import {
  Layers,
  Compass,
  Maximize2,
  Minimize2,
  ShieldAlert,
  MapPin,
  ExternalLink,
  Activity,
  Flame,
  Waves,
  Filter
} from 'lucide-react';
import { Link } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';

// ─── Zero-API-Key Free High-Quality Tile Providers ────────────────────────
export type TileLayerType = 'relief' | 'satellite' | 'topo' | 'standard';

interface TileProviderConfig {
  name: string;
  icon: string;
  url: string;
  attribution: string;
  maxZoom: number;
}

const TILE_PROVIDERS: Record<TileLayerType, TileProviderConfig> = {
  relief: {
    name: 'Humanitarian Relief',
    icon: '🗺️',
    url: 'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap contributors, Humanitarian OpenStreetMap Team',
    maxZoom: 19,
  },
  satellite: {
    name: 'Satellite HD',
    icon: '🛰️',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Earthstar Geographics',
    maxZoom: 18,
  },
  topo: {
    name: 'Topographic',
    icon: '⛰️',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri, USGS, FAO',
    maxZoom: 18,
  },
  standard: {
    name: 'OpenStreetMap',
    icon: '🌐',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap contributors',
    maxZoom: 19,
  },
};

const severityColors: Record<string, string> = {
  low: '#10B981',
  medium: '#F59E0B',
  high: '#F97316',
  critical: '#EF4444',
};

const severityGlow: Record<string, string> = {
  low: 'rgba(16, 185, 129, 0.45)',
  medium: 'rgba(245, 158, 11, 0.45)',
  high: 'rgba(249, 115, 22, 0.45)',
  critical: 'rgba(239, 68, 68, 0.55)',
};

const severityRadius: Record<string, number> = {
  low: 11,
  medium: 15,
  high: 19,
  critical: 23,
};

// Injects custom CSS animations and popup styling
function InjectMapStyles() {
  useEffect(() => {
    const id = 'disaster-map-enhanced-styles';
    if (document.getElementById(id)) return;
    const style = document.createElement('style');
    style.id = id;
    style.textContent = `
      @keyframes disasterPulse {
        0% { transform: translate(-50%, -50%) scale(0.85); opacity: 0.95; }
        70% { transform: translate(-50%, -50%) scale(2.8); opacity: 0; }
        100% { transform: translate(-50%, -50%) scale(2.8); opacity: 0; }
      }
      @keyframes disasterCorePulse {
        0%, 100% { opacity: 0.98; transform: translate(-50%, -50%) scale(1); }
        50% { opacity: 0.75; transform: translate(-50%, -50%) scale(1.1); }
      }
      .disaster-marker-core {
        border-radius: 50%;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        border: 2.5px solid rgba(255,255,255,0.98);
        box-shadow: 0 4px 14px rgba(0,0,0,0.35);
        animation: disasterCorePulse 2.4s ease-in-out infinite;
      }
      .disaster-marker-ring {
        border-radius: 50%;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        border: 2.5px solid;
        animation: disasterPulse 2.4s ease-out infinite;
        pointer-events: none;
      }
      .disaster-popup .leaflet-popup-content-wrapper {
        background: rgba(255, 255, 255, 0.98) !important;
        backdrop-filter: blur(18px) !important;
        border: 1.5px solid rgba(226, 232, 240, 0.9) !important;
        border-radius: 20px !important;
        box-shadow: 0 20px 45px -8px rgba(15, 23, 42, 0.28), 0 0 0 1px rgba(16,185,129,0.18) !important;
        padding: 0 !important;
        overflow: hidden !important;
        color: #0F172A !important;
      }
      .disaster-popup .leaflet-popup-content {
        margin: 0 !important;
        min-width: 250px !important;
      }
      .disaster-popup .leaflet-popup-tip {
        background: rgba(255, 255, 255, 0.98) !important;
      }
      .disaster-popup .leaflet-popup-close-button {
        color: #64748B !important;
        font-size: 20px !important;
        top: 10px !important;
        right: 12px !important;
        font-weight: bold !important;
      }
      .disaster-state-tooltip {
        background: rgba(15, 23, 42, 0.9) !important;
        backdrop-filter: blur(12px) !important;
        border: 1px solid rgba(255, 255, 255, 0.2) !important;
        border-radius: 10px !important;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3) !important;
        color: #FFFFFF !important;
        padding: 5px 10px !important;
        font-family: 'Inter', sans-serif !important;
        font-size: 11px !important;
        font-weight: 700 !important;
      }
      .disaster-state-tooltip::before {
        border-top-color: rgba(15, 23, 42, 0.9) !important;
      }
    `;
    document.head.appendChild(style);
  }, []);
  return null;
}

// Map Controller for Smooth Flying and Bounds
function MapController({
  targetCenter,
  targetZoom,
  fitTrigger,
  disasters,
}: {
  targetCenter: [number, number] | null;
  targetZoom: number | null;
  fitTrigger: number;
  disasters: Disaster[];
}) {
  const map = useMap();

  useEffect(() => {
    if (targetCenter && targetZoom) {
      map.flyTo(targetCenter, targetZoom, { duration: 1.2 });
    }
  }, [targetCenter, targetZoom, map]);

  useEffect(() => {
    if (fitTrigger > 0 && disasters.length > 0) {
      const validPoints = disasters
        .filter((d) => typeof d.lat === 'number' && typeof d.lng === 'number')
        .map((d) => [d.lat, d.lng] as [number, number]);

      if (validPoints.length > 0) {
        const bounds = L.latLngBounds(validPoints);
        map.fitBounds(bounds, { padding: [60, 60], maxZoom: 8 });
      } else {
        map.flyTo([22.5937, 78.9629], 5, { duration: 1 });
      }
    }
  }, [fitTrigger, disasters, map]);

  return null;
}

// Markers Layer with Custom DivIcons & Rich Popups
function DisasterMarkers({ filteredDisasters }: { filteredDisasters: Disaster[] }) {
  const map = useMap();

  useEffect(() => {
    const markers: L.Marker[] = [];

    filteredDisasters.forEach((d) => {
      const color = severityColors[d.severity] || '#6366f1';
      const glow = severityGlow[d.severity] || 'rgba(99, 102, 241, 0.4)';
      const size = severityRadius[d.severity] || 15;

      const iconHtml = `
        <div style="position:relative;width:${size * 2}px;height:${size * 2}px;cursor:pointer;">
          <div class="disaster-marker-ring" style="width:${size * 2}px;height:${size * 2}px;border-color:${color};animation-delay:0s;"></div>
          <div class="disaster-marker-ring" style="width:${size * 2}px;height:${size * 2}px;border-color:${color};animation-delay:0.75s;opacity:0.6;"></div>
          <div class="disaster-marker-core" style="width:${size}px;height:${size}px;background:${color};box-shadow:0 0 16px ${glow},0 2px 8px rgba(0,0,0,0.3);"></div>
        </div>
      `;

      const icon = L.divIcon({
        html: iconHtml,
        className: '',
        iconSize: [size * 2, size * 2],
        iconAnchor: [size, size],
        popupAnchor: [0, -size - 6],
      });

      const tooltipHtml = `
        <div style="display:flex;align-items:center;gap:6px;">
          <span>📍</span>
          <span>${d.state || 'India'}</span>
          <span style="
            font-size:9px;
            padding:1px 6px;
            border-radius:4px;
            background:${color};
            color:#fff;
            font-family:'JetBrains Mono',monospace;
            text-transform:uppercase;
            font-weight:800;
          ">${d.severity}</span>
        </div>
      `;

      const typeEmoji = d.type === 'flood' ? '🌊' : d.type === 'earthquake' ? '🌋' : '⚠️';

      const popupContent = `
        <div style="padding:16px 18px;font-family:'Inter',sans-serif;">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
            <span style="
              display:inline-flex;
              align-items:center;
              gap:4px;
              padding:3px 10px;
              border-radius:20px;
              font-size:9px;
              font-weight:900;
              text-transform:uppercase;
              letter-spacing:1px;
              background:${color}20;
              color:${color};
              border:1px solid ${color}55;
              font-family:'JetBrains Mono',monospace;
            ">
              <span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:${color};"></span>
              ${d.severity.toUpperCase()}
            </span>
            <span style="font-size:10px;font-weight:800;color:#64748B;font-family:'JetBrains Mono',monospace;text-transform:uppercase;">
              ${typeEmoji} ${d.type || 'Incident'}
            </span>
          </div>

          <div style="font-size:15px;font-weight:800;color:#0F172A;margin-bottom:6px;line-height:1.3;">
            ${d.name}
          </div>

          <div style="font-size:11px;color:#475569;font-weight:500;margin-bottom:12px;line-height:1.4;">
            📍 <strong style="color:#0F172A;">${d.state || 'National Cell'}</strong> &bull; 
            <span style="color:#0F172A;font-weight:700;">${(d.population || 0).toLocaleString('en-IN')}</span> citizens exposed
          </div>

          <div style="display:flex;align-items:center;justify-content:space-between;padding-top:10px;border-top:1px solid #E2E8F0;font-size:11px;">
            <div style="color:#10B981;font-weight:700;display:flex;align-items:center;gap:4px;">
              <span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:#10B981;"></span>
              ${d.confidence ? `${d.confidence}% AI Confidence` : 'Verified Telemetry'}
            </div>
            <a href="/command-center" style="
              display:inline-flex;
              align-items:center;
              gap:3px;
              font-weight:800;
              color:#047857;
              text-decoration:none;
            ">
              Intel &rarr;
            </a>
          </div>
        </div>
      `;

      const marker = L.marker([d.lat, d.lng], { icon })
        .bindTooltip(tooltipHtml, {
          className: 'disaster-state-tooltip',
          direction: 'top',
          sticky: true,
          opacity: 1,
        })
        .bindPopup(popupContent, { className: 'disaster-popup', maxWidth: 280 });

      marker.addTo(map);
      markers.push(marker);
    });

    return () => {
      markers.forEach((m) => m.remove());
    };
  }, [filteredDisasters, map]);

  return null;
}

export interface DisasterMapProps {
  className?: string;
  height?: string;
}

export const DisasterMap: React.FC<DisasterMapProps> = ({
  className = '',
  height = '100%',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const disasters = useStore((state) => state.disasters);

  // Basemap tile selection (Default: Humanitarian Relief OSM HOT - 100% free, no API key)
  const [activeLayer, setActiveLayer] = useState<TileLayerType>('relief');
  const [showLayerMenu, setShowLayerMenu] = useState(false);
  const [severityFilter, setSeverityFilter] = useState<'all' | 'critical' | 'high' | 'medium'>('all');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fitTrigger, setFitTrigger] = useState(0);

  // Filter disasters for display
  const activeDisasters = disasters.filter(
    (d) => d.status === 'published' || d.status === 'reported' || d.status === 'preparedness'
  );

  const filteredDisasters = activeDisasters.filter((d) => {
    if (severityFilter === 'all') return true;
    return d.severity === severityFilter;
  });

  // Toggle true Fullscreen
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const currentProvider = TILE_PROVIDERS[activeLayer];

  return (
    <div
      ref={containerRef}
      className={`relative w-full overflow-hidden select-none font-sans ${className}`}
      style={{ height }}
    >
      <InjectMapStyles />

      {/* ─── Top Floating Overlay Controls ─── */}
      <div className="absolute top-3 left-3 z-[1000] flex flex-wrap items-center gap-2 max-w-[calc(100%-60px)]">
        {/* Layer Switcher Pill */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowLayerMenu(!showLayerMenu)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/95 backdrop-blur-md border border-slate-200/90 text-slate-800 text-xs font-bold shadow-md hover:bg-white hover:border-emerald-500 transition-all cursor-pointer"
            title="Change Map Style"
          >
            <span>{currentProvider.icon}</span>
            <span className="hidden sm:inline font-mono">{currentProvider.name}</span>
            <Layers className="h-3 w-3 text-slate-400 ml-0.5" />
          </button>

          {showLayerMenu && (
            <div className="absolute top-full left-0 mt-1.5 w-52 bg-white/95 backdrop-blur-xl border border-slate-200 rounded-2xl shadow-xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 px-2.5 py-1">
                Base Map Style
              </div>
              {(Object.keys(TILE_PROVIDERS) as TileLayerType[]).map((key) => {
                const p = TILE_PROVIDERS[key];
                const isActive = activeLayer === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      setActiveLayer(key);
                      setShowLayerMenu(false);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                      isActive
                        ? 'bg-emerald-50 text-emerald-800 font-extrabold border border-emerald-200/60'
                        : 'text-slate-700 hover:bg-slate-100/80'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base">{p.icon}</span>
                      <span>{p.name}</span>
                    </div>
                    {isActive && <div className="w-1.5 h-1.5 rounded-full bg-emerald-600" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Severity Filter Chips */}
        <div className="hidden sm:flex items-center bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-xl p-0.5 shadow-md">
          {(['all', 'critical', 'high', 'medium'] as const).map((sev) => {
            const count = sev === 'all'
              ? activeDisasters.length
              : activeDisasters.filter((d) => d.severity === sev).length;
            const isSel = severityFilter === sev;
            return (
              <button
                key={sev}
                type="button"
                onClick={() => setSeverityFilter(sev)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold font-mono uppercase transition-all cursor-pointer ${
                  isSel
                    ? sev === 'critical'
                      ? 'bg-rose-500 text-white shadow-xs'
                      : sev === 'high'
                      ? 'bg-orange-500 text-white shadow-xs'
                      : sev === 'medium'
                      ? 'bg-amber-500 text-white shadow-xs'
                      : 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {sev} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── Top Right Quick Action Buttons ─── */}
      <div className="absolute top-3 right-3 z-[1000] flex flex-col gap-2">
        {/* Recenter India Button */}
        <button
          type="button"
          onClick={() => setFitTrigger((prev) => prev + 1)}
          className="h-8 w-8 rounded-xl bg-white/95 backdrop-blur-md border border-slate-200/90 text-slate-700 hover:text-emerald-700 hover:border-emerald-500 shadow-md flex items-center justify-center transition-all cursor-pointer"
          title="Fit All Disasters in View"
        >
          <Compass className="h-4 w-4" />
        </button>

        {/* Fullscreen Button */}
        <button
          type="button"
          onClick={toggleFullscreen}
          className="h-8 w-8 rounded-xl bg-white/95 backdrop-blur-md border border-slate-200/90 text-slate-700 hover:text-emerald-700 hover:border-emerald-500 shadow-md flex items-center justify-center transition-all cursor-pointer"
          title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
        >
          {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        </button>
      </div>

      {/* ─── Bottom-Left Live Telemetry Badge ─── */}
      <div className="absolute bottom-3 left-3 z-[1000] pointer-events-none">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 backdrop-blur-md border border-white/10 text-white text-[11px] font-mono shadow-lg">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
          </span>
          <span className="font-bold tracking-wider uppercase text-slate-200">
            {filteredDisasters.length} Active Incidents Monitored
          </span>
        </div>
      </div>

      {/* ─── Leaflet Map Container ─── */}
      <MapContainer
        center={[22.5937, 78.9629]}
        zoom={5}
        zoomControl={false}
        style={{ height: '100%', width: '100%', background: '#F8FAFC' }}
      >
        <TileLayer
          key={activeLayer}
          attribution={currentProvider.attribution}
          url={currentProvider.url}
          maxZoom={currentProvider.maxZoom}
        />
        <ZoomControl position="bottomright" />
        <MapController
          targetCenter={null}
          targetZoom={null}
          fitTrigger={fitTrigger}
          disasters={filteredDisasters}
        />
        <DisasterMarkers filteredDisasters={filteredDisasters} />
      </MapContainer>
    </div>
  );
};

export default DisasterMap;
