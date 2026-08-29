import React, { useState, useEffect, useRef } from 'react';
import { FoodDonation, MatchScoreResult } from '../types';
import { MapPin, Navigation, Utensils, Sparkles, Clock, ArrowRight, ShieldCheck, Compass, Layers, Crosshair } from 'lucide-react';
import { MatchScore } from './MatchScore';
import L from 'leaflet';

interface MapViewProps {
  donations: (FoodDonation & { match?: MatchScoreResult })[];
  ngoLocation?: { name: string; latitude: number; longitude: number };
  onSelectDonation: (donation: FoodDonation & { match?: MatchScoreResult }) => void;
  onRequestDonation: (donation: FoodDonation & { match?: MatchScoreResult }) => void;
}

export const MapView: React.FC<MapViewProps> = ({
  donations,
  ngoLocation = { name: 'My NGO Hub', latitude: 31.25, longitude: 75.7 },
  onSelectDonation,
  onRequestDonation,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  const [selectedItem, setSelectedItem] = useState<(FoodDonation & { match?: MatchScoreResult }) | null>(
    donations[0] || null
  );
  const [mapTileType, setMapTileType] = useState<'streets' | 'satellite'>('streets');

  // Center coordinates (with fallback)
  const centerLat = typeof ngoLocation.latitude === 'number' && !isNaN(ngoLocation.latitude) ? ngoLocation.latitude : 31.25;
  const centerLng = typeof ngoLocation.longitude === 'number' && !isNaN(ngoLocation.longitude) ? ngoLocation.longitude : 75.7;

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [centerLat, centerLng],
        zoom: 13,
        zoomControl: false,
      });

      // Add Zoom Control to Top Right
      L.control.zoom({ position: 'topright' }).addTo(map);

      // Tile Layer
      const tileUrl =
        mapTileType === 'satellite'
          ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
          : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

      const tiles = L.tileLayer(tileUrl, {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      // Markers Layer
      const markersLayer = L.layerGroup().addTo(map);
      markersLayerRef.current = markersLayer;
      mapInstanceRef.current = map;

      // Invalidate size on mount for correct full container render
      setTimeout(() => {
        map.invalidateSize();
      }, 250);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Tile Layer if switched
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    // Remove existing tile layers
    map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer);
      }
    });

    const tileUrl =
      mapTileType === 'satellite'
        ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
        : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

    L.tileLayer(tileUrl, {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);
  }, [mapTileType]);

  // Update Markers & GPS Center
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;
    const map = mapInstanceRef.current;
    const layer = markersLayerRef.current;

    layer.clearLayers();

    // 1. NGO Hub Live GPS Marker
    const ngoIcon = L.divIcon({
      className: 'custom-ngo-pin',
      html: `
        <div style="position:relative; display:flex; flex-direction:column; align-items:center; transform:translate(-50%, -50%); cursor:pointer;">
          <div style="position:absolute; width:44px; height:44px; border-radius:50%; background:rgba(16,185,129,0.35); animation:pulse 2s infinite;"></div>
          <div style="width:34px; height:34px; border-radius:12px; background:#10B981; border:3px solid white; display:flex; align-items:center; justify-content:center; box-shadow:0 4px 12px rgba(0,0,0,0.3); font-size:16px;">
            🏢
          </div>
          <div style="margin-top:4px; padding:2px 8px; background:rgba(15,23,42,0.9); border:1px solid rgba(16,185,129,0.6); color:#34D399; font-weight:800; font-size:10px; border-radius:20px; white-space:nowrap; box-shadow:0 2px 8px rgba(0,0,0,0.2);">
            📍 ${ngoLocation.name || 'Your NGO Hub'}
          </div>
        </div>
      `,
      iconSize: [0, 0],
    });

    const ngoMarker = L.marker([centerLat, centerLng], { icon: ngoIcon }).addTo(layer);
    ngoMarker.bindPopup(`
      <div style="font-family:sans-serif; padding:4px;">
        <strong style="color:#10B981; font-size:13px;">🏢 ${ngoLocation.name || 'Your NGO Hub'}</strong>
        <p style="margin:4px 0 0 0; font-size:11px; color:#64748B;">GPS Telemetry: ${centerLat.toFixed(4)}° N, ${centerLng.toFixed(4)}° E</p>
      </div>
    `);

    // Radius Circle (5km)
    L.circle([centerLat, centerLng], {
      radius: 5000,
      color: '#F97316',
      weight: 1.5,
      opacity: 0.4,
      fillColor: '#F97316',
      fillOpacity: 0.05,
      dashArray: '4, 8',
    }).addTo(layer);

    // 2. Surplus Food Pins
    donations.forEach((item) => {
      const donLat = typeof item.latitude === 'number' && !isNaN(item.latitude) ? item.latitude : centerLat + 0.015;
      const donLng = typeof item.longitude === 'number' && !isNaN(item.longitude) ? item.longitude : centerLng + 0.015;
      const matchScore = item.match?.matchScore || 85;

      const isSelected = selectedItem?.id === item.id;

      const foodIcon = L.divIcon({
        className: 'custom-food-pin',
        html: `
          <div style="display:flex; flex-direction:column; align-items:center; transform:translate(-50%, -50%); cursor:pointer;">
            <div style="padding:4px 10px; background:${isSelected ? '#EA580C' : '#F97316'}; border:2px solid white; border-radius:20px; color:white; font-weight:800; font-size:11px; white-space:nowrap; box-shadow:0 4px 12px rgba(249,115,22,0.45); display:flex; align-items:center; gap:4px; transition:transform 0.2s;">
              <span>🍲</span>
              <span>${item.mealCount} Meals</span>
              <span style="background:rgba(0,0,0,0.3); padding:1px 5px; border-radius:10px; font-size:9px; color:#FEF08A;">${matchScore}%</span>
            </div>
            <div style="margin-top:2px; padding:1px 6px; background:rgba(30,41,59,0.85); border-radius:4px; font-size:9px; color:#E2E8F0; font-weight:700; max-width:120px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">
              ${item.foodName}
            </div>
          </div>
        `,
        iconSize: [0, 0],
      });

      const marker = L.marker([donLat, donLng], { icon: foodIcon }).addTo(layer);

      marker.on('click', () => {
        setSelectedItem(item);
        onSelectDonation(item);
      });
    });
  }, [donations, centerLat, centerLng, selectedItem]);

  const handleRecenterGPS = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([centerLat, centerLng], 14, { duration: 1.2 });
    }
  };

  return (
    <div className="space-y-4">
      {/* Map Card */}
      <div className="relative w-full h-[520px] rounded-3xl overflow-hidden shadow-warm-lg border border-amber-900/10 dark:border-slate-800">
        {/* Leaflet Map Canvas */}
        <div ref={mapContainerRef} className="w-full h-full z-10" />

        {/* Floating Controls Bar (Top Left) */}
        <div className="absolute top-4 left-4 z-20 flex flex-col gap-2 pointer-events-auto">
          {/* Status Badge */}
          <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-gray-200/80 dark:border-slate-700 text-xs shadow-md space-y-1">
            <div className="font-black text-gray-900 dark:text-slate-100 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Live GPS Surplus Radar</span>
            </div>
            <div className="text-[11px] font-semibold text-gray-500 dark:text-slate-400">
              {donations.length} Active Donation Pin{donations.length !== 1 ? 's' : ''} on Map
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRecenterGPS}
              className="px-3 py-1.5 bg-white/95 dark:bg-slate-800/95 hover:bg-orange-50 dark:hover:bg-slate-700 text-gray-800 dark:text-slate-200 rounded-xl border border-gray-200 dark:border-slate-700 font-extrabold text-xs flex items-center gap-1.5 shadow-sm transition-all active:scale-95 cursor-pointer"
            >
              <Crosshair className="w-3.5 h-3.5 text-brand-orange" />
              <span>Center GPS</span>
            </button>

            <button
              type="button"
              onClick={() => setMapTileType(mapTileType === 'streets' ? 'satellite' : 'streets')}
              className="px-3 py-1.5 bg-white/95 dark:bg-slate-800/95 hover:bg-orange-50 dark:hover:bg-slate-700 text-gray-800 dark:text-slate-200 rounded-xl border border-gray-200 dark:border-slate-700 font-extrabold text-xs flex items-center gap-1.5 shadow-sm transition-all active:scale-95 cursor-pointer"
            >
              <Layers className="w-3.5 h-3.5 text-brand-orange" />
              <span>{mapTileType === 'streets' ? 'Satellite' : 'Streets'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Selected Food Inspection Card */}
      {selectedItem && (
        <div className="bg-white dark:bg-[#1E293B] rounded-3xl border-2 border-brand-orange p-6 shadow-warm-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6 animate-status-pop transition-colors">
          <div className="flex items-start gap-4 flex-1">
            <img
              src={
                selectedItem.imageUrl ||
                'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80'
              }
              alt={selectedItem.foodName}
              className="w-20 h-20 rounded-2xl object-cover shrink-0 border border-orange-200 dark:border-slate-700"
            />
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                    selectedItem.foodType === 'veg'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                      : 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300'
                  }`}
                >
                  {selectedItem.foodType}
                </span>
                <span className="text-xs font-bold text-brand-muted dark:text-slate-400">
                  {selectedItem.category || selectedItem.foodCategory}
                </span>
                <span className="text-xs font-bold text-brand-orange dark:text-orange-400">
                  • {selectedItem.mealCount} Meals Available
                </span>
              </div>

              <h4 className="text-base font-black text-brand-text dark:text-slate-100">
                {selectedItem.foodName}
              </h4>

              <div className="flex items-center gap-4 text-xs text-brand-muted dark:text-slate-400 flex-wrap">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-brand-orange" />
                  <span>{selectedItem.originAddress || selectedItem.pickupAddress || selectedItem.pickupLocation || 'Pickup Location'}</span>
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                  <span>
                    Pickup Deadline:{' '}
                    {new Date(selectedItem.pickupDeadline).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-row md:flex-col items-center md:items-end justify-between w-full md:w-auto gap-3 border-t md:border-t-0 pt-3 md:pt-0 border-gray-100 dark:border-slate-800">
            {selectedItem.match && (
              <MatchScore
                score={selectedItem.match.matchScore}
                breakdown={{
                  distanceScore: selectedItem.match.distanceScore,
                  mealScore: selectedItem.match.mealQuantityScore,
                  urgencyScore: selectedItem.match.urgencyScore,
                }}
              />
            )}

            <button
              onClick={() => onRequestDonation(selectedItem)}
              className="px-6 py-2.5 bg-brand-orange hover:bg-brand-deep text-white text-xs font-black rounded-xl shadow-warm-sm hover:shadow-warm-md transition-all flex items-center gap-2 active:scale-95 cursor-pointer shrink-0"
            >
              <span>Request Food</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
