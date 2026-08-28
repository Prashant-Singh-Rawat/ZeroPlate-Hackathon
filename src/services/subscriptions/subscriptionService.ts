import { SubscriptionPlan } from '../../types';

export interface PlanFeature {
  name: string;
  free: string;
  premium: string;
}

export const SUBSCRIPTION_PLANS: Record<SubscriptionPlan, { name: string; price: string; features: string[] }> = {
  free: {
    name: 'Free Plan',
    price: '₹0/mo',
    features: [
      'Standard matching score ranking',
      'Standard search radius (up to 15km)',
      'Up to 3 active listings/requests',
      'Standard in-app notifications',
      'Basic community support',
    ],
  },
  premium: {
    name: 'Priority rescue',
    price: '₹199/mo',
    features: [
      'Priority Matching (+6 score bonus boost)',
      'Extended search radius (up to 50km)',
      'Unlimited active listings & requests',
      'Instant SMS & email pickup alerts',
      'Priority support & verified badge',
    ],
  },
};

export interface PaymentGatewayProvider {
  processCharge(amountInInr: number, currency: string): Promise<{ success: boolean; transactionId: string }>;
}

class MockPaymentGateway implements PaymentGatewayProvider {
  async processCharge(amountInInr: number, currency: string) {
    // Simulated instant payment success
    return {
      success: true,
      transactionId: `txn_mock_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
    };
  }
}

export class SubscriptionService {
  private paymentGateway: PaymentGatewayProvider;

  constructor(gateway?: PaymentGatewayProvider) {
    this.paymentGateway = gateway || new MockPaymentGateway();
  }

  async upgradeUserPlan(userId: string, targetPlan: SubscriptionPlan = 'premium'): Promise<{ success: boolean; transactionId?: string; error?: string }> {
    try {
      if (targetPlan === 'free') {
        return { success: true };
      }
      // Charge process isolated behind paymentGateway interface
      const paymentResult = await this.paymentGateway.processCharge(199, 'INR');
      if (!paymentResult.success) {
        return { success: false, error: 'Payment processing failed' };
      }
      return {
        success: true,
        transactionId: paymentResult.transactionId,
      };
    } catch (err: any) {
      return { success: false, error: err.message || 'Upgrade failed' };
    }
  }
}

export const subscriptionService = new SubscriptionService();
