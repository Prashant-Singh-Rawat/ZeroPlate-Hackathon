import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Star, X, CheckCircle2, Utensils, Truck, Scale, Sparkles, AlertCircle, ShieldCheck } from 'lucide-react';
import { Booking, DonorRatingFeedback } from '../types';
import { submitDonorRating, getRatingForBooking } from '../services/ratingStorage';
import confetti from 'canvas-confetti';

interface RatingModalProps {
  booking: Booking;
  isOpen: boolean;
  onClose: () => void;
  onRatingSubmitted: (feedback: DonorRatingFeedback) => void;
}

export const RatingModal: React.FC<RatingModalProps> = ({
  booking,
  isOpen,
  onClose,
  onRatingSubmitted,
}) => {
  const existing = getRatingForBooking(booking.id);

  // Initialize with 0 stars so the evaluator actively chooses
  const [foodQuality, setFoodQuality] = useState<number>(existing?.foodQualityScore || 0);
  const [deliveryExperience, setDeliveryExperience] = useState<number>(existing?.deliveryScore || 0);
  const [quantityAccuracy, setQuantityAccuracy] = useState<number>(existing?.quantityAccuracyScore || 0);
  const [hoverQuality, setHoverQuality] = useState<number>(0);
  const [hoverDelivery, setHoverDelivery] = useState<number>(0);
  const [hoverQuantity, setHoverQuantity] = useState<number>(0);
  const [feedbackNotes, setFeedbackNotes] = useState<string>(existing?.feedbackNotes || '');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isAllRated = foodQuality > 0 && deliveryExperience > 0 && quantityAccuracy > 0;
  const isAnyRated = foodQuality > 0 || deliveryExperience > 0 || quantityAccuracy > 0;

  const overallScore = isAllRated
    ? Number(((foodQuality + deliveryExperience + quantityAccuracy) / 3).toFixed(1))
    : isAnyRated
    ? Number(
        (
          [foodQuality, deliveryExperience, quantityAccuracy].filter((v) => v > 0).reduce((a, b) => a + b, 0) /
          [foodQuality, deliveryExperience, quantityAccuracy].filter((v) => v > 0).length
        ).toFixed(1)
      )
    : 0.0;

  const getStarLabel = (rating: number) => {
    switch (rating) {
      case 0:
        return 'Not rated';
      case 1:
        return 'Poor (1/5)';
      case 2:
        return 'Fair (2/5)';
      case 3:
        return 'Good (3/5)';
      case 4:
        return 'Very Good (4/5)';
      case 5:
        return 'Exceptional (5/5)';
      default:
        return `${rating}/5`;
    }
  };

  const renderStarSelector = (
    value: number,
    hoverValue: number,
    onChange: (val: number) => void,
    onHover: (val: number) => void,
    colorClass: string
  ) => {
    const activeValue = hoverValue > 0 ? hoverValue : value;

    return (
      <div className="flex items-center justify-between gap-2 flex-wrap pt-0.5">
        <div className="flex items-center gap-1 sm:gap-1.5" onMouseLeave={() => onHover(0)}>
          {[1, 2, 3, 4, 5].map((star) => {
            const isFilled = activeValue >= star;
            return (
              <button
                key={star}
                type="button"
                onMouseEnter={() => onHover(star)}
                onClick={() => {
                  setErrorMessage('');
                  onChange(star);
                }}
                className="p-1 sm:p-1.5 rounded-xl hover:bg-orange-100/60 dark:hover:bg-slate-700/60 transition-all active:scale-90 cursor-pointer focus:outline-none"
                title={`Rate ${star} Star${star > 1 ? 's' : ''}`}
              >
                <Star
                  className={`w-5 h-5 sm:w-6 sm:h-6 transition-all duration-150 ${
                    isFilled
                      ? `${colorClass} fill-current scale-110 drop-shadow-md`
                      : 'text-gray-300 dark:text-slate-600 hover:text-amber-400'
                  }`}
                />
              </button>
            );
          })}
        </div>
        <span
          className={`text-xs font-black px-2 py-0.5 rounded-lg transition-colors ${
            value > 0
              ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 border border-amber-300/60 dark:border-amber-700/60'
              : 'text-gray-400 dark:text-slate-500 font-semibold'
          }`}
        >
          {getStarLabel(value)}
        </span>
      </div>
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (foodQuality === 0 || deliveryExperience === 0 || quantityAccuracy === 0) {
      setErrorMessage('⚠️ Please select a star rating (1–5) for all 3 evaluation questions.');
      return;
    }

    setIsSubmitting(true);
    try {
      const { feedback } = submitDonorRating({
        bookingId: booking.id,
        donorId: booking.donorId,
        donorName: booking.donorName,
        ngoId: booking.ngoId,
        ngoName: booking.ngoName,
        foodName: booking.foodName,
        foodQualityScore: foodQuality,
        deliveryScore: deliveryExperience,
        quantityAccuracyScore: quantityAccuracy,
        feedbackNotes,
      });

      confetti({
        particleCount: 140,
        spread: 90,
        origin: { y: 0.5 },
        colors: ['#F59E0B', '#F97316', '#10B981'],
      });

      onRatingSubmitted(feedback);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render via createPortal directly into document.body
  const modalContent = (
    <div
      className="fixed inset-0 z-[99999] w-full h-full bg-black/80 backdrop-blur-md overflow-y-auto overscroll-contain flex flex-col justify-start md:justify-center items-center p-3 sm:p-6 py-4 sm:py-8 animate-fadeIn"
      style={{ margin: 0, top: 0, left: 0 }}
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-[#1E293B] rounded-3xl md:rounded-[28px] max-w-4xl w-full shadow-2xl border border-orange-200/80 dark:border-slate-700 flex flex-col md:grid md:grid-cols-12 transition-all relative overflow-hidden my-auto shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ══════════════════ LEFT PANEL: DESKTOP ONLY HERO (Hidden on Mobile) ══════════════════ */}
        <div className="hidden md:flex md:col-span-5 bg-gradient-to-br from-brand-deep via-orange-600 to-amber-600 text-white p-6 md:p-8 flex-col justify-between relative overflow-hidden shrink-0">
          {/* Ambient decorative glow */}
          <div className="absolute -top-12 -right-12 w-44 h-44 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 w-44 h-44 bg-orange-400/20 rounded-full blur-2xl pointer-events-none" />

          <div className="space-y-4 relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/15 backdrop-blur-md rounded-full text-xs font-black tracking-wider uppercase border border-white/20">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Verified Impact Review</span>
            </div>

            <div>
              <h2 className="text-2xl font-black tracking-tight leading-snug">
                {booking.foodName}
              </h2>
              <p className="text-sm text-orange-100 font-medium mt-1">
                {booking.mealCount} Meals • Donated by{' '}
                <strong className="text-white underline decoration-amber-300 font-bold">{booking.donorName}</strong>
              </p>
            </div>

            {/* Live Auto-Calculated Score Card */}
            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 space-y-1.5 mt-3">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-200 block">
                Live Calculated Score
              </span>
              <div className="flex items-baseline gap-2">
                <div className="flex items-center gap-1 text-amber-300">
                  <Star className="w-6 h-6 fill-amber-300 drop-shadow" />
                </div>
                <span className="text-3xl font-black tracking-tight">
                  {isAllRated ? overallScore : isAnyRated ? overallScore : '0.0'}
                </span>
                <span className="text-xs font-bold text-orange-100">/ 5.0</span>
              </div>
              <p className="text-[11px] text-orange-100 font-medium">
                {isAllRated
                  ? '⭐ Average of Quality, Delivery & Quantity Accuracy'
                  : 'Tap all 3 star ratings to calculate overall rating'}
              </p>
            </div>
          </div>

          <div className="pt-4 relative z-10 border-t border-white/15 text-[11px] text-orange-100 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-white">
              <ShieldCheck className="w-4 h-4 text-emerald-300" />
              <span>Transparent Reputation Engine</span>
            </div>
            <p className="leading-relaxed opacity-90">
              Your rating updates this donor's score across all active listings on ZeroPlate.
            </p>
          </div>
        </div>

        {/* ══════════════════ RIGHT PANEL: All 3 Evaluation Questions ══════════════════ */}
        <div className="w-full md:col-span-7 p-4 sm:p-6 md:p-8 flex flex-col justify-between space-y-3.5 bg-white dark:bg-[#1E293B]">
          <div className="space-y-3">
            {/* Desktop Header */}
            <div className="hidden md:flex items-center justify-between pb-2 border-b border-gray-100 dark:border-slate-800">
              <div>
                <h3 className="text-lg font-black text-brand-text dark:text-slate-100">
                  Rate Food Donor
                </h3>
                <p className="text-xs text-brand-muted dark:text-slate-400">
                  Tap stars to evaluate on a 1–5 scale
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile Header (Clean & Compact) */}
            <div className="md:hidden flex items-center justify-between pb-2.5 border-b border-gray-100 dark:border-slate-800">
              <div>
                <div className="flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
                  <h3 className="text-sm sm:text-base font-black text-brand-text dark:text-slate-100">
                    Rate {booking.foodName} ({booking.mealCount} Meals)
                  </h3>
                </div>
                <p className="text-[11px] text-brand-muted dark:text-slate-400 mt-0.5">
                  Donor: <strong className="text-brand-text dark:text-slate-200">{booking.donorName}</strong> • Live Score:{' '}
                  <strong className="text-brand-orange font-black">
                    {isAllRated ? overallScore : isAnyRated ? overallScore : '0.0'}★
                  </strong>
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="p-2.5 sm:p-3 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800 rounded-xl text-xs font-bold flex items-center gap-2 animate-shake">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* The 3 Evaluation Questions */}
            <div className="space-y-2.5 sm:space-y-3">
              {/* Question 1: Food Quality */}
              <div className="p-3 sm:p-3.5 rounded-2xl bg-orange-50/50 dark:bg-slate-800/60 border border-orange-100 dark:border-slate-700 space-y-0.5">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-orange-500 text-white flex items-center justify-center shadow-sm shrink-0">
                    <Utensils className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-black text-brand-text dark:text-slate-100 leading-tight">
                      1) Quality of Food Given by Donor
                    </h4>
                    <p className="text-[10px] text-brand-muted dark:text-slate-400">
                      Freshness, taste, hygiene, temperature & safe condition.
                    </p>
                  </div>
                </div>
                {renderStarSelector(foodQuality, hoverQuality, setFoodQuality, setHoverQuality, 'text-amber-400')}
              </div>

              {/* Question 2: Delivery Experience */}
              <div className="p-3 sm:p-3.5 rounded-2xl bg-blue-50/50 dark:bg-slate-800/60 border border-blue-100 dark:border-slate-700 space-y-0.5">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-blue-500 text-white flex items-center justify-center shadow-sm shrink-0">
                    <Truck className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-black text-brand-text dark:text-slate-100 leading-tight">
                      2) Delivery & Pickup Experience
                    </h4>
                    <p className="text-[10px] text-brand-muted dark:text-slate-400">
                      Punctuality, packaging quality & coordination.
                    </p>
                  </div>
                </div>
                {renderStarSelector(deliveryExperience, hoverDelivery, setDeliveryExperience, setHoverDelivery, 'text-blue-500')}
              </div>

              {/* Question 3: Quantity Accuracy */}
              <div className="p-3 sm:p-3.5 rounded-2xl bg-emerald-50/50 dark:bg-slate-800/60 border border-emerald-100 dark:border-slate-700 space-y-0.5">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-emerald-500 text-white flex items-center justify-center shadow-sm shrink-0">
                    <Scale className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-black text-brand-text dark:text-slate-100 leading-tight">
                      3) Quantity Accuracy (Promised vs Received)
                    </h4>
                    <p className="text-[10px] text-brand-muted dark:text-slate-400">
                      Did donor provide full quantity promised ({booking.mealCount} meals)?
                    </p>
                  </div>
                </div>
                {renderStarSelector(quantityAccuracy, hoverQuantity, setQuantityAccuracy, setHoverQuantity, 'text-emerald-500')}
              </div>
            </div>

            {/* Optional Notes */}
            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-brand-text dark:text-slate-300">
                Optional Feedback & Commendation
              </label>
              <input
                type="text"
                value={feedbackNotes}
                onChange={(e) => setFeedbackNotes(e.target.value)}
                placeholder="e.g. Excellent packaging, hot food, and polite coordination!"
                className="w-full px-3.5 py-1.5 sm:py-2 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-medium focus:outline-none focus:border-brand-orange focus:bg-white dark:focus:bg-slate-800 transition-colors"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-end gap-2 sm:gap-3 pt-2.5 sm:pt-3 border-t border-gray-100 dark:border-slate-800 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2 sm:py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 text-xs font-bold text-brand-muted hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors cursor-pointer text-center order-2 sm:order-1"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full sm:w-auto px-6 py-2.5 sm:py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-xs sm:text-sm rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer disabled:opacity-50 order-1 sm:order-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Submit Evaluation</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
};
