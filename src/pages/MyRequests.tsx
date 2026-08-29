import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { FoodRequest } from '../types';
import { MatchScore } from '../components/MatchScore';
import { LoadingState } from '../components/LoadingState';
import { EmptyState } from '../components/EmptyState';
import { Inbox, Clock, CheckCircle2, XCircle, Building, MapPin, ArrowRight } from 'lucide-react';

import { getLocalRequests, cancelLocalRequest } from '../services/requestStorage';
import { syncCloudRequests } from '../services/cloudSync';

interface MyRequestsProps {
  onNavigateFindFood: () => void;
  onNavigateBookings: () => void;
  onShowToast: (type: 'success' | 'error' | 'warning' | 'info', msg: string) => void;
}

export const MyRequests: React.FC<MyRequestsProps> = ({
  onNavigateFindFood,
  onNavigateBookings,
  onShowToast,
}) => {
  const { user } = useAuth();

  const isMatchingNgo = (r: FoodRequest) => {
    if (r.status === 'CANCELLED') return false;
    const userEmail = user?.email?.toLowerCase();
    const userId = user?.id?.toLowerCase();
    const rNgoId = r.ngoId?.toLowerCase();
    if (userEmail) {
      return rNgoId === userEmail || rNgoId === userId;
    }
    return rNgoId === 'ngo_hope' || rNgoId === userId;
  };

  const [requests, setRequests] = useState<FoodRequest[]>(() => {
    const local = getLocalRequests();
    return local.filter(isMatchingNgo);
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchRequests();
    const interval = setInterval(() => {
      fetchRequests();
    }, 8000);
    return () => clearInterval(interval);
  }, [user]);

  const fetchRequests = async () => {
    try {
      const allRequests = await syncCloudRequests();
      setRequests(allRequests.filter(isMatchingNgo));
    } catch (e) {
      console.warn('Fetch NGO requests error', e);
    }
  };

  const handleCancelRequest = async (requestId: string) => {
    cancelLocalRequest(requestId);
    fetch('/api/requests/' + requestId + '/cancel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ngoId: user?.id || 'ngo_hope' }),
    }).catch(() => {});

    onShowToast('info', 'Request cancelled.');
    fetchRequests();
  };

  return (
    <div className="space-y-6 animate-fadeIn w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-brand-text dark:text-slate-100">
            My Food Requests
          </h1>
          <p className="text-xs sm:text-sm font-medium text-brand-muted dark:text-slate-400 mt-1">
            Track requests sent to food donors. Accepted requests automatically convert to confirmed bookings.
          </p>
        </div>

        <button
          onClick={onNavigateFindFood}
          className="px-5 py-2.5 bg-brand-orange hover:bg-brand-deep text-white font-black text-xs rounded-xl shadow-warm-sm transition-all flex items-center justify-center gap-2 active:scale-95 shrink-0 cursor-pointer"
        >
          <span>Find More Surplus Food</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {isLoading ? (
        <LoadingState message="Loading your submitted food requests..." />
      ) : requests.length === 0 ? (
        <EmptyState
          title="No Active Food Requests"
          description="Browse nearby surplus food listings and submit a request to food donors."
          actionLabel="Find Surplus Food"
          onAction={onNavigateFindFood}
        />
      ) : (
        <div className="space-y-4 w-full">
          {requests.map((req) => {
            const isPending = req.status === 'PENDING';
            const isAccepted = req.status === 'ACCEPTED';
            const isRejected = req.status === 'REJECTED';

            return (
              <div
                key={req.id}
                className={`bg-white dark:bg-[#1E293B] rounded-3xl border p-5 sm:p-6 shadow-warm-sm hover:shadow-warm-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  isAccepted
                    ? 'border-emerald-300 dark:border-emerald-700 bg-emerald-50/30 dark:bg-emerald-950/20'
                    : isRejected
                    ? 'border-gray-200 dark:border-slate-700 opacity-80'
                    : 'border-orange-200 dark:border-slate-700'
                }`}
              >
                <div className="space-y-2.5 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="font-black text-base sm:text-lg text-brand-text dark:text-slate-100">
                      {req.foodName}
                    </h3>
                    <span className="px-3 py-1 rounded-full text-xs font-black bg-brand-light dark:bg-orange-950/60 text-brand-deep dark:text-orange-300">
                      {req.requestedMeals} Meals
                    </span>
                    <MatchScore score={req.matchScore} size="sm" />
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-black uppercase flex items-center gap-1 ${
                        isAccepted
                          ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300'
                          : isRejected
                          ? 'bg-red-100 dark:bg-red-950/80 text-red-800 dark:text-red-300'
                          : 'bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 animate-pulse-subtle'
                      }`}
                    >
                      {isAccepted && <CheckCircle2 className="w-3.5 h-3.5" />}
                      {isRejected && <XCircle className="w-3.5 h-3.5" />}
                      {isPending && <Clock className="w-3.5 h-3.5" />}
                      <span>
                        {isPending
                          ? 'Pending Donor Approval'
                          : isRejected
                          ? 'Not Allotted (Booked by Other)'
                          : req.status}
                      </span>
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-brand-muted dark:text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <Building className="w-4 h-4 text-brand-orange" />
                      <span>
                        Donor: <strong className="text-brand-text dark:text-slate-200">{req.donorName}</strong>
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-brand-orange" />
                      <span>{req.distanceKm} km away</span>
                    </div>
                  </div>

                  {isAccepted && (
                    <div className="text-xs bg-emerald-100 dark:bg-emerald-950/80 text-emerald-900 dark:text-emerald-200 font-bold p-3 rounded-2xl flex items-center justify-between">
                      <span>🎉 Donor accepted your request! Confirmed for collection.</span>
                      <button
                        onClick={onNavigateBookings}
                        className="underline font-black hover:text-emerald-950 dark:hover:text-white ml-2 cursor-pointer"
                      >
                        View in Bookings →
                      </button>
                    </div>
                  )}

                  {isRejected && (
                    <div className="text-xs bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 font-medium p-3 rounded-2xl border border-amber-200 dark:border-amber-900/50">
                      ⚠️ This food donation was accepted and allotted to another NGO.
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="shrink-0 flex items-center gap-2 pt-2 md:pt-0">
                  {isPending && (
                    <button
                      onClick={() => handleCancelRequest(req.id)}
                      className="px-4 py-2 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-300 font-bold text-xs rounded-xl border border-gray-200 dark:border-slate-700 transition-all cursor-pointer"
                    >
                      Cancel Request
                    </button>
                  )}
                  {isAccepted && (
                    <button
                      onClick={onNavigateBookings}
                      className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-warm-sm transition-all cursor-pointer"
                    >
                      Open Booking
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
