import React, { useState } from 'react';
import { User, Branch } from '../types/pharmacy';
import { UserCheck, Building2, ShoppingBag, ShieldCheck, ChevronDown, Check, LogIn, LogOut, Cloud, Search, Bell } from 'lucide-react';
import { User as FirebaseUser } from 'firebase/auth';
import { MediStockLogo } from './MediStockLogo';
import { UserProfileModal } from './UserProfileModal';
import { getTranslation, Language } from '../utils/i18n';

interface HeaderProps {
  currentUser: User;
  allUsers: User[];
  branches: Branch[];
  activeBranchId: string | null;
  onSwitchUser: (userId: string, branchId?: string | null) => void;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  isStorefrontMode: boolean;
  onToggleStorefront: () => void;
  cartCount?: number;
  firebaseConnected?: boolean;
  firebaseAuthUser?: FirebaseUser | null;
  onGoogleSignIn?: () => void;
  onGoogleSignOut?: () => void;
  onOpenSearch?: () => void;
  notificationsCount?: number;
  onOpenNotifications?: () => void;
  onSignOut?: () => void;
  lang?: 'en' | 'bn';
  onToggleLang?: () => void;
  onToggleMobileMenu?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  allUsers,
  branches,
  activeBranchId,
  onSwitchUser,
  activeTab,
  onSelectTab,
  isStorefrontMode,
  onToggleStorefront,
  cartCount = 0,
  firebaseConnected = false,
  firebaseAuthUser = null,
  onGoogleSignIn,
  onGoogleSignOut,
  onOpenSearch,
  notificationsCount = 0,
  onOpenNotifications,
  onSignOut,
  lang = 'en',
  onToggleLang,
  onToggleMobileMenu,
}) => {
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const activeBranch = branches.find((b) => b.id === activeBranchId);

  const getRoleBadgeLabel = (role: string) => {
    const key = `header.role.${role}`;
    return getTranslation(key, lang as Language) || role;
  };

  return (
    <>
      {/* Strict 1-row, 3-zone Top Bar Contract */}
      <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between gap-6 border-b border-slate-200 bg-white/95 px-6 backdrop-blur-md">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3">
          {onToggleMobileMenu && (
            <button
              onClick={onToggleMobileMenu}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
              title="Open Navigation Menu"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          )}
          <button
            onClick={() => {
              if (isStorefrontMode) onToggleStorefront();
              onSelectTab('dashboard');
            }}
            className="flex items-center gap-2.5 transition-transform hover:scale-[1.01]"
          >
            <MediStockLogo size="sm" />
          </button>
        </div>

        {/* Zone 2: Dual-Experience Switcher */}
        <div className="hidden lg:flex items-center gap-5">
          {/* Connected Experience Toggle Button */}
          <button
            onClick={onToggleStorefront}
            className={`flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all shadow-2xs border ${
              isStorefrontMode
                ? 'bg-[#123B5D] text-white border-[#123B5D] hover:bg-[#1b4b74]'
                : 'bg-[#DDF6EF] text-[#079B8C] border-[#079B8C]/30 hover:bg-[#c9f1e6]'
            }`}
          >
            <ShoppingBag className="h-4 w-4" />
            <span>
              {isStorefrontMode
                ? getTranslation('header.dashboardSwitch', lang as Language)
                : getTranslation('header.storefrontSwitch', lang as Language)}
            </span>
            {cartCount > 0 && (
              <span className="rounded-full bg-[#079B8C] text-white px-1.5 py-0.2 text-[10px] font-mono">
                {cartCount}
              </span>
            )}
          </button>
        </div>

        {/* Zone 3: 1 primary action area */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Global Search Button */}
          {onOpenSearch && (
            <button
              onClick={onOpenSearch}
              className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-600 hover:border-[#168C8C] hover:text-[#17365D] transition-colors shadow-2xs"
              title={getTranslation('header.searchTitle', lang as Language)}
            >
              <Search className="h-3.5 w-3.5 text-[#168C8C]" />
              <span className="hidden md:inline text-[11px]">{getTranslation('header.search', lang as Language)}</span>
              <kbd className="hidden md:inline rounded bg-slate-100 px-1 py-0.5 text-[9px] font-mono text-slate-500 border border-slate-200">
                ⌘K
              </kbd>
            </button>
          )}

          {/* Notifications Button */}
          {onOpenNotifications && (
            <button
              onClick={onOpenNotifications}
              className="relative rounded-lg border border-slate-200 bg-white p-1.5 text-slate-600 hover:bg-slate-50 hover:text-[#17365D] transition-colors shadow-2xs"
              title="Notifications"
            >
              <Bell className="h-4 w-4" />
              {notificationsCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#C62828] text-[9px] font-mono font-bold text-white">
                  {notificationsCount}
                </span>
              )}
            </button>
          )}

          {/* Language Toggle */}
          {onToggleLang && (
            <button
              onClick={onToggleLang}
              className="flex items-center gap-1.5 rounded-lg border border-[#079B8C]/30 bg-[#DDF6EF]/60 px-2.5 py-1 text-xs font-bold text-[#079B8C] hover:bg-[#DDF6EF] transition-colors shadow-2xs"
              title="Switch language between English and Bangla"
            >
              <span>🌐</span>
              <span>{lang === 'en' ? 'বাংলা' : 'English'}</span>
            </button>
          )}

          {/* Connectivity & Sync Status Indicator */}
          {(() => {
            const [isOnline, setIsOnline] = React.useState<boolean>(navigator.onLine);
            React.useEffect(() => {
              const handleOnline = () => setIsOnline(true);
              const handleOffline = () => setIsOnline(false);
              window.addEventListener('online', handleOnline);
              window.addEventListener('offline', handleOffline);
              return () => {
                window.removeEventListener('online', handleOnline);
                window.removeEventListener('offline', handleOffline);
              };
            }, []);
            return (
              <div
                className="hidden sm:flex items-center gap-1.5 text-[11px] font-mono text-[#17365D] bg-[#EBF1F8] px-2.5 py-1 rounded-md border border-[#17365D]/15 font-medium"
                title={isOnline ? 'Connected to server. All changes synced.' : 'Offline mode. Working with local cache.'}
              >
                <span className={`h-2 w-2 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                <Cloud className="h-3.5 w-3.5 text-[#168C8C]" />
                <span>{isOnline ? getTranslation('header.online', lang as Language) : getTranslation('header.offline', lang as Language)}</span>
              </div>
            );
          })()}

          {/* Google Auth Button (if user is authenticated or wants to sign in) */}
          {firebaseAuthUser ? (
            <button
              onClick={onGoogleSignOut}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
              title={`Logged in as ${firebaseAuthUser.email}. Click to sign out.`}
            >
              {firebaseAuthUser.photoURL ? (
                <img
                  src={firebaseAuthUser.photoURL}
                  alt="avatar"
                  className="h-4 w-4 rounded-full"
                />
              ) : (
                <UserCheck className="h-3.5 w-3.5 text-[#168C8C]" />
              )}
              <span className="font-semibold truncate max-w-[100px] text-[11px]">
                {firebaseAuthUser.displayName?.split(' ')[0] || 'Google User'}
              </span>
              <LogOut className="h-3 w-3 text-slate-400 ml-0.5" />
            </button>
          ) : (
            <button
              onClick={onGoogleSignIn}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
              title="Sign in with Google Account"
            >
              <LogIn className="h-3.5 w-3.5 text-slate-500" />
              <span className="hidden sm:inline">Google Auth</span>
            </button>
          )}

          {/* Role Switcher */}
          <button
            onClick={() => setShowRoleModal(true)}
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-[#F3F6FA] px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-white hover:border-[#17365D]/30 transition-all shadow-2xs whitespace-nowrap shrink-0"
            title="Click to switch between Owner, Branch Manager, Pharmacist, Cashier, or Customer"
          >
            <ShieldCheck className="h-3.5 w-3.5 text-[#168C8C]" />
            <span className="font-bold text-[#17365D]">{currentUser.name.split(' ')[0]}</span>
            <span className="text-slate-300">/</span>
            <span className="text-slate-600">{getRoleBadgeLabel(currentUser.role)}</span>
            <ChevronDown className="h-3 w-3 text-slate-400 ml-0.5" />
          </button>
        </div>
      </header>

      {/* Role & Branch Testing Modal */}
      {showRoleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-[#17365D]">Switch User Role & Branch</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Test role-based access control and branch data isolation
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowRoleModal(false);
                    setShowProfileModal(true);
                  }}
                  className="text-xs font-semibold text-[#079B8C] hover:underline flex items-center gap-1 bg-[#DDF6EF] px-2.5 py-1 rounded-md"
                >
                  <UserCheck className="h-3.5 w-3.5" />
                  <span>Edit Profile</span>
                </button>
                <button
                  onClick={() => setShowRoleModal(false)}
                  className="text-xs font-medium text-slate-400 hover:text-slate-700"
                >
                  Close
                </button>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Select Persona to Simulate
              </label>
              <div className="space-y-1.5 max-h-64 overflow-y-auto">
                {allUsers.map((u) => {
                  const isSelected = u.id === currentUser.id;
                  return (
                    <button
                      key={u.id}
                      onClick={() => {
                        onSwitchUser(u.id, u.branchId);
                        setShowRoleModal(false);
                      }}
                      className={`flex w-full items-center justify-between rounded-lg p-3 text-left transition-colors border ${
                        isSelected
                          ? 'border-[#17365D] bg-[#EBF1F8] text-[#17365D]'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-[#17365D]">{u.name}</span>
                          <span className="text-xs text-slate-500">· {getRoleBadgeLabel(u.role)}</span>
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          {u.branchName || (u.branchId ? 'Assigned Branch' : 'All Branches')}
                          {u.registrationNumber && ` · Lic: ${u.registrationNumber}`}
                        </div>
                      </div>
                      {isSelected && <Check className="h-4 w-4 text-[#168C8C] shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Branch isolation override for Owner/Admin */}
            {(currentUser.role === 'owner' || currentUser.role === 'admin') && (
              <div className="mt-4 border-t border-slate-100 pt-3">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Filter Operations Perspective
                </label>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      onSwitchUser(currentUser.id, null);
                      setShowRoleModal(false);
                    }}
                    className={`rounded-lg px-3 py-2 text-xs font-medium border text-left ${
                      activeBranchId === null
                        ? 'border-[#17365D] bg-[#EBF1F8] text-[#17365D] font-bold'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    🏢 All Branches (Consolidated)
                  </button>
                  {branches.map((b) => (
                    <button
                      key={b.id}
                      onClick={() => {
                        onSwitchUser(currentUser.id, b.id);
                        setShowRoleModal(false);
                      }}
                      className={`rounded-lg px-3 py-2 text-xs font-medium border text-left truncate ${
                        activeBranchId === b.id
                          ? 'border-[#17365D] bg-[#EBF1F8] text-[#17365D] font-bold'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      📍 {b.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {onSignOut && (
              <div className="mt-4 border-t border-slate-100 pt-3">
                <button
                  onClick={() => {
                    setShowRoleModal(false);
                    onSignOut();
                  }}
                  className="w-full py-2.5 bg-rose-50 hover:bg-rose-100 text-[#D64545] font-bold rounded-xl text-xs flex items-center justify-center gap-2 border border-rose-200 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out / Return to Public Home</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Profile & Self-Service Notification Settings Modal */}
      <UserProfileModal
        isOpen={showProfileModal}
        currentUser={currentUser}
        onClose={() => setShowProfileModal(false)}
      />
    </>
  );
};
