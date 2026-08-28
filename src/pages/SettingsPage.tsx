import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme, Theme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { Language } from '../locales/translations';
import {
  Shield,
  Sliders,
  Check,
  KeyRound,
  ShieldCheck,
  History,
  LogOut,
  ChevronRight,
  X,
  Eye,
  EyeOff,
  Sun,
  Moon,
  AlertTriangle,
  Info,
} from 'lucide-react';

interface SettingsPageProps {
  onShowToast?: (type: 'success' | 'error' | 'warning' | 'info', msg: string) => void;
}

interface DonorSettingsState {
  // Account & Security
  twoFactorEnabled: boolean;

  // General
  language: Language;
  appearance: Theme;
  locationServices: boolean;
}

const DEFAULT_SETTINGS: DonorSettingsState = {
  twoFactorEnabled: false,
  language: 'en',
  appearance: 'light',
  locationServices: true,
};

export const SettingsPage: React.FC<SettingsPageProps> = ({ onShowToast }) => {
  const { logout, user } = useAuth();
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();

  // Load saved settings from localStorage or defaults
  const [savedSettings, setSavedSettings] = useState<DonorSettingsState>(() => {
    try {
      const stored = localStorage.getItem('zeroplate_donor_settings');
      if (stored) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
      }
    } catch (e) {
      console.warn('Could not parse saved settings', e);
    }
    return {
      ...DEFAULT_SETTINGS,
      appearance: theme,
      language: language,
    };
  });

  // Working state (allows cancel / revert)
  const [settings, setSettings] = useState<DonorSettingsState>({
    ...savedSettings,
    appearance: theme,
    language: language,
  });
  const [isSaving, setIsSaving] = useState(false);

  // Modals state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Password Modal form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  // Keep settings appearance and language in sync with global context
  useEffect(() => {
    setSettings((prev) => ({
      ...prev,
      appearance: theme,
      language: language,
    }));
  }, [theme, language]);

  const handleToggle = (key: keyof DonorSettingsState) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleChange = <K extends keyof DonorSettingsState>(key: K, value: DonorSettingsState[K]) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));

    // Immediate global reaction for appearance and language
    if (key === 'appearance') {
      setTheme(value as Theme);
    } else if (key === 'language') {
      setLanguage(value as Language);
    }
  };

  const handleSaveChanges = () => {
    setIsSaving(true);
    setTimeout(() => {
      try {
        localStorage.setItem('zeroplate_donor_settings', JSON.stringify(settings));
        setSavedSettings(settings);
        setIsSaving(false);
        if (onShowToast) {
          onShowToast('success', t('settingsSavedToast'));
        }
      } catch (e) {
        setIsSaving(false);
        if (onShowToast) {
          onShowToast('error', 'Failed to save settings.');
        }
      }
    }, 350);
  };

  const handleCancelChanges = () => {
    setSettings(savedSettings);
    setTheme(savedSettings.appearance);
    setLanguage(savedSettings.language);
    if (onShowToast) {
      onShowToast('info', t('settingsRevertedToast'));
    }
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');

    if (!currentPassword) {
      setPasswordError('Please enter your current password.');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    setShowPasswordModal(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    if (onShowToast) {
      onShowToast('success', t('passwordUpdatedToast'));
    }
  };

  const hasUnsavedChanges = JSON.stringify(settings) !== JSON.stringify(savedSettings);

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12 animate-fadeIn text-brand-text dark:text-slate-100">
      {/* Page Header */}
      <div className="space-y-1 pb-2 border-b border-gray-100 dark:border-slate-800">
        <h1 className="text-2xl sm:text-3xl font-black text-brand-text dark:text-slate-100 tracking-tight">
          {t('settingsHeading')}
        </h1>
        <p className="text-xs sm:text-sm font-medium text-brand-muted dark:text-slate-400">
          {t('settingsSubtitle')}
        </p>
      </div>

      {/* Unsaved changes banner */}
      {hasUnsavedChanges && (
        <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-2xl p-4 flex items-center justify-between gap-3 shadow-warm-sm transition-all">
          <div className="flex items-center gap-2.5">
            <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <span className="text-xs font-bold text-amber-900 dark:text-amber-200">
              {t('unsavedNotice')}
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleCancelChanges}
              className="px-3 py-1.5 text-xs font-bold text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg transition-colors cursor-pointer"
            >
              {t('discard')}
            </button>
            <button
              onClick={handleSaveChanges}
              className="px-3.5 py-1.5 text-xs font-extrabold text-white bg-brand-orange hover:bg-brand-deep rounded-lg shadow-sm transition-all cursor-pointer"
            >
              {t('saveNow')}
            </button>
          </div>
        </div>
      )}

      {/* ==========================================
          SECTION 1: ACCOUNT & SECURITY
         ========================================== */}
      <section className="bg-white dark:bg-[#1E293B] rounded-3xl p-6 sm:p-8 border border-amber-900/5 dark:border-slate-800/80 shadow-warm-sm space-y-6 transition-colors">
        <div className="flex items-center gap-3 pb-4 border-b border-gray-100 dark:border-slate-800">
          <div className="w-10 h-10 rounded-2xl bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800/50 flex items-center justify-center text-brand-orange shadow-warm-sm">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-brand-text dark:text-slate-100">{t('accountSecurity')}</h2>
            <p className="text-xs text-brand-muted dark:text-slate-400 font-medium">{t('accountSecurityDesc')}</p>
          </div>
        </div>

        <div className="divide-y divide-gray-100 dark:divide-slate-800">
          {/* Change Password */}
          <button
            type="button"
            onClick={() => setShowPasswordModal(true)}
            className="w-full flex items-center justify-between py-3.5 text-left group hover:bg-orange-50/30 dark:hover:bg-slate-800/60 px-2 rounded-xl transition-all cursor-pointer"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 flex items-center justify-center group-hover:bg-orange-100 dark:group-hover:bg-orange-900/40 group-hover:text-brand-orange transition-colors">
                <KeyRound className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-bold text-brand-text dark:text-slate-100">{t('changePassword')}</p>
                <p className="text-xs text-brand-muted dark:text-slate-400 font-medium">{t('changePasswordDesc')}</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-brand-orange group-hover:translate-x-0.5 transition-all" />
          </button>

          {/* Two-Factor Authentication */}
          <div className="flex items-center justify-between py-3.5 px-2">
            <div className="flex items-center gap-3.5 min-w-0 flex-1">
              <div className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-bold text-brand-text dark:text-slate-100">{t('twoFactorAuth')}</p>
                <p className="text-xs text-brand-muted dark:text-slate-400 font-medium">{t('twoFactorAuthDesc')}</p>
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={settings.twoFactorEnabled}
              onClick={() => {
                const nextState = !settings.twoFactorEnabled;
                handleToggle('twoFactorEnabled');
                if (onShowToast) {
                  onShowToast(
                    nextState ? 'success' : 'info',
                    nextState ? t('twoFactorEnabledToast') : t('twoFactorDisabledToast')
                  );
                }
              }}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand-orange focus:ring-offset-2 ${
                settings.twoFactorEnabled ? 'bg-brand-orange' : 'bg-gray-200 dark:bg-slate-700'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                  settings.twoFactorEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Login Activity */}
          <button
            type="button"
            onClick={() => setShowActivityModal(true)}
            className="w-full flex items-center justify-between py-3.5 text-left group hover:bg-orange-50/30 dark:hover:bg-slate-800/60 px-2 rounded-xl transition-all cursor-pointer"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 flex items-center justify-center group-hover:bg-orange-100 dark:group-hover:bg-orange-900/40 group-hover:text-brand-orange transition-colors">
                <History className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-bold text-brand-text dark:text-slate-100">{t('loginActivity')}</p>
                <p className="text-xs text-brand-muted dark:text-slate-400 font-medium">{t('loginActivityDesc')}</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-brand-orange group-hover:translate-x-0.5 transition-all" />
          </button>

          {/* Log Out */}
          <button
            type="button"
            onClick={() => setShowLogoutModal(true)}
            className="w-full flex items-center justify-between py-3.5 text-left group hover:bg-red-50/40 dark:hover:bg-red-950/20 px-2 rounded-xl transition-all cursor-pointer"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-8 h-8 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center justify-center group-hover:bg-red-100 dark:group-hover:bg-red-900/40 transition-colors">
                <LogOut className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-bold text-red-600 dark:text-red-400">{t('logOutAction')}</p>
                <p className="text-xs text-brand-muted dark:text-slate-400 font-medium">{t('logOutDesc')}</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-red-400 group-hover:text-red-600 group-hover:translate-x-0.5 transition-all" />
          </button>
        </div>
      </section>

      {/* ==========================================
          SECTION 2: GENERAL
         ========================================== */}
      <section className="bg-white dark:bg-[#1E293B] rounded-3xl p-6 sm:p-8 border border-amber-900/5 dark:border-slate-800/80 shadow-warm-sm space-y-6 transition-colors">
        <div className="flex items-center gap-3 pb-4 border-b border-gray-100 dark:border-slate-800">
          <div className="w-10 h-10 rounded-2xl bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800/50 flex items-center justify-center text-brand-orange shadow-warm-sm">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-brand-text dark:text-slate-100">{t('general')}</h2>
            <p className="text-xs text-brand-muted dark:text-slate-400 font-medium">{t('generalDesc')}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Language Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-brand-text dark:text-slate-200">{t('language')}</label>
            <select
              value={settings.language}
              onChange={(e) => handleChange('language', e.target.value as Language)}
              className="w-full px-3.5 py-2.5 bg-brand-cream dark:bg-[#0F172A] border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-brand-text dark:text-slate-100 focus:outline-none focus:border-brand-orange focus:ring-2 focus:ring-orange-100 dark:focus:ring-orange-900/30 transition-all cursor-pointer"
            >
              <option value="en">English</option>
              <option value="hi">Hindi (हिन्दी)</option>
              <option value="mr">Marathi (मराठी)</option>
            </select>
          </div>

          {/* Appearance Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-brand-text dark:text-slate-200">{t('appearance')}</label>
            <div className="grid grid-cols-2 gap-2.5">
              {[
                { id: 'light' as Theme, label: t('lightMode'), icon: Sun },
                { id: 'dark' as Theme, label: t('darkMode'), icon: Moon },
              ].map((item) => {
                const Icon = item.icon;
                const isSelected = settings.appearance === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleChange('appearance', item.id)}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      isSelected
                        ? 'border-brand-orange bg-orange-50 dark:bg-orange-950/40 text-brand-orange shadow-sm font-extrabold ring-1 ring-brand-orange'
                        : 'border-gray-200 dark:border-slate-700 text-brand-muted dark:text-slate-400 hover:border-gray-300 dark:hover:border-slate-600 bg-white dark:bg-slate-800'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Location Services */}
        <div className="divide-y divide-gray-100 dark:divide-slate-800 pt-2 border-t border-gray-100 dark:border-slate-800">
          <div className="flex items-start justify-between gap-4 py-3.5">
            <div className="space-y-0.5 min-w-0 flex-1">
              <label htmlFor="toggle-location" className="text-sm font-bold text-brand-text dark:text-slate-100 cursor-pointer select-none">
                {t('locationServices')}
              </label>
              <p className="text-xs text-brand-muted dark:text-slate-400 leading-relaxed">
                {t('locationServicesDesc')}
              </p>
            </div>
            <button
              type="button"
              id="toggle-location"
              role="switch"
              aria-checked={settings.locationServices}
              onClick={() => handleToggle('locationServices')}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand-orange focus:ring-offset-2 ${
                settings.locationServices ? 'bg-brand-orange' : 'bg-gray-200 dark:bg-slate-700'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                  settings.locationServices ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </section>

      {/* ==========================================
          BOTTOM ACTION BAR
         ========================================== */}
      <div className="pt-2 flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={handleCancelChanges}
          disabled={!hasUnsavedChanges || isSaving}
          className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all ${
            hasUnsavedChanges
              ? 'text-gray-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 shadow-sm cursor-pointer'
              : 'text-gray-400 dark:text-slate-600 bg-gray-100 dark:bg-slate-800/40 border border-gray-200 dark:border-slate-800 cursor-not-allowed'
          }`}
        >
          {t('cancel')}
        </button>
        <button
          type="button"
          onClick={handleSaveChanges}
          disabled={isSaving}
          className="px-6 py-2.5 bg-brand-orange hover:bg-brand-deep text-white font-extrabold text-xs rounded-xl shadow-warm-sm hover:shadow-warm-md transition-all flex items-center gap-2 active:scale-95 cursor-pointer disabled:opacity-75"
        >
          {isSaving ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>{t('saving')}</span>
            </>
          ) : (
            <>
              <Check className="w-4 h-4" />
              <span>{t('saveChanges')}</span>
            </>
          )}
        </button>
      </div>

      {/* ==========================================
          MODAL 1: CHANGE PASSWORD
         ========================================== */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-warm-lg border border-amber-900/10 dark:border-slate-800 space-y-5 animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-orange-50 dark:bg-orange-950/40 text-brand-orange rounded-xl">
                  <KeyRound className="w-4 h-4" />
                </div>
                <h3 className="text-lg font-black text-brand-text dark:text-slate-100">{t('changePassword')}</h3>
              </div>
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setPasswordError('');
                }}
                className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-slate-200 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              {passwordError && (
                <div className="p-3 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 text-xs font-semibold rounded-xl border border-red-200 dark:border-red-800 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-red-500" />
                  <span>{passwordError}</span>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-bold text-brand-text dark:text-slate-200">{t('currentPassword')}</label>
                <div className="relative">
                  <input
                    type={showCurrentPw ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    className="w-full px-3.5 py-2.5 pr-10 bg-brand-cream dark:bg-[#0F172A] border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-brand-text dark:text-slate-100 focus:outline-none focus:border-brand-orange focus:ring-2 focus:ring-orange-100 dark:focus:ring-orange-900/30"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPw(!showCurrentPw)}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 cursor-pointer"
                  >
                    {showCurrentPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-brand-text dark:text-slate-200">{t('newPassword')}</label>
                <div className="relative">
                  <input
                    type={showNewPw ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full px-3.5 py-2.5 pr-10 bg-brand-cream dark:bg-[#0F172A] border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-brand-text dark:text-slate-100 focus:outline-none focus:border-brand-orange focus:ring-2 focus:ring-orange-100 dark:focus:ring-orange-900/30"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPw(!showNewPw)}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 cursor-pointer"
                  >
                    {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-brand-text dark:text-slate-200">{t('confirmNewPassword')}</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className="w-full px-3.5 py-2.5 bg-brand-cream dark:bg-[#0F172A] border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-brand-text dark:text-slate-100 focus:outline-none focus:border-brand-orange focus:ring-2 focus:ring-orange-100 dark:focus:ring-orange-900/30"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="px-4 py-2 text-xs font-bold text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-brand-orange hover:bg-brand-deep text-white font-extrabold text-xs rounded-xl shadow-warm-sm cursor-pointer"
                >
                  {t('updatePassword')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==========================================
          MODAL 2: LOGIN ACTIVITY
         ========================================== */}
      {showActivityModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-warm-lg border border-amber-900/10 dark:border-slate-800 space-y-5 animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-orange-50 dark:bg-orange-950/40 text-brand-orange rounded-xl">
                  <History className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-brand-text dark:text-slate-100">{t('recentLoginActivity')}</h3>
                  <p className="text-[11px] text-brand-muted dark:text-slate-400">Authenticated sessions for {user?.email}</p>
                </div>
              </div>
              <button
                onClick={() => setShowActivityModal(false)}
                className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-slate-200 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              {[
                {
                  device: 'Chrome on Windows 11',
                  location: 'Mumbai, Maharashtra, India',
                  ip: '103.21.124.89',
                  time: t('activeNow'),
                  isCurrent: true,
                },
                {
                  device: 'Mobile Safari on iOS 17',
                  location: 'Mumbai, Maharashtra, India',
                  ip: '103.21.124.92',
                  time: 'Yesterday at 8:42 PM',
                  isCurrent: false,
                },
                {
                  device: 'Chrome on MacOS (Staff Dispatch)',
                  location: 'Pune, Maharashtra, India',
                  ip: '49.36.18.22',
                  time: '3 days ago',
                  isCurrent: false,
                },
              ].map((sess, idx) => (
                <div
                  key={idx}
                  className={`p-3.5 rounded-2xl border flex items-center justify-between ${
                    sess.isCurrent
                      ? 'bg-emerald-50/40 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/60'
                      : 'bg-gray-50 dark:bg-slate-800/60 border-gray-200 dark:border-slate-700'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-brand-text dark:text-slate-100">{sess.device}</span>
                      {sess.isCurrent && (
                        <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 text-[10px] font-black rounded-full">
                          {t('currentSession')}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-brand-muted dark:text-slate-400 font-medium">
                      {sess.location} • {sess.ip}
                    </p>
                  </div>
                  <span className="text-[11px] font-semibold text-gray-500 dark:text-slate-400">{sess.time}</span>
                </div>
              ))}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setShowActivityModal(false)}
                className="px-5 py-2 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-brand-text dark:text-slate-200 font-bold text-xs rounded-xl cursor-pointer"
              >
                {t('close')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          MODAL 3: LOGOUT CONFIRMATION
         ========================================== */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-warm-lg border border-red-100 dark:border-red-950 space-y-5 animate-scaleUp text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 mx-auto flex items-center justify-center">
              <LogOut className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-black text-brand-text dark:text-slate-100">{t('signOutConfirmHeading')}</h3>
              <p className="text-xs text-brand-muted dark:text-slate-400">
                {t('signOutConfirmText')} ({user?.name || 'SpiceVilla Restaurant'})
              </p>
            </div>

            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 py-2.5 px-4 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-brand-text dark:text-slate-200 font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                {t('cancel')}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowLogoutModal(false);
                  logout();
                }}
                className="flex-1 py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs rounded-xl shadow-warm-sm transition-all cursor-pointer"
              >
                {t('yesSignOut')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
