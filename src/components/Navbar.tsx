import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { UtensilsCrossed, Sparkles } from 'lucide-react';

interface NavbarProps {
  onToggleSidebar?: () => void;
  activeView: string;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const { user, role, switchRole, subscriptionPlan } = useAuth();
  const { t } = useLanguage();

  return (
    <header className="bg-white dark:bg-[#1E293B] border-b border-amber-900/5 dark:border-slate-800/80 sticky top-0 z-30 shadow-warm-sm transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo & Mobile Toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="md:hidden p-2 text-brand-muted dark:text-slate-400 hover:text-brand-text dark:hover:text-slate-100 rounded-lg"
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
              <span className="text-xl font-extrabold tracking-tight text-brand-text dark:text-slate-100">ZeroPlate</span>
              <span className="hidden sm:inline-block ml-2 text-xs font-semibold text-brand-orange dark:text-orange-400 bg-brand-light dark:bg-orange-950/40 px-2 py-0.5 rounded-full border border-orange-200 dark:border-orange-800/60">
                {t('appTagline')}
              </span>
            </div>
          </div>
        </div>

        {/* Header Right Controls */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Demo Role Switcher Pill */}
          <div className="bg-brand-cream dark:bg-[#0F172A] border border-orange-200 dark:border-slate-700 rounded-full p-1 flex items-center shadow-warm-sm">
            <button
              onClick={() => switchRole('donor')}
              className={`px-3 py-1 text-xs font-bold rounded-full transition-all ${
                role === 'donor'
                  ? 'bg-brand-orange text-white shadow-sm'
                  : 'text-brand-muted dark:text-slate-400 hover:text-brand-text dark:hover:text-slate-100'
              }`}
            >
              {t('donorView')}
            </button>
            <button
              onClick={() => switchRole('ngo')}
              className={`px-3 py-1 text-xs font-bold rounded-full transition-all ${
                role === 'ngo'
                  ? 'bg-brand-orange text-white shadow-sm'
                  : 'text-brand-muted dark:text-slate-400 hover:text-brand-text dark:hover:text-slate-100'
              }`}
            >
              {t('ngoView')}
            </button>
          </div>

          {/* Subscription Plan Badge (NGO Only) */}
          {role === 'ngo' && (
            subscriptionPlan === 'premium' ? (
              <span className="hidden lg:flex items-center gap-1 text-xs font-extrabold bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-1 rounded-full shadow-warm-sm">
                <Sparkles className="w-3.5 h-3.5 fill-white" />
                {t('priorityPlan')}
              </span>
            ) : (
              <span className="hidden lg:inline-block text-xs font-semibold text-gray-500 dark:text-slate-400 bg-gray-100 dark:bg-slate-800 px-2.5 py-1 rounded-full border dark:border-slate-700">
                {t('freeTier')}
              </span>
            )
          )}

          {/* User Profile Pill */}
          <div className="flex items-center gap-2 pl-2 border-l border-gray-200 dark:border-slate-700">
            <div className="w-8 h-8 rounded-full bg-brand-light dark:bg-orange-950/50 text-brand-deep dark:text-orange-400 font-bold flex items-center justify-center text-sm border border-orange-200 dark:border-orange-800/60 shadow-warm-sm">
              {user?.name ? user.name.charAt(0) : 'U'}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-xs font-bold text-brand-text dark:text-slate-100 truncate max-w-[130px]">{user?.name}</p>
              <p className="text-[10px] font-semibold text-brand-orange dark:text-orange-400 uppercase">{role === 'donor' ? t('donorView') : t('ngoView')}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
