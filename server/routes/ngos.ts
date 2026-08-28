import { Router } from 'express';
import { db } from '../db';

const router = Router();

// GET /api/ngos
router.get('/', (req, res) => {
  const store = db.getStore();
  return res.json(store.ngos);
});

// GET /api/ngos/requirements
router.get('/requirements', (req, res) => {
  const { ngoId } = req.query;
  const store = db.getStore();
  if (ngoId) {
    const reqItem = store.requirements.find((r) => r.ngoId === ngoId && r.status === 'ACTIVE');
    return res.json(reqItem || null);
  }
  return res.json(store.requirements);
});

// POST /api/ngos/requirements
router.post('/requirements', (req, res) => {
  const { ngoId, requiredMeals, foodSpecifications, foodType, urgency, requiredBy, maximumRadius, specificRequirement } = req.body;

  if (!ngoId || !requiredMeals) {
    return res.status(400).json({ error: 'NGO ID and required meals are required.' });
  }

  const updatedReq = db.setNGORequirement(ngoId, {
    requiredMeals: Number(requiredMeals),
    foodSpecifications: foodSpecifications || ['Cooked Food'],
    foodType: foodType || 'either',
    urgency: urgency || 'medium',
    requiredBy: requiredBy || new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
    maximumRadius: Number(maximumRadius) || 15,
    specificRequirement,
    status: 'ACTIVE',
  });

  return res.json({ success: true, requirement: updatedReq });
});

// POST /api/ngos/toggle-location-sharing (§7)
router.post('/toggle-location-sharing', (req, res) => {
  const { ngoId, enabled } = req.body;
  const store = db.getStore();
  const ngo = store.ngos.find((n) => n.userId === ngoId || n.id === ngoId);

  if (!ngo) return res.status(404).json({ error: 'NGO not found.' });

  ngo.locationSharingEnabled = typeof enabled === 'boolean' ? enabled : !ngo.locationSharingEnabled;
  return res.json({ success: true, locationSharingEnabled: ngo.locationSharingEnabled });
});

export default router;
