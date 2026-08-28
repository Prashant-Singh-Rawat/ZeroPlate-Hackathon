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
  const distanceKm = calculateHaversineDistance(
    donorCoords.lat,
    donorCoords.lng,
    ngoCoords.lat,
    ngoCoords.lng
  );
  const distanceScore = calculateDistanceScore(donorCoords, ngoCoords);
  const mealScore = calculateMealCompatibility(mealsOffered, ngoCapacity);
  const urgencyScore = calculateUrgencyScore(pickupDeadline, currentTime);

  const baseScore = calculateMatchScore(distanceScore, mealScore, urgencyScore);
  const finalScore = applyPremiumPriority(baseScore, isPremium);
  const bonus = isPremium ? PREMIUM_BONUS : 0;

  const deadlineMs = new Date(pickupDeadline).getTime();
  const currentMs = new Date(currentTime).getTime();
  const hoursLeft = Math.max(0, (deadlineMs - currentMs) / (1000 * 60 * 60));

  const explanation = generateMatchExplanation(
    distanceKm,
    mealsOffered,
    ngoCapacity,
    hoursLeft,
    isPremium,
    finalScore,
    ngoName
  );

  return {
    matchScore: finalScore,
    distanceScore,
    mealScore,
    urgencyScore,
    premiumBonus: bonus,
    distanceKm,
    explanation,
  };
}
