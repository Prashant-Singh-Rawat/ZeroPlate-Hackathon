import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Booking } from '../types';
import { LivePickupTracker } from '../components/LivePickupTracker';
import { LoadingState } from '../components/LoadingState';
import { EmptyState } from '../components/EmptyState';
import { CalendarDays, MapPin, Building, CheckCircle2, Clock } from 'lucide-react';

interface BookingsPageProps {
  onShowToast?: (type: 'success' | 'error' | 'warning' | 'info', msg: string) => void;
}

export const BookingsPage: React.FC<BookingsPageProps> = ({ onShowToast }) => {
  const { user, role } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'completed'>('all');
  const [isLoading, setIsLoading] = useState(true);

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

  const filteredBookings = bookings.filter((b) => {
    if (activeTab === 'active') return b.status === 'CONFIRMED' || b.status === 'PICKUP_IN_PROGRESS';
    if (activeTab === 'completed') return b.status === 'COMPLETED';
    return true;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-brand-text">Bookings & Live Pickup Tracking</h1>
        <p className="text-xs font-medium text-brand-muted mt-1">
          Coordinate confirmed collections in real-time, view live distance/ETA metrics, and confirm handoffs.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 overflow-x-auto pb-1">
        {[
          { id: 'all', label: `All Bookings (${bookings.length})` },
          { id: 'active', label: `Active / In Progress (${bookings.filter((b) => b.status === 'CONFIRMED' || b.status === 'PICKUP_IN_PROGRESS').length})` },
          { id: 'completed', label: `Completed (${bookings.filter((b) => b.status === 'COMPLETED').length})` },
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
        <LoadingState message="Loading your confirmed bookings and live GPS coordinates..." />
      ) : filteredBookings.length === 0 ? (
        <EmptyState
          title="No Bookings in this View"
          description="Confirmed requests and live pickup runs will appear here."
        />
      ) : (
        <div className="space-y-6">
          {filteredBookings.map((b) => (
            <LivePickupTracker
              key={b.id}
              booking={b}
              currentRole={role}
              currentUserId={user?.id || ''}
              onStatusChanged={fetchBookings}
              onShowToast={onShowToast}
            />
          ))}
        </div>
      )}
    </div>
  );
};
