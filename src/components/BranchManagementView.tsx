import React, { useState } from 'react';
import { Branch, BatchInventory, User } from '../types/pharmacy';
import { formatBDT } from '../utils/formatters';
import { Building2, Plus, Phone, Mail, MapPin, ShieldCheck, Boxes, X } from 'lucide-react';

interface BranchManagementViewProps {
  branches: Branch[];
  batches: BatchInventory[];
  currentUser: User;
  onAddBranch: (newBranch: Partial<Branch>) => Promise<Branch>;
}

export const BranchManagementView: React.FC<BranchManagementViewProps> = ({
  branches,
  batches,
  currentUser,
  onAddBranch,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [address, setAddress] = useState('');
  const [thana, setThana] = useState('Dhanmondi');
  const [district, setDistrict] = useState('Dhaka');
  const [phone, setPhone] = useState('+880 1711-');
  const [email, setEmail] = useState('');
  const [drugLicenseNo, setDrugLicenseNo] = useState('');
  const [taxBinNumber, setTaxBinNumber] = useState('');
  const [managerName, setManagerName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const canAdd = ['owner', 'admin'].includes(currentUser.role);

  const handleCreateBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) {
      setErrorMsg('Branch name and code are required.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');
    try {
      await onAddBranch({
        name: name.trim(),
        code: code.trim().toUpperCase(),
        address: address.trim(),
        thana: thana.trim(),
        district: district.trim(),
        phone: phone.trim(),
        email: email.trim(),
        drugLicenseNo: drugLicenseNo.trim() || 'DGDA/DL/PENDING',
        taxBinNumber: taxBinNumber.trim() || 'BIN-PENDING',
        managerName: managerName.trim() || 'Assigned Pharmacist',
      });

      setShowAddModal(false);
      setName('');
      setCode('');
      setAddress('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create branch');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#17365D]">
            Branch Network & Locations
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Multi-branch pharmacy infrastructure across Bangladesh · DGDA Drug Licenses & Tax BINs
          </p>
        </div>
        {canAdd && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 rounded-lg bg-[#168C8C] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#127373] transition-colors shadow-2xs whitespace-nowrap"
          >
            <Plus className="h-4 w-4" />
            <span>Open New Branch</span>
          </button>
        )}
      </div>

      {/* Branch Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {branches.map((branch) => {
          const branchBatches = batches.filter((b) => b.branchId === branch.id);
          const totalStockValue = branchBatches.reduce(
            (acc, b) => acc + b.currentQuantity * b.purchaseCost,
            0
          );
          const totalUnits = branchBatches.reduce((acc, b) => acc + b.currentQuantity, 0);

          return (
            <div
              key={branch.id}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#17365D] bg-[#E7F6F6] px-2 py-0.5 rounded">
                      {branch.code}
                    </span>
                    <h2 className="text-base font-bold text-slate-900">{branch.name}</h2>
                  </div>
                  <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span>{branch.address}, {branch.thana}, {branch.district}</span>
                  </div>
                </div>
              </div>

              {/* Branch Meta Details */}
              <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-lg">
                <div>
                  <span className="text-[11px] text-slate-500">DGDA Drug License</span>
                  <div className="font-mono font-semibold text-slate-800 mt-0.5 truncate">
                    {branch.drugLicenseNo}
                  </div>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500">Tax BIN (Mushak-6.3)</span>
                  <div className="font-mono font-semibold text-slate-800 mt-0.5 truncate">
                    {branch.taxBinNumber}
                  </div>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500">Branch In-Charge / Pharmacist</span>
                  <div className="font-semibold text-slate-900 mt-0.5 truncate">
                    {branch.managerName}
                  </div>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500">Direct Contact Phone</span>
                  <div className="font-mono text-slate-800 mt-0.5 truncate">{branch.phone}</div>
                </div>
              </div>

              {/* Live Inventory Valuation Strip */}
              <div className="border-t border-slate-100 pt-3 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[11px] text-slate-400">Inventory Valuation</span>
                  <div className="font-mono font-bold text-slate-900 text-sm">
                    {formatBDT(totalStockValue)}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-slate-400">Physical Stock</span>
                  <div className="font-mono font-semibold text-slate-700">
                    {totalUnits} units · {branchBatches.length} batches
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Branch Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Provision New Branch</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Set up branch identifier, location, and regulatory DGDA license
                </p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateBranch} className="mt-4 space-y-4 text-xs">
              {errorMsg && (
                <div className="rounded bg-rose-50 p-2.5 text-rose-700 font-medium">{errorMsg}</div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700">Branch Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Uttara Sector 7 Branch"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1 w-full rounded border border-slate-300 p-2 outline-none focus:border-emerald-600"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Branch Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. DHK-03"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="mt-1 w-full rounded border border-slate-300 p-2 font-mono outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700">Street Address</label>
                <input
                  type="text"
                  placeholder="e.g. Plot 15, Rabindra Sarani, Sector 7"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="mt-1 w-full rounded border border-slate-300 p-2 outline-none focus:border-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700">Thana / Upazila</label>
                  <input
                    type="text"
                    value={thana}
                    onChange={(e) => setThana(e.target.value)}
                    className="mt-1 w-full rounded border border-slate-300 p-2 outline-none focus:border-emerald-600"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700">District / Division</label>
                  <input
                    type="text"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="mt-1 w-full rounded border border-slate-300 p-2 outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700">DGDA Drug License #</label>
                  <input
                    type="text"
                    placeholder="DGDA/DL/DHK-..."
                    value={drugLicenseNo}
                    onChange={(e) => setDrugLicenseNo(e.target.value)}
                    className="mt-1 w-full rounded border border-slate-300 p-2 font-mono outline-none focus:border-[#168C8C]"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Tax BIN #</label>
                  <input
                    type="text"
                    placeholder="003482910-..."
                    value={taxBinNumber}
                    onChange={(e) => setTaxBinNumber(e.target.value)}
                    className="mt-1 w-full rounded border border-slate-300 p-2 font-mono outline-none focus:border-[#168C8C]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700">Branch Phone</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="mt-1 w-full rounded border border-slate-300 p-2 font-mono outline-none focus:border-[#168C8C]"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Branch Pharmacist / Manager</label>
                  <input
                    type="text"
                    placeholder="e.g. Mahinur Rahman (B.Pharm)"
                    value={managerName}
                    onChange={(e) => setManagerName(e.target.value)}
                    className="mt-1 w-full rounded border border-slate-300 p-2 outline-none focus:border-[#168C8C]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-lg border border-slate-300 px-3.5 py-2 font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-lg bg-[#168C8C] px-4 py-2 font-bold text-white hover:bg-[#127373] shadow-xs disabled:opacity-50"
                >
                  {isSubmitting ? 'Creating...' : 'Provision Branch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
