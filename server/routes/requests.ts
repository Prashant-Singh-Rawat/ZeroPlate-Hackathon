import { Router } from 'express';
import { db } from '../db';

const router = Router();

// GET /api/requests?donorId=... or ?ngoId=...
router.get('/', (req, res) => {
  const store = db.getStore();
  const { donorId, ngoId, status } = req.query;

  let requests = [...store.requests];

  if (donorId) {
    requests = requests.filter((r) => r.donorId === donorId);
  }

  if (ngoId) {
    requests = requests.filter((r) => r.ngoId === ngoId);
  }

  if (status) {
    requests = requests.filter((r) => r.status === status);
  }

  return res.json(requests);
});

// POST /api/requests - NGO submits request for food donation (§3)
router.post('/', (req, res) => {
  const { donationId, ngoId, ngoName, requestedMeals, notes } = req.body;

  if (!donationId || !ngoId || !ngoName) {
    return res.status(400).json({ error: 'donationId, ngoId, and ngoName are required.' });
  }

  const result = db.createFoodRequest(
    donationId,
    ngoId,
    ngoName,
    requestedMeals ? Number(requestedMeals) : undefined,
    notes
  );

  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }

  return res.status(201).json({
    message: 'Food request submitted successfully! Pending donor approval.',
    request: result.request,
  });
});

// POST /api/requests/:id/accept - Food Donor accepts request (§1, §2)
router.post('/:id/accept', (req, res) => {
  const { id } = req.params;
  const { donorId } = req.body;

  if (!donorId) {
    return res.status(400).json({ error: 'donorId is required to accept request.' });
  }

  const result = db.acceptFoodRequest(id, donorId);

  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }

  return res.json({
    message: 'Request accepted! Booking confirmed and competing requests rejected.',
    request: result.request,
    booking: result.booking,
  });
});

// POST /api/requests/:id/reject - Food Donor rejects request (§1, §2)
router.post('/:id/reject', (req, res) => {
  const { id } = req.params;
  const { donorId } = req.body;

  if (!donorId) {
    return res.status(400).json({ error: 'donorId is required to reject request.' });
  }

  const result = db.rejectFoodRequest(id, donorId);

  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }

  return res.json({
    message: 'Request rejected.',
    request: result.request,
  });
});

// POST /api/requests/:id/cancel - NGO cancels own request
router.post('/:id/cancel', (req, res) => {
  const { id } = req.params;
  const { ngoId } = req.body;

  if (!ngoId) {
    return res.status(400).json({ error: 'ngoId is required to cancel request.' });
  }

  const result = db.cancelFoodRequest(id, ngoId);

  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }

  return res.json({ message: 'Request cancelled successfully.' });
});

export default router;
