import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Booking } from '../types';
import { LoadingState } from '../components/LoadingState';
import { EmptyState } from '../components/EmptyState';
import { CalendarDays, MapPin, Building, CheckCircle2, Clock, Utensils, Check } from 'lucide-react';
import confetti from 'canvas-confetti';

interface BookingsPageProps {
  onShowToast?: (type: 'success' | 'error' | 'warning' | 'info', msg: string) => void;
}

export const BookingsPage: React.FC<BookingsPageProps> = ({ onShowToast }) => {
  const { user, role } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'confirmed' | 'completed'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [completingId, setCompletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchBookings();
  }, [user, role]);

  const fetchBookings = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/bookings?userId=${user?.id || 'donor_spicevilla'}&role=${role}`);
      if (res.ok) {
        const data = await res.json();
        setBookings(data);
      }
    } catch (e) {
      console.warn('Fetch bookings error', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompletePickup = async (bookingId: string) => {
    setCompletingId(bookingId);
    try {
      const res = await fetch(`/api/bookings/${bookingId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.id || 'donor_spicevilla' }),
      });

      if (res.ok) {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#F97316', '#16A34A', '#10B981'],
        });
        if (onShowToast) onShowToast('success', 'Pickup confirmed as COMPLETED! Impact metrics updated.');
        fetchBookings();
      }
    } catch (e) {
      console.warn('Complete pickup error', e);
    } finally {
      setCompletingId(null);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (activeTab === 'confirmed') return b.status === 'CONFIRMED' || b.status === 'PICKUP_IN_PROGRESS';
    if (activeTab === 'completed') return b.status === 'COMPLETED';
    return true;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-brand-text">Confirmed Bookings & Pickups</h1>
        <p className="text-xs font-medium text-brand-muted mt-1">
          Manage locked food arrangements, coordinate collection timing, and confirm completed pickups.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 overflow-x-auto pb-1">
        {[
          { id: 'all', label: `All Bookings (${bookings.length})` },
          { id: 'confirmed', label: `Active Pickups (${bookings.filter((b) => b.status === 'CONFIRMED').length})` },
          { id: 'completed', label: `Completed Rescues (${bookings.filter((b) => b.status === 'COMPLETED').length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 text-xs font-extrabold rounded-t-xl transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-brand-orange text-white shadow-warm-sm'
                : 'text-brand-muted hover:text-brand-text hover:bg-brand-light'
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
        <div className="space-y-4">
          {filteredBookings.map((b) => {
            const isConfirmed = b.status === 'CONFIRMED';
            const isCompleted = b.status === 'COMPLETED';

            return (
              <div
                key={b.id}
                className="bg-white rounded-3xl border border-amber-900/5 p-6 shadow-warm-sm hover:shadow-warm-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-5"
              >
                <div className="space-y-3 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="font-black text-lg text-brand-text">{b.foodName}</h3>
                    <span className="px-3 py-1 rounded-full text-xs font-black bg-brand-light text-brand-deep">
                      {b.mealCount} Meals
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-black uppercase flex items-center gap-1 ${
                        isCompleted
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-blue-100 text-blue-800 animate-pulse-subtle'
                      }`}
                    >
                      {isCompleted ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                      <span>{isCompleted ? 'Pickup Completed' : 'Confirmed for Pickup'}</span>
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-brand-muted font-medium">
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4 text-brand-orange shrink-0" />
                      <span>Food Donor: <strong className="text-brand-text">{b.donorName}</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>NGO Partner: <strong className="text-brand-text">{b.ngoName}</strong></span>
                    </div>
                    <div className="flex items-center gap-2 sm:col-span-2">
                      <MapPin className="w-4 h-4 text-brand-orange shrink-0" />
                      <span>Pickup Address: <strong className="text-brand-text">{b.pickupLocation}</strong></span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="shrink-0 flex items-center gap-3">
                  {isConfirmed && (
                    <button
                      onClick={() => handleCompletePickup(b.id)}
                      disabled={completingId === b.id}
                      className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-warm-sm transition-all flex items-center gap-1.5 active:scale-95"
                    >
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>Confirm Pickup Completed</span>
                    </button>
                  )}
                  {isCompleted && (
                    <div className="text-xs font-black text-emerald-700 bg-emerald-50 px-3.5 py-2 rounded-xl border border-emerald-200 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Rescue Drive Completed</span>
                    </div>
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
