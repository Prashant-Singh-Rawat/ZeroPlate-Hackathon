import { Router } from 'express';
import { db } from '../db';
import { BookingStatus } from '../../src/types';

const router = Router();

// GET /api/delivery/persons
router.get('/persons', (req, res) => {
  const { donorId } = req.query;
  const persons = db.getDeliveryPersons(donorId ? String(donorId) : undefined);
  return res.json(persons);
});

// POST /api/delivery/persons
router.post('/persons', (req, res) => {
  const { donorId, name, phone, role, vehicleType, vehicleNumber } = req.body;
  if (!name || !phone) {
    return res.status(400).json({ error: 'Name and phone number are required.' });
  }

  const newPerson = db.addDeliveryPerson({
    donorId: donorId || 'donor_spicevilla',
    name,
    phone,
    role: role || 'Volunteer',
    vehicleType: vehicleType || 'Bike',
    vehicleNumber: vehicleNumber || '',
    availability: 'Available',
  });

  return res.status(201).json(newPerson);
});

// POST /api/delivery/assign
router.post('/assign', (req, res) => {
  const { bookingId, deliveryPersonId } = req.body;
  if (!bookingId || !deliveryPersonId) {
    return res.status(400).json({ error: 'Booking ID and delivery person ID are required.' });
  }

  const result = db.assignDeliveryPerson(bookingId, deliveryPersonId);
  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }

  return res.json(result);
});

// POST /api/delivery/status
router.post('/status', (req, res) => {
  const { bookingId, status } = req.body;
  if (!bookingId || !status) {
    return res.status(400).json({ error: 'Booking ID and status are required.' });
  }

  const result = db.updateBookingStatus(bookingId, status as BookingStatus);
  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }

  return res.json(result);
});

// POST /api/delivery/location
router.post('/location', (req, res) => {
  const { bookingId, deliveryPersonId, latitude, longitude } = req.body;
  if (!bookingId || !deliveryPersonId || latitude === undefined || longitude === undefined) {
    return res.status(400).json({ error: 'Booking ID, delivery person ID, latitude, and longitude are required.' });
  }

  const result = db.updateDeliveryLocation(bookingId, deliveryPersonId, Number(latitude), Number(longitude));
  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }

  return res.json(result);
});

export default router;
