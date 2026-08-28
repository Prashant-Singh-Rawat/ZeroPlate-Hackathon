import React, { useState, useEffect } from 'react';
import { FoodDonation, MatchScoreResult } from '../types';
import {
  MapPin,
  Navigation,
  Utensils,
  Sparkles,
  Clock,
  ArrowRight,
  ShieldCheck,
  Plus,
  Minus,
  Locate,
  RefreshCw,
  Heart,
  Building,
  AlertTriangle,
} from 'lucide-react';
import { MatchScore } from './MatchScore';

interface MapViewProps {
  donations: (FoodDonation & { match?: MatchScoreResult })[];
  ngoLocation?: { name: string; latitude: number; longitude: number };
  radiusKm?: number;
  onSelectDonation: (donation: FoodDonation & { match?: MatchScoreResult }) => void;
  onRequestDonation: (donation: FoodDonation & { match?: MatchScoreResult }) => void;
  onRefresh?: () => void;
}

export const MapView: React.FC<MapViewProps> = ({
  donations,
  ngoLocation = { name: 'Hope Foundation', latitude: 19.062, longitude: 72.854 },
  radiusKm = 25,
  onSelectDonation,
  onRequestDonation,
  onRefresh,
}) => {
  const [selectedItem, setSelectedItem] = useState<(FoodDonation & { match?: MatchScoreResult }) | null>(
    donations[0] || null
  );

  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [centerOffset, setCenterOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Update selected item if donations list changes or selected item is no longer available
  useEffect(() => {
    if (selectedItem) {
      const stillExists = donations.find((d) => d.id === selectedItem.id);
      if (!stillExists) {
        setSelectedItem(donations[0] || null);
      }
    } else if (donations.length > 0) {
      setSelectedItem(donations[0]);
    }
  }, [donations]);

  // Handle missing location coordinates gracefully
  if (!ngoLocation || isNaN(ngoLocation.latitude) || isNaN(ngoLocation.longitude)) {
    return (
      <div className="flex flex-col items-center justify-center p-10 bg-white rounded-3xl border border-amber-900/10 shadow-warm-sm text-center space-y-4">
        <div className="p-4 bg-orange-100 rounded-full text-brand-orange">
          <MapPin className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-black text-brand-text">Add your location to discover nearby food donations.</h3>
        <p className="text-xs text-brand-muted max-w-md">
          Your saved NGO location is used to rank food donations by Haversine distance and render interactive radar markers.
        </p>
      </div>
    );
  }

  // Dynamic Geographic Coordinate Projection centered around NGO location
  // Bounding radius dynamically scaled by zoomLevel & search radius
  const latSpan = (radiusKm / 111) * (1.8 / zoomLevel); // ~111km per degree lat
  const lngSpan = (radiusKm / (111 * Math.cos((ngoLocation.latitude * Math.PI) / 180))) * (1.8 / zoomLevel);

  const minLat = ngoLocation.latitude - latSpan / 2;
  const maxLat = ngoLocation.latitude + latSpan / 2;
  const minLng = ngoLocation.longitude - lngSpan / 2;
  const maxLng = ngoLocation.longitude + lngSpan / 2;

  const projectCoords = (lat: number, lng: number) => {
    const rawX = ((lng - minLng) / (maxLng - minLng)) * 100 + centerOffset.x;
    const rawY = (100 - ((lat - minLat) / (maxLat - minLat)) * 100) + centerOffset.y;
    const x = Math.max(8, Math.min(92, rawX));
    const y = Math.max(8, Math.min(92, rawY));
    return { x, y };
  };

  const ngoPos = projectCoords(ngoLocation.latitude, ngoLocation.longitude);

  const handleCenterOnMe = () => {
    setZoomLevel(1);
    setCenterOffset({ x: 0, y: 0 });
  };

  return (
    <div className="space-y-4">
      {/* Map Viewport Container */}
      <div className="relative w-full h-[480px] bg-gradient-to-br from-slate-950 via-stone-900 to-amber-950 rounded-3xl overflow-hidden shadow-warm-lg border-2 border-orange-950/20 select-none">
        {/* Interactive Radial Radar Background Grid */}
        <div className="absolute inset-0 bg-[radial-gradient(#F97316_1px,transparent_1px)] [background-size:24px_24px] opacity-20" />

        {/* Dynamic Distance Radius Rings from NGO location */}
        <div
          className="absolute rounded-full border border-orange-500/25 -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-all duration-300"
          style={{
            left: `${ngoPos.x}%`,
            top: `${ngoPos.y}%`,
            width: `${180 * zoomLevel}px`,
            height: `${180 * zoomLevel}px`,
          }}
        >
          <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[9px] font-bold text-orange-400/70 bg-black/80 backdrop-blur-sm px-2 py-0.5 rounded-full border border-orange-500/30">
            5 km radar
          </span>
        </div>

        <div
          className="absolute rounded-full border border-orange-500/15 -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-all duration-300"
          style={{
            left: `${ngoPos.x}%`,
            top: `${ngoPos.y}%`,
            width: `${340 * zoomLevel}px`,
            height: `${340 * zoomLevel}px`,
          }}
        >
          <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[9px] font-bold text-orange-400/50 bg-black/80 backdrop-blur-sm px-2 py-0.5 rounded-full border border-orange-500/20">
            15 km radar
          </span>
        </div>

        {/* Map Header Overlay / Radar Status */}
        <div className="absolute top-4 left-4 z-20 bg-black/75 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-white/10 text-xs text-stone-300 flex items-center gap-3">
          <div className="flex items-center gap-2 font-extrabold text-white text-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>GPS Food Radar</span>
          </div>
          <span className="text-[11px] text-amber-300 font-semibold border-l border-white/20 pl-3">
            {donations.length} Available Donation{donations.length === 1 ? '' : 's'}
          </span>
        </div>

        {/* Map Controls (+ / - / Center / Refresh) */}
        <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
          <button
            onClick={() => setZoomLevel((z) => Math.min(2.5, z + 0.25))}
            className="p-2 bg-black/75 hover:bg-black/90 text-white rounded-xl border border-white/20 shadow-md backdrop-blur-md transition-all active:scale-95"
            title="Zoom In"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoomLevel((z) => Math.max(0.6, z - 0.25))}
            className="p-2 bg-black/75 hover:bg-black/90 text-white rounded-xl border border-white/20 shadow-md backdrop-blur-md transition-all active:scale-95"
            title="Zoom Out"
          >
            <Minus className="w-4 h-4" />
          </button>
          <button
            onClick={handleCenterOnMe}
            className="p-2 bg-brand-orange hover:bg-brand-deep text-white rounded-xl shadow-md border border-orange-400 transition-all active:scale-95"
            title="Center on NGO Location"
          >
            <Locate className="w-4 h-4" />
          </button>
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="p-2 bg-black/75 hover:bg-black/90 text-white rounded-xl border border-white/20 shadow-md backdrop-blur-md transition-all active:scale-95"
              title="Refresh Listings"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* NGO Current Location Marker (Hub / Reference Point) */}
        <div
          className="absolute -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center cursor-pointer group"
          style={{ left: `${ngoPos.x}%`, top: `${ngoPos.y}%` }}
          onClick={handleCenterOnMe}
        >
          <div className="relative">
            <span className="absolute -inset-2 rounded-full bg-emerald-500/40 animate-ping" />
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white flex items-center justify-center shadow-lg border-2 border-white">
              <Heart className="w-5 h-5 fill-white" />
            </div>
          </div>
          <div className="mt-1.5 px-3 py-1 bg-black/85 backdrop-blur-md rounded-full border border-emerald-400/50 text-emerald-300 font-extrabold text-[10px] whitespace-nowrap shadow-lg flex items-center gap-1">
            <span>❤️ You ({ngoLocation.name})</span>
          </div>
        </div>

        {/* Real Food Donor Markers */}
        {donations.map((item) => {
          const pos = projectCoords(item.latitude, item.longitude);
          const isSelected = selectedItem?.id === item.id;
          const matchScore = item.match?.matchScore || 85;

          const deadlineDate = new Date(item.pickupDeadline);
          const diffHours = (deadlineDate.getTime() - Date.now()) / (1000 * 60 * 60);
          const isUrgent = diffHours <= 3;

          return (
            <div
              key={item.id}
              onClick={() => setSelectedItem(item)}
              className={`absolute -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center cursor-pointer transition-all duration-200 ${
                isSelected ? 'scale-110 z-30' : 'hover:scale-105'
              }`}
              style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
            >
              <div className="relative">
                {isUrgent && (
                  <span className="absolute -top-1 -right-1 flex h-3 w-3 z-10">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                  </span>
                )}
                <div
                  className={`px-3 py-1.5 rounded-2xl font-black text-xs text-white shadow-warm-md flex items-center gap-1.5 border-2 transition-all ${
                    isSelected
                      ? 'bg-brand-orange border-white ring-4 ring-orange-500/40 shadow-warm-lg'
                      : 'bg-stone-800 hover:bg-stone-700 border-amber-400/60'
                  }`}
                >
                  <Utensils className="w-3.5 h-3.5 text-orange-300" />
                  <span>{item.mealCount} Meals</span>
                  <span className="text-[10px] bg-black/50 px-1.5 py-0.5 rounded-full text-amber-300 font-extrabold">
                    {matchScore}%
                  </span>
                </div>
              </div>

              <div className="mt-1 px-2.5 py-0.5 bg-black/80 backdrop-blur-sm rounded-full text-[10px] font-bold text-stone-200 truncate max-w-[140px] border border-white/10 shadow-sm flex items-center gap-1">
                <span>🍽️ {item.donorName}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Map Interactive Detail / Inspection Popup Card */}
      {selectedItem && (
        <div className="bg-white rounded-3xl border-2 border-brand-orange p-6 shadow-warm-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6 animate-status-pop">
          <div className="flex items-start gap-4 flex-1">
            <img
              src={selectedItem.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80'}
              alt={selectedItem.foodName}
              className="w-24 h-24 rounded-2xl object-cover shrink-0 border border-orange-200 shadow-sm"
            />
            <div className="space-y-1.5 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    selectedItem.foodType === 'veg' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                  }`}
                >
                  {selectedItem.foodType === 'veg' ? 'VEG' : 'NON-VEG'}
                </span>
                <span className="text-xs text-brand-muted font-bold">
                  {selectedItem.donorType || 'Restaurant'} • {selectedItem.donorName}
                </span>
                {selectedItem.match && (
                  <MatchScore score={selectedItem.match.matchScore} size="sm" />
                )}
              </div>

              <div className="flex items-baseline justify-between gap-2">
                <h3 className="text-xl font-black text-brand-text">{selectedItem.foodName}</h3>
                <span className="text-base font-black text-brand-orange shrink-0">{selectedItem.mealCount} Meals</span>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-brand-muted">
                <span>📍 {selectedItem.pickupLocation} ({selectedItem.match ? `${selectedItem.match.distanceKm} km away` : 'Nearby'})</span>
                <span className="text-emerald-700 font-extrabold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  🟢 Available
                </span>
              </div>

              {selectedItem.match?.explanation && (
                <p className="text-xs bg-amber-50 text-amber-950 p-2.5 rounded-xl border border-amber-200/80 font-medium leading-relaxed">
                  {selectedItem.match.explanation}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full md:w-auto shrink-0">
            <button
              onClick={() => onSelectDonation(selectedItem)}
              className="w-full sm:w-auto px-5 py-3 bg-brand-light hover:bg-orange-100 text-brand-deep font-extrabold text-xs rounded-xl border border-orange-200 transition-all shadow-warm-sm"
            >
              View Details
            </button>
            <button
              onClick={() => onRequestDonation(selectedItem)}
              className="w-full sm:w-auto px-6 py-3 bg-brand-orange hover:bg-brand-deep text-white font-black text-xs rounded-xl shadow-warm-md transition-all flex items-center justify-center gap-1.5 active:scale-95"
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

