import React, { useState, useEffect } from 'react';
import {
  BANGLADESH_DIVISIONS,
  BANGLADESH_DISTRICTS,
  BANGLADESH_THANAS,
  INITIAL_SAVED_ADDRESSES,
} from '../data/bangladeshAddresses';
import { SavedDeliveryAddress, BangladeshDivision, BangladeshDistrict, BangladeshThana } from '../types/pharmacy';
import { formatBDT } from '../utils/formatters';
import {
  MapPin,
  Check,
  Plus,
  Home,
  Briefcase,
  Trash2,
  AlertCircle,
  Truck,
  Sparkles,
  ChevronDown,
} from 'lucide-react';

interface BangladeshAddressSelectorProps {
  selectedAddressId?: string;
  onAddressSelect: (address: SavedDeliveryAddress, deliveryFee: number) => void;
  savedAddresses?: SavedDeliveryAddress[];
  onAddNewAddress?: (address: SavedDeliveryAddress) => void;
}

export const BangladeshAddressSelector: React.FC<BangladeshAddressSelectorProps> = ({
  selectedAddressId,
  onAddressSelect,
  savedAddresses = INITIAL_SAVED_ADDRESSES,
  onAddNewAddress,
}) => {
  const [addresses, setAddresses] = useState<SavedDeliveryAddress[]>(savedAddresses);
  const [selectedId, setSelectedId] = useState<string>(
    selectedAddressId || savedAddresses.find((a) => a.isDefault)?.id || savedAddresses[0]?.id || ''
  );

  const [isAddingNew, setIsAddingNew] = useState(false);
  const [label, setLabel] = useState<'Home' | 'Work' | 'Other'>('Home');
  const [recipientName, setRecipientName] = useState('Khandakar Rafiqul Hasan');
  const [recipientPhone, setRecipientPhone] = useState('+880 1711-889900');
  const [selectedDivisionId, setSelectedDivisionId] = useState('div-dhaka');
  const [selectedDistrictId, setSelectedDistrictId] = useState('dist-dhaka');
  const [selectedThanaId, setSelectedThanaId] = useState('thana-dhanmondi');
  const [addressLine, setAddressLine] = useState('');
  const [deliveryInstructions, setDeliveryInstructions] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Filtered lists
  const availableDistricts = BANGLADESH_DISTRICTS.filter((d) => d.divisionId === selectedDivisionId);
  const availableThanas = BANGLADESH_THANAS.filter((t) => t.districtId === selectedDistrictId);
  const currentThana = BANGLADESH_THANAS.find((t) => t.id === selectedThanaId);

  // Sync district when division changes
  useEffect(() => {
    const firstDistrict = availableDistricts[0];
    if (firstDistrict && !availableDistricts.some((d) => d.id === selectedDistrictId)) {
      setSelectedDistrictId(firstDistrict.id);
    }
  }, [selectedDivisionId, availableDistricts, selectedDistrictId]);

  // Sync thana when district changes
  useEffect(() => {
    const firstThana = availableThanas[0];
    if (firstThana && !availableThanas.some((t) => t.id === selectedThanaId)) {
      setSelectedThanaId(firstThana.id);
    }
  }, [selectedDistrictId, availableThanas, selectedThanaId]);

  // Notify parent of current selection
  useEffect(() => {
    const addr = addresses.find((a) => a.id === selectedId);
    if (addr) {
      const thanaObj = BANGLADESH_THANAS.find((t) => t.id === addr.thanaId);
      const fee = thanaObj?.standardDeliveryFeeBDT || 60;
      onAddressSelect(addr, fee);
    }
  }, [selectedId, addresses]);

  const handleCreateAddress = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!recipientName.trim() || !recipientPhone.trim() || !addressLine.trim()) {
      setErrorMessage('Please fill in recipient name, phone, and complete house/road address.');
      return;
    }

    const divisionObj = BANGLADESH_DIVISIONS.find((d) => d.id === selectedDivisionId);
    const districtObj = BANGLADESH_DISTRICTS.find((d) => d.id === selectedDistrictId);
    const thanaObj = BANGLADESH_THANAS.find((t) => t.id === selectedThanaId);

    const newAddress: SavedDeliveryAddress = {
      id: `addr-${Date.now()}`,
      userId: 'usr-cust-01',
      label,
      recipientName: recipientName.trim(),
      recipientPhone: recipientPhone.trim(),
      divisionId: selectedDivisionId,
      divisionName: divisionObj ? `${divisionObj.nameEn} (${divisionObj.nameBn})` : 'Dhaka (ঢাকা)',
      districtId: selectedDistrictId,
      districtName: districtObj ? `${districtObj.nameEn} (${districtObj.nameBn})` : 'Dhaka (ঢাকা)',
      thanaId: selectedThanaId,
      thanaName: thanaObj ? `${thanaObj.nameEn} (${thanaObj.nameBn})` : 'Dhanmondi (ধানমন্ডি)',
      postalCode: thanaObj?.postalCode || '1209',
      addressLine: addressLine.trim(),
      isDefault,
      deliveryInstructions: deliveryInstructions.trim() || undefined,
    };

    let updatedList = isDefault ? addresses.map((a) => ({ ...a, isDefault: false })) : [...addresses];
    updatedList = [newAddress, ...updatedList];

    setAddresses(updatedList);
    setSelectedId(newAddress.id);
    setIsAddingNew(false);
    onAddNewAddress?.(newAddress);
  };

  return (
    <div className="space-y-4 font-sans text-xs text-slate-800">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold uppercase tracking-wider text-[#123B5D] flex items-center gap-1.5">
          <MapPin className="h-4 w-4 text-[#079B8C]" />
          <span>Delivery Address (Bangladesh)</span>
        </label>
        {!isAddingNew && (
          <button
            type="button"
            onClick={() => setIsAddingNew(true)}
            className="flex items-center gap-1 text-xs font-bold text-[#079B8C] hover:text-[#067d71] transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add New Address</span>
          </button>
        )}
      </div>

      {/* List of Saved Addresses */}
      {!isAddingNew ? (
        <div className="space-y-2.5">
          {addresses.map((addr) => {
            const isSelected = addr.id === selectedId;
            const thanaObj = BANGLADESH_THANAS.find((t) => t.id === addr.thanaId);
            const deliveryFee = thanaObj?.standardDeliveryFeeBDT || 60;

            return (
              <div
                key={addr.id}
                onClick={() => setSelectedId(addr.id)}
                className={`relative rounded-xl border p-3.5 transition-all cursor-pointer ${
                  isSelected
                    ? 'border-[#079B8C] bg-[#DDF6EF]/30 shadow-xs'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`flex h-6 w-6 items-center justify-center rounded-md ${
                        addr.label === 'Home'
                          ? 'bg-blue-100 text-[#123B5D]'
                          : 'bg-emerald-100 text-[#168653]'
                      }`}
                    >
                      {addr.label === 'Home' ? <Home className="h-3.5 w-3.5" /> : <Briefcase className="h-3.5 w-3.5" />}
                    </span>
                    <span className="font-bold text-[#123B5D]">{addr.label}</span>
                    {addr.isDefault && (
                      <span className="rounded bg-slate-100 px-1.5 py-0.2 text-[9px] font-bold text-slate-600 font-mono">
                        DEFAULT
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 text-right font-mono text-[11px]">
                    <Truck className="h-3.5 w-3.5 text-[#079B8C]" />
                    <span className="font-semibold text-slate-700">Fee: {formatBDT(deliveryFee)}</span>
                  </div>
                </div>

                <div className="mt-2 text-slate-700 leading-relaxed font-sans">
                  <div className="font-semibold text-slate-900">
                    {addr.recipientName} · <span className="font-mono text-slate-600">{addr.recipientPhone}</span>
                  </div>
                  <div className="text-slate-600 mt-0.5">{addr.addressLine}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {addr.thanaName}, {addr.districtName} - {addr.postalCode}
                  </div>
                </div>

                {addr.deliveryInstructions && (
                  <div className="mt-2 text-[10px] text-slate-500 italic bg-white/70 p-1.5 rounded border border-slate-100">
                    Note: {addr.deliveryInstructions}
                  </div>
                )}

                {isSelected && (
                  <div className="absolute right-3.5 top-3.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#079B8C] text-white">
                    <Check className="h-3.5 w-3.5" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* Add New Cascading Address Form */
        <form onSubmit={handleCreateAddress} className="rounded-xl border border-slate-200 bg-white p-4 space-y-3.5 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="font-bold text-[#123B5D]">New Delivery Address (Bangladesh)</span>
            <button
              type="button"
              onClick={() => setIsAddingNew(false)}
              className="text-xs text-slate-400 hover:text-slate-600"
            >
              Cancel
            </button>
          </div>

          {errorMessage && (
            <div className="rounded-lg bg-rose-50 p-2.5 text-xs text-[#D64545] border border-rose-200 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Label selector */}
          <div className="flex gap-2">
            {(['Home', 'Work', 'Other'] as const).map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setLabel(l)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold border transition-all ${
                  label === l
                    ? 'border-[#079B8C] bg-[#DDF6EF] text-[#079B8C]'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {l}
              </button>
            ))}
          </div>

          {/* Recipient Contact */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Recipient Name</label>
              <input
                type="text"
                required
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="Full Name"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-800 focus:border-[#079B8C] focus:outline-hidden"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Phone Number (BD)</label>
              <input
                type="text"
                required
                value={recipientPhone}
                onChange={(e) => setRecipientPhone(e.target.value)}
                placeholder="+880 17XX-XXXXXX"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs font-mono text-slate-800 focus:border-[#079B8C] focus:outline-hidden"
              />
            </div>
          </div>

          {/* Cascading Hierarchy: Division -> District -> Thana/Upazila */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* 1. Division */}
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Division (বিভাগ)</label>
              <select
                value={selectedDivisionId}
                onChange={(e) => setSelectedDivisionId(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs font-medium text-slate-800 focus:border-[#079B8C] focus:outline-hidden"
              >
                {BANGLADESH_DIVISIONS.map((div) => (
                  <option key={div.id} value={div.id}>
                    {div.nameEn} ({div.nameBn})
                  </option>
                ))}
              </select>
            </div>

            {/* 2. District */}
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">District (জেলা)</label>
              <select
                value={selectedDistrictId}
                onChange={(e) => setSelectedDistrictId(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs font-medium text-slate-800 focus:border-[#079B8C] focus:outline-hidden"
              >
                {availableDistricts.map((dist) => (
                  <option key={dist.id} value={dist.id}>
                    {dist.nameEn} ({dist.nameBn})
                  </option>
                ))}
              </select>
            </div>

            {/* 3. Thana / Upazila */}
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Thana / Upazila (থানা)</label>
              <select
                value={selectedThanaId}
                onChange={(e) => setSelectedThanaId(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs font-medium text-slate-800 focus:border-[#079B8C] focus:outline-hidden"
              >
                {availableThanas.map((thana) => (
                  <option key={thana.id} value={thana.id}>
                    {thana.nameEn} ({thana.nameBn}) - {thana.postalCode}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Delivery Fee & Coverage Indicator */}
          {currentThana && (
            <div className="flex items-center justify-between rounded-lg bg-[#DDF6EF]/40 px-3 py-2 text-[11px] text-[#079B8C] border border-[#079B8C]/20">
              <div className="flex items-center gap-1.5">
                <Truck className="h-4 w-4" />
                <span>
                  {currentThana.deliveryCoverage === 'FULL_COVERAGE'
                    ? 'Same-Day Express Delivery Available'
                    : currentThana.deliveryCoverage === 'SUBURB_COVERAGE'
                    ? 'Suburb Courier Delivery (12-24h)'
                    : 'Nationwide Registered Courier (24-48h)'}
                </span>
              </div>
              <span className="font-bold font-mono">Standard Fee: {formatBDT(currentThana.standardDeliveryFeeBDT)}</span>
            </div>
          )}

          {/* Detailed Road/House Address */}
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
              House, Road, Flat & Landmark
            </label>
            <input
              type="text"
              required
              value={addressLine}
              onChange={(e) => setAddressLine(e.target.value)}
              placeholder="e.g. House 42, Road 11/A, Apt 5B (Near Star Kabab)"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-800 focus:border-[#079B8C] focus:outline-hidden"
            />
          </div>

          {/* Delivery Instructions */}
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
              Optional Delivery Instructions for Rider
            </label>
            <input
              type="text"
              value={deliveryInstructions}
              onChange={(e) => setDeliveryInstructions(e.target.value)}
              placeholder="e.g. Ring bell twice, leave with reception"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-800 focus:border-[#079B8C] focus:outline-hidden"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="setDefault"
              checked={isDefault}
              onChange={(e) => setIsDefault(e.target.checked)}
              className="rounded border-slate-300 text-[#079B8C] focus:ring-[#079B8C]"
            />
            <label htmlFor="setDefault" className="text-xs text-slate-600">
              Set as my default shipping address
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddingNew(false)}
              className="rounded-lg border border-slate-200 px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-[#079B8C] px-4 py-1.5 text-xs font-bold text-white hover:bg-[#067d71] shadow-2xs"
            >
              Save Address
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
