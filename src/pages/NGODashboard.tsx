import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { FoodDonation, MatchScoreResult, NGOFoodRequirement } from '../types';
import { StatCard } from '../components/StatCard';
import { FoodCard } from '../components/FoodCard';
import { LoadingState } from '../components/LoadingState';
import {
  Utensils,
  Inbox,
  CheckCircle,
  Users,
  Search,
  Sparkles,
  ArrowRight,
  MapPin,
  Sliders,
  CheckCircle2,
  X,
  RefreshCw,
} from 'lucide-react';

import { computeFullMatch } from '../services/matching/matchingEngine';
import { syncCloudDonations, syncCloudRequests } from '../services/cloudSync';
import { getLocalDonations } from '../services/donationStorage';

interface NGODashboardProps {
  onNavigate: (tab: string, extraData?: any) => void;
  onRequestDonation: (donation: FoodDonation) => void;
}

export const NGODashboard: React.FC<NGODashboardProps> = ({
  onNavigate,
  onRequestDonation,
}) => {
  const { user, subscriptionPlan } = useAuth();
  
  const mapDonationsWithScores = (donationsList: FoodDonation[]) => {
    const ngoLat = user?.latitude || 19.062;
    const ngoLng = user?.longitude || 72.854;
    return donationsList
      .filter((d) => d.status === 'AVAILABLE' || d.status === 'PENDING_REQUEST')
      .map((d) => {
        const match = computeFullMatch(
          { lat: d.latitude, lng: d.longitude },
          { lat: ngoLat, lng: ngoLng },
          d.mealCount,
          100,
          d.pickupDeadline,
          subscriptionPlan === 'premium',
          user?.name || 'Hope Foundation'
        );
        return { ...d, match };
      });
  };

  const [nearbyFood, setNearbyFood] = useState<(FoodDonation & { match?: MatchScoreResult })[]>(() => {
    return mapDonationsWithScores(getLocalDonations());
  });
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
  const [requirement, setRequirement] = useState<NGOFoodRequirement | null>(null);
  const [selectedDonor, setSelectedDonor] = useState<FoodDonation | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Requirements Modal State with LocalStorage Persistence
  const cacheKey = `zeroplate_req_${user?.id || 'ngo_hope'}`;
  const getInitialReq = () => {
    try {
      const saved = localStorage.getItem(cacheKey);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return { reqMeals: 120, reqWeight: 60, reqRadius: 10, reqFoodType: 'veg' };
  };

  const initialValues = getInitialReq();
  const [showReqModal, setShowReqModal] = useState(false);
  const [reqMeals, setReqMeals] = useState<number>(initialValues.reqMeals ?? 120);
  const [reqWeight, setReqWeight] = useState<number>(initialValues.reqWeight ?? 60);
  const [reqRadius, setReqRadius] = useState<number>(initialValues.reqRadius ?? 10);
  const [reqFoodType, setReqFoodType] = useState<'veg' | 'non-veg' | 'either'>(initialValues.reqFoodType ?? 'veg');
  const [isSavingReq, setIsSavingReq] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  // Location State
  const [isLocating, setIsLocating] = useState(false);
  const [locationStatus, setLocationStatus] = useState('📍 Current Location Active');

  useEffect(() => {
    fetchNGOData();
    const interval = setInterval(() => {
      fetchNGOData();
    }, 8000);
    return () => clearInterval(interval);
  }, [user]);

  const fetchNGOData = async () => {
    try {
      const [allDonations, allRequests] = await Promise.all([
        syncCloudDonations(),
        syncCloudRequests(),
      ]);

      const mappedFood = mapDonationsWithScores(allDonations);
      setNearbyFood(mappedFood);
      if (mappedFood.length > 0 && !selectedDonor) {
        setSelectedDonor(mappedFood[0]);
      }

      const userEmail = user?.email?.toLowerCase();
      const userId = user?.id?.toLowerCase();
      const myPending = allRequests.filter((r) => {
        const rNgo = r.ngoId?.toLowerCase();
        return (
          ((userEmail && rNgo === userEmail) || (userId && rNgo === userId) || (!userEmail && rNgo === 'ngo_hope')) &&
          r.status === 'PENDING'
        );
      });
      setPendingRequestsCount(myPending.length);
    } catch (e) {
      console.warn('NGO Dashboard fetch error', e);
    }
  };

  const handleRefreshLocation = () => {
    if (!navigator.geolocation) return;
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        setLocationStatus(`📍 GPS: ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`);
      },
      () => {
        setIsLocating(false);
        setLocationStatus('📍 Mumbai Central NGO Zone');
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const handleSaveRequirements = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingReq(true);

    const updatedData = {
      reqMeals: Number(reqMeals) || 120,
      reqWeight: Number(reqWeight) || 60,
      reqRadius: Number(reqRadius) || 10,
      reqFoodType,
    };

    // Save to local cache immediately
    try {
      localStorage.setItem(cacheKey, JSON.stringify(updatedData));
    } catch (err) {}

    try {
      const res = await fetch('/api/ngos/requirements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ngoId: user?.id || 'ngo_hope',
          requiredMeals: updatedData.reqMeals,
          estWeight: updatedData.reqWeight,
          maximumRadius: updatedData.reqRadius,
          foodType: updatedData.reqFoodType,
          foodSpecifications: ['Rice', 'Dal', 'Rice + Dal', 'Biryani'],
          urgency: 'high',
          specificRequirement: `Est. weight: ${updatedData.reqWeight} kg`,
          requiredBy: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.requirement) {
          setRequirement(data.requirement);
        }
      }
    } catch (e) {
      console.warn('Could not post requirement to server, local cache preserved', e);
    } finally {
      setIsSavingReq(false);
      setShowReqModal(false);
      setSaveSuccessMsg('Requirements updated successfully! Matching criteria refreshed.');
      setTimeout(() => setSaveSuccessMsg(''), 4000);
      fetchNGOData();
    }
  };

  const availableFoodCount = nearbyFood.filter(
    (f) => f.status === 'AVAILABLE' || f.status === 'PENDING_REQUEST'
  ).length;

  return (
    <div className="space-y-6">
      {/* Toast Notification for Requirement Update */}
      {saveSuccessMsg && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-center justify-between shadow-sm animate-fadeIn text-emerald-800 dark:text-emerald-200">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="text-xs sm:text-sm font-bold">{saveSuccessMsg}</span>
          </div>
          <button
            onClick={() => setSaveSuccessMsg('')}
            className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 p-1 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-800 rounded-2xl sm:rounded-3xl p-5 sm:p-7 md:p-8 text-white shadow-warm-lg flex flex-col md:flex-row md:items-center justify-between gap-5 sm:gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="flex flex-wrap items-center gap-2">
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
          <h1 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight leading-tight">
            Welcome back, {user?.name || 'Hope Foundation'} 👋
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100 font-medium leading-relaxed">
            Find nearby food donations and deliver more meals to people in need.
          </p>
        </div>

        {/* Primary Quick Actions */}
        <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 w-full md:w-auto shrink-0">
          <button
            onClick={() => onNavigate('find-food')}
            className="w-full sm:w-auto px-5 py-3 bg-white hover:bg-emerald-50 text-emerald-900 font-black text-xs rounded-2xl shadow-warm-sm hover:shadow-warm-md transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
          >
            <Search className="w-4 h-4 text-emerald-700" />
            <span>Find Food</span>
          </button>
          <button
            onClick={() => onNavigate('my-requests')}
            className="w-full sm:w-auto px-5 py-3 bg-black/25 hover:bg-black/35 backdrop-blur-md text-white font-extrabold text-xs rounded-2xl border border-white/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Inbox className="w-4 h-4" />
            <span>My Requests ({pendingRequestsCount})</span>
          </button>
        </div>
      </div>

      {/* Top 4 Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
        <StatCard
          title="Available Food Nearby"
          value={availableFoodCount}
          subtitle="Ready for pickup collection"
          icon={Utensils}
          color="orange"
        />
        <StatCard
          title="Active Food Requests"
          value={pendingRequestsCount}
          subtitle="Awaiting donor response"
          icon={Inbox}
          color="amber"
        />
        <StatCard
          title="Meals Received"
          value={480}
          subtitle="Rescued surplus meals"
          icon={CheckCircle}
          color="emerald"
        />
        <StatCard
          title="People Served"
          value={520}
          subtitle="Community individuals fed"
          icon={Users}
          color="blue"
        />
      </div>

      {/* SECTION: CURRENT FOOD REQUIREMENT CARD */}
      <div className="bg-white dark:bg-[#1E293B] rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-gray-200/80 dark:border-slate-700 shadow-md hover:shadow-lg transition-all space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100 dark:border-slate-700">
          <div>
            <span className="text-[10px] font-black uppercase text-brand-orange tracking-wider">Active Search Criteria</span>
            <h3 className="text-sm sm:text-base font-black text-brand-text dark:text-white">Current Food Requirement</h3>
          </div>
          <button
            onClick={() => setShowReqModal(true)}
            className="px-4 py-2 bg-brand-light dark:bg-orange-950/40 hover:bg-orange-100 text-brand-deep dark:text-orange-400 text-xs font-bold rounded-xl border border-orange-200 dark:border-orange-800 transition-all flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
          >
            <Sliders className="w-3.5 h-3.5 text-brand-orange" />
            <span>Update Requirements</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3 text-xs">
          <div className="bg-gray-50 dark:bg-slate-900/60 p-3 rounded-2xl border border-gray-100 dark:border-slate-700">
            <span className="text-gray-500 dark:text-gray-400 font-bold block text-[10px] uppercase">Meals Needed</span>
            <strong className="text-sm font-black text-brand-text dark:text-white">{reqMeals} meals</strong>
          </div>

          <div className="bg-gray-50 dark:bg-slate-900/60 p-3 rounded-2xl border border-gray-100 dark:border-slate-700">
            <span className="text-gray-500 dark:text-gray-400 font-bold block text-[10px] uppercase">Est. Weight</span>
            <strong className="text-sm font-black text-brand-text dark:text-white">{reqWeight} kg</strong>
          </div>

          <div className="bg-gray-50 dark:bg-slate-900/60 p-3 rounded-2xl border border-gray-100 dark:border-slate-700">
            <span className="text-gray-500 dark:text-gray-400 font-bold block text-[10px] uppercase">Search Radius</span>
            <strong className="text-sm font-black text-brand-text dark:text-white">{reqRadius} km</strong>
          </div>

          <div className="bg-gray-50 dark:bg-slate-900/60 p-3 rounded-2xl border border-gray-100 dark:border-slate-700">
            <span className="text-gray-500 dark:text-gray-400 font-bold block text-[10px] uppercase">Food Preference</span>
            <strong className="text-sm font-black text-emerald-700 dark:text-emerald-400 capitalize">
              {reqFoodType === 'either' ? 'Veg & Non-Veg' : reqFoodType}
            </strong>
          </div>

          <div className="col-span-2 sm:col-span-1 bg-gray-50 dark:bg-slate-900/60 p-3 rounded-2xl border border-gray-100 dark:border-slate-700 flex flex-col justify-between">
            <span className="text-gray-500 dark:text-gray-400 font-bold block text-[10px] uppercase">Location</span>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 truncate">{locationStatus}</span>
              <button
                onClick={handleRefreshLocation}
                disabled={isLocating}
                title="Refresh GPS Location"
                className="text-brand-orange hover:underline text-[10px] font-bold shrink-0 ml-1 cursor-pointer"
              >
                {isLocating ? '...' : 'Refresh'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION: NEAREST FOOD DONORS */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base sm:text-lg font-black text-brand-text dark:text-white">Nearest Food Donors (Ranked by Fit)</h2>
            <p className="text-xs text-brand-muted dark:text-gray-400">Smart ranking based on 40% Distance + 35% Meals + 15% Weight + 10% Urgency</p>
          </div>
          <button
            onClick={() => onNavigate('find-food')}
            className="text-xs font-bold text-brand-orange hover:underline flex items-center gap-1 self-start sm:self-auto cursor-pointer"
          >
            <span>View All Nearby Food</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {isLoading ? (
          <LoadingState message="Calculating real-time distance and capacity match scores..." />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
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

      {/* Edit Requirements Modal */}
      {showReqModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-orange-200 dark:border-slate-700 animate-scaleUp">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-black text-brand-text dark:text-white">Update Food Requirements</h3>
                <p className="text-xs text-brand-muted dark:text-gray-400 mt-0.5">
                  Update active criteria to re-rank surplus food matches.
                </p>
              </div>
              <button
                onClick={() => setShowReqModal(false)}
                className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRequirements} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-brand-text dark:text-gray-300 uppercase mb-1">
                  Required Meals *
                </label>
                <input
                  type="number"
                  value={reqMeals || ''}
                  onChange={(e) => setReqMeals(e.target.value === '' ? 0 : Number(e.target.value))}
                  min={1}
                  required
                  placeholder="e.g. 120"
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-black text-brand-text dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:border-brand-orange focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-brand-text dark:text-gray-300 uppercase mb-1">
                    Est. Weight (kg) *
                  </label>
                  <input
                    type="number"
                    value={reqWeight || ''}
                    onChange={(e) => setReqWeight(e.target.value === '' ? 0 : Number(e.target.value))}
                    min={1}
                    required
                    placeholder="e.g. 60"
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-bold text-brand-text dark:text-white focus:border-brand-orange focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-brand-text dark:text-gray-300 uppercase mb-1">
                    Search Radius (km)
                  </label>
                  <select
                    value={reqRadius}
                    onChange={(e) => setReqRadius(Number(e.target.value))}
                    className="w-full px-3 py-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-bold text-brand-text dark:text-white focus:border-brand-orange focus:outline-none cursor-pointer"
                  >
                    <option value={5}>5 km</option>
                    <option value={10}>10 km</option>
                    <option value={15}>15 km</option>
                    <option value={20}>20 km</option>
                    <option value={25}>25 km</option>
                    <option value={50}>50 km</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-text dark:text-gray-300 uppercase mb-1">
                  Dietary Preference
                </label>
                <select
                  value={reqFoodType}
                  onChange={(e) => setReqFoodType(e.target.value as any)}
                  className="w-full px-3 py-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-bold text-brand-text dark:text-white focus:border-brand-orange focus:outline-none cursor-pointer"
                >
                  <option value="veg">Vegetarian Only</option>
                  <option value="non-veg">Non-Vegetarian Only</option>
                  <option value="either">Either (Both Veg & Non-Veg)</option>
                </select>
              </div>

              <div className="flex items-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowReqModal(false)}
                  className="flex-1 py-3 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-200 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingReq}
                  className="flex-1 py-3 bg-brand-orange hover:bg-brand-deep text-white font-black text-xs rounded-xl shadow-warm-sm transition-all flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer disabled:opacity-75"
                >
                  {isSavingReq ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
                  <span>{isSavingReq ? 'Saving...' : 'Save Requirements'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
