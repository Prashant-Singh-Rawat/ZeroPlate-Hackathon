import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { FoodDonation } from '../types';
import { StatCard } from '../components/StatCard';
import { FoodCard } from '../components/FoodCard';
import { LoadingState } from '../components/LoadingState';
import {
  Utensils, CheckCircle, Heart, PlusCircle, Inbox, ArrowRight,
  AlertCircle, TrendingUp, Zap, BarChart2, Clock, Star
} from 'lucide-react';

import { getLocalDonations } from '../services/donationStorage';

interface DonorDashboardProps {
  onNavigate: (tab: string, extraData?: any) => void;
}

export const DonorDashboard: React.FC<DonorDashboardProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [donations, setDonations] = useState<FoodDonation[]>(() => {
    const local = getLocalDonations();
    const currentDonorId = user?.id || 'donor_spicevilla';
    return local.filter((d) => d.donorId === currentDonorId || d.donorId === 'donor_spicevilla' || currentDonorId === 'donor_spicevilla');
  });
  const [pendingRequestsCount, setPendingRequestsCount] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      const currentDonorId = user?.id || 'donor_spicevilla';
      const local = getLocalDonations();
      const donorLocal = local.filter((d) => d.donorId === currentDonorId || d.donorId === 'donor_spicevilla' || currentDonorId === 'donor_spicevilla');
      setDonations(donorLocal);

      const [donationsRes, requestsRes] = await Promise.all([
        fetch(`/api/donations?donorId=${currentDonorId}`),
        fetch(`/api/requests?donorId=${currentDonorId}&status=PENDING`),
      ]);
      if (donationsRes.ok) {
        const dJson = await donationsRes.json();
        if (Array.isArray(dJson) && dJson.length > 0) setDonations(dJson);
      }
      if (requestsRes.ok) {
        const rJson = await requestsRes.json();
        if (Array.isArray(rJson)) setPendingRequestsCount(rJson.length);
      }
    } catch (e) {
      console.warn('Dashboard fetch error', e);
    }
  };

  const totalMeals = donations.reduce((acc, item) => acc + item.mealCount, 0) || 360;
  const activeDonationsCount = donations.filter(
    (d) => d.status === 'AVAILABLE' || d.status === 'PENDING_REQUEST'
  ).length;
  const completedPickupsCount = donations.filter((d) => d.status === 'COMPLETED').length || 1;
  const impactScore = Math.round(totalMeals * 1.1);

  return (
    <div className="space-y-6 animate-fadeIn">

      {/* ═══════════════════ HERO BANNER ═══════════════════ */}
      <div className="relative bg-gradient-to-br from-orange-500 via-orange-500 to-amber-400 rounded-2xl sm:rounded-3xl p-5 sm:p-7 md:p-8 lg:p-9 text-white shadow-xl overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4 pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-48 h-48 bg-black/5 rounded-full translate-y-1/2 pointer-events-none" />
        <div className="absolute top-4 right-52 w-2 h-2 bg-white/30 rounded-full" />
        <div className="absolute top-8 right-44 w-1 h-1 bg-white/40 rounded-full" />
        <div className="absolute top-12 right-56 w-1.5 h-1.5 bg-white/25 rounded-full" />

        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-5 sm:gap-6">
          <div className="space-y-3 max-w-xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-[10px] font-black uppercase tracking-widest border border-white/20">
                🍽️ Food Donor Portal
              </span>
              {pendingRequestsCount > 0 && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-yellow-400/90 text-yellow-900 rounded-full text-[10px] font-black uppercase tracking-wider animate-pulse-subtle">
                  <Zap className="w-2.5 h-2.5" />
                  {pendingRequestsCount} Pending
                </span>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight leading-tight">
              Welcome back, {user?.name || 'SpiceVilla'} 👋
            </h1>
            <p className="text-xs sm:text-sm text-orange-100 font-medium leading-relaxed">
              Turn surplus food into meaningful impact. Route freshly prepared meals to verified local NGOs before expiry.
            </p>

            {/* Inline quick-stats */}
            <div className="flex flex-wrap items-center gap-4 pt-1">
              <div className="flex items-center gap-1.5 text-white/90">
                <TrendingUp className="w-4 h-4" />
                <span className="text-xs font-bold">{totalMeals} meals donated</span>
              </div>
              <div className="flex items-center gap-1.5 text-white/90">
                <Star className="w-4 h-4 fill-white/60" />
                <span className="text-xs font-bold">{impactScore} people impacted</span>
              </div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 w-full md:w-auto shrink-0">
            <button
              onClick={() => onNavigate('add-food')}
              className="w-full sm:w-auto group px-5 py-3 bg-white hover:bg-orange-50 text-orange-600 font-black text-xs sm:text-sm rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
              Add Food Donation
            </button>
            <button
              onClick={() => onNavigate('requests')}
              className="w-full sm:w-auto px-5 py-3 bg-white/15 hover:bg-white/25 backdrop-blur-sm text-white font-bold text-xs sm:text-sm rounded-2xl border border-white/25 transition-all flex items-center justify-center gap-2 relative active:scale-95 cursor-pointer"
            >
              <Inbox className="w-4 h-4" />
              View NGO Requests
              {pendingRequestsCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[9px] font-black bg-yellow-400 text-yellow-900">
                  {pendingRequestsCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ═══════════════════ STAT CARDS ═══════════════════ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
        <StatCard
          title="Meals Donated"
          value={totalMeals}
          subtitle="Cumulative surplus meals"
          icon={Utensils}
          color="orange"
          trend="+12%"
          trendUp={true}
        />
        <StatCard
          title="Active Donations"
          value={activeDonationsCount}
          subtitle="Currently listed / pending"
          icon={Inbox}
          color="amber"
        />
        <StatCard
          title="Successful Pickups"
          value={completedPickupsCount}
          subtitle="Completed collections"
          icon={CheckCircle}
          color="emerald"
          trend="+1 today"
          trendUp={true}
        />
        <StatCard
          title="People Impacted"
          value={impactScore}
          subtitle="Estimated individuals fed"
          icon={Heart}
          color="blue"
          trend="+8%"
          trendUp={true}
        />
      </div>

      {/* ═══════════════════ URGENT CALLOUT ═══════════════════ */}
      {pendingRequestsCount > 0 && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/40 rounded-2xl border border-amber-200 dark:border-amber-800/60 p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-500 text-white rounded-xl shadow-md shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-black text-amber-800 dark:text-amber-300 uppercase tracking-wider mb-0.5">
                Action Required — {pendingRequestsCount} NGO Request{pendingRequestsCount > 1 ? 's' : ''} Pending
              </p>
              <p className="text-xs text-amber-700 dark:text-amber-400 font-medium">
                NGOs have requested your food donations. Review and confirm pickups.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('requests')}
            className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-extrabold text-xs rounded-xl shadow-md hover:shadow-lg hover:from-amber-600 hover:to-orange-600 transition-all shrink-0 flex items-center gap-2 active:scale-95"
          >
            Review Requests
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ═══════════════════ RECENT LISTINGS ═══════════════════ */}
      <div className="space-y-4">
        {/* Section header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 dark:bg-orange-950/40 rounded-xl">
              <BarChart2 className="w-4 h-4 text-orange-500" />
            </div>
            <div>
              <h2 className="text-base font-black text-gray-900 dark:text-slate-100">My Food Listings</h2>
              <p className="text-xs text-gray-400 dark:text-slate-400">Active surplus food and pending pickup statuses</p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('donations')}
            className="flex items-center gap-1.5 text-xs font-bold text-orange-500 hover:text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/30 hover:bg-orange-100 px-3 py-1.5 rounded-lg transition-all"
          >
            View All ({donations.length})
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {isLoading ? (
          <LoadingState message="Loading your food donations..." />
        ) : donations.length === 0 ? (
          <div className="py-14 bg-gradient-to-b from-orange-50/60 to-white dark:from-orange-950/20 dark:to-[#1E293B] rounded-2xl border-2 border-dashed border-orange-200 dark:border-orange-800/40 text-center space-y-4">
            <div className="w-16 h-16 bg-orange-100 dark:bg-orange-950/60 text-orange-400 rounded-2xl flex items-center justify-center mx-auto">
              <Utensils className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-600 dark:text-slate-300">No active food donations</p>
              <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">Add your first food donation to get started</p>
            </div>
            <button
              onClick={() => onNavigate('add-food')}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-400 text-white font-extrabold text-xs rounded-xl shadow-md hover:shadow-lg transition-all active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              Add Food Donation
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
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

      {/* ═══════════════════ QUICK ACTIONS ROW ═══════════════════ */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            icon: PlusCircle,
            label: 'Add Donation',
            desc: 'List surplus food for NGOs',
            color: 'from-orange-500 to-amber-400',
            tab: 'add-food',
          },
          {
            icon: Clock,
            label: 'Track Bookings',
            desc: 'View pickup schedules',
            color: 'from-blue-500 to-indigo-400',
            tab: 'bookings',
          },
          {
            icon: BarChart2,
            label: 'Impact Report',
            desc: 'See your donation analytics',
            color: 'from-emerald-500 to-teal-400',
            tab: 'impact',
          },
        ].map((action) => (
          <button
            key={action.tab}
            onClick={() => onNavigate(action.tab)}
            className="group flex items-center gap-4 p-5 bg-white dark:bg-[#1E293B] rounded-2xl border border-gray-100 dark:border-slate-700 hover:border-orange-200 dark:hover:border-slate-600 shadow-sm hover:shadow-md transition-all text-left active:scale-95"
          >
            <div className={`p-3 bg-gradient-to-br ${action.color} rounded-xl shadow-md group-hover:scale-110 transition-transform`}>
              <action.icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-extrabold text-gray-900 dark:text-slate-100">{action.label}</p>
              <p className="text-xs text-gray-400 dark:text-slate-400 mt-0.5">{action.desc}</p>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-300 dark:text-slate-600 ml-auto group-hover:text-orange-400 group-hover:translate-x-1 transition-all" />
          </button>
        ))}
      </div>
    </div>
  );
};
