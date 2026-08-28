import React, { useState } from 'react';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';

interface ForgotPasswordProps {
  onNavigateLogin: () => void;
}

export const ForgotPassword: React.FC<ForgotPasswordProps> = ({ onNavigateLogin }) => {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) setSent(true);
  };

  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl border border-amber-900/5 shadow-warm-lg p-8">
        <button
          onClick={onNavigateLogin}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-muted hover:text-brand-orange mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Login</span>
        </button>

        <h1 className="text-2xl font-black text-brand-text">Reset Password</h1>
        <p className="text-sm text-brand-muted mt-1 mb-6">
          Enter your registered email address to receive password recovery instructions.
        </p>

        {sent ? (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center space-y-3">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
            <h3 className="font-bold text-emerald-900">Recovery Email Sent!</h3>
            <p className="text-xs text-emerald-700">
              We sent a reset link to <strong className="font-semibold">{email}</strong>. Check your inbox to set a new password.
            </p>
            <button
              onClick={onNavigateLogin}
              className="mt-4 px-4 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-warm-sm"
            >
              Return to Sign In
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
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
                  placeholder="name@organization.com"
                  className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:bg-white focus:border-brand-orange focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-brand-orange hover:bg-brand-deep text-white font-extrabold text-sm rounded-xl shadow-warm-sm hover:shadow-warm-md transition-all active:scale-95"
            >
              Send Reset Link
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
