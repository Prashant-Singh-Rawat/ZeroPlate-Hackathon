import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { FoodDonation } from '../types';
import { FoodCard } from '../components/FoodCard';
import { LoadingState } from '../components/LoadingState';
import { EmptyState } from '../components/EmptyState';
import { PlusCircle } from 'lucide-react';

import { getLocalDonations } from '../services/donationStorage';
import { syncCloudDonations, cancelDonationInCloud } from '../services/cloudSync';
import { AlertTriangle, X } from 'lucide-react';

interface MyListingsProps {
  initialTab?: string;
  onNavigateAddFood: () => void;
  onNavigateRequests: (donation?: FoodDonation) => void;
  onShowToast?: (type: 'success' | 'error' | 'warning' | 'info', msg: string) => void;
}

export const MyListings: React.FC<MyListingsProps> = ({
  initialTab = 'all',
  onNavigateAddFood,
  onNavigateRequests,
  onShowToast,
}) => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [filterTab, setFilterTab] = useState<'all' | 'available' | 'reserved' | 'completed'>(
    initialTab === 'donations-available'
      ? 'available'
      : initialTab === 'donations-reserved'
      ? 'reserved'
      : initialTab === 'donations-completed'
      ? 'completed'
      : 'all'
  );

  const [cancellingDonation, setCancellingDonation] = useState<FoodDonation | null>(null);
  const [cancelReason, setCancelReason] = useState<string>('Stock out / Food exhausted');

  const isMatchingDonor = (d: FoodDonation) => {
    const userEmail = user?.email?.toLowerCase();
    const userId = user?.id?.toLowerCase();
    const dDonorId = d.donorId?.toLowerCase();
    return (
      (userEmail && dDonorId === userEmail) ||
      (userId && dDonorId === userId) ||
      (!userEmail && dDonorId === 'donor_spicevilla')
    );
  };

  const [donations, setDonations] = useState<FoodDonation[]>(() => {
    const local = getLocalDonations();
    return local.filter(isMatchingDonor);
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchDonations();
  }, [user]);

  const fetchDonations = async () => {
    try {
      const allDonations = await syncCloudDonations();
      setDonations(allDonations.filter(isMatchingDonor));
    } catch (e) {
      console.warn('Fetch donations error', e);
    }
  };

  const handleConfirmCancel = async () => {
    if (!cancellingDonation) return;
    const targetId = cancellingDonation.id;

    // 1. Immediately update UI state
    setDonations((prev) =>
      prev.map((d) => (d.id === targetId ? { ...d, status: 'CANCELLED' as const } : d))
    );

    // 2. Sync cancellation to Cloud and local storage
    cancelDonationInCloud(targetId, cancelReason).catch(() => {});

    if (onShowToast) {
      onShowToast('info', `Listing "${cancellingDonation.foodName}" cancelled (${cancelReason}) and removed from NGO discovery.`);
    }

    setCancellingDonation(null);
  };

  const filtered = donations.filter((item) => {
    if (filterTab === 'available') return item.status === 'AVAILABLE' || item.status === 'PENDING_REQUEST';
    if (filterTab === 'reserved') return item.status === 'CONFIRMED' || item.status === 'RESERVED';
    if (filterTab === 'completed') return item.status === 'COMPLETED';
    return true;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-brand-text dark:text-slate-100">{t('myFoodListings')}</h1>
          <p className="text-xs font-medium text-brand-muted dark:text-slate-400 mt-1">
            Track published surplus food listings, manage incoming requests, and cancel out-of-stock items anytime.
          </p>
        </div>

        <button
          onClick={onNavigateAddFood}
          className="px-5 py-2.5 bg-brand-orange hover:bg-brand-deep text-white font-black text-xs rounded-xl shadow-warm-sm hover:shadow-warm-md transition-all flex items-center gap-2 active:scale-95 shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{t('addFoodDonation')}</span>
        </button>
      </div>

      {/* Tabs Filter */}
      <div className="flex items-center gap-2 border-b border-gray-200 dark:border-slate-800 overflow-x-auto pb-1">
        {[
          { id: 'all', label: `${t('viewAll')} (${donations.length})` },
          { id: 'available', label: `${t('available')} (${donations.filter((d) => d.status === 'AVAILABLE' || d.status === 'PENDING_REQUEST').length})` },
          { id: 'reserved', label: `${t('reservedPending')} (${donations.filter((d) => d.status === 'CONFIRMED' || d.status === 'RESERVED').length})` },
          { id: 'completed', label: `${t('completed')} (${donations.filter((d) => d.status === 'COMPLETED').length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterTab(tab.id as any)}
            className={`px-4 py-2 text-xs font-extrabold rounded-t-xl transition-all whitespace-nowrap ${
              filterTab === tab.id
                ? 'bg-brand-orange text-white shadow-warm-sm'
                : 'text-brand-muted dark:text-slate-400 hover:text-brand-text dark:hover:text-slate-200 hover:bg-brand-light dark:hover:bg-slate-800'
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
          title="No Food Donations in this view"
          description="Publish a surplus food donation to connect with local NGOs."
          actionLabel="Publish Food Donation"
          onAction={onNavigateAddFood}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filtered.map((item) => (
            <FoodCard
              key={item.id}
              donation={item}
              role="donor"
              onViewRequests={() => onNavigateRequests(item)}
              onCancelDonation={(donation) => setCancellingDonation(donation)}
            />
          ))}
        </div>
      )}

      {/* Cancellation Confirmation Modal */}
      {cancellingDonation && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white dark:bg-[#1E293B] rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 dark:border-slate-700 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="font-extrabold text-base text-gray-900 dark:text-slate-100">
                  Cancel Food Listing
                </h3>
              </div>
              <button
                onClick={() => setCancellingDonation(null)}
                className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-gray-600 dark:text-slate-300 leading-relaxed">
              Are you sure you want to cancel <strong>"{cancellingDonation.foodName}"</strong> ({cancellingDonation.mealCount} meals)?
              This will immediately remove it from the NGO <strong>Find Food</strong> section and cancel any pending requests.
            </p>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-700 dark:text-slate-300">
                Reason for Cancellation:
              </label>
              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full text-xs font-medium bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-2.5 focus:outline-none focus:border-brand-orange text-gray-900 dark:text-slate-100"
              >
                <option value="Stock out / Food exhausted">Stock out / Food exhausted</option>
                <option value="Irregular measures or details uploaded">Irregular measures or details uploaded</option>
                <option value="Packaging / quality issue">Packaging / quality issue</option>
                <option value="Other donor arrangement">Other donor arrangement</option>
              </select>
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                onClick={() => setCancellingDonation(null)}
                className="px-4 py-2 text-xs font-bold text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-all"
              >
                Keep Listing
              </button>
              <button
                onClick={handleConfirmCancel}
                className="px-4 py-2 text-xs font-extrabold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-md transition-all active:scale-95"
              >
                Yes, Cancel Listing
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
