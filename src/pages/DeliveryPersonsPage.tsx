import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { DeliveryPerson, DeliveryRole, VehicleType } from '../types';
import { LoadingState } from '../components/LoadingState';
import { EmptyState } from '../components/EmptyState';
import {
  Users,
  Plus,
  Bike,
  Car,
  Truck,
  Phone,
  CheckCircle2,
  X,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';

interface DeliveryPersonsPageProps {
  onShowToast: (type: 'success' | 'error' | 'warning' | 'info', msg: string) => void;
}

export const DeliveryPersonsPage: React.FC<DeliveryPersonsPageProps> = ({ onShowToast }) => {
  const { user } = useAuth();
  const [persons, setPersons] = useState<DeliveryPerson[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [name, setName] = useState('Rahul Sharma');
  const [phone, setPhone] = useState('+91 98765 43210');
  const [role, setRole] = useState<DeliveryRole>('Volunteer');
  const [vehicleType, setVehicleType] = useState<VehicleType>('Bike');
  const [vehicleNumber, setVehicleNumber] = useState('MH-02-BQ-4512');
  const [availability, setAvailability] = useState<'Available' | 'Unavailable'>('Available');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchPersons();
  }, [user]);

  const fetchPersons = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/delivery/persons?donorId=${user?.id || 'donor_spicevilla'}`);
      if (res.ok) {
        const data = await res.json();
        setPersons(data);
      }
    } catch (e) {
      console.warn('Fetch delivery persons error', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      onShowToast('warning', 'Name and phone number are required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/delivery/persons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          donorId: user?.id || 'donor_spicevilla',
          name,
          phone,
          role,
          vehicleType,
          vehicleNumber,
          availability,
        }),
      });

      if (res.ok) {
        onShowToast('success', `${name} added to your delivery fleet!`);
        setShowAddModal(false);
        fetchPersons();
      } else {
        const data = await res.json();
        onShowToast('error', data.error || 'Failed to add delivery person.');
      }
    } catch (e) {
      onShowToast('error', 'Network error.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getVehicleIcon = (vt: VehicleType) => {
    switch (vt) {
      case 'Van':
      case 'Car':
        return <Truck className="w-5 h-5 text-brand-orange" />;
      case 'Scooter':
      case 'Bike':
      default:
        return <Bike className="w-5 h-5 text-brand-orange" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-brand-text">Delivery Fleet & Volunteers</h1>
          <p className="text-xs font-medium text-brand-muted mt-1">
            Manage your food dispatch drivers, volunteers, and staff assigned to transport meals to NGOs.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-5 py-2.5 bg-brand-orange hover:bg-brand-deep text-white font-extrabold text-xs rounded-xl shadow-warm-sm transition-all flex items-center gap-2 active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Delivery Person</span>
        </button>
      </div>

      {/* Grid List */}
      {isLoading ? (
        <LoadingState message="Loading delivery fleet..." />
      ) : persons.length === 0 ? (
        <EmptyState
          title="No Delivery Persons Registered"
          description="Add volunteer drivers or restaurant staff to assign confirmed donations for transport."
          actionLabel="Add First Delivery Person"
          onAction={() => setShowAddModal(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {persons.map((person) => (
            <div
              key={person.id}
              className="bg-white rounded-3xl border border-amber-900/5 p-5 shadow-warm-sm space-y-4 hover:shadow-warm-md transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-orange-100/80 text-brand-deep flex items-center justify-center font-black">
                    {getVehicleIcon(person.vehicleType)}
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-brand-text">{person.name}</h3>
                    <span className="text-[11px] font-bold text-brand-orange">{person.role}</span>
                  </div>
                </div>

                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                    person.availability === 'Available'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}
                >
                  {person.availability}
                </span>
              </div>

              <div className="space-y-1.5 text-xs bg-gray-50 p-3.5 rounded-2xl border border-gray-100">
                <div className="flex justify-between">
                  <span className="text-brand-muted font-medium">Vehicle:</span>
                  <span className="font-bold text-brand-text">
                    {person.vehicleType} {person.vehicleNumber ? `(${person.vehicleNumber})` : ''}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-brand-muted font-medium">Phone:</span>
                  <span className="font-mono font-bold text-brand-text flex items-center gap-1">
                    <Phone className="w-3 h-3 text-brand-orange" />
                    {person.phone}
                  </span>
                </div>
                {person.activeBookingId && (
                  <div className="pt-1 text-[11px] text-amber-700 font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                    <span>Active on Delivery #{person.activeBookingId.slice(-6)}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Delivery Person Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-orange-200 animate-status-pop">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-black text-brand-text">Add Delivery Person / Volunteer</h3>
                <p className="text-xs text-brand-muted mt-0.5">
                  Register a driver or volunteer to transport meals to NGOs.
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 hover:bg-gray-100 rounded-lg text-gray-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-brand-text uppercase mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="e.g. Rahul Sharma"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:bg-white focus:border-brand-orange focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-text uppercase mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  placeholder="e.g. +91 98765 43210"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:bg-white focus:border-brand-orange focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-brand-text uppercase mb-1">
                    Role
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as any)}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-brand-text focus:outline-none"
                  >
                    <option value="Volunteer">Volunteer</option>
                    <option value="Driver">Driver</option>
                    <option value="Delivery Person">Delivery Person</option>
                    <option value="Staff">Staff</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-brand-text uppercase mb-1">
                    Vehicle Type
                  </label>
                  <select
                    value={vehicleType}
                    onChange={(e) => setVehicleType(e.target.value as any)}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-brand-text focus:outline-none"
                  >
                    <option value="Bike">Bike</option>
                    <option value="Scooter">Scooter</option>
                    <option value="Car">Car</option>
                    <option value="Van">Van / Tempo</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-text uppercase mb-1">
                  Vehicle Number (Optional)
                </label>
                <input
                  type="text"
                  value={vehicleNumber}
                  onChange={(e) => setVehicleNumber(e.target.value)}
                  placeholder="e.g. MH-02-BQ-4512"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:bg-white focus:border-brand-orange focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 bg-brand-orange hover:bg-brand-deep text-white font-black text-xs rounded-xl shadow-warm-sm transition-all flex items-center justify-center gap-1.5 active:scale-95"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isSubmitting ? 'Adding...' : 'Add to Fleet'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
