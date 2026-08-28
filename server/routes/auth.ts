import { Router } from 'express';
import { db } from '../db';
import { UserRole } from '../../src/types';

const router = Router();

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { email, role } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required.' });
  }

  const store = db.getStore();
  let user = store.users.find((u) => u.email.toLowerCase() === email.toLowerCase());

  if (!user) {
    return res.status(401).json({ error: 'Account not found. Please sign up first.' });
  }

  // Ensure role matches selected portal
  if (role && user.role !== role) {
    return res.status(403).json({
      error: `This account is registered as a ${user.role === 'donor' ? 'Food Donor' : 'NGO Manager'}. Please select the correct portal.`,
    });
  }

  return res.json({ user });
});

// POST /api/auth/google - Professional Google OAuth simulation
router.post('/google', (req, res) => {
  const { role, googleToken } = req.body;

  if (!role || (role !== 'donor' && role !== 'ngo')) {
    return res.status(400).json({ error: 'Role (donor or ngo) must be selected before authenticating with Google.' });
  }

  const store = db.getStore();

  // Preset Google user account
  const defaultEmail = role === 'donor' ? 'donor@spicevilla.com' : 'ngo@hope.org';
  const user = store.users.find((u) => u.email === defaultEmail);

  if (user) {
    return res.json({ user, message: 'Google Authentication successful!' });
  }

  const newUser = db.addUser({
    name: role === 'donor' ? 'Verified Food Donor' : 'Verified NGO Partner',
    email: `google_${Date.now()}@example.com`,
    role,
    subscriptionPlan: 'free',
    location: 'Mumbai Central',
    latitude: 19.076,
    longitude: 72.8777,
    emailVerified: true,
  });

  return res.json({ user: newUser, message: 'Google Account created and verified!' });
});

// POST /api/auth/signup
router.post('/signup', (req, res) => {
  const { name, email, role, donorType, location, latitude, longitude } = req.body;

  if (!name || !email || !role) {
    return res.status(400).json({ error: 'Name, email, and role are required.' });
  }

  const store = db.getStore();
  const existing = store.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(400).json({ error: 'An account with this email already exists.' });
  }

  const newUser = db.addUser({
    name,
    email,
    role,
    donorType: role === 'donor' ? donorType || 'Restaurant' : undefined,
    subscriptionPlan: 'free',
    location: location || 'Bandra West, Mumbai',
    latitude: latitude || 19.076,
    longitude: longitude || 72.8777,
    emailVerified: true, // Marked verified
  });

  return res.status(201).json({
    message: 'Account created successfully! Welcome to ZeroPlate.',
    user: newUser,
  });
});

// POST /api/auth/reset-demo
router.post('/reset-demo', (req, res) => {
  db.resetSeed();
  return res.json({ message: 'Database reset to initial demo seed.' });
});

export default router;
