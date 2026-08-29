import { Router } from 'express';
import { db } from '../db';
import { computeFullMatch } from '../../src/services/matching/matchingEngine';

const router = Router();

// GET /api/ngos/requirements?ngoId=...
router.get('/requirements', (req, res) => {
  const { ngoId } = req.query;
  const targetNgoId = String(ngoId || 'ngo_hope');

  const requirement = db.getNGORequirement(targetNgoId);
  if (requirement) {
    return res.json(requirement);
  }

  // Fallback to default requirement if not found
  const store = db.getStore();
  const defaultReq = store.requirements[0] || {
    id: `req_${targetNgoId}_default`,
    ngoId: targetNgoId,
    requiredMeals: 120,
    foodSpecifications: ['Rice', 'Dal', 'Rice + Dal', 'Biryani'],
    foodType: 'veg',
    urgency: 'high',
    requiredBy: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
    maximumRadius: 10,
    specificRequirement: 'Nutritious meals for community shelter',
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
  };

  return res.json(defaultReq);
});

// POST /api/ngos/requirements
router.post('/requirements', (req, res) => {
  const {
    ngoId,
    requiredMeals,
    estWeight,
    maximumRadius,
    foodType,
    foodSpecifications,
    urgency,
    requiredBy,
    specificRequirement,
  } = req.body;

  const targetNgoId = String(ngoId || 'ngo_hope');
  const meals = Number(requiredMeals) || 120;
  const radius = Number(maximumRadius) || 10;
  const type = foodType === 'non-veg' || foodType === 'either' ? foodType : 'veg';

  const updatedReq = db.setNGORequirement(targetNgoId, {
    requiredMeals: meals,
    foodSpecifications: Array.isArray(foodSpecifications) ? foodSpecifications : ['Rice', 'Dal', 'Biryani'],
    foodType: type,
    urgency: urgency || 'high',
    requiredBy: requiredBy || new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
    maximumRadius: radius,
    specificRequirement: specificRequirement || (estWeight ? `Est. weight: ${estWeight} kg` : undefined),
    status: 'ACTIVE',
  });

  // Also update NGO entity capacity if matching targetNgoId
  const store = db.getStore();
  const ngoEntity = store.ngos.find((n) => n.userId === targetNgoId || n.id === targetNgoId);
  if (ngoEntity) {
    ngoEntity.capacity = meals;
  }

  return res.json({
    success: true,
    message: 'NGO requirements updated successfully.',
    requirement: updatedReq,
  });
});

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
