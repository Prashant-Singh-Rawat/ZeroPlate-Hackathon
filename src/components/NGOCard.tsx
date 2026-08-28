import React from 'react';
import { NGO, MatchScoreResult } from '../types';
import { MatchScore } from './MatchScore';
import { MapPin, Users, Sparkles, CheckCircle2, ArrowRight, ShieldCheck } from 'lucide-react';

interface NGOCardProps {
  ngo: NGO & { match?: MatchScoreResult };
  isBestMatch?: boolean;
  onReserve?: (ngo: NGO) => void;
}

export const NGOCard: React.FC<NGOCardProps> = ({
  ngo,
  isBestMatch = false,
  onReserve,
}) => {
  const match = ngo.match;

  if (isBestMatch) {
    return (
      <div className="bg-gradient-to-br from-orange-50 via-white to-amber-50 rounded-2xl border-2 border-brand-orange shadow-warm-lg p-6 relative overflow-hidden mb-6">
        {/* Best Match Badge */}
        <div className="absolute top-0 right-0 bg-brand-orange text-white text-xs font-black uppercase tracking-wider px-4 py-1.5 rounded-bl-2xl shadow-sm flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 fill-white" />
          <span>Top Recommended Partner</span>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pt-2">
          <div className="space-y-3 flex-1">
            <div className="flex items-center gap-3">
              <h3 className="text-2xl font-extrabold text-brand-text">
                {ngo.organizationName}
              </h3>
              {ngo.isPremium && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-600 fill-amber-500" />
                  Priority Partner
                </span>
              )}
            </div>

            {/* Quick Metrics Row */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-brand-muted font-medium">
              <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-orange-100 shadow-warm-sm">
                <MapPin className="w-4 h-4 text-brand-orange" />
                <span>{match ? `${match.distanceKm} km away` : 'Nearby'}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-orange-100 shadow-warm-sm">
                <Users className="w-4 h-4 text-brand-orange" />
                <span>Capacity: {ngo.capacity} meals/day</span>
              </div>
              <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-xl border border-emerald-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Verified Active</span>
              </div>
            </div>

            {/* Match Score & Dynamic Explanation */}
            {match && (
              <div className="mt-4 p-4 bg-white/90 rounded-2xl border border-orange-200 shadow-warm-sm">
                <div className="flex items-center gap-3 mb-2">
                  <MatchScore score={match.matchScore} isPremium={ngo.isPremium} size="lg" />
                  <span className="text-xs font-semibold text-brand-muted">
                    Based on distance (40%), capacity fit (40%), urgency (20%)
                  </span>
                </div>
                <p className="text-sm font-medium text-brand-text leading-relaxed">
                  "{match.explanation}"
                </p>
              </div>
            )}
          </div>

          {/* Action CTA */}
          {onReserve && (
            <div className="shrink-0 flex flex-col justify-center">
              <button
                onClick={() => onReserve(ngo)}
                className="px-6 py-3.5 bg-brand-orange hover:bg-brand-deep text-white font-extrabold text-base rounded-xl shadow-warm-md hover:shadow-warm-lg transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                <span>Reserve for {ngo.organizationName.split(' ')[0]}</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Standard ranked NGO item
  return (
    <div className="bg-white rounded-2xl border border-amber-900/5 p-5 shadow-warm-sm hover:shadow-warm-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <h4 className="font-bold text-base text-brand-text">{ngo.organizationName}</h4>
          {ngo.isPremium && (
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
              Priority
            </span>
          )}
          {match && <MatchScore score={match.matchScore} isPremium={ngo.isPremium} size="sm" />}
        </div>

        <div className="flex items-center gap-4 text-xs text-brand-muted">
          <span>{match ? `${match.distanceKm} km away` : 'Nearby'}</span>
          <span>•</span>
          <span>Capacity: {ngo.capacity} meals</span>
        </div>

        {match?.explanation && (
          <p className="text-xs text-gray-600 bg-brand-cream/50 p-2.5 rounded-xl border border-orange-100">
            {match.explanation}
          </p>
        )}
      </div>

      {onReserve && (
        <button
          onClick={() => onReserve(ngo)}
          className="px-4 py-2.5 bg-brand-light hover:bg-orange-100 text-brand-deep font-bold text-xs rounded-xl border border-orange-200 transition-all shrink-0 active:scale-95"
        >
          Reserve Food
        </button>
      )}
    </div>
  );
};
