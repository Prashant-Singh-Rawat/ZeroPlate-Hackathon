import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useThemeLanguage } from '../context/ThemeLanguageContext';
import { UserSettings } from '../types';
import { getSettings, saveSettings } from '../services/settings/settingsService';
import { Language } from '../services/i18n/translations';
import {
  Shield,
  Key,
  LogOut,
  Sliders,
  Sun,
  Moon,
  ChevronRight,
  Check,
  X,
  Lock,
  AlertCircle,
} from 'lucide-react';

interface SettingsPageProps {
  onShowToast: (type: 'success' | 'error' | 'warning' | 'info', msg: string) => void;
  onNavigate?: (tab: string) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ onShowToast, onNavigate }) => {
  const { user, role, logout } = useAuth();
  const { theme, language: currentGlobalLang, setTheme, setLanguage: setGlobalLanguage, t } = useThemeLanguage();

  // Load initial settings
  const [savedSettings, setSavedSettings] = useState<UserSettings>(() =>
    getSettings(user?.id || 'default_user', role, user?.location)
  );

  // Form state
  const [language, setLanguage] = useState<Language>(
    (savedSettings.general.language as Language) || currentGlobalLang || 'English'
  );
  const [appearance, setAppearance] = useState<'light' | 'dark'>(
    savedSettings.general.appearance || theme || 'light'
  );
  const [locationServices, setLocationServices] = useState(
    savedSettings.general.locationServices !== undefined ? savedSettings.general.locationServices : true
  );

  // Modals state
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  // Password form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Sync when user or role changes
  useEffect(() => {
    if (user) {
      const current = getSettings(user.id, role, user.location);
      setSavedSettings(current);
      const userLang = (current.general.language as Language) || 'English';
      setLanguage(userLang);
      setGlobalLanguage(userLang);
      const userTheme = current.general.appearance || 'light';
      setAppearance(userTheme);
      setTheme(userTheme);
      setLocationServices(current.general.locationServices !== undefined ? current.general.locationServices : true);
    }
  }, [user?.id, role]);

  const handleAppearanceToggle = (mode: 'light' | 'dark') => {
    setAppearance(mode);
    setTheme(mode); // Immediately triggers documentElement dark class
  };

  const handleLanguageChange = (newLang: Language) => {
    setLanguage(newLang);
    setGlobalLanguage(newLang); // Immediately updates translations across the app
  };

  const handleCancel = () => {
    // Revert to saved settings
    const origTheme = savedSettings.general.appearance || 'light';
    const origLang = (savedSettings.general.language as Language) || 'English';
    setLanguage(origLang);
    setGlobalLanguage(origLang);
    setAppearance(origTheme);
    setTheme(origTheme);
    setLocationServices(savedSettings.general.locationServices !== undefined ? savedSettings.general.locationServices : true);
    onShowToast('info', t('settings.reverted', 'Changes reverted.'));
    if (onNavigate) {
      onNavigate('dashboard');
    }
  };

  const handleSave = () => {
    try {
      const updated: UserSettings = {
        ...savedSettings,
        general: {
          ...savedSettings.general,
          language,
          appearance,
          locationServices,
        },
        updatedAt: new Date().toISOString(),
      };

      saveSettings(updated);
      setSavedSettings(updated);
      setTheme(appearance);
      setGlobalLanguage(language);
      onShowToast('success', t('settings.savedSuccess', 'Settings saved successfully!'));
    } catch (e) {
      onShowToast('error', 'Failed to save settings.');
    }
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);

    if (!currentPassword) {
      setPasswordError('Please enter your current password.');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    // Success (demo mode, plaintext is not stored)
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setIsPasswordModalOpen(false);
    onShowToast('success', 'Password updated successfully (Demo Mode).');
  };

  const handleLogoutClick = () => {
    if (window.confirm('Are you sure you want to sign out of your account?')) {
      logout();
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16 pt-2">
      {/* 1. Account & Security Card */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-warm-sm overflow-hidden p-6 sm:p-7 space-y-6">
        {/* Card Header */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-orange-50/80 border border-orange-200/60 text-brand-orange rounded-2xl shrink-0">
            <Shield className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-brand-text">
              {t('settings.accountSecurity', 'Account & Security')}
            </h2>
            <p className="text-xs text-brand-muted mt-0.5">
              {t('settings.accountSecuritySubtitle', 'Manage credentials, authentication, and active sessions.')}
            </p>
          </div>
        </div>

        {/* List of Security Rows */}
        <div className="space-y-2">
          {/* Row 1: Change Password */}
          <div
            onClick={() => setIsPasswordModalOpen(true)}
            className="p-4 rounded-2xl hover:bg-gray-50/80 transition-all flex items-center justify-between cursor-pointer group"
          >
            <div className="flex items-center gap-3.5">
              <div className="p-2 bg-gray-100 text-gray-600 rounded-xl group-hover:bg-orange-100 group-hover:text-brand-orange transition-colors">
                <Key className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-brand-text">
                  {t('settings.changePassword', 'Change Password')}
                </h3>
                <p className="text-xs text-brand-muted">
                  {t('settings.changePasswordSubtitle', 'Update your account password')}
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-brand-orange group-hover:translate-x-0.5 transition-all" />
          </div>

          {/* Row 2: Log Out */}
          <div
            onClick={handleLogoutClick}
            className="p-4 rounded-2xl hover:bg-red-50/50 transition-all flex items-center justify-between cursor-pointer group"
          >
            <div className="flex items-center gap-3.5">
              <div className="p-2 bg-red-50 text-red-600 rounded-xl group-hover:bg-red-100 transition-colors">
                <LogOut className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-red-600">
                  {t('settings.logoutAccount', 'Log Out')}
                </h3>
                <p className="text-xs text-brand-muted">
                  {t('settings.logoutAccountSubtitle', 'Sign out of this account')}
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-red-400 group-hover:translate-x-0.5 transition-all" />
          </div>
        </div>
      </div>

      {/* 2. General Card */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-warm-sm overflow-hidden p-6 sm:p-7 space-y-6">
        {/* Card Header */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-orange-50/80 border border-orange-200/60 text-brand-orange rounded-2xl shrink-0">
            <Sliders className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-brand-text">
              {t('settings.general', 'General')}
            </h2>
            <p className="text-xs text-brand-muted mt-0.5">
              {t('settings.generalSubtitle', 'System localization, display, and device telemetry.')}
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="space-y-6 pt-1">
          {/* Row: Language & Appearance */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Language */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-brand-text">
                {t('settings.language', 'Language')}
              </label>
              <div className="relative">
                <select
                  value={language}
                  onChange={(e) => handleLanguageChange(e.target.value as Language)}
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-brand-text focus:outline-none focus:border-brand-orange appearance-none pr-8 cursor-pointer shadow-sm"
                >
                  <option value="English">English</option>
                  <option value="Hindi">Hindi (हिन्दी)</option>
                  <option value="Marathi">Marathi (मराठी)</option>
                </select>
                <div className="absolute right-3 top-3 pointer-events-none text-gray-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Appearance */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-brand-text">
                {t('settings.appearance', 'Appearance')}
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                {/* Light mode button */}
                <button
                  type="button"
                  onClick={() => handleAppearanceToggle('light')}
                  className={`py-2 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    appearance === 'light'
                      ? 'border-2 border-brand-orange bg-orange-50/40 text-brand-deep font-extrabold shadow-sm'
                      : 'border border-gray-200 bg-white text-gray-600 hover:text-brand-text font-medium'
                  }`}
                >
                  <Sun className={`w-3.5 h-3.5 ${appearance === 'light' ? 'text-brand-orange' : 'text-gray-400'}`} />
                  <span>{t('settings.light', 'Light')}</span>
                </button>

                {/* Dark mode button */}
                <button
                  type="button"
                  onClick={() => handleAppearanceToggle('dark')}
                  className={`py-2 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    appearance === 'dark'
                      ? 'border-2 border-brand-orange bg-orange-50/40 text-brand-deep font-extrabold shadow-sm'
                      : 'border border-gray-200 bg-white text-gray-600 hover:text-brand-text font-medium'
                  }`}
                >
                  <Moon className={`w-3.5 h-3.5 ${appearance === 'dark' ? 'text-brand-orange' : 'text-gray-400'}`} />
                  <span>{t('settings.dark', 'Dark')}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Row: Location Services */}
          <div className="pt-2 flex items-center justify-between gap-4 border-t border-gray-100">
            <div className="space-y-0.5">
              <h3 className="text-sm font-bold text-brand-text">
                {t('settings.locationServices', 'Location Services')}
              </h3>
              <p className="text-xs text-brand-muted leading-relaxed max-w-xl">
                {t(
                  'settings.locationServicesSubtitle',
                  'Allow platform to use precise GPS telemetry for automatic Haversine distance calculations and pickup routing.'
                )}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setLocationServices(!locationServices)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                locationServices ? 'bg-brand-orange' : 'bg-gray-200'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  locationServices ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Actions Bar */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={handleCancel}
          className="px-6 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold text-xs rounded-2xl shadow-sm transition-all cursor-pointer active:scale-95"
        >
          {t('settings.cancel', 'Cancel')}
        </button>
        <button
          type="button"
          onClick={handleSave}
          className="px-6 py-2.5 bg-brand-orange hover:bg-brand-deep text-white font-bold text-xs rounded-2xl shadow-warm-sm hover:shadow-warm-md transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
        >
          <Check className="w-4 h-4 stroke-[3]" />
          <span>{t('settings.saveChanges', 'Save Changes')}</span>
        </button>
      </div>

      {/* MODAL 1: Change Password Modal */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div
            className="bg-white rounded-3xl border border-gray-100 shadow-2xl w-full max-w-md overflow-hidden p-6 sm:p-7 space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-orange-100 text-brand-orange rounded-xl">
                  <Lock className="w-4 h-4" />
                </div>
                <h3 className="font-extrabold text-base text-brand-text">
                  {t('settings.changePassword', 'Change Password')}
                </h3>
              </div>
              <button
                onClick={() => {
                  setIsPasswordModalOpen(false);
                  setPasswordError(null);
                }}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {passwordError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{passwordError}</span>
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-brand-text uppercase mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:bg-white focus:border-brand-orange focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-text uppercase mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:bg-white focus:border-brand-orange focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-text uppercase mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:bg-white focus:border-brand-orange focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl"
                >
                  {t('settings.cancel', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-brand-orange hover:bg-brand-deep text-white font-bold text-xs rounded-xl shadow-warm-sm"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
