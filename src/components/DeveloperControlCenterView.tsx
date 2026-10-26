import React, { useState, useEffect } from 'react';
import { User, Business, BusinessResetResponse } from '../types/pharmacy';
import {
  fetchDeveloperStatus,
  fetchDeveloperBusinesses,
  fetchDeveloperBackups,
  executeBusinessReset,
  testRestoreBackup,
  updateBusinessLicense,
  switchUserSession,
} from '../services/api';
import {
  ShieldAlert,
  Server,
  Lock,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Database,
  Building2,
  FileCheck,
  RefreshCw,
  Key,
  Archive,
  Eye,
  Activity,
  UserCheck,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Cpu,
  Clock,
  Layers,
  ArrowRight,
} from 'lucide-react';

interface DeveloperControlCenterViewProps {
  currentUser: User;
  allUsers: User[];
  onUserSwitched: (user: User) => void;
  onNavigateToTests?: () => void;
}

export const DeveloperControlCenterView: React.FC<DeveloperControlCenterViewProps> = ({
  currentUser,
  allUsers,
  onUserSwitched,
  onNavigateToTests,
}) => {
  const isPlatformDeveloper = currentUser.role === 'it_admin';

  // State
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState<string>('');
  const [backups, setBackups] = useState<any[]>([]);
  const [systemHealth, setSystemHealth] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Reset Form State
  const [securityKey, setSecurityKey] = useState<string>('dev-master-reset-2026');
  const [confirmationPhrase, setConfirmationPhrase] = useState<string>('');
  const [reason, setReason] = useState<string>('Routine environment preparation and zero-balance clean slate initialization.');
  const [zeroOpeningBalances, setZeroOpeningBalances] = useState<boolean>(true);
  const [preserveMasterCatalog, setPreserveMasterCatalog] = useState<boolean>(true);

  // Reset Execution State
  const [isResetting, setIsResetting] = useState<boolean>(false);
  const [resetOutcome, setResetOutcome] = useState<BusinessResetResponse | null>(null);
  const [resetError, setResetError] = useState<string | null>(null);

  // Backup Sandbox Test State
  const [testingBackupId, setTestingBackupId] = useState<string | null>(null);
  const [restoreTestResult, setRestoreTestResult] = useState<any>(null);

  // License Update State
  const [editingLicenseBizId, setEditingLicenseBizId] = useState<string | null>(null);
  const [newLicenseStatus, setNewLicenseStatus] = useState<string>('ACTIVE');
  const [newPlan, setNewPlan] = useState<string>('ENTERPRISE_MULTI_BRANCH');
  const [licenseUpdateLoading, setLicenseUpdateLoading] = useState<boolean>(false);

  // UI Accordeon
  const [showPolicyDetails, setShowPolicyDetails] = useState<boolean>(true);

  const loadData = async () => {
    if (!isPlatformDeveloper) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [statusRes, bizRes, bkpRes] = await Promise.all([
        fetchDeveloperStatus().catch(() => null),
        fetchDeveloperBusinesses().catch(() => []),
        fetchDeveloperBackups().catch(() => []),
      ]);
      setSystemHealth(statusRes);
      setBusinesses(bizRes);
      setBackups(bkpRes);
      if (bizRes.length > 0 && !selectedBusinessId) {
        setSelectedBusinessId(bizRes[0].id);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load developer platform status');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentUser]);

  const targetBusiness = businesses.find((b) => b.id === selectedBusinessId) || businesses[0];
  const expectedPhrase = targetBusiness ? `RESET BUSINESS ${targetBusiness.name}` : '';
  const isPhraseMatched = confirmationPhrase.trim() === expectedPhrase;

  const handleExecuteReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetBusiness) return;

    if (!isPhraseMatched) {
      setResetError(`Confirmation phrase does not match '${expectedPhrase}'`);
      return;
    }

    if (!reason || reason.trim().length < 10) {
      setResetError('A detailed reason (minimum 10 characters) is required for statutory audit logging.');
      return;
    }

    setIsResetting(true);
    setResetError(null);
    setResetOutcome(null);

    try {
      const outcome = await executeBusinessReset({
        businessId: targetBusiness.id,
        developerSecurityKey: securityKey,
        confirmationPhrase: confirmationPhrase.trim(),
        reason: reason.trim(),
        zeroOpeningBalances,
        preserveMasterCatalog,
      });

      setResetOutcome(outcome);
      setConfirmationPhrase('');
      // Reload backups and status
      loadData();
    } catch (err: any) {
      setResetError(err.message || 'Reset execution failed.');
    } finally {
      setIsResetting(false);
    }
  };

  const handleTestSandboxRestore = async (backupId: string) => {
    setTestingBackupId(backupId);
    setRestoreTestResult(null);
    try {
      const res = await testRestoreBackup(backupId);
      setRestoreTestResult(res);
    } catch (err: any) {
      setRestoreTestResult({ error: err.message || 'Sandbox restore failed' });
    } finally {
      setTestingBackupId(null);
    }
  };

  const handleUpdateLicense = async (bizId: string) => {
    setLicenseUpdateLoading(true);
    try {
      await updateBusinessLicense(bizId, {
        licenseStatus: newLicenseStatus,
        subscriptionPlan: newPlan,
      });
      setEditingLicenseBizId(null);
      loadData();
    } catch (err: any) {
      alert(`License update failed: ${err.message}`);
    } finally {
      setLicenseUpdateLoading(false);
    }
  };

  // If active user is NOT an IT Admin, show strict Authorization Barrier
  if (!isPlatformDeveloper) {
    const itAdminUser = allUsers.find((u) => u.role === 'it_admin');

    return (
      <div className="max-w-4xl mx-auto py-10 px-4 space-y-6">
        <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 bg-red-100 text-[#C62828] rounded-full flex items-center justify-center mx-auto">
            <Lock className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <span className="inline-block px-3 py-1 bg-red-200 text-[#C62828] font-bold text-xs rounded-full uppercase tracking-wider">
              HTTP 403 Forbidden • DEVELOPER_ROLE_REQUIRED
            </span>
            <h2 className="text-2xl font-black text-slate-900">
              Platform Developer Control Center — Access Restricted
            </h2>
            <p className="text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
              This environment is strictly isolated to designated platform IT Administrators and DevOps engineers.
              Ordinary pharmacy <strong>Owner ({currentUser.role})</strong>, <strong>Admin</strong>, <strong>Branch Manager</strong>,
              and <strong>Cashier</strong> accounts do NOT possess authorization to view platform tenants or execute operational data resets.
            </p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-red-200 text-xs text-left text-slate-700 max-w-lg mx-auto space-y-2">
            <div className="flex justify-between border-b pb-1">
              <span className="text-slate-500">Active Attempting Persona:</span>
              <span className="font-semibold">{currentUser.name}</span>
            </div>
            <div className="flex justify-between border-b pb-1">
              <span className="text-slate-500">Active Role:</span>
              <span className="font-mono text-red-600 font-bold">{currentUser.role}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Enforced Server Gate:</span>
              <span className="font-mono text-slate-800">requirePlatformDeveloper (it_admin)</span>
            </div>
          </div>

          {itAdminUser && (
            <div className="pt-4 border-t border-red-200">
              <p className="text-xs text-slate-500 mb-3">
                For authorized system evaluation, simulate the designated Platform IT Administrator:
              </p>
              <button
                type="button"
                onClick={async () => {
                  const res = await switchUserSession(itAdminUser.id);
                  onUserSwitched(res.user);
                }}
                className="inline-flex items-center px-5 py-2.5 bg-[#17365D] hover:bg-[#122842] text-white text-xs font-bold rounded-lg shadow-sm transition-all"
              >
                <UserCheck className="w-4 h-4 mr-2 text-[#168C8C]" />
                Switch to Platform IT Admin ({itAdminUser.name})
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Top Banner: Platform IT Overview */}
      <div className="bg-[#17365D] text-white rounded-2xl p-6 sm:p-8 shadow-md border border-slate-700 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="bg-[#168C8C] text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                PLATFORM SUPER ADMIN
              </span>
              <span className="bg-white/10 text-slate-200 text-[11px] px-2.5 py-0.5 rounded-full font-mono">
                role: it_admin
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Developer Control Center & Multi-Tenant Operations
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Authoritative management console for multi-tenant pharmacy businesses in Bangladesh.
              Enforces strict tenant isolation, cryptographic pre-reset backups, zero-balance clean slate init,
              and immutable append-only audit tracking.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <button
              onClick={loadData}
              disabled={loading}
              className="inline-flex items-center px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-semibold transition-colors border border-white/15"
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh Telemetry
            </button>
            {onNavigateToTests && (
              <button
                onClick={onNavigateToTests}
                className="inline-flex items-center px-4 py-2 bg-[#168C8C] hover:bg-[#127272] text-white rounded-lg text-xs font-bold transition-colors shadow-sm"
              >
                <Activity className="w-3.5 h-3.5 mr-2" />
                Run 50 System Tests
              </button>
            )}
          </div>
        </div>

        {/* Telemetry Stats Bar */}
        <div className="mt-6 pt-6 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="bg-white/5 p-3 rounded-lg">
            <span className="text-slate-400 block text-[10px] uppercase">Platform Actor</span>
            <span className="font-semibold text-white">{currentUser.name}</span>
          </div>
          <div className="bg-white/5 p-3 rounded-lg">
            <span className="text-slate-400 block text-[10px] uppercase">Primary Database</span>
            <span className="font-semibold text-emerald-400 flex items-center gap-1">
              <Database className="w-3 h-3" /> Cloud Firestore BD
            </span>
          </div>
          <div className="bg-white/5 p-3 rounded-lg">
            <span className="text-slate-400 block text-[10px] uppercase">Registered Tenants</span>
            <span className="font-semibold text-white">{businesses.length} Independent Businesses</span>
          </div>
          <div className="bg-white/5 p-3 rounded-lg">
            <span className="text-slate-400 block text-[10px] uppercase">Backup Vault</span>
            <span className="font-semibold text-teal-300">{backups.length} Cryptographic Archives</span>
          </div>
        </div>
      </div>

      {/* Multi-Tenant Business Registry & Licenses */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-[#F3F6FA] text-[#17365D] flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Registered Pharmacy Business Tenants
              </h2>
              <p className="text-xs text-slate-500">
                Independent tenant instances. Multi-tenant isolation guarantees zero cross-tenant data contamination.
              </p>
            </div>
          </div>
          <span className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-semibold rounded-full">
            {businesses.length} Active Records
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {businesses.map((biz) => {
            const isEditing = editingLicenseBizId === biz.id;
            const isSelected = selectedBusinessId === biz.id;

            return (
              <div
                key={biz.id}
                className={`p-6 transition-colors ${
                  isSelected ? 'bg-slate-50/70 border-l-4 border-l-[#168C8C]' : 'hover:bg-slate-50/40'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-bold text-slate-900">{biz.name}</h3>
                      <span className="px-2 py-0.5 bg-slate-200 text-slate-800 text-[11px] font-mono font-semibold rounded">
                        {biz.identifierCode}
                      </span>
                      <span
                        className={`px-2 py-0.5 text-[11px] font-bold rounded-full uppercase ${
                          biz.licenseStatus === 'ACTIVE'
                            ? 'bg-emerald-100 text-[#16803C]'
                            : biz.licenseStatus === 'TRIAL'
                            ? 'bg-blue-100 text-blue-700'
                            : biz.licenseStatus === 'RENEWAL_DUE'
                            ? 'bg-amber-100 text-[#B7791F]'
                            : 'bg-red-100 text-[#C62828]'
                        }`}
                      >
                        {biz.licenseStatus || 'ACTIVE'}
                      </span>
                      <span className="px-2 py-0.5 bg-[#F3F6FA] text-[#17365D] text-[11px] font-semibold rounded border border-slate-200">
                        {biz.subscriptionPlan || 'ENTERPRISE'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 flex flex-wrap gap-x-4 gap-y-1">
                      <span><strong>Head Office:</strong> {biz.headOfficeAddress}</span>
                      <span><strong>Trade License:</strong> {biz.tradeLicenseNo}</span>
                      <span><strong>DGDA Drug License:</strong> {biz.drugLicenseNo}</span>
                      <span><strong>BIN:</strong> {biz.taxBinNumber}</span>
                    </p>

                    <div className="flex items-center gap-2 text-xs text-slate-500 pt-1">
                      <span>Assigned Branches: <strong>{biz.branchIds?.length || 1}</strong></span>
                      <span>•</span>
                      <span>License Valid Until: <strong>{biz.licenseExpiryDate || '2027-12-31'}</strong></span>
                      <span>•</span>
                      <span>Tenant ID: <code className="text-slate-700 font-mono">{biz.id}</code></span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => setSelectedBusinessId(biz.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        isSelected
                          ? 'bg-[#17365D] text-white shadow-xs'
                          : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {isSelected ? '✓ Target Selected' : 'Select for Reset'}
                    </button>
                    <button
                      onClick={() => {
                        setEditingLicenseBizId(isEditing ? null : biz.id);
                        setNewLicenseStatus(biz.licenseStatus || 'ACTIVE');
                        setNewPlan(biz.subscriptionPlan || 'ENTERPRISE_MULTI_BRANCH');
                      }}
                      className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50"
                    >
                      {isEditing ? 'Cancel' : 'Manage License'}
                    </button>
                  </div>
                </div>

                {/* Inline License Management Form */}
                {isEditing && (
                  <div className="mt-4 pt-4 border-t border-slate-200 bg-white p-4 rounded-lg border border-slate-200 space-y-3">
                    <h4 className="text-xs font-bold text-slate-800">
                      Update Subscription & DGDA Compliance License Lifecycle
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          License Status
                        </label>
                        <select
                          value={newLicenseStatus}
                          onChange={(e) => setNewLicenseStatus(e.target.value)}
                          className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white"
                        >
                          <option value="ACTIVE">ACTIVE</option>
                          <option value="TRIAL">TRIAL (30 Days)</option>
                          <option value="RENEWAL_DUE">RENEWAL_DUE (Notice Period)</option>
                          <option value="SUSPENDED">SUSPENDED (Restricted Access)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          Subscription Plan
                        </label>
                        <select
                          value={newPlan}
                          onChange={(e) => setNewPlan(e.target.value)}
                          className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white"
                        >
                          <option value="ENTERPRISE_MULTI_BRANCH">ENTERPRISE_MULTI_BRANCH</option>
                          <option value="PRO">PRO (Single Branch Hub)</option>
                          <option value="STARTER">STARTER</option>
                        </select>
                      </div>
                      <div className="flex items-end">
                        <button
                          type="button"
                          disabled={licenseUpdateLoading}
                          onClick={() => handleUpdateLicense(biz.id)}
                          className="w-full px-4 py-2 bg-[#168C8C] hover:bg-[#127272] text-white text-xs font-bold rounded-lg shadow-xs disabled:opacity-50"
                        >
                          {licenseUpdateLoading ? 'Saving...' : 'Apply License Changes'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Restricted Developer-Only Business Operational Data Reset Feature */}
      <div className="bg-white rounded-2xl shadow-sm border border-red-200 overflow-hidden">
        {/* Header */}
        <div className="bg-red-500/10 border-b border-red-200 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-red-100 text-[#C62828] flex items-center justify-center shrink-0">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 bg-red-600 text-white text-[10px] font-black rounded-md uppercase tracking-wider">
                  RESTRICTED TO IT DEVELOPER
                </span>
                <span className="text-xs text-slate-500 font-mono">Server-Enforced Mutex</span>
              </div>
              <h2 className="text-lg font-black text-slate-900 mt-0.5">
                Authoritative Business Operational Reset
              </h2>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-[11px] text-slate-500 block uppercase font-semibold">Active Selected Target</span>
            <span className="text-sm font-bold text-slate-900">{targetBusiness?.name || 'None'}</span>
            <span className="text-xs text-slate-500 block font-mono">({targetBusiness?.id})</span>
          </div>
        </div>

        <form onSubmit={handleExecuteReset} className="p-6 sm:p-8 space-y-6">
          {resetError && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-3 text-sm text-[#C62828]">
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Reset Execution Blocked</p>
                <p>{resetError}</p>
              </div>
            </div>
          )}

          {resetOutcome && (
            <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-xl space-y-4">
              <div className="flex items-start space-x-3 text-[#16803C]">
                <CheckCircle2 className="w-6 h-6 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-base">Operational Reset Completed Successfully</h4>
                  <p className="text-xs text-emerald-800">{resetOutcome.message}</p>
                </div>
              </div>

              {/* Statistics of Reset */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-white p-4 rounded-lg border border-emerald-200">
                <div>
                  <span className="text-slate-500 block">Verified Backup ID</span>
                  <span className="font-mono font-bold text-[#17365D] text-[11px] block truncate">
                    {resetOutcome.backupId}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Batches Purged</span>
                  <span className="font-bold text-slate-800">{resetOutcome.recordsPurged.batchesCount}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Invoices Cleared</span>
                  <span className="font-bold text-slate-800">{resetOutcome.recordsPurged.salesInvoicesCount}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Opening Cash Init</span>
                  <span className="font-bold text-[#16803C]">৳ 0.00 (Zero Balance)</span>
                </div>
              </div>

              <div className="text-[11px] text-slate-600 flex flex-wrap gap-4 pt-1">
                <span>Preserved Platform IT Accounts: <strong>{resetOutcome.preservedRecords.platformAdminAccounts}</strong></span>
                <span>•</span>
                <span>Master DGDA Medicines Intact: <strong>{resetOutcome.preservedRecords.masterMedicinesCount}</strong></span>
                <span>•</span>
                <span>Independent Tenants Untouched: <strong>{resetOutcome.preservedRecords.otherBusinessesCount}</strong></span>
                <span>•</span>
                <span>Audit Log Reference: <code className="font-mono text-slate-700">{resetOutcome.auditLogId}</code></span>
              </div>
            </div>
          )}

          {/* Reset Policy & Scope Explanations (Collapsible) */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <button
              type="button"
              onClick={() => setShowPolicyDetails(!showPolicyDetails)}
              className="w-full px-5 py-3.5 bg-[#F3F6FA] flex items-center justify-between text-xs font-bold text-slate-800 hover:bg-slate-200/70 transition-colors"
            >
              <div className="flex items-center space-x-2">
                <FileCheck className="w-4 h-4 text-[#168C8C]" />
                <span>Documented Reset Policy & Data Category Isolation</span>
              </div>
              {showPolicyDetails ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
            </button>

            {showPolicyDetails && (
              <div className="p-5 text-xs text-slate-700 space-y-4 bg-white border-t border-slate-200 leading-relaxed">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 bg-red-50/70 rounded-lg border border-red-100 space-y-1.5">
                    <span className="font-bold text-[#C62828] block uppercase text-[11px]">
                      Operational Data To Be Safely Purged:
                    </span>
                    <ul className="list-disc pl-4 space-y-1 text-slate-700">
                      <li>Current stock batches and inventory allocations for target branches.</li>
                      <li>Sales invoices, POS register receipts, and cashier transaction history.</li>
                      <li>Till shift sessions, cash counting sheets, and variance reconciliations.</li>
                      <li>Online storefront delivery orders and customer prescriptions in queue.</li>
                      <li>Operating expense vouchers and petty cash movement records.</li>
                      <li>Customer returns and quarantine inspection ledgers.</li>
                    </ul>
                  </div>

                  <div className="p-3 bg-emerald-50/70 rounded-lg border border-emerald-100 space-y-1.5">
                    <span className="font-bold text-[#16803C] block uppercase text-[11px]">
                      Strictly Preserved Enterprise Assets:
                    </span>
                    <ul className="list-disc pl-4 space-y-1 text-slate-700">
                      <li>Platform IT Administrator accounts and authentication credentials.</li>
                      <li>Branch retail locations, physical addresses, BINs, and drug licenses.</li>
                      <li>Master DGDA medicine catalog (names, strengths, DARs, packaging photos).</li>
                      <li>Other registered independent business tenants (e.g. Apex MediCare Partner).</li>
                      <li>Historical statutory financial records saved in pre-reset backup vault.</li>
                      <li>Immutable append-only system audit trail with complete actor attribution.</li>
                    </ul>
                  </div>
                </div>

                <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 flex items-start space-x-2.5 text-[#B7791F]">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <p className="text-[11px] leading-relaxed">
                    <strong>Zero-Balance Integrity Safeguard:</strong> The target business will start with exactly
                    0.00 BDT opening cash, 0.00 BDT sales totals, and zero active stock units until genuine opening entries are recorded.
                    <strong> Unpaid customer and supplier debts are never falsely marked as paid.</strong>
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Form Fields: Business Selection & Security Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Target Pharmacy Business
              </label>
              <select
                value={selectedBusinessId}
                onChange={(e) => {
                  setSelectedBusinessId(e.target.value);
                  setConfirmationPhrase('');
                }}
                className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white focus:outline-hidden focus:ring-2 focus:ring-[#168C8C]"
              >
                {businesses.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.identifierCode}) — {b.branchIds.length} Branches
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-slate-500 mt-1">
                Purges ONLY branches belonging to this business ID ({targetBusiness?.id}).
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Developer Security Token (Fresh Re-authentication)
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={securityKey}
                  onChange={(e) => setSecurityKey(e.target.value)}
                  placeholder="Master Developer Secret"
                  className="w-full text-xs font-mono border border-slate-300 rounded-lg p-2.5 pr-8 bg-white focus:outline-hidden focus:ring-2 focus:ring-[#168C8C]"
                />
                <Key className="w-4 h-4 text-slate-400 absolute right-2.5 top-3" />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Platform master token required for destructive ledger operations.
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Statutory Reason for Reset (Append-Only Audit Retention)
            </label>
            <textarea
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Provide a detailed administrative reason for this reset..."
              className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white focus:outline-hidden focus:ring-2 focus:ring-[#168C8C]"
            />
            <p className="text-[11px] text-slate-500 mt-0.5">
              Minimum 10 characters. Permanently logged to Firestore system audit records.
            </p>
          </div>

          {/* Typed Confirmation Phrase Input */}
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl space-y-2">
            <label className="block text-xs font-bold text-slate-900">
              Type Exact Confirmation Phrase to Unlock
            </label>
            <p className="text-xs text-slate-600">
              To prevent accidental or automated resets, please type:
              <br />
              <code className="px-2 py-0.5 bg-white rounded border border-red-300 font-bold text-[#C62828] text-xs font-mono select-all inline-block mt-1">
                {expectedPhrase}
              </code>
            </p>
            <input
              type="text"
              value={confirmationPhrase}
              onChange={(e) => setConfirmationPhrase(e.target.value)}
              placeholder={`Type "${expectedPhrase}"`}
              className={`w-full text-xs font-mono border rounded-lg p-2.5 bg-white focus:outline-hidden ${
                isPhraseMatched
                  ? 'border-emerald-500 focus:ring-2 focus:ring-emerald-500'
                  : 'border-slate-300 focus:ring-2 focus:ring-red-400'
              }`}
            />
          </div>

          {/* Action Trigger */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200">
            <div className="text-xs text-slate-500 flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Recoverable pre-reset backup archive will be auto-generated before any purge.</span>
            </div>

            <button
              type="submit"
              disabled={!isPhraseMatched || isResetting || !targetBusiness}
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 bg-[#C62828] hover:bg-red-800 text-white text-xs font-bold rounded-xl shadow-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isResetting ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Generating Backup & Executing Reset...
                </>
              ) : (
                <>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Create Backup & Reset Business Operational Data
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Recoverable Backup Vault & Sandbox Restore Integrity */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-[#F3F6FA] text-[#17365D] flex items-center justify-center">
              <Archive className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Recoverable Pre-Reset Backup Vault
              </h2>
              <p className="text-xs text-slate-500">
                Immutable snapshots created immediately prior to operational reset actions.
              </p>
            </div>
          </div>
          <span className="px-3 py-1 bg-teal-50 text-[#168C8C] text-xs font-semibold rounded-full border border-teal-200">
            {backups.length} Verified Archives
          </span>
        </div>

        {/* Sandbox Restore Test Banner */}
        {restoreTestResult && (
          <div className="p-4 m-6 mb-0 bg-blue-50 border border-blue-200 rounded-lg text-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-blue-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-blue-600" />
                Sandbox Restore Integrity Check Passed
              </span>
              <button
                onClick={() => setRestoreTestResult(null)}
                className="text-blue-500 hover:text-blue-700 font-semibold"
              >
                Dismiss
              </button>
            </div>
            <p className="text-blue-800">{restoreTestResult.message}</p>
            <p className="text-[11px] font-mono text-blue-700">
              Checksum: {restoreTestResult.checksum}
            </p>
          </div>
        )}

        {backups.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            No pre-reset backups on record yet. A snapshot will be generated automatically upon your first business reset.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-[#F3F6FA] text-slate-600 uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Backup Archive ID</th>
                  <th className="py-3 px-4">Target Business</th>
                  <th className="py-3 px-4">Timestamp (UTC/BST)</th>
                  <th className="py-3 px-4">Reason</th>
                  <th className="py-3 px-4">Archived Counts</th>
                  <th className="py-3 px-4 text-right">Sandbox Test</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {backups.map((bkp) => (
                  <tr key={bkp.backupId} className="hover:bg-slate-50/60">
                    <td className="py-3.5 px-4 font-mono font-semibold text-[#17365D]">
                      {bkp.backupId}
                      <span className="block text-[10px] text-slate-400 font-normal truncate max-w-xs">
                        {bkp.checksum}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      {bkp.businessName}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                      {new Date(bkp.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate" title={bkp.reason}>
                      {bkp.reason}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      <span className="font-semibold text-slate-800">{bkp.recordCounts?.batches || 0}</span> batches •{' '}
                      <span className="font-semibold text-slate-800">{bkp.recordCounts?.salesInvoices || 0}</span> invoices
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => handleTestSandboxRestore(bkp.backupId)}
                        disabled={testingBackupId === bkp.backupId}
                        className="px-3 py-1 bg-white border border-slate-300 hover:border-[#168C8C] hover:text-[#168C8C] text-slate-700 rounded text-xs font-semibold transition-colors disabled:opacity-50"
                      >
                        {testingBackupId === bkp.backupId ? 'Verifying...' : 'Test Sandbox Restore'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
