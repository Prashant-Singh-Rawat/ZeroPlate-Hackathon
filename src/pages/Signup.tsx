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
    <div className="min-h-screen bg-[#FDFBF7] dark:bg-[#0B1120] text-[#1F2937] dark:text-slate-100 flex items-center justify-center p-4 py-8 transition-colors duration-200">
      <div className="max-w-xl w-full bg-white dark:bg-[#1E293B] rounded-3xl border border-gray-200 dark:border-slate-700 shadow-xl p-6 sm:p-8 space-y-6">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-9 h-9 bg-orange-500 rounded-xl flex items-center justify-center text-white shadow-md">
              <Utensils className="w-5 h-5" />
            </div>
            <span className="text-xl font-black text-gray-900 dark:text-white">Zero<span className="text-orange-500">Plate</span></span>
          </div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">Join ZeroPlate</h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-300 mt-1">Select your role to start sharing or collecting food.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Interactive Role Selection Cards (§4) */}
          <div>
            <label className="block text-xs font-bold text-gray-900 dark:text-white uppercase mb-2">
              Select Your Role
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div
                onClick={() => setRole('donor')}
                className={`cursor-pointer p-4 rounded-2xl border-2 transition-all flex flex-col justify-between ${
                  role === 'donor'
                    ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/40 shadow-sm'
                    : 'border-gray-200 dark:border-slate-700 hover:border-orange-300 dark:hover:border-orange-600 bg-white dark:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2.5 bg-orange-100 dark:bg-orange-950/80 text-orange-600 dark:text-orange-400 rounded-xl">
                    <Utensils className="w-5 h-5" />
                  </div>
                  {role === 'donor' && <CheckCircle2 className="w-5 h-5 text-orange-500 fill-orange-100 dark:fill-orange-950" />}
                </div>
                <div>
                  <h3 className="font-extrabold text-gray-900 dark:text-white text-base">FOOD DONOR</h3>
                  <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">I have surplus food to donate</p>
                </div>
              </div>

              <div
                onClick={() => setRole('ngo')}
                className={`cursor-pointer p-4 rounded-2xl border-2 transition-all flex flex-col justify-between ${
                  role === 'ngo'
                    ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/40 shadow-sm'
                    : 'border-gray-200 dark:border-slate-700 hover:border-orange-300 dark:hover:border-orange-600 bg-white dark:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2.5 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 rounded-xl">
                    <HeartHandshake className="w-5 h-5" />
                  </div>
                  {role === 'ngo' && <CheckCircle2 className="w-5 h-5 text-orange-500 fill-orange-100 dark:fill-orange-950" />}
                </div>
                <div>
                  <h3 className="font-extrabold text-gray-900 dark:text-white text-base">NGO MANAGER</h3>
                  <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">We collect & distribute food</p>
                </div>
              </div>
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-900 dark:text-white uppercase mb-1">
                {role === 'donor' ? 'Organization / Donor Name' : 'NGO Name'}
              </label>
              <div className="relative">
                <Building className="w-5 h-5 text-gray-400 dark:text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder={role === 'donor' ? 'e.g. SpiceVilla Restaurant' : 'e.g. Hope Foundation'}
                  className="w-full pl-11 pr-4 py-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-sm font-medium text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-slate-800 focus:border-orange-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-900 dark:text-white uppercase mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 text-gray-400 dark:text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="contact@organization.com"
                  className="w-full pl-11 pr-4 py-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-sm font-medium text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-slate-800 focus:border-orange-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-900 dark:text-white uppercase mb-1">
                Primary Location
              </label>
              <div className="relative">
                <MapPin className="w-5 h-5 text-gray-400 dark:text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  required
                  placeholder="e.g. Bandra West, Mumbai"
                  className="w-full pl-11 pr-4 py-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-sm font-medium text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-slate-800 focus:border-orange-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-900 dark:text-white uppercase mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-5 h-5 text-gray-400 dark:text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-sm font-medium text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-slate-800 focus:border-orange-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-sm rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
          >
            <span>{isLoading ? 'Creating Account...' : `Register as ${role === 'donor' ? 'Food Donor' : 'NGO Manager'}`}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-gray-500 dark:text-slate-400">
          Already have an account?{' '}
          <button onClick={onNavigateLogin} className="font-bold text-orange-500 hover:underline ml-1 cursor-pointer">
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
};
