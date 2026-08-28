import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { FoodRequest } from '../types';
import { MatchScore } from '../components/MatchScore';
import { LoadingState } from '../components/LoadingState';
import { EmptyState } from '../components/EmptyState';
import { Inbox, CheckCircle2, XCircle, MapPin, Building, Utensils, Clock, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

interface DonorRequestsProps {
  onNavigateBookings: () => void;
  onShowToast: (type: 'success' | 'error' | 'warning' | 'info', msg: string) => void;
}

export const DonorRequests: React.FC<DonorRequestsProps> = ({
  onNavigateBookings,
  onShowToast,
}) => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<FoodRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchRequests();
  }, [user]);

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/requests?donorId=${user?.id || 'donor_spicevilla'}`);
      if (res.ok) {
        const data = await res.json();
        setRequests(data);
      }
    } catch (e) {
      console.warn('Fetch donor requests error', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccept = async (request: FoodRequest) => {
    setProcessingId(request.id);
    try {
      const res = await fetch(`/api/requests/${request.id}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ donorId: user?.id || 'donor_spicevilla' }),
      });

      const data = await res.json();
      if (res.ok) {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#F97316', '#16A34A', '#EA580C'],
        });
        onShowToast('success', `Request accepted! Food confirmed for ${request.ngoName}. All competing requests auto-rejected.`);
        fetchRequests();
      } else {
        onShowToast('error', data.error || 'Failed to accept request.');
      }
    } catch (e) {
      onShowToast('error', 'Network error while accepting request.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (request: FoodRequest) => {
    setProcessingId(request.id);
    try {
      const res = await fetch(`/api/requests/${request.id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ donorId: user?.id || 'donor_spicevilla' }),
      });

      const data = await res.json();
      if (res.ok) {
        onShowToast('info', `Request from ${request.ngoName} declined.`);
        fetchRequests();
      } else {
        onShowToast('error', data.error || 'Failed to reject request.');
      }
    } catch (e) {
      onShowToast('error', 'Network error.');
    } finally {
      setProcessingId(null);
    }
  };

  const pendingRequests = requests.filter((r) => r.status === 'PENDING');
  const pastRequests = requests.filter((r) => r.status !== 'PENDING');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-brand-text flex items-center gap-2">
          <span>Incoming NGO Food Requests</span>
          <Inbox className="w-6 h-6 text-brand-orange" />
        </h1>
        <p className="text-xs font-medium text-brand-muted mt-1">
          Review requests from local NGOs seeking your surplus food. Accept an NGO to confirm pickup and lock the booking.
        </p>
      </div>

      {isLoading ? (
        <LoadingState message="Loading incoming NGO requests..." />
      ) : requests.length === 0 ? (
        <EmptyState
          title="No NGO Requests Received Yet"
          description="When compatible NGOs discover your available food listings and submit a request, they will appear here for your review and approval."
        />
      ) : (
        <div className="space-y-6">
          {/* Pending Requests Section */}
          <div className="space-y-4">
            <h2 className="text-sm font-black uppercase text-brand-orange tracking-wider flex items-center gap-2">
              <span>Pending Action ({pendingRequests.length})</span>
            </h2>

            {pendingRequests.length === 0 ? (
              <div className="p-6 bg-white rounded-2xl border border-dashed border-gray-200 text-center text-xs font-medium text-brand-muted">
                All incoming requests have been reviewed and resolved!
              </div>
            ) : (
              <div className="space-y-4">
                {pendingRequests.map((req) => (
                  <div
                    key={req.id}
                    className="bg-white rounded-3xl border-2 border-brand-orange/40 p-6 shadow-warm-md hover:shadow-warm-lg transition-all space-y-4"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-1.5 flex-1">
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-brand-light text-brand-deep">
                            {req.requestedMeals} Meals Requested
                          </span>
                          <h3 className="font-extrabold text-lg text-brand-text">
                            {req.foodName}
                          </h3>
                          <MatchScore
                            score={req.matchScore}
                            breakdown={{
                              distanceScore: req.distanceScore,
                              mealScore: req.mealScore,
                              urgencyScore: req.urgencyScore,
                            }}
                            showBreakdown={true}
                            size="sm"
                          />
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-xs text-brand-muted font-medium pt-1">
                          <div className="flex items-center gap-1.5 bg-brand-cream/80 px-3 py-1 rounded-xl border border-orange-100">
                            <Building className="w-4 h-4 text-brand-orange" />
                            <span>NGO: <strong className="text-brand-text font-bold">{req.ngoName}</strong></span>
                          </div>
                          <div className="flex items-center gap-1.5 bg-brand-cream/80 px-3 py-1 rounded-xl border border-orange-100">
                            <MapPin className="w-4 h-4 text-brand-orange" />
                            <span>{req.distanceKm} km away</span>
                          </div>
                        </div>

                        {req.explanation && (
                          <p className="text-xs bg-amber-50 text-amber-900 p-3 rounded-2xl border border-amber-200 mt-2 font-medium">
                            <strong className="text-brand-deep">Smart Match Analysis: </strong>
                            "{req.explanation}"
                          </p>
                        )}
                      </div>

                      {/* Accept / Reject CTAs (§1, §2) */}
                      <div className="flex items-center gap-2.5 shrink-0 pt-2 md:pt-0">
                        <button
                          onClick={() => handleAccept(req)}
                          disabled={processingId === req.id}
                          className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-warm-sm hover:shadow-warm-md transition-all flex items-center gap-1.5 active:scale-95"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Accept Request</span>
                        </button>
                        <button
                          onClick={() => handleReject(req)}
                          disabled={processingId === req.id}
                          className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl border transition-all flex items-center gap-1.5"
                        >
                          <XCircle className="w-4 h-4 text-gray-500" />
                          <span>Reject</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Past Resolved Requests Section */}
          {pastRequests.length > 0 && (
            <div className="space-y-3 pt-4">
              <h2 className="text-xs font-black uppercase text-brand-muted tracking-wider">
                Resolved Requests History ({pastRequests.length})
              </h2>
              <div className="divide-y divide-gray-100 bg-white rounded-2xl border border-gray-200 overflow-hidden">
                {pastRequests.map((req) => (
                  <div key={req.id} className="p-4 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-brand-text">
                        {req.foodName} ({req.requestedMeals} meals) — Requested by {req.ngoName}
                      </p>
                      <p className="text-[11px] text-brand-muted mt-0.5">
                        Match: {req.matchScore}% • Distance: {req.distanceKm} km
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-black uppercase ${
                        req.status === 'ACCEPTED'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {req.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
