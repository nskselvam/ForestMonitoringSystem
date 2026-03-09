import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, LayerGroup } from 'react-leaflet';
import type { AnalysisResponse } from '@shared/schema';

// Center of Tamil Nadu roughly
const CENTER: [number, number] = [11.1271, 78.6569];

interface MapComponentProps {
  data: AnalysisResponse;
}

export function MapComponent({ data }: MapComponentProps) {
  // Hack to ensure leaflet is only rendered on client
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return <div className="w-full h-full bg-slate-100 animate-pulse rounded-xl" />;

  return (
    <div className="w-full h-full rounded-xl overflow-hidden border border-slate-200 shadow-inner z-0 relative">
      <MapContainer 
        center={CENTER} 
        zoom={7} 
        scrollWheelZoom={false} 
        style={{ height: '100%', width: '100%' }}
        className="z-0"
      >
        {/* Modern dark/muted map style */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        
        <LayerGroup>
          {/* Deforestation Hotspots (Red) */}
          {data.deforestation.hotspots.map((spot) => (
            <CircleMarker
              key={spot.id}
              center={spot.location}
              radius={Math.max(5, spot.pixels / 100)} // Scale radius based on pixels
              pathOptions={{ 
                color: 'hsl(0, 84%, 60%)', 
                fillColor: 'hsl(0, 84%, 60%)', 
                fillOpacity: 0.6,
                weight: 2
              }}
            >
              <Popup>
                <div className="p-1">
                  <p className="font-bold text-slate-800">{spot.area}</p>
                  <p className="text-sm text-slate-600">ID: {spot.id}</p>
                  <p className="text-sm font-mono text-red-600 font-bold mt-1">{spot.pixels} pixels lost</p>
                </div>
              </Popup>
            </CircleMarker>
          ))}

          {/* Urban Expansion Zones (Purple) */}
          {data.urbanExpansion.zones.map((zone) => (
            <CircleMarker
              key={zone.id}
              center={zone.location}
              radius={Math.max(5, zone.pixels / 100)}
              pathOptions={{ 
                color: 'hsl(271, 81%, 56%)', 
                fillColor: 'hsl(271, 81%, 56%)', 
                fillOpacity: 0.6,
                weight: 2
              }}
            >
              <Popup>
                <div className="p-1">
                  <p className="font-bold text-slate-800">{zone.area}</p>
                  <p className="text-sm text-slate-600">ID: {zone.id}</p>
                  <p className="text-sm font-mono text-purple-600 font-bold mt-1">{zone.pixels} pixels built</p>
                </div>
              </Popup>
            </CircleMarker>
          ))}
        </LayerGroup>

        {/* Legend Overlay */}
        <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm p-3 rounded-lg border border-slate-200 shadow-md z-[1000] pointer-events-none">
          <h4 className="text-xs font-bold text-slate-700 mb-2 uppercase">Map Legend</h4>
          <div className="flex flex-col gap-2 text-sm">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500 opacity-80 border border-red-600"></span>
              <span>Deforestation</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-purple-500 opacity-80 border border-purple-600"></span>
              <span>Urban Expansion</span>
            </div>
          </div>
        </div>
      </MapContainer>
    </div>
  );
}
