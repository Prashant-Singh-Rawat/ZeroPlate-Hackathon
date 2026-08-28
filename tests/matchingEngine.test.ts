import { describe, it, expect } from 'vitest';
import {
  calculateHaversineDistance,
  calculateDistanceScore,
  calculateMealQuantityCompatibility,
  calculateFoodSpecificationCompatibility,
  calculateUrgencyScore,
  calculateMatchScore,
  applyPremiumPriority,
  computeFullMatch,
} from '../src/services/matching/matchingEngine';

describe('Smart Matching Engine & Food Specification Tests', () => {
  it('calculates Haversine distance correctly with symmetric properties', () => {
    const lat1 = 19.076, lon1 = 72.8777; // Mumbai Donor
    const lat2 = 19.062, lon2 = 72.854;  // Mumbai NGO
    const d1 = calculateHaversineDistance(lat1, lon1, lat2, lon2);
    const d2 = calculateHaversineDistance(lat2, lon2, lat1, lon1);
    expect(d1).toBe(d2);
    expect(d1).toBeGreaterThan(0);
    expect(d1).toBeLessThan(10);
  });

  it('calculates distance score with linear decay', () => {
    const donor = { lat: 19.076, lng: 72.8777 };
    const exactSame = { lat: 19.076, lng: 72.8777 };
    expect(calculateDistanceScore(donor, exactSame, 25)).toBe(100);

    const farAway = { lat: 20.0, lng: 74.0 };
    expect(calculateDistanceScore(donor, farAway, 25)).toBe(0);
  });

  it('calculates meal quantity compatibility', () => {
    expect(calculateMealQuantityCompatibility(80, 80)).toBe(100);
    expect(calculateMealQuantityCompatibility(100, 80)).toBe(100);
    expect(calculateMealQuantityCompatibility(40, 80)).toBe(50);
  });

  it('calculates food specification compatibility', () => {
    // Exact spec match
    const exact = calculateFoodSpecificationCompatibility(
      ['Rice', 'Dal', 'Biryani'],
      ['Rice', 'Dal']
    );
    expect(exact).toBe(100);

    // Partial match
    const partial = calculateFoodSpecificationCompatibility(
      ['Rice'],
      ['Rice', 'Dal', 'Paneer']
    );
    expect(partial).toBeLessThan(60);
    expect(partial).toBeGreaterThanOrEqual(20);
  });

  it('calculates urgency time decay curve', () => {
    const now = new Date();
    const in30Mins = new Date(now.getTime() + 30 * 60 * 1000);
    const in12Hours = new Date(now.getTime() + 12 * 60 * 60 * 1000);

    expect(calculateUrgencyScore(in30Mins, now)).toBe(100);
    expect(calculateUrgencyScore(in12Hours, now)).toBe(40);
  });

  it('computes weighted composite match score', () => {
    // 40% Distance (100) + 40% MealComp (100) + 20% Urgency (100) = 100
    expect(calculateMatchScore(100, 100, 100, 100)).toBe(100);
    // 40% Distance (50) + 40% MealComp (50) + 20% Urgency (50) = 50
    expect(calculateMatchScore(50, 50, 50, 50)).toBe(50);
  });

  it('enforces Premium Fairness Rule Example A: Bonus flips close ranks', () => {
    // Free base 94 vs Premium base 91 -> Premium 97 wins legitimately
    const freeBase = 94;
    const premiumBase = 91;

    const freeFinal = applyPremiumPriority(freeBase, false);
    const premiumFinal = applyPremiumPriority(premiumBase, true, { bonus: 6 });

    expect(freeFinal).toBe(94);
    expect(premiumFinal).toBe(97);
    expect(premiumFinal).toBeGreaterThan(freeFinal);
  });

  it('enforces Premium Fairness Rule Example B: Bonus DOES NOT flip large score gaps', () => {
    // Free base 98 vs Premium base 62 -> Free 98 wins over Premium 68
    const freeBase = 98;
    const premiumBase = 62;

    const freeFinal = applyPremiumPriority(freeBase, false);
    const premiumFinal = applyPremiumPriority(premiumBase, true, { bonus: 6 });

    expect(freeFinal).toBe(98);
    expect(premiumFinal).toBe(68);
    expect(freeFinal).toBeGreaterThan(premiumFinal);
  });

  it('generates complete MatchScoreResult with breakdown and narrative', () => {
    const res = computeFullMatch(
      { lat: 19.076, lng: 72.8777 },
      { lat: 19.062, lng: 72.854 },
      80,
      80,
      new Date(Date.now() + 4 * 60 * 60 * 1000),
      ['Rice', 'Dal', 'Biryani'],
      ['Rice', 'Dal'],
      true,
      'Hope Foundation'
    );

    expect(res.matchScore).toBeGreaterThanOrEqual(90);
    expect(res.explanation).toContain('MATCH');
    expect(res.foodSpecScore).toBe(100);
  });
});
