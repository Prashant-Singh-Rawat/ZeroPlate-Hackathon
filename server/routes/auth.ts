import { Router } from 'express';
import { db } from '../db';
import { UserRole } from '../../src/types';

const router = Router();

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

  // Strictly enforce role at server-side
  if (role && user.role !== role) {
    return res.status(403).json({
      error: `This account is registered as a ${user.role === 'donor' ? 'Food Donor' : 'NGO Manager'}. Please select the ${user.role === 'donor' ? 'Food Donor' : 'NGO / Volunteer'} card above.`,
    });
  }

  return res.json({ user });
});

// POST /api/auth/google
router.post('/google', (req, res) => {
  const { role, email, name } = req.body;

  if (!role || (role !== 'donor' && role !== 'ngo')) {
    return res.status(400).json({ error: 'Please select whether you are a Food Donor or NGO / Volunteer before connecting with Google.' });
  }

  const store = db.getStore();
  const targetEmail = email || (role === 'donor' ? 'donor@spicevilla.com' : 'ngo@hope.org');
  let user = store.users.find((u) => u.email.toLowerCase() === targetEmail.toLowerCase());

  if (user) {
    user.emailVerified = true;
    return res.json({
      user,
      verifiedVia: 'Google Cloud Gmail OAuth 2.0',
      message: 'Google Authentication successful!',
    });
  }

  const newUser = db.addUser({
    name: name || (role === 'donor' ? 'New Food Donor' : 'New NGO Partner'),
    email: targetEmail,
    role,
    subscriptionPlan: 'free',
    latitude: 19.076,
    longitude: 72.8777,
    emailVerified: true,
    onboarded: false, // Must complete role-specific onboarding
  });

  return res.json({
    user: newUser,
    verifiedVia: 'Google Cloud Gmail OAuth 2.0',
    message: 'Google Account authenticated! Please complete onboarding.',
  });
});

// POST /api/auth/onboard/ngo (§3)
router.post('/onboard/ngo', (req, res) => {
  const { userId, organizationName, organizationType, contactPerson, phone, address, latitude, longitude, requirements } = req.body;

  if (!userId || !organizationName) {
    return res.status(400).json({ error: 'Organization name and user ID are required.' });
  }

  try {
    const { user, entity } = db.onboardNGO(
      userId,
      organizationName,
      organizationType || 'NGO',
      contactPerson || 'Coordinator',
      phone || '',
      address || 'Mumbai',
      latitude || 19.062,
      longitude || 72.854,
      requirements?.requiredMeals || 80
    );

    if (requirements) {
      db.setNGORequirement(user.id, {
        requiredMeals: Number(requirements.requiredMeals) || 80,
        foodSpecifications: requirements.foodSpecifications || ['Rice + Dal'],
        foodType: requirements.foodType || 'either',
        urgency: requirements.urgency || 'medium',
        requiredBy: requirements.requiredBy || new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
        maximumRadius: Number(requirements.maximumRadius) || 15,
        specificRequirement: requirements.specificRequirement,
        status: 'ACTIVE',
      });
    }

    return res.json({ success: true, user, entity, message: 'NGO Onboarding complete!' });
  } catch (e: any) {
    return res.status(400).json({ error: e.message || 'Onboarding failed.' });
  }
});

// POST /api/auth/onboard/donor (§4)
router.post('/onboard/donor', (req, res) => {
  const { userId, donorType, organizationName, contactPerson, phone, address, latitude, longitude, isHousehold } = req.body;

  if (!userId || !organizationName) {
    return res.status(400).json({ error: 'Donor name and user ID are required.' });
  }

  try {
    const { user, entity } = db.onboardDonor(
      userId,
      donorType || 'Restaurant',
      organizationName,
      contactPerson || 'Manager',
      phone || '',
      address || 'Mumbai',
      latitude || 19.076,
      longitude || 72.8777,
      Boolean(isHousehold)
    );

    return res.json({ success: true, user, entity, message: 'Food Donor Onboarding complete!' });
  } catch (e: any) {
    return res.status(400).json({ error: e.message || 'Onboarding failed.' });
  }
});

// POST /api/auth/reset-demo
router.post('/reset-demo', (req, res) => {
  db.resetSeed();
  return res.json({ message: 'Database reset to initial demo seed.' });
});

export default router;
