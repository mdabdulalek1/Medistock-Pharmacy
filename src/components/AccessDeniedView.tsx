import React from 'react';
import { User } from '../types/pharmacy';
import { ShieldAlert, ArrowLeft, Lock, HelpCircle } from 'lucide-react';

interface AccessDeniedViewProps {
  user: User;
  attemptedResource: string;
  requiredPermission?: string;
  onNavigateHome: () => void;
}

export const AccessDeniedView: React.FC<AccessDeniedViewProps> = ({
  user,
  attemptedResource,
  requiredPermission,
  onNavigateHome,
}) => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6">
      <div className="w-full max-w-lg rounded-3xl bg-white p-8 text-center shadow-xl border border-slate-200 space-y-5 animate-in fade-in duration-200">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50 text-[#D64545] border border-rose-200 shadow-xs">
          <ShieldAlert className="h-8 w-8" />
        </div>

        <div className="space-y-1">
          <span className="inline-block rounded-full bg-rose-100 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-rose-800">
            HTTP 403 Forbidden · Access Denied
          </span>
          <h2 className="text-xl font-black text-[#123B5D] tracking-tight">
            Unauthorized Workspace Action
          </h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Your assigned role does not grant access to the requested module:
            <strong className="text-slate-800 font-mono ml-1">/{attemptedResource}</strong>
          </p>
        </div>

        <div className="rounded-2xl bg-[#F3F7FA] border border-slate-200 p-4 text-left text-xs space-y-2">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <span className="text-slate-500">Current User:</span>
            <strong className="text-[#123B5D]">{user.name}</strong>
          </div>
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <span className="text-slate-500">Active Persona Role:</span>
            <span className="rounded bg-teal-100 px-2 py-0.5 font-bold font-mono text-[#079B8C] text-[11px]">
              {user.role}
            </span>
          </div>
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <span className="text-slate-500">Branch Scope:</span>
            <span className="text-slate-700 font-semibold">{user.branchName || (user.branchId ? 'Assigned Branch' : 'All Branches')}</span>
          </div>
          {requiredPermission && (
            <div className="flex items-center justify-between pt-1">
              <span className="text-slate-500">Required Permission:</span>
              <span className="font-mono text-rose-700 font-bold text-[11px]">{requiredPermission}</span>
            </div>
          )}
        </div>

        <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-left text-[11px] text-amber-900 flex items-start gap-2">
          <Lock className="h-4 w-4 text-[#E9A23B] shrink-0 mt-0.5" />
          <span>
            MediStock Role-Based Access Control enforces strict principle of least privilege. If your job responsibilities require this permission, contact your Pharmacy Business Owner or Head Office Administrator.
          </span>
        </div>

        <div className="pt-2 flex justify-center gap-3">
          <button
            onClick={onNavigateHome}
            className="flex items-center gap-2 rounded-xl bg-[#079B8C] hover:bg-[#058276] px-5 py-2.5 text-xs font-bold text-white shadow-xs transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Return to Authorized Menu</span>
          </button>
        </div>
      </div>
    </div>
  );
};
