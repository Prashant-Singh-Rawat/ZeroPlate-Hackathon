import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Booking } from '../types';
import {
  Bike,
  Truck,
  Star,
  Clock,
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
  ArrowRight,
  Sparkles,
  MapPin,
  CircleDollarSign,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface DeliveryPartner {
  id: string;
  name: string;
  vehicleType: 'Bike' | 'Scooter' | 'Van';
  rating: number;
  completedDeliveries: number;
  distanceKm: number;
  arrivalMinutes: number;
  priceInr: number;
  phone: string;
  avatar: string;
}

const DEMO_PARTNERS: DeliveryPartner[] = [
  {
    id: 'partner_rahul',
    name: 'Rahul Kumar',
    vehicleType: 'Bike',
    rating: 4.8,
    completedDeliveries: 142,
    distanceKm: 2.1,
    arrivalMinutes: 8,
    priceInr: 80,
    phone: '+91 98765 43210',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
  },
  {
    id: 'partner_sunita',
    name: 'Sunita Patel',
    vehicleType: 'Scooter',
    rating: 5.0,
    completedDeliveries: 218,
    distanceKm: 1.8,
    arrivalMinutes: 6,
    priceInr: 70,
    phone: '+91 98765 77889',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80',
  },
  {
    id: 'partner_amit',
    name: 'Amit Verma',
    vehicleType: 'Van',
    rating: 4.9,
    completedDeliveries: 320,
    distanceKm: 3.4,
    arrivalMinutes: 14,
    priceInr: 150,
    phone: '+91 98765 11223',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
  },
];

interface HireDeliveryPartnerPageProps {
  onNavigateDeliveries: () => void;
  onShowToast: (type: 'success' | 'error' | 'warning' | 'info', msg: string) => void;
}

export const HireDeliveryPartnerPage: React.FC<HireDeliveryPartnerPageProps> = ({
  onNavigateDeliveries,
  onShowToast,
}) => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedBookingId, setSelectedBookingId] = useState<string>('');
  const [hiringPartnerId, setHiringPartnerId] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/bookings?userId=${user?.id || 'ngo_hope'}&role=ngo`)
      .then((res) => res.json())
      .then((data: Booking[]) => {
        setBookings(data);
        if (data.length > 0) {
          setSelectedBookingId(data[0].id);
        }
      })
      .catch(() => {});
  }, [user]);

  const handleHire = async (partner: DeliveryPartner) => {
    if (!selectedBookingId) {
      onShowToast('warning', 'Please select a confirmed booking to assign the delivery partner.');
      return;
    }

    setHiringPartnerId(partner.id);
    try {
      const res = await fetch('/api/delivery/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: selectedBookingId,
          deliveryPersonId: partner.id,
        }),
      });

      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#F97316', '#10B981', '#3B82F6'],
      });

      onShowToast('success', `${partner.name} hired! Delivery partner is en route to pickup location.`);
      setTimeout(() => {
        onNavigateDeliveries();
      }, 1000);
    } catch (e) {
      onShowToast('error', 'Failed to assign delivery partner.');
    } finally {
      setHiringPartnerId(null);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-black text-brand-text">Hire Verified Delivery Partner</h1>
        <p className="text-xs font-medium text-brand-muted mt-1">
          ZeroPlate Delivery Marketplace connects your NGO with local volunteer drivers and eco-friendly couriers.
        </p>
      </div>

      {/* Target Booking Selector */}
      <div className="bg-white rounded-3xl p-5 border border-amber-900/5 shadow-warm-sm space-y-3">
        <label className="block text-xs font-bold text-brand-text uppercase">
          Select Confirmed Food Booking:
        </label>
        {bookings.length === 0 ? (
          <p className="text-xs text-brand-muted">No confirmed bookings currently awaiting delivery.</p>
        ) : (
          <select
            value={selectedBookingId}
            onChange={(e) => setSelectedBookingId(e.target.value)}
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-brand-text focus:outline-none"
          >
            {bookings.map((b) => (
              <option key={b.id} value={b.id}>
                #{b.id.slice(-6)} - {b.foodName} ({b.mealCount} meals) from {b.donorName}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Partner Marketplace Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {DEMO_PARTNERS.map((partner) => (
          <div
            key={partner.id}
            className="bg-white rounded-3xl border border-amber-900/5 p-6 shadow-warm-sm hover:shadow-warm-md transition-all flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-2xl bg-orange-100 flex items-center justify-center text-brand-orange font-black">
                  {partner.vehicleType === 'Van' ? <Truck className="w-6 h-6" /> : <Bike className="w-6 h-6" />}
                </div>
                <div className="flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span className="text-xs font-black text-amber-900">{partner.rating}</span>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-black text-brand-text">{partner.name}</h3>
                <span className="text-[11px] text-brand-muted font-bold">
                  {partner.vehicleType} • {partner.completedDeliveries} Deliveries
                </span>
              </div>

              <div className="space-y-1.5 text-xs bg-gray-50 p-3.5 rounded-2xl border border-gray-100">
                <div className="flex justify-between">
                  <span className="text-gray-500">Distance:</span>
                  <strong className="text-brand-text">{partner.distanceKm} km away</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Pickup Arrival:</span>
                  <strong className="text-emerald-700 font-black">{partner.arrivalMinutes} mins</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Estimated Fare:</span>
                  <strong className="text-brand-orange font-black">₹{partner.priceInr}</strong>
                </div>
              </div>
            </div>

            <button
              onClick={() => handleHire(partner)}
              disabled={hiringPartnerId === partner.id || !selectedBookingId}
              className="w-full py-3 bg-brand-orange hover:bg-brand-deep text-white font-black text-xs rounded-xl shadow-warm-sm transition-all flex items-center justify-center gap-1.5 active:scale-95 disabled:bg-gray-300"
            >
              <CircleDollarSign className="w-4 h-4" />
              <span>{hiringPartnerId === partner.id ? 'Hiring Driver...' : `Hire Partner (₹${partner.priceInr})`}</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
