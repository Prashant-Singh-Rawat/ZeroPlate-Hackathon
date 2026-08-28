import { describe, it, expect } from 'vitest';
import {
  calculateDistanceScore,
  calculateMealCompatibility,
  calculateUrgencyScore,
  calculateMatchScore,
  applyPremiumPriority,
  generateMatchExplanation,
  computeFullMatch,
  PREMIUM_BONUS,
} from '../src/services/matching/matchingEngine';

describe('ZeroPlate Smart Matching Engine', () => {
  it('should compute distance score with 100 at 0km and 0 at maxRadius', () => {
    const coordsA = { lat: 19.076, lng: 72.8777 }; // Mumbai
    const coordsB = { lat: 19.076, lng: 72.8777 };
    const scoreZero = calculateDistanceScore(coordsA, coordsB, 25);
    expect(scoreZero).toBe(100);

    const coordsFar = { lat: 19.500, lng: 72.8777 }; // ~47km away
    const scoreFar = calculateDistanceScore(coordsA, coordsFar, 25);
    expect(scoreFar).toBe(0);
  });

  it('should compute meal compatibility correctly based on capacity', () => {
    expect(calculateMealCompatibility(80, 100)).toBe(100); // Excess capacity
    expect(calculateMealCompatibility(80, 80)).toBe(100); // Exact capacity
    expect(calculateMealCompatibility(100, 50)).toBe(50); // Half capacity
  });

  it('should compute urgency score based on time remaining', () => {
    const now = new Date('2026-08-28T12:00:00Z');
    const deadline1Hr = new Date('2026-08-28T13:00:00Z');
    const deadline12Hr = new Date('2026-08-28T24:00:00Z');

    expect(calculateUrgencyScore(deadline1Hr, now)).toBe(100);
    expect(calculateUrgencyScore(deadline12Hr, now)).toBe(40);
  });

  it('should calculate weighted match score: 40% distance + 40% meal + 20% urgency', () => {
    const dist = 100; // 100 * 0.4 = 40
    const meal = 100; // 100 * 0.4 = 40
    const urg = 100; // 100 * 0.2 = 20
    expect(calculateMatchScore(dist, meal, urg)).toBe(100);

    expect(calculateMatchScore(50, 50, 50)).toBe(50);
  });

  describe('Premium Fairness Rule (§2 Explicit Assertions)', () => {
    it('Example A: Bonus flips close ranks (Free base 94 vs Premium base 91)', () => {
      const freeBaseScore = 94;
      const premiumBaseScore = 91;

      const freeFinal = applyPremiumPriority(freeBaseScore, false);
      const premiumFinal = applyPremiumPriority(premiumBaseScore, true);

      expect(freeFinal).toBe(94);
      expect(premiumFinal).toBe(97); // 91 + 6 = 97
      expect(premiumFinal).toBeGreaterThan(freeFinal); // Premium flips rank when scores are close
    });

    it('Example B: Bonus MUST NOT flip order when gap is large (Free base 98 vs Premium base 60)', () => {
      const freeBaseScore = 98;
      const premiumBaseScore = 60;

      const freeFinal = applyPremiumPriority(freeBaseScore, false);
      const premiumFinal = applyPremiumPriority(premiumBaseScore, true);

      expect(freeFinal).toBe(98);
      expect(premiumFinal).toBe(66); // 60 + 6 = 66
      expect(freeFinal).toBeGreaterThan(premiumFinal); // Free tier maintains first place due to high quality fit
    });
  });

  it('should generate dynamic natural-language explanation', () => {
    const explanation = generateMatchExplanation(
      1.2,
      80,
      100,
      3,
      false,
      94,
      'Hope Foundation'
    );
    expect(explanation).toContain('Hope Foundation');
    expect(explanation).toContain('1.2 km away');
    expect(explanation).toContain('all 80 meals');
  });

  it('should produce complete MatchScoreResult', () => {
    const donorCoords = { lat: 19.076, lng: 72.8777 };
    const ngoCoords = { lat: 19.086, lng: 72.8877 };
    const result = computeFullMatch(
      donorCoords,
      ngoCoords,
      80,
      100,
      new Date(Date.now() + 3 * 3600 * 1000).toISOString(),
      true,
      'Hope Foundation'
    );

    expect(result.matchScore).toBeGreaterThan(0);
    expect(result.premiumBonus).toBe(PREMIUM_BONUS);
    expect(result.explanation).toBeDefined();
  });
});
