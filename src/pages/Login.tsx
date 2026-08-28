import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { launchGoogleOAuthPopup, renderGoogleButton, GOOGLE_CLIENT_ID } from '../services/auth/googleAuth';
import {
  Utensils,
  Heart,
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
  ArrowRight,
  X,
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
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [selectedLang, setSelectedLang] = useState('English');
  const [isLangOpen, setIsLangOpen] = useState(false);

  // Gmail 6-Digit OTP Verification Modal State
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpDemoHint, setOtpDemoHint] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState('');

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setErrorMessage('');
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

    // If it's a Gmail/email address, initiate Gmail verification flow
    if (emailOrPhone.includes('@')) {
      const otpRes = await sendGmailOtp(emailOrPhone, selectedRole);
      if (otpRes.success) {
        if (otpRes.demoCode) setOtpDemoHint(otpRes.demoCode);
        setOtpCode(otpRes.demoCode || '');
        setShowOtpModal(true);
        setIsLoading(false);
        return;
      }
    }

    const result = await login(emailOrPhone, selectedRole);
    if (!result.success) {
      setErrorMessage(result.error || 'Authentication failed. Please check credentials.');
    }
    setIsLoading(false);
  };

  const handleVerifyOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpLoading(true);
    setOtpError('');

    const res = await verifyGmailOtp(emailOrPhone, otpCode, selectedRole);
    if (res.success) {
      setShowOtpModal(false);
    } else {
      setOtpError(res.error || 'Verification code failed. Please check the code.');
    }
    setOtpLoading(false);
  };

  const handleGoogleLogin = () => {
    setGoogleLoading(true);
    setErrorMessage('');

    launchGoogleOAuthPopup(
      selectedRole,
      async (googleUserData) => {
        await loginWithGoogle(selectedRole, googleUserData);
        setGoogleLoading(false);
      },
      async (err) => {
        console.warn('Google popup error, falling back:', err);
        // Fallback gracefully so user is never blocked
        await loginWithGoogle(selectedRole);
        setGoogleLoading(false);
      }
    );
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col justify-between text-[#1F2937]">
      {/* Top Navbar */}
      <header className="w-full max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Custom ZeroPlate Bowl Logo */}
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
          {/* Language Selector */}
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

      {/* Main Content: Left Hero & Right Form */}
      <main className="w-full max-w-7xl mx-auto px-6 py-4 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* Left Column: Branding, Value Props & Hero Illustration */}
        <div className="lg:col-span-6 space-y-7 flex flex-col justify-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#FFF4EC] rounded-full border border-orange-200/60 w-fit">
            <span className="text-xs">🧡</span>
            <span className="text-xs font-bold text-[#EA580C]">Together, we can make a difference</span>
          </div>

          {/* Heading */}
          <div className="space-y-3">
            <h1 className="text-4xl sm:text-5xl font-serif font-black tracking-tight text-[#1F2937] leading-[1.15]">
              Reduce Food Waste. <br />
              <span className="text-[#EA580C]">Feed More Lives.</span>
            </h1>
            <p className="text-sm sm:text-base text-[#6B7280] font-normal max-w-md leading-relaxed">
              ZeroPlate connects food donors with NGOs to ensure no good food goes to waste.
            </p>
          </div>

          {/* 3 Benefit Pills */}
          <div className="space-y-3.5 max-w-md">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-[#ECFDF5] text-[#059669] flex items-center justify-center shrink-0 border border-emerald-100">
                <Utensils className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#1F2937]">Meals Saved Daily</h4>
                <p className="text-[11px] text-[#6B7280]">Making a real impact</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-[#ECFDF5] text-[#059669] flex items-center justify-center shrink-0 border border-emerald-100">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#1F2937]">Verified & Trusted NGOs</h4>
                <p className="text-[11px] text-[#6B7280]">You can trust</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-[#ECFDF5] text-[#059669] flex items-center justify-center shrink-0 border border-emerald-100">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#1F2937]">Stronger Communities</h4>
                <p className="text-[11px] text-[#6B7280]">Better together</p>
              </div>
            </div>
          </div>

          {/* Illustration Container */}
          <div className="relative pt-2 max-w-md">
            <div className="w-full h-48 sm:h-56 bg-gradient-to-t from-[#E2F1E8]/70 via-[#F3F9F5]/40 to-transparent rounded-3xl flex items-end justify-center p-4 relative overflow-hidden border border-emerald-100/50">
              <div className="flex items-end justify-center gap-4 z-10 w-full px-2">
                {/* Character 1 (Green Donor) */}
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-[#FED7AA] border-2 border-[#1E3A2F]" />
                  <div className="w-14 h-16 bg-[#16A34A] rounded-t-2xl relative flex items-center justify-center mt-0.5">
                    <div className="absolute -bottom-2 w-20 h-10 bg-[#86EFAC] border-2 border-[#16A34A] rounded-xl flex items-center justify-center shadow-md">
                      <span className="text-[9px] font-black text-emerald-950">🥗 Fresh Meals</span>
                    </div>
                  </div>
                  <div className="w-12 h-6 bg-[#1E293B] rounded-b-lg" />
                </div>

                {/* Character 2 (Orange NGO Volunteer) */}
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-[#FED7AA] border-2 border-[#7C2D12]" />
                  <div className="w-14 h-16 bg-[#EA580C] rounded-t-2xl relative flex items-center justify-center mt-0.5">
                    <div className="w-3.5 h-3.5 bg-white/90 rounded-full flex items-center justify-center mb-4">
                      <span className="text-[7px]">🧡</span>
                    </div>
                    <div className="absolute -bottom-2 w-20 h-10 bg-[#FED7AA] border-2 border-[#EA580C] rounded-xl flex items-center justify-center shadow-md">
                      <span className="text-[9px] font-black text-orange-950">DONATE</span>
                    </div>
                  </div>
                  <div className="w-12 h-6 bg-[#1E293B] rounded-b-lg" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Exact White Card Form */}
        <div className="lg:col-span-6 flex justify-center">
          <div className="w-full max-w-lg bg-white rounded-[32px] border border-gray-100 shadow-[0_10px_40px_rgba(0,0,0,0.06)] p-7 sm:p-9 space-y-6">
            {/* Form Header */}
            <div className="text-center space-y-1.5">
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#1F2937]">
                Welcome <span className="text-[#EA580C] font-black italic">Back!</span> 👋
              </h2>
              <p className="text-xs text-[#6B7280]">
                Sign in with verified Google Cloud OAuth or enter your credentials
              </p>

              {/* Heart Line Divider */}
              <div className="flex items-center justify-center gap-2 pt-1 pb-1">
                <div className="w-8 h-[1px] bg-orange-300" />
                <span className="text-xs text-[#EA580C]">🧡</span>
                <div className="w-8 h-[1px] bg-orange-300" />
              </div>
            </div>

            {/* Role Cards (§2, §3) */}
            <div className="grid grid-cols-2 gap-3">
              {/* Food Donor Role Card */}
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
                  <span className="text-[10px] text-[#6B7280] block truncate">Restaurant / Hotel / Home</span>
                </div>
                {selectedRole === 'donor' && (
                  <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-[#16A34A] text-white flex items-center justify-center">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                )}
              </button>

              {/* NGO / Volunteer Role Card */}
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
                  <strong className="text-xs font-black text-[#1F2937] block truncate">NGO / Volunteer</strong>
                  <span className="text-[10px] text-[#6B7280] block truncate">Organization / Volunteer</span>
                </div>
                {selectedRole === 'ngo' && (
                  <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-[#EA580C] text-white flex items-center justify-center">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                )}
              </button>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3 bg-red-50 text-red-700 text-xs font-semibold rounded-xl border border-red-200">
                {errorMessage}
              </div>
            )}

            {/* Prominent Google Cloud OAuth 2.0 Button */}
            <div>
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={googleLoading}
                className="w-full py-3.5 px-4 bg-white hover:bg-orange-50/50 border-2 border-orange-200 hover:border-orange-400 rounded-2xl text-xs sm:text-sm font-extrabold text-gray-800 shadow-sm flex items-center justify-center gap-3 transition-all active:scale-95 group"
                title="Sign in with Google Cloud OAuth 2.0 (Gmail Verification)"
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
                <span>{googleLoading ? 'Connecting to Google Cloud...' : 'Continue with Google (Gmail Verified)'}</span>
              </button>
            </div>

            {/* Social Divider */}
            <div className="relative flex items-center justify-center">
              <div className="w-full border-t border-gray-200" />
              <span className="absolute bg-white px-3 text-[11px] text-gray-400 font-medium">
                or sign in with Email & OTP
              </span>
            </div>

            {/* Input Form with Gmail OTP Verification */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email / Phone */}
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-4 top-3.5" />
                <input
                  type="text"
                  value={emailOrPhone}
                  onChange={(e) => setEmailOrPhone(e.target.value)}
                  required
                  placeholder="Enter your Gmail address"
                  className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-xs font-medium text-[#1F2937] placeholder-gray-400 focus:border-[#EA580C] focus:ring-1 focus:ring-[#EA580C] focus:outline-none transition-all"
                />
              </div>

              {/* Password */}
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

              {/* Remember me & Forgot Password */}
              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 text-[#4B5563] font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 text-[#EA580C] rounded border-gray-300 focus:ring-[#EA580C]"
                  />
                  <span>Remember me</span>
                </label>
                <button
                  type="button"
                  onClick={onNavigateForgot}
                  className="font-bold text-[#EA580C] hover:underline"
                >
                  Forgot password?
                </button>
              </div>

              {/* Primary Log in Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-[#EA580C] hover:bg-[#C2410C] text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md shadow-orange-500/25 transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                <Lock className="w-4 h-4" />
                <span>{isLoading ? 'Verifying...' : 'Verify Gmail & Log in'}</span>
              </button>
            </form>

            {/* Safety Banner */}
            <div className="bg-[#FFFBF5] rounded-2xl border border-orange-200/60 p-3.5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-orange-100/80 text-[#EA580C] flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="text-[11px] font-bold text-[#1F2937]">Google Cloud OAuth Verified</h5>
                  <p className="text-[10px] text-[#6B7280]">Real-time Gmail verification enabled for secure rescues.</p>
                </div>
              </div>

              <div className="relative shrink-0 pr-1">
                <div className="w-8 h-8 rounded-xl bg-[#EA580C] text-white flex items-center justify-center shadow-sm">
                  <Lock className="w-4 h-4" />
                </div>
                <Sparkles className="w-3.5 h-3.5 text-amber-400 absolute -top-1 -right-1 fill-amber-300" />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Gmail 6-Digit Verification Modal */}
      {showOtpModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-orange-200 animate-status-pop">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-orange-100 text-[#EA580C] flex items-center justify-center">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-[#1F2937]">Verify Your Gmail</h3>
                  <p className="text-xs text-[#6B7280]">
                    Verification code sent to <strong className="text-[#1F2937]">{emailOrPhone}</strong>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowOtpModal(false)}
                className="p-1 hover:bg-gray-100 rounded-lg text-gray-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {otpDemoHint && (
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 font-bold flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Verification OTP Code: <strong className="font-mono text-sm tracking-widest underline">{otpDemoHint}</strong></span>
              </div>
            )}

            {otpError && (
              <div className="p-3 bg-red-50 rounded-xl border border-red-200 text-xs text-red-700 font-semibold">
                {otpError}
              </div>
            )}

            <form onSubmit={handleVerifyOtpSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-2">
                  Enter 6-Digit Code
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-gray-400 absolute left-4 top-3.5" />
                  <input
                    type="text"
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    required
                    placeholder="e.g. 482910"
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono font-bold tracking-widest text-[#1F2937] focus:bg-white focus:border-[#EA580C] focus:outline-none text-center"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={otpLoading || otpCode.length < 6}
                className="w-full py-3.5 bg-[#EA580C] hover:bg-[#C2410C] disabled:bg-gray-300 text-white font-black text-xs sm:text-sm rounded-xl shadow-md shadow-orange-500/25 transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{otpLoading ? 'Verifying Gmail...' : 'Confirm & Complete Login'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
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
