import React, { useState } from 'react';
import { Star, X, CheckCircle2, Utensils, Truck, Scale, Sparkles, MessageSquare } from 'lucide-react';
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

  const [foodQuality, setFoodQuality] = useState<number>(existing?.foodQualityScore || 5);
  const [deliveryExperience, setDeliveryExperience] = useState<number>(existing?.deliveryScore || 5);
  const [quantityAccuracy, setQuantityAccuracy] = useState<number>(existing?.quantityAccuracyScore || 5);
  const [feedbackNotes, setFeedbackNotes] = useState<string>(existing?.feedbackNotes || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  // Auto-calculated overall score: (Q1 + Q2 + Q3) / 3
  const overallScore = Number(((foodQuality + deliveryExperience + quantityAccuracy) / 3).toFixed(1));

  const getStarLabel = (rating: number) => {
    switch (rating) {
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
    colorClass: string
  ) => {
    return (
      <div className="flex items-center gap-1.5 sm:gap-2">
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = star <= value;
          return (
            <button
              key={star}
              type="button"
              onClick={() => onChange(star)}
              className="p-1 sm:p-1.5 rounded-xl hover:bg-orange-50 dark:hover:bg-slate-700/60 transition-transform active:scale-90 cursor-pointer focus:outline-none"
              title={`${star} Star`}
            >
              <Star
                className={`w-6 h-6 sm:w-7 sm:h-7 transition-colors ${
                  isFilled
                    ? `${colorClass} fill-current drop-shadow-sm`
                    : 'text-gray-300 dark:text-slate-600'
                }`}
              />
            </button>
          );
        })}
        <span className="ml-2 text-xs sm:text-sm font-extrabold text-brand-text dark:text-slate-200">
          {getStarLabel(value)}
        </span>
      </div>
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
      <div className="bg-white dark:bg-[#1E293B] rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-amber-900/10 dark:border-slate-700 space-y-6 my-8 transition-colors">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-gray-100 dark:border-slate-800">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 rounded-full text-xs font-black uppercase tracking-wider mb-2 border border-amber-200 dark:border-amber-800">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Donor Review & Impact Verification</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-brand-text dark:text-slate-100">
              Rate Food Donor Experience
            </h2>
            <p className="text-xs sm:text-sm text-brand-muted dark:text-slate-400 mt-1">
              Food: <strong className="text-brand-text dark:text-slate-200">{booking.foodName}</strong> ({booking.mealCount} meals) from{' '}
              <strong className="text-brand-orange">{booking.donorName}</strong>
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 3 Questions Rating Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Question 1: Food Quality */}
          <div className="p-4 sm:p-5 rounded-2xl bg-orange-50/50 dark:bg-slate-800/60 border border-orange-100 dark:border-slate-700 space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-orange-500 text-white flex items-center justify-center shadow-sm">
                <Utensils className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-black text-brand-text dark:text-slate-100">
                  1) Food Quality & Freshness
                </h3>
                <p className="text-[11px] font-medium text-brand-muted dark:text-slate-400">
                  Taste, freshness, hygiene, safe temperature & edible condition of the food.
                </p>
              </div>
            </div>
            <div className="pt-2">
              {renderStarSelector(foodQuality, setFoodQuality, 'text-amber-400')}
            </div>
          </div>

          {/* Question 2: Delivery Experience */}
          <div className="p-4 sm:p-5 rounded-2xl bg-blue-50/50 dark:bg-slate-800/60 border border-blue-100 dark:border-slate-700 space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-blue-500 text-white flex items-center justify-center shadow-sm">
                <Truck className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-black text-brand-text dark:text-slate-100">
                  2) Delivery & Pickup Experience
                </h3>
                <p className="text-[11px] font-medium text-brand-muted dark:text-slate-400">
                  Punctuality, packaging quality, pickup coordination & professional handover.
                </p>
              </div>
            </div>
            <div className="pt-2">
              {renderStarSelector(deliveryExperience, setDeliveryExperience, 'text-blue-500')}
            </div>
          </div>

          {/* Question 3: Quantity Accuracy */}
          <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/50 dark:bg-slate-800/60 border border-emerald-100 dark:border-slate-700 space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-sm">
                <Scale className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-black text-brand-text dark:text-slate-100">
                  3) Quantity Accuracy (Promised vs Received)
                </h3>
                <p className="text-[11px] font-medium text-brand-muted dark:text-slate-400">
                  Did the donor provide the full quantity promised (e.g. full weight/meal count)?
                </p>
              </div>
            </div>
            <div className="pt-2">
              {renderStarSelector(quantityAccuracy, setQuantityAccuracy, 'text-emerald-500')}
            </div>
          </div>

          {/* Live Dynamic Calculated Overall Rating Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-brand-deep text-white shadow-md flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[11px] uppercase font-black tracking-wider text-amber-200">
                Auto-Calculated Overall Rating
              </span>
              <p className="text-xs font-semibold text-orange-100">
                Aggregated from the 3 evaluation factors
              </p>
            </div>
            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/30 shadow-inner">
              <Star className="w-5 h-5 text-amber-300 fill-amber-300" />
              <span className="text-xl font-black">{overallScore}</span>
              <span className="text-xs font-bold text-orange-100">/ 5.0</span>
            </div>
          </div>

          {/* Feedback Notes */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-brand-text dark:text-slate-300">
              Optional Feedback & Commendation
            </label>
            <textarea
              value={feedbackNotes}
              onChange={(e) => setFeedbackNotes(e.target.value)}
              placeholder="e.g. Excellent packaging, hot food, and very polite coordination!"
              rows={3}
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm font-medium focus:outline-none focus:border-brand-orange focus:bg-white dark:focus:bg-slate-800 transition-colors"
            />
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 text-xs font-bold text-brand-muted hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 bg-brand-orange hover:bg-brand-deep text-white font-black text-xs sm:text-sm rounded-xl shadow-warm-sm hover:shadow-warm-md transition-all flex items-center gap-2 active:scale-95 cursor-pointer disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Submit Evaluation & Update Donor Rating</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
