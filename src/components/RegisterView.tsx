import React, { useState } from 'react';
import { MediStockLogo } from './MediStockLogo';
import { Mail, Lock, User as UserIcon, Phone, ArrowRight, ShieldAlert } from 'lucide-react';
import { User } from '../types/pharmacy';
import { Language, getTranslation } from '../utils/i18n';

interface RegisterViewProps {
  onSuccessfulRegistration: (user: User) => void;
  onNavigateLogin: () => void;
  onNavigateLanding: () => void;
  onCreateCustomerUser: (userData: { name: string; email: string; phone: string; password: string }) => User;
  lang?: Language;
  onToggleLang?: () => void;
}

export const RegisterView: React.FC<RegisterViewProps> = ({
  onSuccessfulRegistration,
  onNavigateLogin,
  onNavigateLanding,
  onCreateCustomerUser,
  lang = 'en',
  onToggleLang,
}) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreeTerms) {
      setError(
        lang === 'bn'
          ? 'আপনাকে অবশ্যই সেবার শর্তাবলী ও গোপনীয়তা নীতি মেনে নিতে হবে।'
          : 'You must agree to the Terms of Service and Privacy Policy.'
      );
      return;
    }
    setLoading(true);
    setError(null);

    setTimeout(() => {
      try {
        const newUser = onCreateCustomerUser({
          name: fullName || 'Valued Customer',
          email: email || `customer_${Date.now()}@medistock.com.bd`,
          phone: phone || '+8801700000000',
          password: password || 'secure123',
        });
        setLoading(false);
        onSuccessfulRegistration(newUser);
      } catch (err: any) {
        setLoading(false);
        setError(err.message || (lang === 'bn' ? 'নিবন্ধন ব্যর্থ হয়েছে।' : 'Registration failed.'));
      }
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#F3F7FA] font-sans flex flex-col justify-between selection:bg-[#079B8C] selection:text-white">
      <header className="flex h-20 w-full items-center justify-between px-6 sm:px-12 bg-white border-b border-slate-200">
        <button onClick={onNavigateLanding} className="flex items-center gap-3">
          <MediStockLogo size="sm" />
        </button>
        <div className="flex items-center gap-4">
          {onToggleLang && (
            <button
              onClick={onToggleLang}
              className="flex items-center gap-1.5 rounded-xl border border-[#079B8C]/30 bg-[#DDF6EF]/60 px-3 py-1.5 text-xs font-bold text-[#079B8C] hover:bg-[#DDF6EF] transition-colors shadow-2xs"
            >
              <span>🌐</span>
              <span>{lang === 'en' ? 'বাংলা' : 'English'}</span>
            </button>
          )}
          <button
            onClick={onNavigateLogin}
            className="text-xs font-bold text-[#079B8C] hover:underline"
          >
            {getTranslation('auth.alreadyHaveAccount', lang)}
          </button>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-lg rounded-3xl bg-white p-8 sm:p-10 shadow-2xl border border-slate-200 space-y-6">
          <div className="text-center space-y-2">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#DDF6EF] text-[#079B8C] border border-[#079B8C]/20 shadow-xs">
              <UserIcon className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-black text-[#123B5D] tracking-tight">
              {getTranslation('auth.registerTitle', lang)}
            </h1>
            <p className="text-xs text-slate-500">
              {getTranslation('auth.registerDesc', lang)}
            </p>
          </div>

          <div className="rounded-2xl bg-amber-50 border border-amber-200 p-3 text-[11px] text-amber-900 flex items-start gap-2">
            <ShieldAlert className="h-4 w-4 text-[#E9A23B] shrink-0 mt-0.5" />
            <span>
              {lang === 'bn'
                ? 'পাবলিক নিবন্ধন কেবল গ্রাহক অ্যাকাউন্টের জন্য। স্টাফ ও প্রশাসনিক ভূমিকার জন্য অনুমোদিত আমন্ত্রণ প্রয়োজন।'
                : 'Public registration creates a Customer account only. Staff and administrative roles require authorized corporate invitation.'}
            </span>
          </div>

          {error && (
            <div className="rounded-xl bg-rose-50 border border-rose-200 p-3.5 text-xs font-semibold text-[#D64545]">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4 text-xs text-slate-800">
            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">
                {getTranslation('auth.fullName', lang)}
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={lang === 'bn' ? 'যেমন: তানভীর আহমেদ' : 'e.g. Tanvir Ahmed'}
                  className="w-full rounded-xl border border-slate-300 bg-white pl-10 pr-4 py-3 text-xs text-slate-900 focus:border-[#079B8C] focus:outline-none"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">
                  {getTranslation('auth.email', lang)}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tanvir@gmail.com"
                    className="w-full rounded-xl border border-slate-300 bg-white pl-10 pr-4 py-3 text-xs text-slate-900 focus:border-[#079B8C] focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">
                  {getTranslation('auth.phone', lang)}
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="01712345678"
                    className="w-full rounded-xl border border-slate-300 bg-white pl-10 pr-4 py-3 text-xs text-slate-900 focus:border-[#079B8C] focus:outline-none"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">
                {getTranslation('auth.password', lang)}
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={lang === 'bn' ? 'কমপক্ষে ৬ অক্ষর' : 'At least 6 characters'}
                  className="w-full rounded-xl border border-slate-300 bg-white pl-10 pr-4 py-3 text-xs text-slate-900 focus:border-[#079B8C] focus:outline-none"
                  required
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="terms"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="rounded border-slate-300 text-[#079B8C] focus:ring-[#079B8C]"
              />
              <label htmlFor="terms" className="text-[11px] text-slate-600">
                {getTranslation('auth.agreeTerms', lang)}
              </label>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-[#079B8C] hover:bg-[#058276] text-white font-bold rounded-xl text-xs shadow-md transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <span>{loading ? getTranslation('common.loading', lang) : getTranslation('auth.createAccountBtn', lang)}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </form>

          <div className="border-t border-slate-100 pt-4 text-center text-xs text-slate-500">
            {getTranslation('auth.alreadyHaveAccount', lang)}{' '}
            <button
              onClick={onNavigateLogin}
              className="font-bold text-[#079B8C] hover:underline"
            >
              {getTranslation('nav.login', lang)}
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
