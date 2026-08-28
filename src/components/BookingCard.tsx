import React from 'react';
import { Booking, UserRole } from '../types';
import { StatusBadge } from './StatusBadge';
import { MapPin, Building, CheckCircle, Check } from 'lucide-react';

interface BookingCardProps {
  booking: Booking;
  currentRole?: UserRole;
  onConfirmPickup?: (bookingId: string) => void;
}

export const BookingCard: React.FC<BookingCardProps> = ({
  booking,
  currentRole,
  onConfirmPickup,
}) => {
  const isConfirmed = booking.status === 'CONFIRMED' || booking.status === 'PICKUP_IN_PROGRESS';
  const isCompleted = booking.status === 'COMPLETED';

  return (
    <div className="bg-white rounded-3xl border border-amber-900/5 p-6 shadow-warm-sm hover:shadow-warm-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-5">
      <div className="space-y-3 flex-1">
        <div className="flex flex-wrap items-center gap-3">
          <h3 className="font-black text-lg text-brand-text">{booking.foodName}</h3>
          <span className="px-3 py-1 rounded-full text-xs font-black bg-brand-light text-brand-deep">
            {booking.mealCount} Meals
          </span>
          <StatusBadge status={booking.status} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-brand-muted font-medium">
          <div className="flex items-center gap-2">
            <Building className="w-4 h-4 text-brand-orange shrink-0" />
            <span>Food Donor: <strong className="text-brand-text">{booking.donorName}</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <Building className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>NGO Partner: <strong className="text-brand-text">{booking.ngoName}</strong></span>
          </div>
          <div className="flex items-center gap-2 sm:col-span-2">
            <MapPin className="w-4 h-4 text-brand-orange shrink-0" />
            <span>Pickup Address: <strong className="text-brand-text">{booking.pickupLocation}</strong></span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="shrink-0 flex items-center gap-3">
        {isConfirmed && onConfirmPickup && (
          <button
            onClick={() => onConfirmPickup(booking.id)}
            className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-warm-sm transition-all flex items-center gap-1.5 active:scale-95"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>Confirm Pickup Completed</span>
          </button>
        )}
        {isCompleted && (
          <div className="text-xs font-black text-emerald-700 bg-emerald-50 px-3.5 py-2 rounded-xl border border-emerald-200 flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>Completed</span>
          </div>
        )}
      </div>
    </div>
  );
};
