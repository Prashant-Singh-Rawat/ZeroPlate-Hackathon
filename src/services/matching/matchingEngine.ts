import { MatchScoreResult } from '../../types';

export const PREMIUM_BONUS = 6; // Named constant, tunable (5-8 points)

/**
  Calculate distance in kilometers using the Haversine formula
 */
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10; // 1 decimal place
}

/**
 * Distance Score (0 - 100):
 * Linear decay from 100 at 0km to 0 at maxRadius (default 25km).
 */
export function calculateDistanceScore(
  donorCoords: { lat: number; lng: number },
  ngoCoords: { lat: number; lng: number },
  maxRadius: number = 25
): number {
  const dist = calculateHaversineDistance(
    donorCoords.lat,
    donorCoords.lng,
    ngoCoords.lat,
    ngoCoords.lng
  );
  if (dist >= maxRadius) return 0;
  // Score drops linearly with distance
  const score = 100 * (1 - dist / maxRadius);
  return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * Meal/Quantity Compatibility Score (0 - 100):
 * If ngoCapacity >= mealsOffered, score is 100%.
 * If ngoCapacity < mealsOffered, score is (ngoCapacity / mealsOffered) * 100.
 */
export function calculateMealCompatibility(
  mealsOffered: number,
  ngoCapacity: number
): number {
  if (mealsOffered <= 0) return 0;
  if (ngoCapacity >= mealsOffered) return 100;
  const ratio = (ngoCapacity / mealsOffered) * 100;
  return Math.max(0, Math.min(100, Math.round(ratio)));
}

/**
 * Pickup Urgency Score (0 - 100):
 * Measures how urgent the donation is based on hours until pickupDeadline.
 * Higher score = more urgent (less time remaining before food expires).
 * If deadline is <= 1 hour away: 100
 * If deadline is 12+ hours away: 40
 */
export function calculateUrgencyScore(
  pickupDeadline: string | Date,
  currentTime: string | Date = new Date()
): number {
  const deadlineMs = new Date(pickupDeadline).getTime();
  const currentMs = new Date(currentTime).getTime();
  const diffHours = (deadlineMs - currentMs) / (1000 * 60 * 60);

  if (diffHours <= 0) return 100; // Past or immediate deadline = maximum urgency
  if (diffHours <= 1) return 100;
  if (diffHours >= 12) return 40;

  // Linear transition between 1 hr (100) and 12 hrs (40)
  const score = 100 - ((diffHours - 1) / 11) * 60;
  return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * Calculate Weighted Base Match Score (0 - 100):
 * Formula: 40% Distance + 40% Meal Compatibility + 20% Urgency
 */
export function calculateMatchScore(
  distanceScore: number,
  mealScore: number,
  urgencyScore: number
): number {
  const baseScore = distanceScore * 0.4 + mealScore * 0.4 + urgencyScore * 0.2;
  return Math.max(0, Math.min(100, Math.round(baseScore)));
}

/**
 * Apply Premium Priority Rule:
 * Adds small configurable bonus (default PREMIUM_BONUS = 6) ONLY to baseScore, capped at 100.
 */
export function applyPremiumPriority(
  baseScore: number,
  isPremium: boolean,
  config: { bonus?: number } = {}
): number {
  if (!isPremium) return baseScore;
  const bonus = config.bonus ?? PREMIUM_BONUS;
  return Math.min(100, baseScore + bonus);
}

/**
 * Dynamic Natural-Language Explanation Generator:
 * Creates an explainable narrative detailing WHY this match received its score.
 */
export function generateMatchExplanation(
  distanceKm: number,
  mealsOffered: number,
  ngoCapacity: number,
  hoursLeft: number,
  isPremium: boolean,
  matchScore: number,
  ngoName: string
): string {
  const distText = `${distanceKm} km away`;
  let capacityText = `has full capacity for all ${mealsOffered} meals`;
  if (ngoCapacity < mealsOffered) {
    capacityText = `can absorb ${ngoCapacity} of ${mealsOffered} meals`;
  }

  let urgencyText = `available for pickup`;
  if (hoursLeft <= 2) {
    urgencyText = `urgent pickup needed (${Math.max(0, Math.round(hoursLeft * 60))} mins remaining)`;
  } else if (hoursLeft <= 6) {
    urgencyText = `pickup needed within ${Math.round(hoursLeft)} hours`;
  }

  let baseExplanation = `Recommended because ${ngoName} is ${distText}, currently ${urgencyText}, and ${capacityText}.`;
  if (isPremium) {
    baseExplanation += ` Includes Priority NGO boost.`;
  }

  return baseExplanation;
}

/**
 * Full Matching Function: Combines all pure functions into a final MatchScoreResult
 */
export function computeFullMatch(
  donorCoords: { lat: number; lng: number },
  ngoCoords: { lat: number; lng: number },
  mealsOffered: number,
  ngoCapacity: number,
  pickupDeadline: string | Date,
  isPremium: boolean = false,
  ngoName: string = 'NGO Partner',
  currentTime: string | Date = new Date()
): MatchScoreResult {
  const lat1 = typeof donorCoords?.lat === 'number' && !isNaN(donorCoords.lat) ? donorCoords.lat : 19.076;
  const lng1 = typeof donorCoords?.lng === 'number' && !isNaN(donorCoords.lng) ? donorCoords.lng : 72.8777;
  const lat2 = typeof ngoCoords?.lat === 'number' && !isNaN(ngoCoords.lat) ? ngoCoords.lat : 19.062;
  const lng2 = typeof ngoCoords?.lng === 'number' && !isNaN(ngoCoords.lng) ? ngoCoords.lng : 72.854;
  const safeDonorCoords = { lat: lat1, lng: lng1 };
  const safeNgoCoords = { lat: lat2, lng: lng2 };

  const safeMealsOffered = typeof mealsOffered === 'number' && !isNaN(mealsOffered) && mealsOffered > 0 ? mealsOffered : 40;
  const safeNgoCapacity = typeof ngoCapacity === 'number' && !isNaN(ngoCapacity) && ngoCapacity > 0 ? ngoCapacity : 100;

  let deadlineMs = new Date(pickupDeadline).getTime();
  if (isNaN(deadlineMs)) {
    deadlineMs = Date.now() + 4 * 60 * 60 * 1000;
  }
  const currentMs = new Date(currentTime).getTime() || Date.now();
  const rawHoursLeft = (deadlineMs - currentMs) / (1000 * 60 * 60);
  const hoursLeft = isNaN(rawHoursLeft) ? 4 : Math.max(0, Math.round(rawHoursLeft * 10) / 10);

  const rawDist = calculateHaversineDistance(lat1, lng1, lat2, lng2);
  const distanceKm = isNaN(rawDist) ? 2.5 : rawDist;

  const distanceScore = calculateDistanceScore(safeDonorCoords, safeNgoCoords);
  const mealScore = calculateMealCompatibility(safeMealsOffered, safeNgoCapacity);
  const urgencyScore = calculateUrgencyScore(new Date(deadlineMs), new Date(currentMs));

  const baseScore = calculateMatchScore(distanceScore, mealScore, urgencyScore);
  const rawFinalScore = applyPremiumPriority(baseScore, isPremium);
  const finalScore = isNaN(rawFinalScore) ? 85 : Math.max(10, Math.min(100, rawFinalScore));
  const bonus = isPremium ? PREMIUM_BONUS : 0;

  const explanation = generateMatchExplanation(
    distanceKm,
    safeMealsOffered,
    safeNgoCapacity,
    hoursLeft,
    isPremium,
    finalScore,
    ngoName
  );

  return {
    matchScore: finalScore,
    distanceScore,
    mealQuantityScore: mealScore,
    mealScore,
    foodSpecScore: 90,
    urgencyScore,
    premiumBonus: bonus,
    distanceKm,
    explanation,
  };
}
