import { Router } from 'express';
import { db } from '../db';

const router = Router();

// GET /api/bookings?userId=...&role=...
router.get('/', (req, res) => {
  const store = db.getStore();
  const { userId, role, status } = req.query;

  let bookings = [...store.bookings];

  if (userId && role) {
    if (role === 'donor') {
      bookings = bookings.filter((b) => b.donorId === userId);
    } else if (role === 'ngo') {
      const ngo = store.ngos.find((n) => n.userId === userId || n.id === userId);
      const ngoId = ngo ? ngo.id : userId;
      bookings = bookings.filter((b) => b.ngoId === ngoId || b.ngoId === userId);
    }
  }

  if (status) {
    bookings = bookings.filter((b) => b.status === status);
  }

  return res.json(bookings);
});

// POST /api/bookings/:id/complete - Confirm/Complete pickup (§1, §4)
router.post('/:id/complete', (req, res) => {
  const { id } = req.params;
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'userId is required.' });
  }

  const result = db.completePickup(id, userId);

  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }

  return res.json({
    message: 'Pickup completed successfully! Impact metrics updated.',
    booking: result.booking,
  });
});

export default router;
