import React, { useState } from 'react';
import { User, ApprovalRequest, Branch } from '../types/pharmacy';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Filter,
  AlertTriangle,
  Building2,
  FileCheck2,
  Banknote,
  RotateCcw,
  Boxes,
  Truck,
  ArrowRightLeft,
} from 'lucide-react';

interface ApprovalsViewProps {
  currentUser: User;
  activeBranchId: string | null;
  approvals: ApprovalRequest[];
  branches: Branch[];
  onReviewApproval: (id: string, decision: 'APPROVED' | 'REJECTED', notes?: string) => Promise<void>;
}

export const ApprovalsView: React.FC<ApprovalsViewProps> = ({
  currentUser,
  activeBranchId,
  approvals,
  branches,
  onReviewApproval,
}) => {
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [selectedApproval, setSelectedApproval] = useState<ApprovalRequest | null>(null);
  const [reviewNotes, setReviewNotes] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const canApprove = ['owner', 'operations_manager', 'admin', 'branch_manager'].includes(currentUser.role);

  const filteredApprovals = approvals.filter((app) => {
    if (activeBranchId && app.branchId !== activeBranchId) return false;
    if (statusFilter !== 'ALL' && app.status !== statusFilter) return false;
    if (typeFilter !== 'ALL' && app.type !== typeFilter) return false;
    return true;
  });

  const pendingCount = approvals.filter((a) => a.status === 'PENDING').length;

  const handleReview = async (decision: 'APPROVED' | 'REJECTED') => {
    if (!selectedApproval) return;
    try {
      setSubmitting(true);
      setActionError(null);
      await onReviewApproval(selectedApproval.id, decision, reviewNotes);
      setSelectedApproval(null);
      setReviewNotes('');
    } catch (err: any) {
      setActionError(err.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const getTypeIcon = (type: ApprovalRequest['type']) => {
    switch (type) {
      case 'DISCOUNT_LIMIT':
        return <Banknote className="h-4 w-4 text-amber-600" />;
      case 'REFUND':
        return <RotateCcw className="h-4 w-4 text-rose-600" />;
      case 'STOCK_ADJUSTMENT':
        return <Boxes className="h-4 w-4 text-purple-600" />;
      case 'PURCHASE_ORDER':
        return <Truck className="h-4 w-4 text-blue-600" />;
      case 'INTER_BRANCH_TRANSFER':
        return <ArrowRightLeft className="h-4 w-4 text-emerald-600" />;
      default:
        return <FileCheck2 className="h-4 w-4 text-slate-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Approvals Center & Control
            </h1>
            {pendingCount > 0 && (
              <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-900 font-mono">
                {pendingCount} Pending
              </span>
            )}
          </div>
          <p className="text-xs text-slate-600 mt-0.5">
            Manager authorization for discounts &gt; 5%, stock write-offs, large POs, and capped returns.
          </p>
        </div>

        {!canApprove && (
          <div className="flex items-center gap-2 rounded-lg bg-amber-50 border border-amber-200 px-3 py-1.5 text-xs text-amber-800">
            <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
            <span>Read-only: Manager, Admin, or Owner privilege required to authorize requests.</span>
          </div>
        )}
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Pending Approvals</span>
            <Clock className="h-4 w-4 text-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 font-mono">
            {pendingCount}
          </div>
          <p className="mt-1 text-[11px] text-slate-500">Requires executive / branch manager sign-off</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Authorized Today</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 font-mono">
            {approvals.filter((a) => a.status === 'APPROVED').length}
          </div>
          <p className="mt-1 text-[11px] text-slate-500">Passed audit compliance</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Rejected Requests</span>
            <XCircle className="h-4 w-4 text-rose-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 font-mono">
            {approvals.filter((a) => a.status === 'REJECTED').length}
          </div>
          <p className="mt-1 text-[11px] text-slate-500">Denied policy deviations</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Threshold Policy</span>
            <ShieldCheck className="h-4 w-4 text-blue-500" />
          </div>
          <div className="mt-2 text-sm font-semibold text-slate-900">
            5% Discount Max
          </div>
          <p className="mt-1 text-[11px] text-slate-500">৳50,000+ POs require dual sign-off</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-lg border border-slate-200 shadow-xs">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mr-2">
            <Filter className="h-3.5 w-3.5" />
            <span>Filter Status:</span>
          </div>
          {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                statusFilter === st
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">Category:</span>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs text-slate-700 focus:border-emerald-500 focus:outline-none"
          >
            <option value="ALL">All Categories</option>
            <option value="DISCOUNT_LIMIT">Discount Overrides</option>
            <option value="REFUND">Customer Returns</option>
            <option value="STOCK_ADJUSTMENT">Stock Disposal / Write-off</option>
            <option value="PURCHASE_ORDER">Purchase Orders &gt; ৳50,000</option>
            <option value="INTER_BRANCH_TRANSFER">Inter-Branch Transfers</option>
          </select>
        </div>
      </div>

      {/* Approvals Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-600 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Request Title & Branch</th>
              <th className="px-4 py-3">Details / Reason</th>
              <th className="px-4 py-3 text-right">Impact Value (৳)</th>
              <th className="px-4 py-3">Requested By</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-normal text-slate-700">
            {filteredApprovals.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-slate-400">
                  No approval requests match the selected criteria.
                </td>
              </tr>
            ) : (
              filteredApprovals.map((req) => (
                <tr key={req.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-md bg-slate-100">
                        {getTypeIcon(req.type)}
                      </div>
                      <span className="font-medium text-slate-900 text-[11px]">
                        {req.type.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-slate-900">{req.title}</div>
                    <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5">
                      <Building2 className="h-3 w-3" />
                      <span>{req.branchName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 max-w-xs">
                    <p className="text-slate-600 truncate" title={req.details}>
                      {req.details}
                    </p>
                    {req.reviewedByUserName && (
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Reviewed by {req.reviewedByUserName}: {req.reviewNotes || 'No notes'}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-medium text-slate-900">
                    {req.impactAmountBDT !== undefined ? `৳${req.impactAmountBDT.toLocaleString()}` : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-900">{req.requestedByUserName}</div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      {new Date(req.createdAt).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {req.status === 'PENDING' && (
                      <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-800 border border-amber-200">
                        <Clock className="h-3 w-3" />
                        Pending
                      </span>
                    )}
                    {req.status === 'APPROVED' && (
                      <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-800 border border-emerald-200">
                        <CheckCircle2 className="h-3 w-3" />
                        Approved
                      </span>
                    )}
                    {req.status === 'REJECTED' && (
                      <span className="inline-flex items-center gap-1 rounded-md bg-rose-50 px-2 py-0.5 text-[11px] font-medium text-rose-800 border border-rose-200">
                        <XCircle className="h-3 w-3" />
                        Rejected
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {req.status === 'PENDING' ? (
                      <button
                        onClick={() => {
                          setSelectedApproval(req);
                          setReviewNotes('');
                        }}
                        disabled={!canApprove}
                        className={`rounded-md px-2.5 py-1 text-xs font-semibold ${
                          canApprove
                            ? 'bg-slate-900 text-white hover:bg-slate-800'
                            : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        }`}
                      >
                        Review
                      </button>
                    ) : (
                      <span className="text-[11px] text-slate-400">Processed</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Review Modal */}
      {selectedApproval && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Review Authorization Request
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  ID: <span className="font-mono">{selectedApproval.id}</span> · {selectedApproval.branchName}
                </p>
              </div>
              <button
                onClick={() => setSelectedApproval(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold p-1"
              >
                ✕
              </button>
            </div>

            {actionError && (
              <div className="mt-4 rounded-lg bg-rose-50 p-3 text-xs text-rose-800 border border-rose-200">
                {actionError}
              </div>
            )}

            <div className="mt-4 space-y-4 text-xs">
              <div className="rounded-lg bg-slate-50 p-3 border border-slate-200 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Request:</span>
                  <span className="font-semibold text-slate-900">{selectedApproval.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Category:</span>
                  <span className="font-mono">{selectedApproval.type}</span>
                </div>
                {selectedApproval.impactAmountBDT !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Financial Impact:</span>
                    <span className="font-bold text-emerald-700 font-mono text-sm">
                      ৳{selectedApproval.impactAmountBDT.toLocaleString()}
                    </span>
                  </div>
                )}
                <div>
                  <span className="text-slate-500 block mb-1">Details:</span>
                  <p className="text-slate-800 bg-white p-2 rounded border border-slate-200 font-mono text-[11px]">
                    {selectedApproval.details}
                  </p>
                </div>
                <div className="text-[11px] text-slate-400">
                  Requested by: <span className="text-slate-700 font-medium">{selectedApproval.requestedByUserName}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Manager Authorization Notes / Reason:
                </label>
                <textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="e.g. Verified prescription and customer loyalty policy; approved 8% discount."
                  rows={3}
                  className="w-full rounded-lg border border-slate-300 p-2 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedApproval(null)}
                className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={() => handleReview('REJECTED')}
                className="rounded-lg bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-700 disabled:opacity-50"
              >
                {submitting ? 'Rejecting...' : 'Reject Request'}
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={() => handleReview('APPROVED')}
                className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
              >
                {submitting ? 'Approving...' : 'Authorize & Approve'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
