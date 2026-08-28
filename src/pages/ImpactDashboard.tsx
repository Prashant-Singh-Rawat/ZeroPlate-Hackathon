import React, { useState, useEffect } from 'react';
import { StatCard } from '../components/StatCard';
import { LoadingState } from '../components/LoadingState';
import { Utensils, Heart, TrendingUp, CheckCircle, ShieldCheck, Activity, Award } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export const ImpactDashboard: React.FC = () => {
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

  const COLORS = ['#F97316', '#16A34A', '#F59E0B', '#3B82F6'];

  return (
    <div className="space-y-6">
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
            <span className="text-2xl font-black">{impactData?.totalMealsRescued ?? 0}</span>
            <p className="text-xs text-orange-100 font-bold">Total Meals Saved</p>
          </div>
        </div>
      </div>

      {isLoading ? (
        <LoadingState message="Aggregating live community impact metrics..." />
      ) : (
        <>
          {/* Key Impact Stats (§13) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Meals Rescued"
              value={impactData?.totalMealsRescued ?? 0}
              subtitle="Plates of surplus food saved"
              icon={Utensils}
              color="orange"
            />
            <StatCard
              title="People Served"
              value={impactData?.peopleServed ?? 0}
              subtitle="Individual meals delivered"
              icon={Heart}
              color="emerald"
            />
            <StatCard
              title="Food Waste Prevented"
              value={`${impactData?.foodWastePreventedKg ?? 0} kg`}
              subtitle="CO₂ greenhouse reduction"
              icon={TrendingUp}
              color="blue"
            />
            <StatCard
              title="Successful Pickups"
              value={impactData?.successfulPickups ?? 0}
              subtitle="Completed rescue drives"
              icon={CheckCircle}
              color="amber"
            />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Category Breakdown Bar Chart */}
            <div className="bg-white rounded-3xl border border-amber-900/5 p-6 shadow-warm-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-brand-text text-base">Meals Rescued by Food Category</h3>
                <span className="text-xs text-brand-muted">Surplus Distribution</span>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={impactData?.categoryData || []}>
                    <XAxis dataKey="name" stroke="#6B7280" fontSize={11} />
                    <YAxis stroke="#6B7280" fontSize={11} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#FFFDF8',
                        borderRadius: '12px',
                        border: '1px solid #FDBA74',
                        fontSize: '12px',
                      }}
                    />
                    <Bar dataKey="meals" fill="#F97316" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Live Activity Feed */}
            <div className="bg-white rounded-3xl border border-amber-900/5 p-6 shadow-warm-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-brand-text text-base flex items-center gap-2">
                  <Activity className="w-5 h-5 text-brand-orange" />
                  <span>Real-Time Activity Feed</span>
                </h3>
                <span className="text-xs text-emerald-600 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Live
                </span>
              </div>

              <div className="space-y-3">
                {impactData?.recentActivity && impactData.recentActivity.length > 0 ? (
                  impactData.recentActivity.map((act: any) => (
                    <div
                      key={act.id}
                      className="p-3 bg-brand-cream/60 rounded-xl border border-orange-100 text-xs flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="font-semibold text-brand-text">{act.text}</span>
                      </div>
                      <span className="text-[10px] font-bold text-gray-400 shrink-0 uppercase">
                        {act.status}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-brand-muted p-4 text-center">
                    No activity recorded yet. Completed rescue drives will appear here.
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
