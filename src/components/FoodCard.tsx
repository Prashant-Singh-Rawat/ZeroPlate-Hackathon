import React from 'react';
import { FoodDonation, MatchScoreResult, UserRole } from '../types';
import { MatchScore } from './MatchScore';
import { StatusBadge } from './StatusBadge';
import { DonorRatingBadge } from './DonorRatingBadge';
import { MapPin, Clock, ArrowRight, Inbox, Eye, Flame, Zap } from 'lucide-react';

interface FoodCardProps {
  donation: FoodDonation & { match?: MatchScoreResult };
  role?: UserRole;
  onRequest?: (donation: FoodDonation) => void;
  onViewRequests?: (donation: FoodDonation) => void;
  onViewDetails?: (donation: FoodDonation) => void;
  onCancelDonation?: (donation: FoodDonation) => void;
  showMatchScore?: boolean;
}

export const FoodCard: React.FC<FoodCardProps> = ({
  donation,
  role = 'ngo',
  onRequest,
  onViewRequests,
  onViewDetails,
  onCancelDonation,
  showMatchScore = true,
}) => {
  const isDonor = role === 'donor';
  const isAvailable = donation.status === 'AVAILABLE' || donation.status === 'PENDING_REQUEST';

  const deadlineDate = new Date(donation.pickupDeadline);
  const diffHours = (deadlineDate.getTime() - Date.now()) / (1000 * 60 * 60);
  const hoursRemaining = Math.max(0, Math.round(diffHours * 10) / 10);
  const isUrgent = hoursRemaining <= 3 && hoursRemaining > 0;
  const isExpired = hoursRemaining === 0;

  return (
    <div className="group bg-white dark:bg-[#1E293B] rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative flex flex-col">

      {/* Food Image */}
      <div className="relative h-44 overflow-hidden rounded-t-2xl bg-gray-100 dark:bg-slate-800">
        <img
          src={donation.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80'}
          alt={donation.foodName}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

        {/* Top badges */}
        <div className="absolute top-3 left-3 flex items-center gap-2">
          <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold tracking-wider border shadow-lg ${
            donation.foodType === 'veg'
              ? 'bg-emerald-500 text-white border-emerald-600'
              : 'bg-red-500 text-white border-red-600'
          }`}>
            {donation.foodType === 'veg' ? '🌿 VEG' : '🍗 NON-VEG'}
          </span>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-black/50 backdrop-blur-sm text-white border border-white/20">
            {donation.category}
          </span>
        </div>

        {/* Status badge top right */}
        <div className="absolute top-3 right-3">
          <StatusBadge status={donation.status} />
        </div>

        {/* Urgent banner */}
        {isUrgent && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-r from-red-600 to-orange-500 text-white text-[10px] font-extrabold text-center py-1.5 flex items-center justify-center gap-1">
            <Flame className="w-3 h-3" />
            URGENT — Expires in {hoursRemaining}h
          </div>
        )}

        {/* Match score */}
        {!isDonor && donation.match && showMatchScore && !isUrgent && (
          <div className="absolute bottom-3 left-3">
            <MatchScore score={donation.match.matchScore} isPremium={false} size="md" />
          </div>
        )}

        {/* Meal count chip */}
        <div className="absolute bottom-3 right-3 bg-black/50 backdrop-blur-sm text-white px-2.5 py-1 rounded-full text-xs font-extrabold border border-white/20">
          {donation.mealCount} meals
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 flex-1 flex flex-col gap-3">

        {/* Title row */}
        <div>
          <h3 className="font-extrabold text-sm text-gray-900 dark:text-slate-100 group-hover:text-orange-500 transition-colors leading-snug line-clamp-1">
            {donation.foodName}
          </h3>
          <p className="text-xs text-gray-400 dark:text-slate-400 line-clamp-2 mt-0.5 leading-relaxed">
            {donation.description}
          </p>
        </div>

        {/* Info pills */}
        <div className="flex flex-col gap-1.5 text-xs">
          <div className="flex items-center gap-2 text-gray-500 dark:text-slate-400">
            <MapPin className="w-3.5 h-3.5 text-orange-400 shrink-0" />
            <span className="truncate font-medium">
              {donation.pickupLocation}
              {!isDonor && donation.match && (
                <span className="text-orange-500 font-bold"> · {donation.match.distanceKm} km</span>
              )}
            </span>
          </div>
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-1.5">
              <Clock className={`w-3.5 h-3.5 shrink-0 ${isExpired ? 'text-gray-300' : isUrgent ? 'text-red-500' : 'text-orange-400'}`} />
              <span className={`font-bold ${isExpired ? 'text-gray-400' : isUrgent ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-slate-300'}`}>
                {isExpired ? 'Expired' : `${hoursRemaining} hrs left`}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-gray-500 dark:text-slate-400 font-semibold truncate max-w-[110px]">
                {donation.donorName}
              </span>
              <DonorRatingBadge donorId={donation.donorId} size="sm" showDetails />
            </div>
          </div>
        </div>

        {/* NGO Match explanation */}
        {!isDonor && donation.match?.explanation && (
          <div className="text-xs bg-orange-50 dark:bg-orange-950/30 text-orange-800 dark:text-orange-300 px-3 py-2.5 rounded-xl border border-orange-100 dark:border-orange-900/60 leading-relaxed">
            <span className="font-extrabold text-orange-600 dark:text-orange-400">
              <Zap className="w-3 h-3 inline mr-1" />{donation.match.matchScore}% Match:
            </span>{' '}
            {donation.match.explanation}
          </div>
        )}

        {/* Donor pending requests */}
        {isDonor && (
          <div className="flex items-center gap-2 px-3 py-2 bg-orange-50 dark:bg-orange-950/30 rounded-xl border border-orange-100 dark:border-orange-900/60 text-xs">
            <Inbox className="w-3.5 h-3.5 text-orange-500 shrink-0" />
            <span className="font-bold text-orange-700 dark:text-orange-300">
              {donation.pendingRequestsCount && donation.pendingRequestsCount > 0
                ? `${donation.pendingRequestsCount} NGO Request(s) Pending`
                : 'No pending requests'}
            </span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-1 mt-auto">
          {!isDonor && (
            <div className="grid grid-cols-2 gap-2">
              {onViewDetails && (
                <button
                  onClick={() => onViewDetails(donation)}
                  className="w-full py-2.5 bg-gray-50 dark:bg-slate-700 hover:bg-orange-50 dark:hover:bg-slate-600 text-gray-700 dark:text-slate-200 font-bold text-xs rounded-xl border border-gray-200 dark:border-slate-600 hover:border-orange-200 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Details</span>
                </button>
              )}
              {onRequest && isAvailable && (
                <button
                  onClick={() => onRequest(donation)}
                  className={`w-full py-2.5 bg-gradient-to-r from-orange-500 to-amber-400 hover:from-orange-600 hover:to-amber-500 text-white font-extrabold text-xs rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer ${
                    !onViewDetails ? 'col-span-2' : ''
                  }`}
                >
                  <span>Request Food</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
              {!isAvailable && (
                <div className="col-span-2 w-full py-2.5 text-center text-xs font-bold text-gray-400 dark:text-slate-500 bg-gray-100 dark:bg-slate-700 rounded-xl">
                  {donation.status === 'CONFIRMED' ? '✓ Confirmed' : 'Unavailable'}
                </div>
              )}
            </div>
          )}

          {isDonor && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {onViewRequests && (
                <button
                  onClick={() => onViewRequests(donation)}
                  className="w-full py-2.5 bg-gradient-to-r from-orange-500 to-amber-400 hover:from-orange-600 hover:to-amber-500 text-white font-extrabold text-xs rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
                >
                  <Inbox className="w-3.5 h-3.5 shrink-0" />
                  <span>Requests ({donation.pendingRequestsCount || 0})</span>
                </button>
              )}

              {onCancelDonation && isAvailable && (
                <button
                  onClick={() => onCancelDonation(donation)}
                  className="w-full py-2.5 bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/60 font-extrabold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
                >
                  <span>✕ Cancel Listing</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
