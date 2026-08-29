import React from 'react';
import { PackageOpen, LucideIcon } from 'lucide-react';

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
  icon: Icon = PackageOpen,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-10 text-center bg-brand-cream/60 dark:bg-slate-800/40 rounded-3xl border border-dashed border-orange-200 dark:border-slate-700 my-4 transition-colors">
      <div className="p-4 bg-brand-light dark:bg-orange-950/50 rounded-full text-brand-orange dark:text-orange-400 mb-4 shadow-warm-sm">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-bold text-brand-text dark:text-slate-100 mb-1">{title}</h3>
      <p className="text-sm text-brand-muted dark:text-slate-400 max-w-md mb-5">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="px-5 py-2.5 bg-brand-orange hover:bg-brand-deep text-white font-semibold text-sm rounded-xl shadow-warm-sm hover:shadow-warm-md transition-all active:scale-95"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};
