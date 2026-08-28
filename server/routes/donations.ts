import { Router } from 'express';
import { db } from '../db';
import { computeFullMatch } from '../../src/services/matching/matchingEngine';
import { FoodDonation } from '../../src/types';

const router = Router();

// GET /api/donations
router.get('/', (req, res) => {
  const { donorId, ngoId, foodType, minMeals, radiusKm, search, sortBy } = req.query;
  const store = db.getStore();

  let list = [...store.donations];

  // Donor view filter
  if (donorId) {
    list = list.filter((d) => d.donorId === donorId);
    return res.json(list);
  }

  // NGO view: only show AVAILABLE or PENDING_REQUEST
  list = list.filter((d) => d.status === 'AVAILABLE' || d.status === 'PENDING_REQUEST');

  // Filters
  if (foodType && foodType !== 'all') {
    list = list.filter((d) => d.foodType === foodType);
  }

  if (minMeals) {
    list = list.filter((d) => d.mealCount >= Number(minMeals));
  }

  if (search) {
    const q = String(search).toLowerCase();
    list = list.filter(
      (d) =>
        d.foodName.toLowerCase().includes(q) ||
        d.donorName.toLowerCase().includes(q) ||
        d.pickupLocation.toLowerCase().includes(q) ||
        (d.foodCategory || d.category || '').toLowerCase().includes(q)
    );
  }

  // If queried by an NGO, calculate match scores using their requirements
  let enriched = list.map((item) => {
    let match = undefined;

    if (ngoId) {
      const ngoUser = store.users.find((u) => u.id === ngoId);
      const ngoEntity = store.ngos.find((n) => n.userId === ngoId || n.id === ngoId);
      const ngoReq = db.getNGORequirement(String(ngoId));

      const ngoLat = ngoEntity?.latitude || ngoUser?.latitude || 19.062;
      const ngoLng = ngoEntity?.longitude || ngoUser?.longitude || 72.854;
      const isPremium = ngoUser?.subscriptionPlan === 'premium';

      match = computeFullMatch(
        { lat: item.latitude, lng: item.longitude },
        { lat: ngoLat, lng: ngoLng },
        item.mealCount,
        ngoReq?.requiredMeals || ngoEntity?.capacity || 80,
        item.pickupDeadline,
        item.foodSpecifications || [item.foodCategory || 'Cooked Food'],
        ngoReq?.foodSpecifications || ['Cooked Food'],
        isPremium,
        ngoEntity?.organizationName || ngoUser?.name || 'Hope Foundation'
      );
    }

    return { ...item, match };
  });

  // Filter by Radius
  if (radiusKm && Number(radiusKm) > 0) {
    enriched = enriched.filter((d) => (d.match ? d.match.distanceKm <= Number(radiusKm) : true));
  }

  // Sort
  if (sortBy === 'nearest') {
    enriched.sort((a, b) => (a.match?.distanceKm || 0) - (b.match?.distanceKm || 0));
  } else if (sortBy === 'most_meals') {
    enriched.sort((a, b) => b.mealCount - a.mealCount);
  } else if (sortBy === 'most_urgent') {
    enriched.sort((a, b) => new Date(a.pickupDeadline).getTime() - new Date(b.pickupDeadline).getTime());
  } else if (sortBy === 'latest') {
    enriched.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } else {
    // Default: Best Match
    enriched.sort((a, b) => (b.match?.matchScore || 0) - (a.match?.matchScore || 0));
  }

  return res.json(enriched);
});

// POST /api/donations
router.post('/', (req, res) => {
  const {
    donorId,
    donorName,
    donorType,
    foodName,
    foodCategory,
    foodSpecifications,
    foodType,
    mealCount,
    quantity,
    description,
    imageUrl,
    latitude,
    longitude,
    pickupLocation,
    pickupAddress,
    availableFrom,
    pickupDeadline,
    prepTime,
    packagingAvailable,
    additionalNotes,
  } = req.body;

  if (!donorId || !foodName || !pickupLocation || !mealCount) {
    return res.status(400).json({ error: 'Donor ID, food name, pickup location, and meal count are required.' });
  }

  const newDonation = db.addDonation({
    donorId,
    donorName: donorName || 'Food Donor',
    donorType: donorType || 'Restaurant',
    foodName,
    foodCategory: foodCategory || 'Cooked Meal',
    category: foodCategory || 'Cooked Meal',
    foodSpecifications: foodSpecifications || ['Cooked Food'],
    foodType: foodType || 'veg',
    mealCount: Number(mealCount),
    quantity: quantity || `${mealCount} meals`,
    description: description || '',
    imageUrl,
    latitude: Number(latitude) || 19.076,
    longitude: Number(longitude) || 72.8777,
    pickupLocation,
    pickupAddress: pickupAddress || pickupLocation,
    availableFrom: availableFrom || new Date().toISOString(),
    pickupDeadline: pickupDeadline || new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
    prepTime,
    packagingAvailable: packagingAvailable !== undefined ? Boolean(packagingAvailable) : true,
    additionalNotes,
  });

  return res.status(201).json(newDonation);
});

export default router;
