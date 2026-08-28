import { Router } from 'express';
import { db } from '../db';
import { computeFullMatch } from '../../src/services/matching/matchingEngine';

const router = Router();

// GET /api/ngos?donationId=...
router.get('/', (req, res) => {
  const store = db.getStore();
  const { donationId } = req.query;

  if (!donationId) {
    // Return all NGOs
    return res.json(store.ngos);
  }

  const donation = store.donations.find((d) => d.id === donationId);
  if (!donation) {
    return res.status(404).json({ error: 'Donation not found.' });
  }

  // Compute matches for each NGO using the Smart Matching Engine
  const rankedNgos = store.ngos.map((ngo) => {
    const match = computeFullMatch(
      { lat: donation.latitude, lng: donation.longitude },
      { lat: ngo.latitude, lng: ngo.longitude },
      donation.mealCount,
      ngo.capacity,
      donation.pickupDeadline,
      !!ngo.isPremium,
      ngo.organizationName
    );

    return {
      ...ngo,
      match,
    };
  });

  // Sort descending by matchScore
  rankedNgos.sort((a, b) => b.match.matchScore - a.match.matchScore);

  return res.json({
    donation,
    bestMatch: rankedNgos[0] || null,
    otherMatches: rankedNgos.slice(1),
    allMatches: rankedNgos,
  });
});

export default router;
