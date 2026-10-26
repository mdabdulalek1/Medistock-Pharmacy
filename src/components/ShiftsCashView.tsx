import React, { useState } from 'react';
import { TillShift, Branch, User } from '../types/pharmacy';
import { formatBDT, formatDateTime } from '../utils/formatters';
import { Clock, DollarSign, AlertCircle, CheckCircle2, Plus, Lock, Building2 } from 'lucide-react';

interface ShiftsCashViewProps {
  shifts: TillShift[];
  branches: Branch[];
  activeBranch: Branch;
  currentUser: User;
  onOpenShift: (payload: { branchId: string; tillNumber: string; openingFloat: number; notes?: string }) => Promise<TillShift>;
  onCloseShift: (shiftId: string, payload: { declaredCash: number; notes?: string }) => Promise<any>;
}

export const ShiftsCashView: React.FC<ShiftsCashViewProps> = ({
  shifts,
  branches,
  activeBranch,
  currentUser,
  onOpenShift,
  onCloseShift,
}) => {
  const [showOpenModal, setShowOpenModal] = useState(false);
  const [closingShift, setClosingShift] = useState<TillShift | null>(null);

  // Open Shift Form
  const [selectedTill, setSelectedTill] = useState('Till-01');
  const [openingFloat, setOpeningFloat] = useState<number>(2000);
  const [openNotes, setOpenNotes] = useState('Morning shift opening float verified');

  // Close Shift Form
  const [declaredCash, setDeclaredCash] = useState<number>(0);
  const [closeNotes, setCloseNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canManageShifts = ['owner', 'admin', 'branch_manager', 'cashier', 'accountant', 'operations_manager'].includes(currentUser.role);

  const handleOpenSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onOpenShift({
        branchId: activeBranch.id,
        tillNumber: selectedTill,
        openingFloat: Number(openingFloat),
        notes: openNotes,
      });
      setShowOpenModal(false);
    } catch (err: any) {
      alert(err.message || 'Failed to open shift');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!closingShift) return;
    setIsSubmitting(true);
    try {
      await onCloseShift(closingShift.id, {
        declaredCash: Number(declaredCash),
        notes: closeNotes,
      });
      setClosingShift(null);
    } catch (err: any) {
      alert(err.message || 'Failed to close shift');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Till Shifts & Cash Reconciliation
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Multi-till cashier accountability · Float opening, sales totals, and cash variance auditing
          </p>
        </div>

        {canManageShifts && (
          <button
            onClick={() => setShowOpenModal(true)}
            className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-emerald-700 transition-colors shadow-2xs whitespace-nowrap"
          >
            <Plus className="h-4 w-4" />
            <span>Open New Till Shift</span>
          </button>
        )}
      </div>

      {/* Shifts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {shifts.map((shift) => {
          const isOpen = shift.status === 'OPEN';
          const isBalanced = shift.variance === 0;

          return (
            <div
              key={shift.id}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                      {shift.tillNumber}
                    </span>
                    <span
                      className={`text-[11px] font-semibold ${
                        isOpen ? 'text-emerald-700' : 'text-slate-500'
                      }`}
                    >
                      {isOpen ? '● Active Shift' : 'Closed Shift'}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm mt-1">{shift.branchName}</h3>
                  <p className="text-xs text-slate-500">Cashier: <strong className="text-slate-700">{shift.cashierName}</strong></p>
                </div>
              </div>

              {/* Cash Ledger Details */}
              <div className="space-y-1.5 bg-slate-50 p-3 rounded-lg text-xs font-mono">
                <div className="flex justify-between text-slate-600">
                  <span>Opening Float:</span>
                  <span>{formatBDT(shift.openingFloat)}</span>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span>Cash Sales:</span>
                  <span>+{formatBDT(shift.cashSales)}</span>
                </div>
                <div className="flex justify-between text-slate-500 text-[11px]">
                  <span>bKash / Nagad:</span>
                  <span>{formatBDT(shift.mobileMfsSales)}</span>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-1 font-bold text-slate-900">
                  <span>Expected Till Cash:</span>
                  <span>{formatBDT(shift.expectedCash)}</span>
                </div>

                {!isOpen && shift.declaredCash !== undefined && (
                  <>
                    <div className="flex justify-between text-slate-800 pt-1 border-t border-slate-200">
                      <span>Counted Cash:</span>
                      <span>{formatBDT(shift.declaredCash)}</span>
                    </div>
                    <div
                      className={`flex justify-between font-bold ${
                        shift.variance && shift.variance < 0
                          ? 'text-rose-600'
                          : shift.variance && shift.variance > 0
                          ? 'text-amber-700'
                          : 'text-emerald-700'
                      }`}
                    >
                      <span>Variance:</span>
                      <span>
                        {shift.variance === 0
                          ? 'Balanced (৳ 0.00)'
                          : `${shift.variance && shift.variance > 0 ? '+' : ''}${formatBDT(shift.variance)}`}
                      </span>
                    </div>
                  </>
                )}
              </div>

              <div className="text-[11px] text-slate-400">
                Opened: <span className="font-mono">{formatDateTime(shift.openedAt)}</span>
                {shift.closedAt && <div>Closed: <span className="font-mono">{formatDateTime(shift.closedAt)}</span></div>}
              </div>

              {isOpen && canManageShifts && (
                <button
                  onClick={() => {
                    setClosingShift(shift);
                    setDeclaredCash(shift.expectedCash);
                  }}
                  className="w-full flex items-center justify-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100 transition-colors"
                >
                  <Lock className="h-3.5 w-3.5" />
                  <span>Count Cash & Close Shift</span>
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Open Shift Modal */}
      {showOpenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Start Till Shift</h3>
            <form onSubmit={handleOpenSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700">Till Terminal</label>
                <select
                  value={selectedTill}
                  onChange={(e) => setSelectedTill(e.target.value)}
                  className="mt-1 w-full rounded border border-slate-300 p-2 outline-none font-mono"
                >
                  {activeBranch.activeTillIds?.map((till) => (
                    <option key={till} value={till}>{till}</option>
                  )) || <option value="Till-01">Till-01</option>}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700">Opening Cash Float (৳)</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={openingFloat}
                  onChange={(e) => setOpeningFloat(Number(e.target.value))}
                  className="mt-1 w-full rounded border border-slate-300 p-2 font-mono outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700">Checklist & Opening Notes</label>
                <input
                  type="text"
                  value={openNotes}
                  onChange={(e) => setOpenNotes(e.target.value)}
                  className="mt-1 w-full rounded border border-slate-300 p-2 outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowOpenModal(false)}
                  className="rounded-lg border border-slate-300 px-3.5 py-2 font-medium text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-lg bg-emerald-600 px-4 py-2 font-bold text-white hover:bg-emerald-700"
                >
                  {isSubmitting ? 'Opening...' : 'Confirm & Open Till'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Close Shift Modal */}
      {closingShift && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Close {closingShift.tillNumber} Shift</h3>
            <div className="bg-slate-50 p-3 rounded-lg text-xs space-y-1 font-mono">
              <div className="flex justify-between">
                <span>System Expected Cash:</span>
                <span className="font-bold">{formatBDT(closingShift.expectedCash)}</span>
              </div>
            </div>

            <form onSubmit={handleCloseSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700">Actual Physically Counted Cash (৳) *</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={declaredCash}
                  onChange={(e) => setDeclaredCash(Number(e.target.value))}
                  className="mt-1 w-full rounded border border-slate-300 p-2 font-mono text-sm font-bold outline-none"
                />
              </div>

              <div className="flex justify-between text-xs font-mono font-semibold">
                <span>Discrepancy:</span>
                <span className={declaredCash - closingShift.expectedCash === 0 ? 'text-emerald-700' : 'text-rose-600'}>
                  {formatBDT(declaredCash - closingShift.expectedCash)}
                </span>
              </div>

              <div>
                <label className="font-semibold text-slate-700">Handover Notes / Discrepancy Reason</label>
                <input
                  type="text"
                  placeholder="e.g. Exact change matched, handed over to safe."
                  value={closeNotes}
                  onChange={(e) => setCloseNotes(e.target.value)}
                  className="mt-1 w-full rounded border border-slate-300 p-2 outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setClosingShift(null)}
                  className="rounded-lg border border-slate-300 px-3.5 py-2 font-medium text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-lg bg-rose-600 px-4 py-2 font-bold text-white hover:bg-rose-700"
                >
                  {isSubmitting ? 'Closing...' : 'Confirm Cash & Close Shift'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
