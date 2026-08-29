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
      iconBg: 'bg-orange-500 text-white',
      badge: 'bg-orange-50 text-orange-600 border-orange-200 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-800',
      accent: 'text-orange-500',
    },
    emerald: {
      iconBg: 'bg-emerald-500 text-white',
      badge: 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
      accent: 'text-emerald-500',
    },
    amber: {
      iconBg: 'bg-amber-500 text-white',
      badge: 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
      accent: 'text-amber-500',
    },
    blue: {
      iconBg: 'bg-blue-500 text-white',
      badge: 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800',
      accent: 'text-blue-500',
    },
    purple: {
      iconBg: 'bg-purple-500 text-white',
      badge: 'bg-purple-50 text-purple-600 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800',
      accent: 'text-purple-500',
    },
    rose: {
      iconBg: 'bg-rose-500 text-white',
      badge: 'bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800',
      accent: 'text-rose-500',
    },
  };

  const c = cfg[color];

  return (
    <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-5 border border-gray-200/80 dark:border-slate-800 shadow-sm hover:border-gray-300 dark:hover:border-slate-700 transition-all duration-200 group">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl ${c.iconBg} flex items-center justify-center shadow-sm`}>
          <Icon className="w-5 h-5" />
        </div>
        {trend && (
          <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${c.badge}`}>
            <TrendingUp className={`w-2.5 h-2.5 ${trendUp ? '' : 'rotate-180'}`} />
            {trend}
          </span>
        )}
      </div>

      <div className="space-y-1">
        <p className="text-xs font-bold text-gray-500 dark:text-slate-400 tracking-wide uppercase">{title}</p>
        <p className="text-3xl font-black text-gray-900 dark:text-white tracking-tight leading-none">{value}</p>
        {subtitle && (
          <p className="text-[11px] text-gray-400 dark:text-slate-500 font-medium pt-0.5">{subtitle}</p>
        )}
      </div>
    </div>
  );
};
