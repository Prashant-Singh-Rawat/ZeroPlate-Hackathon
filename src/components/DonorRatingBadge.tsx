import React, { useState } from 'react';
import { Star, Utensils, Truck, Scale, ChevronDown, CheckCircle2 } from 'lucide-react';
import { getDonorRatingSummary } from '../services/ratingStorage';

interface DonorRatingBadgeProps {
  donorId?: string;
  size?: 'sm' | 'md' | 'lg';
  showDetails?: boolean;
  onRateClick?: () => void;
}

export const DonorRatingBadge: React.FC<DonorRatingBadgeProps> = ({
  donorId,
  size = 'md',
  showDetails = false,
  onRateClick,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const summary = getDonorRatingSummary(donorId);

  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3.5 py-1.5 gap-2',
  };

  const starSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  };

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className={`inline-flex items-center rounded-full font-black border transition-all cursor-pointer shadow-sm bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-900/60 text-amber-900 dark:text-amber-300 border-amber-300/80 dark:border-amber-700/80 ${sizeClasses[size]}`}
        title="Verified Donor Rating (Click to view breakdown)"
      >
        <Star className={`${starSizes[size]} text-amber-500 fill-amber-400`} />
        <span>{summary.averageRating}</span>
        <span className="text-[10px] font-semibold text-amber-700 dark:text-amber-400">
          ({summary.totalReviews})
        </span>
        {showDetails && <ChevronDown className="w-3 h-3 text-amber-600 dark:text-amber-400 ml-0.5" />}
      </button>

      {/* Breakdown Popover */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
            }}
          />
          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute right-0 top-full mt-2 z-[70] w-68 p-4 rounded-2xl bg-white dark:bg-[#1E293B] border border-amber-200 dark:border-slate-700 shadow-2xl space-y-2.5 text-xs animate-status-pop"
          >
            <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-slate-800">
              <div className="font-extrabold text-brand-text dark:text-slate-100 flex items-center gap-1.5">
                <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
                <span>Verified Donor Rating</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800">
                {summary.totalReviews} Review{summary.totalReviews !== 1 ? 's' : ''}
              </span>
            </div>

            <div className="space-y-2 text-[11px]">
              {/* 1. Quality */}
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-gray-600 dark:text-slate-300 font-medium">
                  <Utensils className="w-3.5 h-3.5 text-orange-500" />
                  <span>Food Quality:</span>
                </span>
                <span className="font-extrabold text-amber-600 dark:text-amber-400">
                  {summary.qualityAverage}★ / 5
                </span>
              </div>

              {/* 2. Delivery */}
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-gray-600 dark:text-slate-300 font-medium">
                  <Truck className="w-3.5 h-3.5 text-blue-500" />
                  <span>Delivery Experience:</span>
                </span>
                <span className="font-extrabold text-blue-600 dark:text-blue-400">
                  {summary.deliveryAverage}★ / 5
                </span>
              </div>

              {/* 3. Quantity */}
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-gray-600 dark:text-slate-300 font-medium">
                  <Scale className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Quantity Accuracy:</span>
                </span>
                <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                  {summary.quantityAverage}★ / 5
                </span>
              </div>
            </div>

            {onRateClick && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(false);
                  onRateClick();
                }}
                className="w-full mt-2 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
              >
                <Star className="w-3.5 h-3.5 fill-white" />
                <span>⭐ Rate This Donor (3 Questions)</span>
              </button>
            )}

            <div className="pt-1.5 border-t border-gray-100 dark:border-slate-800 text-[10px] text-gray-400 dark:text-slate-400 text-center font-medium">
              Evaluated by verified NGO pickup partners
            </div>
          </div>
        </>
      )}
    </div>
  );
};
