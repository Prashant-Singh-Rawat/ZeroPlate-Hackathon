import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Booking, DeliveryPerson } from '../types';
import { LiveDeliveryMap } from '../components/LiveDeliveryMap';
import { LoadingState } from '../components/LoadingState';
import { EmptyState } from '../components/EmptyState';
import { Truck, CheckCircle2, Clock } from 'lucide-react';

import { syncCloudBookings } from '../services/cloudSync';
import { getLocalBookings } from '../services/requestStorage';

interface DeliveriesPageProps {
  onShowToast: (type: 'success' | 'error' | 'warning' | 'info', msg: string) => void;
}

const DEFAULT_FLEET: DeliveryPerson[] = [
  {
    id: 'del_rahul',
    donorId: 'donor_spicevilla',
    name: 'Rahul Varma',
    phone: '+91 98765 43210',
    role: 'Delivery Person',
    vehicleType: 'Bike',
    vehicleNumber: 'MH-02-EE-8899',
    availability: 'Available',
    currentLatitude: 19.074,
    currentLongitude: 72.875,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'del_amit',
    donorId: 'donor_spicevilla',
    name: 'Amit Patel',
    phone: '+91 98123 45678',
    role: 'Driver',
    vehicleType: 'Van',
    vehicleNumber: 'MH-04-AB-1234',
    availability: 'Available',
    currentLatitude: 19.068,
    currentLongitude: 72.862,
    createdAt: new Date().toISOString(),
  },
];

export const DeliveriesPage: React.FC<DeliveriesPageProps> = ({ onShowToast }) => {
  const { user, role } = useAuth();

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
  const [deliveryPersons, setDeliveryPersons] = useState<DeliveryPerson[]>(DEFAULT_FLEET);
  const [activeTab, setActiveTab] = useState<'active' | 'completed' | 'all'>('active');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => {
      fetchData();
    }, 6000);
    return () => clearInterval(interval);
  }, [user, role]);

  const fetchData = async () => {
    try {
      const allBookings = await syncCloudBookings();
      setBookings(allBookings.filter(isMatchingBooking));

      const personsRes = await fetch(`/api/delivery/persons?donorId=${user?.id || 'donor_spicevilla'}`);
      if (personsRes.ok) {
        const pData = await personsRes.json();
        if (Array.isArray(pData) && pData.length > 0) {
          setDeliveryPersons(pData);
        }
      }
    } catch (e) {
      console.warn('Fetch deliveries error', e);
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
