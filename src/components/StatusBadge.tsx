import React from 'react';
import { CheckCircle2, Clock, XCircle, AlertCircle, PackageCheck, Inbox } from 'lucide-react';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const styles: Record<
    string,
    { label: string; bg: string; icon: React.FC<{ className?: string }> }
  > = {
    AVAILABLE: {
      label: 'Available',
      bg: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
      icon: CheckCircle2,
    },
    PENDING_REQUEST: {
      label: 'Request Pending',
      bg: 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800 animate-pulse-subtle',
      icon: Inbox,
    },
    CONFIRMED: {
      label: 'Confirmed',
      bg: 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
      icon: PackageCheck,
    },
    RESERVED: {
      label: 'Reserved',
      bg: 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800',
      icon: Clock,
    },
    PICKUP_IN_PROGRESS: {
      label: 'Pickup in Progress',
      bg: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
      icon: Clock,
    },
    COMPLETED: {
      label: 'Completed',
      bg: 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800',
      icon: CheckCircle2,
    },
    CANCELLED: {
      label: 'Cancelled',
      bg: 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400 border-gray-200 dark:border-slate-700',
      icon: XCircle,
    },
    REJECTED: {
      label: 'Declined',
      bg: 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800',
      icon: XCircle,
    },
    EXPIRED: {
      label: 'Expired',
      bg: 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800',
      icon: AlertCircle,
    },
  };

  const current = styles[status] || styles.AVAILABLE;
  const Icon = current.icon;
  const padding = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-bold';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${current.bg} ${padding} transition-all duration-200`}
    >
      <Icon className="w-3.5 h-3.5" />
      <span>{current.label}</span>
    </span>
  );
};
