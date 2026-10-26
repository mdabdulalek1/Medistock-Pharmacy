import React, { useState, useMemo } from 'react';
import { Medicine, MedicineCategory, DosageForm, User } from '../types/pharmacy';
import { Search, Plus, Filter, ShieldAlert, ThermometerSnowflake, Globe2, Check, X, Camera, ShieldCheck, Database, Tag } from 'lucide-react';
import { MedicineImageModal } from './MedicineImageModal';
import { MedicineDataIntegrationCenterModal } from './MedicineDataIntegrationCenterModal';

interface MedicineCatalogueViewProps {
  medicines: Medicine[];
  currentUser: User;
  onAddMedicine: (newMed: Partial<Medicine>) => Promise<Medicine>;
}

const CATEGORIES: (MedicineCategory | 'ALL')[] = [
  'ALL',
  'Analgesic & Antipyretic',
  'Antibiotic & Antimicrobial',
  'Gastrointestinal & Antacid',
  'Respiratory & Antihistamine',
  'Cardiovascular & Hypertension',
  'Antidiabetic & Endocrinology',
  'Vitamins & Minerals',
  'Dermatology & Topical',
  'Pediatric Care',
  'Ophthalmic & ENT',
];

const DOSAGE_FORMS: DosageForm[] = [
  'Tablet',
  'Capsule',
  'Syrup',
  'Suspension',
  'Injection',
  'Inhaler',
  'Eye Drops',
  'Ointment',
  'Sachet',
];

