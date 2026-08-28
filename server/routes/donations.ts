import { Router } from 'express';
import { db } from '../db';
import { computeFullMatch } from '../../src/services/matching/matchingEngine';

const router = Router();

// GET /api/donations (supports filters, sorting, and match scoring)
router.get('/', (req, res) => {
  const store = db.getStore();
  let donations = [...store.donations];

  const {
    ngoId,
    donorId,
    status,
    foodType,
    minMeals,
    maxMeals,
    urgency,
    radiusKm,
    sortBy,
    search,
  } = req.query;

  // Filter by donorId if requesting donor's listings
  if (donorId) {
    donations = donations.filter((d) => d.donorId === donorId);
  }

  // Filter by status if specified
  if (status) {
    donations = donations.filter((d) => d.status === status);
  }

  // Search by food name, donor name, or location
  if (search) {
    const s = String(search).toLowerCase();
    donations = donations.filter(
      (d) =>
        d.foodName.toLowerCase().includes(s) ||
        d.donorName.toLowerCase().includes(s) ||
        d.pickupLocation.toLowerCase().includes(s)
    );
  }

  // Filter by foodType
  if (foodType && foodType !== 'all') {
    donations = donations.filter((d) => d.foodType === foodType);
  }

  // Filter by minMeals
  if (minMeals) {
    const min = Number(minMeals);
    if (!isNaN(min)) {
      donations = donations.filter((d) => d.mealCount >= min);
    }
  }

  // Filter by maxMeals
  if (maxMeals) {
    const max = Number(maxMeals);
    if (!isNaN(max)) {
      donations = donations.filter((d) => d.mealCount <= max);
    }
  }

  // Filter by urgency
  if (urgency === 'urgent') {
    donations = donations.filter((d) => {
      const diffHours = (new Date(d.pickupDeadline).getTime() - Date.now()) / (1000 * 60 * 60);
      return diffHours <= 3;
    });
  }

  // If ngoId is provided, compute match scores and distances relative to the NGO
  let currentNgo = store.ngos.find((n) => n.userId === ngoId || n.id === ngoId);
  const ngoUser = store.users.find((u) => u.id === ngoId);

  const ngoLat = currentNgo?.latitude || ngoUser?.latitude || 19.062;
  const ngoLng = currentNgo?.longitude || ngoUser?.longitude || 72.854;
  const isPremium = currentNgo?.isPremium || ngoUser?.subscriptionPlan === 'premium';
  const ngoCapacity = currentNgo?.capacity || 100;
  const ngoOrgName = currentNgo?.organizationName || ngoUser?.name || 'NGO Partner';

  let results = donations.map((donation) => {
    const match = computeFullMatch(
      { lat: donation.latitude, lng: donation.longitude },
      { lat: ngoLat, lng: ngoLng },
      donation.mealCount,
      ngoCapacity,
      donation.pickupDeadline,
      isPremium,
      ngoOrgName
    );

    return {
      ...donation,
      match,
    };
  });

  // Filter by radius if specified
  if (radiusKm && Number(radiusKm) > 0) {
    const maxR = Number(radiusKm);
    results = results.filter((d) => d.match.distanceKm <= maxR);
  }

  // Sorting (§3)
  if (sortBy === 'nearest') {
    results.sort((a, b) => a.match.distanceKm - b.match.distanceKm);
  } else if (sortBy === 'most_meals') {
    results.sort((a, b) => b.mealCount - a.mealCount);
  } else if (sortBy === 'most_urgent') {
    results.sort(
      (a, b) => new Date(a.pickupDeadline).getTime() - new Date(b.pickupDeadline).getTime()
    );
  } else if (sortBy === 'latest') {
    results.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } else {
    // Default: Best Match
    results.sort((a, b) => b.match.matchScore - a.match.matchScore);
  }

  return res.json(results);
});

// GET /api/donations/:id
router.get('/:id', (req, res) => {
  const store = db.getStore();
  const donation = store.donations.find((d) => d.id === req.params.id);
  if (!donation) {
    return res.status(404).json({ error: 'Donation not found.' });
  }

  const { ngoId } = req.query;
  if (ngoId) {
    const currentNgo = store.ngos.find((n) => n.userId === ngoId || n.id === ngoId);
    const ngoUser = store.users.find((u) => u.id === ngoId);
    const ngoLat = currentNgo?.latitude || ngoUser?.latitude || 19.062;
    const ngoLng = currentNgo?.longitude || ngoUser?.longitude || 72.854;
    const isPremium = currentNgo?.isPremium || ngoUser?.subscriptionPlan === 'premium';
    const ngoCapacity = currentNgo?.capacity || 100;
    const ngoOrgName = currentNgo?.organizationName || ngoUser?.name || 'NGO Partner';

    const match = computeFullMatch(
      { lat: donation.latitude, lng: donation.longitude },
      { lat: ngoLat, lng: ngoLng },
      donation.mealCount,
      ngoCapacity,
      donation.pickupDeadline,
      isPremium,
      ngoOrgName
    );

    return res.json({ ...donation, match });
  }

  return res.json(donation);
});

// POST /api/donations - Food Donor publishes new donation (§2, §7)
router.post('/', (req, res) => {
  const {
    donorId,
    donorName,
    donorType,
    foodName,
    foodType,
    category,
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

  if (!foodName || !mealCount || !pickupDeadline || !pickupLocation) {
    return res.status(400).json({ error: 'Food name, meal count, pickup location, and deadline are required.' });
  }

  if (Number(mealCount) <= 0) {
    return res.status(400).json({ error: 'Number of meals must be greater than 0.' });
  }

  if (new Date(pickupDeadline).getTime() <= Date.now()) {
    return res.status(400).json({ error: 'Pickup deadline must be in the future.' });
  }

  const newDonation = db.addDonation({
    donorId: donorId || 'donor_spicevilla',
    donorName: donorName || 'SpiceVilla Restaurant',
    donorType: donorType || 'Restaurant',
    foodName,
    foodType: foodType === 'non-veg' ? 'non-veg' : 'veg',
    category: category || 'Main Course',
    mealCount: Number(mealCount),
    quantity: quantity || `${mealCount} meals`,
    description: description || 'Freshly prepared surplus food ready for NGO collection.',
    imageUrl: imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80',
    latitude: Number(latitude) || 19.076,
    longitude: Number(longitude) || 72.8777,
    pickupLocation,
    pickupAddress: pickupAddress || pickupLocation,
    availableFrom: availableFrom || new Date().toISOString(),
    pickupDeadline,
    prepTime,
    packagingAvailable: packagingAvailable !== undefined ? Boolean(packagingAvailable) : true,
    additionalNotes,
  });

  return res.status(201).json({
    message: 'Food donation published successfully! Now visible to local NGOs.',
    donation: newDonation,
  });
});

export default router;
