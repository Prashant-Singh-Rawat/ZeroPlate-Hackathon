import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { StatCard } from '../components/StatCard';
import { getLocalDonations } from '../services/donationStorage';
import { getLocalBookings } from '../services/requestStorage';
import {
  Utensils,
  Heart,
  TrendingUp,
  CheckCircle,
  Activity,
  Award,
  Sparkles,
  Droplets,
  TreePine,
  Zap,
  ShieldCheck,
  Flame,
  Truck,
  Box,
  Apple,
  Coffee,
} from 'lucide-react';

interface CategoryItem {
  id: string;
  name: string;
  meals: number;
  percentage: number;
  color: string;
  bgLight: string;
  bgDark: string;
  icon: any;
}

export const ImpactDashboard: React.FC = () => {
  const { t } = useLanguage();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  // Dynamic calculations based on live donations and bookings
  const localDonations = getLocalDonations();
  const localBookings = getLocalBookings();

  const additionalMeals = localDonations.reduce((sum, d) => sum + (Number(d.mealCount) || 0), 0);
  const completedDrives = localBookings.filter((b) => b.status === 'COMPLETED').length;

  const totalMeals = 360 + additionalMeals;
  const peopleServed = Math.round(totalMeals * 1.1);
  const wastePreventedKg = Math.round(totalMeals * 0.5);
  const successfulPickups = 3 + completedDrives;
  const co2AvoidedKg = Math.round(wastePreventedKg * 2.5);
  const waterSavedLiters = Math.round(totalMeals * 120);

  const categories: CategoryItem[] = [
    {
      id: 'cooked',
      name: 'Cooked Meals & Curries',
      meals: Math.round(totalMeals * 0.4),
      percentage: 40,
      color: '#F97316',
      bgLight: 'bg-orange-500',
      bgDark: 'dark:bg-orange-500',
      icon: Utensils,
    },
    {
      id: 'groceries',
      name: 'Packaged Staples & Rice',
      meals: Math.round(totalMeals * 0.25),
      percentage: 25,
      color: '#10B981',
      bgLight: 'bg-emerald-500',
      bgDark: 'dark:bg-emerald-500',
      icon: Box,
    },
    {
      id: 'bakery',
      name: 'Bakery, Bread & Rotis',
      meals: Math.round(totalMeals * 0.18),
      percentage: 18,
      color: '#F59E0B',
      bgLight: 'bg-amber-500',
      bgDark: 'dark:bg-amber-500',
      icon: Flame,
    },
    {
      id: 'produce',
      name: 'Fresh Fruits & Vegetables',
      meals: Math.round(totalMeals * 0.11),
      percentage: 11,
      color: '#06B6D4',
      bgLight: 'bg-cyan-500',
      bgDark: 'dark:bg-cyan-500',
      icon: Apple,
    },
    {
      id: 'dairy',
      name: 'Dairy, Milk & Beverages',
      meals: Math.round(totalMeals * 0.06),
      percentage: 6,
      color: '#8B5CF6',
      bgLight: 'bg-purple-500',
      bgDark: 'dark:bg-purple-500',
      icon: Coffee,
    },
  ];

  const recentActivities = [
    {
      id: '1',
      title: 'Surplus Food Rescue Completed',
      detail: '80 hot meals safely distributed to Hope Foundation shelter home.',
      time: '12m ago',
      type: 'delivery',
      status: 'VERIFIED',
    },
    {
      id: '2',
      title: 'Smart Matching Engine Dispatched',
      detail: 'Surplus roti and curry routed to nearest registered NGO via GPS proximity.',
      time: '45m ago',
      type: 'match',
      status: 'OPTIMIZED',
    },
    {
      id: '3',
      title: 'Greenhouse Emission Averted',
      detail: `${wastePreventedKg} kg food waste prevented from rotting in local municipal landfills.`,
      time: '2h ago',
      type: 'eco',
      status: 'ECO-SAVED',
    },
    {
      id: '4',
      title: 'Community Nutrition Drive',
      detail: '60 packaged meal boxes delivered by volunteer transport fleet.',
      time: '5h ago',
      type: 'delivery',
      status: 'DELIVERED',
    },
  ];

  return (
    <div className="space-y-6 animate-fadeIn pb-8">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-brand-deep rounded-3xl p-6 sm:p-8 text-white shadow-warm-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-black uppercase tracking-wider">
              <Award className="w-4 h-4 text-amber-300" />
              <span>Public Impact Registry & Analytics</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              ZeroPlate Collective Environmental & Social Impact
            </h1>
            <p className="text-sm text-orange-100 font-medium max-w-2xl leading-relaxed">
              Live tracking of surplus food diverted from landfills, greenhouse gas reductions, and community meals delivered in real time.
            </p>
          </div>

          <div className="p-5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shrink-0 text-center shadow-inner">
            <span className="text-3xl font-black text-amber-200">{totalMeals.toLocaleString()}</span>
            <p className="text-xs text-orange-100 font-extrabold uppercase tracking-wider mt-0.5">
              Total Meals Rescued
            </p>
          </div>
        </div>
      </div>

      {/* Key Impact Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title={t('mealsDonated', 'Meals Donated')}
          value={totalMeals.toLocaleString()}
          subtitle="Plates of surplus food saved"
          icon={Utensils}
          color="orange"
        />
        <StatCard
          title={t('peopleServed', 'People Served')}
          value={peopleServed.toLocaleString()}
          subtitle="Individual hunger relief meals"
          icon={Heart}
          color="emerald"
        />
        <StatCard
          title="Food Waste Diverted"
          value={`${wastePreventedKg} kg`}
          subtitle="Organic waste kept from landfills"
          icon={TrendingUp}
          color="blue"
        />
        <StatCard
          title={t('successfulPickups', 'Successful Pickups')}
          value={successfulPickups}
          subtitle="Completed NGO rescue drives"
          icon={CheckCircle}
          color="amber"
        />
      </div>

      {/* Main Breakdown Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): Meals Rescued by Food Category */}
        <div className="lg:col-span-7 bg-white dark:bg-[#1E293B] rounded-3xl border border-amber-900/5 dark:border-slate-800 p-6 sm:p-7 shadow-warm-sm space-y-6 transition-colors">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-gray-100 dark:border-slate-800">
            <div>
              <h3 className="font-black text-brand-text dark:text-slate-100 text-lg flex items-center gap-2">
                <Utensils className="w-5 h-5 text-brand-orange" />
                <span>Meals Rescued by Food Category</span>
              </h3>
              <p className="text-xs text-brand-muted dark:text-slate-400 mt-0.5">
                Breakdown of rescued surplus food inventory by nutrition category
              </p>
            </div>
            <span className="px-3 py-1 bg-orange-50 dark:bg-orange-950/40 text-brand-orange dark:text-orange-300 rounded-full text-xs font-black border border-orange-200 dark:border-orange-800 self-start sm:self-auto">
              100% Verified
            </span>
          </div>

          {/* Interactive Category Progress Bars */}
          <div className="space-y-4">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isSelected = activeCategory === cat.id;

              return (
                <div
                  key={cat.id}
                  onMouseEnter={() => setActiveCategory(cat.id)}
                  onMouseLeave={() => setActiveCategory(null)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-brand-orange bg-orange-50/50 dark:bg-slate-800/90 shadow-sm scale-[1.01]'
                      : 'border-gray-100 dark:border-slate-700/60 bg-gray-50/50 dark:bg-slate-800/40 hover:bg-gray-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-sm"
                        style={{ backgroundColor: cat.color }}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-brand-text dark:text-slate-100">
                          {cat.name}
                        </h4>
                        <span className="text-[11px] font-semibold text-brand-muted dark:text-slate-400">
                          {cat.meals} meals rescued
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-sm font-black" style={{ color: cat.color }}>
                        {cat.percentage}%
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-2.5 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700 ease-out"
                      style={{
                        width: `${cat.percentage}%`,
                        backgroundColor: cat.color,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Category Summary Footer */}
          <div className="pt-2 flex items-center justify-between text-xs font-bold text-brand-muted dark:text-slate-400 border-t border-gray-100 dark:border-slate-800">
            <span>Total Rescued Categories: 5</span>
            <span className="text-brand-orange dark:text-orange-400 font-extrabold">
              {totalMeals} Cumulative Plates
            </span>
          </div>
        </div>

        {/* Right Column (5 cols): Live Real-Time Activity Feed */}
        <div className="lg:col-span-5 bg-white dark:bg-[#1E293B] rounded-3xl border border-amber-900/5 dark:border-slate-800 p-6 sm:p-7 shadow-warm-sm space-y-6 transition-colors flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-slate-800">
              <h3 className="font-black text-brand-text dark:text-slate-100 text-lg flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <span>Real-Time Activity Feed</span>
              </h3>
              <div className="flex items-center gap-1.5 px-2.5 py-0.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 rounded-full text-xs font-black border border-emerald-200 dark:border-emerald-800">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span>Live Feed</span>
              </div>
            </div>

            <div className="mt-4 space-y-3.5">
              {recentActivities.map((act) => (
                <div
                  key={act.id}
                  className="p-3.5 bg-gray-50 dark:bg-slate-800/60 rounded-2xl border border-gray-100 dark:border-slate-700/60 text-xs space-y-1.5 transition-all hover:border-emerald-200 dark:hover:border-emerald-800"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span className="font-black text-brand-text dark:text-slate-100">
                        {act.title}
                      </span>
                    </div>
                    <span className="text-[10px] font-extrabold text-emerald-700 dark:text-emerald-300 bg-emerald-100/70 dark:bg-emerald-950/80 px-2 py-0.5 rounded-md uppercase">
                      {act.status}
                    </span>
                  </div>

                  <p className="text-[11px] font-medium text-brand-muted dark:text-slate-300 pl-6 leading-relaxed">
                    {act.detail}
                  </p>

                  <div className="pl-6 pt-0.5 text-[10px] font-bold text-gray-400 dark:text-slate-400">
                    {act.time}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Eco Benefits Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border border-emerald-200/60 dark:border-emerald-800/60 space-y-3">
            <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300">
              <TreePine className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <h4 className="font-black text-xs uppercase tracking-wider">
                Eco Equivalency Score
              </h4>
            </div>

            <div className="grid grid-cols-2 gap-2 text-center text-xs">
              <div className="p-2 bg-white/70 dark:bg-slate-800/70 rounded-xl border border-emerald-100 dark:border-slate-700">
                <span className="block font-black text-emerald-700 dark:text-emerald-300 text-sm">
                  {co2AvoidedKg} kg
                </span>
                <span className="text-[10px] font-bold text-gray-500 dark:text-slate-400">
                  CO₂ Diverted
                </span>
              </div>

              <div className="p-2 bg-white/70 dark:bg-slate-800/70 rounded-xl border border-emerald-100 dark:border-slate-700">
                <span className="block font-black text-cyan-700 dark:text-cyan-300 text-sm">
                  {waterSavedLiters.toLocaleString()} L
                </span>
                <span className="text-[10px] font-bold text-gray-500 dark:text-slate-400">
                  Water Conserved
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
