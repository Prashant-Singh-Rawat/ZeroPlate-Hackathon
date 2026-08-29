import React, { useState, useEffect } from 'react';
import { Booking, DeliveryPerson, UserRole, BookingStatus } from '../types';
import { calculateRouteETA, RouteInfo } from '../services/maps/routingService';
import { completeBookingInCloud } from '../services/cloudSync';
import {
  MapPin,
  Truck,
  Bike,
  Clock,
  CheckCircle2,
  Phone,
  UserCheck,
  Radio,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Building2,
  Heart,
  ChevronRight,
  Send,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface LiveDeliveryMapProps {
  booking: Booking;
  currentRole: UserRole;
  currentUserId: string;
  deliveryPersons?: DeliveryPerson[];
  onRefresh: () => void;
  onShowToast: (type: 'success' | 'error' | 'warning' | 'info', msg: string) => void;
}

export const LiveDeliveryMap: React.FC<LiveDeliveryMapProps> = ({
  booking,
  currentRole,
  currentUserId,
  deliveryPersons = [],
  onRefresh,
  onShowToast,
}) => {
  const isDonor = currentRole === 'donor';
  const isNGO = currentRole === 'ngo';

  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const [selectedPersonId, setSelectedPersonId] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Compute live routing & ETA
  useEffect(() => {
    const origin = {
      lat: booking.originLatitude || booking.donorLatitude || 19.076,
      lng: booking.originLongitude || booking.donorLongitude || 72.8777,
    };
    const destination = {
      lat: booking.destinationLatitude || booking.ngoLatitude || 19.062,
      lng: booking.destinationLongitude || booking.ngoLongitude || 72.854,
    };
    const driverPos =
      booking.deliveryPersonLatitude && booking.deliveryPersonLongitude
        ? { lat: booking.deliveryPersonLatitude, lng: booking.deliveryPersonLongitude }
        : undefined;

    calculateRouteETA(origin, destination, driverPos, booking.deliveryVehicleType || 'Bike').then((info) => {
      setRouteInfo(info);
    });
  }, [booking]);

  const stages: { key: BookingStatus; label: string }[] = [
    { key: 'CONFIRMED', label: 'Confirmed' },
    { key: 'DELIVERY_ASSIGNED', label: 'Assigned' },
    { key: 'PICKUP_IN_PROGRESS', label: 'En Route to Donor' },
    { key: 'FOOD_PICKED_UP', label: 'Picked Up' },
    { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery' },
    { key: 'NEAR_DESTINATION', label: 'Near NGO' },
    { key: 'DELIVERED', label: 'Delivered' },
    { key: 'COMPLETED', label: 'Completed' },
  ];

  const getStageIndex = (st: BookingStatus) => {
    const idx = stages.findIndex((s) => s.key === st);
    return idx >= 0 ? idx : 0;
  };

  const currentStageIdx = getStageIndex(booking.status);

  // Assign delivery driver
  const handleAssignPerson = async () => {
    if (!selectedPersonId) {
      onShowToast('warning', 'Please select a delivery person to assign.');
      return;
    }

    setIsUpdating(true);
    try {
      const res = await fetch('/api/delivery/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: booking.id, deliveryPersonId: selectedPersonId }),
      });
      if (res.ok) {
        onShowToast('success', 'Delivery person assigned! Live tracking enabled.');
        onRefresh();
      }
    } catch (e) {
      onShowToast('error', 'Failed to assign delivery person.');
    } finally {
      setIsUpdating(false);
    }
  };

  // Status transition handler
  const handleUpdateStatus = async (nextStatus: BookingStatus) => {
    setIsUpdating(true);
    try {
      booking.status = nextStatus;
      if (nextStatus === 'COMPLETED') {
        booking.completedAt = new Date().toISOString();
        completeBookingInCloud(booking.id).catch(() => {});
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#F97316', '#16A34A', '#10B981'],
        });
        onShowToast('success', 'Food rescue confirmed & completed! Saved to delivery history.');
      } else {
        onShowToast('info', `Delivery status updated to: ${nextStatus.replace(/_/g, ' ')}`);
      }

      fetch('/api/delivery/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: booking.id, status: nextStatus }),
      }).catch(() => {});

      onRefresh();
    } catch (e) {
      console.warn('Status update error', e);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="bg-white rounded-[32px] border-2 border-orange-200/80 p-6 sm:p-8 shadow-warm-md space-y-6 animate-status-pop">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-black uppercase text-emerald-800 tracking-wider">
              Live Food Rescue Dispatch
            </span>
            <span className="text-[10px] bg-brand-light text-brand-deep px-2.5 py-0.5 rounded-full font-bold border border-orange-200">
              Booking #{booking.id.slice(-6)}
            </span>
          </div>
          <h3 className="text-xl font-black text-brand-text mt-1">
            {booking.foodName} ({booking.mealCount} Meals)
          </h3>
        </div>

        {/* Traffic-Aware ETA Banner */}
        <div className="flex items-center gap-3 bg-brand-cream px-4 py-2.5 rounded-2xl border border-orange-200">
          <Truck className="w-6 h-6 text-brand-orange animate-bounce" />
          <div className="text-xs">
            <span className="text-brand-muted block font-medium">
              {routeInfo?.isLiveTraffic ? 'Live Traffic ETA' : 'Estimated Travel Time'}
            </span>
            <strong className="text-brand-text font-black text-sm">
              {routeInfo ? `${routeInfo.distanceKm} km • ~${routeInfo.trafficAwareMinutes} mins (ETA ${routeInfo.etaTimestamp})` : 'Calculating...'}
            </strong>
            {routeInfo?.disclaimer && (
              <span className="text-[10px] text-amber-700 block italic">
                {routeInfo.disclaimer}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Progress Timeline Stepper */}
      <div className="space-y-2 py-2 overflow-x-auto">
        <div className="flex items-center justify-between min-w-[620px] relative px-2">
          <div className="absolute top-1/2 left-4 right-4 h-1 bg-gray-100 -translate-y-1/2 z-0" />
          <div
            className="absolute top-1/2 left-4 h-1 bg-brand-orange -translate-y-1/2 z-0 transition-all duration-500"
            style={{ width: `${(currentStageIdx / (stages.length - 1)) * 95}%` }}
          />

          {stages.map((stage, idx) => {
            const isPassed = idx <= currentStageIdx;
            const isCurrent = idx === currentStageIdx;

            return (
              <div key={stage.key} className="flex flex-col items-center relative z-10">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                    isPassed
                      ? 'bg-brand-orange text-white shadow-sm ring-4 ring-orange-100'
                      : 'bg-white border-2 border-gray-300 text-gray-400'
                  }`}
                >
                  {isPassed ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                </div>
                <span
                  className={`text-[10px] font-bold mt-1.5 whitespace-nowrap ${
                    isCurrent ? 'text-brand-orange font-black' : isPassed ? 'text-brand-text' : 'text-gray-400'
                  }`}
                >
                  {stage.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Live Map Representation (Desktop ~65% / ~35% Layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Animated Highway Map Container (65%) */}
        <div className="lg:col-span-8 relative min-h-[260px] sm:min-h-[280px] bg-gradient-to-b from-slate-950 via-slate-900 to-stone-950 rounded-3xl overflow-hidden shadow-2xl p-4 sm:p-6 flex flex-col justify-between border border-orange-500/20">
          {/* Background Grid & Starry Tech Effect */}
          <div className="absolute inset-0 bg-[radial-gradient(#F97316_1.2px,transparent_1.2px)] [background-size:20px_20px] opacity-25" />
          
          {/* Top Highway Status HUD Bar */}
          <div className="relative z-10 flex items-center justify-between px-2 pt-1">
            <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-orange-500/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-[10px] font-black text-orange-300 uppercase tracking-widest">
                🛰️ Live GPS Highway Telemetry
              </span>
            </div>
            
            <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-[10px] font-mono text-emerald-400">
              <span>⚡ Speed: <strong>38 km/h</strong></span>
              <span className="text-gray-500">•</span>
              <span>{routeInfo ? `${routeInfo.distanceKm} km remaining` : '3.9 km'}</span>
            </div>
          </div>

          {/* Main Highway Road Canvas with Stations and Moving Tempo */}
          <div className="relative z-10 w-full my-auto py-6 flex items-center justify-between">
            {/* 1. Origin Station (🍽️ Food Donor) */}
            <div className="relative z-20 flex flex-col items-center shrink-0">
              <div className="relative">
                <span className="absolute -inset-2.5 rounded-3xl bg-orange-500/30 animate-ping" />
                <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 text-white flex items-center justify-center shadow-xl border-2 border-white/80 text-2xl shadow-orange-500/40">
                  🍽️
                </div>
              </div>
              <div className="mt-2 px-3 py-1 bg-black/85 backdrop-blur-md rounded-xl text-white font-black text-[11px] border border-orange-500/30 shadow-lg text-center max-w-[120px] truncate">
                {booking.donorName || 'Food Donor'}
              </div>
              <span className="text-[9px] font-bold text-orange-400/90 uppercase tracking-wide mt-0.5">
                Pickup Origin
              </span>
            </div>

            {/* 2. Dual-Lane Asphalt Highway with Running Tempo Truck */}
            <div className="flex-1 relative h-20 mx-2 sm:mx-4 flex items-center">
              {/* Asphalt Road Bed */}
              <div className="w-full h-12 bg-gradient-to-r from-slate-900 via-stone-900 to-slate-900 rounded-2xl border-y border-amber-500/30 shadow-inner relative overflow-hidden flex items-center">
                {/* Moving Yellow Road Markings */}
                <div className="absolute inset-x-0 h-0.5 border-t-2 border-dashed border-amber-400/80 animate-pulse w-full" />
                <div 
                  className="absolute inset-0 opacity-40"
                  style={{
                    backgroundImage: 'repeating-linear-gradient(90deg, #F59E0B 0, #F59E0B 16px, transparent 16px, transparent 32px)',
                    backgroundSize: '32px 2px',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'repeat-x',
                    animation: 'roadStripes 0.8s linear infinite'
                  }}
                />
              </div>

              {/* Running Animated Tempo Car / Mini-Truck */}
              <div 
                className="absolute top-1/2 -translate-y-1/2 pointer-events-none z-30 flex flex-col items-center"
                style={{
                  animation: 'tempoDrive 6.5s ease-in-out infinite alternate',
                }}
              >
                {/* Driver & Status Speech Bubble above Tempo */}
                <div className="mb-1 px-2.5 py-0.5 bg-white/95 text-brand-deep font-black text-[9px] rounded-full border border-orange-400 shadow-md flex items-center gap-1 whitespace-nowrap animate-bounce-subtle">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  <span>🚚 {booking.deliveryPersonName || 'Rahul Varma'} (Tempo)</span>
                </div>

                {/* Vector Tempo Van / Delivery Truck with Headlights */}
                <div className="relative flex items-center">
                  {/* Trailing Wind / Speed Smoke */}
                  <span className="text-[12px] -mr-1 text-slate-400/80 animate-pulse select-none">
                    💨
                  </span>

                  {/* SVG Custom Tempo Car */}
                  <svg
                    width="68"
                    height="36"
                    viewBox="0 0 68 36"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="drop-shadow-[0_4px_10px_rgba(249,115,22,0.5)]"
                  >
                    {/* Cargo Container Body */}
                    <rect x="2" y="6" width="38" height="22" rx="3" fill="#EA580C" stroke="#FB923C" strokeWidth="1.5" />
                    {/* Cargo Door Lines & ZeroPlate Logo Text */}
                    <line x1="20" y1="6" x2="20" y2="28" stroke="#FED7AA" strokeWidth="1" strokeDasharray="2 2" />
                    <rect x="6" y="10" width="10" height="7" rx="1.5" fill="#FFF7ED" />
                    <text x="11" y="15.5" fontSize="5" fontWeight="900" fill="#EA580C" textAnchor="middle">ZP</text>
                    <text x="30" y="17" fontSize="4.5" fontWeight="800" fill="#FFFFFF" textAnchor="middle">RESCUE</text>

                    {/* Driver Cab */}
                    <path d="M40 10 L50 10 L58 18 L58 28 L40 28 Z" fill="#F97316" stroke="#FDBA74" strokeWidth="1.2" />
                    {/* Windshield */}
                    <path d="M42 12 L49 12 L55 18 L42 18 Z" fill="#93C5FD" opacity="0.9" />
                    {/* Driver Silhouette */}
                    <circle cx="46" cy="15" r="2" fill="#1E293B" />

                    {/* Front Bumper & Grill */}
                    <rect x="58" y="22" width="4" height="6" rx="1" fill="#475569" />

                    {/* Glowing Headlight & Projector Beam */}
                    <circle cx="58" cy="20" r="2" fill="#FEF08A" />
                    <polygon points="60,19 78,14 78,26 60,21" fill="url(#headlightGradient)" opacity="0.65" />

                    {/* Rear Wheel */}
                    <g className="animate-spin-slow origin-center" style={{ transformOrigin: '14px 28px' }}>
                      <circle cx="14" cy="28" r="5" fill="#1E293B" stroke="#64748B" strokeWidth="1.5" />
                      <circle cx="14" cy="28" r="2" fill="#E2E8F0" />
                    </g>

                    {/* Front Wheel */}
                    <g className="animate-spin-slow origin-center" style={{ transformOrigin: '48px 28px' }}>
                      <circle cx="48" cy="28" r="5" fill="#1E293B" stroke="#64748B" strokeWidth="1.5" />
                      <circle cx="48" cy="28" r="2" fill="#E2E8F0" />
                    </g>

                    <defs>
                      <linearGradient id="headlightGradient" x1="60" y1="20" x2="78" y2="20" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#FEF08A" stopOpacity="0.8" />
                        <stop offset="1" stopColor="#FEF08A" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
              </div>
            </div>

            {/* 3. Destination Station (❤️ NGO Receiver) */}
            <div className="relative z-20 flex flex-col items-center shrink-0">
              <div className="relative">
                <span className="absolute -inset-2.5 rounded-3xl bg-emerald-500/30 animate-ping" />
                <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-xl border-2 border-white/80 text-2xl shadow-emerald-500/40">
                  ❤️
                </div>
              </div>
              <div className="mt-2 px-3 py-1 bg-black/85 backdrop-blur-md rounded-xl text-emerald-300 font-black text-[11px] border border-emerald-500/30 shadow-lg text-center max-w-[120px] truncate">
                {booking.ngoName || 'NGO Partner'}
              </div>
              <span className="text-[9px] font-bold text-emerald-400/90 uppercase tracking-wide mt-0.5">
                NGO Delivery Hub
              </span>
            </div>
          </div>

          {/* Bottom Live Traffic & ETA Footer Bar */}
          <div className="relative z-10 flex items-center justify-between pt-2 border-t border-white/10 text-xs">
            <span className="text-orange-200/80 font-medium flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-brand-orange" />
              <span>Traffic-Aware ETA: <strong className="text-white font-bold">{routeInfo ? `~${routeInfo.trafficAwareMinutes} mins (${routeInfo.etaTimestamp})` : '~14 mins'}</strong></span>
            </span>
            <span className="px-2.5 py-0.5 bg-emerald-950/80 text-emerald-300 rounded-full font-black text-[10px] border border-emerald-800/60">
              🟢 Optimal Route Active
            </span>
          </div>

          {/* Embedded Custom CSS Keyframes for Highway Motion */}
          <style>{`
            @keyframes tempoDrive {
              0% {
                left: 6%;
                transform: translate(0, -50%) scaleX(1);
              }
              46% {
                left: 76%;
                transform: translate(0, -50%) scaleX(1);
              }
              50% {
                left: 76%;
                transform: translate(0, -50%) scaleX(-1);
              }
              96% {
                left: 6%;
                transform: translate(0, -50%) scaleX(-1);
              }
              100% {
                left: 6%;
                transform: translate(0, -50%) scaleX(1);
              }
            }
            @keyframes roadStripes {
              0% { background-position: 0 0; }
              100% { background-position: -32px 0; }
            }
            @keyframes spinSlow {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>

        {/* Live Tracking Information Card (35%) */}
        <div className="lg:col-span-4 bg-gray-50 rounded-3xl p-5 border border-gray-200 flex flex-col justify-between space-y-4">
          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-gray-200">
              <span className="font-bold text-gray-500 uppercase text-[10px]">Assigned Driver</span>
              <strong className="text-brand-text font-black">
                {booking.deliveryPersonName ? `${booking.deliveryPersonName} (${booking.deliveryVehicleType || 'Bike'})` : 'None Assigned'}
              </strong>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-500">Origin:</span>
              <span className="font-bold text-brand-text text-right max-w-[140px] truncate">
                {booking.originAddress || booking.pickupLocation}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-500">Destination:</span>
              <span className="font-bold text-brand-text text-right max-w-[140px] truncate">
                {booking.destinationAddress || 'Hope NGO Shelter'}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-500">Distance & ETA:</span>
              <span className="font-black text-brand-orange">
                {routeInfo ? `${routeInfo.distanceKm} km (~${routeInfo.trafficAwareMinutes} min)` : 'Calculating...'}
              </span>
            </div>
          </div>

          {/* Delivery Assignment or Stage Transition Actions */}
          <div className="pt-2">
            {/* Step 1: Donor Assigns Delivery Person */}
            {isDonor && booking.status === 'CONFIRMED' && !booking.deliveryPersonId && (
              <div className="space-y-2">
                <label className="block text-[11px] font-black text-brand-text uppercase">
                  Assign Delivery Driver / Volunteer:
                </label>
                <div className="flex gap-2">
                  <select
                    value={selectedPersonId}
                    onChange={(e) => setSelectedPersonId(e.target.value)}
                    className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-xl text-xs font-bold text-brand-text focus:outline-none"
                  >
                    <option value="">Select Delivery Person...</option>
                    {deliveryPersons.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.role} - {p.vehicleType})
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={handleAssignPerson}
                    disabled={isUpdating || !selectedPersonId}
                    className="px-3 py-2 bg-brand-orange hover:bg-brand-deep text-white font-black text-xs rounded-xl shadow-sm active:scale-95 disabled:bg-gray-300"
                  >
                    Assign
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Driver En Route to Donor / Food Picked Up */}
            {isDonor && booking.status === 'DELIVERY_ASSIGNED' && (
              <button
                onClick={() => handleUpdateStatus('PICKUP_IN_PROGRESS')}
                disabled={isUpdating}
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-black text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5 active:scale-95"
              >
                <Truck className="w-4 h-4" />
                <span>Start Pickup Run</span>
              </button>
            )}

            {isDonor && booking.status === 'PICKUP_IN_PROGRESS' && (
              <button
                onClick={() => handleUpdateStatus('FOOD_PICKED_UP')}
                disabled={isUpdating}
                className="w-full py-2.5 bg-brand-orange hover:bg-brand-deep text-white font-black text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5 active:scale-95"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm Food Picked Up</span>
              </button>
            )}

            {/* Step 3: Out for Delivery */}
            {isDonor && booking.status === 'FOOD_PICKED_UP' && (
              <button
                onClick={() => handleUpdateStatus('OUT_FOR_DELIVERY')}
                disabled={isUpdating}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5 active:scale-95"
              >
                <Send className="w-4 h-4" />
                <span>Start Delivery (Out for Delivery)</span>
              </button>
            )}

            {isDonor && booking.status === 'OUT_FOR_DELIVERY' && (
              <button
                onClick={() => handleUpdateStatus('DELIVERED')}
                disabled={isUpdating}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5 active:scale-95"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Mark Food Delivered at NGO</span>
              </button>
            )}

            {/* Step 4: NGO Confirms Receipt */}
            {isNGO && (booking.status === 'DELIVERED' || booking.status === 'OUT_FOR_DELIVERY') && (
              <button
                onClick={() => handleUpdateStatus('COMPLETED')}
                disabled={isUpdating}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-warm-sm transition-all flex items-center justify-center gap-2 active:scale-95 animate-pulse"
              >
                <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                <span>Confirm Receipt of Meals</span>
              </button>
            )}

            {booking.status === 'COMPLETED' && (
              <div className="w-full py-2.5 bg-emerald-100 text-emerald-900 font-black text-xs rounded-xl border border-emerald-300 text-center flex items-center justify-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-700" />
                <span>Donation Delivered & Completed</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
