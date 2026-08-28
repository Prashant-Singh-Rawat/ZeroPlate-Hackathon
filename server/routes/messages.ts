import { Router } from 'express';
import { db } from '../db';

const router = Router();

// GET /api/messages/:bookingId
router.get('/:bookingId', (req, res) => {
  const store = db.getStore();
  const messages = store.messages.filter((m) => m.bookingId === req.params.bookingId);
  return res.json(messages);
});

// POST /api/messages
router.post('/', (req, res) => {
  const { bookingId, senderId, senderName, receiverId, message } = req.body;

  if (!bookingId || !senderId || !message) {
    return res.status(400).json({ error: 'bookingId, senderId, and message are required.' });
  }

  const newMsg = db.addMessage({
    bookingId,
    senderId,
    senderName: senderName || 'User',
    receiverId: receiverId || 'receiver',
    message,
  });

  return res.status(201).json(newMsg);
});

export default router;
