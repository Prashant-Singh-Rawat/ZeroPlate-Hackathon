import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { Utensils, HeartHandshake, ArrowRight, CheckCircle2, Building, Mail, Lock, MapPin } from 'lucide-react';

interface SignupProps {
  onNavigateLogin: () => void;
}

export const Signup: React.FC<SignupProps> = ({ onNavigateLogin }) => {
  const { signup } = useAuth();
  const [role, setRole] = useState<UserRole>('donor');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [location, setLocation] = useState('Bandra West, Mumbai');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;
    setIsLoading(true);
    await signup(name, email, role, location);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center p-4 py-8">
      <div className="max-w-xl w-full bg-white rounded-3xl border border-amber-900/5 shadow-warm-lg p-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-black text-brand-text">Join ZeroPlate</h1>
          <p className="text-sm text-brand-muted mt-1">Select your role to start sharing or collecting food.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Interactive Role Selection Cards (§4) */}
          <div>
            <label className="block text-xs font-bold text-brand-text uppercase mb-2">
              Select Your Role
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div
                onClick={() => setRole('donor')}
                className={`cursor-pointer p-4 rounded-2xl border-2 transition-all flex flex-col justify-between ${
                  role === 'donor'
                    ? 'border-brand-orange bg-brand-light shadow-warm-sm'
                    : 'border-gray-200 hover:border-orange-200 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2.5 bg-orange-100 text-brand-orange rounded-xl">
                    <Utensils className="w-5 h-5" />
                  </div>
                  {role === 'donor' && <CheckCircle2 className="w-5 h-5 text-brand-orange fill-brand-light" />}
                </div>
                <div>
                  <h3 className="font-extrabold text-brand-text text-base">FOOD DONOR</h3>
                  <p className="text-xs text-brand-muted mt-0.5">I have surplus food to donate</p>
                </div>
              </div>

              <div
                onClick={() => setRole('ngo')}
                className={`cursor-pointer p-4 rounded-2xl border-2 transition-all flex flex-col justify-between ${
                  role === 'ngo'
                    ? 'border-brand-orange bg-brand-light shadow-warm-sm'
                    : 'border-gray-200 hover:border-orange-200 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2.5 bg-emerald-100 text-emerald-600 rounded-xl">
                    <HeartHandshake className="w-5 h-5" />
                  </div>
                  {role === 'ngo' && <CheckCircle2 className="w-5 h-5 text-brand-orange fill-brand-light" />}
                </div>
                <div>
                  <h3 className="font-extrabold text-brand-text text-base">NGO MANAGER</h3>
                  <p className="text-xs text-brand-muted mt-0.5">We collect & distribute food</p>
                </div>
              </div>
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-brand-text uppercase mb-1">
                {role === 'donor' ? 'Organization / Donor Name' : 'NGO Name'}
              </label>
              <div className="relative">
                <Building className="w-5 h-5 text-gray-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder={role === 'donor' ? 'e.g. SpiceVilla Restaurant' : 'e.g. Hope Foundation'}
                  className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:bg-white focus:border-brand-orange focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-brand-text uppercase mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 text-gray-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="contact@organization.com"
                  className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:bg-white focus:border-brand-orange focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-brand-text uppercase mb-1">
                Primary Location
              </label>
              <div className="relative">
                <MapPin className="w-5 h-5 text-gray-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  required
                  placeholder="e.g. Bandra West, Mumbai"
                  className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:bg-white focus:border-brand-orange focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-brand-text uppercase mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-5 h-5 text-gray-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:bg-white focus:border-brand-orange focus:outline-none"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-brand-orange hover:bg-brand-deep text-white font-extrabold text-sm rounded-xl shadow-warm-sm hover:shadow-warm-md transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            <span>{isLoading ? 'Creating Account...' : `Register as ${role === 'donor' ? 'Food Donor' : 'NGO Manager'}`}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-brand-muted">
          Already have an account?{' '}
          <button onClick={onNavigateLogin} className="font-bold text-brand-orange hover:underline ml-1">
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
};
