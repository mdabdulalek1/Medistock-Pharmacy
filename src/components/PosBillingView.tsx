import React, { useState, useMemo } from 'react';
import { Medicine, BatchInventory, Branch, User, SaleInvoice, PaymentMethod } from '../types/pharmacy';
import { formatBDT, formatDate, getExpiryStatus } from '../utils/formatters';
import {
  Search,
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  CreditCard,
  Receipt,
  AlertCircle,
  FileText,
  User as UserIcon,
  Phone,
  Check,
} from 'lucide-react';

interface PosBillingViewProps {
  medicines: Medicine[];
  batches: BatchInventory[];
  activeBranch: Branch;
  currentUser: User;
  onCheckout: (saleData: any) => Promise<{ success: boolean; invoice: SaleInvoice }>;
  onInvoiceCreated: (invoice: SaleInvoice) => void;
}

interface CartEntry {
  medicine: Medicine;
  batch: BatchInventory;
  quantity: number;
  unitPrice: number;
}

export const PosBillingView: React.FC<PosBillingViewProps> = ({
  medicines,
  batches,
  activeBranch,
  currentUser,
  onCheckout,
  onInvoiceCreated,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<CartEntry[]>([]);
  const [customerName, setCustomerName] = useState('Walk-in Customer');
  const [customerPhone, setCustomerPhone] = useState('+880 1');
  const [doctorName, setDoctorName] = useState('');
  const [prescriptionNo, setPrescriptionNo] = useState('');
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [paymentRef, setPaymentRef] = useState('');
  const [tenderedAmount, setTenderedAmount] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  // Filter batches for current active branch
  const branchBatches = useMemo(() => {
    return batches.filter((b) => b.branchId === activeBranch.id && b.currentQuantity > 0);
  }, [batches, activeBranch.id]);

  // Search filter
  const filteredMedicines = useMemo(() => {
    if (!searchTerm.trim()) return [];
    const q = searchTerm.toLowerCase();
    return medicines.filter((m) => {
      const matchText =
        m.brandName.toLowerCase().includes(q) ||
        m.genericName.toLowerCase().includes(q) ||
        m.barcode.includes(q) ||
        m.manufacturer.toLowerCase().includes(q);

      // Check if medicine has any available stock in this branch
      const hasStock = branchBatches.some((b) => b.medicineId === m.id);
      return matchText && hasStock;
    });
  }, [medicines, searchTerm, branchBatches]);

  // Add item to cart with FEFO (First-Expiring-First-Out)
  const addToCart = (med: Medicine) => {
    // Find eligible batches for this medicine, sort by earliest expiry date (FEFO)
    const validBatches = branchBatches
      .filter((b) => b.medicineId === med.id && b.currentQuantity - b.reservedQuantity > 0)
      .sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime());

    if (validBatches.length === 0) {
      alert(`No stock available for ${med.brandName} at ${activeBranch.name}`);
      return;
    }

    const selectedBatch = validBatches[0];

    // Check if already in cart
    const existingIndex = cart.findIndex((item) => item.batch.id === selectedBatch.id);
    if (existingIndex > -1) {
      const currentQty = cart[existingIndex].quantity;
      const maxAvailable = selectedBatch.currentQuantity - selectedBatch.reservedQuantity;
      if (currentQty + 1 > maxAvailable) {
        alert(`Maximum available stock in this batch reached (${maxAvailable} units)`);
        return;
      }
      const updated = [...cart];
      updated[existingIndex].quantity += 1;
      setCart(updated);
    } else {
      setCart([
        ...cart,
        {
          medicine: med,
          batch: selectedBatch,
          quantity: 1,
          unitPrice: selectedBatch.sellingPrice,
        },
      ]);
    }
    setSearchTerm('');
  };

  const updateQuantity = (index: number, newQty: number) => {
    if (newQty <= 0) {
      removeFromCart(index);
      return;
    }
    const item = cart[index];
    const maxAvailable = item.batch.currentQuantity - item.batch.reservedQuantity;
    if (newQty > maxAvailable) {
      alert(`Only ${maxAvailable} units available in Batch ${item.batch.batchNumber}`);
      return;
    }
    const updated = [...cart];
    updated[index].quantity = newQty;
    setCart(updated);
  };

  const removeFromCart = (index: number) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  const subtotal = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0);
  }, [cart]);

  const netPayable = Math.max(0, subtotal - (Number(discountAmount) || 0));
  const changeAmount = Math.max(0, (Number(tenderedAmount) || 0) - netPayable);

  const hasPrescriptionMedication = useMemo(() => {
    return cart.some((c) => c.medicine.isPrescriptionRequired);
  }, [cart]);

  const handleCheckoutSubmit = async () => {
    if (cart.length === 0) {
      setCheckoutError('Please add medicines to cart before checkout.');
      return;
    }

    if (hasPrescriptionMedication && !doctorName && !prescriptionNo) {
      const proceed = confirm(
        'Warning: Cart contains Rx medicines (e.g. Antibiotics/Prescription). Do you want to proceed without doctor/prescription details recorded?'
      );
      if (!proceed) return;
    }

    setIsSubmitting(true);
    setCheckoutError(null);

    try {
      const payload = {
        branchId: activeBranch.id,
        customerName: customerName.trim() || 'Walk-in Customer',
        customerPhone: customerPhone.trim() || 'N/A',
        discountAmount: Number(discountAmount) || 0,
        paymentMethod,
        paymentReference: paymentRef.trim() || undefined,
        tenderedAmount: Number(tenderedAmount) || netPayable,
        prescriptionNumber: prescriptionNo.trim() || undefined,
        doctorName: doctorName.trim() || undefined,
        items: cart.map((c) => ({
          medicineId: c.medicine.id,
          batchId: c.batch.id,
          batchNumber: c.batch.batchNumber,
          quantity: c.quantity,
          unitPrice: c.unitPrice,
        })),
      };

      const result = await onCheckout(payload);
      if (result.success && result.invoice) {
        // Clear cart and show invoice
        setCart([]);
        setTenderedAmount(0);
        setDiscountAmount(0);
        setPaymentRef('');
        setPrescriptionNo('');
        setDoctorName('');
        onInvoiceCreated(result.invoice);
      }
    } catch (err: any) {
      setCheckoutError(err.message || 'Failed to complete checkout');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Left Column: Medicine Catalog Search & Quick Picker (7 cols) */}
      <div className="lg:col-span-7 space-y-4">
        {/* Branch Context Banner */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                POS Terminal · {activeBranch.code}
              </div>
              <h2 className="text-base font-bold text-slate-900">{activeBranch.name}</h2>
            </div>
            <div className="text-right text-xs text-slate-500">
              Cashier: <span className="font-semibold text-slate-800">{currentUser.name}</span>
            </div>
          </div>

          {/* Quick Search Input */}
          <div className="mt-3 relative">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-[#168C8C]" />
            <input
              type="text"
              placeholder="Search medicine by Brand (e.g. Napa, Seclo, Ceevit), Generic, or Barcode..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-slate-300 pl-10 pr-4 py-2 text-xs focus:border-[#168C8C] focus:ring-1 focus:ring-[#168C8C] outline-none"
              autoFocus
            />
          </div>

          {/* Search Dropdown / Live Results */}
          {filteredMedicines.length > 0 && (
            <div className="mt-2 max-h-56 overflow-y-auto divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white shadow-lg">
              {filteredMedicines.map((med) => {
                const stockCount = branchBatches
                  .filter((b) => b.medicineId === med.id)
                  .reduce((acc, b) => acc + (b.currentQuantity - b.reservedQuantity), 0);
                return (
                  <button
                    key={med.id}
                    onClick={() => addToCart(med)}
                    className="flex w-full items-center justify-between p-3 text-left hover:bg-[#F3F6FA] transition-colors gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg border border-slate-200 bg-slate-50 shrink-0 overflow-hidden flex items-center justify-center">
                        <img
                          src={med.imageUrl || '/assets/medicine-placeholder.svg'}
                          alt={med.brandName}
                          className="w-full h-full object-contain p-0.5"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/assets/medicine-placeholder.svg';
                          }}
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-[#17365D] text-xs">{med.brandName}</span>
                          <span className="text-[11px] text-slate-500">({med.strength})</span>
                          {med.isPrescriptionRequired && (
                            <span className="text-[10px] text-[#B7791F] font-semibold bg-[#FEF8ED] px-1 rounded">Rx</span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {med.genericName} · {med.manufacturer}
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-xs font-mono font-semibold text-[#16803C]">
                        {stockCount} in stock
                      </div>
                      <div className="text-[10px] text-slate-400">Click to add (FEFO)</div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick OTC Medicines Shelf for fast 1-click counter dispensing */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
          <div className="text-xs font-bold uppercase tracking-wider text-[#17365D] mb-3 flex items-center justify-between">
            <span>Fast Counter Dispensing (High Demand Bangladeshi OTCs)</span>
            <span className="text-[10px] text-[#168C8C] font-semibold">1-Click Add</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {medicines.slice(0, 6).map((med) => {
              const medBatches = branchBatches.filter((b) => b.medicineId === med.id);
              const totalStock = medBatches.reduce((acc, b) => acc + b.currentQuantity, 0);
              const price = medBatches[0]?.sellingPrice || 30;

              return (
                <button
                  key={med.id}
                  onClick={() => addToCart(med)}
                  disabled={totalStock <= 0}
                  className="rounded-lg border border-slate-200 p-2.5 text-left hover:border-[#168C8C] hover:bg-[#E7F6F6]/40 transition-all disabled:opacity-50 disabled:pointer-events-none group"
                >
                  <div className="font-semibold text-xs text-slate-900 group-hover:text-[#17365D] truncate">
                    {med.brandName}
                  </div>
                  <div className="text-[10px] text-slate-500 truncate">{med.strength}</div>
                  <div className="mt-1 flex items-center justify-between text-[11px]">
                    <span className="font-mono font-bold text-slate-800">{formatBDT(price)}</span>
                    <span className="font-mono text-slate-500">{totalStock} avail</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Regulatory Notice for Prescription Medicines */}
        {hasPrescriptionMedication && (
          <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4 text-xs text-amber-900 space-y-2">
            <div className="flex items-center gap-2 font-semibold">
              <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
              <span>DGDA Bangladesh Prescription Requirement Alert</span>
            </div>
            <p className="text-amber-800">
              One or more items in the current transaction are scheduled prescription pharmaceuticals (e.g. Antibiotics / Systemic Steroids / PPIs). Please record the doctor and prescription reference below.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              <div>
                <label className="text-[11px] font-semibold text-amber-900">Doctor's Name & Degree</label>
                <input
                  type="text"
                  placeholder="e.g. Dr. M. Rahman (FCPS)"
                  value={doctorName}
                  onChange={(e) => setDoctorName(e.target.value)}
                  className="mt-0.5 w-full rounded border border-amber-300 bg-white px-2 py-1 text-xs outline-none focus:border-amber-600"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-amber-900">Prescription Slip / Hospital Reg #</label>
                <input
                  type="text"
                  placeholder="e.g. RX-BSMMU-49210"
                  value={prescriptionNo}
                  onChange={(e) => setPrescriptionNo(e.target.value)}
                  className="mt-0.5 w-full rounded border border-amber-300 bg-white px-2 py-1 text-xs outline-none focus:border-amber-600"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Right Column: Active Cart & Billing Checkout (5 cols) */}
      <div className="lg:col-span-5 rounded-xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
        {/* Header */}
        <div className="border-b border-slate-200 px-5 py-3.5 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-sm text-[#17365D]">
            <ShoppingCart className="h-4 w-4 text-[#168C8C]" />
            <span>Active Billing Cart</span>
          </div>
          <span className="font-mono text-xs text-slate-500 font-semibold">
            {cart.length} item{cart.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Customer Input Strip */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] font-semibold text-slate-600 flex items-center gap-1">
                <UserIcon className="h-3 w-3 text-slate-400" /> Customer
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="mt-1 w-full rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-900 outline-none focus:border-[#168C8C]"
                placeholder="Name"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-600 flex items-center gap-1">
                <Phone className="h-3 w-3 text-slate-400" /> Phone (+880)
              </label>
              <input
                type="text"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="mt-1 w-full rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-mono text-slate-900 outline-none focus:border-[#168C8C]"
                placeholder="+880 1..."
              />
            </div>
          </div>
        </div>

        {/* Cart Items List */}
        <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 p-2">
          {cart.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              <Receipt className="mx-auto h-8 w-8 text-slate-300 mb-2" />
              <span>Cart is empty. Search medicines on the left to begin billing.</span>
            </div>
          ) : (
            cart.map((item, idx) => {
              const expStatus = getExpiryStatus(item.batch.expiryDate);
              return (
                <div key={idx} className="p-2.5 flex items-center justify-between gap-3 text-xs">
                  <div className="w-9 h-9 rounded-md border border-slate-200 bg-slate-50 shrink-0 overflow-hidden flex items-center justify-center">
                    <img
                      src={item.medicine.imageUrl || '/assets/medicine-placeholder.svg'}
                      alt={item.medicine.brandName}
                      className="w-full h-full object-contain p-0.5"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/assets/medicine-placeholder.svg';
                      }}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-slate-900 truncate">
                      {item.medicine.brandName}
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono">
                      Batch: {item.batch.batchNumber} · Exp: {formatDate(item.batch.expiryDate)}
                    </div>
                    {expStatus.isNearExpiry && (
                      <div className="text-[10px] text-amber-600 font-medium">
                        FEFO Priority: {expStatus.label}
                      </div>
                    )}
                  </div>

                  {/* Quantity adjustment */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => updateQuantity(idx, item.quantity - 1)}
                      className="rounded p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-8 text-center font-mono font-semibold text-slate-800">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(idx, item.quantity + 1)}
                      className="rounded p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>

                  {/* Subtotal */}
                  <div className="text-right w-20">
                    <div className="font-mono font-bold text-slate-900">
                      {formatBDT(item.quantity * item.unitPrice)}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      @{item.unitPrice.toFixed(2)}
                    </div>
                  </div>

                  <button
                    onClick={() => removeFromCart(idx)}
                    className="p-1 text-slate-400 hover:text-rose-600"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Calculation & Payment Controls */}
        <div className="border-t border-slate-200 bg-slate-50 p-4 space-y-3 text-xs">
          {/* Subtotal & Discount */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal</span>
              <span className="font-mono font-medium tabular-nums">{formatBDT(subtotal)}</span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-slate-600">Discount (BDT ৳)</span>
              <input
                type="number"
                min="0"
                value={discountAmount || ''}
                onChange={(e) => setDiscountAmount(Number(e.target.value) || 0)}
                placeholder="0.00"
                className="w-24 rounded border border-slate-200 bg-white px-2 py-1 text-right font-mono text-xs outline-none focus:border-[#168C8C]"
              />
            </div>
            <div className="flex justify-between border-t border-slate-200 pt-1.5 text-sm font-bold text-slate-900">
              <span>Net Payable</span>
              <span className="font-mono tabular-nums text-[#17365D] text-base font-extrabold">{formatBDT(netPayable)}</span>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Payment Method
            </label>
            <div className="grid grid-cols-4 gap-1.5 mt-1">
              {(['CASH', 'BKASH', 'NAGAD', 'CARD'] as PaymentMethod[]).map((method) => (
                <button
                  key={method}
                  type="button"
                  onClick={() => setPaymentMethod(method)}
                  className={`rounded-md py-1.5 text-xs font-semibold transition-colors ${
                    paymentMethod === method
                      ? 'bg-[#17365D] text-white shadow-xs'
                      : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {method}
                </button>
              ))}
            </div>
          </div>

          {/* If bKash or Nagad or Card: Show TrxID input */}
          {paymentMethod !== 'CASH' && (
            <div>
              <label className="text-[11px] font-semibold text-slate-600">
                {paymentMethod} Transaction ID / Ref
              </label>
              <input
                type="text"
                placeholder="e.g. 9K28AL9P21"
                value={paymentRef}
                onChange={(e) => setPaymentRef(e.target.value)}
                className="mt-1 w-full rounded border border-slate-200 bg-white px-2.5 py-1 text-xs font-mono outline-none focus:border-[#168C8C]"
              />
            </div>
          )}

          {/* Cash Tendered & Change */}
          {paymentMethod === 'CASH' && (
            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200">
              <div>
                <label className="text-[11px] text-slate-600">Cash Received (৳)</label>
                <input
                  type="number"
                  min="0"
                  value={tenderedAmount || ''}
                  onChange={(e) => setTenderedAmount(Number(e.target.value) || 0)}
                  placeholder={netPayable.toString()}
                  className="mt-1 w-full rounded border border-slate-200 bg-white px-2.5 py-1 font-mono text-xs outline-none focus:border-[#168C8C]"
                />
              </div>
              <div className="text-right">
                <span className="text-[11px] text-slate-500">Change Due</span>
                <div className="mt-1 text-sm font-bold font-mono text-[#16803C]">
                  {formatBDT(changeAmount)}
                </div>
              </div>
            </div>
          )}

          {checkoutError && (
            <div className="rounded bg-[#FDECEC] p-2 text-[11px] text-[#C62828] font-medium border border-[#C62828]/20">
              {checkoutError}
            </div>
          )}

          {/* Checkout Button */}
          <button
            onClick={handleCheckoutSubmit}
            disabled={cart.length === 0 || isSubmitting}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-[#168C8C] py-2.5 text-xs font-bold text-white hover:bg-[#127373] transition-colors shadow-xs disabled:opacity-50 disabled:pointer-events-none"
          >
            {isSubmitting ? (
              <span>Processing Atomic Sale...</span>
            ) : (
              <>
                <Receipt className="h-4 w-4" />
                <span>Complete Billing & Print Invoice ({formatBDT(netPayable)})</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
