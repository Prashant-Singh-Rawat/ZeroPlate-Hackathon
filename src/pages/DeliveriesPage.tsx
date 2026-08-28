import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Booking, DeliveryPerson } from '../types';
import { LiveDeliveryMap } from '../components/LiveDeliveryMap';
import { LoadingState } from '../components/LoadingState';
import { EmptyState } from '../components/EmptyState';
import { Truck, CheckCircle2, Clock } from 'lucide-react';

interface DeliveriesPageProps {
  onShowToast: (type: 'success' | 'error' | 'warning' | 'info', msg: string) => void;
}

export const DeliveriesPage: React.FC<DeliveriesPageProps> = ({ onShowToast }) => {
  const { user, role } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [deliveryPersons, setDeliveryPersons] = useState<DeliveryPerson[]>([]);
  const [activeTab, setActiveTab] = useState<'active' | 'completed' | 'all'>('active');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [user, role]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [bookingsRes, personsRes] = await Promise.all([
        fetch(`/api/bookings?userId=${user?.id || 'donor_spicevilla'}&role=${role}`),
        fetch(`/api/delivery/persons?donorId=${user?.id || 'donor_spicevilla'}`),
      ]);

      if (bookingsRes.ok) {
        const data = await bookingsRes.json();
        setBookings(data);
      }
      if (personsRes.ok) {
        const pData = await personsRes.json();
        setDeliveryPersons(pData);
      }
    } catch (e) {
      console.warn('Fetch deliveries error', e);
    } finally {
      setIsLoading(false);
    }
  };

  const filtered = bookings.filter((b) => {
    if (activeTab === 'active') return b.status !== 'COMPLETED' && b.status !== 'CANCELLED';
    if (activeTab === 'completed') return b.status === 'COMPLETED';
    return true;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-brand-text">
          {role === 'donor' ? 'Food Deliveries & Transport Fleet' : 'Track Incoming Food Deliveries'}
        </h1>
        <p className="text-xs font-medium text-brand-muted mt-1">
          {role === 'donor'
            ? 'Assign delivery volunteers, monitor real-time vehicle progress, and track deliveries to recipient NGOs.'
            : 'Track incoming volunteer delivery drivers, traffic-aware ETAs, and confirm receipt of hot meals.'}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 overflow-x-auto pb-1">
        {[
          { id: 'active', label: `Active Deliveries (${bookings.filter((b) => b.status !== 'COMPLETED' && b.status !== 'CANCELLED').length})` },
          { id: 'completed', label: `Completed Deliveries (${bookings.filter((b) => b.status === 'COMPLETED').length})` },
          { id: 'all', label: `All Records (${bookings.length})` },
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
        <LoadingState message="Loading live transport deliveries and traffic-aware ETAs..." />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No Deliveries in this View"
          description={
            role === 'donor'
              ? 'When you accept an NGO request, the confirmed booking will appear here for delivery assignment.'
              : 'Confirmed meal requests will appear here with live delivery driver tracking.'
          }
        />
      ) : (
        <div className="space-y-6">
          {filtered.map((booking) => (
            <LiveDeliveryMap
              key={booking.id}
              booking={booking}
              currentRole={role}
              currentUserId={user?.id || ''}
              deliveryPersons={deliveryPersons}
              onRefresh={fetchData}
              onShowToast={onShowToast}
            />
          ))}
        </div>
      )}
    </div>
  );
};
