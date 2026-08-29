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
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col justify-between text-[#1F2937]">
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
              <span className="text-xl font-black tracking-tight text-[#1F2937]">Zero</span>
              <span className="text-xl font-black tracking-tight text-[#F97316]">Plate</span>
            </div>
            <p className="text-[11px] font-medium text-[#6B7280] -mt-1">Share Food, Share Hope</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsLangOpen(!isLangOpen)}
              className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-full border border-gray-200 text-xs font-semibold text-[#4B5563] hover:border-gray-300 transition-all shadow-sm"
            >
              <Globe className="w-3.5 h-3.5 text-gray-500" />
              <span>{selectedLang}</span>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
            </button>

            {isLangOpen && (
              <div className="absolute right-0 mt-2 w-32 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-30">
                {['English', 'Hindi (हिंदी)', 'Marathi (मराठी)'].map((lang) => (
                  <button
                    key={lang}
                    onClick={() => {
                      setSelectedLang(lang.split(' ')[0]);
                      setIsLangOpen(false);
                    }}
                    className="w-full text-left px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-orange-50 hover:text-[#F97316]"
                  >
                    {lang}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs font-medium text-[#4B5563]">
            <span>Don't have an account?</span>
            <button
              onClick={onNavigateSignup}
              className="px-4 py-1.5 rounded-xl border border-gray-300 hover:border-[#F97316] text-[#1F2937] hover:text-[#F97316] font-bold transition-all shadow-sm bg-white"
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
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#FFF4EC] rounded-full border border-orange-200/60 w-fit">
            <span className="text-xs">🧡</span>
            <span className="text-xs font-bold text-[#EA580C]">Together, we can make a difference</span>
          </div>

          <div className="space-y-3">
            <h1 className="text-4xl sm:text-5xl font-serif font-black tracking-tight text-[#1F2937] leading-[1.15]">
              Reduce Food Waste. <br />
              <span className="text-[#EA580C]">Feed More Lives.</span>
            </h1>
            <p className="text-sm sm:text-base text-[#6B7280] font-normal max-w-md leading-relaxed">
              ZeroPlate connects verified food donors with local NGOs to ensure surplus meals reach communities in need.
            </p>
          </div>

          <div className="space-y-3.5 max-w-md">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-[#ECFDF5] text-[#059669] flex items-center justify-center shrink-0 border border-emerald-100">
                <Utensils className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#1F2937]">Meals Saved Daily</h4>
                <p className="text-[11px] text-[#6B7280]">Making an immediate social impact</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-[#ECFDF5] text-[#059669] flex items-center justify-center shrink-0 border border-emerald-100">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#1F2937]">Google Cloud OAuth 2.0 Verified</h4>
                <p className="text-[11px] text-[#6B7280]">Secure identity verification for donors and NGOs</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-[#ECFDF5] text-[#059669] flex items-center justify-center shrink-0 border border-emerald-100">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#1F2937]">Stronger Communities</h4>
                <p className="text-[11px] text-[#6B7280]">Real-time GPS routing & dispatch</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Form */}
        <div className="lg:col-span-6 flex justify-center">
          <div className="w-full max-w-lg bg-white rounded-[32px] border border-gray-100 shadow-[0_10px_40px_rgba(0,0,0,0.06)] p-7 sm:p-9 space-y-6">
            <div className="text-center space-y-1.5">
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#1F2937]">
                Welcome <span className="text-[#EA580C] font-black italic">Back!</span> 👋
              </h2>
              <p className="text-xs text-[#6B7280]">
                Choose your portal role and sign in with Google Cloud Account Chooser
              </p>

              <div className="flex items-center justify-center gap-2 pt-1 pb-1">
                <div className="w-8 h-[1px] bg-orange-300" />
                <span className="text-xs text-[#EA580C]">🧡</span>
                <div className="w-8 h-[1px] bg-orange-300" />
              </div>
            </div>

            {/* Role Cards (§2, §3) */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleRoleSelect('donor')}
                className={`p-3.5 rounded-2xl border-2 text-left transition-all flex items-start gap-3 relative ${
                  selectedRole === 'donor'
                    ? 'border-[#16A34A] bg-[#F0FDF4] shadow-sm'
                    : 'border-gray-200 hover:border-emerald-300 bg-white'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-[#DCFCE7] text-[#16A34A] flex items-center justify-center shrink-0">
                  <Store className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] text-[#6B7280] font-medium block">I'm a</span>
                  <strong className="text-xs font-black text-[#1F2937] block truncate">Food Donor</strong>
                  <span className="text-[10px] text-[#6B7280] block truncate">Restaurant / Hotel</span>
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
                className={`p-3.5 rounded-2xl border-2 text-left transition-all flex items-start gap-3 relative ${
                  selectedRole === 'ngo'
                    ? 'border-[#EA580C] bg-[#FFF7ED] shadow-sm'
                    : 'border-gray-200 hover:border-orange-300 bg-white'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-[#FFEDD5] text-[#EA580C] flex items-center justify-center shrink-0">
                  <HeartHandshake className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] text-[#6B7280] font-medium block">I'm an</span>
                  <strong className="text-xs font-black text-[#1F2937] block truncate">NGO Manager</strong>
                  <span className="text-[10px] text-[#6B7280] block truncate">Charity / Shelter</span>
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
              <div className="p-3 bg-red-50 text-red-700 text-xs font-semibold rounded-xl border border-red-200">
                {errorMessage}
              </div>
            )}
            {successMessage && (
              <div className="p-3 bg-emerald-50 text-emerald-800 text-xs font-semibold rounded-xl border border-emerald-200 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Prominent Google Cloud OAuth Button (Opens native account picker) */}
            <div>
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={googleLoading}
                className="w-full py-3.5 px-4 bg-white hover:bg-orange-50/50 border-2 border-orange-200 hover:border-orange-400 rounded-2xl text-xs sm:text-sm font-extrabold text-gray-800 shadow-sm flex items-center justify-center gap-3 transition-all active:scale-95 group"
                title="Select your Google account via Google Cloud OAuth 2.0 popup"
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
                <span>{googleLoading ? 'Opening Google Account Chooser...' : `Continue with Google (${selectedRole === 'donor' ? 'Food Donor' : 'NGO Manager'})`}</span>
              </button>
            </div>

            <div className="relative flex items-center justify-center">
              <div className="w-full border-t border-gray-200" />
              <span className="absolute bg-white px-3 text-[11px] text-gray-400 font-medium">
                or sign in with verified credentials
              </span>
            </div>

            {/* Email / OTP / Password Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-4 top-3.5" />
                <input
                  type="email"
                  value={emailOrPhone}
                  onChange={(e) => setEmailOrPhone(e.target.value)}
                  required
                  placeholder="name@gmail.com"
                  className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-xs font-medium text-[#1F2937] placeholder-gray-400 focus:border-[#EA580C] focus:ring-1 focus:ring-[#EA580C] focus:outline-none transition-all"
                />
              </div>

              {isOtpMode ? (
                /* 6-Digit OTP Input */
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-brand-text uppercase">
                      6-Digit Gmail Verification Code
                    </label>
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={isSendingOtp}
                      className="text-[11px] font-bold text-[#EA580C] hover:underline"
                    >
                      {isSendingOtp ? 'Sending code...' : otpSent ? 'Resend Code' : 'Send Code to Gmail'}
                    </button>
                  </div>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-gray-400 absolute left-4 top-3.5" />
                    <input
                      type="text"
                      maxLength={6}
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      placeholder="Enter 6-digit code"
                      className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-xs font-mono font-bold tracking-widest text-[#1F2937] placeholder-gray-400 focus:border-[#EA580C] focus:outline-none"
                    />
                  </div>
                </div>
              ) : (
                /* Password Input */
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-4 top-3.5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Password"
                    className="w-full pl-11 pr-11 py-3 bg-white border border-gray-200 rounded-xl text-xs font-medium text-[#1F2937] placeholder-gray-400 focus:border-[#EA580C] focus:ring-1 focus:ring-[#EA580C] focus:outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4 text-gray-400" />}
                  </button>
                </div>
              )}

              {/* Toggle OTP / Password verification */}
              <div className="flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setIsOtpMode(!isOtpMode);
                    setErrorMessage('');
                    setSuccessMessage('');
                  }}
                  className="font-bold text-[#EA580C] hover:underline"
                >
                  {isOtpMode ? 'Use Password Sign-In instead' : 'Sign in with Gmail Verification Code (OTP)'}
                </button>
                {!isOtpMode && (
                  <button
                    type="button"
                    onClick={onNavigateForgot}
                    className="font-bold text-gray-500 hover:underline"
                  >
                    Forgot?
                  </button>
                )}
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-[#EA580C] hover:bg-[#C2410C] text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md shadow-orange-500/25 transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                <Lock className="w-4 h-4" />
                <span>{isLoading ? 'Verifying...' : `Enter ${selectedRole === 'donor' ? 'Food Donor' : 'NGO'} Portal`}</span>
              </button>
            </form>
          </div>
        </div>
      </main>

      <footer className="w-full max-w-7xl mx-auto px-6 py-6 text-center text-xs text-[#9CA3AF]">
        <div className="flex flex-wrap items-center justify-center gap-3">
          <span>© 2024 ZeroPlate. All rights reserved.</span>
          <span>|</span>
          <a href="#privacy" className="hover:text-gray-600 transition-colors">Privacy Policy</a>
          <span>|</span>
          <a href="#terms" className="hover:text-gray-600 transition-colors">Terms of Service</a>
        </div>
      </footer>
    </div>
  );
};
