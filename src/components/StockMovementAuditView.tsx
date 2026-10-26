import React, { useState } from 'react';
import { StockMovement, BatchInventory, Medicine, Branch, User } from '../types/pharmacy';
import { formatDateTime } from '../utils/formatters';
import { ArrowRightLeft, History, Search, Building2, CheckCircle2, ShieldCheck, Filter } from 'lucide-react';

interface StockMovementAuditViewProps {
  stockMovements: StockMovement[];
  batches: BatchInventory[];
  medicines: Medicine[];
  branches: Branch[];
  currentUser: User;
  onTransferStock: (payload: any) => Promise<any>;
}

export const StockMovementAuditView: React.FC<StockMovementAuditViewProps> = ({
  stockMovements,
  batches,
  medicines,
  branches,
  currentUser,
  onTransferStock,
}) => {
  const [activeTab, setActiveTab] = useState<'LEDGER' | 'TRANSFER'>('LEDGER');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBranch, setSelectedBranch] = useState<string>('ALL');

  // Transfer Form State
  const [fromBranchId, setFromBranchId] = useState(branches[0]?.id || '');
  const [toBranchId, setToBranchId] = useState(branches[1]?.id || '');
  const [selectedBatchId, setSelectedBatchId] = useState('');
  const [quantity, setQuantity] = useState<number>(10);
  const [notes, setNotes] = useState('Stock balancing request');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [transferMsg, setTransferMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Available batches at the source branch
  const availableSourceBatches = batches.filter(
    (b) => b.branchId === fromBranchId && b.currentQuantity - b.reservedQuantity > 0
  );

  const filteredMovements = stockMovements.filter((m) => {
    const matchSearch =
      m.medicineName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.referenceId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.notes.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.performedByUserName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchBranch = selectedBranch === 'ALL' || m.branchId === selectedBranch;
    return matchSearch && matchBranch;
  });

  const handleExecuteTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBatchId) {
      setTransferMsg({ type: 'error', text: 'Please select an available medicine batch to transfer.' });
      return;
    }
    if (fromBranchId === toBranchId) {
      setTransferMsg({ type: 'error', text: 'Source and destination branches must be different.' });
      return;
    }

    setIsSubmitting(true);
    setTransferMsg(null);

    try {
      const res = await onTransferStock({
        fromBranchId,
        toBranchId,
        batchId: selectedBatchId,
        quantity: Number(quantity),
        notes: notes.trim(),
      });

      setTransferMsg({
        type: 'success',
        text: res.message || 'Transfer completed successfully and logged in movement ledger.',
      });
      // Reset form
      setQuantity(10);
    } catch (err: any) {
      setTransferMsg({ type: 'error', text: err.message || 'Failed to execute transfer' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getMovementTypeBadge = (type: string) => {
    switch (type) {
      case 'SALE_POS':
        return <span className="text-slate-800 font-semibold font-mono text-[11px]">POS SALE</span>;
      case 'PURCHASE_RECEIVE':
        return <span className="text-[#16803C] font-semibold font-mono text-[11px]">GRN RECEIVE</span>;
      case 'TRANSFER_OUT':
        return <span className="text-[#B7791F] font-semibold font-mono text-[11px]">TRANSFER OUT</span>;
      case 'TRANSFER_IN':
        return <span className="text-[#17365D] font-semibold font-mono text-[11px]">TRANSFER IN</span>;
      case 'ONLINE_DISPATCH':
        return <span className="text-[#168C8C] font-semibold font-mono text-[11px]">ONLINE DISPATCH</span>;
      default:
        return <span className="text-slate-600 font-mono text-[11px]">{type}</span>;
    }
  };

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#17365D]">
            Stock Movement & Inter-Branch Transfers
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Immutable append-only inventory ledger · Real-time trace of every pill and vial across Bangladesh
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center rounded-lg border border-slate-200 p-0.5 bg-slate-50 text-xs">
          <button
            onClick={() => setActiveTab('LEDGER')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold transition-colors ${
              activeTab === 'LEDGER' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <History className="h-3.5 w-3.5" />
            <span>Audit Ledger</span>
          </button>
          <button
            onClick={() => setActiveTab('TRANSFER')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold transition-colors ${
              activeTab === 'TRANSFER' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ArrowRightLeft className="h-3.5 w-3.5" />
            <span>Transfer Stock</span>
          </button>
        </div>
      </div>

      {activeTab === 'TRANSFER' ? (
        /* Transfer Stock Form */
        <div className="max-w-2xl rounded-xl border border-slate-200 bg-white p-6 shadow-2xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <ArrowRightLeft className="h-4 w-4 text-emerald-600" />
              <span>Inter-Branch Stock Balancing</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Securely relocate batch inventory from one branch to another with verified double-entry logs
            </p>
          </div>

          {transferMsg && (
            <div
              className={`rounded-lg p-3 text-xs font-medium flex items-center gap-2 ${
                transferMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-700'
              }`}
            >
              {transferMsg.type === 'success' ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              ) : null}
              <span>{transferMsg.text}</span>
            </div>
          )}

          <form onSubmit={handleExecuteTransfer} className="space-y-4 text-xs">
            {/* Branch Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-semibold text-slate-700">Source Branch (From)</label>
                <select
                  value={fromBranchId}
                  onChange={(e) => {
                    setFromBranchId(e.target.value);
                    setSelectedBatchId('');
                  }}
                  className="mt-1 w-full rounded border border-slate-300 p-2 outline-none focus:border-emerald-600 bg-white"
                >
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700">Destination Branch (To)</label>
                <select
                  value={toBranchId}
                  onChange={(e) => setToBranchId(e.target.value)}
                  className="mt-1 w-full rounded border border-slate-300 p-2 outline-none focus:border-emerald-600 bg-white"
                >
                  {branches.map((b) => (
                    <option key={b.id} value={b.id} disabled={b.id === fromBranchId}>
                      {b.name} ({b.code})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Batch to Transfer */}
            <div>
              <label className="font-semibold text-slate-700">Select Batch in Source Branch</label>
              <select
                value={selectedBatchId}
                onChange={(e) => setSelectedBatchId(e.target.value)}
                className="mt-1 w-full rounded border border-slate-300 p-2 outline-none focus:border-emerald-600 bg-white"
                required
              >
                <option value="">-- Choose available batch --</option>
                {availableSourceBatches.map((b) => {
                  const med = medicines.find((m) => m.id === b.medicineId);
                  return (
                    <option key={b.id} value={b.id}>
                      {med?.brandName} ({med?.strength}) · Batch: {b.batchNumber} (Avail: {b.currentQuantity - b.reservedQuantity} pcs · Exp: {b.expiryDate})
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Quantity & Notes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-semibold text-slate-700">Quantity to Transfer</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="mt-1 w-full rounded border border-slate-300 p-2 font-mono outline-none focus:border-emerald-600"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700">Transfer Reason / Courier Details</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Urgent stock requisition or internal delivery van"
                  className="mt-1 w-full rounded border border-slate-300 p-2 outline-none focus:border-[#168C8C]"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting || !selectedBatchId}
                className="flex items-center gap-1.5 rounded-lg bg-[#168C8C] px-4 py-2 text-xs font-bold text-white hover:bg-[#127373] transition-colors shadow-xs disabled:opacity-50"
              >
                <ShieldCheck className="h-4 w-4" />
                <span>{isSubmitting ? 'Transferring...' : 'Authorize & Execute Transfer'}</span>
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* Ledger Table */
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search ledger by medicine, reference ID (INV/PO), or staff..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-slate-200 pl-9 pr-3 py-1.5 text-xs outline-none focus:border-[#168C8C]"
              />
            </div>

            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs outline-none focus:border-[#168C8C]"
            >
              <option value="ALL">All Branches</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Timestamp (BD)</th>
                    <th className="px-5 py-3 font-semibold">Branch</th>
                    <th className="px-5 py-3 font-semibold">Medicine & Batch</th>
                    <th className="px-5 py-3 font-semibold">Transaction Type</th>
                    <th className="px-5 py-3 text-right font-semibold">Delta</th>
                    <th className="px-5 py-3 text-right font-semibold">New Balance</th>
                    <th className="px-5 py-3 font-semibold">Reference</th>
                    <th className="px-5 py-3 font-semibold">Staff</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-sans">
                  {filteredMovements.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400">
                        No stock movement records found.
                      </td>
                    </tr>
                  ) : (
                    filteredMovements.map((mov) => {
                      const isNegative = mov.quantityDelta < 0;
                      return (
                        <tr key={mov.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-5 py-3 font-mono text-[11px] text-slate-600 whitespace-nowrap">
                            {formatDateTime(mov.timestamp)}
                          </td>
                          <td className="px-5 py-3 font-medium text-slate-800">
                            {mov.branchName}
                          </td>
                          <td className="px-5 py-3 font-medium text-slate-900">
                            <div>{mov.medicineName}</div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              Batch Ref: {mov.batchId.slice(0, 10)}
                            </div>
                          </td>
                          <td className="px-5 py-3">
                            {getMovementTypeBadge(mov.movementType)}
                          </td>
                          <td className="px-5 py-3 text-right font-mono font-bold tabular-nums">
                            <span className={isNegative ? 'text-[#C62828]' : 'text-[#16803C]'}>
                              {isNegative ? '' : '+'}
                              {mov.quantityDelta}
                            </span>
                          </td>
                          <td className="px-5 py-3 text-right font-mono tabular-nums text-slate-800">
                            {mov.newQuantity}
                          </td>
                          <td className="px-5 py-3 font-mono text-[11px] text-slate-700">
                            <div>{mov.referenceId}</div>
                            <div className="text-[10px] text-slate-400 truncate max-w-[140px]">
                              {mov.notes}
                            </div>
                          </td>
                          <td className="px-5 py-3 text-slate-600 text-[11px]">
                            {mov.performedByUserName}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
