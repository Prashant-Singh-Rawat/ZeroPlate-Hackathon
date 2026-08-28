import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: string;
  color?: 'orange' | 'emerald' | 'amber' | 'blue';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color = 'orange',
}) => {
  const colorStyles = {
    orange: 'bg-orange-50 dark:bg-orange-950/40 text-brand-orange dark:text-orange-400 border-orange-100 dark:border-orange-800/60',
    emerald: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800/60',
    amber: 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-800/60',
    blue: 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-800/60',
  };

  return (
    <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-5 border border-amber-900/5 dark:border-slate-800/80 shadow-warm-sm hover:shadow-warm-md transition-all">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-brand-muted dark:text-slate-400">{title}</span>
        <div className={`p-2.5 rounded-xl border ${colorStyles[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-extrabold text-brand-text dark:text-slate-100 tracking-tight">{value}</span>
        {trend && <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">{trend}</span>}
      </div>
      {subtitle && <p className="text-xs text-brand-muted dark:text-slate-400 mt-1">{subtitle}</p>}
    </div>
  );
};
