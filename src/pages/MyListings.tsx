import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { FoodDonation } from '../types';
import { FoodCard } from '../components/FoodCard';
import { LoadingState } from '../components/LoadingState';
import { EmptyState } from '../components/EmptyState';
import { PlusCircle, ListFilter } from 'lucide-react';

interface MyListingsProps {
  initialTab?: string;
  onNavigateAddFood: () => void;
  onNavigateRequests: (donation?: FoodDonation) => void;
}

export const MyListings: React.FC<MyListingsProps> = ({
  initialTab = 'all',
  onNavigateAddFood,
  onNavigateRequests,
}) => {
  const { user } = useAuth();
  const [filterTab, setFilterTab] = useState<'all' | 'available' | 'reserved' | 'completed'>(
    initialTab === 'donations-available'
      ? 'available'
      : initialTab === 'donations-reserved'
      ? 'reserved'
      : initialTab === 'donations-completed'
      ? 'completed'
      : 'all'
  );

  const [donations, setDonations] = useState<FoodDonation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDonations();
  }, [user]);

  const fetchDonations = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/donations?donorId=${user?.id || 'donor_spicevilla'}`);
      if (res.ok) {
        const data = await res.json();
        setDonations(data);
      }
    } catch (e) {
      console.warn('Fetch donations error', e);
    } finally {
      setIsLoading(false);
    }
  };

  const filtered = donations.filter((item) => {
    if (filterTab === 'available') return item.status === 'AVAILABLE' || item.status === 'PENDING_REQUEST';
    if (filterTab === 'reserved') return item.status === 'CONFIRMED' || item.status === 'RESERVED';
    if (filterTab === 'completed') return item.status === 'COMPLETED';
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-brand-text">My Food Donations</h1>
          <p className="text-xs font-medium text-brand-muted mt-1">
            Track published surplus food listings, manage incoming requests, and monitor pickup statuses.
          </p>
        </div>

        <button
          onClick={onNavigateAddFood}
          className="px-5 py-2.5 bg-brand-orange hover:bg-brand-deep text-white font-black text-xs rounded-xl shadow-warm-sm hover:shadow-warm-md transition-all flex items-center gap-2 active:scale-95 shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Publish New Food Donation</span>
        </button>
      </div>

      {/* Tabs Filter (§2) */}
      <div className="flex items-center gap-2 border-b border-gray-200 overflow-x-auto pb-1">
        {[
          { id: 'all', label: `All Listings (${donations.length})` },
          { id: 'available', label: `Available (${donations.filter((d) => d.status === 'AVAILABLE' || d.status === 'PENDING_REQUEST').length})` },
          { id: 'reserved', label: `Reserved / Confirmed (${donations.filter((d) => d.status === 'CONFIRMED' || d.status === 'RESERVED').length})` },
          { id: 'completed', label: `Completed Pickups (${donations.filter((d) => d.status === 'COMPLETED').length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterTab(tab.id as any)}
            className={`px-4 py-2 text-xs font-extrabold rounded-t-xl transition-all whitespace-nowrap ${
              filterTab === tab.id
                ? 'bg-brand-orange text-white shadow-warm-sm'
                : 'text-brand-muted hover:text-brand-text hover:bg-brand-light'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <LoadingState message="Loading food donation listings..." />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No food donations yet."
          description="Your surplus food listings will appear here."
          actionLabel="Add Food"
          onAction={onNavigateAddFood}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((item) => (
            <FoodCard
              key={item.id}
              donation={item}
              role="donor"
              onViewRequests={() => onNavigateRequests(item)}
            />
          ))}
        </div>
      )}
    </div>
  );
};
