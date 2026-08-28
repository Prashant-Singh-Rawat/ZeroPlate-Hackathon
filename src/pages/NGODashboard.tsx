import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { FoodDonation, MatchScoreResult } from '../types';
import { StatCard } from '../components/StatCard';
import { FoodCard } from '../components/FoodCard';
import { LoadingState } from '../components/LoadingState';
import { Utensils, Inbox, CheckCircle, Users, Search, Sparkles, ArrowRight, MapPin } from 'lucide-react';

interface NGODashboardProps {
  onNavigate: (tab: string, extraData?: any) => void;
  onRequestDonation: (donation: FoodDonation) => void;
}

export const NGODashboard: React.FC<NGODashboardProps> = ({
  onNavigate,
  onRequestDonation,
}) => {
  const { user, subscriptionPlan } = useAuth();
  const [nearbyFood, setNearbyFood] = useState<(FoodDonation & { match?: MatchScoreResult })[]>([]);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
  const [confirmedPickupsCount, setConfirmedPickupsCount] = useState(0);
  const [peopleServedCount, setPeopleServedCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchNGOData();
  }, [user]);

  const fetchNGOData = async () => {
    setIsLoading(true);
    try {
      const [donationsRes, requestsRes, bookingsRes] = await Promise.all([
        fetch(`/api/donations?ngoId=${user?.id || 'ngo_hope'}&status=AVAILABLE`),
        fetch(`/api/requests?ngoId=${user?.id || 'ngo_hope'}&status=PENDING`),
        fetch(`/api/bookings?userId=${user?.id || 'ngo_hope'}&role=ngo`),
      ]);

      if (donationsRes.ok) {
        const dData = await donationsRes.json();
        setNearbyFood(dData);
      }

      if (requestsRes.ok) {
        const rData = await requestsRes.json();
        setPendingRequestsCount(rData.length);
      }

      if (bookingsRes.ok) {
        const bData = await bookingsRes.json();
        const completedOrConfirmed = bData.filter((b: any) => b.status === 'CONFIRMED' || b.status === 'COMPLETED');
        setConfirmedPickupsCount(completedOrConfirmed.length);
        const mealsTotal = completedOrConfirmed.reduce((acc: number, curr: any) => acc + (curr.mealCount || 0), 0);
        setPeopleServedCount(Math.round(mealsTotal * 1.1));
      }
    } catch (e) {
      console.warn('NGO Dashboard fetch error', e);
    } finally {
      setIsLoading(false);
    }
  };

  const availableFoodCount = nearbyFood.length;

  return (
    <div className="space-y-6">
      {/* Header Banner (§8) */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-800 rounded-3xl p-6 sm:p-8 text-white shadow-warm-lg flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[11px] font-black uppercase tracking-wider">
              ❤️ NGO Rescue Portal
            </span>
            {subscriptionPlan === 'premium' && (
              <span className="px-2.5 py-0.5 bg-amber-400 text-amber-950 font-black text-[11px] rounded-full flex items-center gap-1">
                <Sparkles className="w-3 h-3 fill-amber-950" />
                Priority Matching
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Welcome back, {user?.name || 'Hope Foundation'} 👋
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100 font-medium leading-relaxed">
            Find available food near you and help feed your community. Real-time matching based on distance, quantity fit, and pickup deadlines.
          </p>
        </div>

        {/* Primary Quick Action (§8) */}
        <div className="flex flex-wrap gap-3 shrink-0">
          <button
            onClick={() => onNavigate('find-food')}
            className="px-5 py-3 bg-white hover:bg-emerald-50 text-emerald-900 font-black text-xs rounded-2xl shadow-warm-sm hover:shadow-warm-md transition-all flex items-center gap-2 active:scale-95"
          >
            <Search className="w-4 h-4 text-emerald-700" />
            <span>Find Food Nearby</span>
          </button>
          <button
            onClick={() => onNavigate('my-requests')}
            className="px-5 py-3 bg-black/25 hover:bg-black/35 backdrop-blur-md text-white font-extrabold text-xs rounded-2xl border border-white/20 transition-all flex items-center gap-2"
          >
            <Inbox className="w-4 h-4" />
            <span>My Requests ({pendingRequestsCount})</span>
          </button>
        </div>
      </div>

      {/* 4 Restrained Stat Cards (§8) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Available Food Nearby"
          value={availableFoodCount}
          subtitle="Ready for pickup collection"
          icon={Utensils}
          color="orange"
        />
        <StatCard
          title="Pending Requests"
          value={pendingRequestsCount}
          subtitle="Awaiting donor response"
          icon={Inbox}
          color="amber"
        />
        <StatCard
          title="Confirmed Pickups"
          value={confirmedPickupsCount}
          subtitle="Active & completed drives"
          icon={CheckCircle}
          color="emerald"
        />
        <StatCard
          title="People Served"
          value={peopleServedCount}
          subtitle="Community meals delivered"
          icon={Users}
          color="blue"
        />
      </div>

      {/* Recommended Nearby Food (§8) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-brand-text">Surplus Food Ranked for You</h2>
            <p className="text-xs text-brand-muted">Ranked using 40% Distance + 40% Capacity + 20% Urgency</p>
          </div>
          <button
            onClick={() => onNavigate('find-food')}
            className="text-xs font-bold text-brand-orange hover:underline flex items-center gap-1"
          >
            <span>Explore All Surplus</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {isLoading ? (
          <LoadingState message="Calculating real-time distance and capacity match scores..." />
        ) : nearbyFood.length === 0 ? (
          <div className="bg-white p-8 rounded-3xl border border-amber-900/5 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-orange-100 text-brand-orange flex items-center justify-center mx-auto">
              <Utensils className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-brand-text">Fresh food is waiting to be shared.</h3>
            <p className="text-xs text-brand-muted max-w-sm mx-auto">
              Once a restaurant or food donor lists surplus food, compatible donations will appear here.
            </p>
            <button
              onClick={() => onNavigate('find-food')}
              className="px-4 py-2 bg-brand-orange text-white text-xs font-bold rounded-xl shadow-warm-sm hover:bg-brand-deep transition-all"
            >
              Check Find Food Page
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {nearbyFood.slice(0, 3).map((item) => (
              <FoodCard
                key={item.id}
                donation={item}
                role="ngo"
                onRequest={(d) => onRequestDonation(d)}
                onViewDetails={(d) => onNavigate('find-food', { selectedDonation: d })}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
