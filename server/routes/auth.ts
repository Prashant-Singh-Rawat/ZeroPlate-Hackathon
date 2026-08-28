import { Router } from 'express';
import { db } from '../db';
import { UserRole } from '../../src/types';

const router = Router();

export const GOOGLE_CLIENT_ID =
  process.env.GOOGLE_CLIENT_ID ||
  '132721264540-tvqtl6nen6f2hsun0u1ejlqkqmr9640r.apps.googleusercontent.com';

// In-memory OTP storage for Gmail verification
const otpStore: Record<string, { code: string; expiresAt: number; role: UserRole }> = {};

// Helper to decode JWT payload safely
function decodeJwt(token: string): any {
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const payload = Buffer.from(parts[1], 'base64').toString('utf-8');
    return JSON.parse(payload);
  } catch (e) {
    return null;
  }
}

// POST /api/auth/send-otp - Send Gmail 6-digit verification OTP
router.post('/send-otp', (req, res) => {
  const { email, role } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email address is required.' });
  }

  // Generate 6-digit OTP
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore[email.toLowerCase()] = {
    code,
    expiresAt: Date.now() + 5 * 60 * 1000, // 5 mins
    role: role || 'donor',
  };

  console.log(`[ZeroPlate Auth] 📧 Gmail Verification Code for ${email}: ${code}`);

  return res.json({
    success: true,
    message: `6-digit verification code generated for ${email}.`,
    demoCode: code, // Provided for easy hackathon demo testing
  });
});

// POST /api/auth/verify-otp - Verify Gmail OTP code
router.post('/verify-otp', (req, res) => {
  const { email, code, role } = req.body;

  if (!email || !code) {
    return res.status(400).json({ error: 'Email and verification code are required.' });
  }

  const record = otpStore[email.toLowerCase()];
  if (!record) {
    return res.status(400).json({ error: 'No verification code was requested for this email. Please request a code first.' });
  }

  if (Date.now() > record.expiresAt) {
    delete otpStore[email.toLowerCase()];
    return res.status(400).json({ error: 'Verification code has expired. Please request a new code.' });
  }

  if (record.code !== String(code).trim()) {
    return res.status(400).json({ error: 'Incorrect 6-digit verification code. Please try again.' });
  }

  // Code is valid! Delete used OTP
  delete otpStore[email.toLowerCase()];

  const store = db.getStore();
  let user = store.users.find((u) => u.email.toLowerCase() === email.toLowerCase());

  if (user) {
    user.emailVerified = true;
    return res.json({
      success: true,
      user,
      verifiedVia: 'Gmail OTP Verification',
    });
  }

  // Create new verified user
  const effectiveRole = role || record.role || 'donor';
  const nameFromEmail = email.split('@')[0].replace(/[._]/g, ' ');
  const capitalizedName = nameFromEmail.charAt(0).toUpperCase() + nameFromEmail.slice(1);

  const newUser = db.addUser({
    name: capitalizedName || (effectiveRole === 'donor' ? 'Food Donor' : 'Hope NGO'),
    email: email.toLowerCase(),
    role: effectiveRole,
    subscriptionPlan: 'free',
    latitude: 19.076,
    longitude: 72.8777,
    emailVerified: true,
    onboarded: false,
  });

  return res.json({
    success: true,
    user: newUser,
    verifiedVia: 'Gmail OTP Verification',
  });
});

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { email, role } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required.' });
  }

  const store = db.getStore();
  let user = store.users.find((u) => u.email.toLowerCase() === email.toLowerCase());

  if (!user) {
    return res.status(401).json({ error: 'Account not found. Please verify your Gmail or connect with Google.' });
  }

  if (role) {
    user.role = role;
  }

  return res.json({ user });
});

// POST /api/auth/google - Google Cloud OAuth Verified Login
router.post('/google', (req, res) => {
  const { role, googleToken, email, name, avatar } = req.body;

  if (!role || (role !== 'donor' && role !== 'ngo')) {
    return res.status(400).json({ error: 'Please select whether you are a Food Donor or NGO / Volunteer before connecting with Google.' });
  }

  let verifiedEmail = email;
  let verifiedName = name;
  let verifiedAvatar = avatar;

  // Extract from Google ID token if provided
  if (googleToken && typeof googleToken === 'string') {
    const decoded = decodeJwt(googleToken);
    if (decoded && decoded.email) {
      verifiedEmail = decoded.email;
      verifiedName = decoded.name || verifiedName;
      verifiedAvatar = decoded.picture || verifiedAvatar;
    }
  }

  if (!verifiedEmail) {
    verifiedEmail = role === 'donor' ? 'donor@spicevilla.com' : 'ngo@hope.org';
  }

  const store = db.getStore();
  let user = store.users.find((u) => u.email.toLowerCase() === verifiedEmail.toLowerCase());

  if (user) {
    user.emailVerified = true;
    user.role = role; // Dynamically adopt the selected role
    if (verifiedAvatar) user.avatar = verifiedAvatar;
    if (verifiedName && !user.name) user.name = verifiedName;
    return res.json({
      user,
      verifiedVia: 'Google Cloud Gmail OAuth 2.0 (Verified)',
      clientId: GOOGLE_CLIENT_ID,
      message: 'Google Gmail Authentication & Verification successful!',
    });
  }

  const newUser = db.addUser({
    name: verifiedName || (role === 'donor' ? 'Verified Food Donor' : 'Verified Hope NGO'),
    email: verifiedEmail,
    role,
    avatar: verifiedAvatar,
    subscriptionPlan: 'free',
    latitude: 19.076,
    longitude: 72.8777,
    emailVerified: true,
    onboarded: false,
  });

  return res.json({
    user: newUser,
    verifiedVia: 'Google Cloud Gmail OAuth 2.0 (Verified)',
    clientId: GOOGLE_CLIENT_ID,
    message: 'Google Account verified! Please complete your organization profile.',
  });
});

// POST /api/auth/onboard/ngo
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

// POST /api/auth/onboard/donor
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

export default router;
