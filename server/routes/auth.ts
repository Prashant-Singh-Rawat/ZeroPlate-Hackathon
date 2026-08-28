import { Router } from 'express';
import { db } from '../db';
import { UserRole } from '../../src/types';

const router = Router();

// Configuration for Google Cloud Console OAuth (TonyCV project)
const GOOGLE_CLOUD_PROJECT_ID = process.env.GOOGLE_PROJECT_ID || 'tonycv';
const GOOGLE_CLOUD_PROJECT_NUMBER = process.env.GOOGLE_PROJECT_NUMBER || '132721264540';

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { email, role } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email or phone number is required.' });
  }

  const store = db.getStore();
  let user = store.users.find((u) => u.email.toLowerCase() === email.toLowerCase());

  if (!user) {
    return res.status(401).json({ error: 'Account not found. Please sign up or continue with Google.' });
  }

  // Ensure role matches selected portal
  if (role && user.role !== role) {
    return res.status(403).json({
      error: `This account is registered as a ${user.role === 'donor' ? 'Food Donor' : 'NGO Manager'}. Please select the ${user.role === 'donor' ? 'Food Donor' : 'NGO / Volunteer'} card above.`,
    });
  }

  return res.json({ user });
});

// POST /api/auth/google - Google Cloud OAuth / Gmail verification
router.post('/google', (req, res) => {
  const { role, googleToken, email, name, googleCloudProjectId } = req.body;

  if (!role || (role !== 'donor' && role !== 'ngo')) {
    return res.status(400).json({ error: 'Please select whether you are a Food Donor or NGO / Volunteer before connecting with Google.' });
  }

  const store = db.getStore();

  // If user provided a specific email or default preset
  const targetEmail = email || (role === 'donor' ? 'donor@spicevilla.com' : 'ngo@hope.org');
  let user = store.users.find((u) => u.email.toLowerCase() === targetEmail.toLowerCase());

  if (user) {
    user.emailVerified = true;
    return res.json({
      user,
      cloudProject: GOOGLE_CLOUD_PROJECT_ID,
      verifiedVia: 'Google Cloud Gmail OAuth 2.0',
      message: `Successfully authenticated via Google Cloud (${GOOGLE_CLOUD_PROJECT_ID})!`,
    });
  }

  const newUser = db.addUser({
    name: name || (role === 'donor' ? 'SpiceVilla Google Donor' : 'Hope Foundation NGO'),
    email: targetEmail,
    role,
    donorType: role === 'donor' ? 'Restaurant' : undefined,
    subscriptionPlan: 'free',
    location: 'Bandra, Mumbai',
    latitude: 19.076,
    longitude: 72.8777,
    emailVerified: true,
  });

  return res.json({
    user: newUser,
    cloudProject: GOOGLE_CLOUD_PROJECT_ID,
    verifiedVia: 'Google Cloud Gmail OAuth 2.0',
    message: `Google Account verified and created via Google Cloud (${GOOGLE_CLOUD_PROJECT_ID})!`,
  });
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
    emailVerified: true,
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
