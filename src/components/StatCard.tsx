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
    orange: 'bg-orange-50 text-brand-orange border-orange-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-amber-900/5 shadow-warm-sm hover:shadow-warm-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-brand-muted">{title}</span>
        <div className={`p-2.5 rounded-xl border ${colorStyles[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-extrabold text-brand-text tracking-tight">{value}</span>
        {trend && <span className="text-xs font-semibold text-emerald-600">{trend}</span>}
      </div>
      {subtitle && <p className="text-xs text-brand-muted mt-1">{subtitle}</p>}
    </div>
  );
};
