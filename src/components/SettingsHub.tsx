import React, { useState } from 'react';
import { User, Branch, ApprovalRequest } from '../types/pharmacy';
import {
  Settings,
  Building2,
  Users,
  Shield,
  CreditCard,
  Sliders,
  Terminal,
  Globe,
  Sun,
  Check,
  CheckCircle2,
  Clock,
  Coins,
} from 'lucide-react';
import { BranchManagementView } from './BranchManagementView';
import { PermissionManagementView } from './PermissionManagementView';
import { ApprovalsView } from './ApprovalsView';
import { PaymentSettingsView } from './PaymentSettingsView';
import { DeveloperControlCenterView } from './DeveloperControlCenterView';
import { AutomatedTestRunnerView } from './AutomatedTestRunnerView';
import { OfflineArchitectureView } from './OfflineArchitectureView';
import { Language, getTranslation } from '../utils/i18n';

interface SettingsHubProps {
  currentUser: User;
  branches: Branch[];
  allUsers: User[];
  activeBranchId: string | null;
  approvals: ApprovalRequest[];
  onReviewApproval: (id: string, decision: 'APPROVED' | 'REJECTED', notes?: string) => Promise<void>;
  onAddBranch: (newBranch: Partial<Branch>) => Promise<Branch>;
  onUserSwitched: (user: User) => void;
  lang: Language;
  onToggleLang: () => void;
}

