import React, { useEffect } from 'react';
import { MapContainer, TileLayer, ZoomControl, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useStore } from '../hooks/useStore';
import 'leaflet/dist/leaflet.css';

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
  critical: 'rgba(239, 68, 68, 0.5)',
};

const severityRadius: Record<string, number> = {
  low: 10,
  medium: 14,
  high: 18,
  critical: 22,
};

// Injects the pulse ring and light popup CSS
function InjectMapStyles() {
  useEffect(() => {
    const id = 'disaster-map-light-styles';
    if (document.getElementById(id)) return;
    const style = document.createElement('style');
    style.id = id;
    style.textContent = `
      @keyframes disasterPulse {
        0% { transform: translate(-50%, -50%) scale(0.8); opacity: 0.9; }
        70% { transform: translate(-50%, -50%) scale(2.8); opacity: 0; }
        100% { transform: translate(-50%, -50%) scale(2.8); opacity: 0; }
      }
      @keyframes disasterCorePulse {
        0%, 100% { opacity: 0.95; }
        50% { opacity: 0.65; }
      }
      .disaster-marker-core {
        border-radius: 50%;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        border: 2.5px solid rgba(255,255,255,0.95);
        box-shadow: 0 3px 10px rgba(0,0,0,0.25);
        animation: disasterCorePulse 2.5s ease-in-out infinite;
      }
      .disaster-marker-ring {
        border-radius: 50%;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        border: 2px solid;
        animation: disasterPulse 2.5s ease-out infinite;
        pointer-events: none;
      }
      .disaster-popup .leaflet-popup-content-wrapper {
        background: rgba(255, 255, 255, 0.97) !important;
        backdrop-filter: blur(16px) !important;
        border: 1.5px solid rgba(226, 232, 240, 0.9) !important;
        border-radius: 20px !important;
        box-shadow: 0 16px 40px rgba(15, 23, 42, 0.15), 0 0 0 1px rgba(16,185,129,0.15) !important;
        padding: 0 !important;
        overflow: hidden !important;
        color: #0F172A !important;
      }
      .disaster-popup .leaflet-popup-content {
        margin: 0 !important;
        min-width: 220px !important;
      }
      .disaster-popup .leaflet-popup-tip {
        background: rgba(255, 255, 255, 0.97) !important;
      }
      .disaster-popup .leaflet-popup-close-button {
        color: #64748B !important;
        font-size: 18px !important;
        top: 10px !important;
        right: 12px !important;
      }
      .disaster-state-tooltip {
        background: rgba(255, 255, 255, 0.95) !important;
        backdrop-filter: blur(12px) !important;
        border: 1.5px solid rgba(16, 185, 129, 0.4) !important;
        border-radius: 12px !important;
        box-shadow: 0 8px 20px rgba(15, 23, 42, 0.12) !important;
        color: #0F172A !important;
        padding: 6px 12px !important;
        font-family: 'Inter', sans-serif !important;
        font-size: 11px !important;
        font-weight: 800 !important;
      }
      .disaster-state-tooltip::before {
        border-top-color: rgba(255, 255, 255, 0.95) !important;
      }
    `;
    document.head.appendChild(style);
  }, []);
  return null;
}

// Layer for disaster markers
function DisasterMarkers() {
  const map = useMap();
  const disasters = useStore((state) => state.disasters);

  useEffect(() => {
    const markers: L.Marker[] = [];

    disasters
      .filter((d) => d.status === 'published')
      .forEach((d) => {
        const color = severityColors[d.severity] || '#6366f1';
        const glow = severityGlow[d.severity] || 'rgba(99, 102, 241, 0.4)';
        const size = severityRadius[d.severity] || 14;

        const iconHtml = `
          <div style="position:relative;width:${size * 2}px;height:${size * 2}px;">
            <div class="disaster-marker-ring" style="width:${size * 2}px;height:${size * 2}px;border-color:${color};animation-delay:0s;"></div>
            <div class="disaster-marker-ring" style="width:${size * 2}px;height:${size * 2}px;border-color:${color};animation-delay:0.8s;opacity:0.6;"></div>
            <div class="disaster-marker-core" style="width:${size}px;height:${size}px;background:${color};box-shadow:0 0 14px ${glow},0 2px 8px rgba(0,0,0,0.2);"></div>
          </div>
        `;

        const icon = L.divIcon({
          html: iconHtml,
          className: '',
          iconSize: [size * 2, size * 2],
          iconAnchor: [size, size],
          popupAnchor: [0, -size - 4],
        });

        const tooltipHtml = `
          <div style="display:flex;align-items:center;gap:6px;">
            <span style="color:#10b981;font-size:12px;">📍</span>
            <span style="font-weight:900;color:#0F172A;letter-spacing:-0.2px;">${d.state || 'India'}</span>
            <span style="
              font-size:9px;
              padding:1px 6px;
              border-radius:4px;
              background:${color}22;
              color:${color};
              font-family:'JetBrains Mono',monospace;
              text-transform:uppercase;
              font-weight:800;
            ">${d.severity}</span>
          </div>
        `;

        const popupContent = `
          <div style="padding:16px 18px;font-family:'Inter',sans-serif;">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;">
              <span style="
                display:inline-flex;
                align-items:center;
                padding:2px 10px;
                border-radius:20px;
                font-size:9px;
                font-weight:900;
                text-transform:uppercase;
                letter-spacing:1.2px;
                background:${color}18;
                color:${color};
                border:1px solid ${color}44;
                font-family:'JetBrains Mono',monospace;
              ">${d.severity.toUpperCase()}</span>
              <span style="font-size:9px;color:#64748B;font-family:'JetBrains Mono',monospace;text-transform:uppercase;letter-spacing:0.8px;font-weight:700;">${d.type || 'Disaster'}</span>
            </div>
            <div style="font-size:15px;font-weight:800;color:#0F172A;margin-bottom:8px;line-height:1.3;">${d.name}</div>
            <div style="display:flex;flex-direction:column;gap:5px;">
              <div style="font-size:11px;color:#475569;font-weight:500;">
                📍 ${d.state || 'India'} &nbsp;•&nbsp;
                <span style="color:#0F172A;font-weight:700;">${(d.population || 0).toLocaleString('en-IN')} affected</span>
              </div>
            </div>
          </div>
        `;

        const marker = L.marker([d.lat, d.lng], { icon })
          .bindTooltip(tooltipHtml, {
            className: 'disaster-state-tooltip',
            direction: 'top',
            sticky: true,
            opacity: 1
          })
          .bindPopup(popupContent, { className: 'disaster-popup', maxWidth: 260 });

        marker.addTo(map);
        markers.push(marker);
      });

    return () => {
      markers.forEach((m) => m.remove());
    };
  }, [disasters, map]);

  return null;
}

export const DisasterMap: React.FC = () => {
  return (
    <MapContainer
      center={[22.9734, 78.6569]}
      zoom={5}
      zoomControl={false}
      style={{ height: '100%', width: '100%', background: '#F8FAFC' }}
    >
      <InjectMapStyles />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
      />
      <ZoomControl position="topright" />
      <DisasterMarkers />
    </MapContainer>
  );
};

export default DisasterMap;
