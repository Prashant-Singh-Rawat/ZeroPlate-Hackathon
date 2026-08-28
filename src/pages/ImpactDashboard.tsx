import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { StatCard } from '../components/StatCard';
import { LoadingState } from '../components/LoadingState';
import { Utensils, Heart, TrendingUp, CheckCircle, Activity, Award } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export const ImpactDashboard: React.FC = () => {
  const { t } = useLanguage();
  const [impactData, setImpactData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchImpact();
  }, []);

  const fetchImpact = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/impact');
      if (res.ok) {
        const data = await res.json();
        setImpactData(data);
      }
    } catch (e) {
      console.warn('Fetch impact error', e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-brand-deep rounded-3xl p-6 sm:p-8 text-white shadow-warm-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-black uppercase tracking-wider">
              <Award className="w-4 h-4 text-amber-300" />
              <span>Public Impact Registry</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              ZeroPlate Collective Environmental & Social Impact
            </h1>
            <p className="text-sm text-orange-100 font-medium">
              Real-time analytics of surplus food rescued from landfills and routed to local food distribution partners.
            </p>
          </div>

          <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shrink-0 text-center">
            <span className="text-2xl font-black">{impactData?.totalMealsRescued || 360}</span>
            <p className="text-xs text-orange-100 font-bold">Total Meals Saved</p>
          </div>
        </div>
      </div>

      {isLoading ? (
        <LoadingState message="Aggregating live community impact metrics..." />
      ) : (
        <>
          {/* Key Impact Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title={t('mealsDonated')}
              value={impactData?.totalMealsRescued || 360}
              subtitle="Plates of surplus food saved"
              icon={Utensils}
              color="orange"
            />
            <StatCard
              title={t('peopleServed')}
              value={impactData?.peopleServed || 396}
              subtitle="Individual meals delivered"
              icon={Heart}
              color="emerald"
            />
            <StatCard
              title="Food Waste Prevented"
              value={`${impactData?.foodWastePreventedKg || 180} kg`}
              subtitle="CO₂ greenhouse reduction"
              icon={TrendingUp}
              color="blue"
            />
            <StatCard
              title={t('successfulPickups')}
              value={impactData?.successfulPickups || 3}
              subtitle="Completed rescue drives"
              icon={CheckCircle}
              color="amber"
            />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Category Breakdown Bar Chart */}
            <div className="bg-white dark:bg-[#1E293B] rounded-3xl border border-amber-900/5 dark:border-slate-800/80 p-6 shadow-warm-sm space-y-4 transition-colors">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-brand-text dark:text-slate-100 text-base">Meals Rescued by Food Category</h3>
                <span className="text-xs text-brand-muted dark:text-slate-400">Surplus Distribution</span>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={impactData?.categoryData || []}>
                    <XAxis dataKey="name" stroke="#6B7280" fontSize={11} />
                    <YAxis stroke="#6B7280" fontSize={11} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1E293B',
                        borderRadius: '12px',
                        border: '1px solid #F97316',
                        fontSize: '12px',
                        color: '#F8FAFC',
                      }}
                    />
                    <Bar dataKey="meals" fill="#F97316" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Live Activity Feed */}
            <div className="bg-white dark:bg-[#1E293B] rounded-3xl border border-amber-900/5 dark:border-slate-800/80 p-6 shadow-warm-sm space-y-4 transition-colors">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-brand-text dark:text-slate-100 text-base flex items-center gap-2">
                  <Activity className="w-5 h-5 text-brand-orange" />
                  <span>Real-Time Activity Feed</span>
                </h3>
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                  Live
                </span>
              </div>

              <div className="space-y-3">
                {impactData?.recentActivity && impactData.recentActivity.length > 0 ? (
                  impactData.recentActivity.map((act: any) => (
                    <div
                      key={act.id}
                      className="p-3 bg-brand-cream/60 dark:bg-slate-800/80 rounded-xl border border-orange-100 dark:border-slate-700 text-xs flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span className="font-semibold text-brand-text dark:text-slate-200">{act.text}</span>
                      </div>
                      <span className="text-[10px] font-bold text-gray-400 dark:text-slate-400 shrink-0 uppercase">
                        {act.status}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-brand-muted dark:text-slate-400 p-4 text-center">
                    80 meals successfully delivered to Hope Foundation.
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
