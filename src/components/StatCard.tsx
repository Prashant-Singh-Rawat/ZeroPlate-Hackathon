import React from 'react';
import { LucideIcon, TrendingUp } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
  color?: 'orange' | 'emerald' | 'amber' | 'blue' | 'purple' | 'rose';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendUp = true,
  color = 'orange',
}) => {
  const cfg = {
    orange: {
      gradient: 'from-orange-500 to-amber-400',
      iconBg: 'bg-gradient-to-br from-orange-500 to-amber-400',
      badge: 'bg-orange-50 text-orange-600 border-orange-200',
      accent: 'text-orange-500',
      glow: 'shadow-orange-100',
    },
    emerald: {
      gradient: 'from-emerald-500 to-teal-400',
      iconBg: 'bg-gradient-to-br from-emerald-500 to-teal-400',
      badge: 'bg-emerald-50 text-emerald-600 border-emerald-200',
      accent: 'text-emerald-500',
      glow: 'shadow-emerald-100',
    },
    amber: {
      gradient: 'from-amber-500 to-yellow-400',
      iconBg: 'bg-gradient-to-br from-amber-500 to-yellow-400',
      badge: 'bg-amber-50 text-amber-600 border-amber-200',
      accent: 'text-amber-500',
      glow: 'shadow-amber-100',
    },
    blue: {
      gradient: 'from-blue-500 to-indigo-400',
      iconBg: 'bg-gradient-to-br from-blue-500 to-indigo-400',
      badge: 'bg-blue-50 text-blue-600 border-blue-200',
      accent: 'text-blue-500',
      glow: 'shadow-blue-100',
    },
    purple: {
      gradient: 'from-purple-500 to-violet-400',
      iconBg: 'bg-gradient-to-br from-purple-500 to-violet-400',
      badge: 'bg-purple-50 text-purple-600 border-purple-200',
      accent: 'text-purple-500',
      glow: 'shadow-purple-100',
    },
    rose: {
      gradient: 'from-rose-500 to-pink-400',
      iconBg: 'bg-gradient-to-br from-rose-500 to-pink-400',
      badge: 'bg-rose-50 text-rose-600 border-rose-200',
      accent: 'text-rose-500',
      glow: 'shadow-rose-100',
    },
  };

  const c = cfg[color];

  return (
    <div className={`relative bg-white dark:bg-[#1E293B] rounded-2xl p-5 border border-gray-100 dark:border-slate-700 shadow-lg ${c.glow} hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 overflow-hidden group`}>
      {/* Decorative gradient blob */}
      <div className={`absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-br ${c.gradient} opacity-8 rounded-full blur-xl group-hover:opacity-12 transition-opacity`} />

      <div className="relative flex items-start justify-between mb-4">
        <div className={`p-2.5 rounded-xl ${c.iconBg} shadow-md`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        {trend && (
          <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${c.badge}`}>
            <TrendingUp className={`w-2.5 h-2.5 ${trendUp ? '' : 'rotate-180'}`} />
            {trend}
          </span>
        )}
      </div>

      <div className="relative space-y-0.5">
        <p className="text-xs font-semibold text-gray-500 dark:text-slate-400 tracking-wide uppercase">{title}</p>
        <p className={`text-3xl font-black ${c.accent} dark:text-white tracking-tight leading-none`}>{value}</p>
        {subtitle && (
          <p className="text-[11px] text-gray-400 dark:text-slate-500 font-medium pt-1">{subtitle}</p>
        )}
      </div>

      {/* Bottom accent bar */}
      <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r ${c.gradient} opacity-60`} />
    </div>
  );
};
