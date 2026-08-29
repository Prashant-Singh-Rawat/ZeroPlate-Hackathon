import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { launchGoogleOAuthPopup } from '../services/auth/googleAuth';
import {
  Utensils,
  ShieldCheck,
  Users,
  Store,
  HeartHandshake,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Globe,
  Check,
  ChevronDown,
  Sparkles,
  KeyRound,
  CheckCircle2,
} from 'lucide-react';

interface LoginProps {
  onNavigateSignup: () => void;
  onNavigateForgot: () => void;
}

export const Login: React.FC<LoginProps> = ({ onNavigateSignup, onNavigateForgot }) => {
  const { login, loginWithGoogle, sendGmailOtp, verifyGmailOtp } = useAuth();
  const [selectedRole, setSelectedRole] = useState<UserRole>('donor');
  const [emailOrPhone, setEmailOrPhone] = useState('donor@spicevilla.com');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [selectedLang, setSelectedLang] = useState('English');
  const [isLangOpen, setIsLangOpen] = useState(false);

  // Gmail 6-Digit OTP Mode
  const [isOtpMode, setIsOtpMode] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setErrorMessage('');
    setSuccessMessage('');
    if (role === 'donor') {
      setEmailOrPhone('donor@spicevilla.com');
    } else {
      setEmailOrPhone('ngo@hope.org');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    if (isOtpMode) {
      if (!otpCode.trim()) {
        setErrorMessage('Please enter the 6-digit verification code.');
        setIsLoading(false);
        return;
      }
      const result = await verifyGmailOtp(emailOrPhone, otpCode, selectedRole);
      if (!result.success) {
        setErrorMessage(result.error || 'Invalid verification code.');
      }
      setIsLoading(false);
      return;
    }

    const result = await login(emailOrPhone, selectedRole);
    if (!result.success) {
      setErrorMessage(result.error || 'Authentication failed. Please check credentials.');
    }
    setIsLoading(false);
  };

  const handleSendOtp = async () => {
    if (!emailOrPhone || !emailOrPhone.includes('@')) {
      setErrorMessage('Please enter a valid Gmail / Email address to receive the verification code.');
      return;
    }

    setIsSendingOtp(true);
    setErrorMessage('');
    const res = await sendGmailOtp(emailOrPhone, selectedRole);
    setIsSendingOtp(false);

    if (res.success) {
      setOtpSent(true);
      setSuccessMessage(`Verification code sent! Demo code: ${res.demoCode || '482910'}`);
      if (res.demoCode) {
        setOtpCode(res.demoCode);
      }
    } else {
      setErrorMessage(res.error || 'Failed to send OTP code.');
    }
  };

  const handleGoogleLogin = () => {
    setGoogleLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    launchGoogleOAuthPopup(
      selectedRole,
      async (googleUserData) => {
        await loginWithGoogle(selectedRole, googleUserData);
        setGoogleLoading(false);
      },
      (err) => {
        console.warn('Google popup error:', err);
        setErrorMessage(err.message || 'Google account selector closed. Please try again.');
        setGoogleLoading(false);
      }
    );
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] dark:bg-[#0B1120] flex flex-col justify-between text-[#1F2937] dark:text-slate-100 transition-colors duration-200">
      {/* Top Navbar */}
      <header className="w-full max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-[#F97316] rounded-2xl flex items-center justify-center shadow-md shadow-orange-500/20">
            <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white stroke-none">
              <path d="M12 3a3 3 0 0 0-3 3c0 .24.03.47.08.7A10.02 10.02 0 0 0 2 16a6 6 0 0 0 6 6h8a6 6 0 0 0 6-6 10.02 10.02 0 0 0-7.08-9.3c.05-.23.08-.46.08-.7a3 3 0 0 0-3-3zm-6 13a8 8 0 0 1 12 0H6z" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-1">
              <span className="text-xl font-black tracking-tight text-[#1F2937] dark:text-white">Zero</span>
              <span className="text-xl font-black tracking-tight text-[#F97316]">Plate</span>
            </div>
            <p className="text-[11px] font-medium text-[#6B7280] dark:text-slate-400 -mt-1">Share Food, Share Hope</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsLangOpen(!isLangOpen)}
              className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-800 rounded-full border border-gray-200 dark:border-slate-700 text-xs font-semibold text-[#4B5563] dark:text-slate-200 hover:border-gray-300 dark:hover:border-slate-600 transition-all shadow-sm cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5 text-gray-500 dark:text-slate-400" />
              <span>{selectedLang}</span>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400 dark:text-slate-400" />
            </button>

            {isLangOpen && (
              <div className="absolute right-0 mt-2 w-36 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-100 dark:border-slate-700 py-1 z-30">
                {['English', 'Hindi (हिंदी)', 'Marathi (मराठी)'].map((lang) => (
                  <button
                    key={lang}
                    onClick={() => {
                      setSelectedLang(lang.split(' ')[0]);
                      setIsLangOpen(false);
                    }}
                    className="w-full text-left px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-slate-200 hover:bg-orange-50 dark:hover:bg-slate-700 hover:text-[#F97316] dark:hover:text-orange-400 cursor-pointer"
                  >
                    {lang}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs font-medium text-[#4B5563] dark:text-slate-400">
            <span>Don't have an account?</span>
            <button
              onClick={onNavigateSignup}
              className="px-4 py-1.5 rounded-xl border border-gray-300 dark:border-slate-700 hover:border-[#F97316] text-[#1F2937] dark:text-white hover:text-[#F97316] font-bold transition-all shadow-sm bg-white dark:bg-slate-800 cursor-pointer"
            >
              Sign up
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full max-w-7xl mx-auto px-6 py-4 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* Left Column */}
        <div className="lg:col-span-6 space-y-7 flex flex-col justify-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#FFF4EC] dark:bg-orange-950/60 rounded-full border border-orange-200/60 dark:border-orange-800/60 w-fit">
            <span className="text-xs">🧡</span>
            <span className="text-xs font-bold text-[#EA580C] dark:text-orange-400">Together, we can make a difference</span>
          </div>

          <div className="space-y-3">
            <h1 className="text-4xl sm:text-5xl font-serif font-black tracking-tight text-[#1F2937] dark:text-white leading-[1.15]">
              Reduce Food Waste. <br />
              <span className="text-[#EA580C] dark:text-orange-500">Feed More Lives.</span>
            </h1>
            <p className="text-sm sm:text-base text-[#6B7280] dark:text-slate-300 font-normal max-w-md leading-relaxed">
              ZeroPlate connects verified food donors with local NGOs to ensure surplus meals reach communities in need.
            </p>
          </div>

          <div className="space-y-3.5 max-w-md">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-[#ECFDF5] dark:bg-emerald-950/60 text-[#059669] dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-100 dark:border-emerald-800">
                <Utensils className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#1F2937] dark:text-white">Meals Saved Daily</h4>
                <p className="text-[11px] text-[#6B7280] dark:text-slate-400">Making an immediate social impact</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-[#ECFDF5] dark:bg-emerald-950/60 text-[#059669] dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-100 dark:border-emerald-800">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#1F2937] dark:text-white">Google Cloud OAuth 2.0 Verified</h4>
                <p className="text-[11px] text-[#6B7280] dark:text-slate-400">Secure identity verification for donors and NGOs</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-[#ECFDF5] dark:bg-emerald-950/60 text-[#059669] dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-100 dark:border-emerald-800">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#1F2937] dark:text-white">Stronger Communities</h4>
                <p className="text-[11px] text-[#6B7280] dark:text-slate-400">Real-time GPS routing & dispatch</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Form */}
        <div className="lg:col-span-6 flex justify-center">
          <div className="w-full max-w-lg bg-white dark:bg-[#1E293B] rounded-[32px] border border-gray-100 dark:border-slate-700 shadow-[0_10px_40px_rgba(0,0,0,0.06)] dark:shadow-2xl p-7 sm:p-9 space-y-6 transition-colors">
            <div className="text-center space-y-1.5">
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#1F2937] dark:text-white">
                Welcome <span className="text-[#EA580C] dark:text-orange-500 font-black italic">Back!</span> 👋
              </h2>
              <p className="text-xs text-[#6B7280] dark:text-slate-300">
                Choose your portal role and sign in with Google Cloud Account Chooser
              </p>

              <div className="flex items-center justify-center gap-2 pt-1 pb-1">
                <div className="w-8 h-[1px] bg-orange-300 dark:bg-orange-800" />
                <span className="text-xs text-[#EA580C] dark:text-orange-400">🧡</span>
                <div className="w-8 h-[1px] bg-orange-300 dark:bg-orange-800" />
              </div>
            </div>

            {/* Role Cards */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleRoleSelect('donor')}
                className={`p-3.5 rounded-2xl border-2 text-left transition-all flex items-start gap-3 relative cursor-pointer ${
                  selectedRole === 'donor'
                    ? 'border-[#16A34A] dark:border-emerald-500 bg-[#F0FDF4] dark:bg-emerald-950/40 shadow-sm'
                    : 'border-gray-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-600 bg-white dark:bg-slate-800/60'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-[#DCFCE7] dark:bg-emerald-950/80 text-[#16A34A] dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <Store className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] text-[#6B7280] dark:text-slate-400 font-medium block">I'm a</span>
                  <strong className="text-xs font-black text-[#1F2937] dark:text-white block truncate">Food Donor</strong>
                  <span className="text-[10px] text-[#6B7280] dark:text-slate-400 block truncate">Restaurant / Hotel</span>
                </div>
                {selectedRole === 'donor' && (
                  <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-[#16A34A] text-white flex items-center justify-center">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                )}
              </button>

              <button
                type="button"
                onClick={() => handleRoleSelect('ngo')}
                className={`p-3.5 rounded-2xl border-2 text-left transition-all flex items-start gap-3 relative cursor-pointer ${
                  selectedRole === 'ngo'
                    ? 'border-[#EA580C] dark:border-orange-500 bg-[#FFF7ED] dark:bg-orange-950/40 shadow-sm'
                    : 'border-gray-200 dark:border-slate-700 hover:border-orange-300 dark:hover:border-orange-600 bg-white dark:bg-slate-800/60'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-[#FFEDD5] dark:bg-orange-950/80 text-[#EA580C] dark:text-orange-400 flex items-center justify-center shrink-0">
                  <HeartHandshake className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] text-[#6B7280] dark:text-slate-400 font-medium block">I'm an</span>
                  <strong className="text-xs font-black text-[#1F2937] dark:text-white block truncate">NGO Manager</strong>
                  <span className="text-[10px] text-[#6B7280] dark:text-slate-400 block truncate">Charity / Shelter</span>
                </div>
                {selectedRole === 'ngo' && (
                  <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-[#EA580C] text-white flex items-center justify-center">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                )}
              </button>
            </div>

            {/* Error & Success Messages */}
            {errorMessage && (
              <div className="p-3 bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300 text-xs font-semibold rounded-xl border border-red-200 dark:border-red-800">
                {errorMessage}
              </div>
            )}
            {successMessage && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 text-xs font-semibold rounded-xl border border-emerald-200 dark:border-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Prominent Google Cloud OAuth Button */}
            <div>
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={googleLoading}
                className="w-full py-3.5 px-4 bg-white dark:bg-slate-800 hover:bg-orange-50/50 dark:hover:bg-slate-700 border-2 border-orange-200 dark:border-slate-700 hover:border-orange-400 dark:hover:border-orange-500 rounded-2xl text-xs sm:text-sm font-extrabold text-gray-800 dark:text-white shadow-sm flex items-center justify-center gap-3 transition-all active:scale-95 group cursor-pointer"
                title="Select your Google account via Google Cloud OAuth 2.0"
              >
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>{googleLoading ? 'Connecting to Google...' : `Continue with Google (${selectedRole === 'donor' ? 'Food Donor' : 'NGO Manager'})`}</span>
              </button>
            </div>

            <div className="relative flex items-center justify-center">
              <div className="w-full border-t border-gray-200 dark:border-slate-700" />
              <span className="absolute bg-white dark:bg-[#1E293B] px-3 text-[11px] text-gray-500 dark:text-slate-400 font-medium">
                or sign in with verified credentials
              </span>
            </div>

            {/* Email / OTP / Password Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 dark:text-slate-500 absolute left-4 top-3.5" />
                <input
                  type="email"
                  value={emailOrPhone}
                  onChange={(e) => setEmailOrPhone(e.target.value)}
                  required
                  placeholder="name@gmail.com"
                  className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-medium text-[#1F2937] dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:border-[#EA580C] focus:ring-1 focus:ring-[#EA580C] focus:outline-none transition-all"
                />
              </div>

              {isOtpMode ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-gray-900 dark:text-white uppercase">
                      6-Digit Gmail Verification Code
                    </label>
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={isSendingOtp}
                      className="text-[11px] font-bold text-[#EA580C] dark:text-orange-400 hover:underline cursor-pointer"
                    >
                      {isSendingOtp ? 'Sending code...' : otpSent ? 'Resend Code' : 'Send Code to Gmail'}
                    </button>
                  </div>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-gray-400 dark:text-slate-500 absolute left-4 top-3.5" />
                    <input
                      type="text"
                      maxLength={6}
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      placeholder="Enter 6-digit code"
                      className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-mono font-bold tracking-widest text-[#1F2937] dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:border-[#EA580C] focus:outline-none"
                    />
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 dark:text-slate-500 absolute left-4 top-3.5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Password"
                    className="w-full pl-11 pr-11 py-3 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-medium text-[#1F2937] dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:border-[#EA580C] focus:ring-1 focus:ring-[#EA580C] focus:outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4 text-gray-400" />}
                  </button>
                </div>
              )}

              <div className="flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setIsOtpMode(!isOtpMode);
                    setErrorMessage('');
                    setSuccessMessage('');
                  }}
                  className="font-bold text-[#EA580C] dark:text-orange-400 hover:underline cursor-pointer"
                >
                  {isOtpMode ? 'Use Password Sign-In instead' : 'Sign in with Gmail Verification Code (OTP)'}
                </button>
                {!isOtpMode && (
                  <button
                    type="button"
                    onClick={onNavigateForgot}
                    className="font-bold text-gray-500 dark:text-slate-400 hover:underline cursor-pointer"
                  >
                    Forgot?
                  </button>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-[#EA580C] hover:bg-[#C2410C] text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md shadow-orange-500/25 transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
              >
                <Lock className="w-4 h-4" />
                <span>{isLoading ? 'Verifying...' : `Enter ${selectedRole === 'donor' ? 'Food Donor' : 'NGO'} Portal`}</span>
              </button>
            </form>
          </div>
        </div>
      </main>

      <footer className="w-full max-w-7xl mx-auto px-6 py-6 text-center text-xs text-[#9CA3AF] dark:text-slate-500">
        <div className="flex flex-wrap items-center justify-center gap-3">
          <span>© 2024 ZeroPlate. All rights reserved.</span>
          <span>|</span>
          <a href="#privacy" className="hover:text-gray-600 dark:hover:text-slate-300 transition-colors">Privacy Policy</a>
          <span>|</span>
          <a href="#terms" className="hover:text-gray-600 dark:hover:text-slate-300 transition-colors">Terms of Service</a>
        </div>
      </footer>
    </div>
  );
};
