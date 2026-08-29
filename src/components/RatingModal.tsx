import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Star, X, CheckCircle2, Utensils, Truck, Scale, Sparkles, AlertCircle, ShieldCheck, Heart } from 'lucide-react';
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
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
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
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1" onMouseLeave={() => onHover(0)}>
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
                  className={`w-6 h-6 sm:w-7 sm:h-7 transition-all duration-150 ${
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
          className={`text-xs font-black px-2.5 py-1 rounded-lg transition-colors ${
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

  // Render via createPortal directly into document.body to prevent any container clipping
  const modalContent = (
    <div
      className="fixed inset-0 z-[99999] w-screen h-screen bg-black/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fadeIn"
      style={{ margin: 0, top: 0, left: 0 }}
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-[#1E293B] rounded-[28px] max-w-4xl w-full max-h-[92vh] shadow-2xl border border-orange-200/80 dark:border-slate-700 overflow-hidden my-auto grid grid-cols-1 md:grid-cols-12 transition-all relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ══════════════════ LEFT PANEL: Food Details & Live Score (38%) ══════════════════ */}
        <div className="md:col-span-5 bg-gradient-to-br from-brand-deep via-orange-600 to-amber-600 text-white p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden">
          {/* Ambient decorative glow */}
          <div className="absolute -top-12 -right-12 w-44 h-44 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 w-44 h-44 bg-orange-400/20 rounded-full blur-2xl pointer-events-none" />

          <div className="space-y-4 relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/15 backdrop-blur-md rounded-full text-xs font-black tracking-wider uppercase border border-white/20">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Verified Impact Review</span>
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight leading-snug">
                {booking.foodName}
              </h2>
              <p className="text-xs sm:text-sm text-orange-100 font-medium mt-1">
                {booking.mealCount} Meals • Donated by{' '}
                <strong className="text-white underline decoration-amber-300 font-bold">{booking.donorName}</strong>
              </p>
            </div>

            {/* Live Auto-Calculated Score Card */}
            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 space-y-2 mt-4">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-200 block">
                Live Calculated Score
              </span>
              <div className="flex items-baseline gap-2">
                <div className="flex items-center gap-1 text-amber-300">
                  <Star className="w-7 h-7 fill-amber-300 drop-shadow" />
                </div>
                <span className="text-3xl sm:text-4xl font-black tracking-tight">
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

          <div className="pt-6 relative z-10 border-t border-white/15 text-[11px] text-orange-100 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-white">
              <ShieldCheck className="w-4 h-4 text-emerald-300" />
              <span>Transparent Reputation Engine</span>
            </div>
            <p className="leading-relaxed opacity-90">
              Your rating updates this donor's score across all active listings on ZeroPlate.
            </p>
          </div>
        </div>

        {/* ══════════════════ RIGHT PANEL: The 3 Evaluation Questions (62%) ══════════════════ */}
        <div className="md:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-4 bg-white dark:bg-[#1E293B] overflow-y-auto max-h-[85vh]">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-slate-800">
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

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800 rounded-xl text-xs font-bold flex items-center gap-2 animate-shake">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* The 3 Evaluation Questions */}
            <div className="space-y-3">
              {/* Question 1: Food Quality */}
              <div className="p-3.5 rounded-2xl bg-orange-50/50 dark:bg-slate-800/60 border border-orange-100 dark:border-slate-700 space-y-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-orange-500 text-white flex items-center justify-center shadow-sm shrink-0">
                    <Utensils className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-black text-brand-text dark:text-slate-100">
                      1) Quality of Food Given by Donor
                    </h4>
                    <p className="text-[10px] sm:text-[11px] font-medium text-brand-muted dark:text-slate-400">
                      Freshness, taste, hygiene, temperature & safe condition.
                    </p>
                  </div>
                </div>
                <div className="pt-0.5">
                  {renderStarSelector(foodQuality, hoverQuality, setFoodQuality, setHoverQuality, 'text-amber-400')}
                </div>
              </div>

              {/* Question 2: Delivery Experience */}
              <div className="p-3.5 rounded-2xl bg-blue-50/50 dark:bg-slate-800/60 border border-blue-100 dark:border-slate-700 space-y-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-blue-500 text-white flex items-center justify-center shadow-sm shrink-0">
                    <Truck className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-black text-brand-text dark:text-slate-100">
                      2) Delivery & Pickup Experience
                    </h4>
                    <p className="text-[10px] sm:text-[11px] font-medium text-brand-muted dark:text-slate-400">
                      Punctuality, packaging quality & coordination.
                    </p>
                  </div>
                </div>
                <div className="pt-0.5">
                  {renderStarSelector(deliveryExperience, hoverDelivery, setDeliveryExperience, setHoverDelivery, 'text-blue-500')}
                </div>
              </div>

              {/* Question 3: Quantity Accuracy */}
              <div className="p-3.5 rounded-2xl bg-emerald-50/50 dark:bg-slate-800/60 border border-emerald-100 dark:border-slate-700 space-y-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-emerald-500 text-white flex items-center justify-center shadow-sm shrink-0">
                    <Scale className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-black text-brand-text dark:text-slate-100">
                      3) Quantity Accuracy (Promised vs Received)
                    </h4>
                    <p className="text-[10px] sm:text-[11px] font-medium text-brand-muted dark:text-slate-400">
                      Did donor provide full quantity promised ({booking.mealCount} meals)?
                    </p>
                  </div>
                </div>
                <div className="pt-0.5">
                  {renderStarSelector(quantityAccuracy, hoverQuantity, setQuantityAccuracy, setHoverQuantity, 'text-emerald-500')}
                </div>
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
                className="w-full px-3.5 py-2 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-medium focus:outline-none focus:border-brand-orange focus:bg-white dark:focus:bg-slate-800 transition-colors"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100 dark:border-slate-800 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 text-xs font-bold text-brand-muted hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-xs sm:text-sm rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 active:scale-95 cursor-pointer disabled:opacity-50"
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
