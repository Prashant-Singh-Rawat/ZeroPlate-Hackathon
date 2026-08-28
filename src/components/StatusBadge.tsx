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
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      icon: CheckCircle2,
    },
    PENDING_REQUEST: {
      label: 'Request Pending',
      bg: 'bg-amber-50 text-amber-800 border-amber-300 animate-pulse-subtle',
      icon: Inbox,
    },
    CONFIRMED: {
      label: 'Confirmed',
      bg: 'bg-blue-50 text-blue-700 border-blue-200',
      icon: PackageCheck,
    },
    RESERVED: {
      label: 'Reserved',
      bg: 'bg-amber-50 text-amber-800 border-amber-300',
      icon: Clock,
    },
    PICKUP_IN_PROGRESS: {
      label: 'Pickup in Progress',
      bg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      icon: Clock,
    },
    COMPLETED: {
      label: 'Completed',
      bg: 'bg-purple-50 text-purple-700 border-purple-200',
      icon: CheckCircle2,
    },
    CANCELLED: {
      label: 'Cancelled',
      bg: 'bg-gray-100 text-gray-600 border-gray-200',
      icon: XCircle,
    },
    REJECTED: {
      label: 'Declined',
      bg: 'bg-red-50 text-red-700 border-red-200',
      icon: XCircle,
    },
    EXPIRED: {
      label: 'Expired',
      bg: 'bg-red-50 text-red-700 border-red-200',
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
