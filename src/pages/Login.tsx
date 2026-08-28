import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { Utensils, HeartHandshake, ArrowRight, ShieldCheck, Mail, Lock, CheckCircle2 } from 'lucide-react';

interface LoginProps {
  onNavigateSignup: () => void;
  onNavigateForgot: () => void;
}

export const Login: React.FC<LoginProps> = ({ onNavigateSignup, onNavigateForgot }) => {
  const { login, loginWithGoogle } = useAuth();
  const [selectedRole, setSelectedRole] = useState<UserRole>('donor');
  const [email, setEmail] = useState('donor@spicevilla.com');
  const [password, setPassword] = useState('password123');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setErrorMessage('');
    if (role === 'donor') {
      setEmail('donor@spicevilla.com');
    } else {
      setEmail('ngo@hope.org');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');
    const result = await login(email, selectedRole);
    if (!result.success) {
      setErrorMessage(result.error || 'Authentication failed.');
    }
    setIsLoading(false);
  };

  const handleGoogleAuth = async () => {
    setIsLoading(true);
    await loginWithGoogle(selectedRole);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center p-4 py-8">
      <div className="max-w-md w-full bg-white rounded-3xl border border-amber-900/5 shadow-warm-lg p-8 relative overflow-hidden">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex p-3 bg-brand-orange text-white rounded-2xl shadow-warm-sm mb-3">
            <Utensils className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-black text-brand-text">ZeroPlate Authentication</h1>
          <p className="text-xs font-medium text-brand-muted mt-1">
            Sign in to start publishing or requesting surplus food.
          </p>
        </div>

        {/* Unified Role Selection Cards (§7) */}
        <div className="mb-6 space-y-2">
          <label className="block text-xs font-black text-brand-text uppercase tracking-wider">
            Select Your Portal
          </label>
          <div className="grid grid-cols-1 gap-2.5">
            {/* Donor Card */}
            <div
              onClick={() => handleRoleSelect('donor')}
              className={`cursor-pointer p-3.5 rounded-2xl border-2 transition-all flex items-center justify-between ${
                selectedRole === 'donor'
                  ? 'border-brand-orange bg-brand-light shadow-warm-sm ring-2 ring-brand-orange/20'
                  : 'border-gray-200 hover:border-orange-200 bg-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 text-brand-orange rounded-xl shrink-0">
                  <Utensils className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-brand-text">🍽️ FOOD DONOR / VOLUNTEER</h3>
                  <p className="text-[11px] text-brand-muted">"I have surplus food to donate"</p>
                </div>
              </div>
              {selectedRole === 'donor' && <CheckCircle2 className="w-5 h-5 text-brand-orange fill-white shrink-0" />}
            </div>

            {/* NGO Card */}
            <div
              onClick={() => handleRoleSelect('ngo')}
              className={`cursor-pointer p-3.5 rounded-2xl border-2 transition-all flex items-center justify-between ${
                selectedRole === 'ngo'
                  ? 'border-brand-orange bg-brand-light shadow-warm-sm ring-2 ring-brand-orange/20'
                  : 'border-gray-200 hover:border-orange-200 bg-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 text-emerald-600 rounded-xl shrink-0">
                  <HeartHandshake className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-brand-text">❤️ NGO MANAGER</h3>
                  <p className="text-[11px] text-brand-muted">"I am looking for food donations"</p>
                </div>
              </div>
              {selectedRole === 'ngo' && <CheckCircle2 className="w-5 h-5 text-brand-orange fill-white shrink-0" />}
            </div>
          </div>
        </div>

        {/* Google OAuth Button */}
        <button
          type="button"
          onClick={handleGoogleAuth}
          disabled={isLoading}
          className="w-full py-2.5 px-4 bg-white hover:bg-gray-50 text-gray-700 font-bold text-xs rounded-xl border border-gray-300 shadow-sm transition-all flex items-center justify-center gap-2 mb-4 active:scale-95"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
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
          <span>Continue with Google as {selectedRole === 'donor' ? 'Food Donor' : 'NGO'}</span>
        </button>

        <div className="flex items-center gap-2 mb-4">
          <hr className="flex-1 border-gray-200" />
          <span className="text-[10px] font-bold text-gray-400 uppercase">Or with verified email</span>
          <hr className="flex-1 border-gray-200" />
        </div>

        {errorMessage && (
          <div className="p-3 bg-red-50 text-red-700 text-xs font-semibold rounded-xl border border-red-200 mb-4">
            {errorMessage}
          </div>
        )}

        {/* Email/Password Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-[11px] font-bold text-brand-text uppercase mb-1">
              Registered Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-brand-text focus:bg-white focus:border-brand-orange focus:outline-none"
                placeholder="name@domain.com"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-[11px] font-bold text-brand-text uppercase">Password</label>
              <button
                type="button"
                onClick={onNavigateForgot}
                className="text-[11px] font-semibold text-brand-orange hover:underline"
              >
                Forgot?
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-brand-text focus:bg-white focus:border-brand-orange focus:outline-none"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-brand-orange hover:bg-brand-deep text-white font-black text-xs rounded-xl shadow-warm-sm hover:shadow-warm-md transition-all flex items-center justify-center gap-1.5 active:scale-95"
          >
            <span>{isLoading ? 'Authenticating...' : `Enter ${selectedRole === 'donor' ? 'Food Donor' : 'NGO'} Dashboard`}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-5 text-center text-xs text-brand-muted">
          Need an account?{' '}
          <button onClick={onNavigateSignup} className="font-extrabold text-brand-orange hover:underline">
            Register Organization
          </button>
        </div>
      </div>
    </div>
  );
};
