import React, { useState, useMemo } from 'react';
import { BatchInventory, Medicine, Branch, User } from '../types/pharmacy';
import { formatBDT, formatDate, getExpiryStatus } from '../utils/formatters';
import {
  Boxes,
  Plus,
  Search,
  Filter,
  AlertTriangle,
  Building2,
  Calendar,
  Layers,
  ArrowRightLeft,
  X,
} from 'lucide-react';

interface BatchInventoryViewProps {
  batches: BatchInventory[];
  medicines: Medicine[];
  branches: Branch[];
  activeBranchId: string | null;
  currentUser: User;
  onReceiveGoods: (payload: any) => Promise<any>;
  onNavigateTab: (tab: string) => void;
}

export const BatchInventoryView: React.FC<BatchInventoryViewProps> = ({
  batches,
  medicines,
  branches,
  activeBranchId,
  currentUser,
  onReceiveGoods,
  onNavigateTab,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBranchFilter, setSelectedBranchFilter] = useState<string>(activeBranchId || 'ALL');
  const [expiryFilter, setExpiryFilter] = useState<'ALL' | 'EXPIRING_30' | 'EXPIRING_90' | 'LOW_STOCK'>('ALL');
  const [showAddBatchModal, setShowAddBatchModal] = useState(false);

  // New Batch Form State
  const [selectedMedId, setSelectedMedId] = useState(medicines[0]?.id || '');
  const [targetBranchId, setTargetBranchId] = useState(branches[0]?.id || '');
  const [batchNumber, setBatchNumber] = useState('');
  const [manufacturingDate, setManufacturingDate] = useState('2025-06-01');
  const [expiryDate, setExpiryDate] = useState('2027-05-31');
  const [purchaseCost, setPurchaseCost] = useState<number>(30);
  const [sellingPrice, setSellingPrice] = useState<number>(36);
  const [quantity, setQuantity] = useState<number>(100);
  const [rackLocation, setRackLocation] = useState('Shelf A-02');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const canManageStock = ['owner', 'admin', 'inventory_manager', 'branch_manager'].includes(currentUser.role);

  const filteredBatches = useMemo(() => {
    return batches.filter((b) => {
      const med = medicines.find((m) => m.id === b.medicineId);
      const medName = med ? med.brandName.toLowerCase() : '';
      const generic = med ? med.genericName.toLowerCase() : '';
      const q = searchTerm.toLowerCase();

      const matchSearch =
        medName.includes(q) ||
        generic.includes(q) ||
        b.batchNumber.toLowerCase().includes(q) ||
        b.rackLocation.toLowerCase().includes(q);

      const matchBranch = selectedBranchFilter === 'ALL' || b.branchId === selectedBranchFilter;

      let matchExpiry = true;
      const status = getExpiryStatus(b.expiryDate);
      if (expiryFilter === 'EXPIRING_30') {
        matchExpiry = status.daysLeft <= 30;
      } else if (expiryFilter === 'EXPIRING_90') {
        matchExpiry = status.daysLeft <= 90;
      } else if (expiryFilter === 'LOW_STOCK') {
        matchExpiry = b.currentQuantity <= 10;
      }

      return matchSearch && matchBranch && matchExpiry;
    });
  }, [batches, medicines, searchTerm, selectedBranchFilter, expiryFilter]);

  const handleCreateBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!batchNumber.trim() || !expiryDate || !quantity) {
      setErrorMsg('Batch number, expiry date and quantity are required.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');
    try {
      await onReceiveGoods({
        branchId: targetBranchId,
        medicineId: selectedMedId,
        batchNumber: batchNumber.trim().toUpperCase(),
        manufacturingDate,
        expiryDate,
        purchaseCost: Number(purchaseCost),
        sellingPrice: Number(sellingPrice),
        quantity: Number(quantity),
        rackLocation: rackLocation.trim(),
      });

      setShowAddBatchModal(false);
      setBatchNumber('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to add batch');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#17365D]">
            Batch Inventory & Expiry Tracking
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            FEFO (First-Expiring First-Out) stock governance · Purchase Cost vs Selling Price · Buffer management
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigateTab('transfers')}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs whitespace-nowrap"
          >
            <ArrowRightLeft className="h-3.5 w-3.5 text-slate-500" />
            <span>Inter-Branch Transfer</span>
          </button>
          {canManageStock && (
            <button
              onClick={() => setShowAddBatchModal(true)}
              className="flex items-center gap-1.5 rounded-lg bg-[#168C8C] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#127373] transition-colors shadow-2xs whitespace-nowrap"
            >
              <Plus className="h-4 w-4" />
              <span>Receive New Batch (GRN)</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by brand name, generic, batch number (e.g. NPE-25A12), or rack..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-slate-200 pl-9 pr-3 py-1.5 text-xs outline-none focus:border-[#168C8C] focus:ring-1 focus:ring-[#168C8C]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Branch filter (if user has global permission) */}
          {['owner', 'admin'].includes(currentUser.role) && (
            <select
              value={selectedBranchFilter}
              onChange={(e) => setSelectedBranchFilter(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 outline-none focus:border-[#168C8C]"
            >
              <option value="ALL">All Branches</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          )}

          {/* Quick status filter */}
          <div className="flex items-center rounded-lg border border-slate-200 p-0.5 bg-slate-50 text-xs">
            <button
              onClick={() => setExpiryFilter('ALL')}
              className={`px-2 py-1 rounded-md text-[11px] font-medium transition-colors ${
                expiryFilter === 'ALL' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
              }`}
            >
              All Batches
            </button>
            <button
              onClick={() => setExpiryFilter('EXPIRING_30')}
              className={`px-2 py-1 rounded-md text-[11px] font-medium transition-colors ${
                expiryFilter === 'EXPIRING_30' ? 'bg-white text-[#C62828] font-semibold shadow-2xs' : 'text-slate-600'
              }`}
            >
              Critical &lt;30d
            </button>
            <button
              onClick={() => setExpiryFilter('EXPIRING_90')}
              className={`px-2 py-1 rounded-md text-[11px] font-medium transition-colors ${
                expiryFilter === 'EXPIRING_90' ? 'bg-white text-[#B7791F] font-semibold shadow-2xs' : 'text-slate-600'
              }`}
            >
              Expiring &lt;90d
            </button>
            <button
              onClick={() => setExpiryFilter('LOW_STOCK')}
              className={`px-2 py-1 rounded-md text-[11px] font-medium transition-colors ${
                expiryFilter === 'LOW_STOCK' ? 'bg-white text-slate-900 font-semibold shadow-2xs' : 'text-slate-600'
              }`}
            >
              Low Stock (&le;10)
            </button>
          </div>
        </div>
      </div>

      {/* Batch Table */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
              <tr>
                <th className="px-5 py-3 font-semibold">Medicine & Brand</th>
                <th className="px-5 py-3 font-semibold">Batch Number</th>
                <th className="px-5 py-3 font-semibold">Branch Location</th>
                <th className="px-5 py-3 font-semibold">Expiry Date & Status</th>
                <th className="px-5 py-3 text-right font-semibold">Purchase Cost</th>
                <th className="px-5 py-3 text-right font-semibold">Selling Price</th>
                <th className="px-5 py-3 text-center font-semibold">Stock / Reserved</th>
                <th className="px-5 py-3 font-semibold">Rack Location</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {filteredBatches.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No batches found matching filter conditions.
                  </td>
                </tr>
              ) : (
                filteredBatches.map((batch) => {
                  const med = medicines.find((m) => m.id === batch.medicineId);
                  const branch = branches.find((b) => b.id === batch.branchId);
                  const expStatus = getExpiryStatus(batch.expiryDate);
                  const marginPercent =
                    batch.purchaseCost > 0
                      ? (((batch.sellingPrice - batch.purchaseCost) / batch.purchaseCost) * 100).toFixed(1)
                      : '0';

                  return (
                    <tr key={batch.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-5 py-3 font-medium text-slate-900">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-md border border-slate-200 bg-slate-50 shrink-0 overflow-hidden flex items-center justify-center">
                            <img
                              src={med?.imageUrl || '/assets/medicine-placeholder.svg'}
                              alt={med?.brandName}
                              className="w-full h-full object-contain p-0.5"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/assets/medicine-placeholder.svg';
                              }}
                            />
                          </div>
                          <div>
                            <div className="font-bold">{med?.brandName || 'Medicine'}</div>
                            <div className="text-[11px] text-slate-500 font-mono">
                              {med?.genericName} ({med?.strength})
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3 font-mono font-bold text-slate-800">
                        {batch.batchNumber}
                      </td>
                      <td className="px-5 py-3 text-slate-600">
                        <div className="font-medium text-slate-800">{branch?.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{branch?.code}</div>
                      </td>
                      <td className="px-5 py-3">
                        <div className="font-mono text-xs">{formatDate(batch.expiryDate)}</div>
                        <div className={`text-[10px] ${expStatus.badgeClass}`}>
                          {expStatus.label}
                        </div>
                      </td>
                      <td className="px-5 py-3 text-right font-mono tabular-nums text-slate-700">
                        {formatBDT(batch.purchaseCost)}
                      </td>
                      <td className="px-5 py-3 text-right font-mono tabular-nums font-semibold text-slate-900">
                        <div>{formatBDT(batch.sellingPrice)}</div>
                        <div className="text-[10px] text-[#16803C] font-sans font-normal">
                          +{marginPercent}% margin
                        </div>
                      </td>
                      <td className="px-5 py-3 text-center">
                        <div
                          className={`font-mono text-sm font-bold tabular-nums ${
                            batch.currentQuantity <= 10 ? 'text-[#C62828]' : 'text-slate-900'
                          }`}
                        >
                          {batch.currentQuantity}
                        </div>
                        {batch.reservedQuantity > 0 && (
                          <div className="text-[10px] text-[#B7791F] font-mono">
                            ({batch.reservedQuantity} reserved)
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-3 text-slate-600 font-mono text-[11px]">
                        {batch.rackLocation}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add New Batch (Goods Receiving) Modal */}
      {showAddBatchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Receive Stock Consignment (GRN)</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Record new delivery batch with cost price, retail price, and rack slot
                </p>
              </div>
              <button onClick={() => setShowAddBatchModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateBatch} className="mt-4 space-y-4 text-xs">
              {errorMsg && (
                <div className="rounded bg-rose-50 p-2 text-rose-700 font-medium">
                  {errorMsg}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700">Medicine</label>
                  <select
                    value={selectedMedId}
                    onChange={(e) => setSelectedMedId(e.target.value)}
                    className="mt-1 w-full rounded border border-slate-300 px-3 py-1.5 outline-none focus:border-emerald-600 bg-white"
                  >
                    {medicines.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.brandName} ({m.strength})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Receiving Branch</label>
                  <select
                    value={targetBranchId}
                    onChange={(e) => setTargetBranchId(e.target.value)}
                    className="mt-1 w-full rounded border border-slate-300 px-3 py-1.5 outline-none focus:border-emerald-600 bg-white"
                  >
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-700">Batch Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SCL-26A01"
                    value={batchNumber}
                    onChange={(e) => setBatchNumber(e.target.value)}
                    className="mt-1 w-full rounded border border-slate-300 px-3 py-1.5 outline-none focus:border-emerald-600 font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Mfg Date</label>
                  <input
                    type="date"
                    value={manufacturingDate}
                    onChange={(e) => setManufacturingDate(e.target.value)}
                    className="mt-1 w-full rounded border border-slate-300 px-2 py-1.5 outline-none focus:border-emerald-600 font-mono text-[11px]"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Expiry Date *</label>
                  <input
                    type="date"
                    required
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="mt-1 w-full rounded border border-slate-300 px-2 py-1.5 outline-none focus:border-emerald-600 font-mono text-[11px]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-700">Purchase Cost (৳)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    required
                    value={purchaseCost}
                    onChange={(e) => setPurchaseCost(Number(e.target.value))}
                    className="mt-1 w-full rounded border border-slate-300 px-3 py-1.5 outline-none focus:border-emerald-600 font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Selling Price (৳)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    required
                    value={sellingPrice}
                    onChange={(e) => setSellingPrice(Number(e.target.value))}
                    className="mt-1 w-full rounded border border-slate-300 px-3 py-1.5 outline-none focus:border-emerald-600 font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Quantity (Units)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="mt-1 w-full rounded border border-slate-300 px-3 py-1.5 outline-none focus:border-emerald-600 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700">Pharmacy Rack Location</label>
                <input
                  type="text"
                  value={rackLocation}
                  onChange={(e) => setRackLocation(e.target.value)}
                  placeholder="e.g. Rack B-03, Refrigerator Bay 1"
                  className="mt-1 w-full rounded border border-slate-300 px-3 py-1.5 outline-none focus:border-[#168C8C] font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddBatchModal(false)}
                  className="rounded-lg border border-slate-300 px-3.5 py-2 font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-lg bg-[#168C8C] px-4 py-2 font-bold text-white hover:bg-[#127373] shadow-xs disabled:opacity-50"
                >
                  {isSubmitting ? 'Receiving...' : 'Credit to Branch Stock'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
