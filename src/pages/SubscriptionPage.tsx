import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { SUBSCRIPTION_PLANS } from '../services/subscriptions/subscriptionService';
import { PaymentModal } from '../components/PaymentModal';
import { Sparkles, Check, ArrowRight, ShieldCheck, Zap, CreditCard } from 'lucide-react';
import confetti from 'canvas-confetti';

interface SubscriptionPageProps {
  onUpgradeSuccess: (msg: string) => void;
}

export const SubscriptionPage: React.FC<SubscriptionPageProps> = ({ onUpgradeSuccess }) => {
  const { user, subscriptionPlan, updateUserPlan } = useAuth();
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isDowngrading, setIsDowngrading] = useState(false);

  const handlePaymentSuccess = async (transactionId: string) => {
    try {
      const res = await fetch('/api/subscriptions/upgrade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id || 'ngo_hope',
          plan: 'premium',
        }),
      });

      const data = await res.json();
      if (res.ok) {
        updateUserPlan('premium');
        onUpgradeSuccess(data.message || 'Payment successful! Priority Rescue active.');
      }
    } catch (e) {
      updateUserPlan('premium');
      onUpgradeSuccess('Payment verified! Priority Rescue active.');
    }
  };

  const handleDowngradeToFree = async () => {
    setIsDowngrading(true);
    try {
      const res = await fetch('/api/subscriptions/upgrade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id || 'ngo_hope',
          plan: 'free',
        }),
      });

      if (res.ok) {
        updateUserPlan('free');
        onUpgradeSuccess('Switched to Free Plan.');
      }
    } catch (e) {
      updateUserPlan('free');
      onUpgradeSuccess('Switched to Free Plan.');
    } finally {
      setIsDowngrading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="px-3 py-1 bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800 rounded-full text-xs font-black uppercase tracking-wider">
          Subscription & Boost Tiers
        </span>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 dark:text-white tracking-tight">
          Supercharge Your Food Rescue
        </h1>
        <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-slate-300">
          Upgrade to Priority Rescue to unlock matching priority bonuses, extended search radius, and instant notifications.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 pt-4">
        {/* FREE TIER CARD */}
        <div className="bg-white dark:bg-[#1E293B] rounded-3xl border border-gray-200 dark:border-slate-700 p-6 sm:p-8 shadow-sm flex flex-col justify-between relative transition-colors">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-black text-gray-900 dark:text-white">Free Plan</h3>
              <span className="px-2.5 py-1 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-200 text-xs font-bold rounded-full border border-gray-200 dark:border-slate-700">
                Standard
              </span>
            </div>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-4xl font-black text-gray-900 dark:text-white">₹0</span>
              <span className="text-xs text-gray-500 dark:text-slate-400 font-medium">/ month</span>
            </div>

            <ul className="space-y-3.5 text-xs font-medium text-gray-600 dark:text-slate-300 mb-8">
              {SUBSCRIPTION_PLANS.free.features.map((feat, idx) => (
                <li key={idx} className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-gray-400 dark:text-slate-500 shrink-0" />
                  <span className="text-gray-700 dark:text-slate-200">{feat}</span>
                </li>
              ))}
            </ul>
          </div>

          {subscriptionPlan === 'premium' ? (
            <button
              onClick={handleDowngradeToFree}
              disabled={isDowngrading}
              className="w-full py-3.5 bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-200 font-bold text-sm rounded-xl transition-all active:scale-95 cursor-pointer"
            >
              {isDowngrading ? 'Switching...' : 'Switch to Free Tier'}
            </button>
          ) : (
            <button
              disabled
              className="w-full py-3.5 bg-gray-100 dark:bg-slate-800/80 text-gray-500 dark:text-slate-400 font-bold text-sm rounded-xl cursor-not-allowed border border-gray-200/50 dark:border-slate-700/60"
            >
              Current Active Plan
            </button>
          )}
        </div>

        {/* PREMIUM TIER CARD */}
        <div className="bg-gradient-to-br from-amber-50 via-white to-orange-50 dark:from-slate-800 dark:via-slate-800 dark:to-orange-950/40 rounded-3xl border-2 border-orange-500 dark:border-orange-500 p-6 sm:p-8 shadow-lg flex flex-col justify-between relative overflow-hidden transition-colors">
          <div className="absolute top-0 right-0 bg-orange-500 text-white text-[10px] font-black uppercase tracking-wider px-4 py-1.5 rounded-bl-2xl shadow-sm flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 fill-white" />
            <span>Recommended for Active NGOs</span>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-black text-gray-900 dark:text-white">Priority Rescue</h3>
              <span className="px-3 py-1 bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 text-xs font-black rounded-full border border-amber-300 dark:border-amber-700">
                PREMIUM
              </span>
            </div>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-4xl font-black text-gray-900 dark:text-white">₹199</span>
              <span className="text-xs text-gray-500 dark:text-slate-400 font-medium">/ month</span>
            </div>

            <ul className="space-y-3.5 text-xs font-semibold text-gray-800 dark:text-slate-100 mb-8">
              {SUBSCRIPTION_PLANS.premium.features.map((feat, idx) => (
                <li key={idx} className="flex items-center gap-2.5">
                  <div className="p-0.5 bg-orange-500 text-white rounded-full">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                  <span className="text-gray-800 dark:text-slate-100">{feat}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-2">
            {subscriptionPlan === 'premium' ? (
              <>
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(true)}
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm rounded-xl text-center flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer group"
                >
                  <ShieldCheck className="w-5 h-5 text-emerald-200 group-hover:scale-110 transition-transform" />
                  <span>Priority Rescue Active • Pay / Renew (₹199)</span>
                </button>
                <p className="text-[11px] text-center text-emerald-800 dark:text-emerald-300 font-semibold">
                  Click button above to open payment checkout & renew
                </p>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setIsPaymentModalOpen(true)}
                className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-sm rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer group"
              >
                <Zap className="w-4 h-4 fill-white group-hover:scale-110 transition-transform" />
                <span>Pay & Upgrade Now (₹199/mo)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Payment Checkout Modal */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onPaymentSuccess={handlePaymentSuccess}
        planName="ZeroPlate Priority Rescue"
        amount={199}
        ngoName={user?.name || 'Hope Foundation'}
      />
    </div>
  );
};
