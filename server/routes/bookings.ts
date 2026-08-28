import { Router } from 'express';
import { db } from '../db';

const router = Router();

// GET /api/bookings
router.get('/', (req, res) => {
  const { userId, role } = req.query;
  const store = db.getStore();

  let userBookings = store.bookings;

  if (userId) {
    if (role === 'donor') {
      userBookings = userBookings.filter((b) => b.donorId === userId);
    } else if (role === 'ngo') {
      userBookings = userBookings.filter((b) => b.ngoId === userId);
    } else {
      userBookings = userBookings.filter((b) => b.donorId === userId || b.ngoId === userId);
    }
  }

  return res.json(userBookings);
});

// GET /api/bookings/:id/tracking (§6, §7)
// STRICT AUTHORIZATION: Scoped exclusively to the 2 parties on that booking
router.get('/:id/tracking', (req, res) => {
  const { id } = req.params;
  const { userId } = req.query;

  const store = db.getStore();
  const booking = store.bookings.find((b) => b.id === id);

  if (!booking) {
    return res.status(404).json({ error: 'Booking not found.' });
  }

  if (userId && booking.donorId !== userId && booking.ngoId !== userId) {
    return res.status(403).json({ error: 'Unauthorized: Location tracking is restricted to the two counterparties on this active booking.' });
  }

  const updates = store.locationUpdates.filter((u) => u.bookingId === id);

  return res.json({
    booking,
    updates,
    donorLocation: {
      latitude: booking.donorLatitude || 19.076,
      longitude: booking.donorLongitude || 72.8777,
      address: booking.pickupAddress,
    },
    ngoLocation: {
      latitude: booking.ngoLatitude || 19.062,
      longitude: booking.ngoLongitude || 72.854,
    },
  });
});

// POST /api/bookings/:id/location
router.post('/:id/location', (req, res) => {
  const { id } = req.params;
  const { userId, role, latitude, longitude } = req.body;

  if (!userId || !latitude || !longitude || !role) {
    return res.status(400).json({ error: 'User ID, role, latitude, and longitude are required.' });
  }

  const result = db.updateBookingLocation(id, userId, role, Number(latitude), Number(longitude));
  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }

  return res.json(result);
});

// POST /api/bookings/:id/status (CONFIRMED -> PICKUP_IN_PROGRESS -> COMPLETED)
router.post('/:id/status', (req, res) => {
  const { id } = req.params;
  const { userId, status } = req.body;

  if (!userId || !status) {
    return res.status(400).json({ error: 'User ID and target status are required.' });
  }

  const result = db.updateBookingStatus(id, userId, status);
  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }

  return res.json(result);
});

// POST /api/bookings/:id/complete
router.post('/:id/complete', (req, res) => {
  const { id } = req.params;
  const { userId } = req.body;

  const result = db.completePickup(id, userId || '');
  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }

  return res.json(result);
});

export default router;
