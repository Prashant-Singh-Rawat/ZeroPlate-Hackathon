import { Router } from 'express';
import { db } from '../db';
import { subscriptionService } from '../../src/services/subscriptions/subscriptionService';

const router = Router();

// POST /api/subscriptions/upgrade
router.post('/upgrade', async (req, res) => {
  const { userId, plan } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'userId is required.' });
  }

  const targetPlan = plan || 'premium';

  // Call payment service abstraction
  const upgradeResult = await subscriptionService.upgradeUserPlan(userId, targetPlan);

  if (!upgradeResult.success) {
    return res.status(400).json({ error: upgradeResult.error });
  }

  // Update DB user record and associated NGO priority flag
  db.updateUserPlan(userId, targetPlan);

  return res.json({
    message: `Plan successfully upgraded to ${targetPlan.toUpperCase()}!`,
    plan: targetPlan,
    transactionId: upgradeResult.transactionId,
  });
});

export default router;
