import React from 'react';
import { useAuth } from '../context/AuthContext';
import { UtensilsCrossed, Sparkles } from 'lucide-react';

interface NavbarProps {
  onToggleSidebar?: () => void;
  activeView: string;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar, activeView }) => {
  const { user, role, subscriptionPlan } = useAuth();

  return (
    <header className="bg-white border-b border-amber-900/5 sticky top-0 z-30 shadow-warm-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo & Mobile Toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="md:hidden p-2 text-brand-muted hover:text-brand-text rounded-lg"
          >
            <span className="sr-only">Toggle Sidebar</span>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-brand-orange text-white rounded-xl shadow-warm-sm font-extrabold flex items-center justify-center">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight text-brand-text">ZeroPlate</span>
              <span className="hidden sm:inline-block ml-2 text-xs font-semibold text-brand-orange bg-brand-light px-2 py-0.5 rounded-full border border-orange-200">
                Share Food, Share Hope
              </span>
            </div>
          </div>
        </div>

        {/* Header Right Controls */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Subscription Plan Badge */}
          {subscriptionPlan === 'premium' ? (
            <span className="hidden sm:flex items-center gap-1 text-xs font-extrabold bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-1 rounded-full shadow-warm-sm">
              <Sparkles className="w-3.5 h-3.5 fill-white" />
              Priority Matching
            </span>
          ) : (
            <span className="hidden sm:inline-block text-xs font-semibold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full border">
              Standard Plan
            </span>
          )}

          {/* User Profile Pill (Fixed Role, No Switcher) */}
          <div className="flex items-center gap-2 pl-2 border-l border-gray-200">
            <div className="w-8 h-8 rounded-full bg-brand-light text-brand-deep font-bold flex items-center justify-center text-sm border border-orange-200 shadow-warm-sm">
              {user?.name ? user.name.charAt(0) : 'U'}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-xs font-bold text-brand-text truncate max-w-[140px]">{user?.name}</p>
              <p className="text-[10px] font-bold text-brand-orange uppercase">
                {role === 'donor' ? 'Food Donor' : 'NGO Manager'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
