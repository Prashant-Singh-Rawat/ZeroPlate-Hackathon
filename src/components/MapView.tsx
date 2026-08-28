import React, { useState } from 'react';
import { FoodDonation, MatchScoreResult } from '../types';
import { MapPin, Navigation, Utensils, Sparkles, Clock, ArrowRight, ShieldCheck } from 'lucide-react';
import { MatchScore } from './MatchScore';

interface MapViewProps {
  donations: (FoodDonation & { match?: MatchScoreResult })[];
  ngoLocation?: { name: string; latitude: number; longitude: number };
  onSelectDonation: (donation: FoodDonation & { match?: MatchScoreResult }) => void;
  onRequestDonation: (donation: FoodDonation & { match?: MatchScoreResult }) => void;
}

export const MapView: React.FC<MapViewProps> = ({
  donations,
  ngoLocation = { name: 'Hope Foundation HQ', latitude: 19.062, longitude: 72.854 },
  onSelectDonation,
  onRequestDonation,
}) => {
  const [selectedItem, setSelectedItem] = useState<(FoodDonation & { match?: MatchScoreResult }) | null>(
    donations[0] || null
  );

  // Map coordinates projection to 0-100% relative coordinates
  // Mumbai bounding box approximate: lat 19.03 to 19.14, lng 72.81 to 72.92
  const minLat = 19.03;
  const maxLat = 19.14;
  const minLng = 72.81;
  const maxLng = 72.92;

  const projectCoords = (lat: number, lng: number) => {
    const x = Math.max(10, Math.min(90, ((lng - minLng) / (maxLng - minLng)) * 80 + 10));
    // Invert y because screen coordinates go top-to-bottom
    const y = Math.max(10, Math.min(90, 100 - (((lat - minLat) / (maxLat - minLat)) * 80 + 10)));
    return { x, y };
  };

  const ngoPos = projectCoords(ngoLocation.latitude, ngoLocation.longitude);

  return (
    <div className="space-y-4">
      {/* Map Container */}
      <div className="relative w-full h-[460px] bg-gradient-to-br from-slate-900 via-stone-900 to-amber-950 rounded-3xl overflow-hidden shadow-warm-lg border-2 border-orange-950/20">
        {/* Decorative Grid Lines & Radar Rings */}
        <div className="absolute inset-0 bg-[radial-gradient(#F97316_1px,transparent_1px)] [background-size:24px_24px] opacity-15" />

        {/* Distance Range Rings from NGO HQ */}
        <div
          className="absolute rounded-full border border-orange-500/20 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          style={{
            left: `${ngoPos.x}%`,
            top: `${ngoPos.y}%`,
            width: '220px',
            height: '220px',
          }}
        >
          <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[9px] font-bold text-orange-400/60 bg-black/60 px-1.5 py-0.5 rounded">
            5 km radius
          </span>
        </div>

        <div
          className="absolute rounded-full border border-orange-500/15 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          style={{
            left: `${ngoPos.x}%`,
            top: `${ngoPos.y}%`,
            width: '380px',
            height: '380px',
          }}
        >
          <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[9px] font-bold text-orange-400/40 bg-black/60 px-1.5 py-0.5 rounded">
            15 km radius
          </span>
        </div>

        {/* NGO HQ Marker (Center Hub) */}
        <div
          className="absolute -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center cursor-pointer group"
          style={{ left: `${ngoPos.x}%`, top: `${ngoPos.y}%` }}
        >
          <div className="relative">
            <span className="absolute -inset-2 rounded-full bg-emerald-500/30 animate-ping" />
            <div className="w-9 h-9 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-lg border-2 border-white">
              <Navigation className="w-5 h-5 fill-white" />
            </div>
          </div>
          <div className="mt-1 px-2.5 py-1 bg-black/80 backdrop-blur-md rounded-full border border-emerald-400/40 text-emerald-300 font-extrabold text-[10px] whitespace-nowrap shadow-md">
            📍 Your NGO Location
          </div>
        </div>

        {/* Surplus Food Markers */}
        {donations.map((item) => {
          const pos = projectCoords(item.latitude, item.longitude);
          const isSelected = selectedItem?.id === item.id;
          const matchScore = item.match?.matchScore || 85;

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
                <div
                  className={`px-2.5 py-1 rounded-2xl font-black text-xs text-white shadow-warm-md flex items-center gap-1.5 border-2 transition-all ${
                    isSelected
                      ? 'bg-brand-orange border-white ring-4 ring-orange-500/40'
                      : 'bg-stone-800 hover:bg-stone-700 border-amber-400/60'
                  }`}
                >
                  <Utensils className="w-3.5 h-3.5" />
                  <span>{item.mealCount} Meals</span>
                  <span className="text-[10px] bg-black/40 px-1.5 py-0.5 rounded-full text-amber-300">
                    {matchScore}%
                  </span>
                </div>
              </div>

              <div className="mt-1 px-2 py-0.5 bg-black/70 backdrop-blur-sm rounded-md text-[10px] font-bold text-stone-200 truncate max-w-[130px] border border-white/10">
                {item.donorName}
              </div>
            </div>
          );
        })}

        {/* Map Legend Overlay */}
        <div className="absolute top-4 left-4 z-20 bg-black/70 backdrop-blur-md px-3 py-2 rounded-2xl border border-white/10 text-xs text-stone-300 space-y-1">
          <div className="font-extrabold text-white text-[11px] flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Live Surplus Food Radar
          </div>
          <div className="text-[10px] text-stone-400">
            Click any pin to inspect & request food
          </div>
        </div>
      </div>

      {/* Selected Food Inspection Card */}
      {selectedItem && (
        <div className="bg-white rounded-3xl border-2 border-brand-orange p-6 shadow-warm-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6 animate-status-pop">
          <div className="flex items-start gap-4 flex-1">
            <img
              src={selectedItem.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80'}
              alt={selectedItem.foodName}
              className="w-20 h-20 rounded-2xl object-cover shrink-0 border border-orange-200"
            />
            <div className="space-y-1.5 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                    selectedItem.foodType === 'veg' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                  }`}
                >
                  {selectedItem.foodType}
                </span>
                <span className="text-xs text-brand-muted font-bold">
                  {selectedItem.donorType || 'Restaurant'} • {selectedItem.donorName}
                </span>
                {selectedItem.match && (
                  <MatchScore score={selectedItem.match.matchScore} size="sm" />
                )}
              </div>

              <h3 className="text-lg font-black text-brand-text">{selectedItem.foodName}</h3>
              <p className="text-xs text-brand-muted">
                📍 {selectedItem.pickupLocation} ({selectedItem.match ? `${selectedItem.match.distanceKm} km away` : 'Nearby'})
              </p>

              {selectedItem.match?.explanation && (
                <p className="text-xs bg-amber-50 text-amber-900 p-2 rounded-xl border border-amber-200 font-medium">
                  {selectedItem.match.explanation}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2 w-full md:w-auto shrink-0">
            <button
              onClick={() => onSelectDonation(selectedItem)}
              className="w-full sm:w-auto px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-brand-text font-bold text-xs rounded-xl border transition-all"
            >
              View Full Details
            </button>
            <button
              onClick={() => onRequestDonation(selectedItem)}
              className="w-full sm:w-auto px-5 py-2.5 bg-brand-orange hover:bg-brand-deep text-white font-extrabold text-xs rounded-xl shadow-warm-sm transition-all flex items-center justify-center gap-1.5 active:scale-95"
            >
              <span>Request This Food</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
