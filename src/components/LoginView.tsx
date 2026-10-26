import React, { useState } from 'react';
import { MediStockLogo } from './MediStockLogo';
import { Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, AlertCircle, CheckCircle2, LogIn } from 'lucide-react';
import { User } from '../types/pharmacy';

interface LoginViewProps {
  onSuccessfulLogin: (user: User) => void;
  onNavigateRegister: () => void;
  onNavigateLanding: () => void;
  allUsers: User[];
  onGoogleSignIn?: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({
  onSuccessfulLogin,
  onNavigateRegister,
  onNavigateLanding,
  allUsers,
  onGoogleSignIn,
}) => {
  const [emailOrPhone, setEmailOrPhone] = useState('owner@medistock.com');
  const [password, setPassword] = useState('••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    setTimeout(() => {
      setLoading(false);
      // Find user in allUsers
      const matched = allUsers.find(
        (u) =>
          u.email.toLowerCase() === emailOrPhone.toLowerCase() ||
          u.phone === emailOrPhone ||
          u.name.toLowerCase().includes(emailOrPhone.toLowerCase())
      );

      if (matched) {
        onSuccessfulLogin(matched);
      } else {
        // Default to first user or create a temporary session
        onSuccessfulLogin(allUsers[0]);
      }
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#F3F7FA] font-sans flex flex-col justify-between selection:bg-[#079B8C] selection:text-white">
      <header className="flex h-20 w-full items-center justify-between px-6 sm:px-12 bg-white border-b border-slate-200">
        <button onClick={onNavigateLanding} className="flex items-center gap-3">
          <MediStockLogo size="sm" />
        </button>
        <button
          onClick={onNavigateRegister}
          className="text-xs font-bold text-[#079B8C] hover:underline"
        >
          Create Customer Account
        </button>
      </header>

      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md rounded-3xl bg-white p-8 sm:p-10 shadow-2xl border border-slate-200 space-y-6">
          <div className="text-center space-y-2">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#DDF6EF] text-[#079B8C] border border-[#079B8C]/20 shadow-xs">
              <LogIn className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-black text-[#123B5D] tracking-tight">Sign In to MediStock</h1>
            <p className="text-xs text-slate-500">
              Access your role-authorized workspace, POS billing, or customer storefront.
            </p>
          </div>

          {error && (
            <div className="rounded-xl bg-rose-50 border border-rose-200 p-3.5 text-xs font-semibold text-[#D64545] flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4 text-xs text-slate-800">
            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">Email Address or Phone Number</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={emailOrPhone}
                  onChange={(e) => setEmailOrPhone(e.target.value)}
                  placeholder="e.g. owner@medistock.com or +880..."
                  className="w-full rounded-xl border border-slate-300 bg-white pl-10 pr-4 py-3 text-xs text-slate-900 focus:border-[#079B8C] focus:outline-none"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-700">Password</label>
                <span className="text-[11px] text-[#079B8C] hover:underline cursor-pointer">
                  Forgot password?
                </span>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-300 bg-white pl-10 pr-10 py-3 text-xs text-slate-900 focus:border-[#079B8C] focus:outline-none"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-[#079B8C] hover:bg-[#058276] text-white font-bold rounded-xl text-xs shadow-md transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <span>{loading ? 'Authenticating Session...' : 'Sign In'}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            {onGoogleSignIn && (
              <button
                type="button"
                onClick={onGoogleSignIn}
                className="w-full py-3 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-bold rounded-xl text-xs shadow-2xs transition-colors flex items-center justify-center gap-2"
              >
                <span>Sign in with Google</span>
              </button>
            )}
          </form>

          <div className="border-t border-slate-100 pt-4 text-center text-xs text-slate-500">
            Don't have a customer account?{' '}
            <button
              onClick={onNavigateRegister}
              className="font-bold text-[#079B8C] hover:underline"
            >
              Create Account
            </button>
          </div>
        </div>
      </main>

      <footer className="py-6 text-center text-xs text-slate-400">
        MediStock Pharmacy Enterprise Security · DGDA Compliant
      </footer>
    </div>
  );
};
