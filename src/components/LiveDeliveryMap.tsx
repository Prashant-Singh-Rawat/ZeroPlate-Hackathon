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
        {/* Map Container (65%) */}
        <div className="lg:col-span-8 relative min-h-[220px] bg-gradient-to-br from-slate-950 via-stone-900 to-amber-950 rounded-3xl overflow-hidden shadow-inner p-6 flex items-center justify-around border border-amber-950/30">
          <div className="absolute inset-0 bg-[radial-gradient(#F97316_1px,transparent_1px)] [background-size:16px_16px] opacity-20" />

          {/* Origin Marker (🍽️ Donor) */}
          <div className="relative z-10 flex flex-col items-center">
            <div className="relative">
              <span className="absolute -inset-2 rounded-full bg-orange-500/30 animate-ping" />
              <div className="w-11 h-11 rounded-2xl bg-brand-orange text-white flex items-center justify-center shadow-lg border-2 border-white text-lg">
                🍽️
              </div>
            </div>
            <span className="mt-1.5 px-3 py-0.5 bg-black/80 backdrop-blur-md rounded-full text-white font-extrabold text-[10px] border border-white/20">
              {booking.donorName}
            </span>
          </div>

          {/* Delivery Driver in Transit (🚴) */}
          <div className="flex-1 max-w-[180px] flex flex-col items-center relative z-10 px-2">
            <div className="w-full h-0.5 border-t-2 border-dashed border-orange-400/80 animate-pulse" />
            <div className="mt-1 px-3 py-1 bg-white/95 text-brand-deep font-black text-[10px] rounded-full border border-orange-300 shadow-md flex items-center gap-1.5">
              <Bike className="w-3.5 h-3.5 text-brand-orange" />
              <span>{booking.deliveryPersonName || 'Assign Driver'}</span>
            </div>
            <span className="text-[9px] text-orange-200 mt-0.5 font-mono">
              {routeInfo ? `${routeInfo.distanceKm} km remaining` : 'Calculating route...'}
            </span>
          </div>

          {/* Destination Marker (❤️ NGO) */}
          <div className="relative z-10 flex flex-col items-center">
            <div className="relative">
              <span className="absolute -inset-2 rounded-full bg-emerald-500/30 animate-ping" />
              <div className="w-11 h-11 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-lg border-2 border-white text-lg">
                ❤️
              </div>
            </div>
            <span className="mt-1.5 px-3 py-0.5 bg-black/80 backdrop-blur-md rounded-full text-emerald-300 font-extrabold text-[10px] border border-emerald-400/30">
              {booking.ngoName}
            </span>
          </div>
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
