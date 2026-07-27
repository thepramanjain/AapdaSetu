import React from 'react';
import { MapContainer, TileLayer, ZoomControl, CircleMarker, Popup } from 'react-leaflet';
import { useStore } from '../hooks/useStore';
import 'leaflet/dist/leaflet.css';

const severityColors = {
  low: '#22c55e',
  medium: '#eab308',
  high: '#f97316',
  critical: '#ef4444'
};

export const DisasterMap: React.FC = () => {
  const disasters = useStore((state) => state.disasters);

  return (
    <MapContainer
      center={[22.9734, 78.6569]}
      zoom={5}
      zoomControl={false}
      style={{ height: '100%', width: '100%', background: '#f8fafc' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
      />
      <ZoomControl position="topright" />
      {disasters.filter((d) => d.status === 'published').map((d) => (
        <CircleMarker
          key={d.id}
          center={[d.lat, d.lng]}
          radius={12}
          pathOptions={{
            color: severityColors[d.severity],
            fillColor: severityColors[d.severity],
            fillOpacity: 0.6,
            weight: 2
          }}
        >
          <Popup>
            <div style={{ fontFamily: 'Inter, sans-serif', minWidth: 210 }}>
              <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 1.2, color: '#64748b', fontWeight: 600 }}>
                {d.type}
              </div>
              <div style={{ fontWeight: 600, fontSize: 15, marginTop: 4, color: '#1e293b' }}>
                {d.name}
              </div>
              <div style={{ fontSize: 12, color: '#475569', marginTop: 6, lineHeight: 1.5 }}>
                Population: <span style={{ fontWeight: 500, color: '#0f172a' }}>{d.population.toLocaleString('en-IN')}</span>
                <br />
                Severity:{' '}
                <span style={{ fontWeight: 600, color: severityColors[d.severity] }}>
                  {d.severity.toUpperCase()}
                </span>
              </div>
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
};

export default DisasterMap;
