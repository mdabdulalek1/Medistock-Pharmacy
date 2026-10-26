import React, { useState } from 'react';
import { User, Branch } from '../types/pharmacy';
import { updateUserProfile } from '../services/api';
import {
  User as UserIcon,
  Shield,
  Phone,
  Mail,
  Building2,
  Lock,
  Globe,
  Bell,
  CheckCircle2,
  AlertCircle,
  X,
  Camera,
  LogOut,
  Save,
} from 'lucide-react';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  branches?: Branch[];
  onUserUpdated?: (updatedUser: User) => void;
  onSignOut?: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  branches = [],
  onUserUpdated,
  onSignOut,
}) => {
  const [name, setName] = useState(currentUser.name);
  const [phone, setPhone] = useState(currentUser.phone);
  const [avatar, setAvatar] = useState(currentUser.avatar || '');
  const [language, setLanguage] = useState<'en' | 'bn'>('en');
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  if (!isOpen) return null;

  const userBranch = branches.find((b) => b.id === currentUser.branchId);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setStatusMessage(null);

    try {
      const res = await updateUserProfile({
        name,
        phone,
        avatar,
        preferredLanguage: language,
        emailNotificationEnabled: emailAlerts,
        smsAlertsEnabled: smsAlerts,
      });

      setStatusMessage({ text: 'Profile successfully updated.', type: 'success' });
      if (onUserUpdated) {
        onUserUpdated(res.user);
      }
    } catch (err: any) {
      setStatusMessage({ text: err.message || 'Failed to update profile', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs font-sans">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-[#123B5D] px-6 py-4 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#079B8C] text-white shadow-sm font-bold text-base">
              {currentUser.name.charAt(0)}
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight">Account & Profile Settings</h2>
              <p className="text-xs text-slate-300">Self-service profile preferences & contact information</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-5 text-xs text-slate-800">
          {statusMessage && (
            <div
              className={`rounded-xl p-3 text-xs flex items-center gap-2 ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-50 text-[#168653] border border-emerald-200'
                  : 'bg-rose-50 text-[#D64545] border border-rose-200'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="h-4 w-4 shrink-0" />
              ) : (
                <AlertCircle className="h-4 w-4 shrink-0" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* User Persona & Role Summary Card (Protected) */}
          <div className="rounded-xl border border-slate-200 bg-[#F3F7FA] p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Official Staff Credential
              </span>
              <span className="rounded-full bg-[#123B5D] px-2.5 py-0.5 text-[10px] font-bold text-white uppercase font-mono">
                {currentUser.role.replace('_', ' ')}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-slate-700">
              <div>
                <span className="text-[10px] text-slate-400 block">Assigned Scope</span>
                <span className="font-semibold text-slate-800">
                  {userBranch ? userBranch.name : 'All Branches (HQ Authority)'}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">DGDA Registration</span>
                <span className="font-mono font-semibold text-slate-800">
                  {currentUser.registrationNumber || 'DGDA Registered Staff'}
                </span>
              </div>
            </div>

            {/* Security Notice: Privilege Escalation Prevention */}
            <div className="flex items-start gap-2 rounded-lg bg-white/80 p-2.5 text-[11px] text-slate-500 border border-slate-200/60">
              <Shield className="h-4 w-4 text-[#079B8C] shrink-0 mt-0.5" />
              <span>
                Role elevation, branch reassignment, and financial discount ceilings are strictly governed by the Pharmacy Business Owner and cannot be self-modified.
              </span>
            </div>
          </div>

          {/* Editable Fields */}
          <div className="space-y-3.5">
            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">Full Display Name</label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 py-2 pl-9 pr-3 text-xs font-semibold text-slate-800 focus:border-[#079B8C] focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">Primary Email (Login Account)</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  disabled
                  value={currentUser.email}
                  className="w-full rounded-xl border border-slate-200 bg-slate-100 py-2 pl-9 pr-3 text-xs text-slate-500 cursor-not-allowed"
                />
              </div>
              <span className="text-[10px] text-slate-400 mt-0.5 block">Email changes require re-authentication verification.</span>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">Contact Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 py-2 pl-9 pr-3 text-xs font-mono font-medium text-slate-800 focus:border-[#079B8C] focus:outline-hidden"
                />
              </div>
            </div>

            {/* Language & Regional Preferences */}
            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">Preferred Language</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setLanguage('en')}
                  className={`flex items-center justify-center gap-1.5 rounded-xl border py-2 text-xs font-semibold transition-all ${
                    language === 'en'
                      ? 'border-[#079B8C] bg-[#DDF6EF] text-[#079B8C]'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Globe className="h-3.5 w-3.5" />
                  <span>English</span>
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage('bn')}
                  className={`flex items-center justify-center gap-1.5 rounded-xl border py-2 text-xs font-semibold transition-all ${
                    language === 'bn'
                      ? 'border-[#079B8C] bg-[#DDF6EF] text-[#079B8C]'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Globe className="h-3.5 w-3.5" />
                  <span>বাংলা (Bengali)</span>
                </button>
              </div>
            </div>

            {/* Notification Checkboxes */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="text-[11px] font-bold text-slate-600 block">Notification Preferences</label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={emailAlerts}
                  onChange={(e) => setEmailAlerts(e.target.checked)}
                  className="rounded border-slate-300 text-[#079B8C] focus:ring-[#079B8C]"
                />
                <span className="text-slate-700">Email alerts for low-stock and shift reconciliation summaries</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={smsAlerts}
                  onChange={(e) => setSmsAlerts(e.target.checked)}
                  className="rounded border-slate-300 text-[#079B8C] focus:ring-[#079B8C]"
                />
                <span className="text-slate-700">SMS notifications for emergency recall and stock discrepancy</span>
              </label>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            {onSignOut ? (
              <button
                type="button"
                onClick={onSignOut}
                className="flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-[#D64545] hover:bg-rose-100 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>Log Out</span>
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Close
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="flex items-center gap-1.5 rounded-xl bg-[#079B8C] px-5 py-2 text-xs font-bold text-white hover:bg-[#067d71] transition-all shadow-xs"
              >
                <Save className="h-4 w-4" />
                <span>{isSaving ? 'Saving...' : 'Save Profile'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
