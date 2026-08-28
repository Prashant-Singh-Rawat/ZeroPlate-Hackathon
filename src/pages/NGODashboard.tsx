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
  Compass,
  Sliders,
  Radio,
  CheckCircle2,
  X,
  Navigation,
  Crosshair,
  Building2,
} from 'lucide-react';

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
  const [requirement, setRequirement] = useState<NGOFoodRequirement | null>(null);
  const [selectedDonor, setSelectedDonor] = useState<FoodDonation | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Requirements Modal State
  const [showReqModal, setShowReqModal] = useState(false);
  const [reqMeals, setReqMeals] = useState<number>(120);
  const [reqWeight, setReqWeight] = useState<number>(60);
  const [reqRadius, setReqRadius] = useState<number>(10);
  const [reqFoodType, setReqFoodType] = useState<'veg' | 'non-veg' | 'either'>('veg');

  // Location State
  const [isLocating, setIsLocating] = useState(false);
  const [locationStatus, setLocationStatus] = useState('📍 Current Location Active');

  useEffect(() => {
    fetchNGOData();
  }, [user]);

  const fetchNGOData = async () => {
    setIsLoading(true);
    try {
      const [donationsRes, requestsRes, reqRes] = await Promise.all([
        fetch(`/api/donations?ngoId=${user?.id || 'ngo_hope'}`),
        fetch(`/api/requests?ngoId=${user?.id || 'ngo_hope'}&status=PENDING`),
        fetch(`/api/ngos/requirements?ngoId=${user?.id || 'ngo_hope'}`),
      ]);

      if (donationsRes.ok) {
        const dData = await donationsRes.json();
        setNearbyFood(dData);
        if (dData.length > 0) setSelectedDonor(dData[0]);
      }

      if (requestsRes.ok) {
        const rData = await requestsRes.json();
        setPendingRequestsCount(rData.length);
      }

      if (reqRes.ok) {
        const reqData = await reqRes.json();
        if (reqData) {
          setRequirement(reqData);
          setReqMeals(reqData.requiredMeals || 120);
          setReqRadius(reqData.maximumRadius || 10);
          setReqFoodType(reqData.foodType || 'veg');
        }
      }
    } catch (e) {
      console.warn('NGO Dashboard fetch error', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefreshLocation = () => {
    if (!navigator.geolocation) return;
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        setLocationStatus(`📍 GPS Active: ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`);
      },
      () => {
        setIsLocating(false);
        setLocationStatus('📍 Default Mumbai NGO Zone (Bandra)');
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const handleSaveRequirements = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/ngos/requirements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ngoId: user?.id || 'ngo_hope',
          requiredMeals: Number(reqMeals),
          maximumRadius: Number(reqRadius),
          foodType: reqFoodType,
          foodSpecifications: ['Rice', 'Dal', 'Rice + Dal', 'Biryani'],
          urgency: 'high',
          requiredBy: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
        }),
      });

      if (res.ok) {
        setShowReqModal(false);
        fetchNGOData();
      }
    } catch (e) {
      setShowReqModal(false);
    }
  };

  const availableFoodCount = nearbyFood.filter(
    (f) => f.status === 'AVAILABLE' || f.status === 'PENDING_REQUEST'
  ).length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
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
            Find nearby food donations and deliver more meals to people in need.
          </p>
        </div>

        {/* Primary Quick Actions */}
        <div className="flex flex-wrap gap-3 shrink-0">
          <button
            onClick={() => onNavigate('find-food')}
            className="px-5 py-3 bg-white hover:bg-emerald-50 text-emerald-900 font-black text-xs rounded-2xl shadow-warm-sm hover:shadow-warm-md transition-all flex items-center gap-2 active:scale-95"
          >
            <Search className="w-4 h-4 text-emerald-700" />
            <span>Find Food</span>
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

      {/* Top 4 Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
      <div className="bg-white rounded-3xl p-6 border border-amber-900/5 shadow-warm-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
          <div>
            <span className="text-[10px] font-black uppercase text-brand-orange tracking-wider">Active Search Criteria</span>
            <h3 className="text-base font-black text-brand-text">Current Food Requirement</h3>
          </div>
          <button
            onClick={() => setShowReqModal(true)}
            className="px-4 py-2 bg-brand-light hover:bg-orange-100 text-brand-deep text-xs font-bold rounded-xl border border-orange-200 transition-all flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Sliders className="w-3.5 h-3.5 text-brand-orange" />
            <span>Update Requirements</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
          <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100">
            <span className="text-gray-500 font-bold block text-[10px] uppercase">Meals Needed</span>
            <strong className="text-sm font-black text-brand-text">{reqMeals} meals</strong>
          </div>

          <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100">
            <span className="text-gray-500 font-bold block text-[10px] uppercase">Est. Weight</span>
            <strong className="text-sm font-black text-brand-text">{reqWeight} kg</strong>
          </div>

          <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100">
            <span className="text-gray-500 font-bold block text-[10px] uppercase">Search Radius</span>
            <strong className="text-sm font-black text-brand-text">{reqRadius} km</strong>
          </div>

          <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100">
            <span className="text-gray-500 font-bold block text-[10px] uppercase">Food Preference</span>
            <strong className="text-sm font-black text-emerald-700 capitalize">{reqFoodType}</strong>
          </div>

          <div className="col-span-2 sm:col-span-1 bg-gray-50 p-3 rounded-2xl border border-gray-100 flex flex-col justify-between">
            <span className="text-gray-500 font-bold block text-[10px] uppercase">Location</span>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-emerald-800 truncate">{locationStatus}</span>
              <button
                onClick={handleRefreshLocation}
                disabled={isLocating}
                title="Refresh GPS Location"
                className="text-brand-orange hover:underline text-[10px] font-bold shrink-0 ml-1"
              >
                {isLocating ? '...' : 'Refresh'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION: NEAREST FOOD DONORS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-brand-text">Nearest Food Donors (Ranked by Fit)</h2>
            <p className="text-xs text-brand-muted">Smart ranking based on 40% Distance + 35% Meals + 15% Weight + 10% Urgency</p>
          </div>
          <button
            onClick={() => onNavigate('find-food')}
            className="text-xs font-bold text-brand-orange hover:underline flex items-center gap-1"
          >
            <span>View All Nearby Food</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {isLoading ? (
          <LoadingState message="Calculating real-time distance and capacity match scores..." />
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

      {/* SECTION: LIVE MAP */}
      <div className="bg-white rounded-3xl p-6 border border-amber-900/5 shadow-warm-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase text-brand-orange tracking-wider flex items-center gap-1">
              <Compass className="w-3.5 h-3.5" />
              <span>Interactive Geolocation Radar</span>
            </span>
            <h3 className="text-base font-black text-brand-text">Live Map & Nearby Donors</h3>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold">
            <span className="flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              🟠 Your Location
            </span>
            <span className="flex items-center gap-1 text-orange-800 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200">
              🍽️ Food Donors
            </span>
          </div>
        </div>

        {/* Embedded Map Visual */}
        <div className="relative rounded-2xl overflow-hidden border-2 border-orange-200 shadow-sm h-72 bg-slate-950 flex flex-col justify-between">
          <iframe
            title="NGO Interactive Discovery Map"
            width="100%"
            height="100%"
            frameBorder="0"
            scrolling="no"
            marginHeight={0}
            marginWidth={0}
            src="https://www.openstreetmap.org/export/embed.html?bbox=72.82%2C19.04%2C72.89%2C19.10&layer=mapnik&marker=19.062%2C72.854"
            className="w-full h-full opacity-90 hover:opacity-100 transition-opacity"
          />

          {/* Interactive Donor Info Overlay Card */}
          {selectedDonor && (
            <div className="absolute bottom-3 left-3 right-3 bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-orange-200 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <span className="px-2 py-0.5 bg-brand-orange text-white text-[9px] font-black rounded-full">
                  Selected Donor
                </span>
                <h4 className="text-xs font-black text-brand-text">{selectedDonor.donorName}</h4>
                <p className="text-[11px] text-brand-muted truncate max-w-md">
                  {selectedDonor.foodName} • {selectedDonor.mealCount} Meals ({selectedDonor.quantity || '40 kg'}) • Pickup before {new Date(selectedDonor.pickupDeadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onRequestDonation(selectedDonor)}
                  className="px-4 py-2 bg-brand-orange hover:bg-brand-deep text-white font-black text-xs rounded-xl shadow-warm-sm active:scale-95 transition-all"
                >
                  Request Food
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Requirements Modal */}
      {showReqModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-orange-200 animate-status-pop">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-black text-brand-text">Update Food Requirements</h3>
                <p className="text-xs text-brand-muted mt-0.5">
                  Update active criteria to re-rank surplus food matches.
                </p>
              </div>
              <button
                onClick={() => setShowReqModal(false)}
                className="p-1 hover:bg-gray-100 rounded-lg text-gray-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRequirements} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-brand-text uppercase mb-1">
                  Required Meals *
                </label>
                <input
                  type="number"
                  value={reqMeals}
                  onChange={(e) => setReqMeals(Number(e.target.value))}
                  min={1}
                  required
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-black focus:bg-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-brand-text uppercase mb-1">
                    Est. Weight (kg)
                  </label>
                  <input
                    type="number"
                    value={reqWeight}
                    onChange={(e) => setReqWeight(Number(e.target.value))}
                    min={1}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-brand-text focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-brand-text uppercase mb-1">
                    Search Radius (km)
                  </label>
                  <select
                    value={reqRadius}
                    onChange={(e) => setReqRadius(Number(e.target.value))}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-brand-text focus:outline-none"
                  >
                    <option value={5}>5 km</option>
                    <option value={10}>10 km</option>
                    <option value={15}>15 km</option>
                    <option value={25}>25 km</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-text uppercase mb-1">
                  Dietary Preference
                </label>
                <select
                  value={reqFoodType}
                  onChange={(e) => setReqFoodType(e.target.value as any)}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-brand-text focus:outline-none"
                >
                  <option value="veg">Vegetarian Only</option>
                  <option value="non-veg">Non-Vegetarian Only</option>
                  <option value="either">Either (Both)</option>
                </select>
              </div>

              <div className="flex items-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowReqModal(false)}
                  className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-brand-orange hover:bg-brand-deep text-white font-black text-xs rounded-xl shadow-warm-sm transition-all flex items-center justify-center gap-1.5 active:scale-95"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Save Requirements</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