export const SettingsHub: React.FC<SettingsHubProps> = ({
  currentUser,
  branches,
  allUsers,
  activeBranchId,
  approvals,
  onReviewApproval,
  onAddBranch,
  onUserSwitched,
  lang,
  onToggleLang,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<
    'preferences' | 'branches' | 'staff' | 'integrations' | 'security' | 'advanced'
  >('preferences');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="p-2.5 rounded-xl bg-[#079B8C]/10 text-[#079B8C]">
            <Settings className="h-6 w-6" />
          </span>
          <div>
            <h1 className="text-xl font-bold text-[#123B5D]">
              {getTranslation('settings.title', lang)}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {getTranslation('settings.desc', lang)}
            </p>
          </div>
        </div>

        {/* Quick Language Toggle in Hub Header */}
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleLang}
            className="flex items-center gap-1.5 rounded-xl border border-[#079B8C]/30 bg-[#DDF6EF]/80 px-3.5 py-2 text-xs font-bold text-[#079B8C] hover:bg-[#DDF6EF] transition-colors shadow-2xs"
          >
            <Globe className="h-4 w-4" />
            <span>{lang === 'en' ? '🌐 বাংলা (Switch to Bangla)' : '🌐 English (ইংরেজি)'}</span>
          </button>
        </div>
      </div>

      {/* Sub-navigation tabs */}
      <div className="flex flex-wrap items-center gap-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-xs">
        <button
          onClick={() => setActiveSubTab('preferences')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'preferences'
              ? 'bg-[#079B8C] text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Sliders className="h-4 w-4" />
          <span>{getTranslation('settings.preferences', lang)}</span>
        </button>

        <button
          onClick={() => setActiveSubTab('branches')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'branches'
              ? 'bg-[#079B8C] text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Building2 className="h-4 w-4" />
          <span>{getTranslation('settings.branches', lang)}</span>
        </button>

        <button
          onClick={() => setActiveSubTab('staff')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'staff'
              ? 'bg-[#079B8C] text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Users className="h-4 w-4" />
          <span>{getTranslation('settings.staff', lang)}</span>
        </button>

        <button
          onClick={() => setActiveSubTab('integrations')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'integrations'
              ? 'bg-[#079B8C] text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <CreditCard className="h-4 w-4" />
          <span>{getTranslation('settings.integrations', lang)}</span>
        </button>

        <button
          onClick={() => setActiveSubTab('security')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'security'
              ? 'bg-[#079B8C] text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Shield className="h-4 w-4" />
          <span>{getTranslation('settings.security', lang)}</span>
        </button>

        <button
          onClick={() => setActiveSubTab('advanced')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'advanced'
              ? 'bg-[#123B5D] text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Terminal className="h-4 w-4" />
          <span>{getTranslation('settings.advanced', lang)}</span>
        </button>
      </div>

      {/* Sub-tab Content */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        {activeSubTab === 'preferences' && (
          <div className="space-y-6 max-w-2xl">
            <div>
              <h3 className="font-bold text-sm text-[#123B5D]">
                {lang === 'bn' ? 'ব্যবহারকারীর পছন্দ ও ভাষা সেটিংস' : 'User Preferences & Language Settings'}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {lang === 'bn'
                  ? 'প্ল্যাটফর্মের ভাষা, আঞ্চলিক সময় এবং মুদ্রা সেটিংস কনফিগার করুন।'
                  : 'Configure application localization, regional time zone, and Bangladesh currency.'}
              </p>
            </div>

            {/* Language Selection Card */}
            <div className="rounded-2xl border border-slate-200 p-5 space-y-4 bg-slate-50/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-[#079B8C]/10 text-[#079B8C]">
                    <Globe className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-[#123B5D]">
                      {getTranslation('settings.langTitle', lang)}
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      {getTranslation('settings.langDesc', lang)}
                    </p>
                  </div>
                </div>
                <span className="text-[11px] font-mono font-bold text-[#079B8C] bg-[#DDF6EF] px-2.5 py-1 rounded-full border border-[#079B8C]/20">
                  {lang === 'en' ? 'Active: English' : 'সক্রিয়: বাংলা'}
                </span>
              </div>

              {/* Language Options Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    if (lang !== 'en') onToggleLang();
                  }}
                  className={`p-4 rounded-xl border text-left transition-all flex items-start justify-between ${
                    lang === 'en'
                      ? 'border-[#079B8C] bg-[#DDF6EF]/40 shadow-xs'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-base select-none">🇬🇧</span>
                      <span className="font-bold text-xs text-slate-800">English</span>
                    </div>
                    <p className="text-[11px] text-slate-500">International English (EN-US)</p>
                  </div>
                  {lang === 'en' && <CheckCircle2 className="h-5 w-5 text-[#079B8C] shrink-0" />}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (lang !== 'bn') onToggleLang();
                  }}
                  className={`p-4 rounded-xl border text-left transition-all flex items-start justify-between ${
                    lang === 'bn'
                      ? 'border-[#079B8C] bg-[#DDF6EF]/40 shadow-xs'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-base select-none">🇧🇩</span>
                      <span className="font-bold text-xs text-slate-800">বাংলা (Bangla)</span>
                    </div>
                    <p className="text-[11px] text-slate-500">বাংলাদেশ প্রমিত বাংলা (BN-BD)</p>
                  </div>
                  {lang === 'bn' && <CheckCircle2 className="h-5 w-5 text-[#079B8C] shrink-0" />}
                </button>
              </div>
            </div>

            {/* Regional & Financial Standards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-[#F3F7FA] border border-slate-200 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-teal-100/60 text-[#079B8C]">
                  <Clock className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    {lang === 'bn' ? 'টাইমজোন' : 'Timezone'}
                  </span>
                  <span className="font-mono text-xs font-bold text-[#123B5D]">
                    Asia/Dhaka (GMT+6)
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#F3F7FA] border border-slate-200 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-teal-100/60 text-[#079B8C]">
                  <Coins className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    {lang === 'bn' ? 'মুদ্রা' : 'Currency'}
                  </span>
                  <span className="font-mono text-xs font-bold text-[#123B5D]">
                    Bangladeshi Taka — ৳ (BDT)
                  </span>
                </div>
              </div>
            </div>

            {/* Theme & Palette info */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-[#F3F7FA] border border-slate-200">
              <div className="flex items-center gap-3">
                <Sun className="h-5 w-5 text-[#079B8C]" />
                <div>
                  <span className="font-bold text-xs text-slate-800 block">
                    {lang === 'bn' ? 'থিম ও ব্র্যান্ড প্যালেট' : 'Theme & Color Palette'}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    {lang === 'bn'
                      ? 'মেডিসটক নেভি, টিল ও মিন্ট ক্লিনিকাল থিম'
                      : 'MediStock Navy, Teal & Mint Clinical Palette'}
                  </span>
                </div>
              </div>
              <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-lg font-mono font-bold text-xs">
                {lang === 'bn' ? 'সক্রিয়' : 'Active'}
              </span>
            </div>
          </div>
        )}

        {activeSubTab === 'branches' && (
          <BranchManagementView
            branches={branches}
            batches={[]}
            currentUser={currentUser}
            onAddBranch={onAddBranch}
          />
        )}

        {activeSubTab === 'staff' && (
          <PermissionManagementView
            currentUser={currentUser}
            branches={branches}
            allUsers={allUsers}
          />
        )}

        {activeSubTab === 'integrations' && (
          <PaymentSettingsView
            currentUser={currentUser}
          />
        )}

        {activeSubTab === 'security' && (
          <ApprovalsView
            currentUser={currentUser}
            activeBranchId={activeBranchId}
            approvals={approvals}
            branches={branches}
            onReviewApproval={onReviewApproval}
          />
        )}

        {activeSubTab === 'advanced' && (
          <div className="space-y-8">
            <DeveloperControlCenterView
              currentUser={currentUser}
              allUsers={allUsers}
              onUserSwitched={onUserSwitched}
            />
            <AutomatedTestRunnerView />
            <OfflineArchitectureView
              activeBranch={branches.find((b) => b.id === activeBranchId)}
            />
          </div>
        )}
      </div>
    </div>
  );
};
