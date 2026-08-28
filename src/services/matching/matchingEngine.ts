import { MatchScoreResult } from '../../types';

export const PREMIUM_BONUS = 6; // Named constant, tunable (5-8 points)

/**
 * Calculate distance in kilometers using the Haversine formula
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
  const score = 100 * (1 - dist / maxRadius);
  return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * Meal Quantity Compatibility (0 - 100):
 * If donatedMeals >= requiredMeals: 100%
 * If donatedMeals < requiredMeals: (donatedMeals / requiredMeals) * 100%
 */
export function calculateMealQuantityCompatibility(
  donatedMeals: number,
  requiredMeals: number
): number {
  if (requiredMeals <= 0 || donatedMeals <= 0) return 0;
  if (donatedMeals >= requiredMeals) return 100;
  const ratio = (donatedMeals / requiredMeals) * 100;
  return Math.max(0, Math.min(100, Math.round(ratio)));
}

/**
 * Food Specification Compatibility (0 - 100):
 * Compares donated food components (e.g. ['Rice', 'Dal']) against NGO requested specs.
 */
export function calculateFoodSpecificationCompatibility(
  donatedSpecs: string[] = [],
  requestedSpecs: string[] = []
): number {
  if (!requestedSpecs || requestedSpecs.length === 0) return 100; // Open requirement
  if (!donatedSpecs || donatedSpecs.length === 0) return 60; // Generic fallback

  // Normalize tokens
  const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
  const normDonated = donatedSpecs.map(norm);
  const normRequested = requestedSpecs.map(norm);

  let matches = 0;
  for (const req of normRequested) {
    const isDirectMatch = normDonated.some((d) => d.includes(req) || req.includes(d));
    if (isDirectMatch) {
      matches += 1;
    }
  }

  const score = (matches / normRequested.length) * 100;
  return Math.max(20, Math.min(100, Math.round(score)));
}

/**
 * Pickup Urgency Score (0 - 100):
 * Measures how urgent the donation is based on hours until pickupDeadline.
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

  if (diffHours <= 0) return 100;
  if (diffHours <= 1) return 100;
  if (diffHours >= 12) return 40;

  const score = 100 - ((diffHours - 1) / 11) * 60;
  return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * Calculate Weighted Base Match Score (0 - 100):
 * Formula: 40% Distance + 40% Meal Compatibility (20% Quantity + 20% Spec) + 20% Urgency
 */
export function calculateMatchScore(
  distanceScore: number,
  mealQuantityScore: number,
  foodSpecScore: number,
  urgencyScore: number
): number {
  const mealCompBlended = mealQuantityScore * 0.5 + foodSpecScore * 0.5;
  const baseScore = distanceScore * 0.4 + mealCompBlended * 0.4 + urgencyScore * 0.2;
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
 * Dynamic Natural-Language Explanation Generator (§9)
 */
export function generateMatchExplanation(
  distanceKm: number,
  distanceScore: number,
  mealQuantityScore: number,
  foodSpecScore: number,
  urgencyScore: number,
  finalScore: number,
  donatedMeals: number,
  requiredMeals: number,
  donatedSpecs: string[],
  requestedSpecs: string[],
  isPremium: boolean,
  ngoName: string
): string {
  let specText = 'matches your food requirements';
  if (foodSpecScore >= 90) {
    specText = 'closely matches your requested food components';
  } else if (foodSpecScore < 60) {
    specText = 'provides partial components for your requested menu';
  }

  let qtyText = `provides the full ${requiredMeals} meals needed`;
  if (donatedMeals < requiredMeals) {
    qtyText = `provides ${donatedMeals} of your ${requiredMeals} requested meals`;
  }

  let narrative = `${finalScore}% MATCH — Distance ${distanceScore}% · Meal Compatibility ${mealQuantityScore}% · Food Specification ${foodSpecScore}% · Urgency ${urgencyScore}% — "Strong match because the donation is ${distanceKm} km away, ${qtyText}, and ${specText}."`;

  if (isPremium) {
    narrative += ` [Includes Priority NGO Boost]`;
  }

  return narrative;
}

/**
 * Full Matching Function: Combines all pure functions into a final MatchScoreResult
 */
export function computeFullMatch(
  donorCoords: { lat: number; lng: number },
  ngoCoords: { lat: number; lng: number },
  donatedMeals: number,
  requiredMeals: number,
  pickupDeadline: string | Date,
  donatedSpecs: string[] = ['Cooked Food'],
  requestedSpecs: string[] = ['Cooked Food'],
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
  const mealQuantityScore = calculateMealQuantityCompatibility(donatedMeals, requiredMeals);
  const foodSpecScore = calculateFoodSpecificationCompatibility(donatedSpecs, requestedSpecs);
  const urgencyScore = calculateUrgencyScore(pickupDeadline, currentTime);

  const baseScore = calculateMatchScore(
    distanceScore,
    mealQuantityScore,
    foodSpecScore,
    urgencyScore
  );
  const finalScore = applyPremiumPriority(baseScore, isPremium);
  const bonus = isPremium ? PREMIUM_BONUS : 0;

  const explanation = generateMatchExplanation(
    distanceKm,
    distanceScore,
    mealQuantityScore,
    foodSpecScore,
    urgencyScore,
    finalScore,
    donatedMeals,
    requiredMeals,
    donatedSpecs,
    requestedSpecs,
    isPremium,
    ngoName
  );

  return {
    matchScore: finalScore,
    distanceScore,
    mealQuantityScore,
    foodSpecScore,
    urgencyScore,
    premiumBonus: bonus,
    distanceKm,
    explanation,
  };
}
