import React, { useState, useEffect } from 'react';
import { User, Branch } from '../types/pharmacy';
import {
  fetchRbacRoles,
  fetchUserPermissions,
  assignUserPermissions,
  fetchPermissionRequests,
  reviewPermissionRequest,
  revokeUserSession,
  fetchRbacAuditExport,
} from '../services/api';
import { ALL_PERMISSIONS, ROLE_TEMPLATES, calculateEffectivePermissions } from '../types/rbac';
import {
  ShieldCheck,
  ShieldAlert,
  Users,
  Key,
  CheckCircle2,
  AlertTriangle,
  Search,
  Lock,
  Unlock,
  UserCheck,
  FileSpreadsheet,
  RefreshCw,
  Check,
  X,
  Sliders,
  Sparkles,
} from 'lucide-react';

interface PermissionManagementViewProps {
  currentUser: User;
  branches: Branch[];
  allUsers: User[];
}

export const PermissionManagementView: React.FC<PermissionManagementViewProps> = ({
  currentUser,
  branches,
  allUsers,
}) => {
  const [rolesData, setRolesData] = useState<any>(null);
  const [selectedUser, setSelectedUser] = useState<User>(allUsers[0] || currentUser);
  const [userEffective, setUserEffective] = useState<any>(null);
  const [permissionRequests, setPermissionRequests] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' | 'warning' } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form state for editing selected user permissions
  const [assignedRole, setAssignedRole] = useState(selectedUser.role);
  const [branchScope, setBranchScope] = useState<'ALL' | 'ASSIGNED' | 'CUSTOM'>(selectedUser.branchScope || 'ASSIGNED');
  const [permittedBranches, setPermittedBranches] = useState<string[]>(selectedUser.permittedBranches || []);
  const [explicitGrants, setExplicitGrants] = useState<string[]>(selectedUser.explicitGrants || []);
  const [explicitDenies, setExplicitDenies] = useState<string[]>(selectedUser.explicitDenies || []);
  const [tempHours, setTempHours] = useState<number>(0);
  const [reason, setReason] = useState('Administrative permission update');

  const loadRbacData = async () => {
    try {
      const [rolesRes, reqsRes] = await Promise.all([fetchRbacRoles(), fetchPermissionRequests()]);
      setRolesData(rolesRes);
      setPermissionRequests(reqsRes);
      if (selectedUser) {
        const permRes = await fetchUserPermissions(selectedUser.id);
        setUserEffective(permRes);
      }
    } catch (err) {
      console.error('Failed to load RBAC data:', err);
    }
  };

  useEffect(() => {
    loadRbacData();
  }, []);

  useEffect(() => {
    if (selectedUser) {
      setAssignedRole(selectedUser.role);
      setBranchScope(selectedUser.branchScope || (selectedUser.branchId ? 'ASSIGNED' : 'ALL'));
      setPermittedBranches(selectedUser.permittedBranches || (selectedUser.branchId ? [selectedUser.branchId] : []));
      setExplicitGrants(selectedUser.explicitGrants || []);
      setExplicitDenies(selectedUser.explicitDenies || []);
      fetchUserPermissions(selectedUser.id).then(setUserEffective).catch(console.error);
    }
  }, [selectedUser]);

  const handleSavePermissions = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setStatusMessage(null);

    try {
      const res = await assignUserPermissions({
        targetUserId: selectedUser.id,
        newRole: assignedRole,
        explicitGrants,
        explicitDenies,
        branchScope,
        permittedBranches,
        temporaryDurationHours: tempHours > 0 ? tempHours : undefined,
        reason,
      });

      setStatusMessage({
        text: res.hasSensitiveGrants
          ? `Permissions saved successfully with SENSITIVE GRANTS: [${res.sensitiveGrants.join(', ')}]`
          : 'User role and permissions updated successfully.',
        type: res.hasSensitiveGrants ? 'warning' : 'success',
      });
      await loadRbacData();
    } catch (err: any) {
      setStatusMessage({ text: err.message || 'Failed to update permissions', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleReviewRequest = async (requestId: string, decision: 'APPROVED' | 'REJECTED') => {
    try {
      await reviewPermissionRequest({ requestId, decision, reviewNotes: `Reviewed by ${currentUser.name}` });
      setStatusMessage({ text: `Request ${decision.toLowerCase()} successfully.`, type: 'success' });
      await loadRbacData();
    } catch (err: any) {
      setStatusMessage({ text: err.message || 'Failed to review request', type: 'error' });
    }
  };

  const handleRevokeSession = async (userId: string, deactivate: boolean) => {
    if (!window.confirm(`Are you sure you want to revoke session for this user?`)) return;
    try {
      await revokeUserSession(userId, deactivate);
      setStatusMessage({ text: 'User session successfully revoked and token invalidated.', type: 'success' });
      await loadRbacData();
    } catch (err: any) {
      setStatusMessage({ text: err.message || 'Failed to revoke session', type: 'error' });
    }
  };

  const handleAuditExport = async () => {
    try {
      const data = await fetchRbacAuditExport();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `medistock-rbac-audit-${Date.now()}.json`;
      a.click();
    } catch (err: any) {
      alert(err.message || 'Failed to export audit logs');
    }
  };

  const filteredUsers = allUsers.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-3xl shadow-xl border border-slate-200">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-teal-100 px-3 py-0.5 text-[11px] font-bold uppercase tracking-wider text-[#079B8C]">
              Enterprise RBAC & Permission Center
            </span>
            <span className="rounded bg-[#123B5D]/10 px-2.5 py-0.5 text-[11px] font-mono font-bold text-[#123B5D]">
              {allUsers.length} Users Managed
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#123B5D] tracking-tight">
            Role-Based Access Control & Delegation Matrix
          </h1>
          <p className="text-xs text-slate-500 max-w-xl">
            Configure fine-grained resource/action permissions, role templates, branch scope isolation, separation of duties, and session revocations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleAuditExport}
            className="flex items-center gap-2 rounded-xl bg-[#F3F7FA] hover:bg-slate-200 border border-slate-200 px-4 py-2.5 text-xs font-bold text-[#123B5D] transition-colors"
          >
            <FileSpreadsheet className="h-4 w-4 text-[#079B8C]" />
            <span>Export Security Audit</span>
          </button>
        </div>
      </div>

      {statusMessage && (
        <div
          className={`rounded-2xl p-4 text-xs font-bold flex items-center gap-2 shadow-xs ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 text-[#168653] border border-emerald-200'
              : statusMessage.type === 'warning'
              ? 'bg-amber-50 text-amber-900 border border-amber-300'
              : 'bg-rose-50 text-[#D64545] border border-rose-200'
          }`}
        >
          {statusMessage.type === 'success' ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <AlertTriangle className="h-4 w-4 shrink-0" />}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Pending Permission Change Requests Queue */}
      {permissionRequests.filter((r) => r.status === 'PENDING').length > 0 && (
        <div className="rounded-3xl bg-amber-50/70 border border-amber-200 p-6 space-y-4 shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-[#E9A23B]" />
              <h3 className="text-sm font-black text-amber-900">
                Pending Permission Elevation Requests ({permissionRequests.filter((r) => r.status === 'PENDING').length})
              </h3>
            </div>
            <span className="text-[11px] text-amber-800">Enforces Separation of Duties</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {permissionRequests
              .filter((r) => r.status === 'PENDING')
              .map((req) => (
                <div key={req.id} className="rounded-2xl bg-white border border-amber-300 p-4 space-y-3 shadow-xs">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-bold text-slate-900 text-xs">{req.userName} ({req.userRole})</div>
                      <div className="text-[11px] text-slate-500 font-mono">{req.userBranchName}</div>
                    </div>
                    <span className="rounded bg-amber-100 text-amber-900 font-bold text-[10px] px-2 py-0.5">
                      {req.requestedDurationHours || 24}h Temp Access
                    </span>
                  </div>

                  <div className="text-xs">
                    <span className="text-slate-500 block">Requested Permission:</span>
                    <strong className="text-[#079B8C] font-mono">{req.permissionLabel} ({req.requestedPermission})</strong>
                  </div>

                  <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <strong>Justification:</strong> "{req.reason}"
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => handleReviewRequest(req.id, 'APPROVED')}
                      className="flex-1 py-2 bg-[#168653] hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <Check className="h-3.5 w-3.5" /> Approve
                    </button>
                    <button
                      onClick={() => handleReviewRequest(req.id, 'REJECTED')}
                      className="flex-1 py-2 bg-rose-100 hover:bg-rose-200 text-rose-800 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5"
                    >
                      <X className="h-3.5 w-3.5" /> Reject
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Main Grid: User Selector & Permission Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Staff User Roster */}
        <div className="lg:col-span-1 rounded-3xl bg-white border border-slate-200 shadow-xl overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-100 bg-[#F3F7FA] space-y-3">
            <h3 className="text-xs font-bold text-[#123B5D] uppercase tracking-wider">
              Select Staff Member to Manage
            </h3>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search staff name or role..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 py-2 text-xs text-slate-900 focus:border-[#079B8C] focus:outline-none"
              />
            </div>
          </div>

          <div className="divide-y divide-slate-100 overflow-y-auto max-h-[620px]">
            {filteredUsers.map((u) => {
              const isSelected = selectedUser.id === u.id;
              return (
                <button
                  key={u.id}
                  onClick={() => setSelectedUser(u)}
                  className={`w-full text-left p-4 transition-all flex items-center justify-between gap-3 ${
                    isSelected ? 'bg-teal-50/80 border-l-4 border-[#079B8C]' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-[#123B5D] to-[#079B8C] text-white flex items-center justify-center font-bold text-sm shrink-0">
                      {u.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-[#123B5D] truncate">{u.name}</div>
                      <div className="text-[10px] text-slate-500 font-mono truncate">{u.role} · {u.branchName || 'HQ'}</div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${
                        u.active ? 'bg-emerald-100 text-[#168653]' : 'bg-rose-100 text-[#D64545]'
                      }`}
                    >
                      {u.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Permission Matrix & Role Config Form */}
        <div className="lg:col-span-2 rounded-3xl bg-white border border-slate-200 shadow-xl p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-[#123B5D]">Editing Permissions: {selectedUser.name}</h2>
                <span className="rounded bg-teal-100 text-[#079B8C] font-mono font-bold text-xs px-2.5 py-0.5">
                  {selectedUser.role}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">Email: {selectedUser.email} · Branch: {selectedUser.branchName || 'Consolidated'}</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleRevokeSession(selectedUser.id, true)}
                className="rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 text-xs font-bold text-[#D64545] transition-colors"
                title="Immediately invalidate session token and deactivate staff account"
              >
                Revoke Session / Deactivate
              </button>
            </div>
          </div>

          <form onSubmit={handleSavePermissions} className="space-y-6 text-xs text-slate-800">
            {/* Role Template Selector */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Assign Base Role Template</label>
                <select
                  value={assignedRole}
                  onChange={(e) => {
                    const newR = e.target.value as any;
                    setAssignedRole(newR);
                    const template = ROLE_TEMPLATES[newR];
                    if (template) {
                      setExplicitGrants([...template.permissions]);
                    }
                  }}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-[#123B5D] focus:border-[#079B8C] focus:outline-none"
                >
                  {Object.values(ROLE_TEMPLATES).map((tmpl) => (
                    <option key={tmpl.id} value={tmpl.id}>
                      {tmpl.name} ({tmpl.category})
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-500 mt-1">
                  {ROLE_TEMPLATES[assignedRole]?.description}
                </p>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Branch Scope Isolation</label>
                <select
                  value={branchScope}
                  onChange={(e) => setBranchScope(e.target.value as any)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-[#123B5D] focus:border-[#079B8C] focus:outline-none"
                >
                  <option value="ASSIGNED">Assigned Branch Only (Strict)</option>
                  <option value="ALL">All Branches (Consolidated Executive)</option>
                  <option value="CUSTOM">Custom Multi-Branch Permitted</option>
                </select>
                <p className="text-[10px] text-slate-500 mt-1">
                  Enforces server-side branch data isolation and query filtering.
                </p>
              </div>
            </div>

            {/* Granular Permission Matrix grouped by category */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-[#123B5D] uppercase tracking-wider">
                  Granular Permission Matrix (Resource / Action Pairs)
                </h3>
                <span className="text-[10px] text-slate-400 font-mono">
                  {explicitGrants.length} of {ALL_PERMISSIONS.length} permissions granted
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-72 overflow-y-auto p-2 border border-slate-200 rounded-2xl bg-[#F3F7FA]">
                {ALL_PERMISSIONS.map((perm) => {
                  const isChecked = explicitGrants.includes(perm.key);
                  return (
                    <label
                      key={perm.key}
                      className={`flex items-start gap-2.5 p-2.5 rounded-xl border transition-all cursor-pointer ${
                        isChecked ? 'bg-teal-50/80 border-[#079B8C] shadow-2xs' : 'bg-white border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setExplicitGrants([...explicitGrants, perm.key]);
                          } else {
                            setExplicitGrants(explicitGrants.filter((k) => k !== perm.key));
                          }
                        }}
                        className="mt-0.5 rounded border-slate-300 text-[#079B8C] focus:ring-[#079B8C]"
                      />
                      <div className="space-y-0.5 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-900 text-[11px] truncate">{perm.label}</span>
                          {perm.isSensitive && (
                            <span className="rounded bg-amber-100 text-amber-800 text-[8px] font-bold px-1.5 py-0.2">
                              Sensitive
                            </span>
                          )}
                        </div>
                        <span className="font-mono text-[9px] text-slate-400 block">{perm.key}</span>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Temporary Access & Justification */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Temporary Elevation Expiry (Hours)</label>
                <input
                  type="number"
                  min="0"
                  max="168"
                  value={tempHours}
                  onChange={(e) => setTempHours(Number(e.target.value) || 0)}
                  placeholder="0 (Permanent)"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-mono text-slate-900 focus:border-[#079B8C] focus:outline-none"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">Set hours for time-limited grants (e.g. 24h).</span>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Justification Reason / Audit Note</label>
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Reason for permission modification..."
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-[#079B8C] focus:outline-none"
                  required
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSaving}
                className="w-full py-3 bg-[#079B8C] hover:bg-[#058276] text-white font-bold rounded-xl text-xs shadow-md transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <ShieldCheck className="h-4 w-4" />
                <span>{isSaving ? 'Enforcing Permissions...' : 'Save & Enforce Effective Permissions'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