export const MedicineCatalogueView: React.FC<MedicineCatalogueViewProps> = ({
  medicines,
  currentUser,
  onAddMedicine,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<MedicineCategory | 'ALL'>('ALL');
  const [filterPrescription, setFilterPrescription] = useState<boolean | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showIntegrationCenter, setShowIntegrationCenter] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);
  const [inspectingPhotoMed, setInspectingPhotoMed] = useState<Medicine | null>(null);
  const [localMedicines, setLocalMedicines] = useState<Medicine[]>(medicines);

  React.useEffect(() => {
    setLocalMedicines(medicines);
  }, [medicines]);

  const canVerifyPhoto = ['owner', 'admin', 'pharmacist', 'it_admin'].includes(currentUser.role);

  // New Medicine Form State
  const [brandName, setBrandName] = useState('');
  const [genericName, setGenericName] = useState('');
  const [strength, setStrength] = useState('');
  const [dosageForm, setDosageForm] = useState<DosageForm>('Tablet');
  const [manufacturer, setManufacturer] = useState('Square Pharmaceuticals PLC');
  const [category, setCategory] = useState<MedicineCategory>('Analgesic & Antipyretic');
  const [barcode, setBarcode] = useState('');
  const [unit, setUnit] = useState('Strip of 10 Tablets');
  const [darNumber, setDarNumber] = useState('');
  const [isRx, setIsRx] = useState(false);
  const [isColdChain, setIsColdChain] = useState(false);
  const [isOnlineEligible, setIsOnlineEligible] = useState(true);
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const canAdd = ['owner', 'admin', 'pharmacist'].includes(currentUser.role);

  const filtered = useMemo(() => {
    return localMedicines.filter((m) => {
      const matchSearch =
        m.brandName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.genericName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.manufacturer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.barcode.includes(searchTerm);

      const matchCategory = selectedCategory === 'ALL' || m.category === selectedCategory;
      const matchRx = filterPrescription === null || m.isPrescriptionRequired === filterPrescription;

      return matchSearch && matchCategory && matchRx;
    });
  }, [localMedicines, searchTerm, selectedCategory, filterPrescription]);

  const handleCreateMedicine = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!brandName.trim() || !genericName.trim() || !strength.trim()) {
      setErrorMsg('Brand name, generic name and strength are mandatory.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');
    try {
      await onAddMedicine({
        brandName: brandName.trim(),
        genericName: genericName.trim(),
        strength: strength.trim(),
        dosageForm,
        manufacturer: manufacturer.trim(),
        category,
        barcode: barcode.trim() || `8941${Math.floor(100000000 + Math.random() * 900000000)}`,
        unit: unit.trim() || 'Unit',
        darNumber: darNumber.trim() || '000-0000-000',
        isPrescriptionRequired: isRx,
        requiresColdChain: isColdChain,
        onlineEligible: isOnlineEligible,
        description: description.trim(),
        active: true,
      });

      setShowAddModal(false);
      // Reset form
      setBrandName('');
      setGenericName('');
      setStrength('');
      setDescription('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save medicine');
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
            Medicine Catalogue & DGDA Registration
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Registered pharmaceuticals in Bangladesh · Prescription classification & Online Dispensing Rules
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowIntegrationCenter(true)}
            className="flex items-center gap-1.5 rounded-lg border border-[#079B8C]/30 bg-[#DDF6EF] px-3.5 py-2 text-xs font-bold text-[#079B8C] hover:bg-[#c9f1e6] transition-colors shadow-2xs whitespace-nowrap"
            title="Search DGDA reference registry and authorized manufacturer feeds"
          >
            <Database className="h-4 w-4" />
            <span>Data Integration Center</span>
          </button>
          {canAdd && (
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 rounded-lg bg-[#079B8C] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#067d71] transition-colors shadow-2xs whitespace-nowrap"
            >
              <Plus className="h-4 w-4" />
              <span>Register New Medicine</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by brand name, generic name, manufacturer, or barcode..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-slate-200 pl-9 pr-3 py-1.5 text-xs outline-none focus:border-[#168C8C] focus:ring-1 focus:ring-[#168C8C]"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          {/* Category Dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as any)}
            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 outline-none focus:border-[#168C8C]"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat === 'ALL' ? 'All Therapeutic Classes' : cat}
              </option>
            ))}
          </select>

          {/* Prescription toggle */}
          <div className="flex items-center rounded-lg border border-slate-200 p-0.5 bg-slate-50 text-xs">
            <button
              onClick={() => setFilterPrescription(null)}
              className={`px-2 py-1 rounded-md text-[11px] font-medium transition-colors ${
                filterPrescription === null ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterPrescription(false)}
              className={`px-2 py-1 rounded-md text-[11px] font-medium transition-colors ${
                filterPrescription === false ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
              }`}
            >
              OTC
            </button>
            <button
              onClick={() => setFilterPrescription(true)}
              className={`px-2 py-1 rounded-md text-[11px] font-medium transition-colors ${
                filterPrescription === true ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
              }`}
            >
              Rx Only
            </button>
          </div>
        </div>
      </div>

      {/* Medicines Table */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
              <tr>
                <th className="px-4 py-3 font-semibold">Photo</th>
                <th className="px-5 py-3 font-semibold">Brand & Strength</th>
                <th className="px-5 py-3 font-semibold">Generic Name</th>
                <th className="px-5 py-3 font-semibold">Dosage & Unit</th>
                <th className="px-5 py-3 font-semibold">Manufacturer</th>
                <th className="px-5 py-3 font-semibold">Regulatory / Rx</th>
                <th className="px-5 py-3 font-semibold">Online Sale</th>
                <th className="px-5 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No medicines match the selected filter criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((med) => (
                  <tr key={med.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3">
                      <div
                        onClick={() => setInspectingPhotoMed(med)}
                        className="relative w-11 h-11 rounded-lg overflow-hidden border border-slate-200 bg-[#F3F6FA] shrink-0 cursor-pointer hover:border-[#168C8C] transition-all group shadow-2xs"
                        title="Click to view/verify packaging photo"
                      >
                        <img
                          src={med.imageUrl || '/assets/medicine-placeholder.svg'}
                          alt={med.brandName}
                          className="w-full h-full object-contain p-0.5"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/assets/medicine-placeholder.svg';
                          }}
                        />
                        {med.imageVerified ? (
                          <span
                            className="absolute bottom-0 right-0 bg-[#16803C] text-white p-0.5 rounded-tl-sm shadow-xs"
                            title="Clinically Audited & DGDA Verified"
                          >
                            <ShieldCheck className="w-3 h-3" />
                          </span>
                        ) : (
                          <span
                            className="absolute bottom-0 right-0 bg-slate-300 group-hover:bg-[#168C8C] text-white p-0.5 rounded-tl-sm transition-colors"
                            title="Click to upload packaging photo"
                          >
                            <Camera className="w-2.5 h-2.5" />
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3 font-medium text-slate-900">
                      <div className="font-bold text-slate-900">{med.brandName}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{med.strength}</div>
                    </td>
                    <td className="px-5 py-3 text-slate-700">
                      <div>{med.genericName}</div>
                      <div className="text-[10px] text-slate-400">{med.category}</div>
                    </td>
                    <td className="px-5 py-3 text-slate-600">
                      <div>{med.dosageForm}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{med.unit}</div>
                    </td>
                    <td className="px-5 py-3 text-slate-700">
                      <div className="truncate max-w-[140px]">{med.manufacturer}</div>
                      <div className="text-[10px] text-slate-400 font-mono">DAR: {med.darNumber}</div>
                    </td>
                    <td className="px-5 py-3">
                      <div className="space-y-0.5">
                        {med.isPrescriptionRequired ? (
                          <div className="text-[#B7791F] font-semibold text-[11px] flex items-center gap-1">
                            <ShieldAlert className="h-3 w-3" />
                            <span>Prescription Required (Rx)</span>
                          </div>
                        ) : (
                          <div className="text-[#16803C] font-medium text-[11px]">
                            Over-the-Counter (OTC)
                          </div>
                        )}
                        {med.requiresColdChain && (
                          <div className="text-[#17365D] text-[10px] flex items-center gap-1 font-mono font-medium">
                            <ThermometerSnowflake className="h-3 w-3 text-[#168C8C]" />
                            <span>Cold Chain (2°C–8°C)</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      {med.onlineEligible ? (
                        <span className="text-[#16803C] text-[11px] font-medium flex items-center gap-1">
                          <Globe2 className="h-3 w-3" /> Home Delivery
                        </span>
                      ) : (
                        <span className="text-slate-500 text-[11px]">
                          In-Store Pickup Only
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-right space-x-2 whitespace-nowrap">
                      <button
                        onClick={() => setInspectingPhotoMed(med)}
                        className="rounded border border-slate-200 px-2 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-100 transition-colors inline-flex items-center gap-1"
                        title="Packaging Photo & Verification"
                      >
                        <Camera className="w-3 h-3 text-[#168C8C]" />
                        <span>Photo</span>
                      </button>
                      <button
                        onClick={() => setSelectedMedicine(med)}
                        className="rounded border border-slate-200 px-2.5 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-100 transition-colors"
                      >
                        View Info
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Medicine Info Modal */}
      {selectedMedicine && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">{selectedMedicine.brandName}</h3>
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  {selectedMedicine.genericName} ({selectedMedicine.strength})
                </p>
              </div>
              <button
                onClick={() => setSelectedMedicine(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-lg bg-slate-50 p-3">
                <span className="text-[11px] text-slate-500">Manufacturer</span>
                <p className="font-semibold text-slate-900 mt-0.5">{selectedMedicine.manufacturer}</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-3">
                <span className="text-[11px] text-slate-500">DGDA DAR Number</span>
                <p className="font-mono font-semibold text-slate-900 mt-0.5">{selectedMedicine.darNumber}</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-3">
                <span className="text-[11px] text-slate-500">Dosage Form & Packaging</span>
                <p className="font-semibold text-slate-900 mt-0.5">
                  {selectedMedicine.dosageForm} · {selectedMedicine.unit}
                </p>
              </div>
              <div className="rounded-lg bg-slate-50 p-3">
                <span className="text-[11px] text-slate-500">Barcode / SKU</span>
                <p className="font-mono font-semibold text-slate-900 mt-0.5">{selectedMedicine.barcode}</p>
              </div>
            </div>

            <div className="rounded-lg bg-slate-50 p-3 text-xs space-y-1">
              <span className="font-semibold text-slate-800">Clinical & Storage Indications</span>
              <p className="text-slate-600">{selectedMedicine.description || 'Standard therapeutic drug instructions apply.'}</p>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedMedicine(null)}
                className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add New Medicine Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-xl bg-white p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Register New Medicine</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Add product into Bangladesh pharmaceutical directory with DGDA compliance
                </p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateMedicine} className="mt-4 space-y-4 text-xs">
              {errorMsg && (
                <div className="rounded bg-rose-50 p-2.5 text-rose-700 font-medium">
                  {errorMsg}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700">Brand Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Napa One"
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                    className="mt-1 w-full rounded border border-slate-300 px-3 py-1.5 outline-none focus:border-emerald-600"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Strength *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 1000 mg"
                    value={strength}
                    onChange={(e) => setStrength(e.target.value)}
                    className="mt-1 w-full rounded border border-slate-300 px-3 py-1.5 outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700">Generic Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Paracetamol"
                    value={genericName}
                    onChange={(e) => setGenericName(e.target.value)}
                    className="mt-1 w-full rounded border border-slate-300 px-3 py-1.5 outline-none focus:border-emerald-600"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Dosage Form</label>
                  <select
                    value={dosageForm}
                    onChange={(e) => setDosageForm(e.target.value as DosageForm)}
                    className="mt-1 w-full rounded border border-slate-300 px-3 py-1.5 outline-none focus:border-emerald-600 bg-white"
                  >
                    {DOSAGE_FORMS.map((form) => (
                      <option key={form} value={form}>{form}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700">Manufacturer</label>
                  <input
                    type="text"
                    value={manufacturer}
                    onChange={(e) => setManufacturer(e.target.value)}
                    className="mt-1 w-full rounded border border-slate-300 px-3 py-1.5 outline-none focus:border-emerald-600"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Therapeutic Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as MedicineCategory)}
                    className="mt-1 w-full rounded border border-slate-300 px-3 py-1.5 outline-none focus:border-emerald-600 bg-white"
                  >
                    {CATEGORIES.filter((c) => c !== 'ALL').map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-700">Packaging Unit</label>
                  <input
                    type="text"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="mt-1 w-full rounded border border-slate-300 px-3 py-1.5 outline-none focus:border-emerald-600"
                    placeholder="Strip of 10"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700">DGDA DAR No.</label>
                  <input
                    type="text"
                    value={darNumber}
                    onChange={(e) => setDarNumber(e.target.value)}
                    className="mt-1 w-full rounded border border-slate-300 px-3 py-1.5 outline-none focus:border-emerald-600 font-mono"
                    placeholder="016-0294-019"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Barcode / EAN</label>
                  <input
                    type="text"
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                    className="mt-1 w-full rounded border border-slate-300 px-3 py-1.5 outline-none focus:border-emerald-600 font-mono"
                    placeholder="Optional (Auto)"
                  />
                </div>
              </div>

              {/* Checkbox controls */}
              <div className="space-y-2 border-t border-slate-100 pt-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isRx}
                    onChange={(e) => setIsRx(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                  />
                  <span className="font-medium text-slate-800">Prescription Required (Schedule Drug)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isColdChain}
                    onChange={(e) => setIsColdChain(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                  />
                  <span className="font-medium text-slate-800">Requires Cold Chain Storage (2°C - 8°C Refrigerator)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isOnlineEligible}
                    onChange={(e) => setIsOnlineEligible(e.target.checked)}
                    className="rounded text-[#168C8C] focus:ring-[#168C8C] h-4 w-4"
                  />
                  <span className="font-medium text-slate-800">Eligible for Online Customer Storefront Ordering</span>
                </label>
              </div>

              <div>
                <label className="font-semibold text-slate-700">Clinical Description & Indications</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Primary therapeutic usage, dosing precautions..."
                  className="mt-1 w-full rounded border border-slate-300 px-3 py-1.5 outline-none focus:border-[#168C8C]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
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
                  {isSubmitting ? 'Registering...' : 'Save Medicine'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Medicine Packaging Photo Inspection & DGDA Certification Modal */}
      {inspectingPhotoMed && (
        <MedicineImageModal
          medicine={inspectingPhotoMed}
          onClose={() => setInspectingPhotoMed(null)}
          onSuccess={(updated) => {
            setLocalMedicines((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
            setInspectingPhotoMed(null);
          }}
          canVerify={canVerifyPhoto}
        />
      )}

      {/* Medicine Data Integration Center Modal */}
      <MedicineDataIntegrationCenterModal
        isOpen={showIntegrationCenter}
        onClose={() => setShowIntegrationCenter(false)}
        onMedicineImported={(imported) => {
          setLocalMedicines((prev) => {
            const exists = prev.some((m) => m.id === imported.id);
            if (exists) {
              return prev.map((m) => (m.id === imported.id ? imported : m));
            }
            return [imported, ...prev];
          });
        }}
      />
    </div>
  );
};
