import React, { useState } from 'react';
import { Star, X, CheckCircle2, Utensils, Truck, Scale, Sparkles, AlertCircle } from 'lucide-react';
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

  // Initial zero stars (0) so user chooses actively
  const [foodQuality, setFoodQuality] = useState<number>(existing?.foodQualityScore || 0);
  const [deliveryExperience, setDeliveryExperience] = useState<number>(existing?.deliveryScore || 0);
  const [quantityAccuracy, setQuantityAccuracy] = useState<number>(existing?.quantityAccuracyScore || 0);
  const [feedbackNotes, setFeedbackNotes] = useState<string>(existing?.feedbackNotes || '');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  // Auto-calculated overall score: (Q1 + Q2 + Q3) / 3
  const isAnyRated = foodQuality > 0 || deliveryExperience > 0 || quantityAccuracy > 0;
  const isAllRated = foodQuality > 0 && deliveryExperience > 0 && quantityAccuracy > 0;

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
        return 'Tap stars to rate';
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
    onChange: (val: number) => void,
    colorClass: string,
    unratedNotice?: boolean
  ) => {
    return (
      <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => {
            const isFilled = value > 0 && star <= value;
            return (
              <button
                key={star}
                type="button"
                onClick={() => {
                  setErrorMessage('');
                  onChange(star);
                }}
                className="p-1 rounded-xl hover:bg-orange-100/60 dark:hover:bg-slate-700/60 transition-transform active:scale-90 cursor-pointer focus:outline-none"
                title={`Rate ${star} Star${star > 1 ? 's' : ''}`}
              >
                <Star
                  className={`w-6 h-6 sm:w-7 sm:h-7 transition-colors ${
                    isFilled
                      ? `${colorClass} fill-current drop-shadow-sm`
                      : 'text-gray-300 dark:text-slate-600 hover:text-amber-400'
                  }`}
                />
              </button>
            );
          })}
        </div>
        <span
          className={`ml-1 text-xs font-black transition-colors ${
            value > 0
              ? 'text-brand-text dark:text-slate-100'
              : unratedNotice
              ? 'text-red-500 font-bold animate-pulse'
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
      setErrorMessage('Please select a star rating (1–5) for all 3 evaluation questions.');
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
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
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

  return (
    <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-white dark:bg-[#1E293B] rounded-3xl max-w-lg sm:max-w-xl w-full max-h-[90vh] shadow-2xl border border-amber-900/10 dark:border-slate-700 flex flex-col my-auto overflow-hidden transition-all">
        
        {/* Header */}
        <div className="p-5 sm:p-6 pb-3 border-b border-gray-100 dark:border-slate-800 shrink-0 flex items-start justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 rounded-full text-[11px] font-black uppercase tracking-wider mb-1.5 border border-amber-200 dark:border-amber-800">
              <Sparkles className="w-3 h-3" />
              <span>Donor Review & Impact Verification</span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-brand-text dark:text-slate-100">
              Rate Food Donor Experience
            </h2>
            <p className="text-xs text-brand-muted dark:text-slate-400 mt-0.5">
              Food: <strong className="text-brand-text dark:text-slate-200">{booking.foodName}</strong> ({booking.mealCount} meals) from{' '}
              <strong className="text-brand-orange">{booking.donorName}</strong>
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

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-5 sm:p-6 space-y-4 flex-1">
          {/* Error notice if user tried submitting with 0 stars */}
          {errorMessage && (
            <div className="p-3 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800 rounded-xl text-xs font-bold flex items-center gap-2 animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Question 1: Food Quality */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-orange-50/50 dark:bg-slate-800/60 border border-orange-100 dark:border-slate-700 space-y-1.5">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-orange-500 text-white flex items-center justify-center shadow-sm shrink-0">
                <Utensils className="w-3.5 h-3.5" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-black text-brand-text dark:text-slate-100">
                  1) Food Quality & Freshness
                </h3>
                <p className="text-[11px] font-medium text-brand-muted dark:text-slate-400">
                  Taste, freshness, hygiene, safe temperature & edible condition.
                </p>
              </div>
            </div>
            <div className="pt-1">
              {renderStarSelector(foodQuality, setFoodQuality, 'text-amber-400', !!errorMessage && foodQuality === 0)}
            </div>
          </div>

          {/* Question 2: Delivery Experience */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-blue-50/50 dark:bg-slate-800/60 border border-blue-100 dark:border-slate-700 space-y-1.5">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-blue-500 text-white flex items-center justify-center shadow-sm shrink-0">
                <Truck className="w-3.5 h-3.5" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-black text-brand-text dark:text-slate-100">
                  2) Delivery & Pickup Experience
                </h3>
                <p className="text-[11px] font-medium text-brand-muted dark:text-slate-400">
                  Punctuality, packaging quality & professional handover.
                </p>
              </div>
            </div>
            <div className="pt-1">
              {renderStarSelector(deliveryExperience, setDeliveryExperience, 'text-blue-500', !!errorMessage && deliveryExperience === 0)}
            </div>
          </div>

          {/* Question 3: Quantity Accuracy */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-emerald-50/50 dark:bg-slate-800/60 border border-emerald-100 dark:border-slate-700 space-y-1.5">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-emerald-500 text-white flex items-center justify-center shadow-sm shrink-0">
                <Scale className="w-3.5 h-3.5" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-black text-brand-text dark:text-slate-100">
                  3) Quantity Accuracy (Promised vs Received)
                </h3>
                <p className="text-[11px] font-medium text-brand-muted dark:text-slate-400">
                  Did donor provide the full promised quantity ({booking.mealCount} meals)?
                </p>
              </div>
            </div>
            <div className="pt-1">
              {renderStarSelector(quantityAccuracy, setQuantityAccuracy, 'text-emerald-500', !!errorMessage && quantityAccuracy === 0)}
            </div>
          </div>

          {/* Live Dynamic Calculated Overall Rating Card */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-brand-deep text-white shadow-md flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[10px] uppercase font-black tracking-wider text-amber-200">
                Auto-Calculated Overall Rating
              </span>
              <p className="text-[11px] font-semibold text-orange-100">
                {isAllRated ? 'Average of the 3 evaluation questions' : 'Select all 3 star ratings above'}
              </p>
            </div>
            <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/30 shadow-inner shrink-0">
              <Star className="w-4 h-4 text-amber-300 fill-amber-300" />
              <span className="text-lg font-black">{isAnyRated ? overallScore : '—'}</span>
              <span className="text-xs font-bold text-orange-100">/ 5.0</span>
            </div>
          </div>

          {/* Feedback Notes */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-brand-text dark:text-slate-300">
              Optional Feedback & Notes
            </label>
            <textarea
              value={feedbackNotes}
              onChange={(e) => setFeedbackNotes(e.target.value)}
              placeholder="e.g. Excellent packaging, hot food, and very polite coordination!"
              rows={2}
              className="w-full px-3.5 py-2 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-medium focus:outline-none focus:border-brand-orange focus:bg-white dark:focus:bg-slate-800 transition-colors"
            />
          </div>

          {/* Footer Submit Button */}
          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 text-xs font-bold text-brand-muted hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-brand-orange hover:bg-brand-deep text-white font-black text-xs sm:text-sm rounded-xl shadow-warm-sm hover:shadow-warm-md transition-all flex items-center gap-2 active:scale-95 cursor-pointer disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Submit Evaluation</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
