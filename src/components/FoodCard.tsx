import React from 'react';
import { FoodDonation, MatchScoreResult, UserRole } from '../types';
import { MatchScore } from './MatchScore';
import { StatusBadge } from './StatusBadge';
import { MapPin, Clock, ArrowRight, Inbox, Eye } from 'lucide-react';

interface FoodCardProps {
  donation: FoodDonation & { match?: MatchScoreResult };
  role?: UserRole;
  onRequest?: (donation: FoodDonation) => void;
  onViewRequests?: (donation: FoodDonation) => void;
  onViewDetails?: (donation: FoodDonation) => void;
  showMatchScore?: boolean;
}

export const FoodCard: React.FC<FoodCardProps> = ({
  donation,
  role = 'ngo',
  onRequest,
  onViewRequests,
  onViewDetails,
  showMatchScore = true,
}) => {
  const isDonor = role === 'donor';
  const isAvailable = donation.status === 'AVAILABLE' || donation.status === 'PENDING_REQUEST';

  const deadlineDate = new Date(donation.pickupDeadline);
  const diffHours = (deadlineDate.getTime() - Date.now()) / (1000 * 60 * 60);
  const hoursRemaining = Math.max(0, Math.round(diffHours * 10) / 10);
  const isUrgent = hoursRemaining <= 3;

  return (
    <div className="bg-white rounded-3xl border border-amber-900/5 shadow-warm-sm hover:shadow-warm-md transition-all duration-200 overflow-hidden flex flex-col group">
      {/* Food Image Banner */}
      <div className="relative h-48 w-full overflow-hidden bg-brand-light">
        <img
          src={donation.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80'}
          alt={donation.foodName}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />

        <div className="absolute top-3 left-3 flex items-center gap-2">
          <span
            className={`px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wider border shadow-sm ${
              donation.foodType === 'veg'
                ? 'bg-emerald-500 text-white border-emerald-600'
                : 'bg-red-500 text-white border-red-600'
            }`}
          >
            {donation.foodType === 'veg' ? 'VEG' : 'NON-VEG'}
          </span>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-black/60 backdrop-blur-md text-white border border-white/20">
            {donation.category}
          </span>
        </div>

        <div className="absolute top-3 right-3">
          <StatusBadge status={donation.status} />
        </div>

        {!isDonor && donation.match && showMatchScore && (
          <div className="absolute bottom-3 left-3">
            <MatchScore score={donation.match.matchScore} isPremium={false} size="md" />
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <h3 className="font-extrabold text-base text-brand-text group-hover:text-brand-orange transition-colors">
              {donation.foodName}
            </h3>
            <div className="flex items-baseline gap-1 text-brand-deep font-black text-lg shrink-0">
              <span>{donation.mealCount}</span>
              <span className="text-xs font-semibold text-brand-muted">meals</span>
            </div>
          </div>

          <p className="text-xs text-brand-muted line-clamp-2 mb-3">
            {donation.description}
          </p>

          {/* Details Row */}
          <div className="space-y-1.5 text-xs text-brand-muted bg-brand-cream/60 p-3 rounded-2xl border border-orange-100/70">
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-brand-orange shrink-0" />
              <span className="truncate">
                {donation.pickupLocation}
                {!isDonor && donation.match && ` (${donation.match.distanceKm} km away)`}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-brand-orange shrink-0" />
                <span className={isUrgent ? 'font-bold text-red-600' : ''}>
                  {hoursRemaining > 0 ? `${hoursRemaining} hrs left` : 'Expired'}
                </span>
              </div>
              <span className="text-brand-text font-bold">By {donation.donorName}</span>
            </div>
          </div>

          {/* Donor specific: Pending Requests indicator */}
          {isDonor && (
            <div className="mt-3 flex items-center justify-between p-2.5 bg-orange-50/70 rounded-xl border border-orange-200/60 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-brand-deep">
                <Inbox className="w-4 h-4 text-brand-orange" />
                <span>
                  {donation.pendingRequestsCount && donation.pendingRequestsCount > 0
                    ? `${donation.pendingRequestsCount} NGO Request(s) Pending`
                    : 'No pending requests'}
                </span>
              </div>
            </div>
          )}

          {/* NGO Match Explanation */}
          {!isDonor && donation.match?.explanation && (
            <div className="mt-3 text-xs bg-amber-50/90 text-amber-900 p-2.5 rounded-xl border border-amber-200/70">
              <span className="font-bold text-brand-deep">Match Score {donation.match.matchScore}%: </span>
              {donation.match.explanation}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="pt-2 border-t border-gray-100 flex items-center gap-2">
          {/* NGO Actions */}
          {!isDonor && (
            <>
              {onViewDetails && (
                <button
                  onClick={() => onViewDetails(donation)}
                  className="flex-1 py-2.5 bg-brand-light hover:bg-orange-100 text-brand-deep font-bold text-xs rounded-xl border border-orange-200 transition-all flex items-center justify-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Details</span>
                </button>
              )}

              {onRequest && isAvailable && (
                <button
                  onClick={() => onRequest(donation)}
                  className="flex-1 py-2.5 bg-brand-orange hover:bg-brand-deep text-white font-extrabold text-xs rounded-xl shadow-warm-sm hover:shadow-warm-md transition-all flex items-center justify-center gap-1.5 active:scale-95"
                >
                  <span>Request Food</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}

              {!isAvailable && (
                <div className="w-full py-2 text-center text-xs font-bold text-gray-500 bg-gray-100 rounded-xl">
                  {donation.status === 'CONFIRMED' ? 'Confirmed for NGO' : 'Unavailable'}
                </div>
              )}
            </>
          )}

          {/* Donor Actions */}
          {isDonor && (
            <>
              {onViewRequests && (
                <button
                  onClick={() => onViewRequests(donation)}
                  className="w-full py-2.5 bg-brand-orange hover:bg-brand-deep text-white font-extrabold text-xs rounded-xl shadow-warm-sm transition-all flex items-center justify-center gap-1.5"
                >
                  <Inbox className="w-4 h-4" />
                  <span>View NGO Requests ({donation.pendingRequestsCount || 0})</span>
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
