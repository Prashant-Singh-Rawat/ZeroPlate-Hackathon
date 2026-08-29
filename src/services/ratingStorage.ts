import { DonorRatingFeedback, DonorRatingSummary } from '../types';

const STORAGE_KEY = 'zeroplate_donor_ratings_v2';

// Baseline initial donor ratings so every donor begins with verified historical reputation
const DEFAULT_SUMMARIES: Record<string, DonorRatingSummary> = {
  donor_spicevilla: {
    donorId: 'donor_spicevilla',
    averageRating: 4.8,
    totalReviews: 6,
    qualityAverage: 4.9,
    deliveryAverage: 4.7,
    quantityAverage: 4.8,
    ratings: [
      {
        id: 'rate_init_1',
        bookingId: 'book_init_1',
        donorId: 'donor_spicevilla',
        donorName: 'SpiceVilla Restaurant',
        ngoId: 'ngo_hope',
        ngoName: 'Hope Foundation',
        foodName: 'Dal Makhani & Basmati Rice',
        foodQualityScore: 5,
        deliveryScore: 5,
        quantityAccuracyScore: 5,
        overallScore: 5.0,
        feedbackNotes: 'Exemplary food quality, steaming hot and exact 40 meals provided.',
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      },
      {
        id: 'rate_init_2',
        bookingId: 'book_init_2',
        donorId: 'donor_spicevilla',
        donorName: 'SpiceVilla Restaurant',
        ngoId: 'ngo_robinhood',
        ngoName: 'Robin Hood Army',
        foodName: 'Paneer Butter Masala & Rotis',
        foodQualityScore: 5,
        deliveryScore: 4,
        quantityAccuracyScore: 5,
        overallScore: 4.7,
        feedbackNotes: 'Accurate portions, great packaging.',
        createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
      },
    ],
  },
};

export function getAllDonorRatings(): Record<string, DonorRatingSummary> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      saveAllDonorRatings(DEFAULT_SUMMARIES);
      return DEFAULT_SUMMARIES;
    }
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_SUMMARIES, ...parsed };
  } catch (e) {
    return DEFAULT_SUMMARIES;
  }
}

export function saveAllDonorRatings(data: Record<string, DonorRatingSummary>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save donor ratings to local storage', e);
  }
}

export function getDonorRatingSummary(donorIdOrEmail?: string): DonorRatingSummary {
  if (!donorIdOrEmail) {
    return {
      donorId: 'unknown',
      averageRating: 4.8,
      totalReviews: 1,
      qualityAverage: 4.8,
      deliveryAverage: 4.8,
      quantityAverage: 4.8,
      ratings: [],
    };
  }

  const all = getAllDonorRatings();
  const normalizedKey = donorIdOrEmail.toLowerCase();

  // Look for exact key or email match
  for (const [key, summary] of Object.entries(all)) {
    if (key.toLowerCase() === normalizedKey || summary.donorId.toLowerCase() === normalizedKey) {
      return summary;
    }
  }

  // If newly created donor without ratings, return baseline 5.0 with 0 reviews
  return {
    donorId: donorIdOrEmail,
    averageRating: 5.0,
    totalReviews: 0,
    qualityAverage: 5.0,
    deliveryAverage: 5.0,
    quantityAverage: 5.0,
    ratings: [],
  };
}

export function getRatingForBooking(bookingId: string): DonorRatingFeedback | null {
  const all = getAllDonorRatings();
  for (const summary of Object.values(all)) {
    const found = summary.ratings.find((r) => r.bookingId === bookingId);
    if (found) return found;
  }
  return null;
}

export function submitDonorRating(input: {
  bookingId: string;
  donorId: string;
  donorName: string;
  ngoId: string;
  ngoName: string;
  foodName: string;
  foodQualityScore: number;
  deliveryScore: number;
  quantityAccuracyScore: number;
  feedbackNotes?: string;
}): { feedback: DonorRatingFeedback; summary: DonorRatingSummary } {
  const all = getAllDonorRatings();
  const donorKey = input.donorId.toLowerCase();

  const currentSummary: DonorRatingSummary = all[donorKey] || {
    donorId: input.donorId,
    averageRating: 0,
    totalReviews: 0,
    qualityAverage: 0,
    deliveryAverage: 0,
    quantityAverage: 0,
    ratings: [],
  };

  // Compute this single booking's overall score: (Q1 + Q2 + Q3) / 3
  const qScore = Math.max(1, Math.min(5, Number(input.foodQualityScore) || 5));
  const dScore = Math.max(1, Math.min(5, Number(input.deliveryScore) || 5));
  const qtyScore = Math.max(1, Math.min(5, Number(input.quantityAccuracyScore) || 5));
  const calculatedOverall = Number(((qScore + dScore + qtyScore) / 3).toFixed(1));

  const newFeedback: DonorRatingFeedback = {
    id: 'rate_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
    bookingId: input.bookingId,
    donorId: input.donorId,
    donorName: input.donorName,
    ngoId: input.ngoId,
    ngoName: input.ngoName,
    foodName: input.foodName,
    foodQualityScore: qScore,
    deliveryScore: dScore,
    quantityAccuracyScore: qtyScore,
    overallScore: calculatedOverall,
    feedbackNotes: input.feedbackNotes?.trim() || '',
    createdAt: new Date().toISOString(),
  };

  // Check if booking was already rated, replace if exists
  const existingIndex = currentSummary.ratings.findIndex((r) => r.bookingId === input.bookingId);
  let updatedRatings: DonorRatingFeedback[];

  if (existingIndex >= 0) {
    updatedRatings = [...currentSummary.ratings];
    updatedRatings[existingIndex] = newFeedback;
  } else {
    updatedRatings = [newFeedback, ...currentSummary.ratings];
  }

  // Cumulative recalculations across all reviews for this donor
  const totalCount = updatedRatings.length;
  const sumOverall = updatedRatings.reduce((sum, r) => sum + r.overallScore, 0);
  const sumQuality = updatedRatings.reduce((sum, r) => sum + r.foodQualityScore, 0);
  const sumDelivery = updatedRatings.reduce((sum, r) => sum + r.deliveryScore, 0);
  const sumQuantity = updatedRatings.reduce((sum, r) => sum + r.quantityAccuracyScore, 0);

  const updatedSummary: DonorRatingSummary = {
    donorId: input.donorId,
    averageRating: Number((sumOverall / totalCount).toFixed(1)),
    totalReviews: totalCount,
    qualityAverage: Number((sumQuality / totalCount).toFixed(1)),
    deliveryAverage: Number((sumDelivery / totalCount).toFixed(1)),
    quantityAverage: Number((sumQuantity / totalCount).toFixed(1)),
    ratings: updatedRatings,
  };

  all[donorKey] = updatedSummary;
  saveAllDonorRatings(all);

  return { feedback: newFeedback, summary: updatedSummary };
}
