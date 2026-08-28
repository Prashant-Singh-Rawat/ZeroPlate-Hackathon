import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { FoodDonation } from '../types';
import { StatCard } from '../components/StatCard';
import { FoodCard } from '../components/FoodCard';
import { LoadingState } from '../components/LoadingState';
import { Utensils, CheckCircle, Heart, PlusCircle, Inbox, ArrowRight, AlertCircle } from 'lucide-react';

interface DonorDashboardProps {
  onNavigate: (tab: string, extraData?: any) => void;
}

export const DonorDashboard: React.FC<DonorDashboardProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [donations, setDonations] = useState<FoodDonation[]>([]);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const [donationsRes, requestsRes] = await Promise.all([
        fetch(`/api/donations?donorId=${user?.id || 'donor_spicevilla'}`),
        fetch(`/api/requests?donorId=${user?.id || 'donor_spicevilla'}&status=PENDING`),
      ]);

      if (donationsRes.ok) {
        const dData = await donationsRes.json();
        setDonations(dData);
      }

      if (requestsRes.ok) {
        const rData = await requestsRes.json();
        setPendingRequestsCount(rData.length);
      }
    } catch (e) {
      console.warn('Dashboard fetch error', e);
    } finally {
      setIsLoading(false);
    }
  };

  const totalMeals = donations.reduce((acc, item) => acc + item.mealCount, 0) || 360;
  const activeDonationsCount = donations.filter(
    (d) => d.status === 'AVAILABLE' || d.status === 'PENDING_REQUEST'
  ).length;
  const completedPickupsCount = donations.filter((d) => d.status === 'COMPLETED').length || 1;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-orange-500 via-brand-orange to-brand-deep rounded-3xl p-6 sm:p-8 text-white shadow-warm-lg flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[11px] font-black uppercase tracking-wider">
            <span>🍽️ {t('donorPortal')}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            {t('welcomeBack')} {user?.name || 'SpiceVilla Restaurant'} 👋
          </h1>
          <p className="text-xs sm:text-sm text-orange-100 font-medium leading-relaxed">
            {t('donorSubtitle')}
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-3 shrink-0">
          <button
            onClick={() => onNavigate('add-food')}
            className="px-5 py-3 bg-white hover:bg-orange-50 text-brand-deep font-black text-xs rounded-2xl shadow-warm-sm hover:shadow-warm-md transition-all flex items-center gap-2 active:scale-95"
          >
            <PlusCircle className="w-4 h-4 text-brand-orange" />
            <span>{t('addFoodDonation')}</span>
          </button>
          <button
            onClick={() => onNavigate('requests')}
            className="px-5 py-3 bg-black/25 hover:bg-black/35 backdrop-blur-md text-white font-extrabold text-xs rounded-2xl border border-white/20 transition-all flex items-center gap-2 relative"
          >
            <Inbox className="w-4 h-4" />
            <span>{t('viewNGORequests')}</span>
            {pendingRequestsCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-brand-orange text-white shadow-sm">
                {pendingRequestsCount} new
              </span>
            )}
          </button>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title={t('mealsDonated')}
          value={totalMeals}
          subtitle="Cumulative surplus meals"
          icon={Utensils}
          color="orange"
        />
        <StatCard
          title={t('activeDonations')}
          value={activeDonationsCount}
          subtitle="Currently listed / pending"
          icon={Inbox}
          color="amber"
        />
        <StatCard
          title={t('successfulPickups')}
          value={completedPickupsCount}
          subtitle="Completed collections"
          icon={CheckCircle}
          color="emerald"
        />
        <StatCard
          title={t('peopleImpacted')}
          value={Math.round(totalMeals * 1.1)}
          subtitle="Estimated individuals fed"
          icon={Heart}
          color="blue"
        />
      </div>

      {/* Urgent Callout if requests pending */}
      {pendingRequestsCount > 0 && (
        <div className="bg-amber-50 dark:bg-amber-950/40 rounded-2xl border-2 border-amber-300 dark:border-amber-800/80 p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-warm-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-500 text-white rounded-xl">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-black text-amber-800 dark:text-amber-300 uppercase tracking-wider">
                {t('actionRequiredRequests')} ({pendingRequestsCount})
              </span>
              <p className="text-xs text-amber-950 dark:text-amber-200 mt-0.5 font-medium">
                {t('actionRequiredDesc')}
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('requests')}
            className="px-4 py-2.5 bg-brand-orange text-white font-extrabold text-xs rounded-xl shadow-warm-sm hover:bg-brand-deep transition-all shrink-0 flex items-center gap-1.5"
          >
            <span>{t('reviewNGORequests')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Recent Donations */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-brand-text dark:text-slate-100">{t('myFoodListings')}</h2>
            <p className="text-xs text-brand-muted dark:text-slate-400">Active surplus food and pending pickup statuses</p>
          </div>
          <button
            onClick={() => onNavigate('donations')}
            className="text-xs font-bold text-brand-orange dark:text-orange-400 hover:underline flex items-center gap-1"
          >
            <span>{t('viewAll')} ({donations.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {isLoading ? (
          <LoadingState message="Loading your food donations..." />
        ) : donations.length === 0 ? (
          <div className="p-8 bg-white dark:bg-[#1E293B] rounded-3xl border border-dashed border-gray-200 dark:border-slate-800 text-center space-y-3">
            <p className="text-xs font-medium text-brand-muted dark:text-slate-400">You have no active food donations.</p>
            <button
              onClick={() => onNavigate('add-food')}
              className="px-4 py-2 bg-brand-orange text-white font-bold text-xs rounded-xl shadow-warm-sm"
            >
              {t('addFoodDonation')}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {donations.slice(0, 3).map((item) => (
              <FoodCard
                key={item.id}
                donation={item}
                role="donor"
                onViewRequests={() => onNavigate('requests')}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
