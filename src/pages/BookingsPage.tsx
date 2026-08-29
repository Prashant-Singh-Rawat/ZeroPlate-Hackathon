import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Booking, DonorRatingFeedback } from '../types';
import { LoadingState } from '../components/LoadingState';
import { EmptyState } from '../components/EmptyState';
import { MapPin, Building, CheckCircle2, Clock, Check, Star, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

import { getLocalBookings, saveLocalBookings } from '../services/requestStorage';
import { syncCloudBookings, completeBookingInCloud } from '../services/cloudSync';
import { RatingModal } from '../components/RatingModal';
import { DonorRatingBadge } from '../components/DonorRatingBadge';
import { getRatingForBooking } from '../services/ratingStorage';

interface BookingsPageProps {
  onShowToast?: (type: 'success' | 'error' | 'warning' | 'info', msg: string) => void;
}

export const BookingsPage: React.FC<BookingsPageProps> = ({ onShowToast }) => {
  const { user, role } = useAuth();
  const { t } = useLanguage();
  const isNGO = role === 'ngo';

  const isMatchingBooking = (b: Booking) => {
    const userEmail = user?.email?.toLowerCase();
    const userId = user?.id?.toLowerCase();
    if (role === 'ngo') {
      const bNgoId = b.ngoId?.toLowerCase();
      if (userEmail) {
        return bNgoId === userEmail || bNgoId === userId;
      }
      return bNgoId === 'ngo_hope' || bNgoId === userId;
    } else {
      const bDonorId = b.donorId?.toLowerCase();
      if (userEmail) {
        return bDonorId === userEmail || bDonorId === userId;
      }
      return bDonorId === 'donor_spicevilla' || bDonorId === userId;
    }
  };

  const [bookings, setBookings] = useState<Booking[]>(() => {
    const local = getLocalBookings();
    return local.filter(isMatchingBooking);
  });
  const [activeTab, setActiveTab] = useState<'all' | 'confirmed' | 'completed'>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [selectedRatingBooking, setSelectedRatingBooking] = useState<Booking | null>(null);
  const [refreshRatingCounter, setRefreshRatingCounter] = useState(0);

  useEffect(() => {
    fetchBookings();
    const interval = setInterval(() => {
      fetchBookings();
    }, 8000);
    return () => clearInterval(interval);
  }, [user, role]);

  const fetchBookings = async () => {
    try {
      const allBookings = await syncCloudBookings();
      setBookings(allBookings.filter(isMatchingBooking));
    } catch (e) {
      console.warn('Fetch bookings error', e);
    }
  };

  const handleCompletePickup = async (bookingId: string) => {
    setCompletingId(bookingId);
    // 1. Mark completed locally
    const allLocal = getLocalBookings();
    const updated = allLocal.map((b) =>
      b.id === bookingId ? { ...b, status: 'COMPLETED' as const, completedAt: new Date().toISOString() } : b
    );
    saveLocalBookings(updated);
    setBookings(updated.filter(isMatchingBooking));

    // 2. Mark completed in cloud
    await completeBookingInCloud(bookingId);

    // 3. Mark completed on server
    fetch(`/api/bookings/${bookingId}/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user?.id || 'donor_spicevilla' }),
    }).catch(() => {});

    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#F97316', '#16A34A', '#10B981'],
    });

    if (onShowToast) onShowToast('success', 'Pickup confirmed as COMPLETED!');
    setCompletingId(null);

    // If NGO completed, prompt them to rate the donor
    const completedBooking = updated.find((b) => b.id === bookingId);
    if (isNGO && completedBooking) {
      setTimeout(() => {
        setSelectedRatingBooking(completedBooking);
      }, 500);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (activeTab === 'confirmed') return b.status !== 'COMPLETED' && b.status !== 'CANCELLED';
    if (activeTab === 'completed') return b.status === 'COMPLETED';
    return true;
  });

  return (
    <div className="space-y-6 animate-fadeIn w-full">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-brand-text dark:text-slate-100">
          {t('bookings')} & Pickups
        </h1>
        <p className="text-xs sm:text-sm font-medium text-brand-muted dark:text-slate-400 mt-1">
          Manage locked food arrangements, coordinate collection timing, evaluate donors, and confirm completed pickups.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 dark:border-slate-800 overflow-x-auto pb-1">
        {[
          { id: 'all', label: `All Bookings (${bookings.length})` },
          { id: 'confirmed', label: `Active Pickups (${bookings.filter((b) => b.status !== 'COMPLETED' && b.status !== 'CANCELLED').length})` },
          { id: 'completed', label: `Completed Rescues (${bookings.filter((b) => b.status === 'COMPLETED').length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 text-xs sm:text-sm font-extrabold rounded-t-xl transition-all whitespace-nowrap cursor-pointer ${
              activeTab === tab.id
                ? 'bg-brand-orange text-white shadow-warm-sm'
                : 'text-brand-muted dark:text-slate-400 hover:text-brand-text dark:hover:text-slate-200 hover:bg-brand-light dark:hover:bg-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <LoadingState message="Loading your confirmed bookings..." />
      ) : filteredBookings.length === 0 ? (
        <EmptyState
          title="No Bookings in this Category"
          description="Confirmed requests and completed pickups will appear here."
        />
      ) : (
        <div className="space-y-4 w-full">
          {filteredBookings.map((b) => {
            const isCompleted = b.status === 'COMPLETED';
            const existingRating = getRatingForBooking(b.id);

            return (
              <div
                key={b.id}
                className="bg-white dark:bg-[#1E293B] rounded-3xl border border-amber-900/5 dark:border-slate-800/80 p-5 sm:p-6 shadow-warm-sm hover:shadow-warm-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-5"
              >
                <div className="space-y-3 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="font-black text-lg sm:text-xl text-brand-text dark:text-slate-100">{b.foodName}</h3>
                    <span className="px-3 py-1 rounded-full text-xs font-black bg-brand-light dark:bg-orange-950/50 text-brand-deep dark:text-orange-400">
                      {b.mealCount} Meals
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-black uppercase flex items-center gap-1 ${
                        isCompleted
                          ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300'
                          : 'bg-blue-100 dark:bg-blue-950/50 text-blue-800 dark:text-blue-300 animate-pulse-subtle'
                      }`}
                    >
                      {isCompleted ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                      <span>{isCompleted ? 'Pickup Completed' : 'Confirmed for Pickup'}</span>
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs sm:text-sm text-brand-muted dark:text-slate-400 font-medium">
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4 text-brand-orange shrink-0" />
                      <div className="flex items-center gap-2 flex-wrap">
                        <span>Food Donor: <strong className="text-brand-text dark:text-slate-200">{b.donorName}</strong></span>
                        <DonorRatingBadge donorId={b.donorId} size="sm" showDetails />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>NGO Partner: <strong className="text-brand-text dark:text-slate-200">{b.ngoName}</strong></span>
                    </div>
                    <div className="flex items-center gap-2 sm:col-span-2">
                      <MapPin className="w-4 h-4 text-brand-orange shrink-0" />
                      <span>Pickup Address: <strong className="text-brand-text dark:text-slate-200">{b.pickupLocation}</strong></span>
                    </div>
                  </div>

                  {/* Rating summary banner */}
                  {existingRating && (
                    <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-2xl border border-amber-200/80 dark:border-amber-900/40 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
                        <span className="font-extrabold text-amber-900 dark:text-amber-300">
                          Your Rating: {existingRating.overallScore}★ / 5.0
                        </span>
                        <span className="text-gray-500 dark:text-slate-400 hidden sm:inline">
                          (Quality: {existingRating.foodQualityScore}★ • Delivery: {existingRating.deliveryScore}★ • Qty: {existingRating.quantityAccuracyScore}★)
                        </span>
                      </div>
                      {isNGO && (
                        <button
                          onClick={() => setSelectedRatingBooking(b)}
                          className="text-amber-800 dark:text-amber-300 underline font-black hover:text-amber-950 cursor-pointer"
                        >
                          Edit Review
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="shrink-0 flex items-center gap-2.5 pt-2 md:pt-0 flex-wrap">
                  {isNGO && (
                    <button
                      onClick={() => setSelectedRatingBooking(b)}
                      className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black text-xs sm:text-sm rounded-xl shadow-md flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                    >
                      <Star className="w-4 h-4 fill-white" />
                      <span>{existingRating ? `⭐ Rated ${existingRating.overallScore}★ (Edit)` : '⭐ Rate & Review Donor'}</span>
                    </button>
                  )}

                  {!isCompleted && (
                    <button
                      onClick={() => handleCompletePickup(b.id)}
                      disabled={completingId === b.id}
                      className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm rounded-xl shadow-warm-sm transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer disabled:opacity-50"
                    >
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>Confirm Completed</span>
                    </button>
                  )}

                  {isCompleted && (
                    <div className="text-xs font-black text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-3.5 py-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Rescue Completed</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Interactive 3-Question Rating Modal */}
      {selectedRatingBooking && (
        <RatingModal
          booking={selectedRatingBooking}
          isOpen={true}
          onClose={() => setSelectedRatingBooking(null)}
          onRatingSubmitted={(feedback) => {
            setRefreshRatingCounter((c) => c + 1);
            if (onShowToast) {
              onShowToast('success', `⭐ Rating submitted for ${feedback.donorName}! Overall score: ${feedback.overallScore}★`);
            }
          }}
        />
      )}
    </div>
  );
};
