import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { SUBSCRIPTION_PLANS } from '../services/subscriptions/subscriptionService';
import { Sparkles, Check, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import confetti from 'canvas-confetti';

interface SubscriptionPageProps {
  onUpgradeSuccess: (msg: string) => void;
}

export const SubscriptionPage: React.FC<SubscriptionPageProps> = ({ onUpgradeSuccess }) => {
  const { user, subscriptionPlan, updateUserPlan } = useAuth();
  const [isUpgrading, setIsUpgrading] = useState(false);

  const handleUpgrade = async () => {
    setIsUpgrading(true);
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
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.5 },
          colors: ['#F97316', '#F59E0B', '#10B981'],
        });
        onUpgradeSuccess(data.message || 'Plan upgraded to Priority Rescue!');
      } else {
        alert(data.error || 'Upgrade failed.');
      }
    } catch (e) {
      alert('Upgrade error.');
    } finally {
      setIsUpgrading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="px-3 py-1 bg-brand-light text-brand-deep rounded-full text-xs font-black uppercase tracking-wider">
          Subscription & Boost Tiers
        </span>
        <h1 className="text-3xl font-black text-brand-text">Supercharge Your Food Rescue</h1>
        <p className="text-sm font-medium text-brand-muted">
          Upgrade to Priority Rescue to unlock matching priority bonuses, extended search radius, and instant notifications.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
        {/* FREE TIER CARD */}
        <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-warm-sm flex flex-col justify-between relative">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-brand-text">Free Plan</h3>
              <span className="px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-bold rounded-full">
                Standard
              </span>
            </div>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-4xl font-black text-brand-text">₹0</span>
              <span className="text-xs text-brand-muted font-medium">/ month</span>
            </div>

            <ul className="space-y-3 text-xs font-medium text-brand-muted mb-8">
              {SUBSCRIPTION_PLANS.free.features.map((feat, idx) => (
                <li key={idx} className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-gray-400 shrink-0" />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </div>

          <button
            disabled
            className="w-full py-3 bg-gray-100 text-gray-400 font-bold text-sm rounded-xl cursor-not-allowed"
          >
            {subscriptionPlan === 'free' ? 'Current Active Plan' : 'Free Tier'}
          </button>
        </div>

        {/* PREMIUM TIER CARD */}
        <div className="bg-gradient-to-br from-amber-50 via-white to-orange-50 rounded-3xl border-2 border-brand-orange p-8 shadow-warm-lg flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-brand-orange text-white text-[10px] font-black uppercase tracking-wider px-4 py-1.5 rounded-bl-2xl shadow-sm flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 fill-white" />
            <span>Recommended for Active NGOs</span>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-black text-brand-text">Priority Rescue</h3>
              <span className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-black rounded-full border border-amber-300">
                PREMIUM
              </span>
            </div>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-4xl font-black text-brand-text">₹199</span>
              <span className="text-xs text-brand-muted font-medium">/ month</span>
            </div>

            <ul className="space-y-3.5 text-xs font-semibold text-brand-text mb-8">
              {SUBSCRIPTION_PLANS.premium.features.map((feat, idx) => (
                <li key={idx} className="flex items-center gap-2.5">
                  <div className="p-0.5 bg-brand-orange text-white rounded-full">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </div>

          {subscriptionPlan === 'premium' ? (
            <div className="w-full py-3 bg-emerald-600 text-white font-extrabold text-sm rounded-xl text-center flex items-center justify-center gap-2 shadow-warm-sm">
              <ShieldCheck className="w-5 h-5" />
              <span>Priority Rescue Active</span>
            </div>
          ) : (
            <button
              onClick={handleUpgrade}
              disabled={isUpgrading}
              className="w-full py-3.5 bg-brand-orange hover:bg-brand-deep text-white font-black text-sm rounded-xl shadow-warm-md hover:shadow-warm-lg transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <Zap className="w-4 h-4 fill-white" />
              <span>{isUpgrading ? 'Processing Upgrade...' : 'Upgrade Now (₹199/mo)'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
