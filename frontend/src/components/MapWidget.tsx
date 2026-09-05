import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Polygon, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// SVG Icons as custom Leaflet icons
const createSvgIcon = (color: string, iconHtml: string) => {
  return L.divIcon({
    html: `<div class="w-8 h-8 rounded-full bg-white shadow-md border-2 border-${color} flex items-center justify-center text-${color}">${iconHtml}</div>`,
    className: 'custom-div-icon',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16]
  });
};

const disasterIcon = L.divIcon({
  html: `<div class="relative flex items-center justify-center">
    <span class="absolute inline-flex h-8 w-8 rounded-full bg-rose-400 opacity-75 animate-ping"></span>
    <div class="relative w-8 h-8 rounded-full bg-rose-600 border border-white flex items-center justify-center text-white font-bold text-xs">⚠️</div>
  </div>`,
  className: 'custom-div-icon-disaster',
  iconSize: [32, 32],
  iconAnchor: [16, 16]
});

const hospitalIcon = createSvgIcon('blue-600', '🏥');
const shelterIcon = createSvgIcon('green-600', '🏠');

// Helper to center the map when incident changes
const RecenterMap: React.FC<{ center: [number, number] }> = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 12);
  }, [center, map]);
  return null;
};

interface MapWidgetProps {
  center: [number, number];
  hospitals?: { name: string; distance: string; coordinates: [number, number] }[];
  shelters?: { name: string; distance: string; coordinates: [number, number] }[];
  threatPolygon?: [number, number][];
  evacuationRoute?: [number, number][];
}

export const MapWidget: React.FC<MapWidgetProps> = ({
  center,
  hospitals = [],
  shelters = [],
  threatPolygon = [],
  evacuationRoute = []
}) => {
  // Generate a mock polygon and evacuation route if not provided
  const resolvedPolygon: [number, number][] = threatPolygon.length > 0 ? threatPolygon : [
    [center[0] + 0.015, center[1] - 0.015],
    [center[0] + 0.015, center[1] + 0.015],
    [center[0] - 0.015, center[1] + 0.015],
    [center[0] - 0.015, center[1] - 0.015],
  ];

  const resolvedRoute: [number, number][] = evacuationRoute.length > 0 ? evacuationRoute : [
    center,
    [center[0] - 0.01, center[1] - 0.02],
    [center[0] - 0.02, center[1] - 0.03],
    [center[0] - 0.025, center[1] - 0.045],
  ];

  return (
    <div className="w-full h-[400px] rounded-xl overflow-hidden border border-slate-200 shadow-sm relative">
      <MapContainer
        center={center}
        zoom={12}
        zoomControl={true}
        style={{ height: '100%', width: '100%', background: '#F3F4F6' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Tiles &copy; <a href="https://www.hotosm.org/">Humanitarian OpenStreetMap Team</a>'
          url="https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png"
        />

        <RecenterMap center={center} />

        {/* Epicenter Marker */}
        <Marker position={center} icon={disasterIcon}>
          <Popup>
            <div className="p-1 font-sans text-xs">
              <p className="font-bold text-slate-800 text-sm">Disaster Epicenter</p>
              <p className="text-slate-500 mt-0.5">Coordinates: {center[0]}, {center[1]}</p>
            </div>
          </Popup>
        </Marker>

        {/* Threat Zone Polygon */}
        <Polygon
          positions={resolvedPolygon}
          pathOptions={{
            color: '#ef4444',
            fillColor: '#ef4444',
            fillOpacity: 0.2,
            weight: 2,
            dashArray: '4,4'
          }}
        />

        {/* Evacuation Route Polyline */}
        <Polyline
          positions={resolvedRoute}
          pathOptions={{
            color: '#16a34a',
            weight: 4,
            opacity: 0.85
          }}
        />

        {/* Hospitals Markers */}
        {hospitals.map((hospital, i) => (
          <Marker key={`hosp-${i}`} position={hospital.coordinates} icon={hospitalIcon}>
            <Popup>
              <div className="p-1 font-sans text-xs">
                <p className="font-bold text-blue-800 text-sm">🏥 Hospital: {hospital.name}</p>
                <p className="text-slate-600 mt-1">Distance: {hospital.distance}</p>
                <p className="text-slate-500">Status: High Priority Support</p>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Shelters Markers */}
        {shelters.map((shelter, i) => (
          <Marker key={`shelt-${i}`} position={shelter.coordinates} icon={shelterIcon}>
            <Popup>
              <div className="p-1 font-sans text-xs">
                <p className="font-bold text-green-800 text-sm">🏠 Shelter: {shelter.name}</p>
                <p className="text-slate-600 mt-1">Distance: {shelter.distance}</p>
                <p className="text-slate-500">Availability: Open & Operating</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default MapWidget;
