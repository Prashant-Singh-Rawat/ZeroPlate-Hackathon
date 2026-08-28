import React from 'react';
import { Sparkles, Info } from 'lucide-react';
import { MatchScoreResult } from '../types';

interface MatchScoreProps {
  score: number;
  breakdown?: {
    distanceScore?: number;
    mealScore?: number;
    urgencyScore?: number;
  };
  size?: 'sm' | 'md' | 'lg';
  isPremium?: boolean;
  showBreakdown?: boolean;
}

export const MatchScore: React.FC<MatchScoreProps> = ({
  score,
  breakdown,
  size = 'md',
  isPremium = false,
  showBreakdown = false,
}) => {
  let badgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';

  if (score < 60) {
    badgeColor = 'bg-amber-50 text-amber-700 border-amber-200';
  } else if (score < 85) {
    badgeColor = 'bg-brand-light text-brand-deep border-orange-200';
  }

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs font-bold',
    md: 'px-2.5 py-1 text-sm font-black',
    lg: 'px-3.5 py-1.5 text-base font-black',
  };

  return (
    <div className="inline-flex flex-col gap-1">
      <div className="inline-flex items-center gap-1.5">
        <div
          className={`inline-flex items-center gap-1 rounded-full border shadow-sm ${badgeColor} ${sizeClasses[size]}`}
        >
          {isPremium && <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />}
          <span>{score}% Match</span>
        </div>
      </div>

      {showBreakdown && breakdown && (
        <div className="flex items-center gap-2 text-[10px] font-bold text-brand-muted mt-0.5">
          <span>Distance: {breakdown.distanceScore || 0}/100</span>
          <span>•</span>
          <span>Capacity: {breakdown.mealScore || 0}/100</span>
          <span>•</span>
          <span>Urgency: {breakdown.urgencyScore || 0}/100</span>
        </div>
      )}
    </div>
  );
};
