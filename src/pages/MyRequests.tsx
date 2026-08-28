import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { FoodRequest } from '../types';
import { MatchScore } from '../components/MatchScore';
import { LoadingState } from '../components/LoadingState';
import { EmptyState } from '../components/EmptyState';
import { Inbox, Clock, CheckCircle2, XCircle, Building, MapPin, ArrowRight } from 'lucide-react';

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
  const [requests, setRequests] = useState<FoodRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, [user]);

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/requests?ngoId=${user?.id || 'ngo_hope'}`);
      if (res.ok) {
        const data = await res.json();
        setRequests(data);
      }
    } catch (e) {
      console.warn('Fetch NGO requests error', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelRequest = async (requestId: string) => {
    try {
      const res = await fetch(`/api/requests/${requestId}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ngoId: user?.id || 'ngo_hope' }),
      });

      if (res.ok) {
        onShowToast('info', 'Request cancelled.');
        fetchRequests();
      } else {
        const data = await res.json();
        onShowToast('error', data.error || 'Failed to cancel request.');
      }
    } catch (e) {
      onShowToast('error', 'Network error.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-brand-text">My Food Requests</h1>
          <p className="text-xs font-medium text-brand-muted mt-1">
            Track requests sent to food donors. Accepted requests automatically convert to confirmed bookings.
          </p>
        </div>

        <button
          onClick={onNavigateFindFood}
          className="px-5 py-2.5 bg-brand-orange hover:bg-brand-deep text-white font-black text-xs rounded-xl shadow-warm-sm transition-all flex items-center gap-2 active:scale-95 shrink-0"
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
        <div className="space-y-4">
          {requests.map((req) => {
            const isPending = req.status === 'PENDING';
            const isAccepted = req.status === 'ACCEPTED';
            const isRejected = req.status === 'REJECTED';

            return (
              <div
                key={req.id}
                className={`bg-white rounded-3xl border p-5 shadow-warm-sm hover:shadow-warm-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  isAccepted
                    ? 'border-emerald-300 bg-emerald-50/20'
                    : isRejected
                    ? 'border-gray-200 opacity-80'
                    : 'border-orange-200'
                }`}
              >
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="font-black text-base text-brand-text">{req.foodName}</h3>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-brand-light text-brand-deep">
                      {req.requestedMeals} Meals
                    </span>
                    <MatchScore score={req.matchScore} size="sm" />
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-black uppercase flex items-center gap-1 ${
                        isAccepted
                          ? 'bg-emerald-100 text-emerald-800'
                          : isRejected
                          ? 'bg-red-100 text-red-800'
                          : 'bg-amber-100 text-amber-900 animate-pulse-subtle'
                      }`}
                    >
                      {isAccepted && <CheckCircle2 className="w-3.5 h-3.5" />}
                      {isRejected && <XCircle className="w-3.5 h-3.5" />}
                      {isPending && <Clock className="w-3.5 h-3.5" />}
                      <span>{isPending ? 'Pending Donor Approval' : req.status}</span>
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-brand-muted">
                    <div className="flex items-center gap-1.5">
                      <Building className="w-4 h-4 text-brand-orange" />
                      <span>Donor: <strong className="text-brand-text">{req.donorName}</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-brand-orange" />
                      <span>{req.distanceKm} km away</span>
                    </div>
                  </div>

                  {isAccepted && (
                    <div className="text-xs bg-emerald-100 text-emerald-900 font-bold p-2.5 rounded-xl flex items-center justify-between">
                      <span>🎉 Donor accepted your request! Confirmed for collection.</span>
                      <button
                        onClick={onNavigateBookings}
                        className="underline font-black hover:text-emerald-950 ml-2"
                      >
                        View in Bookings →
                      </button>
                    </div>
                  )}

                  {isRejected && (
                    <div className="text-xs bg-gray-100 text-gray-700 p-2 rounded-xl">
                      This donation was declined or assigned to another local organization.
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="shrink-0 flex items-center gap-2">
                  {isPending && (
                    <button
                      onClick={() => handleCancelRequest(req.id)}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl border transition-all"
                    >
                      Cancel Request
                    </button>
                  )}
                  {isAccepted && (
                    <button
                      onClick={onNavigateBookings}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-warm-sm transition-all"
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
