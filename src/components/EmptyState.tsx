import React from 'react';
import { Utensils, LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: LucideIcon;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionLabel,
  onAction,
  icon: Icon,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-3xl border border-amber-900/10 shadow-warm-sm my-6 space-y-4">
      {/* 2D ZeroPlate Plate & Utensils Illustration */}
      <div className="relative w-24 h-24 flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-100 rounded-full border-2 border-orange-200 shadow-inner">
        <div className="w-16 h-16 rounded-full border-2 border-dashed border-orange-300 flex items-center justify-center bg-white/80 shadow-sm">
          {Icon ? (
            <Icon className="w-8 h-8 text-brand-orange" />
          ) : (
            <Utensils className="w-8 h-8 text-brand-orange" />
          )}
        </div>
        <span className="absolute -top-1 -right-1 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-4 w-4 bg-brand-orange"></span>
        </span>
      </div>

      <div className="max-w-md space-y-1.5">
        <h3 className="text-xl font-black text-brand-text tracking-tight">{title}</h3>
        <p className="text-xs font-medium text-brand-muted leading-relaxed">{description}</p>
      </div>

      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="px-6 py-2.5 bg-brand-orange hover:bg-brand-deep text-white font-extrabold text-xs rounded-xl shadow-warm-md hover:shadow-warm-lg transition-all active:scale-95 flex items-center gap-2 mt-2"
        >
          <span>{actionLabel}</span>
        </button>
      )}
    </div>
  );
};

